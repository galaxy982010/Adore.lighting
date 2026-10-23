import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { api } from "@/lib/api";

const EMPTY = { name: "", email: "", phone: "", city: "", message: "" };
const FIELDS = [
    { key: "name", label: "Full name", type: "text", required: true },
    { key: "email", label: "Email", type: "email", required: true },
    { key: "phone", label: "Phone", type: "tel", required: true },
    { key: "city", label: "City", type: "text", required: false },
];

export default function KitQuoteDialog({ kit, onClose }) {
    const [form, setForm] = useState(EMPTY);
    const [sending, setSending] = useState(false);

    const submit = async (e) => {
        e.preventDefault();
        setSending(true);
        try {
            await api.post("/inquiry", { ...form, kit: kit.title, inquiry_type: "kit-quote", message: form.message || `Quote request for ${kit.title}` });
            toast.success("Thank you — our studio will reach out with a quote shortly.");
            setForm(EMPTY);
            onClose();
        } catch {
            toast.error("Couldn't send your request. Please try again.");
        } finally {
            setSending(false);
        }
    };

    return (
        <Dialog open={Boolean(kit)} onOpenChange={(o) => !o && onClose()}>
            <DialogContent data-testid="kit-quote-dialog" className="bg-ivory rounded-none border-[#E5E3DC] max-w-lg">
                <DialogHeader>
                    <div className="tracking-editorial text-amber2 text-[10px]">Request a quote</div>
                    <DialogTitle className="font-serif text-3xl font-normal">{kit?.title}</DialogTitle>
                    <DialogDescription className="text-charcoal/70">Tell us a little about your space and we'll put together a tailored quote.</DialogDescription>
                </DialogHeader>
                <form onSubmit={submit} className="grid grid-cols-2 gap-4 mt-2">
                    {FIELDS.map((f) => (
                        <input
                            key={f.key}
                            data-testid={`kit-quote-${f.key}-input`}
                            type={f.type}
                            required={f.required}
                            placeholder={f.label + (f.required ? " *" : "")}
                            value={form[f.key]}
                            onChange={(e) => setForm({ ...form, [f.key]: e.target.value })}
                            className="col-span-2 sm:col-span-1 bg-transparent border-b border-[#E5E3DC] py-3 text-sm outline-none focus:border-amber2 transition-colors"
                        />
                    ))}
                    <textarea
                        data-testid="kit-quote-message-input"
                        rows={3}
                        placeholder="Room size, ceiling height, anything else (optional)"
                        value={form.message}
                        onChange={(e) => setForm({ ...form, message: e.target.value })}
                        className="col-span-2 bg-transparent border-b border-[#E5E3DC] py-3 text-sm outline-none focus:border-amber2 transition-colors resize-none"
                    />
                    <button
                        type="submit"
                        disabled={sending}
                        data-testid="kit-quote-submit-button"
                        className="col-span-2 mt-4 bg-charcoal text-ivory py-4 tracking-editorial hover:bg-amber2 transition-colors disabled:opacity-60"
                    >
                        {sending ? "Sending…" : "Send request"}
                    </button>
                </form>
            </DialogContent>
        </Dialog>
    );
}
