import axios from "axios";

const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
export const API = `${BACKEND_URL}/api`;
export const api = axios.create({ baseURL: API });

api.interceptors.request.use((config) => {
    const token = localStorage.getItem("adore_token");
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
});

export const imageUrl = (path) => {
    if (!path) return "";
    if (path.startsWith("http")) return path;
    return `${BACKEND_URL}${path}`;
};

export const BRAND = {
    tagline: "Create Your Vibes.",
    whatsapp: "+918178867115",
    phoneDisplay: "081788 67115",
    phoneTel: "+918178867115",
    email: "salesadorelighting@gmail.com",
    hours: "Mon–Sat · 10:00 AM – 7:00 PM (IST)",
    instagram: "https://www.instagram.com/adore.lighting",
    facebook: "https://www.facebook.com/profile.php?id=61592334465712&sk=directory_personal_details",
    youtube: "https://www.youtube.com/@adore.lighting",
    linkedin: "https://www.linkedin.com/in/adore-lighting-596229425",
};

const IMG = (n) => `/collections/page${n}.jpg`;

export const CATEGORIES = [
    { slug: "chandeliers", name: "Chandeliers", image: IMG(11),
      subs: [{ slug: "classic", name: "Classic" }, { slug: "modern", name: "Modern" }] },
    { slug: "double-height-chandeliers", name: "Double Height Chandeliers", image: IMG(9),
      subs: [{ slug: "classic", name: "Classic" }, { slug: "modern", name: "Modern" }] },
    { slug: "fan-chandeliers", name: "Fan Chandeliers", image: IMG(6) },
    { slug: "pendants", name: "Pendants", image: IMG(8),
      subs: [{ slug: "classic", name: "Classic" }, { slug: "modern", name: "Modern" }] },
    { slug: "wall", name: "Wall Lamps", image: IMG(10),
      subs: [{ slug: "classic", name: "Classic" }, { slug: "modern", name: "Modern" }] },
    { slug: "table", name: "Table Lamps", image: IMG(1) },
    { slug: "floor", name: "Floor Lamps", image: IMG(3) },
    { slug: "ceiling", name: "Ceiling Lights", image: IMG(4) },
    { slug: "outdoor", name: "Outdoor", image: IMG(7),
      subs: [{ slug: "gate-lights", name: "Gate Lights" }, { slug: "wall-lamps", name: "Wall Lamps" }] },
    { slug: "bamboo", name: "Bamboo", image: IMG(2) },
    { slug: "kids-lights", name: "Kids Lights", image: IMG(4) },
    { slug: "mirror-lights", name: "Mirror Lights", image: IMG(10) },
    { slug: "bulbs", name: "Bulbs", image: IMG(5),
      subs: [
        { slug: "e27-4w-filament", name: "E27 · 4W Filament" },
        { slug: "e14-4w-bent-tip-filament", name: "E14 · 4W Bent-Tip Filament" },
        { slug: "e27-12w-single-step", name: "E27 · 12W Single Step" },
        { slug: "e27-3-colour", name: "E27 · 3 Colour" },
        { slug: "e14-4w-candle-filament", name: "E14 · 4W Candle Filament" },
        { slug: "e14-12w-tricolour", name: "E14 · 12W Tricolour" },
        { slug: "e14-tricolour", name: "E14 · Tricolour" },
        { slug: "g9-single-colour", name: "G9 · Single Colour" },
        { slug: "g9-tricolour", name: "G9 · Tricolour" },
        { slug: "g4-bulb", name: "G4 Bulb" },
        { slug: "e14-4w-dimmable", name: "E14 · 4W Dimmable" },
        { slug: "e27-4w-dimmable", name: "E27 · 4W Dimmable" },
      ] },
];

export const ROOMS = [
    { slug: "living", label: "Living", name: "Living Room" },
    { slug: "bedroom", label: "Bedroom", name: "Bedroom" },
    { slug: "dining", label: "Dining", name: "Dining" },
    { slug: "outdoor", label: "Outdoor", name: "Outdoor" },
    { slug: "staircase", label: "Staircase", name: "Duplex & Staircase" },
];

export const formatINR = (n) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
