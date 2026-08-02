"""Adore luxury lighting ecommerce - backend API regression suite."""
import io
import os
import uuid

import pytest
import requests
from dotenv import dotenv_values

frontend_env = dotenv_values("/app/frontend/.env")
base_url = os.environ.get("REACT_APP_BACKEND_URL") or frontend_env.get("REACT_APP_BACKEND_URL")
if not base_url:
    raise RuntimeError("REACT_APP_BACKEND_URL missing")
BASE_URL = base_url.rstrip("/")
API = f"{BASE_URL}/api"

ADMIN_EMAIL = "admin@adore.com"
ADMIN_PASSWORD = "Admin@Adore2026"


@pytest.fixture(scope="session")
def client():
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="session")
def admin_token(client):
    r = client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": ADMIN_PASSWORD})
    if r.status_code != 200:
        pytest.fail(f"Admin login failed {r.status_code}: {r.text[:300]}")
    data = r.json()
    assert data["user"]["role"] == "admin"
    return data["token"]


@pytest.fixture(scope="session")
def admin_headers(admin_token):
    return {"Authorization": f"Bearer {admin_token}", "Content-Type": "application/json"}


# ---------- Health / config ----------
class TestHealth:
    def test_root(self, client):
        r = client.get(f"{API}/")
        assert r.status_code == 200
        assert r.json()["message"] == "Adore API"

    def test_razorpay_config_disabled(self, client):
        r = client.get(f"{API}/razorpay/config")
        assert r.status_code == 200
        assert r.json()["enabled"] is False


# ---------- Products ----------
class TestProducts:
    def test_list_products_seeded(self, client):
        r = client.get(f"{API}/products")
        assert r.status_code == 200
        products = r.json()
        assert isinstance(products, list)
        assert len(products) >= 12, f"expected >=12 seeded products, got {len(products)}"
        for p in products:
            assert "_id" not in p
            assert isinstance(p["price"], int)
        cats = {p["category"] for p in products}
        for c in ["chandeliers", "pendants", "wall", "table", "floor", "ceiling", "outdoor", "architectural"]:
            assert c in cats, f"category {c} missing from seed"

    def test_get_product_by_slug(self, client):
        r = client.get(f"{API}/products/solene-cascade-chandelier")
        assert r.status_code == 200
        p = r.json()
        assert p["name"] == "Solene Cascade Chandelier"
        assert p["category"] == "chandeliers"
        assert len(p["images"]) >= 1

    def test_get_product_404(self, client):
        r = client.get(f"{API}/products/does-not-exist-xyz")
        assert r.status_code == 404

    def test_filter_by_category(self, client):
        r = client.get(f"{API}/products", params={"category": "chandeliers"})
        assert r.status_code == 200
        assert len(r.json()) >= 2
        assert all(p["category"] == "chandeliers" for p in r.json())

    def test_search_keyword(self, client):
        r = client.get(f"{API}/products", params={"search": "chandelier"})
        assert r.status_code == 200
        assert len(r.json()) >= 2

    def test_price_range_filter(self, client):
        r = client.get(f"{API}/products", params={"min_price": 20000, "max_price": 50000})
        assert r.status_code == 200
        assert all(20000 <= p["price"] <= 50000 for p in r.json())

    def test_new_arrival_filter(self, client):
        r = client.get(f"{API}/products", params={"new_arrival": "true"})
        assert r.status_code == 200
        assert all(p["new_arrival"] is True for p in r.json())


# ---------- Auth ----------
class TestAuth:
    def test_register_login_me(self, client):
        email = f"TEST_{uuid.uuid4().hex[:8]}@example.com"
        r = client.post(f"{API}/auth/register", json={"email": email, "name": "TEST User", "password": "Passw0rd!"})
        assert r.status_code == 200, r.text[:300]
        data = r.json()
        assert data["user"]["email"] == email
        assert data["user"]["role"] == "user"
        assert isinstance(data["token"], str) and len(data["token"]) > 10
        assert "password" not in data["user"]

        # duplicate
        r2 = client.post(f"{API}/auth/register", json={"email": email, "name": "x", "password": "y"})
        assert r2.status_code == 400

        # login
        r3 = client.post(f"{API}/auth/login", json={"email": email, "password": "Passw0rd!"})
        assert r3.status_code == 200
        token = r3.json()["token"]
        assert "password" not in r3.json()["user"]
        assert "_id" not in r3.json()["user"]

        # me
        r4 = client.get(f"{API}/auth/me", headers={"Authorization": f"Bearer {token}"})
        assert r4.status_code == 200
        assert r4.json()["email"] == email

    def test_login_wrong_password(self, client):
        r = client.post(f"{API}/auth/login", json={"email": ADMIN_EMAIL, "password": "wrongpass"})
        assert r.status_code == 401

    def test_me_no_token(self, client):
        r = client.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_me_bad_token(self, client):
        r = client.get(f"{API}/auth/me", headers={"Authorization": "Bearer garbage.token.x"})
        assert r.status_code == 401

    def test_register_invalid_email(self, client):
        r = client.post(f"{API}/auth/register", json={"email": "notanemail", "name": "a", "password": "b"})
        assert r.status_code == 422


# ---------- Admin product CRUD ----------
class TestAdminProductCRUD:
    created = []

    def test_create_requires_admin(self, client):
        r = client.post(f"{API}/products", json={"name": "x", "slug": "x", "category": "wall", "price": 1})
        assert r.status_code == 401

    def test_create_forbidden_for_normal_user(self, client):
        email = f"TEST_{uuid.uuid4().hex[:8]}@example.com"
        reg = client.post(f"{API}/auth/register", json={"email": email, "name": "TEST", "password": "Passw0rd!"})
        tok = reg.json()["token"]
        r = client.post(f"{API}/products", json={"name": "x", "slug": "x", "category": "wall", "price": 1},
                        headers={"Authorization": f"Bearer {tok}"})
        assert r.status_code == 403

    def test_crud_flow(self, client, admin_headers):
        slug = f"test-product-{uuid.uuid4().hex[:6]}"
        payload = {
            "name": "TEST_Lamp", "slug": slug, "category": "table", "price": 9999,
            "description": "test", "images": ["https://example.com/a.jpg"], "stock": 5,
        }
        r = client.post(f"{API}/products", json=payload, headers=admin_headers)
        assert r.status_code == 200, r.text[:300]
        p = r.json()
        assert "_id" not in p
        assert p["price"] == 9999
        pid = p["id"]
        TestAdminProductCRUD.created.append(pid)

        # GET verify persistence
        g = client.get(f"{API}/products/{slug}")
        assert g.status_code == 200
        assert g.json()["name"] == "TEST_Lamp"
        assert g.json()["price"] == 9999

        # UPDATE
        u = client.put(f"{API}/products/{pid}", json={"price": 12345}, headers=admin_headers)
        assert u.status_code == 200
        assert u.json()["price"] == 12345
        g2 = client.get(f"{API}/products/{slug}")
        assert g2.json()["price"] == 12345
        assert g2.json()["name"] == "TEST_Lamp"

        # DELETE
        d = client.delete(f"{API}/products/{pid}", headers=admin_headers)
        assert d.status_code == 200
        TestAdminProductCRUD.created.remove(pid)
        g3 = client.get(f"{API}/products/{slug}")
        assert g3.status_code == 404

    def test_update_nonexistent(self, client, admin_headers):
        r = client.put(f"{API}/products/{uuid.uuid4()}", json={"price": 1}, headers=admin_headers)
        assert r.status_code == 404

    def test_delete_nonexistent(self, client, admin_headers):
        r = client.delete(f"{API}/products/{uuid.uuid4()}", headers=admin_headers)
        assert r.status_code == 404

    @classmethod
    def teardown_class(cls):
        pass


# ---------- Upload ----------
class TestUpload:
    def test_upload_requires_admin(self, client):
        r = requests.post(f"{API}/upload", files={"file": ("a.png", io.BytesIO(b"x"), "image/png")})
        assert r.status_code == 401

    def test_upload_png_and_fetch(self, admin_token):
        png = bytes.fromhex(
            "89504e470d0a1a0a0000000d49484452000000010000000108060000001f15c4890000000a49444154789c6300010000050001"
            "0d0a2db40000000049454e44ae426082"
        )
        r = requests.post(f"{API}/upload", files={"file": ("test.png", io.BytesIO(png), "image/png")},
                          headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 200, r.text[:300]
        url = r.json()["url"]
        assert url.startswith("/api/uploads/")
        g = requests.get(f"{BASE_URL}{url}")
        assert g.status_code == 200
        assert len(g.content) > 0

    def test_upload_invalid_type(self, admin_token):
        r = requests.post(f"{API}/upload", files={"file": ("test.txt", io.BytesIO(b"hello"), "text/plain")},
                          headers={"Authorization": f"Bearer {admin_token}"})
        assert r.status_code == 400


# ---------- Wishlist ----------
class TestWishlist:
    def test_wishlist_flow(self, client):
        email = f"TEST_{uuid.uuid4().hex[:8]}@example.com"
        tok = client.post(f"{API}/auth/register",
                          json={"email": email, "name": "TEST", "password": "Passw0rd!"}).json()["token"]
        h = {"Authorization": f"Bearer {tok}"}
        pid = client.get(f"{API}/products").json()[0]["id"]

        assert client.get(f"{API}/wishlist", headers=h).json() == []
        assert client.post(f"{API}/wishlist/{pid}", headers=h).status_code == 200
        wl = client.get(f"{API}/wishlist", headers=h).json()
        assert len(wl) == 1 and wl[0]["id"] == pid
        assert client.delete(f"{API}/wishlist/{pid}", headers=h).status_code == 200
        assert client.get(f"{API}/wishlist", headers=h).json() == []

    def test_wishlist_unauth(self, client):
        assert client.get(f"{API}/wishlist").status_code == 401


# ---------- Orders (COD) ----------
class TestOrders:
    order_number = None

    def test_create_cod_order_and_track(self, client):
        products = client.get(f"{API}/products").json()
        p = products[0]
        payload = {
            "items": [{"product_id": p["id"], "quantity": 2}],
            "customer_name": "TEST Buyer", "email": "TEST_buyer@example.com",
            "phone": "9876543210", "address": "1 Test Lane", "city": "Mumbai",
            "state": "Maharashtra", "pincode": "400001",
            "total": p["price"] * 2, "payment_method": "cod",
        }
        r = client.post(f"{API}/orders", json=payload)
        assert r.status_code == 200, r.text[:300]
        order = r.json()["order"]
        assert order["order_number"].startswith("ADR")
        assert order["status"] == "pending"
        assert order["payment_method"] == "cod"
        assert order["total"] == p["price"] * 2
        assert len(order["items"]) == 1
        assert order["items"][0]["quantity"] == 2
        assert order["items"][0]["name"] == p["name"]
        assert "_id" not in order
        TestOrders.order_number = order["order_number"]

        t = client.get(f"{API}/orders/track/{order['order_number']}")
        assert t.status_code == 200
        assert t.json()["order_number"] == order["order_number"]

    def test_track_case_insensitive(self, client):
        assert TestOrders.order_number, "prior test must run"
        r = client.get(f"{API}/orders/track/{TestOrders.order_number.lower()}")
        assert r.status_code == 200

    def test_track_not_found(self, client):
        r = client.get(f"{API}/orders/track/ADRNOPE99")
        assert r.status_code == 404

    def test_order_invalid_product(self, client):
        payload = {
            "items": [{"product_id": str(uuid.uuid4()), "quantity": 1}],
            "customer_name": "T", "email": "t@example.com", "phone": "9876543210",
            "address": "a", "city": "b", "state": "c", "pincode": "400001",
            "total": 100, "payment_method": "cod",
        }
        r = client.post(f"{API}/orders", json=payload)
        assert r.status_code == 400

    def test_razorpay_order_without_keys(self, client):
        """Razorpay not configured - documents actual behaviour."""
        p = client.get(f"{API}/products").json()[0]
        payload = {
            "items": [{"product_id": p["id"], "quantity": 1}],
            "customer_name": "T", "email": "t@example.com", "phone": "9876543210",
            "address": "a", "city": "b", "state": "c", "pincode": "400001",
            "total": p["price"], "payment_method": "razorpay",
        }
        r = client.post(f"{API}/orders", json=payload)
        assert r.status_code == 200
        assert r.json()["razorpay_key_id"] is None

    def test_verify_payment_disabled(self, client):
        r = client.post(f"{API}/orders/verify-payment", json={
            "razorpay_order_id": "o", "razorpay_payment_id": "p",
            "razorpay_signature": "s", "order_id": "x"})
        assert r.status_code == 400

    def test_list_orders_admin_only(self, client, admin_headers):
        assert client.get(f"{API}/orders").status_code == 401
        r = client.get(f"{API}/orders", headers=admin_headers)
        assert r.status_code == 200
        assert isinstance(r.json(), list)
        assert any(o["order_number"] == TestOrders.order_number for o in r.json())

    def test_my_orders(self, client):
        email = f"TEST_{uuid.uuid4().hex[:8]}@example.com"
        tok = client.post(f"{API}/auth/register",
                          json={"email": email, "name": "TEST", "password": "Passw0rd!"}).json()["token"]
        h = {"Authorization": f"Bearer {tok}"}
        p = client.get(f"{API}/products").json()[0]
        client.post(f"{API}/orders", json={
            "items": [{"product_id": p["id"], "quantity": 1}],
            "customer_name": "T", "email": email, "phone": "9876543210",
            "address": "a", "city": "b", "state": "c", "pincode": "400001",
            "total": p["price"], "payment_method": "cod"}, headers=h)
        r = client.get(f"{API}/orders/mine", headers=h)
        assert r.status_code == 200, r.text[:300]
        assert len(r.json()) == 1


# ---------- Newsletter & Inquiry ----------
class TestNewsletterInquiry:
    def test_newsletter(self, client):
        email = f"TEST_{uuid.uuid4().hex[:8]}@example.com"
        r = client.post(f"{API}/newsletter", json={"email": email})
        assert r.status_code == 200
        assert r.json()["ok"] is True
        # idempotent
        assert client.post(f"{API}/newsletter", json={"email": email}).status_code == 200

    def test_newsletter_invalid(self, client):
        assert client.post(f"{API}/newsletter", json={"email": "bad"}).status_code == 422

    def test_inquiry_types(self, client, admin_headers):
        ids = []
        for t in ["contact", "bespoke", "trade"]:
            r = client.post(f"{API}/inquiry", json={
                "name": "TEST Person", "email": "TEST_inq@example.com",
                "phone": "9876543210", "message": f"TEST {t} message", "inquiry_type": t})
            assert r.status_code == 200, r.text[:300]
            assert r.json()["ok"] is True
            ids.append(r.json()["id"])
        lst = client.get(f"{API}/inquiries", headers=admin_headers)
        assert lst.status_code == 200
        found = {d["id"] for d in lst.json()}
        for i in ids:
            assert i in found

    def test_inquiries_admin_only(self, client):
        assert client.get(f"{API}/inquiries").status_code == 401
