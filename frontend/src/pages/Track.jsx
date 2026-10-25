import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { toast } from "sonner";
import { api, formatINR } from "@/lib/api";

const STAGES = ["pending", "paid", "shipped", "delivered"];
const LABELS = { pending: "Received", paid: "Confirmed", shipped: "Dispatched", delivered: "Delivered" };

export default function Track() {
    const [params] = useSearchParams();
    const [num, setNum] = useState(params.get("order") || "");
    const [email, setEmail] = useState(params.get("email") || "");
    const [order, setOrder] = useState(null);
    const [partial, setPartial] = useState(null);
    const [loading, setLoading] = useState(false);

    const lookup = async (e) => {
        if (e) e.preventDefault();
        if (!num) return;
        setLoading(true);
        try {
            const r = await api.get(`/orders/track/${num}`, { params: email ? { email } : {} });
            if (r.data.requires_email) {
                setPartial(r.data);
                setOrder(null);
            } else {
                setOrder(r.data);
                setPartial(null);
            }
        } catch {
            toast.error("Order not found");
            setOrder(null);
            setPartial(null);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (params.get("order")) lookup();
        // eslint-disable-next-line
    }, []);

    const display = order || partial;

    return (
        <div className="max-w-[900px] mx-auto px-6 md:px-10 py-16">
            <div className="tracking-editorial text-muted2 mb-4">Order Status</div>
            <h1 className="font-serif text-5xl mb-10">Track your order</h1>

            <form onSubmit={lookup} className="space-y-3 mb-12">
                <div className="flex gap-3 border-b border-charcoal pb-3">
                    <input data-testid="track-order-input" value={num} onChange={(e) => setNum(e.target.value)} placeholder="e.g. ADRB643CA52" className="flex-1 bg-transparent outline-none py-2 font-serif text-2xl" />
                    <button data-testid="track-order-submit" className="tracking-editorial hover:text-amber2">{loading ? "Searching…" : "Track"}</button>
                </div>
                <input data-testid="track-email-input" type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email used at checkout (for full details)" className="w-full bg-transparent border-b border-charcoal/30 py-2 outline-none focus:border-amber2 text-sm" />
            </form>

            {display && (
                <div>
                    <div className="flex justify-between mb-6">
                        <div>
                            <div className="tracking-editorial text-muted2 mb-1">Order</div>
                            <div className="font-serif text-3xl">{display.order_number}</div>
                        </div>
                        {order && (
                            <div className="text-right">
                                <div className="tracking-editorial text-muted2 mb-1">Total</div>
                                <div className="font-serif text-3xl">{formatINR(order.total)}</div>
                            </div>
                        )}
                    </div>

                    <div className="relative flex justify-between mt-12 mb-16">
                        {STAGES.map((s, i) => {
                            const active = STAGES.indexOf(display.status) >= i;
                            return (
                                <div key={s} className="flex-1 text-center relative">
                                    <div className={`mx-auto w-3 h-3 rounded-full ${active ? "bg-amber2" : "bg-charcoal/20"}`} />
                                    {i < STAGES.length - 1 && (
                                        <div className={`absolute top-1.5 left-1/2 right-[-50%] h-px ${STAGES.indexOf(display.status) > i ? "bg-amber2" : "bg-charcoal/20"}`} />
                                    )}
                                    <div className={`mt-3 tracking-editorial ${active ? "text-charcoal" : "text-muted2"}`}>{LABELS[s]}</div>
                                </div>
                            );
                        })}
                    </div>

                    {order ? (
                        <>
                            <div className="divide-y divide-[#E5E3DC] border-t border-b border-[#E5E3DC]">
                                {order.items.map((it, i) => (
                                    <div key={i} className="flex gap-4 py-4">
                                        <img src={it.image} alt="" className="w-16 h-20 object-cover" />
                                        <div className="flex-1">
                                            <div className="font-serif text-lg">{it.name}</div>
                                            <div className="text-xs text-muted2">Qty {it.quantity}</div>
                                        </div>
                                        <div className="text-sm">{formatINR(it.price * it.quantity)}</div>
                                    </div>
                                ))}
                            </div>
                            <div className="mt-8 text-sm text-charcoal/70">
                                Delivering to <span className="text-charcoal">{order.address}, {order.city}, {order.state} {order.pincode}</span>
                            </div>
                        </>
                    ) : (
                        <div className="bg-ivory-2 p-6 text-sm text-charcoal/75">
                            Add the email used at checkout to see delivery details, items and total.
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
