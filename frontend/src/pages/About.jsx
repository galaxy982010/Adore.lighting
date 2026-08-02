import { BRAND } from "@/lib/api";

export default function About() {
    return (
        <div>
            <section className="relative h-[60vh] min-h-[420px] bg-charcoal">
                <img src="https://images.unsplash.com/photo-1706820229870-f9a8c6dac193?w=2000&q=85" alt="" className="absolute inset-0 w-full h-full object-cover opacity-70" />
                <div className="relative h-full max-w-[1400px] mx-auto px-6 md:px-10 flex flex-col justify-end pb-16 text-ivory">
                    <div className="tracking-editorial text-ivory/70 mb-4">Our Story</div>
                    <h1 className="font-serif text-5xl md:text-7xl max-w-3xl leading-tight">Light, made slowly.</h1>
                </div>
            </section>

            <section className="max-w-[1000px] mx-auto px-6 md:px-10 py-24 space-y-8 text-lg leading-relaxed text-charcoal/80">
                <p className="font-serif text-3xl text-charcoal">
                    Adore began in 2008, in a small workshop in Mumbai, with a single conviction — that lighting was the most overlooked decision in Indian homes.
                </p>
                <p>
                    Over {BRAND.yearsInBusiness} years we've grown into {BRAND.storeCount} ateliers across {BRAND.cities.length} cities, but the workshop instinct remains. We commission from independent Indian glassblowers and metalsmiths, we vet every fixture on-floor before it ships, and we install with our own trained teams.
                </p>
                <p>
                    We resist trends. Our chandeliers are engineered to outlive their fashions; our floor lamps are as much about the shadow they throw as the light they cast. If a piece cannot earn its place in a room over a decade, it doesn't earn its place in Adore.
                </p>
                <p>
                    Today we work with over 400 architects and designers across India — the country's finest studios trust us to specify and deliver lighting for their most ambitious projects. It remains, at every stage, a family-run studio.
                </p>
            </section>

            <section className="bg-ivory-2 py-24">
                <div className="max-w-[1400px] mx-auto px-6 md:px-10 grid md:grid-cols-3 gap-12">
                    {[
                        ["Made", "In-house workshops and long-standing artisan partners across India."],
                        ["Curated", "A small, edited catalogue — every piece has a reason to be there."],
                        ["Installed", "Trained fitters, engineered brackets, five-year fixture warranty."],
                    ].map(([t, d]) => (
                        <div key={t}>
                            <div className="tracking-editorial text-amber2 mb-4">The Principle</div>
                            <div className="font-serif text-3xl mb-4">{t}</div>
                            <div className="text-charcoal/70 leading-relaxed">{d}</div>
                        </div>
                    ))}
                </div>
            </section>
        </div>
    );
}
