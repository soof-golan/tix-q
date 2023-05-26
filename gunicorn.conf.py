import os

# Cloud Run cpu count lies, so we pass the explicit value in an env var
NUM_WORKERS = int(os.environ.get('NUM_WORKERS', 1))

# Cloud Run sets PORT automatically
port = int(os.environ.get("PORT", 8000))

wsgi_app = "main:app"
bind = f'0.0.0.0:{port}'
workers = NUM_WORKERS
worker_class = 'uvicorn.workers.UvicornWorker'
