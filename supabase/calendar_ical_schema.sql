-- ============================================================
-- NUMI VILLA - CALENDAR BLOCKS & ICAL CHANNEL CONNECTIONS
-- ============================================================
-- Run this in Supabase SQL Editor to enable calendar availability
-- management and channel-selective iCal synchronization.
-- ============================================================

-- 1. CALENDAR BLOCKS (Custom blocked dates & channel-selective restrictions)
CREATE TABLE IF NOT EXISTS calendar_blocks (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    villa_id            UUID NOT NULL REFERENCES villas(id) ON DELETE CASCADE,
    start_date          DATE NOT NULL,
    end_date            DATE NOT NULL,
    reason              TEXT DEFAULT 'Blocked',
    target_channels     TEXT[] NOT NULL DEFAULT ARRAY['all'], -- e.g. ARRAY['all'] or ARRAY['airbnb', 'agoda']
    created_by          UUID REFERENCES auth.users(id),
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT valid_block_range CHECK (end_date > start_date)
);

-- Enable RLS
ALTER TABLE calendar_blocks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read calendar_blocks" ON calendar_blocks
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin calendar_blocks" ON calendar_blocks
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Allow public read for iCal export endpoint via anon key / service role
CREATE POLICY "Allow public read calendar_blocks for ical" ON calendar_blocks
    FOR SELECT TO anon USING (true);

-- Allow public read on villas & bookings for iCal feeds (idempotent)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'villas' AND policyname = 'Allow public read villas for ical'
    ) THEN
        CREATE POLICY "Allow public read villas for ical" ON villas FOR SELECT TO anon USING (true);
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM pg_policies WHERE tablename = 'bookings' AND policyname = 'Allow public read bookings for ical'
    ) THEN
        CREATE POLICY "Allow public read bookings for ical" ON bookings FOR SELECT TO anon USING (true);
    END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_calendar_blocks_villa ON calendar_blocks(villa_id);
CREATE INDEX IF NOT EXISTS idx_calendar_blocks_dates ON calendar_blocks(start_date, end_date);


-- 2. CHANNEL CONNECTIONS (OTA Inbound export links & sync state)
CREATE TABLE IF NOT EXISTS channel_connections (
    id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    villa_id            UUID NOT NULL REFERENCES villas(id) ON DELETE CASCADE,
    channel_name        TEXT NOT NULL, -- 'airbnb', 'agoda', 'booking_com', 'tiket_com'
    inbound_url         TEXT,          -- OTA's export iCal URL
    is_active           BOOLEAN DEFAULT true,
    last_synced_at      TIMESTAMPTZ,
    sync_status         TEXT DEFAULT 'idle', -- 'idle', 'syncing', 'success', 'error'
    sync_error          TEXT,
    created_at          TIMESTAMPTZ DEFAULT NOW(),
    updated_at          TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(villa_id, channel_name)
);

-- Enable RLS
ALTER TABLE channel_connections ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow read channel_connections" ON channel_connections
    FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow admin channel_connections" ON channel_connections
    FOR ALL TO authenticated USING (true) WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_channel_connections_villa ON channel_connections(villa_id);

-- Auto-update triggers
CREATE TRIGGER update_calendar_blocks_updated_at BEFORE UPDATE ON calendar_blocks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_channel_connections_updated_at BEFORE UPDATE ON channel_connections
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

