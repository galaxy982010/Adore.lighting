import { Link } from "react-router-dom";
import { useState } from "react";
import { toast } from "sonner";
import { Instagram, Facebook, Youtube, Linkedin, Phone, Mail } from "lucide-react";
import { api, BRAND, CATEGORIES } from "@/lib/api";
import { db } from "@/lib/supabase";

export default function Footer() {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        if (!email) return;
        setLoading(true);
        try {
            try {
                await db.subscribeNewsletter(email);
            } catch {
                await api.post("/newsletter", { email });
            }
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
            <div className="max-w-[1400px] mx-auto px-4 sm:px-6 md:px-10 py-12 sm:py-20 md:py-24">
                <div className="grid md:grid-cols-12 gap-10 md:gap-16">
                    <div className="md:col-span-5">
                        <div className="font-serif text-3xl sm:text-5xl mb-3 sm:mb-6">Adore</div>
                        <p className="text-ivory/70 max-w-md leading-relaxed text-xs sm:text-[15px]">
                            Editorial lighting for considered interiors. Handmade, sourced with intention, delivered with care across India.
                        </p>
                        <form onSubmit={submit} className="mt-6 sm:mt-10 max-w-md">
                            <div className="tracking-editorial text-ivory/60 mb-2 sm:mb-3 text-xs">Join the atelier</div>
                            <div className="flex border-b border-ivory/30">
                                <input
                                    data-testid="footer-newsletter-email"
                                    type="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder="Your email"
                                    className="flex-1 bg-transparent py-2.5 sm:py-3 outline-none placeholder:text-ivory/40 text-xs sm:text-sm"
                                />
                                <button data-testid="footer-newsletter-submit" disabled={loading} className="tracking-editorial hover:text-amber2 disabled:opacity-50 text-xs sm:text-sm">
                                    {loading ? "…" : "Subscribe"}
                                </button>
                            </div>
                        </form>
                    </div>

                    <div className="md:col-span-7 grid grid-cols-2 sm:grid-cols-3 gap-8 sm:gap-10">
                        <div>
                            <div className="tracking-editorial text-ivory/60 mb-3 sm:mb-5 text-xs">Shop</div>
                            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-ivory/80">
                                {CATEGORIES.slice(0, 7).map((c) => (
                                    <li key={c.slug}><Link to={`/shop/${c.slug}`} className="underline-link">{c.name}</Link></li>
                                ))}
                            </ul>
                        </div>

                        <div>
                            <div className="tracking-editorial text-ivory/60 mb-3 sm:mb-5 text-xs">Studio</div>
                            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-ivory/80">
                                <li><Link to="/about" className="underline-link">Our Story</Link></li>
                                <li><Link to="/bespoke" className="underline-link">Bespoke</Link></li>
                                <li><Link to="/trade" className="underline-link">For Architects</Link></li>
                                <li><Link to="/contact" className="underline-link">Contact</Link></li>
                            </ul>
                        </div>

                        <div className="col-span-2 sm:col-span-1">
                            <div className="tracking-editorial text-ivory/60 mb-3 sm:mb-5 text-xs">Care</div>
                            <ul className="space-y-2 sm:space-y-3 text-xs sm:text-sm text-ivory/80">
                                <li><Link to="/track" className="underline-link">Track Order</Link></li>
                                <li><Link to="/legal/shipping" className="underline-link">Shipping & Delivery</Link></li>
                                <li><Link to="/legal/returns" className="underline-link">Returns & Exchanges</Link></li>
                                <li><Link to="/legal/privacy" className="underline-link">Privacy Policy</Link></li>
                                <li><Link to="/legal/terms" className="underline-link">Terms of Service</Link></li>
                            </ul>
                            <div className="mt-4 sm:mt-6 space-y-1.5 sm:space-y-2 text-xs sm:text-sm text-ivory/70">
                                <a href={`tel:${BRAND.phoneTel}`} className="flex items-center gap-2 hover:text-amber2"><Phone size={13} />{BRAND.phoneDisplay}</a>
                                <a href={`mailto:${BRAND.email}`} className="flex items-center gap-2 hover:text-amber2"><Mail size={13} />{BRAND.email}</a>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-12 sm:mt-20 pt-6 sm:pt-8 border-t border-ivory/15 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
                    <div className="text-[11px] sm:text-xs text-ivory/50">© {new Date().getFullYear()} Adore Lighting. All rights reserved.</div>
                    <div className="flex items-center gap-4">
                        <a data-testid="social-instagram" href={BRAND.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="text-ivory/70 hover:text-amber2 transition-colors"><Instagram size={17} /></a>
                        <a data-testid="social-facebook" href={BRAND.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="text-ivory/70 hover:text-amber2 transition-colors"><Facebook size={17} /></a>
                        <a data-testid="social-youtube" href={BRAND.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="text-ivory/70 hover:text-amber2 transition-colors"><Youtube size={17} /></a>
                        <a data-testid="social-linkedin" href={BRAND.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="text-ivory/70 hover:text-amber2 transition-colors"><Linkedin size={17} /></a>
                    </div>
                </div>
            </div>
        </footer>
    );
}
