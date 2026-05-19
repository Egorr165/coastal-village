FROM python:3.10-slim

WORKDIR /app

RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

ARG SECRET_KEY="temp-build-key-not-for-prod"

ENV SECRET_KEY=${SECRET_KEY}

RUN python manage.py collectstatic --noinput

CMD ["gunicorn", "sevencontinent.wsgi:application", "--bind", "0.0.0.0:8000"]