import os
import sys
from pathlib import Path

import pytest


os.environ.setdefault("FLASK_SECRET_KEY", "test-flask-secret")
os.environ.setdefault("JWT_SECRET_KEY", "test-jwt-secret")
os.environ.setdefault("PORTAL_BASIC_AUTH", "test-basic-auth")
os.environ.setdefault("PORTAL_CLIENT_ID", "test-client-id")
os.environ.setdefault("CORS_ORIGINS", "https://health.ncu.edu.tw")
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from app import app  # noqa: E402


@pytest.fixture()
def client():
    app.config.update(TESTING=True)
    return app.test_client()
