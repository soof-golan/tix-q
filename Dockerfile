FROM python:3.10-slim

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

# Copy prisma schema
COPY prisma /app/prisma

# Generate prisma client (this is stored in site-packages directory)
# This downloads NodeJS and runs the prisma generator
# The script removes node binaries after generation is complete
COPY server/scripts/prisma-generate.sh /tmp/prisma-generate.sh
RUN chmod +x /tmp/prisma-generate.sh
RUN /tmp/prisma-generate.sh

# Copy the rest of the app
COPY . /app

WORKDIR /app

# Run the production server
EXPOSE 8000
# CMD exec gunicorn --workers 1 --threads 8 --timeout 0 --preload main:app
CMD ["gunicorn", "--config", "server/gunicorn.conf.py"]
