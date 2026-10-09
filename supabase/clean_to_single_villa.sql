-- ============================================================
-- NUMI VILLA PANGANDARAN - CLEANUP TO SINGLE PROPERTY
-- ============================================================
-- Run this in your Supabase SQL Editor if you have leftover test
-- or dummy villas (such as Villa Azure, Obsidian, Lembang, Bali, etc.)
-- This ensures only "Numi Villa Pangandaran" exists in your database.
-- ============================================================

BEGIN;

-- 1. Ensure Numi Villa Pangandaran exists
INSERT INTO villas (
    name, 
    slug, 
    description, 
    tagline, 
    location, 
    address, 
    bedrooms, 
    bathrooms, 
    max_guests, 
    property_type, 
    base_rate_per_night, 
    currency, 
    amenities, 
    features, 
    status
) 
SELECT 
    'Numi Villa Pangandaran', 
    'numi-villa-pangandaran', 
    'Bayangkan pagi hari yang sempurna — secangkir kopi hangat di tepi kolam renang privat, hembusan angin sepoi dari pantai Pangandaran, dan ketenangan yang jarang bisa kamu temukan di tempat lain.', 
    'Villa modern minimalis dengan kolam renang privat di Pangandaran, Jawa Barat', 
    'Pangandaran, West Java', 
    'Cluster Kaliandra, Pananjung, Kec. Pangandaran, Kab. Pangandaran, Jawa Barat 46396', 
    2, 
    2, 
    4, 
    'villa', 
    1000000, 
    'IDR', 
    ARRAY['Private Pool', 'Living Room', 'Full Kitchen', 'Air Conditioning', 'WiFi', 'Parking'], 
    ARRAY['Private Pool', 'Minimalist Design'], 
    'active'
WHERE NOT EXISTS (
    SELECT 1 FROM villas WHERE slug = 'numi-villa-pangandaran' OR name ILIKE '%Numi Villa%'
);

-- 2. Re-assign any orphan bookings or calendar blocks to Numi Villa Pangandaran before deletion
DO $$
DECLARE
    main_villa_id UUID;
BEGIN
    SELECT id INTO main_villa_id FROM villas WHERE slug = 'numi-villa-pangandaran' OR name ILIKE '%Numi Villa%' LIMIT 1;
    
    IF main_villa_id IS NOT NULL THEN
        -- Reassign any bookings pointing to other dummy villas to main villa
        UPDATE bookings SET villa_id = main_villa_id WHERE villa_id NOT IN (SELECT id FROM villas WHERE slug = 'numi-villa-pangandaran' OR name ILIKE '%Numi Villa%');
        
        -- Clean up channel connections and blocks for deleted dummy villas
        DELETE FROM channel_connections WHERE villa_id != main_villa_id;
        DELETE FROM calendar_blocks WHERE villa_id != main_villa_id;
        DELETE FROM seasonal_rates WHERE villa_id != main_villa_id;
        
        -- Remove other villas
        DELETE FROM villas WHERE id != main_villa_id;
    END IF;
END $$;

COMMIT;

-- Verify single property
SELECT id, name, slug, location, status FROM villas;

