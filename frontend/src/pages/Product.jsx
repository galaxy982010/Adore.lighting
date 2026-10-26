import { useEffect, useState } from "react";
import { useParams, Link, useNavigate, useOutletContext } from "react-router-dom";
import { toast } from "sonner";
import { Heart, ShoppingBag, Truck, Sparkles, RotateCcw, Star, Lock } from "lucide-react";
import { formatINR } from "@/lib/api";
import * as Shopify from "@/lib/shopify";
import { api } from "@/lib/api";
import { addToWishlist } from "@/pages/Wishlist";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import ProductCard from "@/components/ProductCard";
import RecentlyViewed from "@/components/RecentlyViewed";
import { pushRecent } from "@/lib/recent";

const REVIEWS = [
    { name: "Ananya S.", city: "Mumbai", rating: 5, title: "Elevated the entire foyer", body: "The scale and finish is exactly as photographed. The installation team was punctual and precise. Worth every rupee.", verified: true, photo: "/collections/page11.jpg" },
    { name: "Rohan M.", city: "Bengaluru", rating: 5, title: "Best-in-class craft", body: "Compared with three other studios before ordering — no one else's finish came close. The brass ages beautifully.", verified: true },
    { name: "Priya K.", city: "Delhi", rating: 4, title: "Beautiful, patient studio", body: "They took extra time to match the finish to my existing hardware. Slightly delayed but flawless once here.", verified: true, photo: "/collections/page8.jpg" },
];

const TEMPS = [
    {
        id: "2700k",
        name: "Warm Amber",
        label: "2700K Warm",
        kelvin: "2700K",
        overlay: "bg-amber-600/20",
        hint: "Intimate golden illumination — ideal for dining, bedrooms, and relaxing evenings.",
    },
    {
        id: "3000k",
        name: "Soft White",
        label: "3000K Soft",
        kelvin: "3000K",
        overlay: "bg-amber-300/10",
        hint: "Balanced warm interior light — the architectural standard for luxury Indian homes.",
    },
    {
        id: "4000k",
        name: "Crisp Neutral",
        label: "4000K Crisp",
        kelvin: "4000K",
        overlay: "bg-sky-200/10",
        hint: "True-colour modern clarity — ideal for double-height foyers and open-concept spaces.",
    },
];

export default function Product() {
    const { slug } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [notFound, setNotFound] = useState(false);
    const [related, setRelated] = useState([]);
    const [activeImg, setActiveImg] = useState(0);
    const [variantId, setVariantId] = useState(null);
    const [qty, setQty] = useState(1);
    const [zoomed, setZoomed] = useState(false);
    const [temp, setTemp] = useState("3000k");
    const { addItem, loading: cartLoading } = useCart();
    const outlet = useOutletContext() || {};
    const setWaProduct = outlet.setWaProduct;
    const colorTemp = TEMPS.find((t) => t.id === temp) || TEMPS[1];

    useEffect(() => {
        if (typeof setWaProduct === "function") {
            setWaProduct(product?.name || null);
            return () => setWaProduct(null);
        }
    }, [product, setWaProduct]);

    useEffect(() => {
        setNotFound(false);
        setProduct(null);
        Shopify.getProductByHandle(slug)
            .then((p) => {
                if (!p) { setNotFound(true); return; }
                setProduct(p);
                pushRecent(p);
                setActiveImg(0);
                setVariantId(p.variants?.[0]?.id || p.firstVariantId || null);
                Shopify.listProducts({ first: 100 })
                    .then((list) => setRelated(list.filter((x) => x.slug !== p.slug && x.category === p.category).slice(0, 4)))
                    .catch(() => setRelated([]));
            })
            .catch(() => setNotFound(true));
    }, [slug]);

    if (notFound) {
        return (
            <div className="max-w-[900px] mx-auto py-32 text-center">
                <div className="tracking-editorial text-muted2 mb-4">404</div>
                <h1 className="font-serif text-4xl md:text-5xl mb-8">This piece isn't listed yet.</h1>
                <button onClick={() => navigate("/")} className="bg-charcoal text-ivory px-8 py-4 tracking-editorial hover:bg-amber2 transition-colors">Return home</button>
            </div>
        );
    }
    if (!product) return <div className="py-40 text-center text-muted2">Loading…</div>;

    const activeVariant = product.variants?.find((v) => v.id === variantId) || product.variants?.[0];
    const currentPrice = activeVariant?.price ?? product.price ?? 0;

    const add = async () => {
        if (!variantId) { toast.error("Please select an option"); return; }
        const c = await addItem(variantId, qty);
        if (c) toast.success("Added to cart");
    };

    const wishlist = () => {
        addToWishlist(product.handle);
        toast.success("Saved to wishlist");
    };

    const avg = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1);
    const hasMultipleVariants = (product.variants?.length || 0) > 1;

    return (
        <div>
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 pt-6 sm:pt-10 text-[11px] sm:text-xs tracking-editorial text-muted2 truncate">
                <Link to="/">Home</Link> · {product.category && <><Link to={`/shop/${product.category}`}>{product.category}</Link> · </>}<span className="text-charcoal">{product.name}</span>
            </div>

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 pt-6 sm:pt-8 pb-16 sm:pb-24 grid lg:grid-cols-[1.15fr_1fr] gap-8 lg:gap-20">
                <div>
                    <div className={`aspect-[4/5] bg-ivory-2 overflow-hidden relative ${zoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`} onClick={() => setZoomed(!zoomed)}>
                        {product.images[activeImg] ? (
                            <>
                                <img src={product.images[activeImg]} alt={product.name} className={`w-full h-full object-cover transition-transform duration-700 ${zoomed ? "scale-150" : "scale-100 hover:scale-105"}`} />
                                <div className={`absolute inset-0 pointer-events-none transition-all duration-700 mix-blend-color ${colorTemp.overlay}`} />
                            </>
                        ) : (
                            <div className="w-full h-full flex items-center justify-center text-muted2 text-sm">No image</div>
                        )}
                        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 bg-charcoal/80 backdrop-blur-md text-ivory text-[9px] sm:text-[10px] tracking-editorial px-2.5 py-1 pointer-events-none">
                            {colorTemp.kelvin} · {colorTemp.name}
                        </div>
                    </div>
                    {product.images.length > 1 && (
                        <div className="mt-3 sm:mt-4 grid grid-cols-4 gap-2 sm:gap-3">
                            {product.images.map((im, i) => (
                                <button key={i} data-testid={`gallery-thumb-${i}`} onClick={() => setActiveImg(i)} className={`aspect-square overflow-hidden border ${activeImg === i ? "border-amber2" : "border-transparent"}`}>
                                    <img src={im} alt="" loading="lazy" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}

                    {/* Light Temperature Visualizer */}
                    <div className="mt-4 sm:mt-6 p-3 sm:p-4 bg-ivory-2 border border-[#E5E3DC]">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-xs tracking-editorial text-charcoal flex items-center gap-1.5 font-medium">
                                <Sparkles size={13} className="text-amber2" /> Ambiance & Colour Temp
                            </span>
                            <span className="text-[11px] text-muted2 font-mono">{colorTemp.kelvin}</span>
                        </div>
                        <div className="grid grid-cols-3 gap-1.5 sm:gap-2 mt-2">
                            {TEMPS.map((t) => (
                                <button
                                    key={t.id}
                                    type="button"
                                    data-testid={`temp-toggle-${t.id}`}
                                    onClick={() => setTemp(t.id)}
                                    className={`py-2 px-1.5 sm:px-2 text-xs text-center border transition-all ${
                                        temp === t.id
                                            ? "bg-charcoal text-ivory border-charcoal shadow-sm"
                                            : "border-charcoal/20 bg-ivory hover:border-amber2 text-charcoal/80"
                                    }`}
                                >
                                    <div className="font-medium text-[10px] sm:text-[11px]">{t.label}</div>
                                    <div className="text-[8px] sm:text-[9px] opacity-70 mt-0.5">{t.name}</div>
                                </button>
                            ))}
                        </div>
                        <div className="text-[10px] sm:text-[11px] text-charcoal/70 mt-2 sm:mt-2.5 leading-snug">
                            {colorTemp.hint}
                        </div>
                    </div>
                </div>

                <div className="lg:sticky lg:top-32 self-start">
                    {product.category && <div className="tracking-editorial text-muted2 mb-2 sm:mb-3 capitalize text-xs">{product.category.replace(/-/g, " ")}</div>}
                    <h1 className="font-serif text-2xl sm:text-4xl md:text-5xl leading-tight">{product.name}</h1>

                    <div className="mt-2.5 sm:mt-3 flex items-center gap-2 sm:gap-3 text-xs sm:text-sm">
                        <div className="flex items-center gap-0.5 text-amber2">
                            {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={13} fill={n <= Math.round(avg) ? "currentColor" : "none"} strokeWidth={1.5} />)}
                        </div>
                        <span className="text-muted2">{avg} · {REVIEWS.length} reviews</span>
                    </div>

                    <div className="mt-4 sm:mt-6 flex items-baseline gap-3">
                        <div data-testid="product-price" className="text-xl sm:text-2xl font-serif">{formatINR(currentPrice)}</div>
                        {product.compareAtPrice > currentPrice && (
                            <div className="text-xs sm:text-sm text-muted2 line-through">{formatINR(product.compareAtPrice)}</div>
                        )}
                    </div>
                    <div className="text-[11px] sm:text-xs text-muted2 mt-1">Inclusive of GST · Complimentary shipping across India</div>
                    {product.description && <p className="mt-4 sm:mt-6 text-charcoal/75 leading-relaxed whitespace-pre-line text-xs sm:text-base">{product.description}</p>}

                    {hasMultipleVariants && (
                        <div className="mt-6 sm:mt-8">
                            <div className="tracking-editorial mb-2 sm:mb-3 text-xs">Options</div>
                            <div className="flex flex-wrap gap-2">
                                {product.variants.map((v) => (
                                    <button
                                        key={v.id}
                                        data-testid={`variant-${v.id.split("/").pop()}`}
                                        onClick={() => setVariantId(v.id)}
                                        disabled={!v.availableForSale}
                                        className={`px-3 sm:px-4 py-2 text-xs sm:text-sm border transition-colors ${variantId === v.id ? "bg-charcoal text-ivory border-charcoal" : "border-charcoal/20 hover:border-amber2 hover:text-amber2"} ${!v.availableForSale ? "opacity-40 line-through" : ""}`}
                                    >
                                        {v.title}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="mt-6 sm:mt-8 flex flex-wrap sm:flex-nowrap items-center gap-3 sm:gap-4">
                        <div className="flex items-center border border-charcoal/20 order-1">
                            <button data-testid="qty-decrease" onClick={() => setQty(Math.max(1, qty - 1))} className="px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-ivory-2 text-sm">−</button>
                            <span className="px-3 sm:px-4 py-2.5 sm:py-3 min-w-[2.5rem] sm:min-w-[3rem] text-center text-sm">{qty}</span>
                            <button data-testid="qty-increase" onClick={() => setQty(qty + 1)} className="px-3 sm:px-4 py-2.5 sm:py-3 hover:bg-ivory-2 text-sm">+</button>
                        </div>
                        <button data-testid="wishlist-btn" onClick={wishlist} className="p-3 sm:p-3.5 border border-charcoal/20 hover:border-amber2 hover:text-amber2 order-2 sm:order-3" aria-label="Add to wishlist">
                            <Heart size={16} />
                        </button>
                        <button data-testid="add-to-cart-btn" onClick={add} disabled={cartLoading || !product.availableForSale} className="w-full sm:flex-1 bg-charcoal text-ivory py-3.5 sm:py-4 tracking-editorial hover:bg-amber2 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 order-3 sm:order-2 text-xs sm:text-sm">
                            <ShoppingBag size={14} /> {product.availableForSale ? (cartLoading ? "Adding…" : "Add to bag") : "Sold out"}
                        </button>
                    </div>

                    <div className="mt-5 sm:mt-6 grid grid-cols-2 gap-2 sm:gap-3">
                        {[
                            [<Truck size={14} className="text-amber2 shrink-0" />, "Complimentary shipping"],
                            [<RotateCcw size={14} className="text-amber2 shrink-0" />, "48-hr claim window"],
                            [<Sparkles size={14} className="text-amber2 shrink-0" />, "Carefully packed"],
                            [<Lock size={14} className="text-amber2 shrink-0" />, "Secure checkout"],
                        ].map(([Icon, t], i) => (
                            <div key={i} className="flex items-center gap-2 text-[11px] sm:text-xs bg-ivory-2 px-2.5 sm:px-3 py-2 sm:py-2.5">
                                {Icon}<span className="truncate">{t}</span>
                            </div>
                        ))}
                    </div>

                    <div className="mt-8 sm:mt-10 space-y-3 sm:space-y-4 border-t border-[#E5E3DC] pt-6 sm:pt-8">
                        <div className="flex items-start gap-3 sm:gap-4">
                            <Truck size={16} className="mt-1 text-amber2 shrink-0" />
                            <div>
                                <div className="text-xs sm:text-sm font-medium">Complimentary shipping across India</div>
                                <div className="text-[11px] sm:text-xs text-muted2 mt-0.5">Dispatched in 48 hours · 5–6 working days delivery</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-3 sm:gap-4">
                            <Sparkles size={16} className="mt-1 text-amber2 shrink-0" />
                            <div>
                                <div className="text-xs sm:text-sm font-medium">Carefully packed & inspected</div>
                                <div className="text-[11px] sm:text-xs text-muted2 mt-0.5">Record an unboxing video to enable easy replacement</div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-6 sm:mt-8 flex items-center gap-2 sm:gap-3 text-[9px] sm:text-[10px] tracking-editorial text-muted2 flex-wrap">
                        <span>Pay securely with</span>
                        <span className="px-2 py-0.5 border border-charcoal/20 rounded">UPI</span>
                        <span className="px-2 py-0.5 border border-charcoal/20 rounded">Cards</span>
                        <span className="px-2 py-0.5 border border-charcoal/20 rounded">Netbanking</span>
                    </div>
                </div>
            </div>

            <section className="border-t border-[#E5E3DC] py-14 sm:py-20 md:py-24 bg-ivory-2">
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10">
                    <div className="flex flex-wrap items-end justify-between mb-8 sm:mb-12 gap-4">
                        <div>
                            <div className="tracking-editorial text-muted2 mb-2 sm:mb-4 text-xs">Verified Reviews</div>
                            <h2 className="font-serif text-3xl sm:text-4xl md:text-5xl">Owned. Reviewed.</h2>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3">
                            <div className="flex items-center gap-0.5 text-amber2">
                                {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={15} fill={n <= Math.round(avg) ? "currentColor" : "none"} strokeWidth={1.5} />)}
                            </div>
                            <span className="font-serif text-xl sm:text-2xl">{avg}</span>
                            <span className="text-muted2 text-xs sm:text-sm">/ 5 · {REVIEWS.length} reviews</span>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-4 sm:gap-6">
                        {REVIEWS.map((r, i) => (
                            <div key={i} data-testid={`review-${i}`} className="bg-ivory p-4 sm:p-6">
                                <div className="flex items-center gap-1 text-amber2 mb-2 sm:mb-3">
                                    {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={12} fill={n <= r.rating ? "currentColor" : "none"} strokeWidth={1.5} />)}
                                </div>
                                <div className="font-serif text-lg sm:text-xl mb-1.5 sm:mb-2">{r.title}</div>
                                <p className="text-xs sm:text-sm text-charcoal/75 leading-relaxed">{r.body}</p>
                                {r.photo && (
                                    <div className="mt-3 sm:mt-4 aspect-[4/3] overflow-hidden">
                                        <img src={r.photo} alt="Customer photo" loading="lazy" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="mt-4 sm:mt-5 pt-3 sm:pt-4 border-t border-[#E5E3DC] flex items-center justify-between text-[11px] sm:text-xs">
                                    <span className="font-medium">{r.name} · <span className="text-muted2">{r.city}</span></span>
                                    {r.verified && <span className="tracking-editorial text-amber2">Verified buyer</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {related.length > 0 && (
                <section className="border-t border-[#E5E3DC] py-14 sm:py-20 md:py-24">
                    <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10">
                        <h2 className="font-serif text-2xl sm:text-3xl md:text-4xl mb-6 sm:mb-10">You may also love</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6 md:gap-10">
                            {related.map((p) => <ProductCard key={p.id} product={p} />)}
                        </div>
                    </div>
                </section>
            )}
            <RecentlyViewed excludeSlug={product.slug} />
        </div>
    );
}
