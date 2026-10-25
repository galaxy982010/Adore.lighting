import { useEffect, useRef } from "react";

// Wraps children with a class that fades-in when scrolled into view.
// Uses IntersectionObserver (subtle, no framer-motion dependency change).
export default function Reveal({ children, delay = 0, as = "div", className = "" }) {
    const ref = useRef(null);
    useEffect(() => {
        const el = ref.current;
        if (!el) return;
        const io = new IntersectionObserver(
            (entries) => {
                entries.forEach((e) => {
                    if (e.isIntersecting) {
                        e.target.classList.add("reveal-in");
                        io.unobserve(e.target);
                    }
                });
            },
            { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
        );
        io.observe(el);
        return () => io.disconnect();
    }, []);

    const Tag = as;
    return (
        <Tag ref={ref} style={{ transitionDelay: `${delay}ms` }} className={`reveal ${className}`}>
            {children}
        </Tag>
    );
}
