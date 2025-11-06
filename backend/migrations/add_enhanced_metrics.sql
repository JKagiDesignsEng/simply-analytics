-- Add new columns to page_views table for enhanced metrics
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS viewport_width INTEGER;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS viewport_height INTEGER;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS color_depth INTEGER;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS pixel_ratio DECIMAL(3,2);
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS language VARCHAR(10);
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS timezone VARCHAR(100);
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS timezone_offset INTEGER;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS connection_type VARCHAR(20);
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS connection_downlink DECIMAL(5,2);
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS connection_rtt INTEGER;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS load_time INTEGER;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS dom_content_loaded INTEGER;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS first_paint INTEGER;
ALTER TABLE page_views ADD COLUMN IF NOT EXISTS first_contentful_paint INTEGER;

-- Create indexes for new columns that might be queried
CREATE INDEX IF NOT EXISTS idx_page_views_language ON page_views(language);
CREATE INDEX IF NOT EXISTS idx_page_views_timezone ON page_views(timezone);
CREATE INDEX IF NOT EXISTS idx_page_views_connection_type ON page_views(connection_type);
