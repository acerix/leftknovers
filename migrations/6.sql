
CREATE TABLE friend_invitations (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  sender_user_id TEXT NOT NULL,
  recipient_email TEXT NOT NULL,
  invitation_token TEXT NOT NULL,
  is_accepted BOOLEAN DEFAULT 0,
  is_expired BOOLEAN DEFAULT 0,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE friendships (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id_1 TEXT NOT NULL,
  user_id_2 TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_friend_invitations_token ON friend_invitations(invitation_token);
CREATE INDEX idx_friend_invitations_recipient ON friend_invitations(recipient_email);
CREATE INDEX idx_friendships_user1 ON friendships(user_id_1);
CREATE INDEX idx_friendships_user2 ON friendships(user_id_2);
