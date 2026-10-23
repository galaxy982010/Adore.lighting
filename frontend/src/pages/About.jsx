import { BRAND } from "@/lib/api";

export default function About() {
    return (
        <div>
            <section className="relative h-[60vh] min-h-[420px] bg-charcoal">
                <img src="/hero/slide4.jpg" alt="" className="absolute inset-0 w-full h-full object-cover opacity-70" />
                <div className="absolute inset-0 bg-gradient-to-b from-charcoal/40 to-charcoal/70" />
                <div className="relative h-full max-w-[1400px] mx-auto px-6 md:px-10 flex flex-col justify-end pb-16 text-ivory">
                    <div className="tracking-editorial text-ivory/70 mb-4">About Adore</div>
                    <h1 className="font-serif text-5xl md:text-7xl max-w-3xl leading-tight">Light That Creates Your Vibes.</h1>
                </div>
            </section>

            <section className="max-w-[1000px] mx-auto px-6 md:px-10 py-24 space-y-8 text-lg leading-relaxed text-charcoal/80">
                <p className="font-serif text-3xl text-charcoal">
                    At Adore, we believe lighting is more than just illumination — it's the soul of every space. The right light has the power to transform a room, create unforgettable moments, and bring warmth, comfort, and elegance into everyday life.
                </p>
                <p>
                    Our mission is to provide thoughtfully designed lighting that combines premium craftsmanship, timeless aesthetics, and lasting performance. Whether you're decorating your home, upgrading your workspace, or creating the perfect ambience, Adore is here to help you discover lighting that reflects your style and personality.
                </p>
                <p>
                    Every product is carefully selected to deliver the perfect balance of beauty, functionality, and durability. From elegant chandeliers and pendant lights to modern wall lamps and decorative fixtures, our collection is designed to elevate every space with sophistication.
                </p>
            </section>

            <section className="bg-ivory-2 py-24">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                    <div className="tracking-editorial text-amber2 mb-6">Why Choose Adore?</div>
                    <h2 className="font-serif text-4xl md:text-5xl mb-16 max-w-xl">A studio built on care, not shortcuts.</h2>
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {[
                            ["Premium quality", "Every product is inspected on-floor before it ships."],
                            ["Elegant & modern designs", "An edited catalogue — every piece has a reason to be there."],
                            ["Secure online shopping", "Encrypted checkout via Razorpay · UPI, Cards, Netbanking."],
                            ["Fast order processing", "Dispatched within 48 hours of confirmation."],
                            ["Carefully packed products", "Foam-wrapped, corner-braced, delivered damage-free."],
                            ["Reliable customer support", "Mon–Sat · 10:00 AM – 7:00 PM (IST)."],
                            ["Delivery across India", "5–6 working days to every serviceable pincode."],
                        ].map(([t, d]) => (
                            <div key={t}>
                                <div className="font-serif text-2xl mb-3">{t}</div>
                                <div className="text-charcoal/70 leading-relaxed">{d}</div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="max-w-[1000px] mx-auto px-6 md:px-10 py-24 text-center">
                <p className="font-serif text-3xl leading-snug text-charcoal">
                    At Adore, we're not just selling lights — we're helping you create spaces where memories are made, conversations flow, and every moment feels extraordinary.
                </p>
                <div className="mt-10 tracking-editorial text-amber2">Thank you for choosing Adore.</div>
                <div className="mt-6 font-serif text-5xl">Adore</div>
                <div className="mt-2 tracking-editorial text-muted2">{BRAND.tagline}</div>
            </section>
        </div>
    );
}
