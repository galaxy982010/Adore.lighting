from fastapi import FastAPI, APIRouter, HTTPException, Depends, UploadFile, File, Form, Header
from fastapi.responses import FileResponse
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
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


# ---------- Models ----------
def now_iso():
    return datetime.now(timezone.utc).isoformat()


class User(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    email: EmailStr
    name: str
    role: str = "user"  # user | admin
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
    category: str  # chandeliers | pendants | wall | table | floor | ceiling | outdoor | architectural
    price: int  # INR (integer rupees)
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
    total: int  # INR rupees
    payment_method: str = "razorpay"  # razorpay | cod


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
    total: int
    status: str = "pending"  # pending | paid | shipped | delivered | cancelled
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
    inquiry_type: str = "contact"  # contact | bespoke | trade


# ---------- Auth Helpers ----------
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


# ---------- Routes ----------
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
async def list_products(category: Optional[str] = None, room: Optional[str] = None,
                        featured: Optional[bool] = None, new_arrival: Optional[bool] = None,
                        search: Optional[str] = None, min_price: Optional[int] = None,
                        max_price: Optional[int] = None, finish: Optional[str] = None,
                        style: Optional[str] = None, bulb_type: Optional[str] = None):
    q = {}
    if category: q["category"] = category
    if room: q["room"] = room
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
        q["$or"] = [
            {"name": {"$regex": search, "$options": "i"}},
            {"description": {"$regex": search, "$options": "i"}},
            {"category": {"$regex": search, "$options": "i"}},
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
    p = Product(**data.model_dump())
    await db.products.insert_one(p.model_dump())
    doc = p.model_dump()
    return doc


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


# ---- Uploads ----
@api_router.post("/upload")
async def upload_file(file: UploadFile = File(...), admin=Depends(require_admin)):
    ext = Path(file.filename).suffix.lower()
    if ext not in [".jpg", ".jpeg", ".png", ".webp", ".gif"]:
        raise HTTPException(400, "Invalid file type")
    fname = f"{uuid.uuid4()}{ext}"
    path = UPLOAD_DIR / fname
    with open(path, "wb") as f:
        f.write(await file.read())
    return {"url": f"/api/uploads/{fname}"}


@api_router.get("/uploads/{filename}")
async def get_upload(filename: str):
    path = UPLOAD_DIR / filename
    if not path.exists():
        raise HTTPException(404)
    return FileResponse(path)


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


# ---- Orders ----
@api_router.post("/orders")
async def create_order(data: OrderCreate, authorization: Optional[str] = Header(None)):
    # Optional auth
    user_id = None
    if authorization and authorization.startswith("Bearer "):
        try:
            payload = pyjwt.decode(authorization.split(" ", 1)[1], JWT_SECRET, algorithms=[JWT_ALGO])
            user_id = payload["sub"]
        except pyjwt.PyJWTError:
            pass

    # Build items snapshot
    items_snapshot = []
    for it in data.items:
        p = await db.products.find_one({"id": it.product_id}, {"_id": 0})
        if not p:
            raise HTTPException(400, f"Product {it.product_id} not found")
        items_snapshot.append({
            "product_id": p["id"], "name": p["name"], "slug": p["slug"],
            "price": p["price"], "quantity": it.quantity,
            "image": (p.get("images") or [None])[0],
        })

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
        total=data.total,
        payment_method=data.payment_method,
    )

    # Create razorpay order if configured
    if data.payment_method == "razorpay" and rzp_client:
        try:
            rzp_order = rzp_client.order.create({
                "amount": data.total * 100,  # paise
                "currency": "INR",
                "receipt": order.order_number,
                "payment_capture": 1,
            })
            order.razorpay_order_id = rzp_order["id"]
        except Exception as e:
            raise HTTPException(500, f"Razorpay error: {str(e)}")

    await db.orders.insert_one(order.model_dump())
    return {
        "order": order.model_dump(),
        "razorpay_key_id": RZP_KEY_ID if rzp_client else None,
    }


@api_router.post("/orders/verify-payment")
async def verify_payment(data: PaymentVerify):
    if not rzp_client:
        raise HTTPException(400, "Razorpay not configured")
    # Verify signature
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
async def track_order(order_number: str):
    order = await db.orders.find_one({"order_number": order_number.upper()}, {"_id": 0})
    if not order:
        raise HTTPException(404, "Order not found")
    return order


@api_router.get("/orders")
async def list_orders(admin=Depends(require_admin)):
    orders = await db.orders.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return orders


@api_router.get("/orders/mine")
async def my_orders(user=Depends(get_current_user)):
    orders = await db.orders.find({"user_id": user["id"]}, {"_id": 0}).sort("created_at", -1).to_list(200)
    return orders


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
    docs = await db.inquiries.find({}, {"_id": 0}).sort("created_at", -1).to_list(500)
    return docs


# ---- Startup: Seed Admin & Products ----
SAMPLE_PRODUCTS = [
    {
        "name": "Solene Cascade Chandelier", "slug": "solene-cascade-chandelier", "category": "chandeliers",
        "price": 189000, "description": "A sculptural glass cascade suspended on hand-forged brass — a centrepiece for double-height foyers and dining rooms.",
        "finish": "Antique Brass", "style": "Modern Classic", "bulb_type": "E14 LED", "room": "Dining",
        "dimensions": "H 1400mm × Ø 900mm", "material": "Hand-blown glass, brass",
        "images": ["https://images.unsplash.com/photo-1586450428662-92fe683549b9?w=1200&q=85","https://images.unsplash.com/photo-1706820229870-f9a8c6dac193?w=1200&q=85"],
        "stock": 8, "featured": True, "new_arrival": True,
    },
    {
        "name": "Meridian Linear Pendant", "slug": "meridian-linear-pendant", "category": "pendants",
        "price": 62000, "description": "A quiet horizon of light. Linear pendant with warm-diffused acrylic and blackened steel.",
        "finish": "Matte Black", "style": "Minimalist", "bulb_type": "Integrated LED", "room": "Kitchen",
        "dimensions": "L 1200mm × H 80mm", "material": "Steel, opal acrylic",
        "images": ["https://images.unsplash.com/photo-1648415198825-7c805bfa043e?w=1200&q=85"],
        "stock": 15, "featured": True, "new_arrival": False,
    },
    {
        "name": "Halo Disc Wall Sconce", "slug": "halo-disc-wall-sconce", "category": "wall",
        "price": 18500, "description": "A soft halo of indirect light. Perfect in pairs beside a bed or vanity.",
        "finish": "Brushed Bronze", "style": "Contemporary", "bulb_type": "G9 LED", "room": "Bedroom",
        "dimensions": "Ø 300mm × D 80mm", "material": "Aluminium, frosted glass",
        "images": ["https://images.unsplash.com/photo-1775660922989-f0c624413269?w=1200&q=85"],
        "stock": 30, "featured": True, "new_arrival": True,
    },
    {
        "name": "Ostra Marble Table Lamp", "slug": "ostra-marble-table-lamp", "category": "table",
        "price": 34500, "description": "A hand-turned Carrara marble base cradles a linen shade — grounded elegance for study or console.",
        "finish": "Carrara White", "style": "Sculptural", "bulb_type": "E27 LED", "room": "Living",
        "dimensions": "H 520mm × Ø 260mm", "material": "Carrara marble, linen",
        "images": ["https://images.unsplash.com/photo-1764760764956-fcb78be107a5?w=1200&q=85"],
        "stock": 12, "featured": True, "new_arrival": False,
    },
    {
        "name": "Verre Arc Floor Lamp", "slug": "verre-arc-floor-lamp", "category": "floor",
        "price": 78500, "description": "A cantilevered brass arc suspends a smoked glass globe — reading light with an editorial silhouette.",
        "finish": "Aged Brass", "style": "Modern", "bulb_type": "E27 LED", "room": "Living",
        "dimensions": "H 1900mm × Reach 1200mm", "material": "Brass, smoked glass",
        "images": ["https://images.unsplash.com/photo-1704040686413-2c607dbd2f06?w=1200&q=85"],
        "stock": 6, "featured": False, "new_arrival": True,
    },
    {
        "name": "Aether Flush Ceiling", "slug": "aether-flush-ceiling", "category": "ceiling",
        "price": 26500, "description": "A whisper-thin flush mount that dissolves into the ceiling plane. Ideal for corridors and low-height rooms.",
        "finish": "Warm White", "style": "Architectural", "bulb_type": "Integrated LED", "room": "Corridor",
        "dimensions": "Ø 450mm × H 60mm", "material": "Steel, diffused acrylic",
        "images": ["https://images.unsplash.com/photo-1706820229870-f9a8c6dac193?w=1200&q=85"],
        "stock": 25, "featured": False, "new_arrival": False,
    },
    {
        "name": "Terra Bollard Outdoor", "slug": "terra-bollard-outdoor", "category": "outdoor",
        "price": 22500, "description": "Weather-sealed brass bollard for gardens and pathways. IP65-rated, warm 2700K glow.",
        "finish": "Weathered Brass", "style": "Landscape", "bulb_type": "Integrated LED (2700K)", "room": "Outdoor",
        "dimensions": "H 600mm × Ø 100mm", "material": "Solid brass",
        "images": ["https://images.unsplash.com/photo-1775660922989-f0c624413269?w=1200&q=85"],
        "stock": 20, "featured": False, "new_arrival": True,
    },
    {
        "name": "Linea Cove Architectural", "slug": "linea-cove-architectural", "category": "architectural",
        "price": 14500, "description": "Modular linear cove profile — dimmable, tunable white. For architectural installations.",
        "finish": "Anodised Aluminium", "style": "Architectural", "bulb_type": "LED Strip 24V", "room": "Any",
        "dimensions": "L 1000mm (modular)", "material": "Aluminium, PC diffuser",
        "images": ["https://images.unsplash.com/photo-1704040686413-2c607dbd2f06?w=1200&q=85"],
        "stock": 100, "featured": False, "new_arrival": False,
    },
    {
        "name": "Amber Orbit Pendant", "slug": "amber-orbit-pendant", "category": "pendants",
        "price": 42000, "description": "A single amber-tinted glass orb on a slender brass rod. Warm and jewel-like.",
        "finish": "Polished Brass", "style": "Modern Classic", "bulb_type": "E14 LED", "room": "Dining",
        "dimensions": "H 800mm × Ø 300mm", "material": "Amber glass, brass",
        "images": ["https://images.unsplash.com/photo-1648415198825-7c805bfa043e?w=1200&q=85"],
        "stock": 18, "featured": True, "new_arrival": True,
    },
    {
        "name": "Duplex Grand Chandelier", "slug": "duplex-grand-chandelier", "category": "chandeliers",
        "price": 425000, "description": "A statement piece for duplex stairwells — cascading crystals descend 3.5m in a soft spiral.",
        "finish": "Champagne Gold", "style": "Grand", "bulb_type": "E14 LED (24 lamps)", "room": "Staircase",
        "dimensions": "H 3500mm × Ø 1200mm", "material": "Crystal, brass",
        "images": ["https://images.unsplash.com/photo-1586450428662-92fe683549b9?w=1200&q=85"],
        "stock": 3, "featured": True, "new_arrival": False,
    },
    {
        "name": "Nook Reading Wall Light", "slug": "nook-reading-wall-light", "category": "wall",
        "price": 12500, "description": "Adjustable swing-arm wall light with a soft cone shade — a considered reading companion.",
        "finish": "Matte Black", "style": "Utilitarian", "bulb_type": "E14 LED", "room": "Bedroom",
        "dimensions": "Reach 500mm × H 200mm", "material": "Steel",
        "images": ["https://images.unsplash.com/photo-1775660922989-f0c624413269?w=1200&q=85"],
        "stock": 40, "featured": False, "new_arrival": True,
    },
    {
        "name": "Lume Ceramic Table Lamp", "slug": "lume-ceramic-table-lamp", "category": "table",
        "price": 21500, "description": "A hand-thrown ceramic base in soft terracotta with a raw linen shade.",
        "finish": "Terracotta", "style": "Artisanal", "bulb_type": "E27 LED", "room": "Living",
        "dimensions": "H 480mm × Ø 240mm", "material": "Ceramic, linen",
        "images": ["https://images.unsplash.com/photo-1764760764956-fcb78be107a5?w=1200&q=85"],
        "stock": 22, "featured": False, "new_arrival": True,
    },
]


@app.on_event("startup")
async def startup():
    # Seed admin
    admin_email = os.environ.get('ADMIN_EMAIL', 'admin@adore.com')
    admin_pw = os.environ.get('ADMIN_PASSWORD', 'Admin@Adore2026')
    existing = await db.users.find_one({"email": admin_email})
    if not existing:
        admin = User(email=admin_email, name="Adore Admin", role="admin")
        doc = admin.model_dump()
        doc["password"] = hash_password(admin_pw)
        await db.users.insert_one(doc)
        logger.info(f"Seeded admin user: {admin_email}")

    # Seed products
    count = await db.products.count_documents({})
    if count == 0:
        for p_data in SAMPLE_PRODUCTS:
            p = Product(**p_data)
            await db.products.insert_one(p.model_dump())
        logger.info(f"Seeded {len(SAMPLE_PRODUCTS)} products")


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
