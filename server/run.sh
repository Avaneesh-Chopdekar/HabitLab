docker compose -f docker-compose.dev.yaml up -d
source .venv/bin/activate
python manage.py runserver 0.0.0.0:8000
