import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { Trash2, Plus, Upload, X } from "lucide-react";
import { api, imageUrl, formatINR, CATEGORIES } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

const EMPTY = {
    name: "", slug: "", category: "chandeliers", price: 0, description: "",
    finish: "", style: "", bulb_type: "", room: "", dimensions: "", material: "",
    images: [], stock: 10, featured: false, new_arrival: false,
};

export default function Admin() {
    const { user, loading } = useAuth();
    const [products, setProducts] = useState([]);
    const [editing, setEditing] = useState(null);
    const [form, setForm] = useState(EMPTY);
    const [uploading, setUploading] = useState(false);
    const [tab, setTab] = useState("products");
    const [orders, setOrders] = useState([]);
    const [inquiries, setInquiries] = useState([]);
    const [coupons, setCoupons] = useState([]);
    const [newCoupon, setNewCoupon] = useState({ code: "", percent_off: 10, flat_off: 0, min_order: 0, active: true });
    const navigate = useNavigate();

    useEffect(() => {
        if (loading) return;
        if (!user || user.role !== "admin") {
            navigate("/auth");
            return;
        }
        loadAll();
        // eslint-disable-next-line
    }, [user, loading]);

    const loadAll = async () => {
        const [pr, or, iq, cp] = await Promise.all([
            api.get("/products"),
            api.get("/orders"),
            api.get("/inquiries"),
            api.get("/coupons"),
        ]);
        setProducts(pr.data);
        setOrders(or.data);
        setInquiries(iq.data);
        setCoupons(cp.data);
    };

    const createCoupon = async (e) => {
        e.preventDefault();
        try {
            await api.post("/coupons", { ...newCoupon, code: newCoupon.code.trim().toUpperCase() });
            toast.success("Coupon created");
            setNewCoupon({ code: "", percent_off: 10, flat_off: 0, min_order: 0, active: true });
            loadAll();
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Failed");
        }
    };

    const deleteCoupon = async (code) => {
        if (!window.confirm(`Delete coupon ${code}?`)) return;
        await api.delete(`/coupons/${code}`);
        loadAll();
    };

    const upd = (k) => (e) => {
        const val = e.target.type === "checkbox" ? e.target.checked : (e.target.type === "number" ? Number(e.target.value) : e.target.value);
        setForm({ ...form, [k]: val });
    };

    const handleFile = async (e) => {
        const files = Array.from(e.target.files);
        setUploading(true);
        try {
            const urls = [];
            for (const f of files) {
                const fd = new FormData();
                fd.append("file", f);
                const r = await api.post("/upload", fd, { headers: { "Content-Type": "multipart/form-data" } });
                urls.push(r.data.url);
            }
            setForm((cur) => ({ ...cur, images: [...cur.images, ...urls] }));
            toast.success(`Uploaded ${urls.length} image(s)`);
        } catch {
            toast.error("Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const save = async () => {
        try {
            const payload = { ...form, slug: form.slug || form.name.toLowerCase().replace(/[^a-z0-9]+/g, "-") };
            if (editing) {
                await api.put(`/products/${editing.id}`, payload);
                toast.success("Updated");
            } else {
                await api.post("/products", payload);
                toast.success("Created");
            }
            setEditing(null);
            setForm(EMPTY);
            loadAll();
        } catch (err) {
            toast.error(err?.response?.data?.detail || "Save failed");
        }
    };

    const del = async (id) => {
        if (!window.confirm("Delete this product?")) return;
        await api.delete(`/products/${id}`);
        toast.success("Deleted");
        loadAll();
    };

    const edit = (p) => {
        setEditing(p);
        setForm({ ...EMPTY, ...p });
    };

    if (loading || !user) return null;

    return (
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-12">
            <div className="tracking-editorial text-muted2 mb-3">Studio</div>
            <h1 className="font-serif text-5xl mb-10">Admin</h1>

            <div className="flex gap-8 border-b border-[#E5E3DC] mb-10">
                {["products", "orders", "inquiries"].map((t) => (
                    <button
                        key={t}
                        data-testid={`admin-tab-${t}`}
                        onClick={() => setTab(t)}
                        className={`pb-3 tracking-editorial ${tab === t ? "text-amber2 border-b-2 border-amber2 -mb-px" : "text-muted2 hover:text-charcoal"}`}
                    >
                        {t} · {t === "products" ? products.length : t === "orders" ? orders.length : inquiries.length}
                    </button>
                ))}
            </div>

            {tab === "products" && (
                <div className="grid lg:grid-cols-[1fr_420px] gap-10">
                    <div>
                        <div className="flex justify-between items-center mb-6">
                            <div className="tracking-editorial">Catalogue</div>
                            <button data-testid="admin-new-product" onClick={() => { setEditing(null); setForm(EMPTY); }} className="tracking-editorial hover:text-amber2 flex items-center gap-2"><Plus size={14} /> New product</button>
                        </div>
                        <div className="divide-y divide-[#E5E3DC] border-t border-b border-[#E5E3DC]">
                            {products.map((p) => (
                                <div key={p.id} className="flex items-center gap-4 py-3">
                                    <img src={p.images?.[0]} alt="" className="w-14 h-16 object-cover bg-ivory-2" />
                                    <div className="flex-1">
                                        <div className="font-serif text-lg">{p.name}</div>
                                        <div className="text-xs text-muted2 capitalize">{p.category} · {formatINR(p.price)}</div>
                                    </div>
                                    <button data-testid={`admin-edit-${p.slug}`} onClick={() => edit(p)} className="text-xs tracking-editorial hover:text-amber2">Edit</button>
                                    <button data-testid={`admin-delete-${p.slug}`} onClick={() => del(p.id)} className="text-muted2 hover:text-amber2"><Trash2 size={14} /></button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <aside className="lg:sticky lg:top-32 self-start bg-ivory-2 p-6 space-y-3">
                        <div className="tracking-editorial mb-3">{editing ? "Edit product" : "New product"}</div>
                        <input data-testid="admin-name" placeholder="Name" value={form.name} onChange={upd("name")} className="w-full border-b border-charcoal/30 bg-transparent py-2 outline-none focus:border-amber2 text-sm" />
                        <input data-testid="admin-slug" placeholder="slug (auto if empty)" value={form.slug} onChange={upd("slug")} className="w-full border-b border-charcoal/30 bg-transparent py-2 outline-none focus:border-amber2 text-sm" />
                        <select data-testid="admin-category" value={form.category} onChange={upd("category")} className="w-full border-b border-charcoal/30 bg-transparent py-2 outline-none text-sm">
                            {CATEGORIES.map((c) => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                        </select>
                        <input data-testid="admin-price" type="number" placeholder="Price (₹)" value={form.price} onChange={upd("price")} className="w-full border-b border-charcoal/30 bg-transparent py-2 outline-none focus:border-amber2 text-sm" />
                        <textarea data-testid="admin-description" placeholder="Description" rows="3" value={form.description} onChange={upd("description")} className="w-full border-b border-charcoal/30 bg-transparent py-2 outline-none focus:border-amber2 text-sm resize-none" />
                        <div className="grid grid-cols-2 gap-2">
                            <input placeholder="Finish" value={form.finish} onChange={upd("finish")} className="border-b border-charcoal/30 bg-transparent py-2 outline-none text-sm" />
                            <input placeholder="Style" value={form.style} onChange={upd("style")} className="border-b border-charcoal/30 bg-transparent py-2 outline-none text-sm" />
                            <input placeholder="Bulb type" value={form.bulb_type} onChange={upd("bulb_type")} className="border-b border-charcoal/30 bg-transparent py-2 outline-none text-sm" />
                            <input placeholder="Room" value={form.room} onChange={upd("room")} className="border-b border-charcoal/30 bg-transparent py-2 outline-none text-sm" />
                            <input placeholder="Dimensions" value={form.dimensions} onChange={upd("dimensions")} className="border-b border-charcoal/30 bg-transparent py-2 outline-none text-sm" />
                            <input placeholder="Material" value={form.material} onChange={upd("material")} className="border-b border-charcoal/30 bg-transparent py-2 outline-none text-sm" />
                            <input type="number" placeholder="Stock" value={form.stock} onChange={upd("stock")} className="border-b border-charcoal/30 bg-transparent py-2 outline-none text-sm" />
                        </div>
                        <div className="flex gap-4 pt-2">
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.featured} onChange={upd("featured")} className="accent-[#B85B24]" /> Featured</label>
                            <label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={form.new_arrival} onChange={upd("new_arrival")} className="accent-[#B85B24]" /> New arrival</label>
                        </div>

                        <div className="pt-2">
                            <div className="tracking-editorial mb-2">Images</div>
                            <div className="grid grid-cols-4 gap-2 mb-2">
                                {form.images.map((im, i) => (
                                    <div key={i} className="relative aspect-square bg-ivory">
                                        <img src={imageUrl(im)} alt="" className="w-full h-full object-cover" />
                                        <button onClick={() => setForm({ ...form, images: form.images.filter((_, j) => j !== i) })} className="absolute top-1 right-1 bg-charcoal/80 text-ivory rounded-full p-0.5"><X size={12} /></button>
                                    </div>
                                ))}
                            </div>
                            <label data-testid="admin-upload" className="inline-flex items-center gap-2 tracking-editorial cursor-pointer hover:text-amber2">
                                <Upload size={14} /> {uploading ? "Uploading…" : "Upload images"}
                                <input type="file" multiple accept="image/*" hidden onChange={handleFile} />
                            </label>
                            <div className="text-[10px] text-muted2 mt-1">Or paste URLs, comma-separated</div>
                            <input placeholder="https://... , https://..." onBlur={(e) => { if (e.target.value.trim()) { setForm({ ...form, images: [...form.images, ...e.target.value.split(",").map(s => s.trim()).filter(Boolean)] }); e.target.value = ""; } }} className="w-full border-b border-charcoal/30 bg-transparent py-2 outline-none text-xs mt-1" />
                        </div>

                        <div className="flex gap-3 pt-4">
                            <button data-testid="admin-save-product" onClick={save} className="flex-1 bg-charcoal text-ivory py-3 tracking-editorial hover:bg-amber2 transition-colors">{editing ? "Update" : "Create"}</button>
                            {editing && <button onClick={() => { setEditing(null); setForm(EMPTY); }} className="tracking-editorial px-4">Cancel</button>}
                        </div>
                    </aside>
                </div>
            )}

            {tab === "orders" && (
                <div className="divide-y divide-[#E5E3DC] border-t border-b border-[#E5E3DC]">
                    {orders.map((o) => (
                        <div key={o.id} className="grid grid-cols-6 gap-4 py-4 items-center text-sm">
                            <div className="font-serif text-lg col-span-2">{o.order_number}</div>
                            <div>{o.customer_name}<br /><span className="text-xs text-muted2">{o.email}</span></div>
                            <div className="capitalize"><span className="inline-block px-2 py-1 bg-ivory-2 text-xs tracking-editorial">{o.status}</span></div>
                            <div>{o.city}</div>
                            <div className="text-right font-serif text-lg">{formatINR(o.total)}</div>
                        </div>
                    ))}
                    {orders.length === 0 && <div className="py-8 text-center text-muted2">No orders yet.</div>}
                </div>
            )}

            {tab === "inquiries" && (
                <div className="divide-y divide-[#E5E3DC] border-t border-b border-[#E5E3DC]">
                    {inquiries.map((q) => (
                        <div key={q.id} className="py-4">
                            <div className="flex justify-between items-start mb-2">
                                <div><span className="font-serif text-lg">{q.name}</span> <span className="text-xs text-muted2 ml-2">· {q.email}</span></div>
                                <span className="tracking-editorial text-amber2 text-xs">{q.inquiry_type}</span>
                            </div>
                            <p className="text-sm text-charcoal/80">{q.message}</p>
                        </div>
                    ))}
                    {inquiries.length === 0 && <div className="py-8 text-center text-muted2">No inquiries yet.</div>}
                </div>
            )}

            {tab === "coupons" && (
                <div className="grid lg:grid-cols-[1fr_360px] gap-10">
                    <div>
                        <div className="tracking-editorial mb-4">Active coupons</div>
                        {coupons.length === 0 ? (
                            <div className="text-muted2 text-sm">No coupons yet.</div>
                        ) : (
                            <div className="divide-y divide-[#E5E3DC] border-t border-b border-[#E5E3DC]">
                                {coupons.map((c) => (
                                    <div key={c.code} data-testid={`coupon-row-${c.code}`} className="flex items-center gap-4 py-4 text-sm">
                                        <div className="font-serif text-2xl w-32">{c.code}</div>
                                        <div className="flex-1">
                                            <div>{c.percent_off > 0 ? `${c.percent_off}% off` : ""}{c.flat_off > 0 ? ` ${formatINR(c.flat_off)} off` : ""}</div>
                                            <div className="text-xs text-muted2">Min order {formatINR(c.min_order)}</div>
                                        </div>
                                        <span className={`text-xs tracking-editorial ${c.active ? "text-amber2" : "text-muted2"}`}>{c.active ? "Active" : "Inactive"}</span>
                                        <button data-testid={`coupon-delete-${c.code}`} onClick={() => deleteCoupon(c.code)} className="text-muted2 hover:text-amber2"><Trash2 size={14} /></button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                    <form onSubmit={createCoupon} className="bg-ivory-2 p-6 space-y-3 self-start">
                        <div className="tracking-editorial mb-2">New coupon</div>
                        <input data-testid="coupon-new-code" required placeholder="Code (e.g. DIWALI20)" value={newCoupon.code} onChange={(e) => setNewCoupon({ ...newCoupon, code: e.target.value.toUpperCase() })} className="w-full border-b border-charcoal/30 bg-transparent py-2 outline-none focus:border-amber2 text-sm" />
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <div className="text-[10px] text-muted2 mb-1">% off</div>
                                <input data-testid="coupon-new-percent" type="number" min="0" max="100" value={newCoupon.percent_off} onChange={(e) => setNewCoupon({ ...newCoupon, percent_off: Number(e.target.value) })} className="w-full border-b border-charcoal/30 bg-transparent py-2 outline-none text-sm" />
                            </div>
                            <div>
                                <div className="text-[10px] text-muted2 mb-1">Flat ₹ off</div>
                                <input data-testid="coupon-new-flat" type="number" min="0" value={newCoupon.flat_off} onChange={(e) => setNewCoupon({ ...newCoupon, flat_off: Number(e.target.value) })} className="w-full border-b border-charcoal/30 bg-transparent py-2 outline-none text-sm" />
                            </div>
                        </div>
                        <div>
                            <div className="text-[10px] text-muted2 mb-1">Min order ₹</div>
                            <input data-testid="coupon-new-min" type="number" min="0" value={newCoupon.min_order} onChange={(e) => setNewCoupon({ ...newCoupon, min_order: Number(e.target.value) })} className="w-full border-b border-charcoal/30 bg-transparent py-2 outline-none text-sm" />
                        </div>
                        <label className="flex items-center gap-2 text-sm pt-2">
                            <input type="checkbox" checked={newCoupon.active} onChange={(e) => setNewCoupon({ ...newCoupon, active: e.target.checked })} className="accent-[#B85B24]" /> Active
                        </label>
                        <button data-testid="coupon-create-btn" className="w-full bg-charcoal text-ivory py-3 tracking-editorial hover:bg-amber2 transition-colors">Create coupon</button>
                    </form>
                </div>
            )}
        </div>
    );
}
