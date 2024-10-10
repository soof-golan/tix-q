FROM python:3.11-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

ENV PYTHONUNBUFFERED=True \
    UV_SYSTEM_PYTHON=1

# Copy dependencies
COPY server/requirements.txt /tmp/requirements.txt

RUN --mount=type=cache,target=/root/.cache/pip \
    uv pip install -r /tmp/requirements.txt

WORKDIR /app

# Copy the rest of the app
COPY . /app

WORKDIR /app

# Run the production server
EXPOSE 8000
# CMD exec gunicorn --workers 1 --threads 8 --timeout 0 --preload main:app
CMD ["gunicorn", "--config", "server/gunicorn.conf.py"]
