from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Header
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import re
import logging
import uuid
import jwt as pyjwt
import bcrypt
import razorpay
import hmac
import hashlib
from pathlib import Path
from pydantic import BaseModel, Field, EmailStr
from typing import List, Optional
from datetime import datetime, timezone, timedelta

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

UPLOAD_DIR = ROOT_DIR / "uploads"
UPLOAD_DIR.mkdir(exist_ok=True)

mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

JWT_SECRET = os.environ.get('JWT_SECRET', 'dev_secret')
JWT_ALGO = "HS256"

RZP_KEY_ID = os.environ.get('RAZORPAY_KEY_ID', '')
RZP_KEY_SECRET = os.environ.get('RAZORPAY_KEY_SECRET', '')
rzp_client = razorpay.Client(auth=(RZP_KEY_ID, RZP_KEY_SECRET)) if RZP_KEY_ID and RZP_KEY_SECRET else None

app = FastAPI()
api_router = APIRouter(prefix="/api")


def now_iso():
    return datetime.now(timezone.utc).isoformat()


class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: str = "user"
    created_at: str = Field(default_factory=now_iso)


class UserRegister(BaseModel):
    email: EmailStr
    name: str
    password: str


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Product(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    name: str
    slug: str
    category: str
    subcategory: str = ""  # classic | modern | "" (n/a)
    price: int
    description: str = ""
    finish: str = ""
    style: str = ""
    bulb_type: str = ""
    room: str = ""
    dimensions: str = ""
    material: str = ""
    images: List[str] = []
    stock: int = 10
    featured: bool = False
    new_arrival: bool = False
    created_at: str = Field(default_factory=now_iso)


class ProductCreate(BaseModel):
    name: str
    slug: str
    category: str
    subcategory: str = ""
    price: int
    description: str = ""
    finish: str = ""
    style: str = ""
    bulb_type: str = ""
    room: str = ""
    dimensions: str = ""
    material: str = ""
    images: List[str] = []
    stock: int = 10
    featured: bool = False
    new_arrival: bool = False


class ProductUpdate(BaseModel):
    name: Optional[str] = None
    slug: Optional[str] = None
    category: Optional[str] = None
    subcategory: Optional[str] = None
    price: Optional[int] = None
    description: Optional[str] = None
    finish: Optional[str] = None
    style: Optional[str] = None
    bulb_type: Optional[str] = None
    room: Optional[str] = None
    dimensions: Optional[str] = None
    material: Optional[str] = None
    images: Optional[List[str]] = None
    stock: Optional[int] = None
    featured: Optional[bool] = None
    new_arrival: Optional[bool] = None


class CartItem(BaseModel):
    product_id: str
    quantity: int = 1


class OrderCreate(BaseModel):
    items: List[CartItem]
    customer_name: str
    email: EmailStr
    phone: str
    address: str
    city: str
    state: str
    pincode: str
    subtotal: int = 0
    shipping: int = 0
    total: int = 0
    coupon_code: Optional[str] = None
    payment_method: str = "razorpay"


class Order(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    order_number: str = Field(default_factory=lambda: "ADR" + str(uuid.uuid4())[:8].upper())
    user_id: Optional[str] = None
    items: List[dict]
    customer_name: str
    email: str
    phone: str
    address: str
    city: str
    state: str
    pincode: str
    subtotal: int = 0
    shipping: int = 0
    discount: int = 0
    coupon_code: Optional[str] = None
    total: int
    status: str = "pending"
    payment_method: str = "razorpay"
    razorpay_order_id: Optional[str] = None
    razorpay_payment_id: Optional[str] = None
    created_at: str = Field(default_factory=now_iso)


class PaymentVerify(BaseModel):
    razorpay_order_id: str
    razorpay_payment_id: str
    razorpay_signature: str
    order_id: str


class NewsletterSignup(BaseModel):
    email: EmailStr


class InquiryForm(BaseModel):
    name: str
    email: EmailStr
    phone: str = ""
    message: str
    inquiry_type: str = "contact"


class Coupon(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    code: str
    percent_off: int = 0  # 0-100
    flat_off: int = 0  # INR
    min_order: int = 0
    active: bool = True
    created_at: str = Field(default_factory=now_iso)


class CouponCreate(BaseModel):
    code: str
    percent_off: int = 0
    flat_off: int = 0
    min_order: int = 0
    active: bool = True


class CouponApply(BaseModel):
    code: str
    subtotal: int


def hash_password(pw: str) -> str:
    return bcrypt.hashpw(pw.encode(), bcrypt.gensalt()).decode()


def verify_password(pw: str, hashed: str) -> bool:
    return bcrypt.checkpw(pw.encode(), hashed.encode())


def create_token(user_id: str, role: str) -> str:
    payload = {
        "sub": user_id,
        "role": role,
        "exp": datetime.now(timezone.utc) + timedelta(days=30),
    }
    return pyjwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGO)


async def get_current_user(authorization: Optional[str] = Header(None)):
    if not authorization or not authorization.startswith("Bearer "):
        raise HTTPException(401, "Missing auth token")
    token = authorization.split(" ", 1)[1]
    try:
        payload = pyjwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGO])
    except pyjwt.PyJWTError:
        raise HTTPException(401, "Invalid token")
    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password": 0})
    if not user:
        raise HTTPException(401, "User not found")
    return user


async def require_admin(user=Depends(get_current_user)):
    if user.get("role") != "admin":
        raise HTTPException(403, "Admin only")
    return user


def compute_discount(coupon: dict, subtotal: int) -> int:
    if not coupon.get("active"):
        return 0
    if subtotal < coupon.get("min_order", 0):
        return 0
    pct = int(coupon.get("percent_off") or 0)
    flat = int(coupon.get("flat_off") or 0)
    disc = 0
    if pct > 0:
        disc = (subtotal * pct) // 100
    disc = max(disc, flat)
    return min(disc, subtotal)


@api_router.get("/")
async def root():
    return {"message": "Adore API", "razorpay_configured": bool(rzp_client)}


@api_router.get("/razorpay/config")
async def razorpay_config():
    return {"key_id": RZP_KEY_ID, "enabled": bool(rzp_client)}


# ---- Auth ----
@api_router.post("/auth/register")
async def register(data: UserRegister):
    existing = await db.users.find_one({"email": data.email})
    if existing:
        raise HTTPException(400, "Email already registered")
    user = User(email=data.email, name=data.name, role="user")
    doc = user.model_dump()
    doc["password"] = hash_password(data.password)
    await db.users.insert_one(doc)
    token = create_token(user.id, user.role)
    return {"token": token, "user": user.model_dump()}


@api_router.post("/auth/login")
async def login(data: UserLogin):
    doc = await db.users.find_one({"email": data.email})
    if not doc or not verify_password(data.password, doc["password"]):
        raise HTTPException(401, "Invalid credentials")
    token = create_token(doc["id"], doc["role"])
    doc.pop("_id", None)
    doc.pop("password", None)
    return {"token": token, "user": doc}


@api_router.get("/auth/me")
async def me(user=Depends(get_current_user)):
    return user


# ---- Products ----
@api_router.get("/products")
async def list_products(category: Optional[str] = None, subcategory: Optional[str] = None,
                        room: Optional[str] = None,
                        featured: Optional[bool] = None, new_arrival: Optional[bool] = None,
                        search: Optional[str] = None, min_price: Optional[int] = None,
                        max_price: Optional[int] = None, finish: Optional[str] = None,
                        style: Optional[str] = None, bulb_type: Optional[str] = None):
    q = {}
    if category: q["category"] = {"$regex": f"^{re.escape(category)}$", "$options": "i"}
    if subcategory: q["subcategory"] = {"$regex": f"^{re.escape(subcategory)}$", "$options": "i"}
    if room: q["room"] = {"$regex": f"^{re.escape(room)}$", "$options": "i"}
    if featured is not None: q["featured"] = featured
    if new_arrival is not None: q["new_arrival"] = new_arrival
    if finish: q["finish"] = finish
    if style: q["style"] = style
    if bulb_type: q["bulb_type"] = bulb_type
    if min_price is not None or max_price is not None:
        q["price"] = {}
        if min_price is not None: q["price"]["$gte"] = min_price
        if max_price is not None: q["price"]["$lte"] = max_price
    if search:
        s = re.escape(search)[:80]
        q["$or"] = [
            {"name": {"$regex": s, "$options": "i"}},
            {"description": {"$regex": s, "$options": "i"}},
            {"category": {"$regex": s, "$options": "i"}},
        ]
    products = await db.products.find(q, {"_id": 0}).to_list(500)
    return products


@api_router.get("/products/{slug}")
async def get_product(slug: str):
    p = await db.products.find_one({"slug": slug}, {"_id": 0})
    if not p:
        raise HTTPException(404, "Product not found")
    return p


@api_router.post("/products")
async def create_product(data: ProductCreate, admin=Depends(require_admin)):
    existing = await db.products.find_one({"slug": data.slug})
    if existing:
        raise HTTPException(409, "Slug already exists")
    p = Product(**data.model_dump())
    await db.products.insert_one(p.model_dump())
    return p.model_dump()


@api_router.put("/products/{product_id}")
async def update_product(product_id: str, data: ProductUpdate, admin=Depends(require_admin)):
    update = {k: v for k, v in data.model_dump().items() if v is not None}
    result = await db.products.update_one({"id": product_id}, {"$set": update})
    if result.matched_count == 0:
        raise HTTPException(404, "Product not found")
    p = await db.products.find_one({"id": product_id}, {"_id": 0})
    return p


@api_router.delete("/products/{product_id}")
async def delete_product(product_id: str, admin=Depends(require_admin)):
    result = await db.products.delete_one({"id": product_id})
    if result.deleted_count == 0:
        raise HTTPException(404, "Product not found")
    return {"ok": True}


# ---- Uploads (legacy admin only; disabled after Shopify migration) ----
# Product images now come from Shopify. If admin uploads are re-enabled,
# migrate to Emergent object storage.


# ---- Wishlist ----
@api_router.get("/wishlist")
async def get_wishlist(user=Depends(get_current_user)):
    docs = await db.wishlist.find({"user_id": user["id"]}, {"_id": 0}).to_list(200)
    product_ids = [d["product_id"] for d in docs]
    products = await db.products.find({"id": {"$in": product_ids}}, {"_id": 0}).to_list(200)
    return products


@api_router.post("/wishlist/{product_id}")
async def add_wishlist(product_id: str, user=Depends(get_current_user)):
    await db.wishlist.update_one(
        {"user_id": user["id"], "product_id": product_id},
        {"$set": {"user_id": user["id"], "product_id": product_id, "added_at": now_iso()}},
        upsert=True,
    )
    return {"ok": True}


@api_router.delete("/wishlist/{product_id}")
async def remove_wishlist(product_id: str, user=Depends(get_current_user)):
    await db.wishlist.delete_one({"user_id": user["id"], "product_id": product_id})
    return {"ok": True}


# ---- Coupons ----
@api_router.get("/coupons")
async def list_coupons(admin=Depends(require_admin)):
    return await db.coupons.find({}, {"_id": 0}).sort("created_at", -1).to_list(200)


@api_router.post("/coupons")
async def create_coupon(data: CouponCreate, admin=Depends(require_admin)):
    code = data.code.upper().strip()
    existing = await db.coupons.find_one({"code": code})
    if existing:
        raise HTTPException(409, "Coupon code already exists")
    c = Coupon(**{**data.model_dump(), "code": code})
    await db.coupons.insert_one(c.model_dump())
    return c.model_dump()


@api_router.delete("/coupons/{code}")
async def delete_coupon(code: str, admin=Depends(require_admin)):
    result = await db.coupons.delete_one({"code": code.upper()})
    if result.deleted_count == 0:
        raise HTTPException(404, "Coupon not found")
    return {"ok": True}


@api_router.post("/coupons/apply")
async def apply_coupon(data: CouponApply):
    coupon = await db.coupons.find_one({"code": data.code.upper()}, {"_id": 0})
    if not coupon or not coupon.get("active"):
        raise HTTPException(404, "Invalid or inactive coupon")
    if data.subtotal < coupon.get("min_order", 0):
        raise HTTPException(400, f"Minimum order ₹{coupon['min_order']} required")
    discount = compute_discount(coupon, data.subtotal)
    return {"code": coupon["code"], "discount": discount, "coupon": coupon}


# ---- Orders ----
@api_router.post("/orders")
async def create_order(data: OrderCreate, authorization: Optional[str] = Header(None)):
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        try:
            payload = pyjwt.decode(authorization.split(" ", 1)[1], JWT_SECRET, algorithms=[JWT_ALGO])
            user_id = payload["sub"]
        except pyjwt.PyJWTError:
            pass

    items_snapshot = []
    computed_subtotal = 0
    for it in data.items:
        p = await db.products.find_one({"id": it.product_id}, {"_id": 0})
        if not p:
            raise HTTPException(400, f"Product {it.product_id} not found")
        computed_subtotal += p["price"] * it.quantity
        items_snapshot.append({
            "product_id": p["id"], "name": p["name"], "slug": p["slug"],
            "price": p["price"], "quantity": it.quantity,
            "image": (p.get("images") or [None])[0],
        })

    # Coupon
    discount = 0
    coupon_code = None
    if data.coupon_code:
        coupon = await db.coupons.find_one({"code": data.coupon_code.upper()}, {"_id": 0})
        if coupon and coupon.get("active"):
            discount = compute_discount(coupon, computed_subtotal)
            coupon_code = coupon["code"]

    computed_shipping = 0
    computed_total = computed_subtotal + computed_shipping - discount

    order = Order(
        user_id=user_id,
        items=items_snapshot,
        customer_name=data.customer_name,
        email=data.email,
        phone=data.phone,
        address=data.address,
        city=data.city,
        state=data.state,
        pincode=data.pincode,
        subtotal=computed_subtotal,
        shipping=computed_shipping,
        discount=discount,
        coupon_code=coupon_code,
        total=computed_total,
        payment_method=data.payment_method,
    )

    if data.payment_method == "razorpay" and rzp_client:
        try:
            rzp_order = rzp_client.order.create({
                "amount": computed_total * 100,
                "currency": "INR",
                "receipt": order.order_number,
                "payment_capture": 1,
            })
            order.razorpay_order_id = rzp_order["id"]
        except Exception:
            raise HTTPException(500, "Payment gateway error")

    await db.orders.insert_one(order.model_dump())
    return {
        "order": order.model_dump(),
        "razorpay_key_id": RZP_KEY_ID if rzp_client else None,
    }


@api_router.post("/orders/verify-payment")
async def verify_payment(data: PaymentVerify):
    if not rzp_client:
        raise HTTPException(400, "Razorpay not configured")
    body = f"{data.razorpay_order_id}|{data.razorpay_payment_id}"
    expected = hmac.new(RZP_KEY_SECRET.encode(), body.encode(), hashlib.sha256).hexdigest()
    if not hmac.compare_digest(expected, data.razorpay_signature):
        raise HTTPException(400, "Invalid signature")
    await db.orders.update_one(
        {"id": data.order_id},
        {"$set": {
            "status": "paid",
            "razorpay_payment_id": data.razorpay_payment_id,
        }}
    )
    order = await db.orders.find_one({"id": data.order_id}, {"_id": 0})
    return order


@api_router.get("/orders/track/{order_number}")
async def track_order(order_number: str, email: Optional[str] = None):
    order = await db.orders.find_one({"order_number": order_number.upper()}, {"_id": 0})
    if not order:
        raise HTTPException(404, "Order not found")
    # If email provided, must match for full details; otherwise return status only
    if email and email.strip().lower() == order.get("email", "").lower():
        return order
    return {
        "order_number": order["order_number"],
        "status": order["status"],
        "created_at": order["created_at"],
        "requires_email": True,
    }


@api_router.get("/orders")
async def list_orders(admin=Depends(require_admin)):
    return await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


@api_router.get("/orders/mine")
async def my_orders(user=Depends(get_current_user)):
    return await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)


# ---- Newsletter & Inquiries ----
@api_router.post("/newsletter")
async def newsletter(data: NewsletterSignup):
    await db.newsletter.update_one(
        {"email": data.email},
        {"$set": {"email": data.email, "created_at": now_iso()}},
        upsert=True,
    )
    return {"ok": True}


@api_router.post("/inquiry")
async def inquiry(data: InquiryForm):
    doc = data.model_dump()
    doc["id"] = str(uuid.uuid4())
    doc["created_at"] = now_iso()
    await db.inquiries.insert_one(doc)
    return {"ok": True, "id": doc["id"]}


@api_router.get("/inquiries")
async def list_inquiries(admin=Depends(require_admin)):
    return await db.inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)


# ---- Seed ----
IMG_CHANDELIER_CLASSIC = "https://images.unsplash.com/photo-1586450428662-92fe683549b9?w=1200&q=85"
IMG_CHANDELIER_MODERN = "https://images.unsplash.com/photo-1706820229870-f9a8c6dac193?w=1200&q=85"
IMG_PENDANT_MODERN = "https://images.unsplash.com/photo-1648415198825-7c805bfa043e?w=1200&q=85"
IMG_WALL = "https://images.unsplash.com/photo-1775660922989-f0c624413269?w=1200&q=85"
IMG_TABLE = "https://images.unsplash.com/photo-1764760764956-fcb78be107a5?w=1200&q=85"
IMG_FLOOR = "https://images.unsplash.com/photo-1704040686413-2c607dbd2f06?w=1200&q=85"

SAMPLE_PRODUCTS = [
    # Chandeliers - Modern
    {"name": "Solene Cascade Chandelier", "slug": "solene-cascade-chandelier", "category": "chandeliers", "subcategory": "modern",
     "price": 189000, "description": "A sculptural glass cascade suspended on hand-forged brass — a centrepiece for foyers and dining rooms.",
     "finish": "Antique Brass", "style": "Modern", "bulb_type": "E14 LED", "room": "Dining",
     "dimensions": "H 1400mm × Ø 900mm", "material": "Hand-blown glass, brass",
     "images": [IMG_CHANDELIER_MODERN, IMG_CHANDELIER_CLASSIC], "stock": 8, "featured": True, "new_arrival": True},
    {"name": "Meridian Ring Chandelier", "slug": "meridian-ring-chandelier", "category": "chandeliers", "subcategory": "modern",
     "price": 145000, "description": "A perfect circle of soft-diffused light in blackened brass — geometric and quiet.",
     "finish": "Blackened Brass", "style": "Modern", "bulb_type": "Integrated LED", "room": "Living",
     "dimensions": "Ø 1000mm × H 120mm", "material": "Brass, opal glass",
     "images": [IMG_CHANDELIER_MODERN], "stock": 10, "featured": True, "new_arrival": False},

    # Chandeliers - Classic
    {"name": "Cristallo Classical Chandelier", "slug": "cristallo-classical-chandelier", "category": "chandeliers", "subcategory": "classic",
     "price": 265000, "description": "A traditional multi-arm crystal chandelier — hand-cut Bohemian crystal on a polished brass frame.",
     "finish": "Polished Brass", "style": "Classical", "bulb_type": "E14 candle × 12", "room": "Dining",
     "dimensions": "H 1200mm × Ø 850mm", "material": "Bohemian crystal, brass",
     "images": [IMG_CHANDELIER_CLASSIC], "stock": 5, "featured": True, "new_arrival": False},
    {"name": "Regent Baroque Chandelier", "slug": "regent-baroque-chandelier", "category": "chandeliers", "subcategory": "classic",
     "price": 198000, "description": "Ornate scrollwork with hand-drape crystal — a piece for period-style homes.",
     "finish": "Antique Gold", "style": "Classical", "bulb_type": "E14 candle × 8", "room": "Living",
     "dimensions": "H 950mm × Ø 700mm", "material": "Crystal, cast brass",
     "images": [IMG_CHANDELIER_CLASSIC], "stock": 6, "featured": False, "new_arrival": False},

    # Double Height Chandeliers - Modern
    {"name": "Atrium Cascade Grand", "slug": "atrium-cascade-grand", "category": "double-height-chandeliers", "subcategory": "modern",
     "price": 485000, "description": "A modern 3.5m cascade for double-height foyers — smoked glass tears on brushed brass.",
     "finish": "Brushed Brass", "style": "Modern Grand", "bulb_type": "G9 LED × 32", "room": "Staircase",
     "dimensions": "H 3500mm × Ø 1200mm", "material": "Smoked glass, brass",
     "images": [IMG_CHANDELIER_MODERN, IMG_CHANDELIER_CLASSIC], "stock": 3, "featured": True, "new_arrival": True},
    {"name": "Sphere Constellation", "slug": "sphere-constellation", "category": "double-height-chandeliers", "subcategory": "modern",
     "price": 385000, "description": "Twenty-four hand-blown spheres in a suspended constellation — modern statement.",
     "finish": "Aged Brass", "style": "Modern Grand", "bulb_type": "G9 LED × 24", "room": "Staircase",
     "dimensions": "H 3000mm × Ø 1400mm", "material": "Hand-blown glass, brass",
     "images": [IMG_CHANDELIER_MODERN], "stock": 4, "featured": False, "new_arrival": True},

    # Double Height Chandeliers - Classic
    {"name": "Duplex Grand Crystal", "slug": "duplex-grand-crystal", "category": "double-height-chandeliers", "subcategory": "classic",
     "price": 585000, "description": "Cascading full-lead crystal descending 4m in a soft spiral — for grand foyers and stairwells.",
     "finish": "Champagne Gold", "style": "Classical Grand", "bulb_type": "E14 × 32", "room": "Staircase",
     "dimensions": "H 4000mm × Ø 1400mm", "material": "Full-lead crystal, brass",
     "images": [IMG_CHANDELIER_CLASSIC], "stock": 2, "featured": True, "new_arrival": False},
    {"name": "Palladio Empire Chandelier", "slug": "palladio-empire-chandelier", "category": "double-height-chandeliers", "subcategory": "classic",
     "price": 425000, "description": "An empire-style 24-arm chandelier with hand-cut crystal drops — for palatial interiors.",
     "finish": "Antique Gold", "style": "Empire", "bulb_type": "E14 × 24", "room": "Staircase",
     "dimensions": "H 3200mm × Ø 1100mm", "material": "Crystal, cast brass",
     "images": [IMG_CHANDELIER_CLASSIC], "stock": 3, "featured": False, "new_arrival": False},

    # Pendants - Modern
    {"name": "Meridian Linear Pendant", "slug": "meridian-linear-pendant", "category": "pendants", "subcategory": "modern",
     "price": 62000, "description": "A quiet horizon of light. Linear pendant with warm-diffused acrylic and blackened steel.",
     "finish": "Matte Black", "style": "Minimalist", "bulb_type": "Integrated LED", "room": "Kitchen",
     "dimensions": "L 1200mm × H 80mm", "material": "Steel, opal acrylic",
     "images": [IMG_PENDANT_MODERN], "stock": 15, "featured": True, "new_arrival": False},
    {"name": "Amber Orbit Pendant", "slug": "amber-orbit-pendant", "category": "pendants", "subcategory": "modern",
     "price": 42000, "description": "A single amber-tinted glass orb on a slender brass rod. Warm and jewel-like.",
     "finish": "Polished Brass", "style": "Modern", "bulb_type": "E14 LED", "room": "Dining",
     "dimensions": "H 800mm × Ø 300mm", "material": "Amber glass, brass",
     "images": [IMG_PENDANT_MODERN], "stock": 18, "featured": True, "new_arrival": True},

    # Pendants - Classic
    {"name": "Vintage Brass Bell Pendant", "slug": "vintage-brass-bell-pendant", "category": "pendants", "subcategory": "classic",
     "price": 34500, "description": "A hand-spun brass bell pendant with aged patina — a heritage silhouette.",
     "finish": "Aged Brass", "style": "Classical", "bulb_type": "E27 LED", "room": "Kitchen",
     "dimensions": "H 450mm × Ø 320mm", "material": "Solid brass",
     "images": [IMG_PENDANT_MODERN], "stock": 12, "featured": False, "new_arrival": False},
    {"name": "Colonial Lantern Pendant", "slug": "colonial-lantern-pendant", "category": "pendants", "subcategory": "classic",
     "price": 48500, "description": "A four-panel glass lantern in an antique brass frame — a colonial classic.",
     "finish": "Antique Brass", "style": "Classical", "bulb_type": "E14 × 4", "room": "Dining",
     "dimensions": "H 700mm × Ø 400mm", "material": "Brass, seedy glass",
     "images": [IMG_PENDANT_MODERN], "stock": 10, "featured": True, "new_arrival": False},

    # Wall Lamps - Modern
    {"name": "Halo Disc Wall Sconce", "slug": "halo-disc-wall-sconce", "category": "wall", "subcategory": "modern",
     "price": 18500, "description": "A soft halo of indirect light. Perfect in pairs beside a bed or vanity.",
     "finish": "Brushed Bronze", "style": "Modern", "bulb_type": "G9 LED", "room": "Bedroom",
     "dimensions": "Ø 300mm × D 80mm", "material": "Aluminium, frosted glass",
     "images": [IMG_WALL], "stock": 30, "featured": True, "new_arrival": True},
    {"name": "Nook Reading Wall Light", "slug": "nook-reading-wall-light", "category": "wall", "subcategory": "modern",
     "price": 12500, "description": "Adjustable swing-arm wall light with a soft cone shade — a considered reading companion.",
     "finish": "Matte Black", "style": "Modern", "bulb_type": "E14 LED", "room": "Bedroom",
     "dimensions": "Reach 500mm × H 200mm", "material": "Steel",
     "images": [IMG_WALL], "stock": 40, "featured": False, "new_arrival": True},

    # Wall Lamps - Classic
    {"name": "Rococo Wall Sconce (Pair)", "slug": "rococo-wall-sconce-pair", "category": "wall", "subcategory": "classic",
     "price": 32500, "description": "A pair of ornate cast-brass sconces with hand-cut crystal drops — sold as a pair.",
     "finish": "Polished Brass", "style": "Classical", "bulb_type": "E14 × 2 (per sconce)", "room": "Living",
     "dimensions": "H 400mm × W 250mm (each)", "material": "Cast brass, crystal",
     "images": [IMG_WALL], "stock": 8, "featured": True, "new_arrival": False},
    {"name": "Heritage Picture Light", "slug": "heritage-picture-light", "category": "wall", "subcategory": "classic",
     "price": 14500, "description": "A traditional above-frame picture light in aged brass — for artwork and cabinetry.",
     "finish": "Aged Brass", "style": "Classical", "bulb_type": "Integrated LED", "room": "Living",
     "dimensions": "L 400mm × D 150mm", "material": "Solid brass",
     "images": [IMG_WALL], "stock": 25, "featured": False, "new_arrival": False},

    # Bamboo
    {"name": "Bamboo Weave Pendant", "slug": "bamboo-weave-pendant", "category": "bamboo", "subcategory": "",
     "price": 18500, "description": "Hand-woven bamboo pendant with a warm ambient glow — bringing texture and craft into modern rooms.",
     "finish": "Natural Bamboo", "style": "Artisanal", "bulb_type": "E27 LED", "room": "Dining",
     "dimensions": "H 450mm × Ø 500mm", "material": "Hand-woven bamboo",
     "images": ["https://images.unsplash.com/photo-1764760764956-fcb78be107a5?w=1200&q=85"], "stock": 20, "featured": True, "new_arrival": True},
    {"name": "Bamboo Rattan Chandelier", "slug": "bamboo-rattan-chandelier", "category": "bamboo", "subcategory": "",
     "price": 42500, "description": "A grand woven-rattan chandelier — coastal and organic, warm and grounded.",
     "finish": "Natural Rattan", "style": "Artisanal", "bulb_type": "E14 × 6", "room": "Living",
     "dimensions": "H 700mm × Ø 800mm", "material": "Rattan, bamboo",
     "images": ["https://images.unsplash.com/photo-1764760764956-fcb78be107a5?w=1200&q=85"], "stock": 8, "featured": True, "new_arrival": True},
    {"name": "Bamboo Column Floor Lamp", "slug": "bamboo-column-floor-lamp", "category": "bamboo", "subcategory": "",
     "price": 28500, "description": "A tall bamboo column floor lamp with a linen shade — quiet, textural warmth in any room.",
     "finish": "Natural Bamboo", "style": "Artisanal", "bulb_type": "E27 LED", "room": "Living",
     "dimensions": "H 1600mm × Ø 300mm", "material": "Bamboo, linen",
     "images": ["https://images.unsplash.com/photo-1764760764956-fcb78be107a5?w=1200&q=85"], "stock": 15, "featured": False, "new_arrival": True},

    # Others
    {"name": "Ostra Marble Table Lamp", "slug": "ostra-marble-table-lamp", "category": "table", "subcategory": "",
     "price": 34500, "description": "A hand-turned Carrara marble base cradles a linen shade — grounded elegance for study or console.",
     "finish": "Carrara White", "style": "Sculptural", "bulb_type": "E27 LED", "room": "Living",
     "dimensions": "H 520mm × Ø 260mm", "material": "Carrara marble, linen",
     "images": [IMG_TABLE], "stock": 12, "featured": True, "new_arrival": False},
    {"name": "Verre Arc Floor Lamp", "slug": "verre-arc-floor-lamp", "category": "floor", "subcategory": "",
     "price": 78500, "description": "A cantilevered brass arc suspends a smoked glass globe — reading light with an editorial silhouette.",
     "finish": "Aged Brass", "style": "Modern", "bulb_type": "E27 LED", "room": "Living",
     "dimensions": "H 1900mm × Reach 1200mm", "material": "Brass, smoked glass",
     "images": [IMG_FLOOR], "stock": 6, "featured": False, "new_arrival": True},
    {"name": "Aether Flush Ceiling", "slug": "aether-flush-ceiling", "category": "ceiling", "subcategory": "",
     "price": 26500, "description": "A whisper-thin flush mount that dissolves into the ceiling plane. Ideal for corridors and low-height rooms.",
     "finish": "Warm White", "style": "Architectural", "bulb_type": "Integrated LED", "room": "Corridor",
     "dimensions": "Ø 450mm × H 60mm", "material": "Steel, diffused acrylic",
     "images": [IMG_CHANDELIER_MODERN], "stock": 25, "featured": False, "new_arrival": False},
    {"name": "Terra Bollard Outdoor", "slug": "terra-bollard-outdoor", "category": "outdoor", "subcategory": "",
     "price": 22500, "description": "Weather-sealed brass bollard for gardens and pathways. IP65-rated, warm 2700K glow.",
     "finish": "Weathered Brass", "style": "Landscape", "bulb_type": "Integrated LED (2700K)", "room": "Outdoor",
     "dimensions": "H 600mm × Ø 100mm", "material": "Solid brass",
     "images": [IMG_WALL], "stock": 20, "featured": False, "new_arrival": True},
]


@app.on_event("startup")
async def startup():
    # Admin seed: use salesadorelighting@gmail.com; remove any legacy default admin
    admin_email = os.environ.get('ADMIN_EMAIL', 'salesadorelighting@gmail.com').lower()
    admin_pw = os.environ.get('ADMIN_PASSWORD', 'Adore@Studio2026')

    # Remove legacy demo admins
    await db.users.delete_many({"email": {"$in": ["admin@adore.com", "hello@adore.com"]}, "role": "admin"})

    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        admin = User(email=admin_email, name="Adore Admin", role="admin")
        doc = admin.model_dump()
        doc["password"] = hash_password(admin_pw)
        await db.users.insert_one(doc)
        logger.info(f"Seeded admin user: {admin_email}")
    elif existing.get("role") != "admin":
        await db.users.update_one({"email": admin_email}, {"$set": {"role": "admin"}})

    # Upsert products by slug (so we can update category/subcategory on redeploy)
    for p_data in SAMPLE_PRODUCTS:
        slug = p_data["slug"]
        found = await db.products.find_one({"slug": slug})
        if not found:
            p = Product(**p_data)
            await db.products.insert_one(p.model_dump())
        else:
            # keep original id; update category/subcategory/description/etc. keep price/stock as-is
            await db.products.update_one(
                {"slug": slug},
                {"$set": {
                    "category": p_data["category"],
                    "subcategory": p_data.get("subcategory", ""),
                    "name": p_data["name"],
                    "description": p_data["description"],
                    "images": p_data["images"],
                    "featured": p_data.get("featured", False),
                    "new_arrival": p_data.get("new_arrival", False),
                }}
            )

    # Remove products from removed categories (architectural)
    await db.products.delete_many({"category": "architectural"})

    # Seed one demo coupon (10% welcome)
    if not await db.coupons.find_one({"code": "ADORE10"}):
        c = Coupon(code="ADORE10", percent_off=10, min_order=10000, active=True)
        await db.coupons.insert_one(c.model_dump())


app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)


@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
