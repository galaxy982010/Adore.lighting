import { useEffect, useState } from "react";
import { useParams, useLocation, useSearchParams, Link } from "react-router-dom";
import { api, CATEGORIES, ROOMS } from "@/lib/api";
import ProductCard from "@/components/ProductCard";

export default function Category() {
    const { category, room } = useParams();
    const { pathname } = useLocation();
    const [searchParams, setSearchParams] = useSearchParams();
    const sub = searchParams.get("sub") || "";
    const isRoom = pathname.startsWith("/rooms/");
    const [products, setProducts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filters, setFilters] = useState({ min_price: "", max_price: "", finish: "", style: "" });
    const [sort, setSort] = useState("featured");

    const catEntry = CATEGORIES.find((c) => c.slug === category);
    const roomEntry = isRoom ? ROOMS.find((r) => r.slug === room?.toLowerCase()) : null;
    const meta = isRoom
        ? { name: roomEntry?.name || room, tag: "Shop by Room", blurb: `Considered lighting for the ${(roomEntry?.name || room).toLowerCase()} — layered and warm.` }
        : { name: catEntry?.name || category, tag: "Collection", blurb: catEntry?.description };

    useEffect(() => {
        setLoading(true);
        const params = {};
        if (isRoom) params.room = room;
        else {
            params.category = category;
            if (sub) params.subcategory = sub;
        }
        Object.entries(filters).forEach(([k, v]) => { if (v) params[k] = v; });
        api.get("/products", { params }).then((r) => {
            let list = r.data;
            if (sort === "price-asc") list = [...list].sort((a, b) => a.price - b.price);
            else if (sort === "price-desc") list = [...list].sort((a, b) => b.price - a.price);
            else if (sort === "new") list = [...list].sort((a, b) => (b.new_arrival ? 1 : 0) - (a.new_arrival ? 1 : 0));
            setProducts(list);
            setLoading(false);
        });
    }, [category, room, isRoom, sub, filters, sort]);

    const finishes = [...new Set(products.map((p) => p.finish).filter(Boolean))];
    const styles = [...new Set(products.map((p) => p.style).filter(Boolean))];

    const setSub = (s) => {
        if (s) setSearchParams({ sub: s });
        else setSearchParams({});
    };

    return (
        <div>
            <div className="max-w-[1400px] mx-auto px-6 md:px-10 pt-16 pb-6">
                <div className="tracking-editorial text-muted2 mb-4">{meta.tag}</div>
                <h1 className="font-serif text-5xl md:text-6xl">{meta.name}</h1>
                {meta.blurb && <p className="mt-4 max-w-xl text-charcoal/70">{meta.blurb}</p>}
            </div>

            {/* Subcategory chips */}
            {!isRoom && catEntry?.subs && (
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 flex flex-wrap gap-3 mb-4">
                    <button
                        data-testid="sub-all"
                        onClick={() => setSub("")}
                        className={`px-4 py-2 text-xs tracking-editorial border transition-colors ${!sub ? "bg-charcoal text-ivory border-charcoal" : "border-charcoal/30 hover:border-amber2 hover:text-amber2"}`}
                    >
                        All {meta.name}
                    </button>
                    {catEntry.subs.map((s) => (
                        <button
                            key={s.slug}
                            data-testid={`sub-${s.slug}`}
                            onClick={() => setSub(s.slug)}
                            className={`px-4 py-2 text-xs tracking-editorial border transition-colors ${sub === s.slug ? "bg-charcoal text-ivory border-charcoal" : "border-charcoal/30 hover:border-amber2 hover:text-amber2"}`}
                        >
                            {s.name}
                        </button>
                    ))}
                </div>
            )}

            <div className="max-w-[1400px] mx-auto px-6 md:px-10 grid lg:grid-cols-[240px_1fr] gap-12 pb-24 pt-6">
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
                        {finishes.length > 1 && (
                            <div>
                                <div className="text-muted2 mb-2">Finish</div>
                                <select data-testid="filter-finish" value={filters.finish} onChange={(e) => setFilters({ ...filters, finish: e.target.value })} className="w-full border-b border-charcoal/30 bg-transparent py-1 outline-none">
                                    <option value="">All</option>
                                    {finishes.map((f) => <option key={f} value={f}>{f}</option>)}
                                </select>
                            </div>
                        )}
                        {styles.length > 1 && (
                            <div>
                                <div className="text-muted2 mb-2">Style</div>
                                <select data-testid="filter-style" value={filters.style} onChange={(e) => setFilters({ ...filters, style: e.target.value })} className="w-full border-b border-charcoal/30 bg-transparent py-1 outline-none">
                                    <option value="">All</option>
                                    {styles.map((s) => <option key={s} value={s}>{s}</option>)}
                                </select>
                            </div>
                        )}
                        <button onClick={() => setFilters({ min_price: "", max_price: "", finish: "", style: "" })} className="tracking-editorial hover:text-amber2">Clear all</button>
                    </div>
                </aside>

                <div>
                    <div className="flex items-center justify-between mb-8">
                        <div className="text-sm text-muted2">{loading ? "Loading" : `${products.length} piece${products.length === 1 ? "" : "s"}`}</div>
                        <select data-testid="sort-select" value={sort} onChange={(e) => setSort(e.target.value)} className="bg-transparent border-b border-charcoal/30 text-sm py-1 outline-none">
                            <option value="featured">Featured</option>
                            <option value="new">Newest</option>
                            <option value="price-asc">Price: Low to High</option>
                            <option value="price-desc">Price: High to Low</option>
                        </select>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 md:gap-10">
                        {products.map((p) => <ProductCard key={p.id} product={p} />)}
                    </div>
                    {!loading && products.length === 0 && (
                        <div className="py-24 text-center text-muted2">
                            <div>No pieces in this collection yet.</div>
                            <Link to="/" className="tracking-editorial hover:text-amber2 mt-4 inline-block">Explore other collections →</Link>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
