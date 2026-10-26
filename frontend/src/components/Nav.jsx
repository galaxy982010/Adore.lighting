import { Link, useNavigate } from "react-router-dom";
import { useEffect, useRef, useState } from "react";
import { ShoppingBag, Search, User, Menu, X, Heart, ChevronRight, Phone } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { formatINR, CATEGORIES, BRAND, ROOMS } from "@/lib/api";
import * as Shopify from "@/lib/shopify";

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

    // Lock body scroll when mobile menu or search is open
    useEffect(() => {
        if (open || searchOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [open, searchOpen]);

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
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10">
                {/* announcement */}
                <div key={announcement} className="flex justify-center text-center text-[10px] sm:text-[11px] tracking-editorial text-muted2 py-1.5 sm:py-2 border-b border-[#E5E3DC]/70 px-2 sm:px-4 transition-opacity duration-500 truncate">
                    {announcement}
                </div>

                <div className="grid grid-cols-[auto_1fr_auto] md:grid-cols-3 items-center h-16 sm:h-20 gap-2">
                    <div className="flex items-center justify-self-start">
                        <button
                            data-testid="nav-menu-toggle"
                            onClick={() => setOpen(!open)}
                            className="md:hidden p-2 -ml-2 text-charcoal hover:text-amber2 focus:outline-none"
                            aria-label="Menu"
                        >
                            {open ? <X size={22} /> : <Menu size={22} />}
                        </button>
                    </div>

                    <Link to="/" data-testid="nav-logo" className="justify-self-center flex items-baseline gap-1.5 sm:gap-2 leading-none">
                        <span className="font-serif text-2xl sm:text-3xl md:text-4xl tracking-tight">Adore</span>
                        <span className="hidden sm:inline text-[9px] sm:text-[10px] tracking-editorial text-muted2 pb-0.5 sm:pb-1">Lighting</span>
                    </Link>

                    <div className="flex items-center gap-0.5 sm:gap-1.5 md:gap-3 justify-self-end">
                        <button
                            data-testid="nav-search-btn"
                            onClick={() => setSearchOpen(true)}
                            className="p-1.5 sm:p-2 text-charcoal hover:text-amber2 transition-colors"
                            aria-label="Search"
                        >
                            <Search size={18} />
                        </button>
                        <Link to="/wishlist" data-testid="nav-wishlist" className="p-1.5 sm:p-2 text-charcoal hover:text-amber2 transition-colors" aria-label="Wishlist">
                            <Heart size={18} />
                        </Link>
                        {user ? (
                            <div className="relative group">
                                <button data-testid="nav-account-btn" className="p-1.5 sm:p-2 text-charcoal hover:text-amber2" aria-label="Account">
                                    <User size={18} />
                                </button>
                                <div className="absolute right-0 top-full mt-1 w-52 bg-ivory border border-[#E5E3DC] py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-opacity shadow-lg">
                                    <div className="px-4 py-2 text-xs text-muted2 border-b border-[#E5E3DC] truncate">{user.email}</div>
                                    <button onClick={() => go("/track")} className="block w-full text-left px-4 py-2 text-sm hover:bg-ivory-2">Track Order</button>
                                    <button onClick={logout} data-testid="nav-logout" className="block w-full text-left px-4 py-2 text-sm hover:bg-ivory-2">Sign out</button>
                                </div>
                            </div>
                        ) : (
                            <Link to="/auth" data-testid="nav-login" className="p-1.5 sm:p-2 text-charcoal hover:text-amber2 transition-colors" aria-label="Sign in">
                                <User size={18} />
                            </Link>
                        )}
                        <Link to="/cart" data-testid="nav-cart" className="relative p-1.5 sm:p-2 text-charcoal hover:text-amber2 transition-colors" aria-label="Cart">
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

            {/* Mobile Navigation Drawer */}
            {open && (
                <div className="md:hidden border-t border-[#E5E3DC] bg-ivory max-h-[calc(100vh-6rem)] overflow-y-auto overscroll-contain animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="p-5 space-y-6">
                        {/* Quick Search trigger */}
                        <button
                            onClick={() => { setOpen(false); setSearchOpen(true); }}
                            className="w-full flex items-center justify-between px-4 py-2.5 bg-ivory-2 border border-[#E5E3DC] text-xs tracking-editorial text-muted2"
                        >
                            <span>Search lighting collection…</span>
                            <Search size={14} />
                        </button>

                        {/* Collections / Categories */}
                        <div>
                            <div className="tracking-editorial text-amber2 text-[10px] mb-3">Lighting Collections</div>
                            <div className="grid grid-cols-2 gap-2">
                                {CATEGORIES.map((c) => (
                                    <button
                                        key={c.slug}
                                        onClick={() => go(`/shop/${c.slug}`)}
                                        className="text-left px-3 py-2 bg-ivory-2 border border-[#E5E3DC]/60 text-xs font-serif text-charcoal hover:border-amber2 hover:text-amber2 transition-colors truncate"
                                    >
                                        {c.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Rooms & Curated */}
                        <div>
                            <div className="tracking-editorial text-amber2 text-[10px] mb-2">Curated Spaces</div>
                            <div className="divide-y divide-[#E5E3DC]/60 border-y border-[#E5E3DC]/60">
                                <button onClick={() => go("/kits")} className="w-full flex items-center justify-between py-2.5 text-sm">
                                    <span>Lighting Kits</span>
                                    <ChevronRight size={14} className="text-muted2" />
                                </button>
                                <button onClick={() => go("/rooms")} className="w-full flex items-center justify-between py-2.5 text-sm">
                                    <span>Shop by Room</span>
                                    <ChevronRight size={14} className="text-muted2" />
                                </button>
                                <button onClick={() => go("/bespoke")} className="w-full flex items-center justify-between py-2.5 text-sm">
                                    <span>Bespoke Commissions</span>
                                    <ChevronRight size={14} className="text-muted2" />
                                </button>
                                <button onClick={() => go("/trade")} className="w-full flex items-center justify-between py-2.5 text-sm">
                                    <span>For Architects & Trade</span>
                                    <ChevronRight size={14} className="text-muted2" />
                                </button>
                            </div>
                        </div>

                        {/* Help & Contact */}
                        <div>
                            <div className="tracking-editorial text-muted2 text-[10px] mb-2">Support & Concierge</div>
                            <div className="divide-y divide-[#E5E3DC]/60 border-y border-[#E5E3DC]/60 text-sm">
                                <button onClick={() => go("/about")} className="w-full text-left py-2.5">Our Story</button>
                                <button onClick={() => go("/track")} className="w-full text-left py-2.5">Track Order</button>
                                <button onClick={() => go("/contact")} className="w-full text-left py-2.5">Contact Us</button>
                            </div>
                            <div className="pt-4 flex items-center gap-3">
                                <a
                                    href={`tel:${BRAND.phoneTel}`}
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-charcoal text-ivory text-xs tracking-editorial"
                                >
                                    <Phone size={13} /> Call Atelier
                                </a>
                                <a
                                    href={`https://wa.me/${BRAND.whatsapp.replace(/\D/g, "")}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#25D366] text-white text-xs tracking-editorial"
                                >
                                    WhatsApp
                                </a>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Search Overlay */}
            {searchOpen && (
                <div className="fixed inset-0 z-[60] bg-ivory/95 backdrop-blur-2xl flex items-start justify-center pt-16 sm:pt-24 px-4 sm:px-6 overflow-y-auto" onClick={() => setSearchOpen(false)}>
                    <div className="w-full max-w-2xl pb-16" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center border-b border-charcoal pb-3 gap-2">
                            <Search size={20} className="text-muted2 shrink-0" />
                            <input
                                ref={searchRef}
                                data-testid="search-input"
                                type="text"
                                value={q}
                                onChange={(e) => setQ(e.target.value)}
                                placeholder="Search chandeliers, pendants, lamps…"
                                className="w-full bg-transparent outline-none px-2 sm:px-4 py-1.5 font-serif text-lg sm:text-2xl"
                            />
                            <button data-testid="search-close" onClick={() => setSearchOpen(false)} className="p-2 text-charcoal hover:text-amber2" aria-label="Close search">
                                <X size={22} />
                            </button>
                        </div>
                        {results.length > 0 && (
                            <div className="mt-4 sm:mt-6 space-y-2">
                                {results.map((p) => (
                                    <button
                                        key={p.id}
                                        data-testid={`search-result-${p.slug}`}
                                        onClick={() => go(`/product/${p.slug}`)}
                                        className="w-full flex items-center gap-3 sm:gap-4 p-2 sm:p-3 hover:bg-ivory-2 text-left transition-colors"
                                    >
                                        <img src={p.images?.[0]} alt={p.name} className="w-12 h-12 sm:w-14 sm:h-14 object-cover shrink-0 bg-ivory-2" />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-serif text-base sm:text-lg truncate">{p.name}</div>
                                            <div className="text-[10px] sm:text-xs text-muted2 capitalize truncate">{p.category}</div>
                                        </div>
                                        <div className="text-xs sm:text-sm font-medium shrink-0">{formatINR(p.price)}</div>
                                    </button>
                                ))}
                            </div>
                        )}
                        {q && results.length === 0 && (
                            <div className="mt-6 text-sm text-muted2 text-center py-8">No matches found for "{q}".</div>
                        )}
                    </div>
                </div>
            )}
        </header>
    );
}
