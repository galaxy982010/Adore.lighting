import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";

export default function InspirationTile({ item, className = "" }) {
    return (
        <Link
            to={`/product/${item.product}`}
            data-testid={`inspiration-tile-${item.id}`}
            className={`group relative block overflow-hidden bg-ivory-2 ${className}`}
        >
            <img
                src={item.image}
                alt={`${item.name} in a ${item.room.toLowerCase()}`}
                loading="lazy"
                className="w-full h-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/75 via-charcoal/10 to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 text-ivory flex items-end justify-between gap-4">
                <div>
                    <div className="tracking-editorial text-ivory/70 text-[10px] mb-2">{item.room}</div>
                    <div className="font-serif text-2xl md:text-3xl leading-tight">{item.name}</div>
                </div>
                <span className="shrink-0 w-11 h-11 rounded-full border border-ivory/50 flex items-center justify-center transition-[background-color,color,transform] duration-300 group-hover:bg-ivory group-hover:text-charcoal group-hover:rotate-45">
                    <ArrowUpRight size={18} />
                </span>
            </div>
        </Link>
    );
}
