import { useEffect, useState } from "react";
import { getRecent } from "@/lib/recent";
import ProductCard from "@/components/ProductCard";

export default function RecentlyViewed({ excludeSlug }) {
    const [items, setItems] = useState([]);
    useEffect(() => {
        setItems(getRecent().filter((p) => p.slug !== excludeSlug));
    }, [excludeSlug]);

    if (items.length === 0) return null;
    return (
        <section data-testid="recently-viewed" className="border-t border-[#E5E3DC] py-20">
            <div className="max-w-[1400px] mx-auto px-6 md:px-10">
                <div className="tracking-editorial text-muted2 mb-4">Picking up where you left off</div>
                <h2 className="font-serif text-3xl md:text-4xl mb-10">Recently viewed</h2>
                <div className="flex gap-6 md:gap-8 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6 md:mx-0 md:px-0">
                    {items.map((p) => (
                        <div key={p.slug} className="snap-start shrink-0 w-[46%] sm:w-[30%] lg:w-[18%]">
                            <ProductCard product={p} />
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
