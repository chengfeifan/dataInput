#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

PYTHON_BIN="${PYTHON_BIN:-python}"

if ! "$PYTHON_BIN" -c "import django, openpyxl" >/dev/null 2>&1; then
  "$PYTHON_BIN" -m pip install -r requirements.txt
fi

"$PYTHON_BIN" manage.py makemigrations
"$PYTHON_BIN" manage.py migrate
"$PYTHON_BIN" manage.py check

"$PYTHON_BIN" manage.py runserver 0.0.0.0:8000
