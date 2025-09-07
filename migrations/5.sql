
ALTER TABLE food_items ADD COLUMN notes TEXT;
CREATE INDEX idx_food_items_status ON food_items(is_consumed, is_expired);
CREATE INDEX idx_food_items_created_at ON food_items(created_at);
