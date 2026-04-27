FROM python:3.10-slim

WORKDIR /app

# Устанавливаем системные зависимости для сборки пакетов
RUN apt-get update && apt-get install -y \
    gcc \
    libpq-dev \
    && rm -rf /var/lib/apt/lists/*

# Копируем requirements и устанавливаем питоновские зависимости
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Копируем весь проект
COPY . .

# Собираем статику
RUN python manage.py collectstatic --noinput

# Команда для запуска gunicorn
CMD ["gunicorn", "sevencontinent.wsgi:application", "--bind", "0.0.0.0:8000"]
