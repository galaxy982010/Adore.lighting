import { Link } from "react-router-dom";
import { ROOMS } from "@/lib/api";

const IMAGES = {
    living: "https://images.unsplash.com/photo-1704040686413-2c607dbd2f06?w=1400&q=85",
    bedroom: "https://images.unsplash.com/photo-1648415198825-7c805bfa043e?w=1400&q=85",
    dining: "https://images.unsplash.com/photo-1586450428662-92fe683549b9?w=1400&q=85",
    outdoor: "https://images.unsplash.com/photo-1775660922989-f0c624413269?w=1400&q=85",
    staircase: "https://images.unsplash.com/photo-1706820229870-f9a8c6dac193?w=1400&q=85",
};

export default function Rooms() {
    return (
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16">
            <div className="tracking-editorial text-muted2 mb-4">Shop by Room</div>
            <h1 className="font-serif text-5xl md:text-6xl mb-16">Light every room, considered.</h1>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {ROOMS.map((r, i) => (
                    <Link
                        key={r.slug}
                        data-testid={`room-tile-${r.slug.toLowerCase()}`}
                        to={`/rooms/${r.slug}`}
                        className={`relative overflow-hidden group image-zoom ${i === 0 ? "md:col-span-2 lg:col-span-2 aspect-[16/9]" : "aspect-[4/5]"}`}
                    >
                        <img src={IMAGES[r.slug]} alt={r.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-8 text-ivory">
                            <div className="tracking-editorial text-ivory/70 mb-1">Room</div>
                            <div className="font-serif text-4xl">{r.name}</div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
