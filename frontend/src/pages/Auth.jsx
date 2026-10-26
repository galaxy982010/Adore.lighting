import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import { useAuth } from "@/context/AuthContext";

export default function Auth() {
    const [mode, setMode] = useState("login");
    const [form, setForm] = useState({ name: "", email: "", password: "" });
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const submit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            if (mode === "login") {
                const user = await login(form.email, form.password);
                toast.success(`Welcome back, ${user.name}`);
                navigate(user.role === "admin" ? "/adore-admin" : "/");
            } else {
                await register(form.name, form.email, form.password);
                toast.success("Welcome to Adore");
                navigate("/");
            }
        } catch (err) {
            toast.error(err?.message || err?.response?.data?.detail || "Please try again");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-[440px] mx-auto px-6 py-24">
            <div className="tracking-editorial text-muted2 mb-4 text-center">{mode === "login" ? "Welcome back" : "Create account"}</div>
            <h1 className="font-serif text-5xl mb-12 text-center">{mode === "login" ? "Sign in" : "Join Adore"}</h1>

            <form onSubmit={submit} className="space-y-5">
                {mode === "register" && (
                    <input data-testid="auth-name" required placeholder="Full name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full border-b border-charcoal/30 bg-transparent py-3 outline-none focus:border-amber2" />
                )}
                <input data-testid="auth-email" required type="email" placeholder="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full border-b border-charcoal/30 bg-transparent py-3 outline-none focus:border-amber2" />
                <input data-testid="auth-password" required type="password" placeholder="Password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className="w-full border-b border-charcoal/30 bg-transparent py-3 outline-none focus:border-amber2" />
                <button data-testid="auth-submit" disabled={loading} className="w-full bg-charcoal text-ivory py-4 tracking-editorial hover:bg-amber2 transition-colors disabled:opacity-60">
                    {loading ? "…" : (mode === "login" ? "Sign in" : "Create account")}
                </button>
            </form>

            <div className="mt-8 text-center text-sm text-muted2">
                {mode === "login" ? "New to Adore? " : "Have an account? "}
                <button data-testid="auth-toggle" onClick={() => setMode(mode === "login" ? "register" : "login")} className="text-charcoal underline-link">
                    {mode === "login" ? "Create an account" : "Sign in"}
                </button>
            </div>
        </div>
    );
}
