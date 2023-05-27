FROM python:3.10-slim

ENV PYTHONUNBUFFERED True

# Copy dependencies
COPY server/requirements.txt /tmp/requirements.txt

# Install dependencies (pacakges are cached)
RUN pip install -r /tmp/requirements.txt

WORKDIR /app

# Copy prisma schema
COPY prisma /app/prisma

# Generate prisma client (this is stored in site-packages directory)
# This downloads NodeJS and runs the prisma generator
# TODO: remove NodeJS after prisma generator is run
RUN prisma generate

# Copy the rest of the app
COPY . /app

WORKDIR /app

# Validate gunicorn config
RUN gunicorn --check-config --config server/gunicorn.conf.py

# Run the production server
EXPOSE 8000
# CMD exec gunicorn --workers 1 --threads 8 --timeout 0 --preload main:app
CMD ["gunicorn", "--config", "server/gunicorn.conf.py", "server.main:app", "--workers", "1", "--threads", "8", "--timeout", "0", "--preload"]
