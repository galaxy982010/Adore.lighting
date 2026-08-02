import { createContext, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("adore_token");
        if (!token) {
            setLoading(false);
            return;
        }
        api.get("/auth/me")
            .then((r) => setUser(r.data))
            .catch(() => localStorage.removeItem("adore_token"))
            .finally(() => setLoading(false));
    }, []);

    const login = async (email, password) => {
        const r = await api.post("/auth/login", { email, password });
        localStorage.setItem("adore_token", r.data.token);
        setUser(r.data.user);
        return r.data.user;
    };

    const register = async (name, email, password) => {
        const r = await api.post("/auth/register", { name, email, password });
        localStorage.setItem("adore_token", r.data.token);
        setUser(r.data.user);
        return r.data.user;
    };

    const logout = () => {
        localStorage.removeItem("adore_token");
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
