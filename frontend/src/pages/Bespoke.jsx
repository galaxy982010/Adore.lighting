import { useState } from "react";
import { toast } from "sonner";
import { api } from "@/lib/api";
import { db } from "@/lib/supabase";

export default function Bespoke() {
    return <InquiryPage
        title="Bespoke Commissions"
        eyebrow="One of one"
        heading="Lighting made for a room, not a catalogue."
        blurb="From a foyer chandelier scaled to a fifteen-metre atrium to a bedside sconce in a custom finish — our workshop takes on around forty bespoke commissions each year. Tell us about your space."
        inquiryType="bespoke"
    />;
}

export function InquiryPage({ title, eyebrow, heading, blurb, inquiryType }) {
    const [form, setForm] = useState({ name: "", email: "", phone: "", message: "" });
    const [sent, setSent] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        try {
            try {
                await db.submitInquiry({ ...form, inquiry_type: inquiryType });
            } catch {
                await api.post("/inquiry", { ...form, inquiry_type: inquiryType });
            }
            toast.success("Thank you — a studio lead will be in touch within 2 working days.");
            setSent(true);
        } catch {
            toast.error("Please try again in a moment.");
        }
    };

    return (
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16 grid lg:grid-cols-2 gap-16">
            <div>
                <div className="tracking-editorial text-muted2 mb-4">{eyebrow}</div>
                <h1 className="font-serif text-5xl md:text-6xl leading-tight">{title}</h1>
                <p className="mt-8 text-charcoal/75 leading-relaxed max-w-lg">{blurb}</p>
                <div className="mt-12 aspect-[4/5] overflow-hidden">
                    <img src="/hero/slide2.jpg" alt="" className="w-full h-full object-cover" />
                </div>
            </div>

            {sent ? (
                <div className="lg:sticky lg:top-32 self-start bg-ivory-2 p-10 text-center">
                    <div className="font-serif text-3xl mb-4">Received.</div>
                    <p className="text-charcoal/70">Our studio will be in touch within two working days.</p>
                </div>
            ) : (
                <form onSubmit={submit} className="lg:sticky lg:top-32 self-start bg-ivory-2 p-10 space-y-5">
                    <div className="tracking-editorial mb-2">{heading}</div>
                    <input data-testid="inquiry-name" required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border-b border-charcoal/30 bg-transparent py-3 outline-none focus:border-amber2" />
                    <input data-testid="inquiry-email" required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border-b border-charcoal/30 bg-transparent py-3 outline-none focus:border-amber2" />
                    <input data-testid="inquiry-phone" placeholder="Phone (optional)" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full border-b border-charcoal/30 bg-transparent py-3 outline-none focus:border-amber2" />
                    <textarea data-testid="inquiry-message" required placeholder="Tell us about your project — space, brief, timelines" rows="5" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="w-full border-b border-charcoal/30 bg-transparent py-3 outline-none focus:border-amber2 resize-none" />
                    <button data-testid="inquiry-submit" className="w-full bg-charcoal text-ivory py-4 tracking-editorial hover:bg-amber2 transition-colors">Send inquiry</button>
                </form>
            )}
        </div>
    );
}
