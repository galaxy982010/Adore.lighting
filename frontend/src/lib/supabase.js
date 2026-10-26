import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || "https://uuufbstdpentsczrtokg.supabase.co";
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InV1dWZic3RkcGVudHNjenJ0b2tnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTMwMDcyNjEsImV4cCI6MjEwODU4MzI2MX0.Pk4DM9al69nL5uKgJW_B7Ou0hC2PXkpteWDVI0Mbk38";

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
    },
});

// Database helper methods
export const db = {
    // Inquiries
    async submitInquiry(data) {
        const { error, data: res } = await supabase
            .from("inquiries")
            .insert([
                {
                    name: data.name,
                    email: data.email,
                    phone: data.phone || "",
                    inquiry_type: data.inquiry_type || "general",
                    message: data.message || "",
                    city: data.city || "",
                    project_type: data.project_type || "",
                    kit: data.kit || "",
                },
            ])
            .select();
        if (error) throw error;
        return res?.[0];
    },

    // Newsletter subscription
    async subscribeNewsletter(email) {
        const { error, data: res } = await supabase
            .from("subscribers")
            .insert([{ email }])
            .select();
        if (error && error.code !== "23505") throw error; // ignore duplicate key
        return res?.[0] || { email };
    },

    // Coupons
    async getCoupon(code) {
        if (!code) return null;
        const { error, data: res } = await supabase
            .from("coupons")
            .select("*")
            .eq("code", code.trim().toUpperCase())
            .eq("active", true)
            .maybeSingle();
        if (error) throw error;
        return res;
    },

    // Orders
    async createOrder(orderData) {
        const orderNumber = "ADR-" + Math.floor(100000 + Math.random() * 900000);
        const { error, data: res } = await supabase
            .from("orders")
            .insert([
                {
                    order_number: orderNumber,
                    email: orderData.email,
                    user_id: orderData.userId || null,
                    status: "confirmed",
                    carrier: "BlueDart Express",
                    tracking_number: "BD" + Math.floor(10000000 + Math.random() * 90000000) + "IN",
                    items: orderData.items || [],
                    total: orderData.total || 0,
                },
            ])
            .select();
        if (error) throw error;
        return res?.[0];
    },

    // Track order
    async trackOrder(orderNumber) {
        const num = (orderNumber || "").trim().toUpperCase();
        const { error, data: res } = await supabase
            .from("orders")
            .select("*")
            .ilike("order_number", num)
            .maybeSingle();
        if (error) throw error;
        return res;
    },
};
