import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Trash2, ArrowRight, ExternalLink } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/api";

import { useState } from "react";

export default function Cart() {
    const { items, removeItem, updateQty, total, loading } = useCart();
    const navigate = useNavigate();

    const handleCheckout = () => {
        navigate("/checkout");
    };

    if (items.length === 0) {
        return (
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-20 sm:py-32 text-center">
                <div className="tracking-editorial text-muted2 mb-3 sm:mb-4 text-xs">Your bag is empty</div>
                <h1 className="font-serif text-3xl sm:text-4xl md:text-5xl mb-8 sm:mb-10">Nothing here — yet.</h1>
                <Link to="/shop/chandeliers" data-testid="empty-cart-cta" className="inline-flex items-center gap-3 bg-charcoal text-ivory px-6 sm:px-8 py-3.5 sm:py-4 hover:bg-amber2 transition-colors text-xs sm:text-sm">
                    <span className="tracking-editorial">Explore the collection</span>
                    <ArrowRight size={14} />
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-8 sm:py-16">
            <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl mb-6 sm:mb-12">Your Bag</h1>
            <div className="grid lg:grid-cols-[1fr_400px] gap-8 lg:gap-12">
                <div className="divide-y divide-[#E5E3DC]">
                    {items.map((i) => (
                        <div key={i.lineId} data-testid={`cart-item-${i.productHandle || i.lineId}`} className="flex flex-col sm:flex-row gap-4 sm:gap-6 py-5 sm:py-6">
                            <div className="flex gap-3 sm:gap-6 flex-1 min-w-0">
                                <Link to={`/product/${i.productHandle}`} className="w-20 h-24 sm:w-28 sm:h-32 bg-ivory-2 overflow-hidden shrink-0">
                                    {i.image && <img src={i.image} alt={i.name} className="w-full h-full object-cover" />}
                                </Link>
                                <div className="flex-1 flex flex-col min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                        <Link to={`/product/${i.productHandle}`} className="font-serif text-base sm:text-2xl truncate">{i.name}</Link>
                                        <div className="font-serif text-sm sm:text-lg sm:hidden shrink-0">{formatINR(i.price * i.quantity)}</div>
                                    </div>
                                    {i.variantTitle && i.variantTitle !== "Default Title" && (
                                        <div className="text-[11px] sm:text-xs text-muted2 mt-0.5 truncate">{i.variantTitle}</div>
                                    )}
                                    <div className="text-xs sm:text-sm text-muted2 mt-0.5 sm:mt-1">{formatINR(i.price)}</div>
                                    <div className="mt-auto pt-3 flex items-center justify-between">
                                        <div className="flex items-center border border-charcoal/20">
                                            <button onClick={() => updateQty(i.lineId, i.quantity - 1)} disabled={loading} className="px-2.5 sm:px-3 py-1 sm:py-2 hover:bg-ivory-2 disabled:opacity-50 text-xs sm:text-sm">−</button>
                                            <span className="px-2 sm:px-3 min-w-[2rem] sm:min-w-[2.5rem] text-center text-xs sm:text-sm">{i.quantity}</span>
                                            <button onClick={() => updateQty(i.lineId, i.quantity + 1)} disabled={loading} className="px-2.5 sm:px-3 py-1 sm:py-2 hover:bg-ivory-2 disabled:opacity-50 text-xs sm:text-sm">+</button>
                                        </div>
                                        <button data-testid={`cart-remove-${i.productHandle || i.lineId}`} onClick={() => removeItem(i.lineId)} disabled={loading} className="text-muted2 hover:text-amber2 flex items-center gap-1.5 text-xs tracking-editorial disabled:opacity-50">
                                            <Trash2 size={13} /> Remove
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <div className="hidden sm:block font-serif text-lg self-start">{formatINR(i.price * i.quantity)}</div>
                        </div>
                    ))}
                </div>

                <aside className="lg:sticky lg:top-32 self-start bg-ivory-2 p-5 sm:p-8">
                    <div className="tracking-editorial mb-4 sm:mb-6 text-xs sm:text-sm font-medium">Order Summary</div>

                    <div className="space-y-2.5 sm:space-y-3 text-xs sm:text-sm">
                        <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(total)}</span></div>
                        <div className="flex justify-between text-muted2"><span>Shipping</span><span>Complimentary across India</span></div>
                        <div className="flex justify-between text-muted2"><span>Discounts</span><span>Applied at checkout</span></div>
                    </div>
                    <div className="mt-5 sm:mt-6 pt-5 sm:pt-6 border-t border-charcoal/20 flex justify-between font-serif text-lg sm:text-xl">
                        <span>Total</span><span data-testid="cart-total">{formatINR(total)}</span>
                    </div>
                    <button
                        onClick={handleCheckout}
                        disabled={loading}
                        data-testid="checkout-cta"
                        className="mt-6 sm:mt-8 w-full bg-charcoal text-ivory py-3.5 sm:py-4 tracking-editorial hover:bg-amber2 transition-colors flex items-center justify-center gap-2 text-xs sm:text-sm"
                    >
                        Proceed to Secure Checkout <ArrowRight size={14} />
                    </button>
                    <div className="mt-3 sm:mt-4 text-[10px] sm:text-xs text-muted2 text-center">Complimentary India Shipping · Cards, UPI, Netbanking</div>
                </aside>
            </div>
        </div>
    );
}
