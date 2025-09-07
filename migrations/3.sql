
CREATE TABLE notification_preferences (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  food_item_id INTEGER NOT NULL,
  user_id TEXT NOT NULL,
  notification_interval TEXT NOT NULL DEFAULT '24h',
  custom_minutes INTEGER,
  is_enabled BOOLEAN DEFAULT 1,
  last_notification_sent TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notification_preferences_food_item ON notification_preferences(food_item_id);
CREATE INDEX idx_notification_preferences_user ON notification_preferences(user_id);
CREATE INDEX idx_notification_preferences_enabled ON notification_preferences(is_enabled);
