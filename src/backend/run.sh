#!/bin/bash
# Activate venv if exists, then run uvicorn
if [ -d ".venv" ]; then
    source .venv/bin/activate
fi

python -c "from database import init_db; init_db()"
uvicorn main:app --reload --host 0.0.0.0 --port 8080
