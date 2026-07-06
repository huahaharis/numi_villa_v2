import { create } from 'zustand';
import { Property, mockProperties } from '../data/mockProperties';

interface PropertyStore {
  selectedProperty: Property | null;
  hoveredProperty: Property | null;
  viewMode: 'map' | 'image';
  isSheetOpen: boolean;
  setSelectedProperty: (property: Property) => void;
  setHoveredProperty: (property: Property | null) => void;
  setViewMode: (mode: 'map' | 'image') => void;
  setIsSheetOpen: (open: boolean) => void;
}

export const usePropertyStore = create<PropertyStore>((set) => ({
  selectedProperty: mockProperties[0], // Always pre-selected — never null
  hoveredProperty: null,
  viewMode: 'map',
  isSheetOpen: false,
  setSelectedProperty: (property) => set({ selectedProperty: property, isSheetOpen: true }),
  setHoveredProperty: (property) => set({ hoveredProperty: property }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setIsSheetOpen: (open) => set({ isSheetOpen: open }),
}));
