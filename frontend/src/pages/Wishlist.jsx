import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Heart } from "lucide-react";
import { api, formatINR } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import ProductCard from "@/components/ProductCard";

export default function Wishlist() {
    const { user, loading } = useAuth();
    const [items, setItems] = useState([]);
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return;
        if (!user) return;
        api.get("/wishlist").then((r) => setItems(r.data));
    }, [user, loading]);

    if (loading) return null;

    if (!user) {
        return (
            <div className="max-w-[900px] mx-auto px-6 py-32 text-center">
                <Heart size={32} className="mx-auto text-amber2 mb-6" />
                <div className="tracking-editorial text-muted2 mb-4">Wishlist</div>
                <h1 className="font-serif text-4xl md:text-5xl mb-8">Sign in to save favourites</h1>
                <button data-testid="wishlist-signin-btn" onClick={() => navigate("/auth")} className="bg-charcoal text-ivory px-8 py-4 tracking-editorial hover:bg-amber2 transition-colors">Sign in</button>
            </div>
        );
    }

    return (
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16">
            <h1 className="font-serif text-5xl md:text-6xl mb-12">Your Wishlist</h1>
            {items.length === 0 ? (
                <div className="text-muted2">No pieces saved yet. <Link to="/" className="text-charcoal underline-link">Browse the collection →</Link></div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 md:gap-10">
                    {items.map((p) => <ProductCard key={p.id} product={p} />)}
                </div>
            )}
        </div>
    );
}
