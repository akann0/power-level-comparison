# Server backend

This folder hosts the FastAPI service that handles Hugging Face analysis so the client never reveals the API key.

## Setup

1. Install dependencies: `pip install -r requirements.txt`.
2. Copy `.env.example` to `.env` and add `HF_API_TOKEN=<your token>`.

## Running locally

```bash
uvicorn server.app:app --host 0.0.0.0 --port 8080
```

The service exposes `POST /compare` and expects JSON `{ "page_a": 123, "page_b": 456 }`.
