import { INSPIRATION } from "@/lib/inspiration";
import InspirationTile from "@/components/InspirationTile";
import Reveal from "@/components/Reveal";

export default function Inspiration() {
    return (
        <div data-testid="inspiration-page" className="max-w-[1400px] mx-auto px-6 md:px-10 py-16 md:py-24">
            <div className="tracking-editorial text-muted2 mb-4">Room Inspiration</div>
            <h1 className="font-serif text-5xl md:text-6xl max-w-3xl">Adore, at home.</h1>
            <p className="mt-6 max-w-xl text-charcoal/70">
                Rooms composed around a single statement light. Tap any room to see the piece that makes it.
            </p>
            <div className="mt-16 columns-1 md:columns-2 lg:columns-3 gap-4 [&>*]:mb-4">
                {INSPIRATION.map((item, i) => (
                    <Reveal key={item.id} delay={i * 60} className="break-inside-avoid">
                        <InspirationTile item={item} className={item.tall ? "aspect-[3/4]" : "aspect-[4/3]"} />
                    </Reveal>
                ))}
            </div>
        </div>
    );
}
