import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { api, formatINR } from "@/lib/api";
import { useCart } from "@/context/CartContext";

export default function Checkout() {
    const { items, total, clear } = useCart();
    const [form, setForm] = useState({
        customer_name: "", email: "", phone: "", address: "", city: "", state: "", pincode: "",
    });
    const [method, setMethod] = useState("razorpay");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    if (items.length === 0) {
        return <div className="max-w-[1000px] mx-auto px-6 py-32 text-center text-muted2">Your bag is empty.</div>;
    }

    const upd = (k) => (e) => setForm({ ...form, [k]: e.target.value });

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                items: items.map((i) => ({ product_id: i.id, quantity: i.quantity })),
                ...form,
                total,
                payment_method: method,
            };
            const r = await api.post("/orders", payload);
            const order = r.data.order;
            const rzpKey = r.data.razorpay_key_id;

            if (method === "cod" || !rzpKey || !order.razorpay_order_id) {
                clear();
                toast.success("Order placed. We'll be in touch shortly.");
                navigate(`/track?order=${order.order_number}`);
                return;
            }

            const options = {
                key: rzpKey,
                amount: order.total * 100,
                currency: "INR",
                name: "Adore",
                description: `Order ${order.order_number}`,
                order_id: order.razorpay_order_id,
                prefill: { name: form.customer_name, email: form.email, contact: form.phone },
                theme: { color: "#B85B24" },
                handler: async (resp) => {
                    try {
                        await api.post("/orders/verify-payment", {
                            razorpay_order_id: resp.razorpay_order_id,
                            razorpay_payment_id: resp.razorpay_payment_id,
                            razorpay_signature: resp.razorpay_signature,
                            order_id: order.id,
                        });
                        clear();
                        toast.success("Payment received. Thank you.");
                        navigate(`/track?order=${order.order_number}`);
                    } catch (err) {
                        toast.error("Payment verification failed. Contact support.");
                    }
                },
                modal: { ondismiss: () => toast.error("Payment cancelled.") },
            };
            const rzp = new window.Razorpay(options);
            rzp.open();
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16">
            <h1 className="font-serif text-5xl mb-12">Checkout</h1>
            <form onSubmit={submit} className="grid lg:grid-cols-[1fr_420px] gap-12">
                <div>
                    <div className="tracking-editorial mb-6">Delivery details</div>
                    <div className="grid md:grid-cols-2 gap-5">
                        <input data-testid="checkout-name" required placeholder="Full name" value={form.customer_name} onChange={upd("customer_name")} className="border-b border-charcoal/30 bg-transparent py-3 outline-none focus:border-amber2" />
                        <input data-testid="checkout-email" required type="email" placeholder="Email" value={form.email} onChange={upd("email")} className="border-b border-charcoal/30 bg-transparent py-3 outline-none focus:border-amber2" />
                        <input data-testid="checkout-phone" required placeholder="Phone" value={form.phone} onChange={upd("phone")} className="border-b border-charcoal/30 bg-transparent py-3 outline-none focus:border-amber2" />
                        <input data-testid="checkout-pincode" required placeholder="Pincode" value={form.pincode} onChange={upd("pincode")} className="border-b border-charcoal/30 bg-transparent py-3 outline-none focus:border-amber2" />
                        <input data-testid="checkout-address" required placeholder="Address" value={form.address} onChange={upd("address")} className="border-b border-charcoal/30 bg-transparent py-3 outline-none focus:border-amber2 md:col-span-2" />
                        <input data-testid="checkout-city" required placeholder="City" value={form.city} onChange={upd("city")} className="border-b border-charcoal/30 bg-transparent py-3 outline-none focus:border-amber2" />
                        <input data-testid="checkout-state" required placeholder="State" value={form.state} onChange={upd("state")} className="border-b border-charcoal/30 bg-transparent py-3 outline-none focus:border-amber2" />
                    </div>

                    <div className="tracking-editorial mt-12 mb-4">Payment</div>
                    <div className="space-y-3">
                        <label className="flex items-center gap-3 border border-charcoal/20 p-4 cursor-pointer hover:border-amber2">
                            <input data-testid="pay-razorpay" type="radio" checked={method === "razorpay"} onChange={() => setMethod("razorpay")} className="accent-[#B85B24]" />
                            <div>
                                <div className="font-medium text-sm">Razorpay · UPI, Cards, Netbanking, Wallets</div>
                                <div className="text-xs text-muted2 mt-1">Encrypted & PCI DSS compliant</div>
                            </div>
                        </label>
                        <label className="flex items-center gap-3 border border-charcoal/20 p-4 cursor-pointer hover:border-amber2">
                            <input data-testid="pay-cod" type="radio" checked={method === "cod"} onChange={() => setMethod("cod")} className="accent-[#B85B24]" />
                            <div>
                                <div className="font-medium text-sm">Reserve & pay on delivery</div>
                                <div className="text-xs text-muted2 mt-1">Our team confirms availability, then arranges installation</div>
                            </div>
                        </label>
                    </div>
                </div>

                <aside className="lg:sticky lg:top-32 self-start bg-ivory-2 p-8">
                    <div className="tracking-editorial mb-6">Order Summary</div>
                    <div className="space-y-3 max-h-64 overflow-auto pr-2">
                        {items.map((i) => (
                            <div key={i.id} className="flex gap-3 text-sm">
                                <img src={i.image} alt="" className="w-14 h-16 object-cover" />
                                <div className="flex-1">
                                    <div className="font-serif text-base leading-tight">{i.name}</div>
                                    <div className="text-xs text-muted2">Qty {i.quantity}</div>
                                </div>
                                <div>{formatINR(i.price * i.quantity)}</div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 pt-6 border-t border-charcoal/20 space-y-2 text-sm">
                        <div className="flex justify-between"><span>Subtotal</span><span>{formatINR(total)}</span></div>
                        <div className="flex justify-between text-muted2"><span>Shipping</span><span>{total > 50000 ? "Free" : "₹1,200"}</span></div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-charcoal/20 flex justify-between font-serif text-xl">
                        <span>Total</span><span>{formatINR(total + (total > 50000 ? 0 : 1200))}</span>
                    </div>
                    <button data-testid="place-order-btn" disabled={loading} className="mt-6 w-full bg-charcoal text-ivory py-4 tracking-editorial hover:bg-amber2 transition-colors disabled:opacity-60">
                        {loading ? "Processing…" : "Place order"}
                    </button>
                </aside>
            </form>
        </div>
    );
}
