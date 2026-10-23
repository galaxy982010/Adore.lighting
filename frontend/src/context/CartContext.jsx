import { createContext, useContext, useEffect, useState } from "react";
import { toast } from "sonner";
import * as Shopify from "@/lib/shopify";

const CartContext = createContext(null);

const CART_ID_KEY = "adore_shopify_cart_id";

export const CartProvider = ({ children }) => {
    const [cart, setCart] = useState(null);
    const [loading, setLoading] = useState(false);

    // Restore cart from localStorage
    useEffect(() => {
        const id = localStorage.getItem(CART_ID_KEY);
        if (!id || !Shopify.isShopifyConfigured()) return;
        Shopify.getCart(id)
            .then((c) => {
                if (c && c.lines.length >= 0) setCart(c);
                else localStorage.removeItem(CART_ID_KEY);
            })
            .catch(() => {
                localStorage.removeItem(CART_ID_KEY);
            });
    }, []);

    const addItem = async (variantId, qty = 1) => {
        if (!variantId) {
            toast.error("Please select an option");
            return;
        }
        setLoading(true);
        try {
            let next;
            if (!cart) {
                next = await Shopify.cartCreate([{ merchandiseId: variantId, quantity: qty }]);
                if (next?.id) localStorage.setItem(CART_ID_KEY, next.id);
            } else {
                next = await Shopify.cartLinesAdd(cart.id, [{ merchandiseId: variantId, quantity: qty }]);
            }
            setCart(next);
            return next;
        } catch (e) {
            toast.error(e.message || "Unable to add to cart");
        } finally {
            setLoading(false);
        }
    };

    const updateQty = async (lineId, qty) => {
        if (!cart) return;
        setLoading(true);
        try {
            const next = await Shopify.cartLinesUpdate(cart.id, [
                { id: lineId, quantity: Math.max(1, qty) },
            ]);
            setCart(next);
        } catch (e) {
            toast.error(e.message || "Update failed");
        } finally {
            setLoading(false);
        }
    };

    const removeItem = async (lineId) => {
        if (!cart) return;
        setLoading(true);
        try {
            const next = await Shopify.cartLinesRemove(cart.id, [lineId]);
            setCart(next);
        } catch (e) {
            toast.error(e.message || "Remove failed");
        } finally {
            setLoading(false);
        }
    };

    const clear = () => {
        localStorage.removeItem(CART_ID_KEY);
        setCart(null);
    };

    // Centralised redirect to Shopify's hosted checkout. Uses the URL that
    // Shopify's cartCreate returned — never a relative or internal route.
    const redirectToCheckout = () => {
        const url = cart?.checkoutUrl;
        console.log("Shopify checkoutUrl:", url);
        if (!url) {
            console.error("Shopify checkoutUrl missing", { cartId: cart?.id, lineCount: cart?.lines?.length });
            toast.error("Preparing checkout — please try again in a moment.");
            return;
        }
        window.location.href = url;
    };

    const items = cart?.lines || [];
    const count = cart?.totalQuantity || 0;
    const total = cart?.subtotal || 0;
    const checkoutUrl = cart?.checkoutUrl;

    return (
        <CartContext.Provider
            value={{
                cart,
                items,
                count,
                total,
                checkoutUrl,
                addItem,
                updateQty,
                removeItem,
                clear,
                redirectToCheckout,
                loading,
            }}
        >
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
