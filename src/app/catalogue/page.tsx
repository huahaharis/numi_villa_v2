'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Auto-categorize photos based on filename keywords
function getCategory(filename: string): string {
    const name = filename.toLowerCase();
    if (name.includes('pool') || name.includes('kolam')) return 'Kolam Renang';
    if (name.includes('living') || name.includes('ruang')) return 'Ruang Keluarga';
    if (name.includes('bed') || name.includes('kamar') || name.includes('room')) return 'Kamar Tidur';
    if (name.includes('bath') || name.includes('toilet') || name.includes('shower')) return 'Kamar Mandi';
    if (name.includes('kitchen') || name.includes('dapur')) return 'Dapur';
    if (name.includes('garden') || name.includes('taman') || name.includes('outdoor')) return 'Taman';
    if (name.includes('view') || name.includes('pemandangan')) return 'Pemandangan';
    if (name.includes('interior') || name.includes('inside')) return 'Interior';
    return 'Eksterior';
}

const photoFiles = [
    'main-villa.png',
    'private-pool-1.jpg',
    'private-pool-2.jpg',
    'living-room-2.jpg',
    'living-room-3.jpg',
    'main-bedroom-1.jpg',
    'main-bedroom-2.jpg',
    'main-bedroom-3.jpg',
    'second-bedroom-2.jpg',
    'kitchen-3.jpg',
    'toilet-1.jpg',
    'toilet-2.jpg',
    'carpark-2.jpg',
];

const photos = photoFiles.map(file => ({
    src: `/properties/${file}`,
    caption: file.replace(/[-_]/g, ' ').replace(/\.(jpg|jpeg|png|webp)$/i, ''),
    category: getCategory(file),
}));

const categories = ['Semua', ...Array.from(new Set(photos.map(p => p.category)))];

export default function CataloguePage() {
    const [activeCategory, setActiveCategory] = useState('Semua');

    const filtered = activeCategory === 'Semua'
        ? photos
        : photos.filter(p => p.category === activeCategory);

    return (
        <main className="min-h-screen" style={{ background: 'var(--background)', color: 'var(--foreground)' }}>
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b" style={{ borderColor: 'var(--border)' }}>
                <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Link href="/" className="w-9 h-9 rounded-full border flex items-center justify-center hover:bg-gray-50 transition-colors" style={{ borderColor: 'var(--border)' }}>
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <div>
                            <h1 className="font-semibold text-lg leading-tight">Numi Villa</h1>
                            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>Pangandaran, Jawa Barat</p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Hero section */}
            <section className="max-w-7xl mx-auto px-6 pt-12 pb-8">
                <p className="text-sm font-medium tracking-widest uppercase mb-3" style={{ color: 'var(--accent)' }}>Katalog Foto</p>
                <h2 className="text-4xl md:text-5xl font-semibold tracking-tight mb-4">Temukan Keindahan<br />Numi Villa</h2>
                <p className="text-lg max-w-xl" style={{ color: 'var(--text-muted)' }}>
                    Villa modern minimalis dengan suasana tenang dan fasilitas premium di Pangandaran, Jawa Barat.
                </p>
            </section>

            {/* Category Filter */}
            <section className="max-w-7xl mx-auto px-6 pb-8">
                <div className="flex gap-2 flex-wrap">
                    {categories.map(cat => {
                        const isActive = activeCategory === cat;
                        return (
                            <button
                                key={cat}
                                onClick={() => setActiveCategory(cat)}
                                className="px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-200"
                                style={{
                                    borderColor: isActive ? 'var(--foreground)' : 'var(--border)',
                                    background: isActive ? 'var(--foreground)' : 'transparent',
                                    color: isActive ? '#fff' : 'var(--text-muted)',
                                }}
                            >
                                {cat}
                            </button>
                        );
                    })}
                </div>
            </section>

            {/* Photo Grid */}
            <section className="max-w-7xl mx-auto px-6 pb-20">
                {filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-32 text-center">
                        <p className="text-xl font-medium mb-2">Belum ada foto</p>
                        <p style={{ color: 'var(--text-muted)' }}>Tambahkan foto ke <code className="bg-gray-100 px-2 py-0.5 rounded">public/properties/</code></p>
                    </div>
                ) : (
                    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4 space-y-4">
                        {filtered.map((photo, i) => (
                            <div
                                key={i}
                                className="break-inside-avoid group relative rounded-2xl overflow-hidden bg-gray-100 cursor-pointer"
                            >
                                <div className="relative w-full">
                                    <Image
                                        src={photo.src}
                                        alt={photo.caption}
                                        width={800}
                                        height={600}
                                        className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-500"
                                    />
                                </div>
                                {/* Caption overlay */}
                                <div className="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-5">
                                    <span className="text-xs font-medium text-white/70 uppercase tracking-wider">{photo.category}</span>
                                    <p className="text-white font-medium mt-1">{photo.caption}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </section>

            {/* CTA */}
            <section className="border-t py-16 text-center" style={{ borderColor: 'var(--border)' }}>
                <h3 className="text-2xl font-semibold mb-3">Tertarik untuk menginap?</h3>
                <p className="mb-8" style={{ color: 'var(--text-muted)' }}>Hubungi kami lewat WhatsApp untuk cek ketersediaan.</p>
                <a
                    href={`https://wa.me/628212200288?text=${encodeURIComponent('Halo, saya tertarik untuk menyewa Numi Villa Pangandaran. Boleh saya tanya ketersediaan dan informasi lebih lanjut?')}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-white font-medium px-8 py-3.5 rounded-full text-base transition-colors inline-block"
                    style={{ background: 'var(--foreground)' }}
                >
                    Chat WhatsApp
                </a>
            </section>
        </main>
    );
}
