import { BRAND } from "@/lib/api";
import { MapPin, Phone } from "lucide-react";

const STORES = [
    { city: "Mumbai", address: "Ground Floor, Kala Ghoda, Fort, Mumbai 400001", phone: "+91 22 4000 1000" },
    { city: "Delhi", address: "M-Block Market, Greater Kailash II, New Delhi 110048", phone: "+91 11 4000 1000" },
    { city: "Bengaluru", address: "12th Main, Indiranagar, Bengaluru 560038", phone: "+91 80 4000 1000" },
    { city: "Hyderabad", address: "Road No. 12, Banjara Hills, Hyderabad 500034", phone: "+91 40 4000 1000" },
    { city: "Chennai", address: "Khader Nawaz Khan Road, Nungambakkam, Chennai 600006", phone: "+91 44 4000 1000" },
    { city: "Pune", address: "North Main Road, Koregaon Park, Pune 411001", phone: "+91 20 4000 1000" },
    { city: "Kolkata", address: "Park Street, Kolkata 700016", phone: "+91 33 4000 1000" },
    { city: "Ahmedabad", address: "CG Road, Navrangpura, Ahmedabad 380009", phone: "+91 79 4000 1000" },
    { city: "Jaipur", address: "C-Scheme, Jaipur 302001", phone: "+91 141 4000 1000" },
    { city: "Chandigarh", address: "Sector 8B, Chandigarh 160009", phone: "+91 172 4000 1000" },
    { city: "Kochi", address: "Marine Drive, Kochi 682031", phone: "+91 484 4000 1000" },
    { city: "Gurugram", address: "DLF Cyber Hub, Gurugram 122002", phone: "+91 124 4000 1000" },
];

export default function StoreLocator() {
    return (
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16">
            <div className="tracking-editorial text-muted2 mb-4">Visit</div>
            <h1 className="font-serif text-5xl md:text-6xl">Our Ateliers</h1>
            <p className="mt-6 max-w-xl text-charcoal/70">{BRAND.storeCount} showrooms across {BRAND.cities.length} Indian cities. Every piece in our catalogue is on-floor and lit.</p>

            <div className="mt-16 grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                {STORES.map((s) => (
                    <div key={s.city} data-testid={`store-${s.city.toLowerCase()}`} className="p-8 bg-ivory-2">
                        <div className="tracking-editorial text-amber2 mb-3">India</div>
                        <div className="font-serif text-3xl mb-4">{s.city}</div>
                        <div className="flex items-start gap-3 text-sm text-charcoal/75">
                            <MapPin size={14} className="mt-1 shrink-0" />
                            <span>{s.address}</span>
                        </div>
                        <div className="flex items-center gap-3 mt-3 text-sm text-charcoal/75">
                            <Phone size={14} />
                            <span>{s.phone}</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
