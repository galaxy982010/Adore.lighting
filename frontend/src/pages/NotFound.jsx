import { Link } from "react-router-dom";

export default function NotFound() {
    return (
        <div className="max-w-[900px] mx-auto px-6 py-32 text-center">
            <div className="tracking-editorial text-muted2 mb-4">404 · Not here</div>
            <h1 className="font-serif text-5xl md:text-6xl mb-8">This corner is dark.</h1>
            <p className="text-charcoal/70 max-w-md mx-auto mb-10">The page you're looking for has moved or never existed. Let's get you back to the well-lit rooms.</p>
            <Link to="/" data-testid="notfound-home-cta" className="inline-block bg-charcoal text-ivory px-8 py-4 tracking-editorial hover:bg-amber2 transition-colors">
                Return home
            </Link>
        </div>
    );
}
