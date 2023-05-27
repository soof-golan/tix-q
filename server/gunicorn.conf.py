import os

# Cloud Run sets PORT automatically
port = int(os.environ.get("PORT", 8000))

wsgi_app = "server.main:app"
bind = f'0.0.0.0:{port}'
workers = 1
worker_class = 'uvicorn.workers.UvicornWorker'
