import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useCart } from "@/context/CartContext";

// Legacy /checkout route — Shopify handles checkout on its hosted URL.
// This page just redirects to the Shopify checkoutUrl (or back to /cart).
export default function Checkout() {
    const { checkoutUrl, items } = useCart();
    const navigate = useNavigate();

    useEffect(() => {
        if (items.length === 0) {
            navigate("/cart");
            return;
        }
        if (checkoutUrl) {
            window.location.href = checkoutUrl;
        }
    }, [checkoutUrl, items, navigate]);

    return (
        <div className="max-w-[900px] mx-auto py-32 text-center">
            <div className="tracking-editorial text-muted2 mb-4">Secure Checkout</div>
            <h1 className="font-serif text-4xl md:text-5xl mb-6">Redirecting you to checkout…</h1>
            <p className="text-charcoal/70">You're being taken to our encrypted payment page. If the redirect doesn't happen,
                {checkoutUrl ? (
                    <> <a href={checkoutUrl} className="text-amber2 underline-link">click here</a> to continue.</>
                ) : (
                    <> please return to your <button onClick={() => navigate("/cart")} className="text-amber2 underline-link">cart</button>.</>
                )}
            </p>
        </div>
    );
}
