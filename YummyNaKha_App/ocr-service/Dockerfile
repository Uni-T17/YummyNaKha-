# Our own Thai menu OCR (PaddleOCR). Used two ways:
#  - docker-compose.yml (one server): reachable only by the app, no public port.
#  - A private Hugging Face Space: callers need a Hugging Face token.
FROM python:3.12-slim
RUN apt-get update \
  && apt-get install -y --no-install-recommends libgomp1 libgl1 libglib2.0-0 \
  && rm -rf /var/lib/apt/lists/*
COPY --from=ghcr.io/astral-sh/uv:0.8 /uv /usr/local/bin/uv
WORKDIR /app
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-dev
COPY server.py ./
ENV PATH="/app/.venv/bin:$PATH" \
    PADDLE_PDX_CACHE_HOME=/opt/paddlex \
    PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK=True \
    HOME=/tmp
# Download the models while building, so a (re)start doesn't have to.
# Hugging Face runs the container as a non-root user, hence the permissions.
RUN python -c "import server; server._load()" && chmod -R a+rwX /opt/paddlex
EXPOSE 8765
CMD ["uvicorn", "server:app", "--host", "0.0.0.0", "--port", "8765"]
