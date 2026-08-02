import { Link } from "react-router-dom";
import { Trash2, ArrowRight } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { formatINR } from "@/lib/api";

export default function Cart() {
    const { items, removeItem, updateQty, total } = useCart();

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
                        <div key={i.id} data-testid={`cart-item-${i.slug}`} className="flex gap-6 py-6">
                            <Link to={`/product/${i.slug}`} className="w-28 h-32 bg-ivory-2 overflow-hidden shrink-0">
                                <img src={i.image} alt={i.name} className="w-full h-full object-cover" />
                            </Link>
                            <div className="flex-1 flex flex-col">
                                <Link to={`/product/${i.slug}`} className="font-serif text-2xl">{i.name}</Link>
                                <div className="text-sm text-muted2 mt-1">{formatINR(i.price)}</div>
                                <div className="mt-auto flex items-center justify-between">
                                    <div className="flex items-center border border-charcoal/20">
                                        <button data-testid={`cart-qty-dec-${i.slug}`} onClick={() => updateQty(i.id, i.quantity - 1)} className="px-3 py-2 hover:bg-ivory-2">−</button>
                                        <span data-testid={`cart-qty-${i.slug}`} className="px-3 min-w-[2.5rem] text-center text-sm">{i.quantity}</span>
                                        <button data-testid={`cart-qty-inc-${i.slug}`} onClick={() => updateQty(i.id, i.quantity + 1)} className="px-3 py-2 hover:bg-ivory-2">+</button>
                                    </div>
                                    <button data-testid={`cart-remove-${i.slug}`} onClick={() => removeItem(i.id)} className="text-muted2 hover:text-amber2 flex items-center gap-2 text-xs tracking-editorial">
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
                        <div className="flex justify-between text-muted2"><span>Shipping</span><span>{total > 50000 ? "Complimentary" : formatINR(1200)}</span></div>
                    </div>
                    <div className="mt-6 pt-6 border-t border-charcoal/20 flex justify-between font-serif text-xl">
                        <span>Total</span><span data-testid="cart-total">{formatINR(total + (total > 50000 ? 0 : 1200))}</span>
                    </div>
                    <Link to="/checkout" data-testid="checkout-cta" className="mt-8 w-full bg-charcoal text-ivory py-4 tracking-editorial hover:bg-amber2 transition-colors flex items-center justify-center gap-2">
                        Checkout <ArrowRight size={14} />
                    </Link>
                    <div className="mt-4 text-xs text-muted2 text-center">Secure payment via Razorpay · UPI, Cards, Netbanking</div>
                </aside>
            </div>
        </div>
    );
}
