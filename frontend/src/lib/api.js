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
    yearsInBusiness: 18,
    storeCount: 12,
    cities: ["Mumbai", "Delhi", "Bengaluru", "Hyderabad", "Chennai", "Pune", "Kolkata", "Ahmedabad", "Jaipur", "Chandigarh", "Kochi", "Gurugram"],
    whatsapp: "+918178867115",
    phoneDisplay: "081788 67115",
    phoneTel: "+918178867115",
    email: "salesadorelighting@gmail.com",
    instagram: "https://www.instagram.com/adore.lighting",
    facebook: "https://www.facebook.com/profile.php?id=61592334465712&sk=directory_personal_details",
    youtube: "https://www.youtube.com/@adore.lighting",
    linkedin: "https://www.linkedin.com/in/adore-lighting-596229425",
    address: "Adore Lighting Studio, India",
};

export const CATEGORIES = [
    { slug: "chandeliers", name: "Chandeliers", image: "https://images.unsplash.com/photo-1586450428662-92fe683549b9?w=1200&q=85" },
    { slug: "pendants", name: "Pendants", image: "https://images.unsplash.com/photo-1648415198825-7c805bfa043e?w=1200&q=85" },
    { slug: "wall", name: "Wall Lights", image: "https://images.unsplash.com/photo-1775660922989-f0c624413269?w=1200&q=85" },
    { slug: "table", name: "Table Lamps", image: "https://images.unsplash.com/photo-1764760764956-fcb78be107a5?w=1200&q=85" },
    { slug: "floor", name: "Floor Lamps", image: "https://images.unsplash.com/photo-1704040686413-2c607dbd2f06?w=1200&q=85" },
    { slug: "ceiling", name: "Ceiling Lights", image: "https://images.unsplash.com/photo-1706820229870-f9a8c6dac193?w=1200&q=85" },
    { slug: "outdoor", name: "Outdoor", image: "https://images.unsplash.com/photo-1775660922989-f0c624413269?w=1200&q=85" },
    { slug: "architectural", name: "Architectural", image: "https://images.unsplash.com/photo-1704040686413-2c607dbd2f06?w=1200&q=85" },
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
