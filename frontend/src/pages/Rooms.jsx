import { useState } from "react";
import { Link } from "react-router-dom";
import { ROOMS } from "@/lib/api";
import { Calculator, ArrowRight, Sparkles, Check, Compass } from "lucide-react";

const IMAGES = {
    living: "/kits/living-room.jpg",
    bedroom: "/kits/bedroom.jpg",
    dining: "/kits/dining.jpg",
    outdoor: "/collections/page7.jpg",
    staircase: "/collections/page9.jpg",
};

const ROOM_PRESETS = [
    { id: "living", name: "Living Room", length: 16, width: 14, ceiling: 10, lumenRate: 20, kelvin: "2700K–3000K", targetCategory: "chandeliers" },
    { id: "dining", name: "Dining Room", length: 14, width: 12, ceiling: 9, lumenRate: 30, kelvin: "2700K Warm", targetCategory: "pendants" },
    { id: "bedroom", name: "Master Bedroom", length: 14, width: 13, ceiling: 9.5, lumenRate: 15, kelvin: "2700K Warm", targetCategory: "ceiling" },
    { id: "foyer", name: "Double-Height Foyer", length: 12, width: 12, ceiling: 18, lumenRate: 30, kelvin: "3000K Soft White", targetCategory: "double-height-chandeliers" },
    { id: "staircase", name: "Staircase & Duplex", length: 10, width: 10, ceiling: 16, lumenRate: 25, kelvin: "3000K Soft White", targetCategory: "double-height-chandeliers" },
];

export default function Rooms() {
    const [selectedRoom, setSelectedRoom] = useState(ROOM_PRESETS[0]);
    const [length, setLength] = useState(selectedRoom.length);
    const [width, setWidth] = useState(selectedRoom.width);
    const [ceiling, setCeiling] = useState(selectedRoom.ceiling);

    const handleRoomSelect = (preset) => {
        setSelectedRoom(preset);
        setLength(preset.length);
        setWidth(preset.width);
        setCeiling(preset.ceiling);
    };

    // Architectural lighting calculation formulas:
    // 1. Chandelier diameter rule of thumb: Length (ft) + Width (ft) = Diameter in inches
    const fixtureDiameterInches = Math.round(Number(length || 0) + Number(width || 0));
    const fixtureDiameterCm = Math.round(fixtureDiameterInches * 2.54);

    // 2. Total area in square feet
    const sqFt = Math.round(Number(length || 0) * Number(width || 0));

    // 3. Recommended total lumens (ambient layer)
    const recommendedLumens = Math.round(sqFt * (selectedRoom.lumenRate || 20));

    // 4. Vertical clearance rule:
    // Standard room: Bottom of fixture should hang at least 7 feet above floor.
    // Dining: 30-36 inches above table.
    // Tall ceilings: 2.5 to 3 inches of fixture height per foot of ceiling height.
    const fixtureHeightInches = Math.round(Number(ceiling || 9) * 2.5);

    return (
        <div className="max-w-[1400px] mx-auto px-6 md:px-10 py-16">
            <div className="tracking-editorial text-muted2 mb-4">Shop by Room</div>
            <h1 className="font-serif text-5xl md:text-6xl mb-6">Light every room, considered.</h1>
            <p className="max-w-2xl text-charcoal/70 mb-16 leading-relaxed">
                Every space demands a distinct architectural lighting proportion. Select your room to view curated fixtures, or use our architectural calculator below to find the exact fixture proportions for your floor plan.
            </p>

            {/* Room Collections Grid */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-24">
                {ROOMS.map((r, i) => (
                    <Link
                        key={r.slug}
                        data-testid={`room-tile-${r.slug.toLowerCase()}`}
                        to={`/rooms/${r.slug}`}
                        className={`relative overflow-hidden group image-zoom ${i === 0 ? "md:col-span-2 lg:col-span-2 aspect-[16/9]" : "aspect-[4/5]"}`}
                    >
                        <img src={IMAGES[r.slug]} alt={r.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-transparent to-transparent" />
                        <div className="absolute inset-x-0 bottom-0 p-8 text-ivory">
                            <div className="tracking-editorial text-ivory/70 mb-1">Room Collection</div>
                            <div className="font-serif text-4xl">{r.name}</div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Studio Lighting Sizing & Lumens Calculator */}
            <section className="bg-ivory-2 border border-[#E5E3DC] p-8 md:p-14">
                <div className="max-w-3xl mb-10">
                    <div className="flex items-center gap-2 text-xs tracking-editorial text-amber2 mb-3">
                        <Compass size={14} /> Architectural Studio Calculator
                    </div>
                    <h2 className="font-serif text-3xl md:text-4xl text-charcoal">
                        Find the exact proportions for your space
                    </h2>
                    <p className="text-sm text-charcoal/70 mt-2">
                        Calculate ideal chandelier diameter, hanging clearance, and lumens based on architectural design guidelines.
                    </p>
                </div>

                {/* Preset Room Pills */}
                <div className="flex flex-wrap gap-2 mb-8">
                    {ROOM_PRESETS.map((p) => (
                        <button
                            key={p.id}
                            type="button"
                            onClick={() => handleRoomSelect(p)}
                            className={`px-4 py-2 text-xs tracking-editorial border transition-all ${
                                selectedRoom.id === p.id
                                    ? "bg-charcoal text-ivory border-charcoal"
                                    : "border-charcoal/20 bg-ivory text-charcoal hover:border-amber2"
                            }`}
                        >
                            {p.name}
                        </button>
                    ))}
                </div>

                <div className="grid lg:grid-cols-[1.1fr_1fr] gap-10 items-start">
                    {/* Dimension Sliders / Inputs */}
                    <div className="space-y-6 bg-ivory p-6 md:p-8 border border-[#E5E3DC]">
                        <div>
                            <div className="flex justify-between text-xs tracking-editorial mb-2">
                                <span>Room Length</span>
                                <span className="font-medium text-charcoal">{length} feet</span>
                            </div>
                            <input
                                type="range"
                                min={8}
                                max={35}
                                value={length}
                                onChange={(e) => setLength(Number(e.target.value))}
                                className="w-full accent-amber2 cursor-pointer"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between text-xs tracking-editorial mb-2">
                                <span>Room Width</span>
                                <span className="font-medium text-charcoal">{width} feet</span>
                            </div>
                            <input
                                type="range"
                                min={8}
                                max={35}
                                value={width}
                                onChange={(e) => setWidth(Number(e.target.value))}
                                className="w-full accent-amber2 cursor-pointer"
                            />
                        </div>

                        <div>
                            <div className="flex justify-between text-xs tracking-editorial mb-2">
                                <span>Ceiling Height</span>
                                <span className="font-medium text-charcoal">{ceiling} feet</span>
                            </div>
                            <input
                                type="range"
                                min={8}
                                max={25}
                                step={0.5}
                                value={ceiling}
                                onChange={(e) => setCeiling(Number(e.target.value))}
                                className="w-full accent-amber2 cursor-pointer"
                            />
                        </div>

                        <div className="pt-2 text-xs text-muted2 border-t border-[#E5E3DC]">
                            Room Area: <span className="font-medium text-charcoal">{sqFt} sq ft</span> ({(sqFt * 0.0929).toFixed(1)} m²)
                        </div>
                    </div>

                    {/* Calculated Recommendations Card */}
                    <div className="bg-charcoal text-ivory p-6 md:p-8 space-y-6">
                        <div className="tracking-editorial text-amber2 text-xs flex items-center gap-1.5">
                            <Sparkles size={13} /> Tailored Architectural Recommendation
                        </div>

                        <div className="grid grid-cols-2 gap-6 border-b border-ivory/15 pb-6">
                            <div>
                                <div className="text-[11px] text-ivory/70 tracking-editorial mb-1">Recommended Diameter</div>
                                <div className="font-serif text-3xl md:text-4xl text-ivory">{fixtureDiameterInches}″</div>
                                <div className="text-xs text-ivory/60 mt-0.5">Approx. {fixtureDiameterCm} cm</div>
                            </div>
                            <div>
                                <div className="text-[11px] text-ivory/70 tracking-editorial mb-1">Target Lumens</div>
                                <div className="font-serif text-3xl md:text-4xl text-amber2">{recommendedLumens.toLocaleString("en-IN")}</div>
                                <div className="text-xs text-ivory/60 mt-0.5">Ambient illumination</div>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6 border-b border-ivory/15 pb-6 text-sm">
                            <div>
                                <div className="text-[11px] text-ivory/70 tracking-editorial mb-1">Recommended Kelvin</div>
                                <div className="font-medium text-ivory">{selectedRoom.kelvin}</div>
                            </div>
                            <div>
                                <div className="text-[11px] text-ivory/70 tracking-editorial mb-1">Clearance Height</div>
                                <div className="font-medium text-ivory">
                                    {selectedRoom.id === "dining" ? "30–36″ above table" : `≥ 7′ floor clearance`}
                                </div>
                            </div>
                        </div>

                        <div className="pt-2">
                            <Link
                                to={`/shop/${selectedRoom.targetCategory}`}
                                className="w-full bg-ivory text-charcoal py-3.5 px-6 tracking-editorial text-xs hover:bg-amber2 hover:text-ivory transition-colors flex items-center justify-center gap-2 group"
                            >
                                <span>Browse {selectedRoom.name} Lights</span>
                                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    );
}
