'use client';

import { Map, Image as ImageIcon } from 'lucide-react';
import NextImage from 'next/image';
import { usePropertyStore } from '../store/usePropertyStore';
import { motion, AnimatePresence } from 'framer-motion';
import { MapView } from './MapView';

export function MainContent() {
    const { viewMode, setViewMode, selectedProperty } = usePropertyStore();

    return (
        <div className="flex-1 h-full relative overflow-hidden bg-[#f4f5f7]">
            {/* Toggle Button */}
            <div className="absolute top-8 left-1/2 -translate-x-1/2 z-50 bg-white/90 backdrop-blur-md shadow-sm border border-black/5 rounded-full p-1 flex">
                <button
                    onClick={() => setViewMode('image')}
                    className={`px-5 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-all ${viewMode === 'image' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-black'
                        }`}
                >
                    <ImageIcon className="w-4 h-4" />
                </button>
                <button
                    onClick={() => setViewMode('map')}
                    className={`px-5 py-2 rounded-full flex items-center gap-2 text-sm font-medium transition-all ${viewMode === 'map' ? 'bg-white shadow text-black' : 'text-gray-500 hover:text-black'
                        }`}
                >
                    <Map className="w-4 h-4" />
                </button>
            </div>

            {/* Main View Area */}
            <AnimatePresence mode="wait">
                {viewMode === 'map' ? (
                    <motion.div
                        key="map-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full relative"
                    >
                        <MapView />
                    </motion.div>
                ) : (
                    <motion.div
                        key="image-view"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="w-full h-full relative"
                    >
                        {/* Full-bleed image */}
                        {selectedProperty?.image && (
                            <NextImage
                                src={selectedProperty.image}
                                alt={selectedProperty.title}
                                fill
                                className="object-cover object-center"
                                priority
                            />
                        )}
                        {/* Bottom gradient + price */}
                        <div className="absolute inset-0 bg-linear-to-t from-black/70 via-black/10 to-transparent z-10" />
                        <div className="absolute bottom-20 left-6 md:bottom-12 md:left-12 text-white z-20">
                            <p className="text-sm opacity-70 font-medium mb-1 uppercase tracking-wider">Harga Sewa</p>
                            <p className="text-3xl md:text-5xl font-semibold tracking-tight">
                                Rp. {selectedProperty?.price.toLocaleString('id-ID')}
                                <span className="text-base font-normal opacity-60 ml-2">/ malam</span>
                            </p>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
