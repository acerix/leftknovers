
CREATE TABLE food_items (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT NOT NULL,
  description TEXT,
  photo_url TEXT,
  expiration_date DATE NOT NULL,
  category TEXT,
  storage_location TEXT,
  is_consumed BOOLEAN DEFAULT 0,
  is_expired BOOLEAN DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_food_items_expiration ON food_items(expiration_date);
CREATE INDEX idx_food_items_consumed ON food_items(is_consumed);
