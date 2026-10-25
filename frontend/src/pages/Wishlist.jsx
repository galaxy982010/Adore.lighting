import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Heart } from "lucide-react";
import * as Shopify from "@/lib/shopify";
import ProductCard from "@/components/ProductCard";

const KEY = "adore_wishlist_handles";

export const readWishlist = () => {
    try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; }
};
export const addToWishlist = (handle) => {
    const list = readWishlist();
    if (!list.includes(handle)) {
        list.push(handle);
        localStorage.setItem(KEY, JSON.stringify(list));
    }
};
export const removeFromWishlist = (handle) => {
    const next = readWishlist().filter((h) => h !== handle);
    localStorage.setItem(KEY, JSON.stringify(next));
};

export default function Wishlist() {
    const [items, setItems] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handles = readWishlist();
        if (handles.length === 0) { setLoading(false); return; }
        Promise.all(handles.map((h) => Shopify.getProductByHandle(h).catch(() => null)))
            .then((list) => setItems(list.filter(Boolean)))
            .finally(() => setLoading(false));
    }, []);

    if (loading) return <div className="py-40 text-center text-muted2">Loading…</div>;

    if (items.length === 0) {
        return (
            <div className="max-w-[900px] mx-auto px-6 py-32 text-center">
                <Heart size={32} className="mx-auto text-amber2 mb-6" />
                <div className="tracking-editorial text-muted2 mb-4">Wishlist</div>
                <h1 className="font-serif text-4xl md:text-5xl mb-8">Nothing saved yet.</h1>
                <p className="text-muted2 mb-8">Tap the heart on any product to keep it here for later.</p>
                <Link to="/shop/chandeliers" className="inline-block bg-charcoal text-ivory px-8 py-4 tracking-editorial hover:bg-amber2 transition-colors">Explore the collection</Link>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16">
            <h1 className="font-serif text-5xl md:text-6xl mb-12">Your Wishlist</h1>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
                {items.map((p) => <ProductCard key={p.id} product={p} />)}
            </div>
        </div>
    );
}
