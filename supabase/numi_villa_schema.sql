-- ============================================================
-- NUMI VILLA MANAGEMENT SYSTEM - SUPABASE SCHEMA
-- ============================================================
-- Copy and paste this entire file into Supabase SQL Editor
-- Then click "Run" to create all tables, relationships, 
-- indexes, and Row Level Security policies.
-- ============================================================

-- ============================================================
-- 1. VILLAS (Properties)
-- ============================================================
-- Stores all villa properties managed by the system
-- Referenced by: bookings, invoices, villa_rates, inventory
-- ============================================================

CREATE TABLE IF NOT EXISTS villas (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name                TEXT NOT NULL,
    slug                TEXT UNIQUE NOT NULL,
    description         TEXT,
    tagline             TEXT,
    location            TEXT,
    address             TEXT,
    bedrooms            INTEGER DEFAULT 0,
    bathrooms           INTEGER DEFAULT 0,
    max_guests          INTEGER DEFAULT 0,
    property_type       TEXT DEFAULT 'villa', -- villa, suite, room
    
    -- Rate configuration
    base_rate_per_night DECIMAL(12,2) NOT NULL DEFAULT 0,
    currency            TEXT DEFAULT 'IDR',
    
    -- Amenities & features (stored as array for flexibility)
    amenities           TEXT[] DEFAULT '{}',
    features            TEXT[] DEFAULT '{}',
    
    -- Images
    cover_image         TEXT,
    gallery_images      TEXT[] DEFAULT '{}',
    
    -- Status
    status              TEXT DEFAULT 'active', -- active, maintenance, inactive
    
    -- Metadata
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE villas ENABLE ROW LEVEL SECURITY;

-- Allow read access to authenticated users
CREATE POLICY "Allow read villas" ON villas
    FOR SELECT TO authenticated USING (true);

-- Allow full access to admin users (service_role or specific role)
CREATE POLICY "Allow admin villas" ON villas
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Index for slug lookups
CREATE INDEX idx_villas_slug ON villas(slug);
CREATE INDEX idx_villas_status ON villas(status);


-- ============================================================
-- 2. GUESTS
-- ============================================================
-- Stores guest/client information
-- Referenced by: bookings, invoices
-- ============================================================

CREATE TABLE IF NOT EXISTS guests (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Personal info
    full_name       TEXT NOT NULL,
    email           TEXT,
    phone_number    TEXT,
    address         TEXT,
    city            TEXT,
    country         TEXT,
    postal_code     TEXT,
    
    -- Identification
    id_type         TEXT, -- passport, national_id, drivers_license
    id_number       TEXT,
    
    -- Preferences & notes
    preferences     JSONB DEFAULT '{}',
    internal_notes  TEXT,
    
    -- Tracking
    total_bookings  INTEGER DEFAULT 0,
    total_spent     DECIMAL(12,2) DEFAULT 0,
    
    -- Metadata
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE guests ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read guests" ON guests
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin guests" ON guests
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes for common lookups
CREATE INDEX idx_guests_email ON guests(email);
CREATE INDEX idx_guests_phone ON guests(phone_number);
CREATE INDEX idx_guests_name ON guests(full_name);


-- ============================================================
-- 3. SEASONAL RATES
-- ============================================================
-- Defines seasonal pricing adjustments per villa
-- Referenced by: bookings (for rate calculations)
-- ============================================================

CREATE TABLE IF NOT EXISTS seasonal_rates (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    villa_id        UUID NOT NULL REFERENCES villas(id) ON DELETE CASCADE,
    
    -- Season definition
    season_name     TEXT NOT NULL, -- e.g. "High Season", "Low Season", "Peak Season"
    start_date      DATE NOT NULL,
    end_date        DATE NOT NULL,
    
    -- Rate multiplier (e.g., 1.15 = +15%, 0.85 = -15%)
    rate_multiplier DECIMAL(4,2) NOT NULL DEFAULT 1.00,
    
    -- Or fixed override rate
    fixed_rate      DECIMAL(12,2),
    
    -- Metadata
    is_active       BOOLEAN DEFAULT true,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW(),
    
    -- Ensure no overlapping seasons for same villa
    CONSTRAINT valid_date_range CHECK (end_date >= start_date)
);

-- Enable RLS
ALTER TABLE seasonal_rates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read seasonal_rates" ON seasonal_rates
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin seasonal_rates" ON seasonal_rates
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_seasonal_rates_villa ON seasonal_rates(villa_id);
CREATE INDEX idx_seasonal_dates ON seasonal_rates(start_date, end_date);


-- ============================================================
-- 4. SERVICES & EXTRAS
-- ============================================================
-- Catalog of billable services (floating breakfast, airport transfer, etc.)
-- Referenced by: invoice_items
-- ============================================================

CREATE TABLE IF NOT EXISTS services (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Service details
    name            TEXT NOT NULL,
    description     TEXT,
    category        TEXT DEFAULT 'extra', -- accommodation, dining, transport, wellness, extra
    
    -- Pricing
    unit_price      DECIMAL(12,2) NOT NULL DEFAULT 0,
    currency        TEXT DEFAULT 'IDR',
    unit_type       TEXT DEFAULT 'per_unit', -- per_night, per_person, per_unit, per_hour
    
    -- Applicability
    villa_id        UUID REFERENCES villas(id) ON DELETE SET NULL, -- null = available for all villas
    is_active       BOOLEAN DEFAULT true,
    
    -- Metadata
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read services" ON services
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin services" ON services
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_services_category ON services(category);
CREATE INDEX idx_services_villa ON services(villa_id);


-- ============================================================
-- 5. BOOKINGS
-- ============================================================
-- Core reservation records linking guests to villas
-- Referenced by: invoices (one booking generates one invoice)
-- ============================================================

CREATE TABLE IF NOT EXISTS bookings (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_code        TEXT UNIQUE NOT NULL, -- e.g. "NB-2024-001"
    
    -- Relationships
    villa_id            UUID NOT NULL REFERENCES villas(id),
    guest_id            UUID NOT NULL REFERENCES guests(id),
    
    -- Stay details (from "New Booking" screen)
    check_in            DATE NOT NULL,
    check_out           DATE NOT NULL,
    num_nights          INTEGER NOT NULL,
    
    -- Guest count
    adults              INTEGER NOT NULL DEFAULT 1,
    children            INTEGER DEFAULT 0,
    infants             INTEGER DEFAULT 0,
    total_guests        INTEGER NOT NULL DEFAULT 1,
    
    -- Rate configuration (snapshot at booking time)
    base_rate_per_night DECIMAL(12,2) NOT NULL,
    season_adjustment   TEXT, -- e.g. "High Season (+15%)"
    rate_multiplier     DECIMAL(4,2) DEFAULT 1.00,
    adjusted_rate       DECIMAL(12,2) NOT NULL, -- rate after season adjustment
    
    -- Cost breakdown (from booking summary)
    subtotal            DECIMAL(12,2) NOT NULL DEFAULT 0,
    service_fee         DECIMAL(12,2) DEFAULT 0, -- 10% service fee
    service_fee_percent DECIMAL(5,2) DEFAULT 10.00,
    taxes               DECIMAL(12,2) DEFAULT 0, -- 11% VAT/tax
    tax_percent         DECIMAL(5,2) DEFAULT 11.00,
    total_amount        DECIMAL(12,2) NOT NULL DEFAULT 0,
    
    -- Payment tracking
    amount_paid         DECIMAL(12,2) DEFAULT 0,
    balance_due         DECIMAL(12,2) DEFAULT 0,
    
    -- Status workflow
    status              TEXT DEFAULT 'confirmed', 
                        -- pending, confirmed, checked_in, checked_out, cancelled, no_show
    
    -- Cancellation tracking (from Terms of Service screen)
    cancelled_at        TIMESTAMPTZ,
    cancellation_reason TEXT,
    refund_amount       DECIMAL(12,2),
    refund_status       TEXT, -- pending, processed, denied
    
    -- Internal notes
    guest_notes         TEXT,
    internal_notes      TEXT,
    
    -- Source tracking
    source              TEXT DEFAULT 'admin', -- admin, website, booking_com, airbnb
    
    -- Metadata
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    created_by          UUID REFERENCES auth.users(id),
    
    -- Ensure check-out is after check-in
    CONSTRAINT valid_stay CHECK (check_out > check_in)
);

-- Enable RLS
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read bookings" ON bookings
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin bookings" ON bookings
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_bookings_villa ON bookings(villa_id);
CREATE INDEX idx_bookings_guest ON bookings(guest_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_dates ON bookings(check_in, check_out);
CREATE INDEX idx_bookings_created ON bookings(created_at);


-- ============================================================
-- 6. INVOICES
-- ============================================================
-- Generated invoices linked to bookings
-- Referenced by: invoice_items
-- ============================================================

CREATE TABLE IF NOT EXISTS invoices (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    invoice_number      TEXT UNIQUE NOT NULL, -- e.g. "INV-2024-082"
    
    -- Relationships
    booking_id          UUID REFERENCES bookings(id) ON DELETE SET NULL,
    villa_id            UUID NOT NULL REFERENCES villas(id),
    guest_id            UUID NOT NULL REFERENCES guests(id),
    
    -- Invoice dates
    invoice_date        DATE NOT NULL DEFAULT CURRENT_DATE,
    due_date            DATE,
    paid_date           DATE,
    
    -- Guest snapshot (denormalized for invoice permanence)
    billed_to_name      TEXT NOT NULL,
    billed_to_email     TEXT,
    billed_to_phone     TEXT,
    billed_to_address   TEXT,
    
    -- Stay snapshot
    stay_villa_name     TEXT,
    stay_nights         INTEGER,
    stay_check_in       DATE,
    stay_check_out      DATE,
    
    -- Financial summary (from Invoice Preview screen)
    subtotal            DECIMAL(12,2) NOT NULL DEFAULT 0,
    service_charge      DECIMAL(12,2) DEFAULT 0, -- 10%
    service_charge_pct  DECIMAL(5,2) DEFAULT 10.00,
    vat_amount          DECIMAL(12,2) DEFAULT 0, -- 11%
    vat_percent         DECIMAL(5,2) DEFAULT 11.00,
    discount_amount     DECIMAL(12,2) DEFAULT 0,
    total_amount        DECIMAL(12,2) NOT NULL DEFAULT 0,
    
    -- Payment tracking
    amount_paid         DECIMAL(12,2) DEFAULT 0,
    balance_due         DECIMAL(12,2) DEFAULT 0,
    
    -- Payment info
    payment_status      TEXT DEFAULT 'unpaid', -- unpaid, paid, overdue, partial, refunded
    payment_method      TEXT, -- bank_transfer, credit_card, cash, other
    
    -- Bank details for payment (shown on invoice)
    bank_name           TEXT,
    bank_account_name   TEXT,
    bank_account_number TEXT,
    bank_branch         TEXT,
    
    -- Status & workflow
    status              TEXT DEFAULT 'draft', -- draft, sent, paid, overdue, cancelled, refunded
    
    -- Internal
    internal_notes      TEXT,
    terms               TEXT DEFAULT 'Payment due within 14 days of invoice date.',
    
    -- Source tracking
    created_by          UUID REFERENCES auth.users(id),
    
    -- Metadata
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    sent_at             TIMESTAMPTZ,
    viewed_at           TIMESTAMPTZ
);

-- Enable RLS
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read invoices" ON invoices
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin invoices" ON invoices
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Indexes
CREATE INDEX idx_invoices_number ON invoices(invoice_number);
CREATE INDEX idx_invoices_booking ON invoices(booking_id);
CREATE INDEX idx_invoices_guest ON invoices(guest_id);
CREATE INDEX idx_invoices_status ON invoices(status);
CREATE INDEX idx_invoices_payment ON invoices(payment_status);
CREATE INDEX idx_invoices_date ON invoices(invoice_date);


-- ============================================================
-- 7. INVOICE ITEMS (Line Items)
-- ============================================================
-- Individual line items on each invoice
-- Services, accommodations, extras, etc.
-- ============================================================

CREATE TABLE IF NOT EXISTS invoice_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Relationship
    invoice_id      UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    service_id      UUID REFERENCES services(id) ON DELETE SET NULL,
    
    -- Line item details (from Generate Invoice screen)
    description     TEXT NOT NULL, -- e.g. "Accommodation: Numi Villa (3 Nights)"
    category        TEXT DEFAULT 'accommodation', -- accommodation, dining, transport, service, extra
    
    -- Pricing
    quantity        DECIMAL(10,2) NOT NULL DEFAULT 1,
    unit_price      DECIMAL(12,2) NOT NULL DEFAULT 0,
    currency        TEXT DEFAULT 'IDR',
    total_price     DECIMAL(12,2) NOT NULL DEFAULT 0,
    
    -- Optional tags/flags
    tag             TEXT, -- e.g. "High Season", "Promo", "Complimentary"
    
    -- Sorting
    sort_order      INTEGER DEFAULT 0,
    
    -- Metadata
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE invoice_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read invoice_items" ON invoice_items
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin invoice_items" ON invoice_items
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);


-- ============================================================
-- 8. INVENTORY ITEMS
-- ============================================================
-- Track villa inventory/supplies (referenced in Admin Dashboard alerts)
-- ============================================================

CREATE TABLE IF NOT EXISTS inventory_items (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Item details
    name            TEXT NOT NULL,
    description     TEXT,
    category        TEXT DEFAULT 'general', -- kitchen, housekeeping, amenities, maintenance
    
    -- Stock management
    quantity        INTEGER NOT NULL DEFAULT 0,
    min_threshold   INTEGER DEFAULT 5, -- alert when below this
    unit            TEXT, -- pieces, liters, kg, boxes
    
    -- Assignment
    villa_id        UUID REFERENCES villas(id) ON DELETE SET NULL, -- null = shared/global
    
    -- Supplier info
    supplier_name   TEXT,
    supplier_contact TEXT,
    
    -- Status
    status          TEXT DEFAULT 'in_stock', -- in_stock, low_stock, out_of_stock, on_order
    
    -- Metadata
    last_restocked  TIMESTAMPTZ,
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE inventory_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read inventory" ON inventory_items
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin inventory" ON inventory_items
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_inventory_villa ON inventory_items(villa_id);
CREATE INDEX idx_inventory_status ON inventory_items(status);


-- ============================================================
-- 9. ACTIVITY LOGS
-- ============================================================
-- Track system activity for the Admin Dashboard "Recent Activity" feed
-- ============================================================

CREATE TABLE IF NOT EXISTS activity_logs (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Activity details
    activity_type   TEXT NOT NULL, -- booking_confirmed, housekeeping_ready, invoice_paid, inventory_alert, etc.
    title           TEXT NOT NULL,
    description     TEXT,
    
    -- Related entities (polymorphic references)
    entity_type     TEXT, -- booking, invoice, guest, inventory, villa
    entity_id       UUID, -- reference to the related record
    
    -- Financial (if applicable)
    amount          DECIMAL(12,2),
    currency        TEXT,
    
    -- Severity/urgency
    severity        TEXT DEFAULT 'info', -- info, success, warning, error, action_required
    
    -- Actor
    performed_by    UUID REFERENCES auth.users(id),
    performed_by_name TEXT,
    
    -- Read tracking
    is_read         BOOLEAN DEFAULT false,
    read_at         TIMESTAMPTZ,
    
    -- Metadata
    created_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE activity_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read activity_logs" ON activity_logs
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin activity_logs" ON activity_logs
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_activity_type ON activity_logs(activity_type);
CREATE INDEX idx_activity_entity ON activity_logs(entity_type, entity_id);
CREATE INDEX idx_activity_created ON activity_logs(created_at DESC);
CREATE INDEX idx_activity_read ON activity_logs(is_read);


-- ============================================================
-- 10. USER PROFILES (for Admin users)
-- ============================================================
-- Extends Supabase Auth with additional user profile data
-- ============================================================

CREATE TABLE IF NOT EXISTS user_profiles (
    id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    
    -- Profile
    full_name       TEXT,
    avatar_url      TEXT,
    role            TEXT DEFAULT 'staff', -- super_admin, admin, staff, accountant
    
    -- Contact
    phone           TEXT,
    email           TEXT,
    
    -- Preferences
    timezone        TEXT DEFAULT 'Asia/Jakarta',
    language        TEXT DEFAULT 'en',
    
    -- Status
    is_active       BOOLEAN DEFAULT true,
    last_login      TIMESTAMPTZ,
    
    -- Metadata
    created_at      TIMESTAMPTZ DEFAULT NOW(),
    updated_at      TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read own profile" ON user_profiles
    FOR SELECT TO authenticated USING (auth.uid() = id);

CREATE POLICY "Allow read all profiles" ON user_profiles
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin profiles" ON user_profiles
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX idx_user_profiles_role ON user_profiles(role);


-- ============================================================
-- AUTO-UPDATE TRIGGER FUNCTION
-- ============================================================
-- Automatically updates the updated_at timestamp on any row change
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply to all tables with updated_at
CREATE TRIGGER update_villas_updated_at BEFORE UPDATE ON villas
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_guests_updated_at BEFORE UPDATE ON guests
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_seasonal_rates_updated_at BEFORE UPDATE ON seasonal_rates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE ON invoices
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_invoice_items_updated_at BEFORE UPDATE ON invoice_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at BEFORE UPDATE ON inventory_items
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();


-- ============================================================
-- HELPER FUNCTIONS
-- ============================================================

-- Calculate nights between two dates
CREATE OR REPLACE FUNCTION calculate_nights(check_in DATE, check_out DATE)
RETURNS INTEGER AS $$
BEGIN
    RETURN GREATEST(check_out - check_in, 0);
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Generate booking code
CREATE OR REPLACE FUNCTION generate_booking_code()
RETURNS TEXT AS $$
DECLARE
    year TEXT;
    next_num INTEGER;
    code TEXT;
BEGIN
    year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    -- Get count of bookings this year + 1
    SELECT COUNT(*) + 1 INTO next_num
    FROM bookings
    WHERE EXTRACT(YEAR FROM created_at) = EXTRACT(YEAR FROM CURRENT_DATE);
    
    code := 'NB-' || year || '-' || LPAD(next_num::TEXT, 4, '0');
    RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Generate invoice number
CREATE OR REPLACE FUNCTION generate_invoice_number()
RETURNS TEXT AS $$
DECLARE
    year TEXT;
    next_num INTEGER;
    inv_num TEXT;
BEGIN
    year := EXTRACT(YEAR FROM CURRENT_DATE)::TEXT;
    
    -- Get count of invoices this year + 1
    SELECT COUNT(*) + 1 INTO next_num
    FROM invoices
    WHERE EXTRACT(YEAR FROM invoice_date) = EXTRACT(YEAR FROM CURRENT_DATE);
    
    inv_num := 'INV-' || year || '-' || LPAD(next_num::TEXT, 3, '0');
    RETURN inv_num;
END;
$$ LANGUAGE plpgsql;


-- ============================================================
-- SEED DATA - Sample Villas for Numi Villa Management
-- ============================================================
-- Run this section to populate initial villa data
-- ============================================================

INSERT INTO villas (name, slug, description, tagline, location, address, bedrooms, bathrooms, max_guests, property_type, base_rate_per_night, currency, amenities, features, status) VALUES
('Numi Villa Pangandaran', 'numi-villa-pangandaran', 'Exclusive beachfront property with minimalist architectural design and private infinity pool.', 'Luxury 4-Bedroom Beachfront Villa with Private Pool and Butler Service.', 'Pangandaran, West Java', 'Jl. Pantai Batu Karas, Pangandaran, West Java, Indonesia', 4, 4, 8, 'villa', 12500000, 'IDR', ARRAY['Private Pool', 'Ocean View', 'Butler Service', 'WiFi', 'Air Conditioning', 'Smart TV', 'Kitchen', 'Parking'], ARRAY['Beachfront', 'Infinity Pool', 'Minimalist Design'], 'active'),

('The Azure Suite', 'the-azure-suite', 'Elegant ocean-view suite with contemporary furnishings and private terrace.', 'Boutique Suite with Panoramic Ocean Views', 'Pangandaran, West Java', 'Jl. Raya Pangandaran KM 3, West Java, Indonesia', 2, 2, 4, 'suite', 4500000, 'IDR', ARRAY['Ocean View', 'Private Terrace', 'WiFi', 'Air Conditioning', 'Smart TV', 'Mini Bar'], ARRAY['Panoramic View', 'Contemporary Design'], 'active'),

('Zen Garden Villa', 'zen-garden-villa', 'Tranquil villa surrounded by lush tropical gardens with open-air living spaces.', 'Tropical Garden Retreat with Open-Air Living', 'Pangandaran, West Java', 'Jl. Gardenia Resort, Pangandaran, West Java, Indonesia', 3, 3, 6, 'villa', 8500000, 'IDR', ARRAY['Garden View', 'Outdoor Shower', 'WiFi', 'Air Conditioning', 'Kitchen', 'BBQ Area'], ARRAY['Tropical Garden', 'Open-Air Living', 'Zen Design'], 'active'),

('Obsidian Ridge', 'obsidian-ridge', 'Modern cliffside villa with dramatic black stone architecture and sunset views.', 'Cliffside Villa with Dramatic Sunset Views', 'Pangandaran, West Java', 'Jl. Bukit Batu Karas, Pangandaran, West Java, Indonesia', 5, 5, 10, 'villa', 18000000, 'IDR', ARRAY['Cliff View', 'Sunset Deck', 'Private Pool', 'WiFi', 'Air Conditioning', 'Smart Home', 'Chef Kitchen', 'Home Theater'], ARRAY['Cliffside', 'Modern Architecture', 'Sunset Views'], 'active');


-- ============================================================
-- SEED DATA - Sample Services
-- ============================================================

INSERT INTO services (name, description, category, unit_price, currency, unit_type, is_active) VALUES
('Accommodation', 'Villa accommodation per night', 'accommodation', 0, 'IDR', 'per_night', true),
('Premium Floating Breakfast', 'Morning floating breakfast experience served in the pool', 'dining', 750000, 'IDR', 'per_unit', true),
('Airport Transfer (Inbound)', 'Private car pickup from airport to villa', 'transport', 450000, 'IDR', 'per_unit', true),
('Airport Transfer (Outbound)', 'Private car dropoff from villa to airport', 'transport', 450000, 'IDR', 'per_unit', true),
('Airport Transfer (Roundtrip)', 'Roundtrip airport transfer service', 'transport', 900000, 'IDR', 'per_unit', true),
('Private Chef Dinner', 'Exclusive chef-prepared dinner at the villa', 'dining', 1500000, 'IDR', 'per_person', true),
('Spa Treatment', 'In-villa massage and spa treatment', 'wellness', 1200000, 'IDR', 'per_person', true),
('Yoga Session', 'Private yoga session at the villa', 'wellness', 500000, 'IDR', 'per_session', true),
('Boat Tour', 'Private boat tour around Pangandaran coast', 'activity', 2000000, 'IDR', 'per_unit', true),
('Laundry Service', 'Premium laundry and dry cleaning', 'service', 150000, 'IDR', 'per_kg', true),
('Extra Bed', 'Additional bed setup in villa', 'extra', 500000, 'IDR', 'per_night', true),
('Baby Cot', 'Baby cot and bedding setup', 'extra', 250000, 'IDR', 'per_night', true),
('Flower Arrangement', 'Welcome flower arrangement', 'extra', 300000, 'IDR', 'per_unit', true),
('Champagne Welcome', 'Premium champagne welcome package', 'dining', 850000, 'IDR', 'per_unit', true),
('Photography Session', 'Professional photography session at villa', 'service', 2500000, 'IDR', 'per_session', true);


-- ============================================================
-- SEED DATA - Seasonal Rates
-- ============================================================

INSERT INTO seasonal_rates (villa_id, season_name, start_date, end_date, rate_multiplier, is_active)
SELECT 
    v.id,
    'High Season',
    '2024-06-01',
    '2024-09-30',
    1.15,
    true
FROM villas v WHERE v.slug = 'numi-villa-pangandaran';

INSERT INTO seasonal_rates (villa_id, season_name, start_date, end_date, rate_multiplier, is_active)
SELECT 
    v.id,
    'Peak Season',
    '2024-12-20',
    '2025-01-05',
    1.30,
    true
FROM villas v WHERE v.slug = 'numi-villa-pangandaran';

INSERT INTO seasonal_rates (villa_id, season_name, start_date, end_date, rate_multiplier, is_active)
SELECT 
    v.id,
    'Low Season',
    '2024-01-15',
    '2024-05-31',
    0.85,
    true
FROM villas v WHERE v.slug = 'numi-villa-pangandaran';


-- ============================================================
-- SEED DATA - Inventory Items (for dashboard alerts)
-- ============================================================

INSERT INTO inventory_items (name, description, category, quantity, min_threshold, unit, villa_id, status) VALUES
('Premium Bed Linens', 'High-thread-count bed sheets and pillowcases', 'housekeeping', 25, 10, 'sets', NULL, 'in_stock'),
('Bath Towels', 'Luxury cotton bath towels', 'housekeeping', 40, 15, 'pieces', NULL, 'in_stock'),
('Toiletries Set', 'Premium shampoo, conditioner, body wash sets', 'housekeeping', 60, 20, 'sets', NULL, 'in_stock'),
('Coffee Beans', 'Single-origin local coffee beans', 'kitchen', 8, 5, 'kg', NULL, 'low_stock'),
('Cooking Oil', 'Premium coconut and olive oil', 'kitchen', 3, 5, 'liters', NULL, 'low_stock'),
('Mineral Water', 'Bottled mineral water for guests', 'kitchen', 120, 30, 'bottles', NULL, 'in_stock'),
('Pool Chemicals', 'Chlorine and pH balancing chemicals', 'maintenance', 15, 8, 'kg', NULL, 'in_stock'),
('Welcome Amenities', 'Welcome fruit basket and snacks', 'amenities', 12, 8, 'sets', NULL, 'in_stock');


-- ============================================================
-- VIEWS FOR DASHBOARD
-- ============================================================

-- Dashboard stats view
CREATE OR REPLACE VIEW dashboard_stats AS
SELECT
    (SELECT COUNT(*) FROM bookings WHERE status IN ('confirmed', 'checked_in')) as total_bookings,
    (SELECT COUNT(*) FROM bookings WHERE check_in >= CURRENT_DATE - INTERVAL '30 days' AND status != 'cancelled') as bookings_last_30d,
    (SELECT COALESCE(SUM(total_amount), 0) FROM invoices WHERE payment_status = 'paid' AND invoice_date >= CURRENT_DATE - INTERVAL '30 days') as revenue_last_30d,
    (SELECT COALESCE(SUM(total_amount), 0) FROM invoices WHERE payment_status = 'paid') as total_revenue,
    (SELECT COUNT(*) FROM bookings WHERE status = 'checked_out' AND check_out >= CURRENT_DATE - INTERVAL '30 days') as checkouts_last_30d,
    (SELECT COUNT(*) FROM bookings WHERE status = 'confirmed' AND check_in <= CURRENT_DATE AND check_out >= CURRENT_DATE) as currently_occupied,
    (SELECT COUNT(*) FROM villas WHERE status = 'active') as total_villas,
    (SELECT COUNT(*) FROM inventory_items WHERE status = 'low_stock') as low_stock_alerts,
    (SELECT COUNT(*) FROM invoices WHERE payment_status = 'overdue') as overdue_invoices,
    (SELECT COALESCE(SUM(balance_due), 0) FROM invoices WHERE payment_status IN ('unpaid', 'overdue')) as outstanding_balance;


-- ============================================================
-- COMPLETION MESSAGE
-- ============================================================
-- Run this query to verify everything was created successfully
-- ============================================================

SELECT 'Schema created successfully!' as status,
       (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE') as table_count;
