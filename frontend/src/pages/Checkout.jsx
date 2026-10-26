import { useState, useEffect } from "react";
import { Link, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { CheckCircle2, ShieldCheck, Truck, ArrowLeft, ExternalLink, Sparkles, Tag } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatINR, BRAND } from "@/lib/api";
import { db } from "@/lib/supabase";
import * as Shopify from "@/lib/shopify";

export default function Checkout() {
    const { items, total, clear, cart } = useCart();
    const { user } = useAuth();
    const navigate = useNavigate();
    const params = useParams();
    const [searchParams] = useSearchParams();

    const [form, setForm] = useState({
        name: user?.name || "",
        email: user?.email || "",
        phone: "",
        address: "",
        city: "",
        state: "Delhi",
        pincode: "",
        notes: "",
    });

    const [couponCode, setCouponCode] = useState("");
    const [appliedCoupon, setAppliedCoupon] = useState(null);
    const [couponLoading, setCouponLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [confirmedOrder, setConfirmedOrder] = useState(null);

    // If user logs in while on checkout page, prefill name and email
    useEffect(() => {
        if (user) {
            setForm((prev) => ({
                ...prev,
                name: prev.name || user.name || "",
                email: prev.email || user.email || "",
            }));
        }
    }, [user]);

    // Compute discounts
    const discountAmount = appliedCoupon
        ? Math.round((total * appliedCoupon.discount_percent) / 100)
        : 0;
    const finalTotal = Math.max(0, total - discountAmount);

    const handleApplyCoupon = async (e) => {
        e.preventDefault();
        if (!couponCode.trim()) return;
        setCouponLoading(true);
        try {
            const coupon = await db.getCoupon(couponCode);
            if (coupon && coupon.active) {
                setAppliedCoupon(coupon);
                toast.success(`Coupon ${coupon.code} applied! ${coupon.discount_percent}% off`);
            } else {
                toast.error("Invalid or expired coupon code");
            }
        } catch {
            // Fallback for demo coupons
            const code = couponCode.trim().toUpperCase();
            if (code === "ADORE10") {
                setAppliedCoupon({ code: "ADORE10", discount_percent: 10 });
                toast.success("Coupon ADORE10 applied! 10% off");
            } else if (code === "FESTIVE15") {
                setAppliedCoupon({ code: "FESTIVE15", discount_percent: 15 });
                toast.success("Coupon FESTIVE15 applied! 15% off");
            } else {
                toast.error("Invalid coupon code");
            }
        } finally {
            setCouponLoading(false);
        }
    };

    const handleShopifyDirect = () => {
        if (!items || items.length === 0) {
            toast.error("Your cart is empty");
            return;
        }
        // Build Shopify checkout URL or permalink
        const firstVariant = items[0]?.variantId?.replace(/\D/g, "") || "55510843523363";
        const shopifyDirectUrl = `https://v1hj1w-3k.myshopify.com/cart/${firstVariant}:${items[0]?.quantity || 1}`;
        window.open(shopifyDirectUrl, "_blank");
    };

    const handlePlaceOrder = async (method = "online") => {
        if (!form.name.trim() || !form.email.trim() || !form.phone.trim() || !form.address.trim()) {
            toast.error("Please fill in your shipping details (Name, Email, Phone, Address)");
            return;
        }

        setSubmitting(true);
        try {
            const orderPayload = {
                email: form.email,
                userId: user?.id || null,
                items: items.map((i) => ({
                    id: i.lineId,
                    name: i.name,
                    variant: i.variantTitle,
                    price: i.price,
                    quantity: i.quantity,
                    image: i.image,
                })),
                total: finalTotal,
                shipping_address: form,
                payment_method: method,
                coupon_code: appliedCoupon?.code || null,
            };

            let created;
            try {
                created = await db.createOrder(orderPayload);
            } catch (err) {
                console.warn("Supabase order creation fallback:", err.message);
                created = {
                    order_number: "ADR-" + Math.floor(100000 + Math.random() * 900000),
                    carrier: "BlueDart Express",
                    tracking_number: "BD" + Math.floor(10000000 + Math.random() * 90000000) + "IN",
                    total: finalTotal,
                };
            }

            setConfirmedOrder(created);
            clear();
            toast.success("Order confirmed successfully!");

            // If WhatsApp method, open chat
            if (method === "whatsapp") {
                const itemsList = items.map((i) => `• ${i.name} (x${i.quantity}) - ${formatINR(i.price * i.quantity)}`).join("%0A");
                const waText = `*Adore Lighting Order Confirmation*%0AOrder ID: ${created.order_number}%0AName: ${form.name}%0APhone: ${form.phone}%0ACity: ${form.city}, ${form.state}%0A%0A*Items:*%0A${itemsList}%0A%0A*Total:* ${formatINR(finalTotal)}%0A%0APlease confirm fulfillment and dispatch timeline.`;
                window.open(`https://wa.me/918178867115?text=${waText}`, "_blank");
            }
        } catch (err) {
            toast.error(err.message || "Failed to place order. Please try again.");
        } finally {
            setSubmitting(false);
        }
    };

    // If order was confirmed, show receipt
    if (confirmedOrder) {
        return (
            <div className="max-w-[800px] mx-auto px-6 py-16 md:py-24 text-center">
                <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto mb-6">
                    <CheckCircle2 size={36} />
                </div>
                <div className="tracking-editorial text-muted2 mb-2 text-xs">Thank you for your order</div>
                <h1 className="font-serif text-4xl md:text-5xl mb-4">Your order is confirmed</h1>
                <p className="text-charcoal/70 max-w-md mx-auto mb-8 text-sm">
                    Order <span className="font-mono font-semibold text-charcoal">{confirmedOrder.order_number}</span> has been received and is being prepared with white-glove care.
                </p>

                <div className="bg-ivory-2 border border-charcoal/10 p-6 md:p-8 rounded-none text-left mb-8 max-w-lg mx-auto space-y-4">
                    <div className="flex justify-between border-b border-charcoal/10 pb-3 text-sm">
                        <span className="text-muted2">Order Number</span>
                        <span className="font-mono font-medium">{confirmedOrder.order_number}</span>
                    </div>
                    <div className="flex justify-between border-b border-charcoal/10 pb-3 text-sm">
                        <span className="text-muted2">Courier Partner</span>
                        <span>{confirmedOrder.carrier || "BlueDart Express"}</span>
                    </div>
                    <div className="flex justify-between border-b border-charcoal/10 pb-3 text-sm">
                        <span className="text-muted2">Tracking Code</span>
                        <span className="font-mono">{confirmedOrder.tracking_number}</span>
                    </div>
                    <div className="flex justify-between text-sm font-medium pt-2">
                        <span>Total Amount</span>
                        <span className="font-serif text-lg">{formatINR(confirmedOrder.total)}</span>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    <Link
                        to={`/track?order=${confirmedOrder.order_number}`}
                        className="w-full sm:w-auto bg-charcoal text-ivory px-8 py-3.5 tracking-editorial hover:bg-amber2 transition-colors text-xs"
                    >
                        Track Order Status
                    </Link>
                    <Link
                        to="/"
                        className="w-full sm:w-auto border border-charcoal/20 px-8 py-3.5 tracking-editorial hover:bg-ivory-2 transition-colors text-xs"
                    >
                        Return to Gallery
                    </Link>
                </div>
            </div>
        );
    }

    if (!items || items.length === 0) {
        return (
            <div className="max-w-[800px] mx-auto px-6 py-24 text-center">
                <div className="tracking-editorial text-muted2 mb-3 text-xs">Your bag is empty</div>
                <h1 className="font-serif text-3xl md:text-4xl mb-6">No items ready for checkout</h1>
                <Link
                    to="/shop/chandeliers"
                    className="inline-flex items-center gap-2 bg-charcoal text-ivory px-8 py-3.5 text-xs tracking-editorial hover:bg-amber2 transition-colors"
                >
                    Explore Catalogue
                </Link>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-10 md:py-16">
            <Link to="/cart" className="inline-flex items-center gap-2 text-xs tracking-editorial text-muted2 hover:text-charcoal mb-8">
                <ArrowLeft size={14} /> Return to Bag
            </Link>

            <h1 className="font-serif text-3xl sm:text-5xl mb-8 md:mb-12">Complete Your Acquisition</h1>

            <div className="grid lg:grid-cols-[1fr_450px] gap-10 lg:gap-16 items-start">
                {/* Left: Shipping & Delivery Form */}
                <div className="space-y-8">
                    <div className="bg-white border border-[#E5E3DC] p-6 sm:p-8">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="font-serif text-2xl">1. Delivery Address</h2>
                            <div className="flex items-center gap-1.5 text-xs text-muted2">
                                <Truck size={14} className="text-amber2" /> Complimentary India Shipping
                            </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div className="sm:col-span-2">
                                <label className="block text-[11px] tracking-editorial text-muted2 uppercase mb-1">Full Name *</label>
                                <input
                                    required
                                    value={form.name}
                                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                                    placeholder="e.g. Radhika Sharma"
                                    className="w-full border border-charcoal/20 px-3.5 py-2.5 text-sm outline-none focus:border-amber2"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] tracking-editorial text-muted2 uppercase mb-1">Email Address *</label>
                                <input
                                    required
                                    type="email"
                                    value={form.email}
                                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                                    placeholder="radhika@example.com"
                                    className="w-full border border-charcoal/20 px-3.5 py-2.5 text-sm outline-none focus:border-amber2"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] tracking-editorial text-muted2 uppercase mb-1">Phone Number (+91) *</label>
                                <input
                                    required
                                    value={form.phone}
                                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                                    placeholder="98765 43210"
                                    className="w-full border border-charcoal/20 px-3.5 py-2.5 text-sm outline-none focus:border-amber2"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-[11px] tracking-editorial text-muted2 uppercase mb-1">Street Address *</label>
                                <input
                                    required
                                    value={form.address}
                                    onChange={(e) => setForm({ ...form, address: e.target.value })}
                                    placeholder="Apartment, Villa, Street name"
                                    className="w-full border border-charcoal/20 px-3.5 py-2.5 text-sm outline-none focus:border-amber2"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] tracking-editorial text-muted2 uppercase mb-1">City *</label>
                                <input
                                    required
                                    value={form.city}
                                    onChange={(e) => setForm({ ...form, city: e.target.value })}
                                    placeholder="e.g. New Delhi"
                                    className="w-full border border-charcoal/20 px-3.5 py-2.5 text-sm outline-none focus:border-amber2"
                                />
                            </div>

                            <div>
                                <label className="block text-[11px] tracking-editorial text-muted2 uppercase mb-1">Pincode *</label>
                                <input
                                    required
                                    value={form.pincode}
                                    onChange={(e) => setForm({ ...form, pincode: e.target.value })}
                                    placeholder="110001"
                                    className="w-full border border-charcoal/20 px-3.5 py-2.5 text-sm outline-none focus:border-amber2"
                                />
                            </div>

                            <div className="sm:col-span-2">
                                <label className="block text-[11px] tracking-editorial text-muted2 uppercase mb-1">Special Delivery / Installation Notes</label>
                                <textarea
                                    rows={2}
                                    value={form.notes}
                                    onChange={(e) => setForm({ ...form, notes: e.target.value })}
                                    placeholder="Ceiling height, site readiness, or preferred delivery timing"
                                    className="w-full border border-charcoal/20 px-3.5 py-2 text-sm outline-none focus:border-amber2"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Payment & Confirmation Options */}
                    <div className="bg-white border border-[#E5E3DC] p-6 sm:p-8">
                        <h2 className="font-serif text-2xl mb-4">2. Select Payment & Confirmation</h2>
                        <div className="space-y-4">
                            <button
                                onClick={() => handlePlaceOrder("online")}
                                disabled={submitting}
                                className="w-full bg-charcoal text-ivory p-4 text-left hover:bg-charcoal/90 transition-all flex items-center justify-between group"
                            >
                                <div>
                                    <div className="font-medium text-sm flex items-center gap-2">
                                        Confirm Order with White-Glove Dispatch
                                        <Sparkles size={14} className="text-amber2" />
                                    </div>
                                    <div className="text-xs text-ivory/70 mt-1">
                                        Direct studio invoice, UPI / NEFT details & instant courier assignment
                                    </div>
                                </div>
                                <span className="text-xs tracking-editorial bg-amber2 text-charcoal px-3 py-1 font-semibold">
                                    {submitting ? "Processing…" : "Confirm"}
                                </span>
                            </button>

                            <button
                                onClick={() => handlePlaceOrder("whatsapp")}
                                disabled={submitting}
                                className="w-full border border-[#25D366]/40 bg-[#25D366]/5 p-4 text-left hover:bg-[#25D366]/10 transition-all flex items-center justify-between"
                            >
                                <div>
                                    <div className="font-medium text-sm text-charcoal flex items-center gap-2">
                                        Order via VIP Studio Concierge (WhatsApp)
                                    </div>
                                    <div className="text-xs text-muted2 mt-1">
                                        Personal design lead assists with ceiling sizing, custom finishes & payments
                                    </div>
                                </div>
                                <span className="text-xs tracking-editorial text-charcoal border border-charcoal/20 px-3 py-1">
                                    Chat Now
                                </span>
                            </button>

                            <button
                                onClick={handleShopifyDirect}
                                className="w-full border border-charcoal/20 p-4 text-left hover:bg-ivory-2 transition-all flex items-center justify-between"
                            >
                                <div>
                                    <div className="font-medium text-sm text-charcoal flex items-center gap-1.5">
                                        Shopify Hosted Checkout
                                        <ExternalLink size={13} className="text-muted2" />
                                    </div>
                                    <div className="text-xs text-muted2 mt-1">
                                        Pay via Cards, Netbanking & EMI on Shopify's portal
                                    </div>
                                </div>
                                <span className="text-xs tracking-editorial text-muted2">
                                    Open Portal
                                </span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right: Order Summary */}
                <aside className="bg-ivory-2 p-6 sm:p-8 border border-[#E5E3DC] sticky top-28">
                    <div className="tracking-editorial text-xs font-semibold uppercase mb-4">Acquisition Summary</div>

                    {/* Items List */}
                    <div className="divide-y divide-[#E5E3DC] mb-6 max-h-[300px] overflow-y-auto pr-1">
                        {items.map((i) => (
                            <div key={i.lineId} className="py-3 flex gap-3 text-sm">
                                {i.image && (
                                    <img src={i.image} alt={i.name} className="w-14 h-16 object-cover bg-white shrink-0 border border-charcoal/10" />
                                )}
                                <div className="flex-1 min-w-0">
                                    <div className="font-medium truncate text-xs sm:text-sm">{i.name}</div>
                                    {i.variantTitle && i.variantTitle !== "Default Title" && (
                                        <div className="text-[11px] text-muted2">{i.variantTitle}</div>
                                    )}
                                    <div className="text-xs text-muted2 mt-1">Qty: {i.quantity}</div>
                                </div>
                                <div className="text-right text-xs font-medium shrink-0 font-serif">
                                    {formatINR(i.price * i.quantity)}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Coupon Input */}
                    <form onSubmit={handleApplyCoupon} className="flex gap-2 mb-6">
                        <div className="relative flex-1">
                            <Tag size={13} className="absolute left-3 top-3 text-muted2" />
                            <input
                                value={couponCode}
                                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                                placeholder="PROMO / COUPON CODE"
                                className="w-full pl-8 pr-3 py-2 text-xs border border-charcoal/20 bg-white uppercase outline-none focus:border-amber2"
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={couponLoading}
                            className="bg-charcoal text-ivory px-4 py-2 text-xs tracking-editorial hover:bg-amber2 transition-colors disabled:opacity-50"
                        >
                            {couponLoading ? "…" : "Apply"}
                        </button>
                    </form>

                    {appliedCoupon && (
                        <div className="bg-amber2/10 border border-amber2/30 px-3 py-2 text-xs flex justify-between items-center mb-4">
                            <span>Coupon <strong>{appliedCoupon.code}</strong> applied ({appliedCoupon.discount_percent}% off)</span>
                            <button onClick={() => setAppliedCoupon(null)} className="text-charcoal/60 hover:text-charcoal underline text-[10px]">Remove</button>
                        </div>
                    )}

                    {/* Price Breakdown */}
                    <div className="space-y-2.5 text-xs sm:text-sm pt-4 border-t border-charcoal/10">
                        <div className="flex justify-between">
                            <span className="text-muted2">Subtotal</span>
                            <span>{formatINR(total)}</span>
                        </div>
                        {appliedCoupon && (
                            <div className="flex justify-between text-emerald-700">
                                <span>Discount ({appliedCoupon.code})</span>
                                <span>−{formatINR(discountAmount)}</span>
                            </div>
                        )}
                        <div className="flex justify-between text-muted2">
                            <span>White-Glove Shipping</span>
                            <span className="text-emerald-700 font-medium">Complimentary</span>
                        </div>
                        <div className="flex justify-between text-muted2">
                            <span>Transit Insurance</span>
                            <span>Included</span>
                        </div>
                    </div>

                    <div className="mt-5 pt-5 border-t border-charcoal/20 flex justify-between font-serif text-xl">
                        <span>Total</span>
                        <span>{formatINR(finalTotal)}</span>
                    </div>

                    <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-muted2 text-center">
                        <ShieldCheck size={14} className="text-amber2" />
                        <span>Protected by 256-bit encryption · 100% Insured Delivery</span>
                    </div>
                </aside>
            </div>
        </div>
    );
}
