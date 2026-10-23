import { useEffect, useState } from "react";
import { Link, useOutletContext } from "react-router-dom";
import { Sparkles } from "lucide-react";
import KitQuoteDialog from "@/components/KitQuoteDialog";

// Lighting kits are curated *suggestions* — inspiration, not fixed packages.
// No prices anywhere on this page.
const KITS = [
    {
        slug: "living-room",
        title: "Living Room Kit",
        blurb: "A layered composition for the room that hosts everyone. Feature light overhead, warm accents at eye-level, ambient glow at the corners.",
        image: "/kits/living-room.jpg",
        items: [
            { name: "Chandelier", to: "/shop/chandeliers" },
            { name: "Wall Lamp", to: "/shop/wall" },
            { name: "Table Lamp", to: "/shop/table" },
            { name: "Floor Lamp", to: "/shop/floor" },
            { name: "Bedside Hanging", to: "/shop/pendants" },
            { name: "Corner Hanging", to: "/shop/pendants" },
        ],
    },
    {
        slug: "dining",
        title: "Dining Kit",
        blurb: "A dining room should feel like an occasion. Pair a statement chandelier with softer accents that carry the mood off the table.",
        image: "/kits/dining.jpg",
        items: [
            { name: "Chandelier", to: "/shop/chandeliers" },
            { name: "Wall Lamp", to: "/shop/wall" },
            { name: "Table Lamp", to: "/shop/table" },
            { name: "Floor Lamp", to: "/shop/floor" },
            { name: "Bedside Hanging", to: "/shop/pendants" },
            { name: "Corner Hanging", to: "/shop/pendants" },
        ],
    },
    {
        slug: "bedroom",
        title: "Bedroom Kit",
        blurb: "The bedroom is a room of layers — a soft central light, a bedside glow to read by, and a warm corner for winding down.",
        image: "/kits/bedroom.jpg",
        items: [
            { name: "Chandelier", to: "/shop/chandeliers" },
            { name: "Wall Lamp", to: "/shop/wall" },
            { name: "Table Lamp", to: "/shop/table" },
            { name: "Floor Lamp", to: "/shop/floor" },
            { name: "Bedside Hanging", to: "/shop/pendants" },
            { name: "Corner Hanging", to: "/shop/pendants" },
        ],
    },
];

export default function Kits() {
    const { setWaProduct } = useOutletContext();
    const [quoteKit, setQuoteKit] = useState(null);

    useEffect(() => {
        const obs = new IntersectionObserver(
            (entries) => entries.forEach((e) => e.isIntersecting && setWaProduct(e.target.dataset.kitTitle)),
            { rootMargin: "-45% 0px -45% 0px" }
        );
        document.querySelectorAll("[data-kit-title]").forEach((el) => obs.observe(el));
        return () => { obs.disconnect(); setWaProduct(null); };
    }, [setWaProduct]);

    return (
        <div>
            <KitQuoteDialog kit={quoteKit} onClose={() => setQuoteKit(null)} />
            <section className="max-w-[1400px] mx-auto px-6 md:px-10 pt-16 pb-8">
                <div className="tracking-editorial text-muted2 mb-4">Lighting Kits</div>
                <h1 className="font-serif text-5xl md:text-6xl">Curated Suggestions, One Room at a Time.</h1>
                <p className="mt-6 max-w-2xl text-charcoal/70">
                    These are lighting compositions our studio suggests for each room — inspiration, not a fixed package. Mix, match and swap pieces from the Adore catalogue to make each layer your own.
                </p>
            </section>

            {KITS.map((kit, idx) => (
                <section key={kit.slug} data-testid={`kit-${kit.slug}`} data-kit-title={kit.title} className={`py-24 ${idx % 2 === 0 ? "bg-ivory-2" : "bg-ivory"}`}>
                    <div className="max-w-[1400px] mx-auto px-6 md:px-10 grid md:grid-cols-2 gap-14 items-center">
                        <div className={`aspect-[4/5] overflow-hidden ${idx % 2 === 1 ? "md:order-2" : ""}`}>
                            <img src={kit.image} alt={kit.title} className="w-full h-full object-cover" loading="lazy" />
                        </div>
                        <div>
                            <div className="tracking-editorial text-amber2 mb-4 flex items-center gap-2"><Sparkles size={14} /> Suggested layering</div>
                            <h2 className="font-serif text-4xl md:text-5xl leading-tight">{kit.title}</h2>
                            <p className="mt-6 text-charcoal/75 leading-relaxed max-w-lg">{kit.blurb}</p>
                            <ul className="mt-10 grid grid-cols-2 gap-x-6 gap-y-3">
                                {kit.items.map((it) => (
                                    <li key={it.name}>
                                        <Link
                                            to={it.to}
                                            data-testid={`kit-${kit.slug}-${it.name.toLowerCase().replace(/\s+/g, "-")}`}
                                            className="group flex items-center justify-between border-b border-[#E5E3DC] py-3 hover:border-amber2"
                                        >
                                            <span className="text-sm">{it.name}</span>
                                            <span className="tracking-editorial text-muted2 text-[10px] group-hover:text-amber2">Explore →</span>
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                            <button
                                type="button"
                                data-testid={`kit-${kit.slug}-quote-button`}
                                onClick={() => setQuoteKit(kit)}
                                className="mt-10 inline-flex items-center gap-3 bg-charcoal text-ivory px-8 py-4 tracking-editorial text-xs hover:bg-amber2 transition-colors"
                            >
                                Request a quote
                            </button>
                            <p className="mt-6 text-xs text-muted2 italic">
                                A composition — not a package. Explore each layer and choose from the Adore catalogue.
                            </p>
                        </div>
                    </div>
                </section>
            ))}
        </div>
    );
}
