import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, Instagram, Sparkles, Truck, Package, ChevronRight } from "lucide-react";
import { CATEGORIES, BRAND, formatINR } from "@/lib/api";
import * as Shopify from "@/lib/shopify";
import CategoryTile from "@/components/CategoryTile";
import ProductCard from "@/components/ProductCard";
import Reveal from "@/components/Reveal";
import InspirationSection from "@/components/InspirationSection";
import RecentlyViewed from "@/components/RecentlyViewed";

const HERO_SLIDES = [
    {
        image: "/hero/slide1.jpg",
        eyebrow: "The Adore Studio",
        title: "Light That Creates\nYour Vibes.",
        blurb: "An editorial catalogue of chandeliers, pendants and sculptural lamps — sourced with unusual care.",
        cta: { to: "/shop/chandeliers", label: "Explore Chandeliers" },
        announcement: "Complimentary Shipping Across India",
    },
    {
        image: "/hero/slide2.jpg",
        eyebrow: "Made Slowly",
        title: "Illuminate\nYour Vibe.",
        blurb: "Grand fixtures for weddings, Diwali homes and the softest evenings of the year.",
        cta: { to: "/shop/double-height-chandeliers", label: "Statement Fixtures" },
        announcement: "Dispatched in 48 hours · Delivered in 5–6 working days",
    },
    {
        image: "/hero/slide3.jpg",
        eyebrow: "Considered Interiors",
        title: "Light That Matches\nYour Vibe.",
        blurb: "Layered lighting for living rooms, bedrooms and every quiet room in between.",
        cta: { to: "/shop/ceiling", label: "Ceiling Lights" },
        announcement: "Trusted by architects & interior designers across India",
    },
    {
        image: "/hero/slide4.jpg",
        eyebrow: "For Every Room",
        title: "Warmth,\nBy Design.",
        blurb: "Halo sconces, reading lights, table lamps and heritage picture lights.",
        cta: { to: "/kits", label: "Explore Lighting Kits" },
        announcement: "Curated Lighting Kits · one look for every room",
    },
];

const IG_GRID = [
    "/collections/page11.jpg",
    "/collections/page8.jpg",
    "/collections/page6.jpg",
    "/collections/page10.jpg",
    "/collections/page1.jpg",
    "/collections/page2.jpg",
];

export default function Home() {
    const [featured, setFeatured] = useState([]);
    const [newArrivals, setNew] = useState([]);
    const [slide, setSlide] = useState(0);
    const timer = useRef(null);

    useEffect(() => {
        // Fetch ALL products from Shopify (single source of truth). Featured
        // + new-arrival tags aren't set on this store yet, so we simply
        // slice the catalog for now — as tags get added in Shopify, these
        // sections will automatically honour them.
        Shopify.listProducts({ first: 250 })
            .then((list) => {
                const tagged = list.filter((p) => p.featured);
                const newT = list.filter((p) => p.new_arrival);
                setFeatured(tagged.length ? tagged : list.slice(0, 8));
                setNew(newT.length ? newT : list.slice(0, 8));
            })
            .catch(() => {
                setFeatured([]);
                setNew([]);
            });
    }, []);

    useEffect(() => {
        timer.current = setInterval(() => setSlide((s) => (s + 1) % HERO_SLIDES.length), 5000);
        return () => clearInterval(timer.current);
    }, []);

    // Sync announcement bar with active hero slide (heard by Nav).
    useEffect(() => {
        const msg = HERO_SLIDES[slide]?.announcement;
        window.dispatchEvent(new CustomEvent("adore:announcement", { detail: msg }));
        return () => window.dispatchEvent(new CustomEvent("adore:announcement", { detail: null }));
    }, [slide]);

    const active = HERO_SLIDES[slide];

    return (
        <div>
            {/* HERO CAROUSEL */}
            <section className="relative h-[88vh] sm:h-[90vh] md:h-[92vh] min-h-[500px] sm:min-h-[580px] md:min-h-[640px] w-full overflow-hidden bg-charcoal">
                {HERO_SLIDES.map((s, i) => (
                    <div key={i} className={`absolute inset-0 transition-opacity duration-1400 ease-out ${slide === i ? "opacity-100" : "opacity-0"}`}>
                        <img
                            src={s.image}
                            alt={s.title}
                            className={`w-full h-full object-cover ${slide === i ? "scale-105" : "scale-100"} transition-transform duration-6000 ease-out`}
                        />
                        <div className="absolute inset-0 bg-gradient-to-b from-charcoal/60 via-charcoal/25 to-charcoal/85" />
                    </div>
                ))}

                <div className="relative h-full max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 flex flex-col justify-end pb-12 sm:pb-16 md:pb-24 text-ivory">
                    <div key={slide} className="max-w-2xl rise-in">
                        <div className="text-xs sm:text-sm tracking-editorial text-ivory/80 mb-3 sm:mb-6">{active.eyebrow}</div>
                        <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] sm:leading-[0.95] tracking-tight whitespace-pre-line">
                            {active.title}
                        </h1>
                        <p className="mt-4 sm:mt-8 max-w-lg text-ivory/85 text-xs sm:text-[15px] leading-relaxed">{active.blurb}</p>
                        <div className="mt-6 sm:mt-10 flex flex-wrap items-center gap-3 sm:gap-6">
                            <Link
                                to={active.cta.to}
                                data-testid="hero-cta-shop"
                                className="inline-flex items-center gap-3 bg-ivory text-charcoal px-6 py-3.5 sm:px-8 sm:py-4 hover:bg-amber2 hover:text-ivory transition-colors group text-xs sm:text-sm"
                            >
                                <span className="tracking-editorial">{active.cta.label}</span>
                                <ArrowRight size={15} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                            <Link to="/bespoke" data-testid="hero-cta-bespoke" className="tracking-editorial text-ivory/90 underline-link text-xs sm:text-sm">
                                Bespoke Commissions
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* TRUST STRIP */}
            <section className="border-b border-[#E5E3DC]">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-4 sm:py-6 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 text-xs sm:text-sm">
                    {[
                        [<Truck size={18} className="text-amber2 shrink-0" />, "Complimentary shipping", "across India"],
                        [<Package size={18} className="text-amber2 shrink-0" />, "Dispatched in 48 hours", "5–6 working days"],
                        [<Sparkles size={18} className="text-amber2 shrink-0" />, "Carefully packed", "premium products"],
                        [<Sparkles size={18} className="text-amber2 shrink-0" />, "Reliable support", "Mon–Sat · 10–7 IST"],
                    ].map(([Icon, t, s], i) => (
                        <div key={i} className="flex items-center gap-2.5 sm:gap-3">
                            {Icon}
                            <div>
                                <div className="font-medium text-xs sm:text-sm leading-tight">{t}</div>
                                <div className="text-[10px] sm:text-xs text-muted2 mt-0.5">{s}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </section>

            {/* SHOP BY CATEGORY */}
            <section className="py-14 sm:py-20 md:py-32">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10">
                    <Reveal className="flex items-end justify-between mb-8 sm:mb-14 flex-wrap gap-4">
                        <div>
                            <div className="tracking-editorial text-muted2 mb-2 sm:mb-4 text-xs sm:text-sm">The Collections</div>
                            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-none">Shop by category</h2>
                        </div>
                        <Link to="/shop/chandeliers" className="tracking-editorial hover:text-amber2 underline-link text-xs sm:text-sm">View all →</Link>
                    </Reveal>
                    <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-4">
                        {CATEGORIES.map((c, i) => (
                            <Reveal key={c.slug} delay={i * 50}>
                                <div className="relative group">
                                    <CategoryTile {...c} />
                                    {c.subs && c.subs.length > 0 && c.subs.length <= 4 && (
                                        <div className="hidden sm:block absolute inset-x-0 bottom-0 p-4 sm:p-6 md:p-8 pointer-events-none">
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
                <img src="/hero/slide3.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-35" />
                <div className="absolute inset-0 bg-gradient-to-r from-charcoal/80 via-charcoal/50 to-transparent" />
                <div className="relative max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-16 sm:py-24 md:py-32">
                    <Reveal className="max-w-xl">
                        <div className="tracking-editorial text-amber2 mb-4 sm:mb-6 text-xs sm:text-sm">Season of Light · Diwali & Wedding Edit</div>
                        <h2 className="font-serif text-3xl sm:text-4xl md:text-6xl leading-tight">Statement fixtures for the season of gatherings.</h2>
                        <p className="mt-4 sm:mt-6 text-ivory/80 max-w-md text-xs sm:text-base leading-relaxed">Grand chandeliers, warm-amber sconces and bamboo pendants — curated for weddings, festive dinners and Diwali homes.</p>
                        <Link to="/shop/double-height-chandeliers" data-testid="festive-cta" className="inline-flex items-center gap-3 mt-8 sm:mt-10 border border-ivory/50 px-6 py-3 sm:px-8 sm:py-4 hover:bg-ivory hover:text-charcoal transition-colors text-xs sm:text-sm">
                            <span className="tracking-editorial">Shop the Season</span> <ArrowRight size={14} />
                        </Link>
                    </Reveal>
                </div>
            </section>

            {/* BRAND STORY */}
            <section className="bg-ivory-2 py-14 sm:py-20 md:py-32">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 grid md:grid-cols-2 gap-10 md:gap-16 items-center">
                    <Reveal className="aspect-[4/5] overflow-hidden">
                        <img src="/hero/slide1.jpg" alt="Craftsmanship at Adore" className="w-full h-full object-cover" />
                    </Reveal>
                    <Reveal delay={120}>
                        <div className="tracking-editorial text-amber2 mb-4 sm:mb-6 text-xs sm:text-sm">Our Ethos</div>
                        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl leading-tight">
                            Light that creates your vibes.
                        </h2>
                        <p className="mt-4 sm:mt-8 text-charcoal/75 leading-relaxed max-w-lg text-xs sm:text-base">
                            At Adore, we believe lighting is more than illumination — it's the soul of every space. Every piece we make or curate is chosen for how it inhabits a room in the evening, in the morning, in silence.
                        </p>
                        <Link to="/about" data-testid="home-about-cta" className="inline-flex items-center gap-3 mt-8 sm:mt-10 tracking-editorial hover:text-amber2 underline-link text-xs sm:text-sm">
                            Read our story <ArrowRight size={14} />
                        </Link>
                    </Reveal>
                </div>
            </section>

            {/* NEW ARRIVALS */}
            <section className="py-14 sm:py-20 md:py-32">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10">
                    <Reveal className="flex items-end justify-between mb-8 sm:mb-14 flex-wrap gap-4">
                        <div>
                            <div className="tracking-editorial text-muted2 mb-2 sm:mb-4 text-xs sm:text-sm">Just In</div>
                            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl">New Arrivals</h2>
                        </div>
                        <Link to="/shop/chandeliers" className="tracking-editorial hover:text-amber2 underline-link text-xs sm:text-sm">Shop all →</Link>
                    </Reveal>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-10">
                        {newArrivals.slice(0, 4).map((p, i) => (
                            <Reveal key={p.id} delay={i * 80}>
                                <ProductCard product={p} />
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* BUNDLES / KITS TEASER */}
            <section className="bg-ivory-2 py-14 sm:py-20 md:py-32">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10">
                    <Reveal>
                        <div className="tracking-editorial text-muted2 mb-2 sm:mb-4 text-xs sm:text-sm">Curated Kits</div>
                        <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl mb-2 sm:mb-4">Lighting, one room at a time.</h2>
                        <p className="max-w-xl text-charcoal/70 text-xs sm:text-base">Layered lighting compositions our studio suggests for each room — inspiration you can shop piece by piece.</p>
                    </Reveal>
                    <div className="grid md:grid-cols-3 gap-6 md:gap-8 mt-8 sm:mt-14">
                        {[
                            { title: "The Living Room Kit", tag: "Chandelier · wall · table · floor · pendants", image: "/kits/living-room.jpg" },
                            { title: "The Dining Kit", tag: "Chandelier · sconces · candle pendants", image: "/kits/dining.jpg" },
                            { title: "The Bedroom Kit", tag: "Ambient · bedside · reading light", image: "/kits/bedroom.jpg" },
                        ].map((k, i) => (
                            <Reveal key={k.title} delay={i * 100}>
                                <Link to="/kits" data-testid={`bundle-${i}`} className="group block">
                                    <div className="aspect-[4/5] overflow-hidden image-zoom">
                                        <img src={k.image} alt={k.title} loading="lazy" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="pt-3 sm:pt-5">
                                        <div className="tracking-editorial text-amber2 mb-1 sm:mb-2 text-xs">Suggested layering</div>
                                        <div className="font-serif text-lg sm:text-2xl">{k.title}</div>
                                        <div className="text-xs sm:text-sm text-muted2 mt-1">{k.tag}</div>
                                    </div>
                                </Link>
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            {/* FEATURED */}
            <section className="py-14 sm:py-20 md:py-32">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10">
                    <Reveal className="flex items-end justify-between mb-8 sm:mb-14 flex-wrap gap-4">
                        <div>
                            <div className="tracking-editorial text-muted2 mb-2 sm:mb-4 text-xs sm:text-sm">Editor's Selection</div>
                            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl">Featured pieces</h2>
                        </div>
                    </Reveal>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-6 md:gap-10">
                        {featured.slice(0, 8).map((p, i) => (
                            <Reveal key={p.id} delay={i * 60}>
                                <ProductCard product={p} />
                            </Reveal>
                        ))}
                    </div>
                </div>
            </section>

            <InspirationSection />
            <RecentlyViewed />

            {/* INSTAGRAM */}
            <section className="border-t border-[#E5E3DC] py-14 sm:py-20 md:py-24">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10">
                    <Reveal className="flex flex-wrap items-end justify-between gap-4 mb-6 sm:mb-10">
                        <div>
                            <div className="tracking-editorial text-muted2 mb-2 sm:mb-4 text-xs sm:text-sm">Shop the Look</div>
                            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl">@adore.lighting</h2>
                        </div>
                        <a href={BRAND.instagram} target="_blank" rel="noopener noreferrer" data-testid="ig-follow" className="inline-flex items-center gap-2 tracking-editorial hover:text-amber2 text-xs sm:text-sm">
                            <Instagram size={15} /> Follow on Instagram
                        </a>
                    </Reveal>
                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-3">
                        {IG_GRID.map((src, i) => (
                            <a key={i} href={BRAND.instagram} target="_blank" rel="noopener noreferrer" className="block aspect-square overflow-hidden image-zoom bg-ivory-2">
                                <img src={src} alt="Adore lighting on Instagram" loading="lazy" className="w-full h-full object-cover" />
                            </a>
                        ))}
                    </div>
                </div>
            </section>

            {/* PRESS */}
            <section className="py-10 sm:py-16 border-y border-[#E5E3DC]">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10">
                    <div className="tracking-editorial text-muted2 text-center mb-6 sm:mb-8 text-xs">As featured in</div>
                    <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10 md:gap-16 font-serif text-lg sm:text-2xl md:text-3xl text-charcoal/60">
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
