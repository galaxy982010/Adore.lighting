import { BRAND } from "@/lib/api";

export default function WhatsAppWidget() {
    const num = BRAND.whatsapp.replace(/\D/g, "");
    // Direct to +91 81788 67115
    return (
        <a
            data-testid="whatsapp-widget"
            href={`https://wa.me/${num}?text=${encodeURIComponent("Hello Adore, I'd like a lighting consultation.")}`}
            target="_blank"
            rel="noopener noreferrer"
            className="fixed bottom-6 right-6 z-40 w-14 h-14 bg-[#25D366] text-white rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,0,0,0.15)] hover:scale-105 transition-transform"
            aria-label="Chat on WhatsApp"
        >
            <svg viewBox="0 0 24 24" width="24" height="24" fill="currentColor" aria-hidden="true">
                <path d="M20.52 3.48A11.9 11.9 0 0 0 12.06 0C5.5 0 .17 5.33.17 11.9c0 2.1.55 4.15 1.6 5.95L0 24l6.31-1.66a11.9 11.9 0 0 0 5.75 1.47h.01c6.56 0 11.89-5.33 11.89-11.9 0-3.18-1.24-6.17-3.44-8.43zM12.07 21.6c-1.83 0-3.62-.49-5.19-1.42l-.37-.22-3.74.98 1-3.65-.24-.38a9.7 9.7 0 0 1-1.5-5.02c0-5.36 4.36-9.72 9.73-9.72 2.6 0 5.04 1.02 6.88 2.85a9.66 9.66 0 0 1 2.85 6.87c0 5.37-4.36 9.71-9.72 9.71zm5.32-7.28c-.29-.15-1.73-.85-2-.95-.27-.1-.47-.15-.66.15-.19.29-.75.95-.92 1.14-.17.2-.34.22-.63.07-.29-.15-1.23-.45-2.35-1.45a8.83 8.83 0 0 1-1.63-2.02c-.17-.29-.02-.44.13-.59.13-.13.29-.34.44-.51.15-.17.19-.29.29-.49.1-.19.05-.36-.02-.51-.07-.15-.66-1.59-.9-2.18-.24-.57-.48-.5-.66-.5h-.56c-.19 0-.51.07-.78.36-.27.29-1.02.99-1.02 2.42s1.05 2.81 1.19 3.01c.15.19 2.06 3.14 4.99 4.4.7.3 1.24.48 1.66.61.7.22 1.34.19 1.84.12.56-.08 1.73-.71 1.97-1.4.24-.68.24-1.27.17-1.4-.07-.13-.27-.2-.56-.35z"/>
            </svg>
        </a>
    );
}
