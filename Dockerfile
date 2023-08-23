FROM python:3.11-slim

ENV PYTHONUNBUFFERED True

# Copy dependencies
COPY server/requirements.txt /tmp/requirements.txt

RUN apt-get update && apt-get install -y \
    git \
    && pip install -r /tmp/requirements.txt --no-cache-dir \
    && rm /tmp/requirements.txt \
    && apt-get purge -y --auto-remove git \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy the rest of the app
COPY . /app

WORKDIR /app

# Run the production server
EXPOSE 8000
# CMD exec gunicorn --workers 1 --threads 8 --timeout 0 --preload main:app
CMD ["gunicorn", "--config", "server/gunicorn.conf.py"]
