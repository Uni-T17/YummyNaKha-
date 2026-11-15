---
title: YummyNaKha OCR
emoji: 🍜
colorFrom: yellow
colorTo: red
sdk: docker
app_port: 8765
pinned: false
---

# YummyNaKha! OCR service

Reads the text on a Thai menu photo with PaddleOCR (Thai model). Used by the
YummyNaKha! app; see `server.py`.

- `POST /ocr` — image bytes in, text lines with positions out.
- `GET /health` — whether the models are loaded.

Keep this Space **private**. The app calls it with a read-only Hugging Face
token (`OCR_SERVICE_TOKEN`); see `DEPLOY-FREE.md` in the app repository.
