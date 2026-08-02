import { Outlet, useLocation } from "react-router-dom";
import { useEffect } from "react";
import Nav from "@/components/Nav";
import Footer from "@/components/Footer";
import WhatsAppWidget from "@/components/WhatsAppWidget";
import NewsletterPopup from "@/components/NewsletterPopup";

export default function Layout() {
    const { pathname } = useLocation();
    useEffect(() => {
        window.scrollTo(0, 0);
    }, [pathname]);
    return (
        <div className="min-h-screen bg-ivory text-charcoal flex flex-col">
            <Nav />
            <main className="flex-1">
                <Outlet />
            </main>
            <Footer />
            <WhatsAppWidget />
            <NewsletterPopup />
        </div>
    );
}
