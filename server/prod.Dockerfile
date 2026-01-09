FROM python:3.14.2-slim-bookworm

ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1

RUN apt-get update && apt-get install -y build-essential libpq-dev curl

COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/
ENV PATH="/root/.cargo/bin:$PATH"

WORKDIR /app

COPY pyproject.toml /app/
COPY uv.lock /app/

RUN uv sync --locked

COPY . /app/

EXPOSE 8000

CMD ["gunicorn", "server.wsgi:application", "--bind", "0.0.0.0:8000"]
