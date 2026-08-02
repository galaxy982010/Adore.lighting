import { createContext, useContext, useEffect, useState } from "react";

const CartContext = createContext(null);

export const CartProvider = ({ children }) => {
    const [items, setItems] = useState(() => {
        try {
            return JSON.parse(localStorage.getItem("adore_cart") || "[]");
        } catch {
            return [];
        }
    });

    useEffect(() => {
        localStorage.setItem("adore_cart", JSON.stringify(items));
    }, [items]);

    const addItem = (product, qty = 1) => {
        setItems((cur) => {
            const found = cur.find((i) => i.id === product.id);
            if (found) {
                return cur.map((i) => (i.id === product.id ? { ...i, quantity: i.quantity + qty } : i));
            }
            return [
                ...cur,
                {
                    id: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: product.price,
                    image: (product.images || [])[0],
                    quantity: qty,
                },
            ];
        });
    };

    const removeItem = (id) => setItems((cur) => cur.filter((i) => i.id !== id));

    const updateQty = (id, qty) =>
        setItems((cur) =>
            cur.map((i) => (i.id === id ? { ...i, quantity: Math.max(1, qty) } : i))
        );

    const clear = () => setItems([]);

    const total = items.reduce((s, i) => s + i.price * i.quantity, 0);
    const count = items.reduce((s, i) => s + i.quantity, 0);

    return (
        <CartContext.Provider value={{ items, addItem, removeItem, updateQty, clear, total, count }}>
            {children}
        </CartContext.Provider>
    );
};

export const useCart = () => useContext(CartContext);
