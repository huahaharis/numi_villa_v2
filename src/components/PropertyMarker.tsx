'use client';

import { Property } from '../data/mockProperties';

interface PropertyMarkerProps {
    property: Property;
    isActive: boolean;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
}

export function PropertyMarker({ property, isActive, onMouseEnter, onMouseLeave }: PropertyMarkerProps) {
    return (
        <div
            className={`
                px-3 py-1.5 rounded-full text-sm font-bold cursor-pointer transition-all duration-300 shadow-md
                ${isActive ? 'bg-black text-white scale-110 z-50' : 'bg-white text-black hover:bg-gray-100 hover:scale-105 z-10'}
            `}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            Rp. {property.price.toLocaleString('id-ID')}
        </div>
    );
}
