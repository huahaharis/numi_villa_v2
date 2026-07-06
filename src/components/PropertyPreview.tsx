'use client';

import { usePropertyStore } from '../store/usePropertyStore';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';

export function PropertyPreview() {
    const { selectedProperty } = usePropertyStore();

    return (
        <AnimatePresence>
            {selectedProperty && (
                // On desktop: floating card bottom-left; on mobile: hidden (bottom sheet takes over)
                <motion.div
                    initial={{ x: -40, opacity: 0 }}
                    animate={{ x: 0, opacity: 1 }}
                    exit={{ x: -20, opacity: 0 }}
                    transition={{ type: "spring", stiffness: 300, damping: 25 }}
                    className="hidden md:block absolute bottom-10 left-10 pointer-events-none"
                >
                    <div className="bg-black text-white p-2 rounded-2xl flex gap-4 pr-10 shadow-2xl pointer-events-auto cursor-pointer border border-[#222]">
                        <div className="w-32 h-28 rounded-xl overflow-hidden relative shrink-0">
                            <Image
                                src={selectedProperty.image}
                                alt={selectedProperty.title}
                                fill
                                className="object-cover"
                            />
                        </div>
                        <div className="flex flex-col justify-center py-1">
                            <h3 className="font-semibold text-lg leading-tight mb-3">{selectedProperty.title}</h3>
                            <div className="flex gap-6 mt-auto">
                                <div className="flex flex-col">
                                    <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Luas</span>
                                    <span className="font-medium">{selectedProperty.sqft?.toLocaleString()}</span>
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] text-gray-400 font-medium uppercase tracking-wider mb-0.5">Kamar</span>
                                    <span className="font-medium">{selectedProperty.beds}</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
