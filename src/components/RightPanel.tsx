'use client';

import { usePropertyStore } from '../store/usePropertyStore';
import { Share, Waves, Tv, Car, Trees, Wifi, Home, X, MapPin, ExternalLink } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, XAxis, Tooltip } from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';

const chartData = [
    { year: '2025', price: 1000000 },
    { year: '2026', price: 1000000 },
];

const renderAmenityIcon = (name: string) => {
    switch (name.toLowerCase()) {
        case 'private pool': return <Waves className="w-5 h-5 text-gray-500" />;
        case 'living room': return <Home className="w-5 h-5 text-gray-500" />;
        case 'full kitchen': return <Trees className="w-5 h-5 text-gray-500" />;
        case 'air conditioning': return <Tv className="w-5 h-5 text-gray-500" />;
        case 'wifi': return <Wifi className="w-5 h-5 text-gray-500" />;
        case 'parking': return <Car className="w-5 h-5 text-gray-500" />;
        default: return <div className="w-5 h-5 bg-gray-200 rounded" />;
    }
};

const PanelContent = () => {
    const { selectedProperty, setIsSheetOpen } = usePropertyStore();
    if (!selectedProperty) return null;

    const handleShare = async () => {
        const shareData = {
            title: selectedProperty?.title,
            text: `${selectedProperty?.title} - ${selectedProperty?.location}\nRp. ${selectedProperty?.price.toLocaleString('id-ID')} / malam`,
            url: window.location.href,
        };

        if (navigator.share) {
            try {
                await navigator.share(shareData);
            } catch {
            }
        } else {
            await navigator.clipboard.writeText(
                `${shareData.title}\n${shareData.text}\n${shareData.url}`
            );
            alert('Link copied to clipboard!');
        }
    };

    return (
        <div className="flex flex-col gap-8 p-6 md:p-10">
            {/* Top Actions */}
            <div className="flex items-center justify-between">
                <div className="flex gap-3">
                    <button onClick={handleShare} className="w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors">
                        <Share className="w-5 h-5 text-gray-900" />
                    </button>
                </div>
                <div className="flex items-center gap-3">
                    <a
                        href={`https://wa.me/628212200288?text=${encodeURIComponent(`Halo, saya tertarik untuk menyewa *${selectedProperty?.title}* di ${selectedProperty?.location}.\n\nBoleh saya tanya ketersediaan dan informasi lebih lanjut?\n\nHarga: Rp. ${selectedProperty?.price.toLocaleString('id-ID')} / malam`)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-black text-white px-8 py-3 rounded-full font-medium hover:bg-gray-800 transition-colors inline-block"
                    >
                        Sewa Villa
                    </a>
                    {/* Mobile close button */}
                    <button
                        className="md:hidden w-12 h-12 rounded-full border border-gray-200 flex items-center justify-center hover:bg-gray-50 transition-colors"
                        onClick={() => setIsSheetOpen(false)}
                    >
                        <X className="w-5 h-5 text-gray-900" />
                    </button>
                </div>
            </div>

            {/* Header Info */}
            <div className="flex flex-col gap-4">
                <div>
                    <h2 className="text-2xl md:text-[32px] leading-tight font-semibold tracking-tight text-gray-900">{selectedProperty.title}</h2>
                    <p className="text-gray-500 mt-1">{selectedProperty.location}</p>
                </div>
                <div className="flex flex-col">
                    {selectedProperty.description.split('\n\n').map((para, i) => (
                        <p key={i} className="text-gray-600 leading-relaxed text-[15px] mb-3 last:mb-0">
                            {para}
                        </p>
                    ))}
                </div>
                <div className="flex items-end gap-6 mt-4 border-b border-gray-100 pb-8">
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-semibold">{selectedProperty.beds}</span>
                        <span className="text-gray-500 text-sm">Kamar Tidur</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                        <span className="text-3xl font-semibold">{selectedProperty.baths}</span>
                        <span className="text-gray-500 text-sm">Kamar Mandi</span>
                    </div>
                    {selectedProperty.sqft && (
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-semibold">{selectedProperty.sqft?.toLocaleString()}</span>
                            <span className="text-gray-500 text-sm">m2</span>
                        </div>
                    )}
                </div>

                {/* Location */}
                <a
                    href={selectedProperty.googleMapsUrl ?? `https://www.google.com/maps?q=${selectedProperty.coordinates.lat},${selectedProperty.coordinates.lng}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 mt-2 group w-fit"
                >
                    <MapPin className="w-4 h-4 shrink-0" style={{ color: 'var(--accent)' }} />
                    <span className="text-sm text-gray-600 group-hover:text-black transition-colors">{selectedProperty.location}</span>
                    <ExternalLink className="w-3 h-3 text-gray-400 group-hover:text-black transition-colors" />
                </a>
            </div>

            {/* Amenities */}
            <div className="flex flex-col gap-4">
                <h3 className="text-lg font-semibold">Fasilitas</h3>
                <div className="grid grid-cols-3 gap-y-6 gap-x-2 mt-2">
                    {selectedProperty.amenities.map(amenity => (
                        <div key={amenity} className="flex items-center gap-2">
                            {renderAmenityIcon(amenity)}
                            <span className="text-[13px] text-gray-600 font-medium whitespace-nowrap">{amenity}</span>
                        </div>
                    ))}
                </div>
            </div>

            {/* Floor Plan */}
            {/* <div className="flex flex-col gap-4 border-t border-gray-100 pt-8">
                <h3 className="text-lg font-semibold">Floor plan</h3>
                <div className="flex gap-4">
                    <div className="flex-1 rounded-2xl border border-gray-200 p-6 flex flex-col items-center hover:border-gray-300 transition-colors cursor-pointer bg-gray-50/50">
                        <span className="text-sm font-semibold mb-6 self-start">Floor 1</span>
                        <div className="w-full relative aspect-square flex items-center justify-center mix-blend-multiply">
                            <Image src="/floor_plan.png" alt="Floor Plan Level 1" fill className="object-contain" />
                        </div>
                    </div>
                    <div className="flex-1 rounded-2xl border border-gray-200 p-6 flex flex-col items-center hover:border-gray-300 transition-colors cursor-pointer bg-gray-50/50">
                        <span className="text-sm font-semibold mb-6 self-start">Floor 2</span>
                        <div className="w-full relative aspect-square flex items-center justify-center mix-blend-multiply">
                            <Image src="/floor_plan.png" alt="Floor Plan Level 2" fill className="object-contain scale-[0.85] origin-[30%_50%] opacity-80" />
                        </div>
                    </div>
                </div>
            </div> */}

            {/* Price Estimate */}
            <div className="flex flex-col gap-4 border-t border-gray-100 pt-8">
                <h3 className="text-lg font-semibold">Price estimate</h3>
                <div className="h-48 w-full mt-4" style={{ minWidth: 0 }}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
                            <defs>
                                <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#000" stopOpacity={0.1} />
                                    <stop offset="95%" stopColor="#000" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <Tooltip
                                contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                                formatter={(value) => [`Rp. ${Number(value)?.toLocaleString('id-ID')}`, 'Est. Price']}
                                labelStyle={{ color: '#666' }}
                            />
                            <XAxis dataKey="year" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#888' }} dy={10} />
                            <Area type="monotone" dataKey="price" stroke="#000" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </div>

            {/* Bottom padding for mobile nav bar */}
            <div className="h-16 md:h-4" />
        </div>
    );
};

export function RightPanel() {
    const { selectedProperty, viewMode, isSheetOpen, setIsSheetOpen } = usePropertyStore();

    return (
        <>
            {/* Desktop: fixed-width right panel */}
            <aside className="hidden lg:flex flex-col w-[480px] h-full bg-white overflow-y-auto shrink-0 z-40 shadow-[-10px_0_30px_rgba(0,0,0,0.03)] border-l border-gray-100 custom-scrollbar">
                {selectedProperty ? <PanelContent /> : null}
            </aside>

            {/* Mobile: slide-up bottom sheet — hidden when in image view so photo isn't blocked */}
            <AnimatePresence>
                {selectedProperty && isSheetOpen && viewMode !== 'image' && (
                    <>
                        {/* Backdrop */}
                        <motion.div
                            key="backdrop"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="lg:hidden fixed inset-0 bg-black/30 z-40"
                            onClick={() => setIsSheetOpen(false)}
                        />
                        {/* Bottom sheet */}
                        <motion.div
                            key="bottom-sheet"
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                            className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white rounded-t-3xl max-h-[80vh] overflow-y-auto shadow-2xl"
                        >
                            {/* Drag handle */}
                            <div className="flex justify-center pt-3 pb-1">
                                <div className="w-10 h-1 bg-gray-300 rounded-full" />
                            </div>
                            <PanelContent />
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </>
    );
}
