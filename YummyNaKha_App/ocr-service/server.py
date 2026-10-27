"""Local Thai menu OCR for YummyNaKha!

Reads text from a menu photo with PaddleOCR on our own machine, so the photo
never leaves the server (no third-party AI provider, PDPA LR2/LR3). The model
is loaded once at start-up; each request then takes a few seconds on CPU.

Run:  uv run uvicorn server:app --host 127.0.0.1 --port 8765
"""

from __future__ import annotations

import io
import os
import threading
import time
from contextlib import asynccontextmanager

import numpy as np
from fastapi import FastAPI, HTTPException, Request
from PIL import Image, ImageOps, UnidentifiedImageError

DET_MODEL = "PP-OCRv5_mobile_det"
REC_MODEL = "th_PP-OCRv5_mobile_rec"
MAX_BYTES = 10 * 1024 * 1024
# Phone photos are often 4000+ px; text stays readable at this size and OCR is much faster.
MAX_SIDE = 2000
MIN_SCORE = 0.5

_ocr = None
# PaddleOCR pipelines are not thread-safe; one photo at a time.
_lock = threading.Lock()


def _load():
    from paddleocr import PaddleOCR

    return PaddleOCR(
        lang="th",
        text_detection_model_name=DET_MODEL,
        text_recognition_model_name=REC_MODEL,
        text_det_limit_side_len=1280,
        use_doc_orientation_classify=False,
        use_doc_unwarping=False,
        use_textline_orientation=False,
    )


@asynccontextmanager
async def lifespan(_: FastAPI):
    global _ocr
    started = time.perf_counter()
    _ocr = _load()
    print(f"[ocr] models ready in {time.perf_counter() - started:.1f}s ({DET_MODEL} + {REC_MODEL})", flush=True)
    yield


app = FastAPI(title="YummyNaKha! OCR", lifespan=lifespan)


def _decode(data: bytes) -> np.ndarray:
    try:
        image = Image.open(io.BytesIO(data))
        image = ImageOps.exif_transpose(image).convert("RGB")
    except (UnidentifiedImageError, OSError) as error:
        raise HTTPException(415, "Not a readable image.") from error
    image.thumbnail((MAX_SIDE, MAX_SIDE))
    # PaddleOCR expects BGR like OpenCV.
    return np.asarray(image)[:, :, ::-1].copy()


@app.get("/health")
def health():
    return {"ok": _ocr is not None, "detModel": DET_MODEL, "recModel": REC_MODEL}


@app.post("/ocr")
async def ocr(request: Request):
    data = await request.body()
    if not data:
        raise HTTPException(400, "Empty image.")
    if len(data) > MAX_BYTES:
        raise HTTPException(413, "Image too large.")
    image = _decode(data)

    started = time.perf_counter()
    with _lock:
        result = _ocr.predict(image)[0]
    elapsed_ms = round((time.perf_counter() - started) * 1000)

    lines = []
    for text, score, box in zip(result["rec_texts"], result["rec_scores"], result["rec_boxes"]):
        text = text.strip()
        if text and score >= MIN_SCORE:
            x0, y0, x1, y1 = (int(v) for v in box)
            lines.append({"text": text, "score": round(float(score), 3), "box": [x0, y0, x1, y1]})

    return {
        "width": int(image.shape[1]),
        "height": int(image.shape[0]),
        "lines": lines,
        "model": f"paddleocr/{DET_MODEL}+{REC_MODEL}",
        "elapsedMs": elapsed_ms,
    }


if __name__ == "__main__":
    import uvicorn

    uvicorn.run(app, host=os.environ.get("OCR_HOST", "127.0.0.1"), port=int(os.environ.get("OCR_PORT", "8765")))
