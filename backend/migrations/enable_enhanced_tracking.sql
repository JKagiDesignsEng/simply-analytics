-- This file updates the backend to use enhanced tracking fields
-- Run this AFTER running add_enhanced_metrics.sql

-- This is a marker file - the actual code change is in server.js
-- After running add_enhanced_metrics.sql, you need to update server.js to use the enhanced insert query

-- The enhanced insert includes these additional fields:
-- viewport_width, viewport_height, color_depth, pixel_ratio
-- language, timezone, timezone_offset
-- connection_type, connection_downlink, connection_rtt
-- load_time, dom_content_loaded, first_paint, first_contentful_paint
