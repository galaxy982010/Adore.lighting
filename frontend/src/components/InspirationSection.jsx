import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { INSPIRATION } from "@/lib/inspiration";
import InspirationTile from "@/components/InspirationTile";
import Reveal from "@/components/Reveal";

export default function InspirationSection() {
    const [a, b, c] = INSPIRATION;
    return (
        <section data-testid="home-inspiration" className="py-24 md:py-32">
            <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                <Reveal className="flex items-end justify-between mb-14 flex-wrap gap-4">
                    <div>
                        <div className="tracking-editorial text-muted2 mb-4">Room Inspiration</div>
                        <h2 className="font-serif text-4xl md:text-5xl">Adore, at home.</h2>
                    </div>
                    <Link to="/inspiration" data-testid="home-inspiration-view-all" className="inline-flex items-center gap-2 tracking-editorial hover:text-amber2">
                        View all rooms <ArrowRight size={14} />
                    </Link>
                </Reveal>
                <div className="grid md:grid-cols-12 gap-4">
                    <Reveal className="md:col-span-5"><InspirationTile item={a} className="aspect-[3/4]" /></Reveal>
                    <div className="md:col-span-7 grid gap-4">
                        <Reveal delay={80}><InspirationTile item={b} className="aspect-[16/9]" /></Reveal>
                        <Reveal delay={160}><InspirationTile item={c} className="aspect-[16/9]" /></Reveal>
                    </div>
                </div>
            </div>
        </section>
    );
}
