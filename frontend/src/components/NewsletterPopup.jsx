import { useEffect, useState, useRef } from "react";
import { useLocation, Link } from "react-router-dom";
import { X, ChevronRight } from "lucide-react";
import * as Shopify from "@/lib/shopify";
import { formatINR } from "@/lib/api";

const HIDDEN_ROUTES = ["/adore-admin", "/checkout", "/cart", "/auth"];
const INTERVAL_MS = 60000; // 1 minute
const VISIBLE_MS = 9000;   // stays 9s on screen

// Premium bottom-right sliding product teaser popup.
// Rotates a featured product every minute across the site
// (except admin/checkout/cart/auth routes).
export default function ProductTeaserPopup() {
    const [pool, setPool] = useState([]);
    const [current, setCurrent] = useState(null);
    const [visible, setVisible] = useState(false);
    const { pathname } = useLocation();
    const idxRef = useRef(0);
    const cycleRef = useRef(null);
    const hideRef = useRef(null);

    const isHidden = HIDDEN_ROUTES.some((r) => pathname.startsWith(r));

    useEffect(() => {
        Shopify.listProducts({ first: 50 })
            .then((list) => {
                const featured = list.filter((p) => p.featured);
                const source = featured.length ? featured : list;
                const shuffled = [...source].sort(() => Math.random() - 0.5);
                setPool(shuffled);
            })
            .catch(() => setPool([]));
    }, []);

    useEffect(() => {
        if (isHidden || pool.length === 0) return;

        const showNext = () => {
            const p = pool[idxRef.current % pool.length];
            idxRef.current += 1;
            setCurrent(p);
            setVisible(true);
            clearTimeout(hideRef.current);
            hideRef.current = setTimeout(() => setVisible(false), VISIBLE_MS);
        };

        // Show first after 25s, then every 60s
        const first = setTimeout(showNext, 25000);
        cycleRef.current = setInterval(showNext, INTERVAL_MS);

        return () => {
            clearTimeout(first);
            clearInterval(cycleRef.current);
            clearTimeout(hideRef.current);
        };
    }, [pool, isHidden]);

    useEffect(() => {
        if (isHidden) setVisible(false);
    }, [isHidden]);

    if (isHidden || !current) return null;

    return (
        <div
            data-testid="product-popup"
            aria-live="polite"
            className={`fixed bottom-24 left-6 z-40 w-[calc(100%-3rem)] sm:w-[360px] transition-all duration-500 ease-out ${visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-6 pointer-events-none"}`}
        >
            <div className="relative bg-ivory border border-[#E5E3DC] shadow-[0_20px_60px_-20px_rgba(44,44,43,0.35)] overflow-hidden">
                <button
                    data-testid="product-popup-close"
                    onClick={() => setVisible(false)}
                    aria-label="Close"
                    className="absolute top-2 right-2 z-10 p-1 text-muted2 hover:text-amber2"
                >
                    <X size={16} />
                </button>
                <div className="flex gap-4">
                    <div className="w-28 h-32 bg-ivory-2 shrink-0 overflow-hidden">
                        <img src={current.images?.[0]} alt={current.name} loading="lazy" className="w-full h-full object-cover" />
                    </div>
                    <div className="flex-1 py-4 pr-8 min-w-0">
                        <div className="tracking-editorial text-amber2 mb-1 text-[9px]">Featured Piece</div>
                        <div className="font-serif text-lg leading-tight truncate">{current.name}</div>
                        <div className="text-xs text-muted2 mt-1 capitalize">{current.category.replace(/-/g, " ")}</div>
                        <div className="mt-2 text-sm font-medium">{formatINR(current.price)}</div>
                    </div>
                </div>
                <Link
                    to={`/product/${current.slug}`}
                    data-testid="product-popup-cta"
                    onClick={() => setVisible(false)}
                    className="flex items-center justify-between px-4 py-3 bg-charcoal text-ivory tracking-editorial text-xs hover:bg-amber2 transition-colors"
                >
                    <span>View this piece</span>
                    <ChevronRight size={14} />
                </Link>
            </div>
        </div>
    );
}
