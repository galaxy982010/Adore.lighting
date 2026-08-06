import { useState } from "react";
import { toast } from "sonner";
import { Instagram, Facebook, Youtube, Linkedin, Phone, Mail, MessageCircle } from "lucide-react";
import { api, BRAND } from "@/lib/api";

export default function Contact() {
    const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
    const [sent, setSent] = useState(false);
    const [loading, setLoading] = useState(false);
    const [phoneErr, setPhoneErr] = useState("");

    const validPhone = (v) => !v || /^[6-9]\d{9}$/.test(v.replace(/\D/g, "").slice(-10));

    const submit = async (e) => {
        e.preventDefault();
        if (!validPhone(form.phone)) {
            setPhoneErr("Please enter a valid 10-digit Indian mobile number (starting 6–9).");
            toast.error("Please enter a valid Indian phone number.");
            return;
        }
        setPhoneErr("");
        setLoading(true);
        try {
            await api.post("/inquiry", { ...form, inquiry_type: "contact" });
            setSent(true);
            toast.success("Thank you — we'll be in touch within a working day.");
        } catch {
            toast.error("Please try again in a moment.");
        } finally {
            setLoading(false);
        }
    };

    const wa = BRAND.whatsapp.replace(/\D/g, "");

    return (
        <div>
            <section className="max-w-[1400px] mx-auto px-6 md:px-10 pt-16 pb-8">
                <div className="tracking-editorial text-muted2 mb-4">We're listening</div>
                <h1 className="font-serif text-5xl md:text-6xl">Contact</h1>
                <p className="mt-4 max-w-xl text-charcoal/70">Questions about products, orders, installation or your project brief — a member of the studio typically replies within a working day.</p>
            </section>

            <section className="max-w-[1400px] mx-auto px-6 md:px-10 pb-24 grid lg:grid-cols-2 gap-16">
                <div className="space-y-8">
                    <div className="grid sm:grid-cols-2 gap-6">
                        <a href={`tel:${BRAND.phoneTel}`} data-testid="contact-phone" className="block p-6 bg-ivory-2 hover:bg-ivory hover:border hover:border-amber2 border border-transparent transition-colors">
                            <Phone size={18} className="text-amber2 mb-3" />
                            <div className="tracking-editorial text-muted2 mb-2">Call the studio</div>
                            <div className="font-serif text-xl">{BRAND.phoneDisplay}</div>
                        </a>
                        <a href={`mailto:${BRAND.email}`} data-testid="contact-email" className="block p-6 bg-ivory-2 hover:bg-ivory hover:border hover:border-amber2 border border-transparent transition-colors">
                            <Mail size={18} className="text-amber2 mb-3" />
                            <div className="tracking-editorial text-muted2 mb-2">Write to us</div>
                            <div className="font-serif text-xl break-all">{BRAND.email}</div>
                        </a>
                        <a href={`https://wa.me/${wa}`} target="_blank" rel="noopener noreferrer" data-testid="contact-whatsapp" className="block p-6 bg-ivory-2 hover:bg-ivory hover:border hover:border-amber2 border border-transparent transition-colors">
                            <MessageCircle size={18} className="text-amber2 mb-3" />
                            <div className="tracking-editorial text-muted2 mb-2">WhatsApp</div>
                            <div className="font-serif text-xl">Instant reply</div>
                        </a>
                        <div className="block p-6 bg-ivory-2">
                            <Phone size={18} className="text-amber2 mb-3" />
                            <div className="tracking-editorial text-muted2 mb-2">Support hours</div>
                            <div className="text-sm">Mon–Sat<br />10:00 AM – 7:00 PM (IST)</div>
                        </div>
                    </div>

                    <div>
                        <div className="tracking-editorial text-muted2 mb-4">Follow the studio</div>
                        <div className="flex items-center gap-4">
                            <a href={BRAND.instagram} target="_blank" rel="noopener noreferrer" aria-label="Instagram" className="w-11 h-11 border border-charcoal/20 flex items-center justify-center hover:bg-charcoal hover:text-ivory hover:border-charcoal transition-colors"><Instagram size={16} /></a>
                            <a href={BRAND.facebook} target="_blank" rel="noopener noreferrer" aria-label="Facebook" className="w-11 h-11 border border-charcoal/20 flex items-center justify-center hover:bg-charcoal hover:text-ivory hover:border-charcoal transition-colors"><Facebook size={16} /></a>
                            <a href={BRAND.youtube} target="_blank" rel="noopener noreferrer" aria-label="YouTube" className="w-11 h-11 border border-charcoal/20 flex items-center justify-center hover:bg-charcoal hover:text-ivory hover:border-charcoal transition-colors"><Youtube size={16} /></a>
                            <a href={BRAND.linkedin} target="_blank" rel="noopener noreferrer" aria-label="LinkedIn" className="w-11 h-11 border border-charcoal/20 flex items-center justify-center hover:bg-charcoal hover:text-ivory hover:border-charcoal transition-colors"><Linkedin size={16} /></a>
                        </div>
                    </div>

                    {/* Google Maps */}
                    <div>
                        <div className="tracking-editorial text-muted2 mb-4">Find us</div>
                        <div className="aspect-[16/10] bg-ivory-2 overflow-hidden">
                            <iframe
                                title="Adore Studio Location"
                                src="https://maps.google.com/maps?q=New+Delhi&t=&z=11&ie=UTF8&iwloc=&output=embed"
                                width="100%"
                                height="100%"
                                loading="lazy"
                                referrerPolicy="no-referrer-when-downgrade"
                                style={{ border: 0 }}
                            />
                        </div>
                    </div>
                </div>

                {/* Contact form */}
                <div>
                    {sent ? (
                        <div className="bg-ivory-2 p-10 text-center">
                            <div className="font-serif text-3xl mb-4">Message received.</div>
                            <p className="text-charcoal/70">Our studio will reply within one working day.</p>
                        </div>
                    ) : (
                        <form onSubmit={submit} className="bg-ivory-2 p-10 space-y-5 lg:sticky lg:top-32">
                            <div className="tracking-editorial mb-2">Send a message</div>
                            <input data-testid="contact-form-name" required minLength={2} placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border-b border-charcoal/30 bg-transparent py-3 outline-none focus:border-amber2" />
                            <input data-testid="contact-form-email" required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border-b border-charcoal/30 bg-transparent py-3 outline-none focus:border-amber2" />
                            <input data-testid="contact-form-phone" placeholder="Phone (10 digits, optional)" inputMode="tel" value={form.phone} onChange={(e) => { setForm({ ...form, phone: e.target.value }); if (phoneErr) setPhoneErr(""); }} onBlur={() => { if (!validPhone(form.phone)) setPhoneErr("Please enter a valid 10-digit Indian mobile number (starting 6–9)."); }} className={`w-full border-b bg-transparent py-3 outline-none ${phoneErr ? "border-terracotta focus:border-terracotta" : "border-charcoal/30 focus:border-amber2"}`} />
                            {phoneErr && <div data-testid="contact-phone-error" className="text-xs text-terracotta -mt-3">{phoneErr}</div>}
                            <textarea data-testid="contact-form-message" required minLength={10} placeholder="How can we help?" rows="5" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full border-b border-charcoal/30 bg-transparent py-3 outline-none focus:border-amber2 resize-none" />
                            <button data-testid="contact-form-submit" disabled={loading} className="w-full bg-charcoal text-ivory py-4 tracking-editorial hover:bg-amber2 transition-colors disabled:opacity-60">{loading ? "Sending…" : "Send message"}</button>
                        </form>
                    )}
                </div>
            </section>
        </div>
    );
}
