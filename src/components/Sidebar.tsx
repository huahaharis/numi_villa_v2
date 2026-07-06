'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Grid3x3, Map } from 'lucide-react';

const navItems = [
    { icon: Map, label: 'Map', href: '/' },
    { icon: Grid3x3, label: 'Katalog', href: '/catalogue' },
];

export function Sidebar() {
    const pathname = usePathname();

    return (
        <>
            {/* Desktop sidebar */}
            <aside
                className="hidden md:flex w-24 lg:w-28 h-full text-white flex-col items-center py-8 justify-between shrink-0 z-50"
                style={{ background: 'var(--sidebar-bg)' }}
            >
                <div className="flex flex-col items-center gap-8 w-full">
                    {/* Logo */}
                    <Link href="/" className="flex flex-col items-center gap-0.5 mb-4 hover:opacity-80 transition-opacity text-center">
                        <span className="text-white text-xs font-bold tracking-widest uppercase leading-tight">Numi</span>
                        <span className="text-white/50 text-[9px] tracking-widest uppercase">Villa</span>
                    </Link>

                    {/* Nav items with labels */}
                    <nav className="flex flex-col gap-2 w-full px-3">
                        {navItems.map(({ icon: Icon, label, href }) => {
                            const isActive = pathname === href;
                            return (
                                <Link
                                    key={href}
                                    href={href}
                                    className={`flex flex-col items-center gap-1.5 py-3 rounded-xl transition-colors w-full ${isActive ? 'bg-white/20 text-white' : 'text-gray-400 hover:text-white hover:bg-white/10'
                                        }`}
                                >
                                    <Icon className="w-5 h-5" />
                                    <span className="text-[11px] font-medium">{label}</span>
                                </Link>
                            );
                        })}
                    </nav>
                </div>
            </aside>

            {/* Mobile bottom tab bar */}
            <nav
                className="md:hidden fixed bottom-0 left-0 right-0 z-100 text-white flex items-center justify-around px-2 py-2 border-t border-white/10"
                style={{ background: 'var(--sidebar-bg)' }}
            >
                {navItems.map(({ icon: Icon, label, href }) => {
                    const isActive = pathname === href;
                    return (
                        <Link key={href} href={href} className="flex flex-col items-center gap-1 p-2">
                            <Icon className={`w-5 h-5 ${isActive ? 'text-white' : 'text-gray-400'}`} />
                            <span className={`text-[10px] ${isActive ? 'text-white' : 'text-gray-400'}`}>{label}</span>
                        </Link>
                    );
                })}
            </nav>
        </>
    );
}
