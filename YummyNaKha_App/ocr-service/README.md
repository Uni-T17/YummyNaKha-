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

When it is reachable from the internet, start it with `OCR_TOKEN` set; the
app then sends the same value as `OCR_SERVICE_TOKEN`. See `DEPLOY-FREE.md`
and `DEPLOY.md` in the app folder. (The header above is for Hugging Face
Spaces, which now need a paid plan for Docker.)
