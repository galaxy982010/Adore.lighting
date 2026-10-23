# Adore — Luxury Lighting Ecommerce

## Original Problem Statement
Build a premium, high-end ecommerce website for **Adore**, a luxury decorative lighting brand (chandeliers, pendants, wall lights, table/floor lamps, ceiling, outdoor, architectural). Warm-luxury, editorial tone — not gaudy. Target: homeowners, architects, designers furnishing premium residential/commercial spaces in India. Followed by a premium upgrade pass covering real contact details, WhatsApp, socials, reviews, festive banner, bundles, newsletter popup, Google Maps.

## User Choices (2026-02)
- Full ecommerce + mock/Razorpay checkout
- Razorpay integration (test mode; keys not yet provided by user)
- Simple keyword search
- Admin panel for product upload/management
- JWT email/password auth
- Warm palette (ivory / charcoal / amber `#B85B24` / terracotta)

## Architecture
- **Backend**: FastAPI + Motor (MongoDB), JWT auth (bcrypt), Razorpay SDK, local image uploads to `/app/backend/uploads` served through `/api/uploads/{filename}`. Server recomputes order total from product prices + shipping (client value is snapshotted but authoritative on server).
- **Frontend**: React (CRA) + Tailwind + shadcn/ui + lucide-react + sonner. Cormorant Garamond serif + Outfit sans. IntersectionObserver-driven fade-ins.
- **Auth**: Bearer JWT (30-day). Admin auto-seeded on startup.
- **Data**: 12 sample products seeded once; admin can add/edit/delete via UI (URL paste OR file upload).

## Implemented (2026-02)
- **Pages**: Home, Category listing (+ filters + sort), PDP (gallery/zoom/warm-cool toggle/trust badges/3 reviews/related), Rooms landing, Cart, Checkout (COD + Razorpay wired), Track, About, Store Locator (12 stores), Bespoke, Trade, Contact (Maps + inline phone validation + socials), Auth, Wishlist, Admin (products/orders/inquiries), Legal (privacy/terms/shipping/returns), 404 NotFound
- **Global**: Sticky nav with search overlay + sticky cart count · Footer with LinkedIn + Instagram + Facebook + YouTube (real URLs) + click-to-call + mailto · WhatsApp widget wa.me/918178867115 · Newsletter popup (12s, once, route-suppressed on admin/checkout/cart/auth) · Fade-in-on-scroll (Reveal)
- **Home extras**: Trust strip · Festive/Diwali banner · Bundle/Combo section · Shop-the-Look Instagram grid · Press strip
- **Admin**: Upload endpoint (JPEG/PNG/WebP), URL paste, tabbed dashboard (Products, Orders, Inquiries)
- **SEO**: Per-page-ready meta, OG tags, Twitter card, favicon (inline SVG)

## Real Brand Facts (single source of truth in `/app/frontend/src/lib/api.js`)
- 18 years · 12 stores · 12 cities
- Phone: 081788 67115 · tel:+918178867115
- Email: salesadorelighting@gmail.com
- Instagram: /adore.lighting · Facebook: profile id 61592334465712 · YouTube: @adore.lighting · LinkedIn: /adore-lighting-596229425
- WhatsApp: +91 81788 67115

## Test Credentials
- Admin: `admin@adore.com` / `Admin@Adore2026`
- Razorpay: NOT configured (env vars empty). COD checkout is the tested path.

## Known Backlog (P1)
- Razorpay live keys from user → enable card/UPI checkout (add `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET` to `/app/backend/.env`)
- More product photos via admin upload (seeded catalog reuses 6 Unsplash IDs across 12 products)
- Product slug uniqueness enforcement (409)
- Pagination on `/api/products`
- Move `SAMPLE_PRODUCTS` from `server.py` into `seed_data.py`

## P2 Enhancements (Sparks)
- Wedding/Diwali dedicated landing with curated products
- 3D room-preview / AR try-on for chandeliers
- Interior-designer quote-builder (multi-product PDF)
- Order → CRM webhook for the studio team

## Update (Jun 2026)
- GitHub push: to be done by user via the "Save to GitHub" button in chat (repo: galaxy982010/Adore.lighting).
- Razorpay: not added; Shopify checkout remains the only payment flow (default choice). Razorpay can be enabled inside Shopify Payments settings if needed.
