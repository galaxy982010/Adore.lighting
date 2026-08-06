import { useParams, Link } from "react-router-dom";
import { BRAND } from "@/lib/api";

const CONTENT = {
    privacy: {
        title: "Privacy Policy",
        body: [
            ["At Adore, your privacy and trust are our top priorities."],
            ["We collect only the information necessary to process your orders, provide customer support, and enhance your shopping experience."],
            ["Your personal information is never sold, rented, or shared with third parties for marketing purposes."],
            ["All payments are processed through secure and trusted payment gateways. Adore does not store your debit card, credit card, or banking details."],
            ["Your information is used only for:"],
            ["• Order Processing\n• Shipping & Delivery\n• Customer Support\n• Order Updates\n• Service Improvement"],
            ["By placing an order with Adore, you agree to this Privacy Policy."],
        ],
    },
    shipping: {
        title: "Order Processing & Shipping",
        body: [
            ["• All orders are processed and dispatched within 48 hours of successful order confirmation."],
            ["• Estimated delivery time is 5–6 working days, depending on your location."],
            ["• Delivery times may vary slightly due to festivals, public holidays, weather conditions, or courier delays."],
        ],
    },
    unboxing: {
        title: "Unboxing Video Policy",
        body: [
            ["For your protection and to ensure a smooth replacement process, please record a continuous video before opening your package."],
            ["The video must:"],
            ["• Clearly show the sealed package.\n• Be recorded without any cuts or edits.\n• Capture the complete unboxing process.\n• Clearly show the condition of the product."],
            ["This video is mandatory for claims related to:"],
            ["• Damaged Product\n• Defective Product\n• Incorrect Product Received"],
            ["Requests submitted without a valid unboxing video may not be eligible for replacement."],
        ],
    },
    replacement: {
        title: "Replacement Policy",
        body: [
            ["If you receive a damaged, defective, or incorrect product, please contact our support team within 48 hours of delivery."],
            ["Please provide:"],
            ["• Order ID\n• Clear Product Photos\n• Complete Unboxing Video"],
            ["Products must be returned in their original condition with all accessories and original packaging."],
            ["Customers are responsible for return shipping and replacement delivery charges unless otherwise specified by Adore."],
        ],
    },
    returns: {
        title: "Return & Cancellation Policy",
        body: [
            ["Orders may be cancelled only before they are dispatched."],
            ["For approved cancellations, a 6% Platform & Payment Processing Fee will be deducted from the original order amount. The remaining balance will be refunded to the original payment method."],
            ["Once an order has been shipped, cancellation is no longer possible."],
            ["Returns or refunds due to a change of mind after delivery are not accepted unless required under applicable consumer protection laws."],
        ],
    },
    availability: {
        title: "Product Availability",
        body: [
            ["Actual product colours, textures, and finishes may vary slightly due to photography, lighting conditions, screen settings, or manufacturing variations. Such minor differences are natural and do not qualify as product defects."],
        ],
    },
    terms: {
        title: "Terms of Service",
        body: [
            ["By placing an order with Adore, you agree to product specifications shown at the time of order, delivery estimates provided in writing, and the policies published on this site (Privacy, Shipping, Unboxing, Replacement, Return & Cancellation)."],
            ["All fixtures carry a manufacturer warranty against defect. See our Replacement Policy for the claim process."],
        ],
    },
};

const RELATED = [
    { slug: "shipping", label: "Order Processing & Shipping" },
    { slug: "unboxing", label: "Unboxing Video Policy" },
    { slug: "replacement", label: "Replacement Policy" },
    { slug: "returns", label: "Return & Cancellation" },
    { slug: "availability", label: "Product Availability" },
    { slug: "privacy", label: "Privacy Policy" },
    { slug: "terms", label: "Terms of Service" },
];

export default function Legal() {
    const { doc } = useParams();
    const c = CONTENT[doc] || CONTENT.privacy;
    return (
        <div className="max-w-[1200px] mx-auto px-6 md:px-10 py-16 grid lg:grid-cols-[240px_1fr] gap-12">
            <aside className="lg:sticky lg:top-32 self-start">
                <div className="tracking-editorial text-muted2 mb-4">Care & Policies</div>
                <nav className="space-y-2 text-sm">
                    {RELATED.map((r) => (
                        <Link
                            key={r.slug}
                            data-testid={`legal-nav-${r.slug}`}
                            to={`/legal/${r.slug}`}
                            className={`block py-1 ${doc === r.slug ? "text-amber2 font-medium" : "text-charcoal/70 hover:text-charcoal"}`}
                        >
                            {r.label}
                        </Link>
                    ))}
                </nav>
            </aside>

            <div>
                <div className="tracking-editorial text-muted2 mb-4">Legal</div>
                <h1 className="font-serif text-5xl md:text-6xl mb-12">{c.title}</h1>
                <div className="space-y-6 text-[15px] leading-relaxed text-charcoal/80">
                    {c.body.map((para, i) => (
                        <p key={i} className="whitespace-pre-line">{para[0]}</p>
                    ))}
                </div>

                <div className="mt-16 pt-8 border-t border-[#E5E3DC]">
                    <div className="tracking-editorial text-muted2 mb-3">Contact Us</div>
                    <div className="text-sm text-charcoal/80">
                        Email <a href={`mailto:${BRAND.email}`} className="underline-link">{BRAND.email}</a><br />
                        Phone <a href={`tel:${BRAND.phoneTel}`} className="underline-link">{BRAND.phoneDisplay}</a><br />
                        Customer Support Hours · {BRAND.hours}
                    </div>
                </div>
            </div>
        </div>
    );
}
