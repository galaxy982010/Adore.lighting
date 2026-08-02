import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { X, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { api } from "@/lib/api";

const HIDDEN_ROUTES = ["/admin", "/checkout", "/cart", "/auth"];

export default function NewsletterPopup() {
    const [open, setOpen] = useState(false);
    const [email, setEmail] = useState("");
    const [done, setDone] = useState(false);
    const { pathname } = useLocation();

    useEffect(() => {
        if (localStorage.getItem("adore_popup_seen")) return;
        if (HIDDEN_ROUTES.some((r) => pathname.startsWith(r))) return;
        const t = setTimeout(() => setOpen(true), 12000);
        return () => clearTimeout(t);
    }, [pathname]);

    // Also hide if user navigates into hidden route while open
    useEffect(() => {
        if (HIDDEN_ROUTES.some((r) => pathname.startsWith(r))) setOpen(false);
    }, [pathname]);

    const close = () => {
        setOpen(false);
        localStorage.setItem("adore_popup_seen", "1");
    };

    const submit = async (e) => {
        e.preventDefault();
        try {
            await api.post("/newsletter", { email });
            setDone(true);
            localStorage.setItem("adore_popup_seen", "1");
            setTimeout(close, 3000);
        } catch {
            toast.error("Please try again.");
        }
    };

    if (!open) return null;

    return (
        <div className="fixed inset-0 z-[70] bg-charcoal/60 backdrop-blur-sm flex items-center justify-center p-4" onClick={close}>
            <div className="relative bg-ivory max-w-lg w-full grid md:grid-cols-2 overflow-hidden" onClick={(e) => e.stopPropagation()}>
                <button data-testid="popup-close" onClick={close} className="absolute top-3 right-3 z-10 p-1 hover:text-amber2"><X size={18} /></button>
                <div className="aspect-square hidden md:block bg-charcoal">
                    <img src="https://images.unsplash.com/photo-1648415198825-7c805bfa043e?w=700&q=85" alt="" className="w-full h-full object-cover" />
                </div>
                <div className="p-8">
                    <Sparkles size={20} className="text-amber2 mb-4" />
                    <div className="tracking-editorial text-muted2 mb-3">First to know</div>
                    <div className="font-serif text-3xl leading-tight mb-4">Enjoy 10% off your first order</div>
                    <p className="text-sm text-charcoal/70 mb-5">Join the atelier newsletter and we'll send you the code, plus early access to new arrivals and studio dispatches.</p>
                    {done ? (
                        <div className="p-4 bg-ivory-2 text-center">
                            <div className="font-serif text-xl mb-1">Welcome.</div>
                            <div className="text-xs text-muted2">Your code: <span className="text-amber2 font-medium tracking-editorial">ADORE10</span></div>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="space-y-3">
                            <input data-testid="popup-email" required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Your email" className="w-full border-b border-charcoal/30 bg-transparent py-2 outline-none focus:border-amber2 text-sm" />
                            <button data-testid="popup-submit" className="w-full bg-charcoal text-ivory py-3 tracking-editorial hover:bg-amber2 transition-colors">Send my code</button>
                        </form>
                    )}
                    <div className="text-[10px] text-muted2 mt-4">No spam. Unsubscribe any time.</div>
                </div>
            </div>
        </div>
    );
}
