import { Link } from "react-router-dom";
import { toast } from "sonner";
import { Trash2, ArrowRight, ExternalLink } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/api";

export default function Cart() {
    const { items, removeItem, updateQty, total, checkoutUrl, loading } = useCart();

    const handleCheckout = () => {
        console.log("Shopify checkoutUrl:", checkoutUrl);
        if (!checkoutUrl) {
            console.error("Shopify checkoutUrl missing", { itemCount: items.length });
            toast.error("Preparing checkout — please try again in a moment.");
            return;
        }
        window.location.href = checkoutUrl;
    };

    if (items.length === 0) {
        return (
            <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-32 text-center">
                <div className="tracking-editorial text-muted2 mb-4">Your bag is empty</div>
                <h1 className="font-serif text-4xl md:text-5xl mb-10">Nothing here — yet.</h1>
                <Link to="/shop/chandeliers" data-testid="empty-cart-cta" className="inline-flex items-center gap-3 bg-charcoal text-ivory px-8 py-4 hover:bg-amber2 transition-colors">
                    <span className="tracking-editorial">Explore the collection</span>
                    <ArrowRight size={14} />
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16">
            <h1 className="font-serif text-5xl md:text-6xl mb-12">Your Bag</h1>
            <div className="grid lg:grid-cols-[1fr_400px] gap-12">
                <div className="divide-y divide-[#E5E3DC]">
                    {items.map((i) => (
                        <div key={i.lineId} data-testid={`cart-item-${i.productHandle || i.lineId}`} className="flex gap-6 py-6">
                            <Link to={`/product/${i.productHandle}`} className="w-28 h-32 bg-ivory-2 overflow-hidden shrink-0">
                                {i.image && <img src={i.image} alt={i.name} className="w-full h-full object-cover" />}
                            </Link>
                            <div className="flex-1 flex flex-col">
                                <Link to={`/product/${i.productHandle}`} className="font-serif text-2xl">{i.name}</Link>
                                {i.variantTitle && i.variantTitle !== "Default Title" && (
                                    <div className="text-xs text-muted2 mt-0.5">{i.variantTitle}</div>
                                )}
                                <div className="text-sm text-muted2 mt-1">{formatINR(i.price)}</div>
                                <div className="mt-auto flex items-center justify-between">
                                    <div className="flex items-center border border-charcoal/20">
                                        <button onClick={() => updateQty(i.lineId, i.quantity - 1)} disabled={loading} className="px-3 py-2 hover:bg-ivory-2 disabled:opacity-50">−</button>
                                        <span className="px-3 min-w-[2.5rem] text-center text-sm">{i.quantity}</span>
                                        <button onClick={() => updateQty(i.lineId, i.quantity + 1)} disabled={loading} className="px-3 py-2 hover:bg-ivory-2 disabled:opacity-50">+</button>
                                    </div>
                                    <button data-testid={`cart-remove-${i.productHandle || i.lineId}`} onClick={() => removeItem(i.lineId)} disabled={loading} className="text-muted2 hover:text-amber2 flex items-center gap-2 text-xs tracking-editorial disabled:opacity-50">
                                        <Trash2 size={14} /> Remove
                                    </button>
                                </div>
                            </div>
                            <div className="font-serif text-lg self-start">{formatINR(i.price * i.quantity)}</div>
                        </div>
                    ))}
                </div>

                <aside className="lg:sticky lg:top-32 self-start bg-ivory-2 p-8">
                    <div className="tracking-editorial mb-6">Order Summary</div>

                    <div className="space-y-3 text-sm">
                        <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(total)}</span></div>
                        <div className="flex justify-between text-muted2"><span>Shipping</span><span>Complimentary across India</span></div>
                        <div className="flex justify-between text-muted2"><span>Discounts</span><span>Applied at checkout</span></div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-charcoal/20 flex justify-between font-serif text-xl">
                        <span>Total</span><span data-testid="cart-total">{formatINR(total)}</span>
                    </div>
                    {checkoutUrl ? (
                        <button
                            onClick={handleCheckout}
                            data-testid="checkout-cta"
                            className="mt-8 w-full bg-charcoal text-ivory py-4 tracking-editorial hover:bg-amber2 transition-colors flex items-center justify-center gap-2"
                        >
                            Secure Checkout <ExternalLink size={14} />
                        </button>
                    ) : (
                        <div className="mt-8 text-sm text-muted2 text-center">Preparing checkout…</div>
                    )}
                    <div className="mt-4 text-xs text-muted2 text-center">Secure Shopify checkout · UPI, Cards, Netbanking</div>
                </aside>
            </div>
        </div>
    );
}
