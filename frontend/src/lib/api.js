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

export const CATEGORIES = [
    { slug: "chandeliers", name: "Chandeliers", image: "https://images.unsplash.com/photo-1586450428662-92fe683549b9?w=1200&q=85",
      subs: [{ slug: "classic", name: "Classic" }, { slug: "modern", name: "Modern" }] },
    { slug: "double-height-chandeliers", name: "Double Height Chandeliers", image: "https://images.unsplash.com/photo-1706820229870-f9a8c6dac193?w=1200&q=85",
      subs: [{ slug: "classic", name: "Classic" }, { slug: "modern", name: "Modern" }] },
    { slug: "fan-chandeliers", name: "Fan Chandeliers", image: "https://images.unsplash.com/photo-1704040686413-2c607dbd2f06?w=1200&q=85" },
    { slug: "pendants", name: "Pendants", image: "https://images.unsplash.com/photo-1648415198825-7c805bfa043e?w=1200&q=85",
      subs: [{ slug: "classic", name: "Classic" }, { slug: "modern", name: "Modern" }] },
    { slug: "wall", name: "Wall Lamps", image: "https://images.unsplash.com/photo-1775660922989-f0c624413269?w=1200&q=85",
      subs: [{ slug: "classic", name: "Classic" }, { slug: "modern", name: "Modern" }] },
    { slug: "table", name: "Table Lamps", image: "https://images.unsplash.com/photo-1764760764956-fcb78be107a5?w=1200&q=85" },
    { slug: "floor", name: "Floor Lamps", image: "https://images.unsplash.com/photo-1704040686413-2c607dbd2f06?w=1200&q=85" },
    { slug: "ceiling", name: "Ceiling Lights", image: "https://images.unsplash.com/photo-1706820229870-f9a8c6dac193?w=1200&q=85" },
    { slug: "outdoor", name: "Outdoor", image: "https://images.unsplash.com/photo-1775660922989-f0c624413269?w=1200&q=85" },
    { slug: "bamboo", name: "Bamboo", image: "https://images.unsplash.com/photo-1764760764956-fcb78be107a5?w=1200&q=85" },
    { slug: "bulbs", name: "Bulbs", image: "https://images.unsplash.com/photo-1706820229870-f9a8c6dac193?w=1200&q=85",
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
