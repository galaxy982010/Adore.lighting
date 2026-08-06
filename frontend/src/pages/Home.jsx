import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Instagram, Sparkles, Truck, Package, ChevronRight } from "lucide-react";
import { api, CATEGORIES, BRAND, formatINR } from "@/lib/api";
import CategoryTile from "@/components/CategoryTile";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";

const HERO_SLIDES = [
    {
        image: "https://images.unsplash.com/photo-1704040686413-2c607dbd2f06?w=2200&q=90",
        eyebrow: "The Adore Studio",
        title: "Light That Creates\nYour Vibes.",
        blurb: "Editorial chandeliers, pendants and sculptural lamps — sourced, made and installed with unusual care.",
        cta: { to: "/shop/chandeliers", label: "Explore Chandeliers" },
    },
    {
        image: "https://images.unsplash.com/photo-1586450428662-92fe683549b9?w=2200&q=90",
        eyebrow: "Season of Light",
        title: "Illuminate\nYour Vibe.",
        blurb: "Grand fixtures for weddings, Diwali homes and the softest evenings of the year.",
        cta: { to: "/shop/double-height-chandeliers", label: "Statement Fixtures" },
    },
    {
        image: "https://images.unsplash.com/photo-1706820229870-f9a8c6dac193?w=2200&q=90",
        eyebrow: "Considered Interiors",
        title: "Light That Matches\nYour Vibe.",
        blurb: "Layered lighting for living rooms, bedrooms and every quiet room in between.",
        cta: { to: "/shop/ceiling", label: "Ceiling Lights" },
    },
    {
        image: "https://images.unsplash.com/photo-1648415198825-7c805bfa043e?w=2200&q=90",
        eyebrow: "Pendants & Rings",
        title: "Suspend the\nOrdinary.",
        blurb: "Hand-blown glass and linear pendants — quiet horizons of light.",
        cta: { to: "/shop/pendants", label: "Shop Pendants" },
    },
    {
        image: "https://images.unsplash.com/photo-1775660922989-f0c624413269?w=2200&q=90",
        eyebrow: "The Wall Edit",
        title: "Warmth,\nBy Design.",
        blurb: "Halo sconces, reading lights and heritage picture lights.",
        cta: { to: "/shop/wall", label: "Shop Wall Lamps" },
    },
    {
        image: "https://images.unsplash.com/photo-1764760764956-fcb78be107a5?w=2200&q=90",
        eyebrow: "Craft, Considered",
        title: "Made Slowly.\nDelivered With Care.",
        blurb: "Hand-blown glass, hand-woven bamboo, hand-cut crystal — an editorial catalogue.",
        cta: { to: "/shop/bamboo", label: "The Bamboo Edit" },
    },
];

const IG_GRID = [
    "https://images.unsplash.com/photo-1586450428662-92fe683549b9?w=800&q=85",
    "https://images.unsplash.com/photo-1704040686413-2c607dbd2f06?w=800&q=85",
    "https://images.unsplash.com/photo-1706820229870-f9a8c6dac193?w=800&q=85",
    "https://images.unsplash.com/photo-1648415198825-7c805bfa043e?w=800&q=85",
    "https://images.unsplash.com/photo-1775660922989-f0c624413269?w=800&q=85",
    "https://images.unsplash.com/photo-1764760764956-fcb78be107a5?w=800&q=85",
];

export default function Home() {
    const [featured, setFeatured] = useState([]);
    const [newArrivals, setNew] = useState([]);
    const [slide, setSlide] = useState(0);
    const timer = useRef(null);

    useEffect(() => {
        api.get("/products", { params: { featured: true } }).then((r) => setFeatured(r.data));
        api.get("/products", { params: { new_arrival: true } }).then((r) => setNew(r.data));
    }, []);

    useEffect(() => {
        timer.current = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 5000);
        return () => clearInterval(timer.current);
    }, []);

    const active = HERO_SLIDES[slide];

    return (
        <div>
            {/* HERO CAROUSEL */}
            <section className="relative h-[92vh] min-h-[640px] w-full overflow-hidden bg-charcoal">
                {HERO_SLIDES.map((s, i) => (
                    <div key={i} className={`absolute inset-0 transition-opacity duration-[1400ms] ease-out ${slide === i ? "opacity-100" : "opacity-0"}`}>
                        <img
                            src={s.image}
                            alt={s.title}
                            className={`w-full h-full object-cover ${slide === i ? "scale-105" : "scale-100"} transition-transform duration-[6000ms] ease-out`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-charcoal/25 to-charcoal/85" />
                    </div>
                ))}

                <div className="relative h-full max-w-[1400px] mx-auto px-6 md:px-10 flex flex-col justify-end pb-24 text-ivory">
                    <div key={slide} className="max-w-2xl rise-in">
                        <div className="tracking-editorial text-ivory/80 mb-6">{active.eyebrow}</div>
                        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl leading-[0.95] tracking-tight whitespace-pre-line">
                            {active.title}
                        </h1>
                        <p className="mt-8 max-w-lg text-ivory/85 text-[15px] leading-relaxed">{active.blurb}</p>
                        <div className="mt-10 flex flex-wrap items-center gap-6">
                            <Link
                                to={active.cta.to}
                                data-testid="hero-cta-shop"
                                className="inline-flex items-center gap-3 bg-ivory text-charcoal px-8 py-4 hover:bg-amber2 hover:text-ivory transition-colors group"
                            >
                                <span className="tracking-editorial">{active.cta.label}</span>
                                <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/bespoke" data-testid="hero-cta-bespoke" className="tracking-editorial text-ivory/90 underline-link">
                                Bespoke Commissions
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* TRUST STRIP */}
            <section className="border-b border-[#E5E3DC]">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-6 grid grid-cols-2 md:grid-cols-4 gap-6 text-sm">
                    {[
                        [<Truck size={18} className="text-amber2" />, "Complimentary shipping", "across India"],
                        [<Package size={18} className="text-amber2" />, "Dispatched in 48 hours", "5–6 working days"],
                        [<Sparkles size={18} className="text-amber2" />, "Carefully packed", "premium products"],
                        [<Sparkles size={18} className="text-amber2" />, "Reliable support", "Mon–Sat · 10–7 IST"],
                    ].map(([Icon, t, s], i) => (
                        <div key={i} className="flex items-center gap-3">
                            {Icon}
                            <div>
                                <div className="font-medium">{t}</div>
                                <div className="text-xs text-muted2">{s}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* SHOP BY CATEGORY */}
            <section className="py-24 md:py-32">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                    <Reveal className="flex items-end justify-between mb-14 flex-wrap gap-4">
                        <div>
                            <div className="tracking-editorial text-muted2 mb-4">The Collections</div>
                            <h2 className="font-serif text-4xl md:text-5xl leading-none">Shop by category</h2>
                        </div>
                        <Link to="/shop/chandeliers" className="tracking-editorial hover:text-amber2 underline-link">View all →</Link>
                    </Reveal>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                        {CATEGORIES.map((c, i) => (
                            <Reveal key={c.slug} delay={i * 50}>
                                <div className="relative group">
                                    <CategoryTile {...c} />
                                    {c.subs && c.subs.length > 0 && c.subs.length <= 4 && (
                                        <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 pointer-events-none">
                                            <div className="pointer-events-auto flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-500 mt-4">
                                                {c.subs.map((s) => (
                                                    <Link
                                                        key={s.slug}
                                                        to={`/shop/${c.slug}?sub=${s.slug}`}
                                                        data-testid={`cat-sub-${c.slug}-${s.slug}`}
                                                        className="text-[10px] tracking-editorial bg-ivory/90 text-charcoal px-3 py-1.5 hover:bg-amber2 hover:text-ivory transition-colors"
                                                        onClick={(e) => e.stopPropagation()}
                                                    >
                                                        {s.name} <ChevronRight size={10} className="inline" />
                                                    </Link>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* FESTIVE BANNER */}
            <section className="relative overflow-hidden bg-charcoal text-ivory">
                <img src="https://images.unsplash.com/photo-1586450428662-92fe683549b9?w=2000&q=85" alt="" className="absolute inset-0 w-full h-full object-cover opacity-35" />
                <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/50 to-transparent" />
                <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 py-24 md:py-32">
                    <Reveal className="max-w-xl">
                        <div className="tracking-editorial text-amber2 mb-6">Season of Light · Diwali & Wedding Edit</div>
                        <h2 className="font-serif text-4xl md:text-6xl leading-tight">Statement fixtures for the season of gatherings.</h2>
                        <p className="mt-6 text-ivory/80 max-w-md">Grand chandeliers, warm-amber sconces and bamboo pendants — curated for weddings, festive dinners and Diwali homes.</p>
                        <Link to="/shop/double-height-chandeliers" data-testid="festive-cta" className="inline-flex items-center gap-3 mt-10 border border-ivory/50 px-8 py-4 hover:bg-ivory hover:text-charcoal transition-colors">
                            <span className="tracking-editorial">Shop the Season</span> <ArrowRight size={14} />
                        </Link>
                    </Reveal>
                </div>
            </section>

            {/* BRAND STORY */}
            <section className="bg-ivory-2 py-24 md:py-32">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-16 items-center">
                    <Reveal className="aspect-[4/5] overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1706820229870-f9a8c6dac193?w=1400&q=90" alt="Craftsmanship at Adore" className="w-full h-full object-cover" />
                    </Reveal>
                    <Reveal delay={120}>
                        <div className="tracking-editorial text-amber2 mb-6">Our Ethos</div>
                        <h2 className="font-serif text-4xl md:text-5xl leading-tight">
                            Light that creates your vibes.
                        </h2>
                        <p className="mt-8 text-charcoal/75 leading-relaxed max-w-lg">
                            At Adore, we believe lighting is more than illumination — it's the soul of every space. Every piece we make or curate is chosen for how it inhabits a room in the evening, in the morning, in silence.
                        </p>
                        <Link to="/about" data-testid="home-about-cta" className="inline-flex items-center gap-3 mt-10 tracking-editorial hover:text-amber2 underline-link">
                            Read our story <ArrowRight size={14} />
                        </Link>
                    </Reveal>
                </div>
            </section>

            {/* NEW ARRIVALS */}
            <section className="py-24 md:py-32">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                    <Reveal className="flex items-end justify-between mb-14 flex-wrap gap-4">
                        <div>
                            <div className="tracking-editorial text-muted2 mb-4">Just In</div>
                            <h2 className="font-serif text-4xl md:text-5xl">New Arrivals</h2>
                        </div>
                        <Link to="/shop/chandeliers" className="tracking-editorial hover:text-amber2 underline-link">Shop all →</Link>
                    </Reveal>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
                        {newArrivals.slice(0, 4).map((p, i) => (
                            <Reveal key={p.id} delay={i * 80}>
                                <ProductCard product={p} />
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* BUNDLES */}
            <section className="bg-ivory-2 py-24 md:py-32">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                    <Reveal>
                        <div className="tracking-editorial text-muted2 mb-4">Curated Kits</div>
                        <h2 className="font-serif text-4xl md:text-5xl mb-4">Complete Room Lighting</h2>
                        <p className="max-w-xl text-charcoal/70">Layered fixtures pre-selected by our design team — one purchase, one delivery, one installation.</p>
                    </Reveal>
                    <div className="grid md:grid-cols-3 gap-6 md:gap-8 mt-14">
                        {[
                            { title: "The Dining Kit", tag: "Chandelier · 2 wall sconces · dimmer", price: 245000, save: 22000, image: "https://images.unsplash.com/photo-1586450428662-92fe683549b9?w=1200&q=85" },
                            { title: "The Bedroom Kit", tag: "Pendant · 2 bedside lamps · reading light", price: 89000, save: 12000, image: "https://images.unsplash.com/photo-1648415198825-7c805bfa043e?w=1200&q=85" },
                            { title: "The Living Kit", tag: "Arc floor lamp · table lamp · 3 sconces", price: 168000, save: 18000, image: "https://images.unsplash.com/photo-1704040686413-2c607dbd2f06?w=1200&q=85" },
                        ].map((k, i) => (
                            <Reveal key={k.title} delay={i * 100}>
                                <Link to="/bespoke" data-testid={`bundle-${i}`} className="group block">
                                    <div className="aspect-[4/5] overflow-hidden image-zoom">
                                        <img src={k.image} alt={k.title} loading="lazy" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="pt-5">
                                        <div className="tracking-editorial text-amber2 mb-2">Save {formatINR(k.save)}</div>
                                        <div className="font-serif text-2xl">{k.title}</div>
                                        <div className="text-sm text-muted2 mt-1">{k.tag}</div>
                                        <div className="mt-2 text-sm">{formatINR(k.price)}</div>
                                    </div>
                                </Link>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* FEATURED */}
            <section className="py-24 md:py-32">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                    <Reveal className="flex items-end justify-between mb-14 flex-wrap gap-4">
                        <div>
                            <div className="tracking-editorial text-muted2 mb-4">Editor's Selection</div>
                            <h2 className="font-serif text-4xl md:text-5xl">Featured pieces</h2>
                        </div>
                    </Reveal>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
                        {featured.slice(0, 8).map((p, i) => (
                            <Reveal key={p.id} delay={i * 60}>
                                <ProductCard product={p} />
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* INSTAGRAM */}
            <section className="border-t border-[#E5E3DC] py-24">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                    <Reveal className="flex flex-wrap items-end justify-between gap-4 mb-10">
                        <div>
                            <div className="tracking-editorial text-muted2 mb-4">Shop the Look</div>
                            <h2 className="font-serif text-4xl md:text-5xl">@adore.lighting</h2>
                        </div>
                        <a href={BRAND.instagram} target="_blank" rel="noopener noreferrer" data-testid="ig-follow" className="inline-flex items-center gap-2 tracking-editorial hover:text-amber2">
                            <Instagram size={16} /> Follow on Instagram
                        </a>
                    </Reveal>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-2 md:gap-3">
                        {IG_GRID.map((src, i) => (
                            <a key={i} href={BRAND.instagram} target="_blank" rel="noopener noreferrer" className="block aspect-square overflow-hidden image-zoom bg-ivory-2">
                                <img src={src} alt="Adore lighting on Instagram" loading="lazy" className="w-full h-full object-cover" />
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* PRESS */}
            <section className="py-16 border-y border-[#E5E3DC]">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                    <div className="tracking-editorial text-muted2 text-center mb-8">As featured in</div>
                    <div className="flex flex-wrap items-center justify-center gap-10 md:gap-16 font-serif text-2xl md:text-3xl text-charcoal/60">
                        <span>Architectural Digest</span>
                        <span className="italic">ELLE Decor</span>
                        <span>Vogue Living</span>
                        <span className="italic">Wallpaper*</span>
                        <span>Kyoorius</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
