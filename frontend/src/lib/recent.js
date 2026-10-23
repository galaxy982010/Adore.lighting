const KEY = "adore_recently_viewed";
const MAX = 10;

export function getRecent() {
    try {
        return JSON.parse(localStorage.getItem(KEY)) || [];
    } catch {
        return [];
    }
}

export function pushRecent(p) {
    const entry = { id: p.id, slug: p.slug, name: p.name, category: p.category, price: p.price, images: (p.images || []).slice(0, 2) };
    const list = [entry, ...getRecent().filter((x) => x.slug !== p.slug)].slice(0, MAX);
    localStorage.setItem(KEY, JSON.stringify(list));
}
