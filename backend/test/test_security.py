from http.cookies import SimpleCookie
from urllib.parse import parse_qs, urlparse


def test_login_creates_and_sends_matching_oauth_state(client):
    response = client.get("/api/auth/login")

    assert response.status_code == 302
    state = parse_qs(urlparse(response.location).query)["state"][0]
    cookie = SimpleCookie()
    cookie.load(response.headers["Set-Cookie"])
    assert cookie["portal_oauth_state"].value == state
    assert cookie["portal_oauth_state"]["secure"]
    assert cookie["portal_oauth_state"]["httponly"]


def test_callback_rejects_missing_or_invalid_oauth_state(client):
    response = client.get("/api/auth/return-to?code=example&state=wrong")
    assert response.status_code == 400


def test_security_and_no_store_headers_are_present(client):
    response = client.get("/api/auth/login")
    assert response.headers["X-Content-Type-Options"] == "nosniff"
    assert response.headers["X-Frame-Options"] == "DENY"
    assert response.headers["Cache-Control"] == "private, no-store, max-age=0"


def test_cors_is_limited_to_configured_origin(client):
    allowed = client.get(
        "/api/auth/login", headers={"Origin": "https://health.ncu.edu.tw"}
    )
    rejected = client.get(
        "/api/auth/login", headers={"Origin": "https://attacker.example"}
    )

    assert allowed.headers["Access-Control-Allow-Origin"] == "https://health.ncu.edu.tw"
    assert "Access-Control-Allow-Origin" not in rejected.headers
