// Shopify Storefront API (GraphQL) client — public read-only access.
// Runs entirely in the browser. Do NOT put admin tokens here.

const DOMAIN = process.env.REACT_APP_SHOOP_DOMAIN || process.env.REACT_APP_SHOPIFY_STORE_DOMAIN || "v1hj1w-3k.myshopify.com";
const VERSION = process.env.REACT_APP_SHOPIFY_STOREFRONT_API_VERSION || "2025-01";
const TOKEN = process.env.REACT_APP_SHOPIFY_STOREFRONT_ACCESS_TOKEN || "";

export const ENDPOINT = DOMAIN
    ? `https://${DOMAIN}/api/${VERSION}/graphql.json`
    : null;

export const isShopifyConfigured = () => Boolean(DOMAIN && TOKEN && ENDPOINT);

async function storefront(query, variables = {}) {
    if (!isShopifyConfigured()) {
        throw new Error("Shopify Storefront API is not configured.");
    }
    const authHeaders = TOKEN.startsWith("shpat_")
        ? { "Shopify-Storefront-Private-Token": TOKEN }
        : { "X-Shopify-Storefront-Access-Token": TOKEN };

    const res = await fetch(ENDPOINT, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
            ...authHeaders,
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
    if (/\bgate\b/.test(t)) return "gate-lights";
    if (/\bwall\b/.test(t)) return "wall-lamps";
    return "";
}

export function collectionImageForCategory(cat) {
    switch (cat) {
        case "chandeliers": return "/collections/page11.jpg";
        case "double-height-chandeliers": return "/collections/page9.jpg";
        case "fan-chandeliers": return "/collections/page6.jpg";
        case "pendants": return "/collections/page8.jpg";
        case "wall": return "/collections/page10.jpg";
        case "table": return "/collections/page1.jpg";
        case "floor": return "/collections/page3.jpg";
        case "ceiling": return "/collections/page4.jpg";
        case "outdoor": return "/collections/page7.jpg";
        case "bamboo": return "/collections/page2.jpg";
        case "kids-lights": return "/collections/kids-lights.png";
        case "mirror-lights": return "/collections/mirror-lights.jpg";
        case "bulbs": return "/collections/page5.jpg";
        default: return "/collections/page11.jpg";
    }
}

export function normalizeProduct(p) {
    if (!p) return null;
    const price = Math.round(Number(p.priceRange?.minVariantPrice?.amount || 0));
    const compareAt = p.compareAtPriceRange?.minVariantPrice?.amount
        ? Math.round(Number(p.compareAtPriceRange.minVariantPrice.amount))
        : null;
    let images = (p.images?.nodes || []).map((n) => n.url).filter(Boolean);
    if (images.length === 0 && p.featuredImage?.url) images.push(p.featuredImage.url);
    const tags = (p.tags || []).map((t) => t.toLowerCase());
    const collectionHandles = (p.collections?.nodes || []).map((c) => c.handle);
    const category =
        categoryForProductType(p.productType) ||
        collectionHandles.find((h) => h !== "frontpage" && h !== "all") ||
        "";
    const subcategory = subcategoryForProductType(p.productType) ||
        (tags.includes("classic") ? "classic" : tags.includes("modern") ? "modern" : "");

    // Fall back to the original uploaded category collection image if the product has no image
    if (images.length === 0) {
        images = [collectionImageForCategory(category)];
    }

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
        availableForSale: p.availableForSale ?? true,
        variants: (p.variants?.nodes || []).map((v) => ({
            id: v.id,
            title: v.title,
            price: Math.round(Number(v.price.amount)),
            availableForSale: v.availableForSale,
            selectedOptions: v.selectedOptions || [],
            image: v.image?.url || images[0],
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

// ---- Built-in Catalog with ONLY Original Uploaded Product Images ----
const FALLBACK_PRODUCTS = [
    // Chandeliers - Modern
    {
        id: "prod-solene-cascade",
        slug: "solene-cascade-chandelier",
        handle: "solene-cascade-chandelier",
        name: "Solene Cascade Chandelier",
        productType: "Modern Chandelier",
        category: "chandeliers",
        subcategory: "modern",
        price: 189000,
        compareAtPrice: 215000,
        description: "A sculptural glass cascade suspended on hand-forged brass — a centrepiece for foyers and dining rooms.",
        finish: "Antique Brass",
        dimensions: "H 1400mm × Ø 900mm",
        material: "Hand-blown glass, brass",
        images: ["/collections/page11.jpg"],
        tags: ["chandelier", "modern", "featured", "new-arrival", "dining", "living"],
        featured: true,
        new_arrival: true,
        availableForSale: true,
        variants: [
            { id: "var-solene-1", title: "Antique Brass / 900mm", price: 189000, availableForSale: true }
        ],
        firstVariantId: "var-solene-1"
    },
    {
        id: "prod-meridian-ring",
        slug: "meridian-ring-chandelier",
        handle: "meridian-ring-chandelier",
        name: "Meridian Ring Chandelier",
        productType: "Modern Chandelier",
        category: "chandeliers",
        subcategory: "modern",
        price: 145000,
        compareAtPrice: 168000,
        description: "A perfect circle of soft-diffused light in blackened brass — geometric and architecturally poised.",
        finish: "Blackened Brass",
        dimensions: "Ø 1000mm × H 120mm",
        material: "Brass, opal glass",
        images: ["/collections/page11.jpg"],
        tags: ["chandelier", "modern", "featured", "living"],
        featured: true,
        new_arrival: false,
        availableForSale: true,
        variants: [
            { id: "var-meridian-1", title: "Blackened Brass / 1000mm", price: 145000, availableForSale: true }
        ],
        firstVariantId: "var-meridian-1"
    },
    {
        id: "prod-rain-drop-branch",
        slug: "rain-drop-branch-chandelier",
        handle: "rain-drop-branch-chandelier",
        name: "Rain Drop Branch Chandelier",
        productType: "Modern Chandelier",
        category: "chandeliers",
        subcategory: "modern",
        price: 215000,
        compareAtPrice: 245000,
        description: "Organic branch silhouette adorned with crystal droplets catching and dispersing ambient warm rays.",
        finish: "Champagne Gold",
        dimensions: "L 1500mm × W 600mm × H 800mm",
        material: "K9 Crystal, forged brass",
        images: ["/collections/page11.jpg"],
        tags: ["chandelier", "modern", "featured", "dining"],
        featured: true,
        new_arrival: true,
        availableForSale: true,
        variants: [
            { id: "var-raindrop-1", title: "Champagne Gold / 1500mm", price: 215000, availableForSale: true }
        ],
        firstVariantId: "var-raindrop-1"
    },
    {
        id: "prod-golden-willow",
        slug: "golden-willow-chandelier",
        handle: "golden-willow-chandelier",
        name: "Golden Willow Chandelier",
        productType: "Modern Chandelier",
        category: "chandeliers",
        subcategory: "modern",
        price: 195000,
        compareAtPrice: 220000,
        description: "Delicate weeping willow branches sculpted in antique gold with ambient leaf diffusers.",
        finish: "Antique Gold",
        dimensions: "Ø 1100mm × H 750mm",
        material: "Cast brass, art glass",
        images: ["/collections/page11.jpg"],
        tags: ["chandelier", "modern", "new", "living", "dining"],
        featured: false,
        new_arrival: true,
        availableForSale: true,
        variants: [
            { id: "var-willow-1", title: "Antique Gold", price: 195000, availableForSale: true }
        ],
        firstVariantId: "var-willow-1"
    },

    // Chandeliers - Classic
    {
        id: "prod-cristallo-classic",
        slug: "cristallo-classical-chandelier",
        handle: "cristallo-classical-chandelier",
        name: "Cristallo Classical Chandelier",
        productType: "Classic Chandelier",
        category: "chandeliers",
        subcategory: "classic",
        price: 265000,
        compareAtPrice: 295000,
        description: "A traditional multi-arm crystal chandelier — hand-cut Bohemian crystal on a hand-polished brass frame.",
        finish: "Polished Brass",
        dimensions: "H 1200mm × Ø 850mm",
        material: "Bohemian crystal, brass",
        images: ["/collections/page11.jpg"],
        tags: ["chandelier", "classic", "featured", "dining"],
        featured: true,
        new_arrival: false,
        availableForSale: true,
        variants: [
            { id: "var-cristallo-1", title: "12-Arm / Polished Brass", price: 265000, availableForSale: true }
        ],
        firstVariantId: "var-cristallo-1"
    },
    {
        id: "prod-regent-baroque",
        slug: "regent-baroque-chandelier",
        handle: "regent-baroque-chandelier",
        name: "Regent Baroque Chandelier",
        productType: "Classic Chandelier",
        category: "chandeliers",
        subcategory: "classic",
        price: 198000,
        compareAtPrice: 230000,
        description: "Ornate scrollwork with hand-draped crystal beads — an heirloom silhouette designed for period-style estates.",
        finish: "Antique Gold",
        dimensions: "H 950mm × Ø 700mm",
        material: "Crystal, cast brass",
        images: ["/collections/page11.jpg"],
        tags: ["chandelier", "classic", "living"],
        featured: false,
        new_arrival: false,
        availableForSale: true,
        variants: [
            { id: "var-regent-1", title: "Antique Gold / 8-Arm", price: 198000, availableForSale: true }
        ],
        firstVariantId: "var-regent-1"
    },

    // Double Height Chandeliers
    {
        id: "prod-atrium-cascade",
        slug: "atrium-cascade-grand",
        handle: "atrium-cascade-grand",
        name: "Atrium Cascade Grand",
        productType: "Double Height Chandelier",
        category: "double-height-chandeliers",
        subcategory: "modern",
        price: 485000,
        compareAtPrice: 540000,
        description: "A monumental 3.5m cascade for double-height foyers — smoked glass drops suspended on brushed brass canopies.",
        finish: "Brushed Brass",
        dimensions: "H 3500mm × Ø 1200mm",
        material: "Smoked glass, brass",
        images: ["/collections/page9.jpg"],
        tags: ["double-height", "modern", "featured", "new-arrival", "staircase"],
        featured: true,
        new_arrival: true,
        availableForSale: true,
        variants: [
            { id: "var-atrium-1", title: "3.5m Drop / 32 Lights", price: 485000, availableForSale: true }
        ],
        firstVariantId: "var-atrium-1"
    },
    {
        id: "prod-sphere-constellation",
        slug: "sphere-constellation",
        handle: "sphere-constellation",
        name: "Sphere Constellation",
        productType: "Double Height Chandelier",
        category: "double-height-chandeliers",
        subcategory: "modern",
        price: 385000,
        compareAtPrice: 420000,
        description: "Twenty-four hand-blown spheres suspended in a rhythmic constellation across a high-ceiling atrium.",
        finish: "Aged Brass",
        dimensions: "H 3000mm × Ø 1400mm",
        material: "Hand-blown glass, brass",
        images: ["/collections/page9.jpg"],
        tags: ["double-height", "modern", "staircase"],
        featured: false,
        new_arrival: true,
        availableForSale: true,
        variants: [
            { id: "var-constellation-1", title: "24-Sphere Grand", price: 385000, availableForSale: true }
        ],
        firstVariantId: "var-constellation-1"
    },
    {
        id: "prod-duplex-grand-crystal",
        slug: "duplex-grand-crystal",
        handle: "duplex-grand-crystal",
        name: "Duplex Grand Crystal",
        productType: "Double Height Chandelier",
        category: "double-height-chandeliers",
        subcategory: "classic",
        price: 585000,
        compareAtPrice: 650000,
        description: "Cascading full-lead crystal descending 4m in an exquisite spiral — designed for palatial stairwells and duplexes.",
        finish: "Champagne Gold",
        dimensions: "H 4000mm × Ø 1400mm",
        material: "Full-lead crystal, brass",
        images: ["/collections/page9.jpg"],
        tags: ["double-height", "classic", "featured", "staircase"],
        featured: true,
        new_arrival: false,
        availableForSale: true,
        variants: [
            { id: "var-duplex-1", title: "4m Drop / Champagne Gold", price: 585000, availableForSale: true }
        ],
        firstVariantId: "var-duplex-1"
    },
    {
        id: "prod-palladio-empire",
        slug: "palladio-empire-chandelier",
        handle: "palladio-empire-chandelier",
        name: "Palladio Empire Chandelier",
        productType: "Double Height Chandelier",
        category: "double-height-chandeliers",
        subcategory: "classic",
        price: 425000,
        compareAtPrice: 475000,
        description: "An empire-style 24-arm tiered chandelier with hand-cut crystal drops for classical villas and foyers.",
        finish: "Antique Gold",
        dimensions: "H 3200mm × Ø 1100mm",
        material: "Crystal, cast brass",
        images: ["/collections/page9.jpg"],
        tags: ["double-height", "classic", "staircase"],
        featured: false,
        new_arrival: false,
        availableForSale: true,
        variants: [
            { id: "var-palladio-1", title: "24-Arm Tiered", price: 425000, availableForSale: true }
        ],
        firstVariantId: "var-palladio-1"
    },

    // Fan Chandeliers
    {
        id: "prod-aerofoil-fan-chandelier",
        slug: "aerofoil-brass-fan-chandelier",
        handle: "aerofoil-brass-fan-chandelier",
        name: "Aerofoil Brass Fan Chandelier",
        productType: "Fan Chandelier",
        category: "fan-chandeliers",
        subcategory: "",
        price: 88000,
        compareAtPrice: 98000,
        description: "Aerodynamic sculpted walnut blades paired with a central warm brass LED chandelier — quiet motor with 6 speeds.",
        finish: "Brushed Brass & Walnut",
        dimensions: "Ø 1320mm × H 480mm",
        material: "Brass, natural walnut, opal acrylic",
        images: ["/collections/page6.jpg"],
        tags: ["fan-chandelier", "living", "bedroom", "featured"],
        featured: true,
        new_arrival: true,
        availableForSale: true,
        variants: [
            { id: "var-fan-1", title: "52-inch Walnut & Brass", price: 88000, availableForSale: true }
        ],
        firstVariantId: "var-fan-1"
    },
    {
        id: "prod-lumiere-retractable-fan",
        slug: "lumiere-retractable-blade-fan-chandelier",
        handle: "lumiere-retractable-blade-fan-chandelier",
        name: "Lumière Retractable Fan Chandelier",
        productType: "Fan Chandelier",
        category: "fan-chandeliers",
        subcategory: "",
        price: 76000,
        compareAtPrice: 85000,
        description: "Retractable smoked acrylic blades disappear when stationary, transforming into a minimalist crystal chandelier.",
        finish: "French Gold",
        dimensions: "Ø 1080mm (expanded) × H 420mm",
        material: "K9 crystal, brass alloy",
        images: ["/collections/page6.jpg"],
        tags: ["fan-chandelier", "bedroom", "dining"],
        featured: false,
        new_arrival: true,
        availableForSale: true,
        variants: [
            { id: "var-fan-2", title: "French Gold 42-inch", price: 76000, availableForSale: true }
        ],
        firstVariantId: "var-fan-2"
    },

    // Pendants
    {
        id: "prod-meridian-linear",
        slug: "meridian-linear-pendant",
        handle: "meridian-linear-pendant",
        name: "Meridian Linear Pendant",
        productType: "Modern Pendant",
        category: "pendants",
        subcategory: "modern",
        price: 62000,
        compareAtPrice: 72000,
        description: "A sleek horizon of architectural light. Linear pendant with warm-diffused acrylic and blackened steel.",
        finish: "Matte Black",
        dimensions: "L 1200mm × H 80mm",
        material: "Steel, opal acrylic",
        images: ["/collections/page8.jpg"],
        tags: ["pendant", "modern", "featured", "kitchen", "dining"],
        featured: true,
        new_arrival: false,
        availableForSale: true,
        variants: [
            { id: "var-linear-1", title: "Matte Black / 1200mm", price: 62000, availableForSale: true }
        ],
        firstVariantId: "var-linear-1"
    },
    {
        id: "prod-amber-orbit",
        slug: "amber-orbit-pendant",
        handle: "amber-orbit-pendant",
        name: "Amber Orbit Pendant",
        productType: "Modern Pendant",
        category: "pendants",
        subcategory: "modern",
        price: 42000,
        compareAtPrice: 48000,
        description: "A single hand-blown amber glass orb suspended on a slender brass stem. Warm, jewel-like ambience.",
        finish: "Polished Brass",
        dimensions: "H 800mm × Ø 300mm",
        material: "Amber glass, brass",
        images: ["/collections/page8.jpg"],
        tags: ["pendant", "modern", "featured", "new-arrival", "dining"],
        featured: true,
        new_arrival: true,
        availableForSale: true,
        variants: [
            { id: "var-orbit-1", title: "Amber Glass / Brass", price: 42000, availableForSale: true }
        ],
        firstVariantId: "var-orbit-1"
    },
    {
        id: "prod-vintage-brass-bell",
        slug: "vintage-brass-bell-pendant",
        handle: "vintage-brass-bell-pendant",
        name: "Vintage Brass Bell Pendant",
        productType: "Classic Pendant",
        category: "pendants",
        subcategory: "classic",
        price: 34500,
        compareAtPrice: 39000,
        description: "A hand-spun brass bell pendant with natural aged patina — timeless heritage silhouette.",
        finish: "Aged Brass",
        dimensions: "H 450mm × Ø 320mm",
        material: "Solid brass",
        images: ["/collections/page8.jpg"],
        tags: ["pendant", "classic", "kitchen"],
        featured: false,
        new_arrival: false,
        availableForSale: true,
        variants: [
            { id: "var-bell-1", title: "Aged Brass / 320mm", price: 34500, availableForSale: true }
        ],
        firstVariantId: "var-bell-1"
    },
    {
        id: "prod-colonial-lantern",
        slug: "colonial-lantern-pendant",
        handle: "colonial-lantern-pendant",
        name: "Colonial Lantern Pendant",
        productType: "Classic Pendant",
        category: "pendants",
        subcategory: "classic",
        price: 48500,
        compareAtPrice: 56000,
        description: "A four-panel seeded glass lantern encased in an antique brass frame — a colonial heritage fixture.",
        finish: "Antique Brass",
        dimensions: "H 700mm × Ø 400mm",
        material: "Brass, seedy glass",
        images: ["/collections/page8.jpg"],
        tags: ["pendant", "classic", "featured", "dining", "foyer"],
        featured: true,
        new_arrival: false,
        availableForSale: true,
        variants: [
            { id: "var-lantern-1", title: "Antique Brass", price: 48500, availableForSale: true }
        ],
        firstVariantId: "var-lantern-1"
    },

    // Wall Lamps
    {
        id: "prod-halo-disc-wall",
        slug: "halo-disc-wall-sconce",
        handle: "halo-disc-wall-sconce",
        name: "Halo Disc Wall Sconce",
        productType: "Modern Wall Sconce",
        category: "wall",
        subcategory: "modern",
        price: 18500,
        compareAtPrice: 22000,
        description: "A soft halo of indirect architectural light. Stunning in pairs framing vanity mirrors or bedroom headboards.",
        finish: "Brushed Bronze",
        dimensions: "Ø 300mm × D 80mm",
        material: "Aluminium, frosted glass",
        images: ["/collections/page10.jpg"],
        tags: ["wall", "modern", "featured", "new-arrival", "bedroom"],
        featured: true,
        new_arrival: true,
        availableForSale: true,
        variants: [
            { id: "var-halo-1", title: "Brushed Bronze", price: 18500, availableForSale: true }
        ],
        firstVariantId: "var-halo-1"
    },
    {
        id: "prod-nook-reading-wall",
        slug: "nook-reading-wall-light",
        handle: "nook-reading-wall-light",
        name: "Nook Reading Wall Light",
        productType: "Modern Wall Light",
        category: "wall",
        subcategory: "modern",
        price: 12500,
        compareAtPrice: 15000,
        description: "Articulated swing-arm bedside reading light with a focused conical shade and tactile brass switch.",
        finish: "Matte Black",
        dimensions: "Reach 500mm × H 200mm",
        material: "Steel, solid brass fittings",
        images: ["/collections/page10.jpg"],
        tags: ["wall", "modern", "bedroom"],
        featured: false,
        new_arrival: true,
        availableForSale: true,
        variants: [
            { id: "var-nook-1", title: "Matte Black", price: 12500, availableForSale: true }
        ],
        firstVariantId: "var-nook-1"
    },
    {
        id: "prod-rococo-wall-pair",
        slug: "rococo-wall-sconce-pair",
        handle: "rococo-wall-sconce-pair",
        name: "Rococo Wall Sconce (Pair)",
        productType: "Classic Wall Sconce",
        category: "wall",
        subcategory: "classic",
        price: 32500,
        compareAtPrice: 38000,
        description: "A pair of ornate cast-brass wall sconces with Bohemian crystal teardrops — sold as a curated pair.",
        finish: "Polished Brass",
        dimensions: "H 400mm × W 250mm each",
        material: "Cast brass, crystal",
        images: ["/collections/page10.jpg"],
        tags: ["wall", "classic", "featured", "living"],
        featured: true,
        new_arrival: false,
        availableForSale: true,
        variants: [
            { id: "var-rococo-1", title: "Pair (2 Units)", price: 32500, availableForSale: true }
        ],
        firstVariantId: "var-rococo-1"
    },
    {
        id: "prod-heritage-picture-light",
        slug: "heritage-picture-light",
        handle: "heritage-picture-light",
        name: "Heritage Picture Light",
        productType: "Classic Wall Light",
        category: "wall",
        subcategory: "classic",
        price: 14500,
        compareAtPrice: 17500,
        description: "A traditional slim picture light in aged brass with a rotatable hood — for fine artwork and bookcases.",
        finish: "Aged Brass",
        dimensions: "L 400mm × D 150mm",
        material: "Solid brass",
        images: ["/collections/page10.jpg"],
        tags: ["wall", "classic", "living"],
        featured: false,
        new_arrival: false,
        availableForSale: true,
        variants: [
            { id: "var-pic-1", title: "Aged Brass / 400mm", price: 14500, availableForSale: true }
        ],
        firstVariantId: "var-pic-1"
    },

    // Table Lamps
    {
        id: "prod-ostra-marble-table",
        slug: "ostra-marble-table-lamp",
        handle: "ostra-marble-table-lamp",
        name: "Ostra Marble Table Lamp",
        productType: "Table Lamp",
        category: "table",
        subcategory: "",
        price: 34500,
        compareAtPrice: 40000,
        description: "A hand-turned Carrara marble pedestal base cradles a natural linen drum shade — grounded elegance.",
        finish: "Carrara White",
        dimensions: "H 520mm × Ø 260mm",
        material: "Carrara marble, Belgian linen",
        images: ["/collections/page1.jpg"],
        tags: ["table", "featured", "living", "bedroom"],
        featured: true,
        new_arrival: false,
        availableForSale: true,
        variants: [
            { id: "var-ostra-1", title: "White Marble / Linen", price: 34500, availableForSale: true }
        ],
        firstVariantId: "var-ostra-1"
    },
    {
        id: "prod-atelier-desk-lamp",
        slug: "atelier-brass-desk-lamp",
        handle: "atelier-brass-desk-lamp",
        name: "Atelier Brass Desk Lamp",
        productType: "Table Lamp",
        category: "table",
        subcategory: "",
        price: 28500,
        compareAtPrice: 32000,
        description: "A cantilevered architect desk lamp in brushed gold with knurled mechanical adjustment knobs.",
        finish: "Brushed Gold",
        dimensions: "H 480mm × W 380mm",
        material: "Brass, cast iron base",
        images: ["/collections/page1.jpg"],
        tags: ["table", "study", "new-arrival"],
        featured: false,
        new_arrival: true,
        availableForSale: true,
        variants: [
            { id: "var-atelier-1", title: "Brushed Gold", price: 28500, availableForSale: true }
        ],
        firstVariantId: "var-atelier-1"
    },

    // Floor Lamps
    {
        id: "prod-verre-arc-floor",
        slug: "verre-arc-floor-lamp",
        handle: "verre-arc-floor-lamp",
        name: "Verre Arc Floor Lamp",
        productType: "Floor Lamp",
        category: "floor",
        subcategory: "",
        price: 78500,
        compareAtPrice: 89000,
        description: "A cantilevered sweeping brass arc suspends a smoked hand-blown glass globe — editorial statement.",
        finish: "Aged Brass",
        dimensions: "H 1900mm × Reach 1200mm",
        material: "Brass, smoked glass, black granite",
        images: ["/collections/page3.jpg"],
        tags: ["floor", "living", "featured", "new-arrival"],
        featured: true,
        new_arrival: true,
        availableForSale: true,
        variants: [
            { id: "var-arc-1", title: "Aged Brass / Smoked Globe", price: 78500, availableForSale: true }
        ],
        firstVariantId: "var-arc-1"
    },
    {
        id: "prod-linear-brass-floor",
        slug: "linear-brass-floor-lamp",
        handle: "linear-brass-floor-lamp",
        name: "Linear Brass Architectural Floor Lamp",
        productType: "Floor Lamp",
        category: "floor",
        subcategory: "",
        price: 54000,
        compareAtPrice: 62000,
        description: "Slim vertical brass beacon illuminating a subtle wash across textured wall surfaces.",
        finish: "Satin Brass",
        dimensions: "H 1600mm × Ø 220mm Base",
        material: "Solid brass, diffused LED",
        images: ["/collections/page3.jpg"],
        tags: ["floor", "living", "bedroom"],
        featured: false,
        new_arrival: false,
        availableForSale: true,
        variants: [
            { id: "var-linear-fl-1", title: "Satin Brass 1600mm", price: 54000, availableForSale: true }
        ],
        firstVariantId: "var-linear-fl-1"
    },

    // Ceiling Lights
    {
        id: "prod-aether-flush",
        slug: "aether-flush-ceiling",
        handle: "aether-flush-ceiling",
        name: "Aether Flush Ceiling Mount",
        productType: "Ceiling Light",
        category: "ceiling",
        subcategory: "",
        price: 26500,
        compareAtPrice: 31000,
        description: "A whisper-thin architectural flush mount that seamlessly dissolves into the ceiling plane.",
        finish: "Warm White & Brass",
        dimensions: "Ø 450mm × H 60mm",
        material: "Steel, edge-lit frosted acrylic",
        images: ["/collections/page4.jpg"],
        tags: ["ceiling", "corridor", "bedroom", "featured"],
        featured: true,
        new_arrival: false,
        availableForSale: true,
        variants: [
            { id: "var-aether-1", title: "450mm Warm White", price: 26500, availableForSale: true }
        ],
        firstVariantId: "var-aether-1"
    },
    {
        id: "prod-solarium-flush",
        slug: "solarium-flush-mount",
        handle: "solarium-flush-mount",
        name: "Solarium Alabaster Flush Mount",
        productType: "Ceiling Light",
        category: "ceiling",
        subcategory: "",
        price: 38000,
        compareAtPrice: 44000,
        description: "Spanish natural veined alabaster carved into a gentle shallow dome with brushed brass rim.",
        finish: "Natural Alabaster & Brass",
        dimensions: "Ø 400mm × H 90mm",
        material: "Genuine alabaster stone, brass",
        images: ["/collections/page4.jpg"],
        tags: ["ceiling", "foyer", "bedroom", "new-arrival"],
        featured: false,
        new_arrival: true,
        availableForSale: true,
        variants: [
            { id: "var-solarium-1", title: "Alabaster 400mm", price: 38000, availableForSale: true }
        ],
        firstVariantId: "var-solarium-1"
    },

    // Outdoor
    {
        id: "prod-terra-bollard",
        slug: "terra-bollard-outdoor",
        handle: "terra-bollard-outdoor",
        name: "Terra Bollard Outdoor Light",
        productType: "Outdoor Bollard",
        category: "outdoor",
        subcategory: "gate-lights",
        price: 22500,
        compareAtPrice: 26000,
        description: "Weather-sealed solid brass bollard for estate gates and garden walkways. IP65-rated.",
        finish: "Weathered Brass",
        dimensions: "H 600mm × Ø 100mm",
        material: "Solid brass, IP65 sealed driver",
        images: ["/collections/page7.jpg"],
        tags: ["outdoor", "gate-lights", "landscape", "featured", "new-arrival"],
        featured: true,
        new_arrival: true,
        availableForSale: true,
        variants: [
            { id: "var-terra-1", title: "Weathered Brass / IP65", price: 22500, availableForSale: true }
        ],
        firstVariantId: "var-terra-1"
    },
    {
        id: "prod-villa-gate-lantern",
        slug: "villa-gate-lantern",
        handle: "villa-gate-lantern",
        name: "Villa Heritage Gate Lantern",
        productType: "Outdoor Gate Lantern",
        category: "outdoor",
        subcategory: "gate-lights",
        price: 29000,
        compareAtPrice: 34000,
        description: "Stately pillar-top gate lantern in heavy cast brass with bevelled safety glass panes.",
        finish: "Verdigris Bronze",
        dimensions: "H 520mm × W 280mm",
        material: "Cast brass, tempered glass",
        images: ["/collections/page7.jpg"],
        tags: ["outdoor", "gate-lights", "pillar"],
        featured: false,
        new_arrival: false,
        availableForSale: true,
        variants: [
            { id: "var-villa-1", title: "Gate Pillar Mount", price: 29000, availableForSale: true }
        ],
        firstVariantId: "var-villa-1"
    },
    {
        id: "prod-coastal-brass-sconce",
        slug: "coastal-brass-wall-sconce",
        handle: "coastal-brass-wall-sconce",
        name: "Coastal Brass Outdoor Sconce",
        productType: "Outdoor Wall Sconce",
        category: "outdoor",
        subcategory: "wall-lamps",
        price: 19500,
        compareAtPrice: 23000,
        description: "Marine-grade nautical wall sconce engineered to withstand coastal humidity and harsh weather.",
        finish: "Raw Polished Brass",
        dimensions: "H 320mm × D 180mm",
        material: "Marine-grade brass, ribbed glass",
        images: ["/collections/page7.jpg"],
        tags: ["outdoor", "wall-lamps", "exterior", "featured"],
        featured: true,
        new_arrival: false,
        availableForSale: true,
        variants: [
            { id: "var-coastal-1", title: "Marine Brass / IP65", price: 19500, availableForSale: true }
        ],
        firstVariantId: "var-coastal-1"
    },

    // Bamboo
    {
        id: "prod-bamboo-weave-pendant",
        slug: "bamboo-weave-pendant",
        handle: "bamboo-weave-pendant",
        name: "Bamboo Weave Artisanal Pendant",
        productType: "Bamboo Pendant",
        category: "bamboo",
        subcategory: "",
        price: 18500,
        compareAtPrice: 22000,
        description: "Hand-woven organic bamboo pendant creating warm dappled shadows across organic interiors.",
        finish: "Natural Bamboo",
        dimensions: "H 450mm × Ø 500mm",
        material: "Hand-woven sustainably sourced bamboo",
        images: ["/collections/page2.jpg"],
        tags: ["bamboo", "dining", "living", "featured", "new-arrival"],
        featured: true,
        new_arrival: true,
        availableForSale: true,
        variants: [
            { id: "var-bamboo-1", title: "Natural Bamboo / 500mm", price: 18500, availableForSale: true }
        ],
        firstVariantId: "var-bamboo-1"
    },
    {
        id: "prod-bamboo-rattan-chandelier",
        slug: "bamboo-rattan-chandelier",
        handle: "bamboo-rattan-chandelier",
        name: "Bamboo Rattan Chandelier",
        productType: "Bamboo Chandelier",
        category: "bamboo",
        subcategory: "",
        price: 42500,
        compareAtPrice: 49000,
        description: "A grand multi-tier woven-rattan chandelier — coastal, warm, grounded, and artisanal.",
        finish: "Natural Rattan",
        dimensions: "H 700mm × Ø 800mm",
        material: "Rattan, structural bamboo, brass",
        images: ["/collections/page2.jpg"],
        tags: ["bamboo", "living", "featured"],
        featured: true,
        new_arrival: false,
        availableForSale: true,
        variants: [
            { id: "var-rattan-1", title: "800mm Multi-tier", price: 42500, availableForSale: true }
        ],
        firstVariantId: "var-rattan-1"
    },
    {
        id: "prod-bamboo-column-floor",
        slug: "bamboo-column-floor-lamp",
        handle: "bamboo-column-floor-lamp",
        name: "Bamboo Column Floor Lamp",
        productType: "Bamboo Floor Lamp",
        category: "bamboo",
        subcategory: "",
        price: 28500,
        compareAtPrice: 34000,
        description: "A statuesque bamboo lattice column housing internal warm illumination — textural warmth in any room.",
        finish: "Natural Bamboo",
        dimensions: "H 1600mm × Ø 300mm",
        material: "Bamboo cane, inner rice paper diffuser",
        images: ["/collections/page2.jpg"],
        tags: ["bamboo", "living", "bedroom"],
        featured: false,
        new_arrival: true,
        availableForSale: true,
        variants: [
            { id: "var-bcol-1", title: "1600mm Column", price: 28500, availableForSale: true }
        ],
        firstVariantId: "var-bcol-1"
    },

    // Kids Lights
    {
        id: "prod-starlight-nursery-chandelier",
        slug: "starlight-nursery-chandelier",
        handle: "starlight-nursery-chandelier",
        name: "Starlight Nursery Chandelier",
        productType: "Kids Light",
        category: "kids-lights",
        subcategory: "",
        price: 36000,
        compareAtPrice: 42000,
        description: "Whimsical celestial chandelier adorned with soft-glow acrylic stars and child-safe LED bulbs.",
        finish: "Soft Cream & Gold",
        dimensions: "Ø 600mm × H 450mm",
        material: "Shatterproof acrylic, powder-coated steel",
        images: ["/collections/kids-lights.png"],
        tags: ["kids-lights", "nursery", "bedroom", "featured", "new-arrival"],
        featured: true,
        new_arrival: true,
        availableForSale: true,
        variants: [
            { id: "var-star-1", title: "Soft Cream / Warm White", price: 36000, availableForSale: true }
        ],
        firstVariantId: "var-star-1"
    },
    {
        id: "prod-petit-cloud-pendant",
        slug: "petit-cloud-pendant",
        handle: "petit-cloud-pendant",
        name: "Petit Cloud Nursery Pendant",
        productType: "Kids Light",
        category: "kids-lights",
        subcategory: "",
        price: 22000,
        compareAtPrice: 26000,
        description: "Floating cloud silhouette casting gentle, non-glare ambient light ideal for bedtime stories.",
        finish: "Matte White",
        dimensions: "L 550mm × W 350mm × H 200mm",
        material: "Moulded matte polymer, diffused LED",
        images: ["/collections/kids-lights.png"],
        tags: ["kids-lights", "nursery", "bedroom"],
        featured: false,
        new_arrival: true,
        availableForSale: true,
        variants: [
            { id: "var-cloud-1", title: "Matte White Cloud", price: 22000, availableForSale: true }
        ],
        firstVariantId: "var-cloud-1"
    },

    // Mirror Lights
    {
        id: "prod-luxe-vanity-mirror-bar",
        slug: "luxe-brass-vanity-mirror-bar",
        handle: "luxe-brass-vanity-mirror-bar",
        name: "Luxe Brass Vanity Mirror Bar",
        productType: "Mirror Light",
        category: "mirror-lights",
        subcategory: "",
        price: 24500,
        compareAtPrice: 29000,
        description: "High-CRI 95+ vanity over-mirror light in solid brass delivering true color rendering for dressing suites.",
        finish: "Polished Brass",
        dimensions: "L 750mm × D 90mm × H 50mm",
        material: "Solid brass, opal diffuser, IP44 moisture-sealed",
        images: ["/collections/mirror-lights.jpg"],
        tags: ["mirror-lights", "vanity", "bathroom", "featured", "new-arrival"],
        featured: true,
        new_arrival: true,
        availableForSale: true,
        variants: [
            { id: "var-vanity-1", title: "750mm Polished Brass", price: 24500, availableForSale: true }
        ],
        firstVariantId: "var-vanity-1"
    },
    {
        id: "prod-aurelia-backlit-sconce",
        slug: "aurelia-backlit-mirror-sconce",
        handle: "aurelia-backlit-mirror-sconce",
        name: "Aurelia Backlit Mirror Sconce",
        productType: "Mirror Light",
        category: "mirror-lights",
        subcategory: "",
        price: 18500,
        compareAtPrice: 22000,
        description: "Slim linear flank sconce designed to mount adjacent to vanity mirrors for shadow-free illumination.",
        finish: "Brushed Bronze",
        dimensions: "H 600mm × W 40mm × D 60mm",
        material: "Aluminium, silicone optic, IP44",
        images: ["/collections/mirror-lights.jpg"],
        tags: ["mirror-lights", "vanity"],
        featured: false,
        new_arrival: true,
        availableForSale: true,
        variants: [
            { id: "var-aurelia-1", title: "Brushed Bronze 600mm", price: 18500, availableForSale: true }
        ],
        firstVariantId: "var-aurelia-1"
    },

    // Bulbs (12 subcategories)
    {
        id: "prod-bulb-e27-4w-filament",
        slug: "e27-4w-filament-vintage-bulb",
        handle: "e27-4w-filament-vintage-bulb",
        name: "E27 · 4W Vintage Filament Bulb",
        productType: "Bulb",
        category: "bulbs",
        subcategory: "e27-4w-filament",
        price: 850,
        compareAtPrice: 1100,
        description: "Warm amber vintage spiral filament LED bulb with standard E27 Edison screw base.",
        finish: "Amber Glass",
        dimensions: "Ø 64mm × H 140mm",
        material: "Amber glass, LED filament",
        images: ["/collections/page5.jpg"],
        tags: ["bulbs", "e27-4w-filament", "filament"],
        featured: true,
        new_arrival: false,
        availableForSale: true,
        variants: [
            { id: "var-b-e27-4w", title: "E27 4W Warm 2200K", price: 850, availableForSale: true }
        ],
        firstVariantId: "var-b-e27-4w"
    },
    {
        id: "prod-bulb-e14-4w-bent-tip",
        slug: "e14-4w-bent-tip-candle-bulb",
        handle: "e14-4w-bent-tip-candle-bulb",
        name: "E14 · 4W Bent-Tip Candle Filament",
        productType: "Bulb",
        category: "bulbs",
        subcategory: "e14-4w-bent-tip-filament",
        price: 950,
        compareAtPrice: 1200,
        description: "Curved bent-tip flame effect candle bulb for classic chandeliers and crystal sconces.",
        finish: "Clear Glass",
        dimensions: "Ø 35mm × H 120mm",
        material: "Clear glass, LED filament",
        images: ["/collections/page5.jpg"],
        tags: ["bulbs", "e14-4w-bent-tip-filament", "candle"],
        featured: false,
        new_arrival: true,
        availableForSale: true,
        variants: [
            { id: "var-b-e14-tip", title: "E14 Bent-Tip 2700K", price: 950, availableForSale: true }
        ],
        firstVariantId: "var-b-e14-tip"
    },
    {
        id: "prod-bulb-e27-12w-single-step",
        slug: "e27-12w-single-step-bulb",
        handle: "e27-12w-single-step-bulb",
        name: "E27 · 12W Single Step LED Bulb",
        productType: "Bulb",
        category: "bulbs",
        subcategory: "e27-12w-single-step",
        price: 1250,
        compareAtPrice: 1500,
        description: "High-output diffused ambient bulb delivering 1200 lumens of continuous gentle illumination.",
        finish: "Frosted Opal",
        dimensions: "Ø 70mm × H 130mm",
        material: "Opal polycarbonate, aluminium heat sink",
        images: ["/collections/page5.jpg"],
        tags: ["bulbs", "e27-12w-single-step"],
        featured: false,
        new_arrival: false,
        availableForSale: true,
        variants: [
            { id: "var-b-e27-12w", title: "E27 12W 3000K", price: 1250, availableForSale: true }
        ],
        firstVariantId: "var-b-e27-12w"
    },
    {
        id: "prod-bulb-e27-3-colour",
        slug: "e27-3-colour-architectural-bulb",
        handle: "e27-3-colour-architectural-bulb",
        name: "E27 · 3 Colour Architectural Bulb",
        productType: "Bulb",
        category: "bulbs",
        subcategory: "e27-3-colour",
        price: 1450,
        compareAtPrice: 1750,
        description: "Toggle between 3000K warm, 4000K neutral, and 6000K daylight with standard wall switch cycles.",
        finish: "Opal White",
        dimensions: "Ø 60mm × H 115mm",
        material: "Opal glass, tri-chip LED",
        images: ["/collections/page5.jpg"],
        tags: ["bulbs", "e27-3-colour", "featured"],
        featured: true,
        new_arrival: true,
        availableForSale: true,
        variants: [
            { id: "var-b-e27-3c", title: "Tri-colour Switchable E27", price: 1450, availableForSale: true }
        ],
        firstVariantId: "var-b-e27-3c"
    },
    {
        id: "prod-bulb-e14-4w-candle",
        slug: "e14-4w-candle-filament-bulb",
        handle: "e14-4w-candle-filament-bulb",
        name: "E14 · 4W Candle Filament Bulb",
        productType: "Bulb",
        category: "bulbs",
        subcategory: "e14-4w-candle-filament",
        price: 900,
        compareAtPrice: 1100,
        description: "Classic straight-tip candle bulb for chandeliers and multi-arm wall sconces.",
        finish: "Clear Glass",
        dimensions: "Ø 35mm × H 98mm",
        material: "Clear glass, LED filament",
        images: ["/collections/page5.jpg"],
        tags: ["bulbs", "e14-4w-candle-filament"],
        featured: false,
        new_arrival: false,
        availableForSale: true,
        variants: [
            { id: "var-b-e14-cf", title: "E14 4W Candle 2700K", price: 900, availableForSale: true }
        ],
        firstVariantId: "var-b-e14-cf"
    },
    {
        id: "prod-bulb-e14-12w-tricolour",
        slug: "e14-12w-tricolour-bulb",
        handle: "e14-12w-tricolour-bulb",
        name: "E14 · 12W Tricolour Bulb",
        productType: "Bulb",
        category: "bulbs",
        subcategory: "e14-12w-tricolour",
        price: 1350,
        compareAtPrice: 1600,
        description: "High-wattage 3-colour switchable mini screw bulb for fixtures requiring rich illumination.",
        finish: "Frosted Opal",
        dimensions: "Ø 38mm × H 105mm",
        material: "Aluminium, opal diffuser",
        images: ["/collections/page5.jpg"],
        tags: ["bulbs", "e14-12w-tricolour"],
        featured: false,
        new_arrival: true,
        availableForSale: true,
        variants: [
            { id: "var-b-e14-12tc", title: "E14 12W Tricolour", price: 1350, availableForSale: true }
        ],
        firstVariantId: "var-b-e14-12tc"
    },
    {
        id: "prod-bulb-e14-tricolour",
        slug: "e14-tricolour-bulb",
        handle: "e14-tricolour-bulb",
        name: "E14 · Tricolour Chandelier Bulb",
        productType: "Bulb",
        category: "bulbs",
        subcategory: "e14-tricolour",
        price: 1150,
        compareAtPrice: 1400,
        description: "3-step colour temperature switching candle bulb for modern and classical chandeliers.",
        finish: "Frosted Glass",
        dimensions: "Ø 35mm × H 98mm",
        material: "Frosted glass, LED",
        images: ["/collections/page5.jpg"],
        tags: ["bulbs", "e14-tricolour"],
        featured: false,
        new_arrival: false,
        availableForSale: true,
        variants: [
            { id: "var-b-e14-tc", title: "E14 Tricolour", price: 1150, availableForSale: true }
        ],
        firstVariantId: "var-b-e14-tc"
    },
    {
        id: "prod-bulb-g9-single",
        slug: "g9-single-colour-bulb",
        handle: "g9-single-colour-bulb",
        name: "G9 · Single Colour Warm LED",
        productType: "Bulb",
        category: "bulbs",
        subcategory: "g9-single-colour",
        price: 650,
        compareAtPrice: 850,
        description: "Compact bi-pin G9 LED replacement for modern teardrop and sphere chandeliers.",
        finish: "Silicone Encapsulated",
        dimensions: "Ø 16mm × H 48mm",
        material: "Ceramic base, clear silicone",
        images: ["/collections/page5.jpg"],
        tags: ["bulbs", "g9-single-colour"],
        featured: false,
        new_arrival: false,
        availableForSale: true,
        variants: [
            { id: "var-b-g9-sc", title: "G9 3W Warm 2700K", price: 650, availableForSale: true }
        ],
        firstVariantId: "var-b-g9-sc"
    },
    {
        id: "prod-bulb-g9-tricolour",
        slug: "g9-tricolour-bulb",
        handle: "g9-tricolour-bulb",
        name: "G9 · Tricolour Architectural LED",
        productType: "Bulb",
        category: "bulbs",
        subcategory: "g9-tricolour",
        price: 850,
        compareAtPrice: 1050,
        description: "Tri-temperature switchable miniature G9 bulb for double-height and ring chandeliers.",
        finish: "Ceramic & Clear Lens",
        dimensions: "Ø 18mm × H 52mm",
        material: "Ceramic, optic lens",
        images: ["/collections/page5.jpg"],
        tags: ["bulbs", "g9-tricolour"],
        featured: false,
        new_arrival: true,
        availableForSale: true,
        variants: [
            { id: "var-b-g9-tc", title: "G9 5W Tricolour", price: 850, availableForSale: true }
        ],
        firstVariantId: "var-b-g9-tc"
    },
    {
        id: "prod-bulb-g4",
        slug: "g4-bulb",
        handle: "g4-bulb",
        name: "G4 · Mini Crystal Fixture Bulb",
        productType: "Bulb",
        category: "bulbs",
        subcategory: "g4-bulb",
        price: 450,
        compareAtPrice: 600,
        description: "12V low-voltage micro capsule LED for precision crystal pendants and organic branch fixtures.",
        finish: "Clear Silicone",
        dimensions: "Ø 10mm × H 30mm",
        material: "Silicone, bi-pin pins",
        images: ["/collections/page5.jpg"],
        tags: ["bulbs", "g4-bulb"],
        featured: false,
        new_arrival: false,
        availableForSale: true,
        variants: [
            { id: "var-b-g4", title: "G4 12V 2W Warm White", price: 450, availableForSale: true }
        ],
        firstVariantId: "var-b-g4"
    },
    {
        id: "prod-bulb-e14-4w-dimmable",
        slug: "e14-4w-dimmable-bulb",
        handle: "e14-4w-dimmable-bulb",
        name: "E14 · 4W Dimmable Candle LED",
        productType: "Bulb",
        category: "bulbs",
        subcategory: "e14-4w-dimmable",
        price: 1100,
        compareAtPrice: 1350,
        description: "Smooth 0-100% trailing-edge dimming curve with warm-glow color shift technology.",
        finish: "Clear Glass",
        dimensions: "Ø 35mm × H 100mm",
        material: "Glass, dimmable IC driver",
        images: ["/collections/page5.jpg"],
        tags: ["bulbs", "e14-4w-dimmable"],
        featured: false,
        new_arrival: false,
        availableForSale: true,
        variants: [
            { id: "var-b-e14-dim", title: "E14 4W Dimmable 2700K", price: 1100, availableForSale: true }
        ],
        firstVariantId: "var-b-e14-dim"
    },
    {
        id: "prod-bulb-e27-4w-dimmable",
        slug: "e27-4w-dimmable-bulb",
        handle: "e27-4w-dimmable-bulb",
        name: "E27 · 4W Dimmable Filament",
        productType: "Bulb",
        category: "bulbs",
        subcategory: "e27-4w-dimmable",
        price: 1200,
        compareAtPrice: 1450,
        description: "Flicker-free dimmable Edison bulb compatible with luxury home automation and wall dimmers.",
        finish: "Smoked Glass",
        dimensions: "Ø 64mm × H 145mm",
        material: "Smoked glass, dimmable LED",
        images: ["/collections/page5.jpg"],
        tags: ["bulbs", "e27-4w-dimmable"],
        featured: false,
        new_arrival: false,
        availableForSale: true,
        variants: [
            { id: "var-b-e27-dim", title: "E27 4W Dimmable Smoked", price: 1200, availableForSale: true }
        ],
        firstVariantId: "var-b-e27-dim"
    }
];

function filterFallbackProducts({ query = "", first = 100 } = {}) {
    let prods = [...FALLBACK_PRODUCTS];
    if (query && query.trim()) {
        const q = query.trim().toLowerCase();
        prods = prods.filter((p) =>
            p.name.toLowerCase().includes(q) ||
            p.description.toLowerCase().includes(q) ||
            p.category.toLowerCase().includes(q) ||
            (p.tags || []).some((t) => t.toLowerCase().includes(q))
        );
    }
    return prods.slice(0, first);
}

function getFallbackProductByHandle(handle) {
    if (!handle) return null;
    const h = handle.toLowerCase();
    return FALLBACK_PRODUCTS.find((p) => p.slug.toLowerCase() === h || p.handle.toLowerCase() === h) || null;
}

export async function listProducts({ first = 100, query = "" } = {}) {
    if (isShopifyConfigured()) {
        try {
            const data = await storefront(Q_PRODUCTS, { first, query });
            const live = (data.products?.nodes || []).map(normalizeProduct).filter(Boolean);
            if (live.length > 0) return live;
        } catch (e) {
            console.warn("Shopify Storefront API query failed, displaying Adore catalog:", e.message);
        }
    }
    return filterFallbackProducts({ first, query });
}

export async function getProductByHandle(handle) {
    if (isShopifyConfigured()) {
        try {
            const data = await storefront(Q_PRODUCT_BY_HANDLE, { handle });
            if (data?.product) return normalizeProduct(data.product);
        } catch (e) {
            console.warn("Shopify getProductByHandle failed, searching catalog:", e.message);
        }
    }
    return getFallbackProductByHandle(handle);
}

// ---- Cart normalization & Local Cart support ----
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
            image: l.merchandise.image?.url || collectionImageForCategory(categoryForProductType(l.merchandise.product?.title)),
            price: Math.round(Number(l.merchandise.price.amount)),
            quantity: l.quantity,
        })),
    };
}

const LOCAL_STORAGE_CART_KEY = "adore_local_cart_store";

function getStoredLocalCart() {
    try {
        const raw = localStorage.getItem(LOCAL_STORAGE_CART_KEY);
        if (raw) return JSON.parse(raw);
    } catch {}
    return null;
}

function saveStoredLocalCart(cart) {
    try {
        if (cart) localStorage.setItem(LOCAL_STORAGE_CART_KEY, JSON.stringify(cart));
        else localStorage.removeItem(LOCAL_STORAGE_CART_KEY);
    } catch {}
}

function buildLocalCartState(lines = []) {
    let subtotal = 0;
    let totalQty = 0;
    const formattedLines = lines.map((l) => {
        subtotal += (l.price || 0) * (l.quantity || 1);
        totalQty += (l.quantity || 1);
        return l;
    });

    const itemsSummary = formattedLines.map((i) => `${i.name} (x${i.quantity})`).join(", ");
    const waUrl = `https://wa.me/918178867115?text=${encodeURIComponent(`Hi Adore Lighting, I would like to place an order for: ${itemsSummary}`)}`;
    const shopifyDirectUrl = DOMAIN ? `https://${DOMAIN}/cart` : waUrl;

    return {
        id: "adore_local_cart",
        checkoutUrl: shopifyDirectUrl,
        totalQuantity: totalQty,
        subtotal,
        total: subtotal,
        currency: "INR",
        lines: formattedLines,
    };
}

function localCartCreate(items = []) {
    const lines = items.map((item, idx) => {
        const fallbackProd = FALLBACK_PRODUCTS.find((p) =>
            p.firstVariantId === item.merchandiseId ||
            p.variants.some((v) => v.id === item.merchandiseId)
        ) || FALLBACK_PRODUCTS[0];

        return {
            lineId: `line-${Date.now()}-${idx}`,
            variantId: item.merchandiseId || fallbackProd.firstVariantId,
            variantTitle: fallbackProd.name,
            productId: fallbackProd.id,
            productHandle: fallbackProd.slug,
            name: fallbackProd.name,
            image: fallbackProd.images?.[0] || "",
            price: fallbackProd.price,
            quantity: item.quantity || 1,
        };
    });

    const cart = buildLocalCartState(lines);
    saveStoredLocalCart(cart);
    return cart;
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
    if (isShopifyConfigured()) {
        try {
            const data = await storefront(M_CART_CREATE, { lines });
            return normalizeCart(throwUserErrors(data.cartCreate));
        } catch (e) {
            console.warn("Shopify cartCreate error, using local bag:", e.message);
        }
    }
    return localCartCreate(lines);
}

export async function cartLinesAdd(cartId, lines) {
    if (isShopifyConfigured() && !cartId?.startsWith("adore_local")) {
        try {
            const data = await storefront(M_LINES_ADD, { cartId, lines });
            return normalizeCart(throwUserErrors(data.cartLinesAdd));
        } catch (e) {
            console.warn("Shopify cartLinesAdd error:", e.message);
        }
    }
    const current = getStoredLocalCart() || buildLocalCartState();
    const existing = [...current.lines];
    for (const item of lines) {
        const idx = existing.findIndex((l) => l.variantId === item.merchandiseId);
        if (idx >= 0) {
            existing[idx].quantity += (item.quantity || 1);
        } else {
            const prod = FALLBACK_PRODUCTS.find((p) =>
                p.firstVariantId === item.merchandiseId ||
                p.variants.some((v) => v.id === item.merchandiseId)
            ) || FALLBACK_PRODUCTS[0];
            existing.push({
                lineId: `line-${Date.now()}-${existing.length}`,
                variantId: item.merchandiseId || prod.firstVariantId,
                variantTitle: prod.name,
                productId: prod.id,
                productHandle: prod.slug,
                name: prod.name,
                image: prod.images?.[0] || "",
                price: prod.price,
                quantity: item.quantity || 1,
            });
        }
    }
    const next = buildLocalCartState(existing);
    saveStoredLocalCart(next);
    return next;
}

export async function cartLinesUpdate(cartId, lines) {
    if (isShopifyConfigured() && !cartId?.startsWith("adore_local")) {
        try {
            const data = await storefront(M_LINES_UPDATE, { cartId, lines });
            return normalizeCart(throwUserErrors(data.cartLinesUpdate));
        } catch (e) {
            console.warn("Shopify cartLinesUpdate error:", e.message);
        }
    }
    const current = getStoredLocalCart() || buildLocalCartState();
    const updated = current.lines.map((l) => {
        const match = lines.find((u) => u.id === l.lineId);
        return match ? { ...l, quantity: match.quantity } : l;
    });
    const next = buildLocalCartState(updated);
    saveStoredLocalCart(next);
    return next;
}

export async function cartLinesRemove(cartId, lineIds) {
    if (isShopifyConfigured() && !cartId?.startsWith("adore_local")) {
        try {
            const data = await storefront(M_LINES_REMOVE, { cartId, lineIds });
            return normalizeCart(throwUserErrors(data.cartLinesRemove));
        } catch (e) {
            console.warn("Shopify cartLinesRemove error:", e.message);
        }
    }
    const current = getStoredLocalCart() || buildLocalCartState();
    const filtered = current.lines.filter((l) => !lineIds.includes(l.lineId));
    const next = buildLocalCartState(filtered);
    saveStoredLocalCart(next);
    return next;
}

export async function getCart(cartId) {
    if (isShopifyConfigured() && !cartId?.startsWith("adore_local")) {
        try {
            const data = await storefront(Q_CART, { id: cartId });
            return normalizeCart(data.cart);
        } catch (e) {
            console.warn("Shopify getCart error:", e.message);
        }
    }
    return getStoredLocalCart() || buildLocalCartState();
}
