import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ShoppingBag, Search, User, Menu, X, Heart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatINR } from "@/lib/api";
import * as Shopify from "@/lib/shopify";

// Minimal luxury header:
//   Announcement bar · logo-centered nav · essential icons (search / wishlist / account / cart).
// No category nav links, no store/warranty/EMI mentions.
export default function Nav() {
    const { count } = useCart();
    const { user, logout } = useAuth();
    const [open, setOpen] = useState(false);
    const [searchOpen, setSearchOpen] = useState(false);
    const [q, setQ] = useState("");
    const [results, setResults] = useState([]);
    const [announcement, setAnnouncement] = useState("Complimentary Shipping Across India");
    const navigate = useNavigate();
    const searchRef = useRef(null);

    // Listen to hero-slide-driven announcement broadcasts.
    useEffect(() => {
        const onMsg = (e) => setAnnouncement(e.detail || "Complimentary Shipping Across India");
        window.addEventListener("adore:announcement", onMsg);
        return () => window.removeEventListener("adore:announcement", onMsg);
    }, []);

    useEffect(() => {
        if (!q) return setResults([]);
        const t = setTimeout(async () => {
            try {
                const list = await Shopify.listProducts({ first: 8, query: q });
                setResults(list);
            } catch {
                setResults([]);
            }
        }, 250);
        return () => clearTimeout(t);
    }, [q]);

    useEffect(() => {
        if (searchOpen && searchRef.current) searchRef.current.focus();
    }, [searchOpen]);

    const go = (path) => {
        setOpen(false);
        setSearchOpen(false);
        setQ("");
        navigate(path);
    };

    return (
        <header className="sticky top-0 z-50 backdrop-blur-xl bg-ivory/90 border-b border-[#E5E3DC]">
            <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                {/* announcement */}
                <div key={announcement} className="flex justify-center text-center text-[10px] md:text-[11px] tracking-editorial text-muted2 py-2 border-b border-[#E5E3DC]/70 px-4 transition-opacity duration-500">
                    {announcement}
                </div>

                <div className="grid grid-cols-3 items-center h-20">
                    <div className="flex items-center justify-self-start">
                        <button
                            data-testid="nav-menu-toggle"
                            onClick={() => setOpen(!open)}
                            className="md:hidden p-2 -ml-2"
                            aria-label="Menu"
                        >
                            {open ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>

                    <Link to="/" data-testid="nav-logo" className="justify-self-center flex items-baseline gap-2 leading-none">
                        <span className="font-serif text-3xl md:text-4xl tracking-tight">Adore</span>
                        <span className="hidden sm:inline text-[10px] tracking-editorial text-muted2 pb-1">Lighting</span>
                    </Link>

                    <div className="flex items-center gap-1 md:gap-3 justify-self-end">
                        <button
                            data-testid="nav-search-btn"
                            onClick={() => setSearchOpen(true)}
                            className="p-2 hover:text-amber2"
                            aria-label="Search"
                        >
                            <Search size={18} />
                        </button>
                        <Link to="/wishlist" data-testid="nav-wishlist" className="p-2 hover:text-amber2" aria-label="Wishlist">
                            <Heart size={18} />
                        </Link>
                        {user ? (
                            <div className="relative group">
                                <button data-testid="nav-account-btn" className="p-2 hover:text-amber2" aria-label="Account">
                                    <User size={18} />
                                </button>
                                <div className="absolute right-0 top-full mt-1 w-52 bg-ivory border border-[#E5E3DC] py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity">
                                    <div className="px-4 py-2 text-xs text-muted2 border-b border-[#E5E3DC]">{user.email}</div>
                                    <button onClick={() => go("/track")} className="block w-full text-left px-4 py-2 text-sm hover:bg-ivory-2">Track Order</button>
                                    <button onClick={logout} data-testid="nav-logout" className="block w-full text-left px-4 py-2 text-sm hover:bg-ivory-2">Sign out</button>
                                </div>
                            </div>
                        ) : (
                            <Link to="/auth" data-testid="nav-login" className="p-2 hover:text-amber2" aria-label="Sign in">
                                <User size={18} />
                            </Link>
                        )}
                        <Link to="/cart" data-testid="nav-cart" className="relative p-2 hover:text-amber2" aria-label="Cart">
                            <ShoppingBag size={18} />
                            {count > 0 && (
                                <span data-testid="nav-cart-count" className="absolute -top-0.5 -right-0.5 bg-amber2 text-ivory text-[10px] w-4 h-4 flex items-center justify-center rounded-full font-medium">
                                    {count}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>

            {/* Mobile Menu */}
            {open && (
                <div className="md:hidden border-t border-[#E5E3DC] bg-ivory">
                    <nav className="px-6 py-4 flex flex-col gap-2">
                        <Link to="/" onClick={() => setOpen(false)} className="py-3 border-b border-[#E5E3DC]/60 text-sm">Home</Link>
                        <Link to="/track" onClick={() => setOpen(false)} className="py-3 border-b border-[#E5E3DC]/60 text-sm">Track Order</Link>
                        <Link to="/contact" onClick={() => setOpen(false)} className="py-3 text-sm">Contact</Link>
                    </nav>
                </div>
            )}

            {/* Search Overlay */}
            {searchOpen && (
                <div className="fixed inset-0 z-[60] bg-ivory/95 backdrop-blur-2xl flex items-start justify-center pt-24 px-6" onClick={() => setSearchOpen(false)}>
                    <div className="w-full max-w-2xl" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center border-b border-charcoal pb-3">
                            <Search size={20} className="text-muted2" />
                            <input
                                ref={searchRef}
                                data-testid="search-input"
                                type="text"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search chandeliers, pendants, table lamps…"
                                className="w-full bg-transparent outline-none px-4 py-2 font-serif text-2xl"
                            />
                            <button data-testid="search-close" onClick={() => setSearchOpen(false)} className="p-1">
                                <X size={22} />
                            </button>
                        </div>
                        {results.length > 0 && (
                            <div className="mt-6 space-y-2">
                                {results.map((p) => (
                                    <button
                                        key={p.id}
                                        data-testid={`search-result-${p.slug}`}
                                        onClick={() => go(`/product/${p.slug}`)}
                                        className="w-full flex items-center gap-4 p-3 hover:bg-ivory-2 text-left"
                                    >
                                        <img src={p.images?.[0]} alt={p.name} className="w-14 h-14 object-cover" />
                                        <div className="flex-1">
                                            <div className="font-serif text-lg">{p.name}</div>
                                            <div className="text-xs text-muted2 capitalize">{p.category}</div>
                                        </div>
                                        <div className="text-sm">{formatINR(p.price)}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                        {q && results.length === 0 && (
                            <div className="mt-6 text-sm text-muted2">No matches for "{q}".</div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
