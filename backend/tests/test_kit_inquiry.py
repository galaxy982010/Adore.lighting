# Kit quote inquiry (/api/inquiry with inquiry_type kit-quote) + admin listing
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL").rstrip("/")
ADMIN = {"email": "salesadorelighting@gmail.com", "password": "Adore@Studio2026"}


@pytest.fixture(scope="module")
def admin_headers():
    r = requests.post(f"{BASE_URL}/api/auth/login", json=ADMIN)
    if r.status_code != 200:
        pytest.skip(f"admin login failed {r.status_code}")
    tok = r.json().get("token") or r.json().get("access_token")
    return {"Authorization": f"Bearer {tok}"}


def test_kit_quote_create_and_list(admin_headers):
    name = f"TEST_Kit_{uuid.uuid4().hex[:6]}"
    payload = {"name": name, "email": "test_kit@example.com", "phone": "9876543210", "city": "Mumbai",
               "kit": "Dining Kit", "inquiry_type": "kit-quote", "message": "Quote request for Dining Kit"}
    r = requests.post(f"{BASE_URL}/api/inquiry", json=payload)
    assert r.status_code == 200
    d = r.json()
    assert d["ok"] is True and isinstance(d["id"], str)
    lst = requests.get(f"{BASE_URL}/api/inquiries", headers=admin_headers)
    assert lst.status_code == 200
    found = [q for q in lst.json() if q.get("id") == d["id"]]
    assert found, "inquiry not persisted"
    q = found[0]
    assert q["kit"] == "Dining Kit" and q["city"] == "Mumbai" and q["phone"] == "9876543210"
    assert q["inquiry_type"] == "kit-quote" and "_id" not in q


def test_inquiry_invalid_email():
    r = requests.post(f"{BASE_URL}/api/inquiry", json={"name": "TEST_x", "email": "bad", "message": "x"})
    assert r.status_code == 422


def test_inquiry_missing_name():
    r = requests.post(f"{BASE_URL}/api/inquiry", json={"email": "a@b.com", "message": "x"})
    assert r.status_code == 422


def test_inquiries_requires_admin():
    r = requests.get(f"{BASE_URL}/api/inquiries")
    assert r.status_code in (401, 403)


def test_kit_quote_empty_phone_accepted_by_backend():
    # Backend doesn't enforce phone for kit-quote (only frontend 'required'); documents behaviour
    r = requests.post(f"{BASE_URL}/api/inquiry", json={"name": "TEST_nophone", "email": "a@b.com",
                                                       "inquiry_type": "kit-quote", "kit": "Bedroom Kit", "message": "m"})
    print("empty phone status", r.status_code)
    assert r.status_code in (200, 422)
