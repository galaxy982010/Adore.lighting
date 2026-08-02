import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, MapPin, Instagram, Sparkles, Truck, Shield, RotateCcw } from "lucide-react";
import { api, CATEGORIES, BRAND, formatINR } from "@/lib/api";
import CategoryTile from "@/components/CategoryTile";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";

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

    useEffect(() => {
        api.get("/products", { params: { featured: true } }).then((r) => setFeatured(r.data));
        api.get("/products", { params: { new_arrival: true } }).then((r) => setNew(r.data));
    }, []);

    return (
        <div>
            {/* HERO */}
            <section className="relative h-[86vh] min-h-[620px] w-full overflow-hidden bg-charcoal">
                <img
                    src="https://images.unsplash.com/photo-1704040686413-2c607dbd2f06?w=2000&q=90"
                    alt="Warm luxury interior with sculptural lighting"
                    className="absolute inset-0 w-full h-full object-cover opacity-95"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 via-transparent to-charcoal/60" />
                <div className="relative h-full max-w-[1400px] mx-auto px-6 md:px-10 flex flex-col justify-end pb-24 text-ivory">
                    <div className="max-w-2xl rise-in">
                        <div className="tracking-editorial text-ivory/80 mb-6">Spring Edition · 2026</div>
                        <h1 className="font-serif text-5xl sm:text-6xl md:text-7xl leading-[0.95] tracking-tight">
                            Light, considered.<br />Rooms, transformed.
                        </h1>
                        <p className="mt-8 max-w-lg text-ivory/85 text-[15px] leading-relaxed">
                            An editorial collection of chandeliers, pendants and sculptural lamps — sourced, made and installed with unusual care.
                        </p>
                        <div className="mt-10 flex flex-wrap items-center gap-6">
                            <Link
                                to="/shop/chandeliers"
                                data-testid="hero-cta-shop"
                                className="inline-flex items-center gap-3 bg-ivory text-charcoal px-8 py-4 hover:bg-amber2 hover:text-ivory transition-colors group"
                            >
                                <span className="tracking-editorial">Explore the Collection</span>
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
                        [<Truck size={18} className="text-amber2" />, "Complimentary shipping", "on orders above ₹50,000"],
                        [<Shield size={18} className="text-amber2" />, "5-year fixture warranty", "made-to-last construction"],
                        [<RotateCcw size={18} className="text-amber2" />, "14-day easy returns", "standard-catalogue pieces"],
                        [<Sparkles size={18} className="text-amber2" />, "White-glove installation", "our own trained fitters"],
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
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4">
                        {CATEGORIES.map((c, i) => (
                            <Reveal key={c.slug} delay={i * 60}>
                                <CategoryTile {...c} />
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
                        <p className="mt-6 text-ivory/80 max-w-md">Grand chandeliers, warm-amber sconces and outdoor lighting — curated for weddings, festive dinners and Diwali homes.</p>
                        <Link to="/shop/chandeliers" data-testid="festive-cta" className="inline-flex items-center gap-3 mt-10 border border-ivory/50 px-8 py-4 hover:bg-ivory hover:text-charcoal transition-colors">
                            <span className="tracking-editorial">Shop the Season</span> <ArrowRight size={14} />
                        </Link>
                    </Reveal>
                </div>
            </section>

            {/* BRAND STORY STRIP */}
            <section className="bg-ivory-2 py-24 md:py-32">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-16 items-center">
                    <Reveal className="aspect-[4/5] overflow-hidden">
                        <img src="https://images.unsplash.com/photo-1706820229870-f9a8c6dac193?w=1400&q=90" alt="Craftsmanship at Adore" className="w-full h-full object-cover" />
                    </Reveal>
                    <Reveal delay={120}>
                        <div className="tracking-editorial text-amber2 mb-6">Our Ethos</div>
                        <h2 className="font-serif text-4xl md:text-5xl leading-tight">
                            Eighteen years of quietly obsessing over light.
                        </h2>
                        <p className="mt-8 text-charcoal/75 leading-relaxed max-w-lg">
                            Adore was founded on a single conviction — that light should feel considered, not decorated. Every piece we make or curate is chosen for how it inhabits a room in the evening, in the morning, in silence.
                        </p>
                        <div className="mt-10 grid grid-cols-3 gap-6 max-w-md">
                            <div>
                                <div className="font-serif text-4xl">{BRAND.yearsInBusiness}</div>
                                <div className="tracking-editorial text-muted2 mt-2">Years</div>
                            </div>
                            <div>
                                <div className="font-serif text-4xl">{BRAND.storeCount}</div>
                                <div className="tracking-editorial text-muted2 mt-2">Stores</div>
                            </div>
                            <div>
                                <div className="font-serif text-4xl">{BRAND.cities.length}</div>
                                <div className="tracking-editorial text-muted2 mt-2">Cities</div>
                            </div>
                        </div>
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

            {/* BUNDLES / COMPLETE ROOM KITS */}
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

            {/* STORE LOCATOR TEASER */}
            <section className="relative py-24 md:py-32 bg-charcoal text-ivory overflow-hidden">
                <img
                    src="https://images.unsplash.com/photo-1775660922989-f0c624413269?w=1600&q=85"
                    alt=""
                    className="absolute inset-0 w-full h-full object-cover opacity-25"
                />
                <div className="relative max-w-[1400px] mx-auto px-6 md:px-10 text-center">
                    <Reveal>
                        <div className="tracking-editorial text-ivory/60 mb-6">Visit Us</div>
                        <h2 className="font-serif text-4xl md:text-6xl leading-tight max-w-3xl mx-auto">
                            Twelve ateliers across India, thoughtfully staged.
                        </h2>
                        <Link to="/stores" data-testid="home-stores-cta" className="inline-flex items-center gap-3 mt-10 border border-ivory/40 px-8 py-4 hover:bg-ivory hover:text-charcoal transition-colors">
                            <MapPin size={16} />
                            <span className="tracking-editorial">Find a store</span>
                        </Link>
                    </Reveal>
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

            {/* SHOP THE LOOK / INSTAGRAM */}
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
