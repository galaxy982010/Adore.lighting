import { Link } from "react-router-dom";

export default function CategoryTile({ slug, name, image, size = "default" }) {
    const aspect = size === "tall" ? "aspect-[3/4]" : "aspect-[4/5]";
    return (
        <Link
            to={`/shop/${slug}`}
            data-testid={`category-tile-${slug}`}
            className={`relative block ${aspect} overflow-hidden image-zoom bg-charcoal group`}
        >
            <img src={image} alt={name} loading="lazy" className="w-full h-full object-cover opacity-80 group-hover:opacity-70 transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" />
            <div className="absolute inset-x-0 bottom-0 p-6 md:p-8 text-ivory">
                <div className="tracking-editorial text-ivory/70 mb-1">Collection</div>
                <div className="font-serif text-3xl md:text-4xl leading-none">{name}</div>
            </div>
        </Link>
    );
}
