import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "sonner";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import Layout from "@/components/Layout";
import Home from "@/pages/Home";
import Category from "@/pages/Category";
import Product from "@/pages/Product";
import Cart from "@/pages/Cart";
import Checkout from "@/pages/Checkout";
import About from "@/pages/About";
import Bespoke from "@/pages/Bespoke";
import Trade from "@/pages/Trade";
import Rooms from "@/pages/Rooms";
import Track from "@/pages/Track";
import Contact from "@/pages/Contact";
import Legal from "@/pages/Legal";
import Auth from "@/pages/Auth";
import Wishlist from "@/pages/Wishlist";
import Admin from "@/pages/Admin";
import Kits from "@/pages/Kits";
import Inspiration from "@/pages/Inspiration";
import NotFound from "@/pages/NotFound";

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <BrowserRouter>
                    <Toaster position="top-center" richColors />
                    <Routes>
                        <Route path="/" element={<Layout />}>
                            <Route index element={<Home />} />
                            <Route path="shop/:category" element={<Category />} />
                            <Route path="product/:slug" element={<Product />} />
                            <Route path="rooms" element={<Rooms />} />
                            <Route path="rooms/:room" element={<Category />} />
                            <Route path="cart" element={<Cart />} />
                            <Route path="cart/c/:cartId" element={<Checkout />} />
                            <Route path="cart/:cartId" element={<Checkout />} />
                            <Route path="checkout" element={<Checkout />} />
                            <Route path="checkouts/:checkoutId" element={<Checkout />} />
                            <Route path="about" element={<About />} />
                            <Route path="stores" element={<Home />} />
                            <Route path="bespoke" element={<Bespoke />} />
                            <Route path="trade" element={<Trade />} />
                            <Route path="track" element={<Track />} />
                            <Route path="contact" element={<Contact />} />
                            <Route path="legal/:doc" element={<Legal />} />
                            <Route path="auth" element={<Auth />} />
                            <Route path="wishlist" element={<Wishlist />} />
                            <Route path="adore-admin" element={<Admin />} />
                            <Route path="kits" element={<Kits />} />
                            <Route path="inspiration" element={<Inspiration />} />
                            <Route path="*" element={<NotFound />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
