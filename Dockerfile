FROM python:3.10-slim

# Copy dependencies
COPY requirements.txt /tmp/requirements.txt

# Install dependencies (pacakges are cached)
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install -r /tmp/requirements.txt

WORKDIR /app

# Copy prisma schema
COPY prisma /app/prisma

# Generate prisma client (this is stored in site-packages directory)
RUN prisma generate

# Copy the rest of the app
COPY . /app

WORKDIR /app

# Validate gunicorn config
RUN gunicorn --check-config

# Run the production server
EXPOSE 8000
CMD ["gunicorn"]
