import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { Instagram, Facebook, Youtube, Linkedin, Phone, Mail } from "lucide-react";
import { api, BRAND, CATEGORIES } from "@/lib/api";

export default function Footer() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        try {
            await api.post("/newsletter", { email });
            toast.success("Welcome to Adore. Look for our next dispatch.");
            setEmail("");
        } catch {
            toast.error("Please try again in a moment.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <footer className="bg-charcoal text-ivory">
            <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-24">
                <div className="grid md:grid-cols-12 gap-16">
                    <div className="md:col-span-5">
                        <div className="font-serif text-5xl mb-6">Adore</div>
                        <p className="text-ivory/70 max-w-md leading-relaxed text-[15px]">
                            Editorial lighting for considered interiors. Handmade, sourced with intention, delivered with care across India.
                        </p>
                        <form onSubmit={submit} className="mt-10 max-w-md">
                            <div className="tracking-editorial text-ivory/60 mb-3">Join the atelier</div>
                            <div className="flex border-b border-ivory/30">
                                <input
                                    data-testid="footer-newsletter-email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Your email"
                                    className="flex-1 bg-transparent py-3 outline-none placeholder:text-ivory/40 text-sm"
                                />
                                <button data-testid="footer-newsletter-submit" disabled={loading} className="tracking-editorial hover:text-amber2 disabled:opacity-50">
                                    {loading ? "…" : "Subscribe"}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="md:col-span-2">
                        <div className="tracking-editorial text-ivory/60 mb-5">Shop</div>
                        <ul className="space-y-3 text-sm text-ivory/80">
                            {CATEGORIES.map((c) => (
                                <li key={c.slug}><Link to={`/shop/${c.slug}`} className="underline-link">{c.name}</Link></li>
                            ))}
                        </ul>
                    </div>

                    <div className="md:col-span-2">
                        <div className="tracking-editorial text-ivory/60 mb-5">Studio</div>
                        <ul className="space-y-3 text-sm text-ivory/80">
                            <li><Link to="/about" className="underline-link">Our Story</Link></li>
                            <li><Link to="/bespoke" className="underline-link">Bespoke</Link></li>
                            <li><Link to="/trade" className="underline-link">For Architects</Link></li>
                            <li><Link to="/contact" className="underline-link">Contact</Link></li>
                        </ul>
                    </div>

                    <div className="md:col-span-3">
                        <div className="tracking-editorial text-ivory/60 mb-5">Care</div>
                        <ul className="space-y-3 text-sm text-ivory/80">
                            <li><Link to="/track" className="underline-link">Track Order</Link></li>
                            <li><Link to="/legal/shipping" className="underline-link">Shipping & Delivery</Link></li>
                            <li><Link to="/legal/returns" className="underline-link">Returns & Exchanges</Link></li>
                            <li><Link to="/legal/privacy" className="underline-link">Privacy Policy</Link></li>
                            <li><Link to="/legal/terms" className="underline-link">Terms of Service</Link></li>
                        </ul>
                        <div className="mt-8 space-y-2 text-sm text-ivory/70">
                            <a href={`tel:${BRAND.phoneTel}`} className="flex items-center gap-2 hover:text-amber2"><Phone size={14} />{BRAND.phoneDisplay}</a>
                            <a href={`mailto:${BRAND.email}`} className="flex items-center gap-2 hover:text-amber2"><Mail size={14} />{BRAND.email}</a>
                        </div>
                    </div>
                </div>

                <div className="mt-20 pt-8 border-t border-ivory/15 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                    <div className="text-xs text-ivory/50">© {new Date().getFullYear()} Adore Lighting. All rights reserved.</div>
                    <div className="flex items-center gap-4">
                        <a data-testid="social-instagram" href={BRAND.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-ivory/70 hover:text-amber2 transition-colors"><Instagram size={18} /></a>
                        <a data-testid="social-facebook" href={BRAND.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-ivory/70 hover:text-amber2 transition-colors"><Facebook size={18} /></a>
                        <a data-testid="social-youtube" href={BRAND.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-ivory/70 hover:text-amber2 transition-colors"><Youtube size={18} /></a>
                        <a data-testid="social-linkedin" href={BRAND.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-ivory/70 hover:text-amber2 transition-colors"><Linkedin size={18} /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
