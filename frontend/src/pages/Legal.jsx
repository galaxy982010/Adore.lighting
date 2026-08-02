import { useParams } from "react-router-dom";

const CONTENT = {
    privacy: {
        title: "Privacy Policy",
        body: `We collect only what we need to serve you — name, address, contact and order history. We never sell your data. Cookies are used solely to keep your session, cart and preferences. Contact hello@adore.com for data deletion requests.`,
    },
    terms: {
        title: "Terms of Service",
        body: `By placing an order with Adore, you agree to product specifications shown at time of order, delivery estimates provided in writing, and our return policy. All fixtures carry a five-year warranty against manufacturing defect.`,
    },
    shipping: {
        title: "Shipping & Delivery",
        body: `We deliver across India, with white-glove installation in metro cities. Standard delivery is 6–14 working days depending on availability. Orders above ₹50,000 include complimentary shipping and installation.`,
    },
    returns: {
        title: "Returns & Exchanges",
        body: `Standard-catalogue fixtures may be returned within 14 days of delivery, unused and in original packaging. Bespoke commissions and made-to-order finishes are non-returnable. Faulty items are always replaced at our cost.`,
    },
};

export default function Legal() {
    const { doc } = useParams();
    const c = CONTENT[doc] || CONTENT.privacy;
    return (
        <div className="max-w-[900px] mx-auto px-6 md:px-10 py-16">
            <div className="tracking-editorial text-muted2 mb-4">Legal</div>
            <h1 className="font-serif text-5xl md:text-6xl mb-12">{c.title}</h1>
            <p className="text-lg leading-relaxed text-charcoal/80 whitespace-pre-line">{c.body}</p>
        </div>
    );
}
