import { useEffect, useState } from "react";
import { useParams, useLocation, useSearchParams, Link } from "react-router-dom";
import { CATEGORIES, ROOMS } from "@/lib/api";
import * as Shopify from "@/lib/shopify";
import ProductCard from "@/components/ProductCard";

export default function Category() {
    const { category, room } = useParams();
    const { pathname } = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const sub = searchParams.get("sub") || "";
    const isRoom = pathname.startsWith("/rooms/");
    const [allProducts, setAllProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [filters, setFilters] = useState({ min_price: "", max_price: "", finish: "", style: "" });
    const [sort, setSort] = useState("featured");

    const catEntry = CATEGORIES.find((c) => c.slug === category);
    const roomEntry = isRoom ? ROOMS.find((r) => r.slug === room?.toLowerCase()) : null;
    const meta = isRoom
        ? { name: roomEntry?.name || room || "Room", tag: "Shop by Room", blurb: `Considered lighting for the ${(roomEntry?.name || room || "room").toLowerCase()} — layered and warm.` }
        : { name: catEntry?.name || category, tag: "Collection", blurb: catEntry?.description };

    useEffect(() => {
        setLoading(true);
        setError(false);
        // Fetch ALL products (no server-side filter — this Shopify store uses
        // productType, not tags/collections, so we filter client-side).
        Shopify.listProducts({ first: 250 })
            .then((list) => {
                let scoped;
                if (isRoom) {
                    const rSlug = (roomEntry?.slug || room || "").toLowerCase();
                    scoped = list.filter((p) =>
                        (p.tags || []).includes(rSlug) ||
                        (p.productType || "").toLowerCase().includes(rSlug)
                    );
                } else {
                    scoped = list.filter((p) => p.category === category);
                }
                setAllProducts(scoped);
                setLoading(false);
            })
            .catch(() => {
                setError(true);
                setLoading(false);
                setAllProducts([]);
            });
    }, [category, room, isRoom, roomEntry?.slug]);

    // Client-side sub-category + filters + sort
    let products = allProducts;
    if (!isRoom && sub) products = products.filter((p) => p.subcategory === sub || p.tags?.includes(sub));
    if (filters.min_price) products = products.filter((p) => p.price >= Number(filters.min_price));
    if (filters.max_price) products = products.filter((p) => p.price <= Number(filters.max_price));
    if (sort === "price-asc") products = [...products].sort((a, b) => a.price - b.price);
    else if (sort === "price-desc") products = [...products].sort((a, b) => b.price - a.price);
    else if (sort === "new") products = [...products].sort((a, b) => (b.new_arrival ? 1 : 0) - (a.new_arrival ? 1 : 0));

    const setSub = (s) => (s ? setSearchParams({ sub: s }) : setSearchParams({}));

    const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

    return (
        <div>
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 pt-8 sm:pt-16 pb-4 sm:pb-6">
                <div className="tracking-editorial text-muted2 mb-2 sm:mb-4 text-xs">{meta.tag}</div>
                <h1 className="font-serif text-3xl sm:text-5xl md:text-6xl">{meta.name}</h1>
                {meta.blurb && <p className="mt-2 sm:mt-4 max-w-xl text-charcoal/70 text-xs sm:text-base">{meta.blurb}</p>}
            </div>

            {!isRoom && catEntry?.subs && (
                <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 flex items-center gap-2 overflow-x-auto no-scrollbar pb-2 sm:pb-0 sm:flex-wrap mb-4">
                    <button data-testid="sub-all" onClick={() => setSub("")}
                        className={`px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs tracking-editorial border shrink-0 transition-colors ${!sub ? "bg-charcoal text-ivory border-charcoal" : "border-charcoal/30 hover:border-amber2 hover:text-amber2"}`}>
                        All {meta.name}
                    </button>
                    {catEntry.subs.map((s) => (
                        <button key={s.slug} data-testid={`sub-${s.slug}`} onClick={() => setSub(s.slug)}
                            className={`px-3 sm:px-4 py-1.5 sm:py-2 text-[11px] sm:text-xs tracking-editorial border shrink-0 transition-colors ${sub === s.slug ? "bg-charcoal text-ivory border-charcoal" : "border-charcoal/30 hover:border-amber2 hover:text-amber2"}`}>
                            {s.name}
                        </button>
                    ))}
                </div>
            )}

            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 grid lg:grid-cols-[240px_1fr] gap-8 lg:gap-12 pb-16 sm:pb-24 pt-4 sm:pt-6">
                {/* Desktop Sidebar */}
                <aside className="hidden lg:block sticky top-32 self-start">
                    <div className="tracking-editorial mb-4">Refine</div>
                    <div className="space-y-6 text-sm">
                        <div>
                            <div className="text-muted2 mb-2">Price (₹)</div>
                            <div className="flex gap-2">
                                <input data-testid="filter-min-price" type="number" placeholder="Min" value={filters.min_price} onChange={(e) => setFilters({ ...filters, min_price: e.target.value })} className="w-full border-b border-charcoal/30 bg-transparent py-1 outline-none focus:border-amber2" />
                                <input data-testid="filter-max-price" type="number" placeholder="Max" value={filters.max_price} onChange={(e) => setFilters({ ...filters, max_price: e.target.value })} className="w-full border-b border-charcoal/30 bg-transparent py-1 outline-none focus:border-amber2" />
                            </div>
                        </div>
                        <button onClick={() => setFilters({ min_price: "", max_price: "", finish: "", style: "" })} className="tracking-editorial hover:text-amber2">Clear all</button>
                    </div>
                </aside>

                <div>
                    <div className="flex items-center justify-between mb-6 sm:mb-8 flex-wrap gap-3">
                        <div className="text-xs sm:text-sm text-muted2">
                            {loading ? "Loading" : error ? "Unable to load — please try again" : `${products.length} piece${products.length === 1 ? "" : "s"}`}
                        </div>
                        <div className="flex items-center gap-3">
                            <button
                                onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
                                className="lg:hidden text-xs tracking-editorial border border-charcoal/30 px-3 py-1 hover:border-amber2"
                            >
                                {mobileFilterOpen ? "Close Filters" : "Filter Price"}
                            </button>
                            <select data-testid="sort-select" value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent border-b border-charcoal/30 text-xs sm:text-sm py-1 outline-none">
                                <option value="featured">Featured</option>
                                <option value="new">Newest</option>
                                <option value="price-asc">Price: Low to High</option>
                                <option value="price-desc">Price: High to Low</option>
                            </select>
                        </div>
                    </div>

                    {/* Mobile collapsible filter */}
                    {mobileFilterOpen && (
                        <div className="lg:hidden mb-6 p-4 bg-ivory-2 border border-[#E5E3DC]">
                            <div className="text-xs tracking-editorial text-muted2 mb-2">Filter by Price (₹)</div>
                            <div className="flex gap-2">
                                <input type="number" placeholder="Min" value={filters.min_price} onChange={(e) => setFilters({ ...filters, min_price: e.target.value })} className="w-full border-b border-charcoal/30 bg-transparent py-1 text-sm outline-none focus:border-amber2" />
                                <input type="number" placeholder="Max" value={filters.max_price} onChange={(e) => setFilters({ ...filters, max_price: e.target.value })} className="w-full border-b border-charcoal/30 bg-transparent py-1 text-sm outline-none focus:border-amber2" />
                            </div>
                            <button onClick={() => setFilters({ min_price: "", max_price: "", finish: "", style: "" })} className="mt-3 text-xs tracking-editorial text-amber2">Clear</button>
                        </div>
                    )}

                    {loading ? (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 md:gap-10">
                            {[1, 2, 3, 4, 5, 6].map((i) => (
                                <div key={i} className="animate-pulse">
                                    <div className="aspect-[4/5] bg-ivory-2" />
                                    <div className="h-4 bg-ivory-2 mt-4 w-2/3" />
                                    <div className="h-3 bg-ivory-2 mt-2 w-1/3" />
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 sm:gap-6 md:gap-10">
                            {products.map((p) => <ProductCard key={p.id} product={p} />)}
                        </div>
                    )}

                    {!loading && products.length === 0 && !error && (
                        <div className="py-20 sm:py-24 text-center text-muted2">
                            <div className="font-serif text-2xl text-charcoal mb-3">Coming soon</div>
                            <div>No pieces in this collection yet.</div>
                            <Link to="/" className="tracking-editorial hover:text-amber2 mt-4 inline-block text-xs sm:text-sm">Explore other collections →</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
