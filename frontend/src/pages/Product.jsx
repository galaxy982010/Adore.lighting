import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { toast } from "sonner";
import { Heart, ShoppingBag, Truck, Sparkles, Shield, RotateCcw, Star, Lock } from "lucide-react";
import { api, formatINR } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import ProductCard from "@/components/ProductCard";

const REVIEWS = [
    { name: "Ananya S.", city: "Mumbai", rating: 5, title: "Elevated the entire foyer", body: "The scale and finish is exactly as photographed. The installation team was punctual and precise. Worth every rupee.", verified: true, photo: "https://images.unsplash.com/photo-1706820229870-f9a8c6dac193?w=400&q=85" },
    { name: "Rohan M.", city: "Bengaluru", rating: 5, title: "Best-in-class craft", body: "Compared with three other studios before ordering — no one else's finish came close. The brass ages beautifully.", verified: true },
    { name: "Priya K.", city: "Delhi", rating: 4, title: "Beautiful, patient studio", body: "They took extra time to match the finish to my existing hardware. Slightly delayed but flawless once here.", verified: true, photo: "https://images.unsplash.com/photo-1648415198825-7c805bfa043e?w=400&q=85" },
];

export default function Product() {
    const { slug } = useParams();
    const [product, setProduct] = useState(null);
    const [related, setRelated] = useState([]);
    const [activeImg, setActiveImg] = useState(0);
    const [qty, setQty] = useState(1);
    const [temp, setTemp] = useState("warm");
    const [zoomed, setZoomed] = useState(false);
    const { addItem } = useCart();
    const { user } = useAuth();

    useEffect(() => {
        api.get(`/products/${slug}`).then((r) => {
            setProduct(r.data);
            setActiveImg(0);
            api.get("/products", { params: { category: r.data.category } }).then((rr) => {
                setRelated(rr.data.filter((p) => p.id !== r.data.id).slice(0, 4));
            });
        });
    }, [slug]);

    if (!product) return <div className="py-40 text-center text-muted2">Loading…</div>;

    const add = () => {
        addItem(product, qty);
        toast.success("Added to cart");
    };

    const wishlist = async () => {
        if (!user) return toast.error("Sign in to save favourites", { action: { label: "Sign in", onClick: () => (window.location.href = "/auth") } });
        try {
            await api.post(`/wishlist/${product.id}`);
            toast.success("Saved to wishlist");
        } catch {
            toast.error("Please try again");
        }
    };

    const avg = (REVIEWS.reduce((s, r) => s + r.rating, 0) / REVIEWS.length).toFixed(1);

    return (
        <div>
            <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-10 text-xs tracking-editorial text-muted2">
                <Link to="/">Home</Link> · <Link to={`/shop/${product.category}`}>{product.category}</Link> · <span className="text-charcoal">{product.name}</span>
            </div>

            <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-8 pb-24 grid lg:grid-cols-[1.15fr_1fr] gap-12 lg:gap-20">
                {/* Gallery */}
                <div>
                    <div className={`aspect-[4/5] bg-ivory-2 overflow-hidden ${zoomed ? "cursor-zoom-out" : "cursor-zoom-in"}`} onClick={() => setZoomed(!zoomed)}>
                        <img src={product.images[activeImg]} alt={product.name} className={`w-full h-full object-cover transition-transform duration-700 ${zoomed ? "scale-150" : "scale-100 hover:scale-105"}`} />
                    </div>
                    {product.images.length > 1 && (
                        <div className="mt-4 grid grid-cols-4 gap-3">
                            {product.images.map((im, i) => (
                                <button key={i} data-testid={`gallery-thumb-${i}`} onClick={() => setActiveImg(i)} className={`aspect-square overflow-hidden border ${activeImg === i ? "border-amber2" : "border-transparent"}`}>
                                    <img src={im} alt="" loading="lazy" className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                    {/* Room shot */}
                    <div className="mt-8">
                        <div className="tracking-editorial text-muted2 mb-3">See it in a room</div>
                        <div className="aspect-[16/10] overflow-hidden bg-ivory-2">
                            <img src="https://images.unsplash.com/photo-1706820229870-f9a8c6dac193?w=1600&q=85" alt="Styled in room" loading="lazy" className="w-full h-full object-cover" />
                        </div>
                    </div>
                </div>

                {/* Details */}
                <div className="lg:sticky lg:top-32 self-start">
                    <div className="tracking-editorial text-muted2 mb-3">{product.category}</div>
                    <h1 className="font-serif text-4xl md:text-5xl leading-tight">{product.name}</h1>

                    {/* Rating */}
                    <div className="mt-3 flex items-center gap-3 text-sm">
                        <div className="flex items-center gap-0.5 text-amber2">
                            {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={14} fill={n <= Math.round(avg) ? "currentColor" : "none"} strokeWidth={1.5} />)}
                        </div>
                        <span className="text-muted2">{avg} · {REVIEWS.length} reviews</span>
                    </div>

                    <div className="mt-6 text-2xl font-serif">{formatINR(product.price)}</div>
                    <div className="text-xs text-muted2 mt-1">Inclusive of GST · EMI available on checkout</div>
                    <p className="mt-6 text-charcoal/75 leading-relaxed">{product.description}</p>

                    {/* Warm/Cool toggle */}
                    <div className="mt-8">
                        <div className="tracking-editorial mb-3">Colour temperature</div>
                        <div className="inline-flex border border-charcoal/20">
                            <button data-testid="temp-warm" onClick={() => setTemp("warm")} className={`px-5 py-2 text-sm tracking-editorial ${temp === "warm" ? "bg-charcoal text-ivory" : "hover:bg-ivory-2"}`}>Warm White · 2700K</button>
                            <button data-testid="temp-cool" onClick={() => setTemp("cool")} className={`px-5 py-2 text-sm tracking-editorial border-l border-charcoal/20 ${temp === "cool" ? "bg-charcoal text-ivory" : "hover:bg-ivory-2"}`}>Cool White · 4000K</button>
                        </div>
                    </div>

                    {/* Qty + Actions */}
                    <div className="mt-8 flex items-center gap-4">
                        <div className="flex items-center border border-charcoal/20">
                            <button data-testid="qty-decrease" onClick={() => setQty(Math.max(1, qty - 1))} className="px-4 py-3 hover:bg-ivory-2">−</button>
                            <span className="px-4 py-3 min-w-[3rem] text-center">{qty}</span>
                            <button data-testid="qty-increase" onClick={() => setQty(qty + 1)} className="px-4 py-3 hover:bg-ivory-2">+</button>
                        </div>
                        <button data-testid="add-to-cart-btn" onClick={add} className="flex-1 bg-charcoal text-ivory py-4 tracking-editorial hover:bg-amber2 transition-colors flex items-center justify-center gap-2">
                            <ShoppingBag size={14} /> Add to bag
                        </button>
                        <button data-testid="wishlist-btn" onClick={wishlist} className="p-4 border border-charcoal/20 hover:border-amber2 hover:text-amber2" aria-label="Add to wishlist">
                            <Heart size={16} />
                        </button>
                    </div>

                    {/* Trust badges */}
                    <div className="mt-6 grid grid-cols-2 gap-3">
                        {[
                            [<Truck size={14} className="text-amber2" />, "Free shipping ₹50k+"],
                            [<Shield size={14} className="text-amber2" />, "5-year warranty"],
                            [<RotateCcw size={14} className="text-amber2" />, "14-day returns"],
                            [<Lock size={14} className="text-amber2" />, "Secure Razorpay checkout"],
                        ].map(([Icon, t], i) => (
                            <div key={i} className="flex items-center gap-2 text-xs bg-ivory-2 px-3 py-2.5">
                                {Icon}<span>{t}</span>
                            </div>
                        ))}
                    </div>

                    {/* Meta */}
                    <div className="mt-10 space-y-4 border-t border-[#E5E3DC] pt-8">
                        <div className="flex items-start gap-4">
                            <Truck size={16} className="mt-1 text-amber2" />
                            <div>
                                <div className="text-sm font-medium">White-glove delivery & installation</div>
                                <div className="text-xs text-muted2 mt-1">6–14 working days · complimentary above ₹50,000</div>
                            </div>
                        </div>
                        <div className="flex items-start gap-4">
                            <Sparkles size={16} className="mt-1 text-amber2" />
                            <div>
                                <div className="text-sm font-medium">Repair & re-finish service</div>
                                <div className="text-xs text-muted2 mt-1">Bring any Adore piece back to us — we'll restore it</div>
                            </div>
                        </div>
                    </div>

                    {/* Payment icons */}
                    <div className="mt-8 flex items-center gap-3 text-[10px] tracking-editorial text-muted2">
                        <span>Pay securely with</span>
                        <span className="px-2 py-1 border border-charcoal/20 rounded">UPI</span>
                        <span className="px-2 py-1 border border-charcoal/20 rounded">Cards</span>
                        <span className="px-2 py-1 border border-charcoal/20 rounded">Netbanking</span>
                        <span className="px-2 py-1 border border-charcoal/20 rounded">EMI</span>
                    </div>

                    {/* Specs */}
                    <div className="mt-12">
                        <div className="tracking-editorial mb-4">Specifications</div>
                        <table className="w-full text-sm">
                            <tbody className="divide-y divide-[#E5E3DC]">
                                {product.dimensions && <tr><td className="py-3 text-muted2 w-1/3">Dimensions</td><td className="py-3">{product.dimensions}</td></tr>}
                                {product.material && <tr><td className="py-3 text-muted2">Material</td><td className="py-3">{product.material}</td></tr>}
                                {product.finish && <tr><td className="py-3 text-muted2">Finish</td><td className="py-3">{product.finish}</td></tr>}
                                {product.bulb_type && <tr><td className="py-3 text-muted2">Bulb</td><td className="py-3">{product.bulb_type}</td></tr>}
                                {product.style && <tr><td className="py-3 text-muted2">Style</td><td className="py-3">{product.style}</td></tr>}
                                <tr><td className="py-3 text-muted2">Colour temp.</td><td className="py-3 capitalize">{temp} white · {temp === "warm" ? "2700K" : "4000K"}</td></tr>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            {/* REVIEWS */}
            <section className="border-t border-[#E5E3DC] py-24 bg-ivory-2">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                    <div className="flex flex-wrap items-end justify-between mb-12 gap-4">
                        <div>
                            <div className="tracking-editorial text-muted2 mb-4">Verified Reviews</div>
                            <h2 className="font-serif text-4xl md:text-5xl">Owned. Reviewed.</h2>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="flex items-center gap-0.5 text-amber2">
                                {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={16} fill={n <= Math.round(avg) ? "currentColor" : "none"} strokeWidth={1.5} />)}
                            </div>
                            <span className="font-serif text-2xl">{avg}</span>
                            <span className="text-muted2 text-sm">/ 5 · {REVIEWS.length} reviews</span>
                        </div>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {REVIEWS.map((r, i) => (
                            <div key={i} data-testid={`review-${i}`} className="bg-ivory p-6">
                                <div className="flex items-center gap-1 text-amber2 mb-3">
                                    {[1, 2, 3, 4, 5].map((n) => <Star key={n} size={12} fill={n <= r.rating ? "currentColor" : "none"} strokeWidth={1.5} />)}
                                </div>
                                <div className="font-serif text-xl mb-2">{r.title}</div>
                                <p className="text-sm text-charcoal/75 leading-relaxed">{r.body}</p>
                                {r.photo && (
                                    <div className="mt-4 aspect-[4/3] overflow-hidden">
                                        <img src={r.photo} alt="Customer photo" loading="lazy" className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="mt-5 pt-4 border-t border-[#E5E3DC] flex items-center justify-between text-xs">
                                    <span className="font-medium">{r.name} · <span className="text-muted2">{r.city}</span></span>
                                    {r.verified && <span className="tracking-editorial text-amber2">Verified buyer</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Shop the room / related */}
            {related.length > 0 && (
                <section className="border-t border-[#E5E3DC] py-24">
                    <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                        <h2 className="font-serif text-3xl md:text-4xl mb-10">You may also love</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-10">
                            {related.map((p) => <ProductCard key={p.id} product={p} />)}
                        </div>
                    </div>
                </section>
            )}
        </div>
    );
}
