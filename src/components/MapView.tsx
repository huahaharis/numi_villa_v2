'use client';

import Map, { Marker } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { usePropertyStore } from '../store/usePropertyStore';
import { PropertyMarker } from './PropertyMarker';
import { mockProperties } from '../data/mockProperties';
import { PropertyPreview } from './PropertyPreview';

export function MapView() {
    const { setSelectedProperty, setHoveredProperty, selectedProperty } = usePropertyStore();

    return (
        <div className="w-full h-full relative font-sans">
            <Map
                initialViewState={{
                    longitude: 108.654776,
                    latitude: -7.687851,
                    zoom: 13,
                    pitch: 0,
                    bearing: 0
                }}
                style={{ width: '100%', height: '100%' }}
                mapStyle="https://basemaps.cartocdn.com/gl/positron-gl-style/style.json"
                interactiveLayerIds={['data']}
                cursor="grab"
            >
                {mockProperties.map(property => (
                    <Marker
                        key={property.id}
                        longitude={property.coordinates.lng}
                        latitude={property.coordinates.lat}
                        anchor="bottom"
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onClick={(e: any) => {
                            e.originalEvent.stopPropagation();
                            setSelectedProperty(property);
                        }}
                    >
                        <PropertyMarker
                            property={property}
                            isActive={selectedProperty?.id === property.id}
                            onMouseEnter={() => setHoveredProperty(property)}
                            onMouseLeave={() => setHoveredProperty(null)}
                        />
                    </Marker>
                ))}
            </Map>

            {/* Floating Property Preview */}
            <PropertyPreview />
        </div>
    );
}
