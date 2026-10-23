// Shopify Storefront API (GraphQL) client — public read-only access.
// Runs entirely in the browser. Do NOT put admin tokens here.

const DOMAIN = process.env.REACT_APP_SHOPIFY_STORE_DOMAIN;
const VERSION = process.env.REACT_APP_SHOPIFY_STOREFRONT_API_VERSION || "2025-01";
const TOKEN = process.env.REACT_APP_SHOPIFY_STOREFRONT_ACCESS_TOKEN;

export const ENDPOINT = DOMAIN
    ? `https://${DOMAIN}/api/${VERSION}/graphql.json`
    : null;

export const isShopifyConfigured = () => Boolean(DOMAIN && TOKEN && ENDPOINT);

async function storefront(query, variables = {}) {
    if (!isShopifyConfigured()) {
        throw new Error("Shopify Storefront API is not configured.");
    }
    const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "X-Shopify-Storefront-Access-Token": TOKEN,
            "Accept": "application/json",
        },
        body: JSON.stringify({ query, variables }),
    });
    if (!res.ok) {
        throw new Error(`Shopify request failed (${res.status})`);
    }
    const json = await res.json();
    if (json.errors && json.errors.length) {
        throw new Error(json.errors.map((e) => e.message).join("; "));
    }
    return json.data;
}

// ---- Product normalization ----
// Slug matchers used to route products to our category cards based on
// productType (since the current Shopify store has no tags and no category
// collections — only productType strings like "modern chandelier").
const CATEGORY_MATCHERS = [
    { slug: "kids-lights", test: (t) => /\bkids?\b|children|nursery|animal/.test(t) },
    { slug: "mirror-lights", test: (t) => /mirror/.test(t) },
    { slug: "fan-chandeliers", test: (t) => /\bfan\b/.test(t) && /chandelier/.test(t) },
    { slug: "double-height-chandeliers", test: (t) => /double\s*height/.test(t) },
    { slug: "chandeliers", test: (t) => /chandelier/.test(t) },
    { slug: "pendants", test: (t) => /pendant/.test(t) },
    { slug: "wall", test: (t) => /\bwall\b/.test(t) || /sconce/.test(t) },
    { slug: "table", test: (t) => /table\s*lamp|desk\s*lamp/.test(t) },
    { slug: "floor", test: (t) => /floor\s*lamp/.test(t) },
    { slug: "ceiling", test: (t) => /ceiling|flush/.test(t) },
    { slug: "outdoor", test: (t) => /outdoor|exterior|bollard|landscape|gate/.test(t) },
    { slug: "bamboo", test: (t) => /bamboo|rattan|wicker/.test(t) },
    { slug: "bulbs", test: (t) => /\bbulb\b|filament|edison/.test(t) },
];

export function categoryForProductType(productType) {
    const t = (productType || "").toLowerCase();
    if (!t) return "";
    const hit = CATEGORY_MATCHERS.find((c) => c.test(t));
    return hit ? hit.slug : "";
}

function subcategoryForProductType(productType) {
    const t = (productType || "").toLowerCase();
    if (/\bclassic\b/.test(t)) return "classic";
    if (/\bmodern\b/.test(t)) return "modern";
    return "";
}

export function normalizeProduct(p) {
    if (!p) return null;
    const price = Math.round(Number(p.priceRange?.minVariantPrice?.amount || 0));
    const compareAt = p.compareAtPriceRange?.minVariantPrice?.amount
        ? Math.round(Number(p.compareAtPriceRange.minVariantPrice.amount))
        : null;
    const images = (p.images?.nodes || []).map((n) => n.url);
    if (images.length === 0 && p.featuredImage?.url) images.push(p.featuredImage.url);
    const tags = (p.tags || []).map((t) => t.toLowerCase());
    const collectionHandles = (p.collections?.nodes || []).map((c) => c.handle);
    // Prefer productType-derived category (matches this store's data model);
    // fall back to collection handle / tag if present in future.
    const category =
        categoryForProductType(p.productType) ||
        collectionHandles.find((h) => h !== "frontpage" && h !== "all") ||
        "";
    const subcategory = subcategoryForProductType(p.productType) ||
        (tags.includes("classic") ? "classic" : tags.includes("modern") ? "modern" : "");
    return {
        id: p.id,
        slug: p.handle,
        handle: p.handle,
        name: p.title,
        productType: p.productType || "",
        price,
        compareAtPrice: compareAt,
        description: p.description || "",
        images,
        tags,
        collectionHandles,
        category,
        subcategory,
        featured: tags.includes("featured"),
        new_arrival: tags.includes("new-arrival") || tags.includes("new"),
        availableForSale: p.availableForSale,
        variants: (p.variants?.nodes || []).map((v) => ({
            id: v.id,
            title: v.title,
            price: Math.round(Number(v.price.amount)),
            availableForSale: v.availableForSale,
            selectedOptions: v.selectedOptions || [],
            image: v.image?.url,
        })),
        firstVariantId: p.variants?.nodes?.[0]?.id,
    };
}

const PRODUCT_FIELDS = `
    id
    handle
    title
    description
    productType
    tags
    availableForSale
    featuredImage { url altText }
    images(first: 10) { nodes { url altText } }
    priceRange { minVariantPrice { amount currencyCode } }
    compareAtPriceRange { minVariantPrice { amount currencyCode } }
    collections(first: 5) { nodes { handle title } }
    variants(first: 25) {
        nodes {
            id
            title
            availableForSale
            price { amount currencyCode }
            selectedOptions { name value }
            image { url altText }
        }
    }
`;

const Q_PRODUCTS = `
    query Products($first: Int!, $query: String) {
        products(first: $first, query: $query) {
            nodes { ${PRODUCT_FIELDS} }
        }
    }
`;

const Q_PRODUCT_BY_HANDLE = `
    query Product($handle: String!) {
        product(handle: $handle) { ${PRODUCT_FIELDS} }
    }
`;

export async function listProducts({ first = 100, query = "" } = {}) {
    const data = await storefront(Q_PRODUCTS, { first, query });
    return (data.products?.nodes || []).map(normalizeProduct);
}

export async function getProductByHandle(handle) {
    const data = await storefront(Q_PRODUCT_BY_HANDLE, { handle });
    return data.product ? normalizeProduct(data.product) : null;
}

// ---- Cart normalization ----
// The store's primary domain (adore.lighting) is served by this app.
// Shopify's checkoutUrl uses that primary domain, which would collide with
// our SPA and 404. Force the host back to the *.myshopify.com origin so
// the redirect always lands on Shopify's servers.
function forceShopifyHost(url) {
    if (!url || !DOMAIN) return url;
    try {
        const u = new URL(url);
        if (!u.hostname.endsWith(".myshopify.com")) {
            u.hostname = DOMAIN;
            u.protocol = "https:";
        }
        return u.toString();
    } catch {
        return url;
    }
}

export function normalizeCart(cart) {
    if (!cart) return null;
    return {
        id: cart.id,
        checkoutUrl: forceShopifyHost(cart.checkoutUrl),
        totalQuantity: cart.totalQuantity || 0,
        subtotal: Math.round(Number(cart.cost?.subtotalAmount?.amount || 0)),
        total: Math.round(Number(cart.cost?.totalAmount?.amount || 0)),
        currency: cart.cost?.totalAmount?.currencyCode || "INR",
        lines: (cart.lines?.nodes || []).map((l) => ({
            lineId: l.id,
            variantId: l.merchandise.id,
            variantTitle: l.merchandise.title,
            productId: l.merchandise.product?.id,
            productHandle: l.merchandise.product?.handle,
            name: l.merchandise.product?.title || l.merchandise.title,
            image: l.merchandise.image?.url,
            price: Math.round(Number(l.merchandise.price.amount)),
            quantity: l.quantity,
        })),
    };
}

const CART_FIELDS = `
    id
    checkoutUrl
    totalQuantity
    cost {
        subtotalAmount { amount currencyCode }
        totalAmount { amount currencyCode }
    }
    lines(first: 100) {
        nodes {
            id
            quantity
            merchandise {
                ... on ProductVariant {
                    id
                    title
                    price { amount currencyCode }
                    image { url altText }
                    product { id title handle }
                }
            }
        }
    }
`;

const M_CART_CREATE = `
    mutation CartCreate($lines: [CartLineInput!]) {
        cartCreate(input: { lines: $lines }) {
            cart { ${CART_FIELDS} }
            userErrors { message field }
        }
    }
`;
const M_LINES_ADD = `
    mutation CartLinesAdd($cartId: ID!, $lines: [CartLineInput!]!) {
        cartLinesAdd(cartId: $cartId, lines: $lines) {
            cart { ${CART_FIELDS} }
            userErrors { message field }
        }
    }
`;
const M_LINES_UPDATE = `
    mutation CartLinesUpdate($cartId: ID!, $lines: [CartLineUpdateInput!]!) {
        cartLinesUpdate(cartId: $cartId, lines: $lines) {
            cart { ${CART_FIELDS} }
            userErrors { message field }
        }
    }
`;
const M_LINES_REMOVE = `
    mutation CartLinesRemove($cartId: ID!, $lineIds: [ID!]!) {
        cartLinesRemove(cartId: $cartId, lineIds: $lineIds) {
            cart { ${CART_FIELDS} }
            userErrors { message field }
        }
    }
`;
const Q_CART = `
    query Cart($id: ID!) { cart(id: $id) { ${CART_FIELDS} } }
`;

const throwUserErrors = (mutationRoot) => {
    const errs = mutationRoot?.userErrors || [];
    if (errs.length) throw new Error(errs.map((e) => e.message).join("; "));
    return mutationRoot?.cart || null;
};

export async function cartCreate(lines = []) {
    const data = await storefront(M_CART_CREATE, { lines });
    return normalizeCart(throwUserErrors(data.cartCreate));
}
export async function cartLinesAdd(cartId, lines) {
    const data = await storefront(M_LINES_ADD, { cartId, lines });
    return normalizeCart(throwUserErrors(data.cartLinesAdd));
}
export async function cartLinesUpdate(cartId, lines) {
    const data = await storefront(M_LINES_UPDATE, { cartId, lines });
    return normalizeCart(throwUserErrors(data.cartLinesUpdate));
}
export async function cartLinesRemove(cartId, lineIds) {
    const data = await storefront(M_LINES_REMOVE, { cartId, lineIds });
    return normalizeCart(throwUserErrors(data.cartLinesRemove));
}
export async function getCart(cartId) {
    const data = await storefront(Q_CART, { id: cartId });
    return normalizeCart(data.cart);
}
