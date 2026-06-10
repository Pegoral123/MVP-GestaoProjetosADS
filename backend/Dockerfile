FROM python:3.11-slim


LABEL description="API Django - Gerenciamento de Projetos ADS"
LABEL version="1.0.0"
ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    PIP_NO_CACHE_DIR=1 \
    PIP_DISABLE_PIP_VERSION_CHECK=1

WORKDIR /app

RUN apt-get update && apt-get install -y --no-install-recommends \
    default-libmysqlclient-dev \
    pkg-config \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

COPY requirements.txt .

RUN pip install --upgrade pip && \
    pip install -r requirements.txt


COPY . .


RUN useradd -m -u 1000 appuser && \
    chown -R appuser:appuser /app

USER appuser


EXPOSE 8000
CMD ["python", "manage.py", "runserver", "0.0.0.0:8000"]