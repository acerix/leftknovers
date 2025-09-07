import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { 
  CreateFoodItemSchema, 
  UpdateFoodItemSchema, 
  UpdateNotificationPreferenceSchema 
} from "@/shared/types";
import {
  exchangeCodeForSessionToken,
  getOAuthRedirectUrl,
  authMiddleware,
  deleteSession,
  MOCHA_SESSION_TOKEN_COOKIE_NAME,
} from "@getmocha/users-service/backend";
import { getCookie, setCookie } from "hono/cookie";
import { sendExpirationEmail } from "./email";
import { sendFriendInvitationEmail, generateInvitationToken } from "./friends";
import type { Env } from "./types";

const app = new Hono<{ Bindings: Env }>();

// Auth endpoints
app.get('/api/oauth/google/redirect_url', async (c) => {
  const redirectUrl = await getOAuthRedirectUrl('google', {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  return c.json({ redirectUrl }, 200);
});

app.post("/api/sessions", async (c) => {
  const body = await c.req.json();

  if (!body.code) {
    return c.json({ error: "No authorization code provided" }, 400);
  }

  const sessionToken = await exchangeCodeForSessionToken(body.code, {
    apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
    apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
  });

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, sessionToken, {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: true,
    maxAge: 60 * 24 * 60 * 60, // 60 days
  });

  return c.json({ success: true }, 200);
});

app.get("/api/users/me", authMiddleware, async (c) => {
  return c.json(c.get("user"));
});

app.get('/api/logout', async (c) => {
  const sessionToken = getCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME);

  if (typeof sessionToken === 'string') {
    await deleteSession(sessionToken, {
      apiUrl: c.env.MOCHA_USERS_SERVICE_API_URL,
      apiKey: c.env.MOCHA_USERS_SERVICE_API_KEY,
    });
  }

  setCookie(c, MOCHA_SESSION_TOKEN_COOKIE_NAME, '', {
    httpOnly: true,
    path: '/',
    sameSite: 'none',
    secure: true,
    maxAge: 0,
  });

  return c.json({ success: true }, 200);
});

// Protected food item endpoints (user-specific)
app.get("/api/food-items", authMiddleware, async (c) => {
  const db = c.env.DB;
  const user = c.get("user");
  
  if (!user) {
    return c.json({ error: "User not found" }, 401);
  }
  
  const items = await db.prepare(`
    SELECT * FROM food_items 
    WHERE is_consumed = 0 AND is_expired = 0 AND user_id = ?
    ORDER BY expiration_date ASC
  `).bind(user.id).all();
  
  return c.json(items.results);
});

app.get("/api/food-items/expiring", authMiddleware, async (c) => {
  const db = c.env.DB;
  const user = c.get("user");
  
  if (!user) {
    return c.json({ error: "User not found" }, 401);
  }
  
  const today = new Date().toISOString().split('T')[0];
  const threeDaysFromNow = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const items = await db.prepare(`
    SELECT * FROM food_items 
    WHERE is_consumed = 0 
    AND is_expired = 0
    AND user_id = ?
    AND expiration_date >= ? 
    AND expiration_date <= ?
    ORDER BY expiration_date ASC
  `).bind(user.id, today, threeDaysFromNow).all();
  
  return c.json(items.results);
});

app.post("/api/food-items", 
  authMiddleware,
  zValidator("json", CreateFoodItemSchema),
  async (c) => {
    const db = c.env.DB;
    const user = c.get("user");
    const data = c.req.valid("json");
    
    if (!user) {
      return c.json({ error: "User not found" }, 401);
    }
    
    const result = await db.prepare(`
      INSERT INTO food_items (name, description, photo_url, expiration_date, category, storage_location, user_id)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).bind(
      data.name,
      data.description || null,
      data.photo_url || null,
      data.expiration_date,
      data.category || null,
      data.storage_location || null,
      user.id
    ).run();
    
    const item = await db.prepare(`
      SELECT * FROM food_items WHERE id = ?
    `).bind(result.meta.last_row_id).first();
    
    // Create default notification preference (24h before expiration)
    await db.prepare(`
      INSERT INTO notification_preferences (food_item_id, user_id, notification_interval, is_enabled, notification_email)
      VALUES (?, ?, '24h', 1, ?)
    `).bind(result.meta.last_row_id, user.id, user.email).run();
    
    return c.json(item);
  }
);

app.put("/api/food-items/:id",
  authMiddleware,
  zValidator("json", UpdateFoodItemSchema),
  async (c) => {
    const db = c.env.DB;
    const user = c.get("user");
    const id = parseInt(c.req.param("id"));
    const data = c.req.valid("json");
    
    if (!user) {
      return c.json({ error: "User not found" }, 401);
    }
    
    // Verify the item belongs to the user
    const existingItem = await db.prepare(`
      SELECT * FROM food_items WHERE id = ? AND user_id = ?
    `).bind(id, user.id).first();
    
    if (!existingItem) {
      return c.json({ error: "Item not found" }, 404);
    }
    
    const updates = [];
    const values = [];
    
    Object.entries(data).forEach(([key, value]) => {
      if (value !== undefined) {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    });
    
    if (updates.length === 0) {
      return c.json({ error: "No updates provided" }, 400);
    }
    
    updates.push("updated_at = CURRENT_TIMESTAMP");
    values.push(id, user.id);
    
    await db.prepare(`
      UPDATE food_items SET ${updates.join(", ")} WHERE id = ? AND user_id = ?
    `).bind(...values).run();
    
    const item = await db.prepare(`
      SELECT * FROM food_items WHERE id = ?
    `).bind(id).first();
    
    return c.json(item);
  }
);

app.delete("/api/food-items/:id", authMiddleware, async (c) => {
  const db = c.env.DB;
  const user = c.get("user");
  const id = parseInt(c.req.param("id"));
  
  if (!user) {
    return c.json({ error: "User not found" }, 401);
  }
  
  await db.prepare(`DELETE FROM food_items WHERE id = ? AND user_id = ?`).bind(id, user.id).run();
  
  return c.json({ success: true });
});

// Notification preferences endpoints
app.get("/api/notification-preferences", authMiddleware, async (c) => {
  const db = c.env.DB;
  const user = c.get("user");
  
  if (!user) {
    return c.json({ error: "User not found" }, 401);
  }
  
  const preferences = await db.prepare(`
    SELECT * FROM notification_preferences WHERE user_id = ?
    ORDER BY created_at DESC
  `).bind(user.id).all();
  
  return c.json(preferences.results);
});

app.put("/api/notification-preferences/:itemId",
  authMiddleware,
  zValidator("json", UpdateNotificationPreferenceSchema),
  async (c) => {
    const db = c.env.DB;
    const user = c.get("user");
    const itemId = parseInt(c.req.param("itemId"));
    const data = c.req.valid("json");
    
    if (!user) {
      return c.json({ error: "User not found" }, 401);
    }
    
    // Check if preference exists
    const existing = await db.prepare(`
      SELECT * FROM notification_preferences 
      WHERE food_item_id = ? AND user_id = ?
    `).bind(itemId, user.id).first();
    
    if (existing) {
      // Update existing preference
      await db.prepare(`
        UPDATE notification_preferences 
        SET notification_interval = ?, custom_minutes = ?, is_enabled = ?, notification_email = ?, updated_at = CURRENT_TIMESTAMP
        WHERE food_item_id = ? AND user_id = ?
      `).bind(
        data.notification_interval || existing.notification_interval,
        data.custom_minutes || null,
        data.is_enabled ?? existing.is_enabled,
        data.notification_email || existing.notification_email,
        itemId,
        user.id
      ).run();
    } else {
      // Create new preference
      await db.prepare(`
        INSERT INTO notification_preferences (food_item_id, user_id, notification_interval, custom_minutes, is_enabled, notification_email)
        VALUES (?, ?, ?, ?, ?, ?)
      `).bind(
        itemId,
        user.id,
        data.notification_interval || '24h',
        data.custom_minutes || null,
        data.is_enabled ?? true,
        data.notification_email || user.email
      ).run();
    }
    
    const preference = await db.prepare(`
      SELECT * FROM notification_preferences 
      WHERE food_item_id = ? AND user_id = ?
    `).bind(itemId, user.id).first();
    
    return c.json(preference);
  }
);

// Friends endpoints
app.get("/api/friends", authMiddleware, async (c) => {
  const db = c.env.DB;
  const user = c.get("user");
  
  if (!user) {
    return c.json({ error: "User not found" }, 401);
  }
  
  // Get friends where user is either user_id_1 or user_id_2
  const friendships = await db.prepare(`
    SELECT 
      f.*,
      CASE 
        WHEN f.user_id_1 = ? THEN f.user_id_2 
        ELSE f.user_id_1 
      END as friend_user_id
    FROM friendships f
    WHERE f.user_id_1 = ? OR f.user_id_2 = ?
    ORDER BY f.created_at DESC
  `).bind(user.id, user.id, user.id).all();
  
  // For now, return simplified friend data (in a real app you'd fetch user details)
  const friends = (friendships.results as any[]).map(friendship => ({
    id: friendship.id,
    email: friendship.friend_user_id, // In a real app, you'd join with users table
    created_at: friendship.created_at
  }));
  
  return c.json(friends);
});

app.post("/api/friend-invitations", authMiddleware, async (c) => {
  const db = c.env.DB;
  const user = c.get("user");
  const { recipient_email } = await c.req.json();
  
  if (!user) {
    return c.json({ error: "User not found" }, 401);
  }
  
  if (!recipient_email || !recipient_email.includes('@')) {
    return c.json({ error: "Valid email address required" }, 400);
  }
  
  // Check if user is trying to invite themselves
  if (recipient_email.toLowerCase() === user.email.toLowerCase()) {
    return c.json({ error: "You cannot invite yourself" }, 400);
  }
  
  // Check if there's already a pending invitation to this email
  const existingInvitation = await db.prepare(`
    SELECT * FROM friend_invitations 
    WHERE sender_user_id = ? AND recipient_email = ? AND is_accepted = 0 AND is_expired = 0
  `).bind(user.id, recipient_email.toLowerCase()).first();
  
  if (existingInvitation) {
    return c.json({ error: "You already have a pending invitation to this email" }, 400);
  }
  
  // Generate invitation token and expiry (7 days)
  const token = generateInvitationToken();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
  
  // Create invitation record
  await db.prepare(`
    INSERT INTO friend_invitations (sender_user_id, recipient_email, invitation_token, expires_at)
    VALUES (?, ?, ?, ?)
  `).bind(user.id, recipient_email.toLowerCase(), token, expiresAt).run();
  
  // Send invitation email
  const senderName = user.google_user_data?.given_name || user.google_user_data?.name || user.email.split('@')[0];
  const emailSent = await sendFriendInvitationEmail(
    c.env.RESEND_API_KEY,
    recipient_email,
    senderName,
    user.email,
    token
  );
  
  if (!emailSent) {
    console.error('Failed to send invitation email, but invitation was created');
  }
  
  return c.json({ success: true, email_sent: emailSent });
});

app.get("/api/friend-invitations", authMiddleware, async (c) => {
  const db = c.env.DB;
  const user = c.get("user");
  
  if (!user) {
    return c.json({ error: "User not found" }, 401);
  }
  
  const invitations = await db.prepare(`
    SELECT * FROM friend_invitations 
    WHERE sender_user_id = ?
    ORDER BY created_at DESC
  `).bind(user.id).all();
  
  return c.json(invitations.results);
});

app.post("/api/friend-invitations/:token/accept", authMiddleware, async (c) => {
  const db = c.env.DB;
  const user = c.get("user");
  const token = c.req.param("token");
  
  if (!user) {
    return c.json({ error: "User not found" }, 401);
  }
  
  // Find the invitation
  const invitation = await db.prepare(`
    SELECT * FROM friend_invitations 
    WHERE invitation_token = ? AND is_accepted = 0 AND is_expired = 0
  `).bind(token).first();
  
  if (!invitation) {
    return c.json({ error: "Invitation not found or already used" }, 404);
  }
  
  const invitationData = invitation as any;
  
  // Check if invitation has expired
  if (new Date(invitationData.expires_at).getTime() < Date.now()) {
    // Mark as expired
    await db.prepare(`
      UPDATE friend_invitations SET is_expired = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(invitationData.id).run();
    return c.json({ error: "Invitation has expired" }, 410);
  }
  
  // Check if user is accepting their own invitation
  if (invitationData.sender_user_id === user.id) {
    return c.json({ error: "You cannot accept your own invitation" }, 400);
  }
  
  // Check if friendship already exists
  const existingFriendship = await db.prepare(`
    SELECT * FROM friendships 
    WHERE (user_id_1 = ? AND user_id_2 = ?) OR (user_id_1 = ? AND user_id_2 = ?)
  `).bind(user.id, invitationData.sender_user_id, invitationData.sender_user_id, user.id).first();
  
  if (existingFriendship) {
    // Mark invitation as accepted even if friendship exists
    await db.prepare(`
      UPDATE friend_invitations SET is_accepted = 1, updated_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `).bind(invitationData.id).run();
    return c.json({ success: true, sender_email: invitationData.recipient_email });
  }
  
  // Create friendship (ensure user_id_1 < user_id_2 for consistency)
  const userId1 = user.id < invitationData.sender_user_id ? user.id : invitationData.sender_user_id;
  const userId2 = user.id < invitationData.sender_user_id ? invitationData.sender_user_id : user.id;
  
  await db.prepare(`
    INSERT INTO friendships (user_id_1, user_id_2) VALUES (?, ?)
  `).bind(userId1, userId2).run();
  
  // Mark invitation as accepted
  await db.prepare(`
    UPDATE friend_invitations SET is_accepted = 1, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).bind(invitationData.id).run();
  
  return c.json({ success: true, sender_email: invitationData.recipient_email });
});

// Enhanced notification sending endpoint with better debugging
app.post("/api/notifications/send", authMiddleware, async (c) => {
  const db = c.env.DB;
  const user = c.get("user");
  
  if (!user) {
    return c.json({ error: "User not found" }, 401);
  }
  
  const now = new Date();
  console.log('Checking notifications for user:', user.id, 'at:', now.toISOString());
  
  // Get items with notification preferences that need notifications
  const itemsWithPreferences = await db.prepare(`
    SELECT 
      fi.*,
      np.notification_interval,
      np.custom_minutes,
      np.is_enabled,
      np.notification_email,
      np.last_notification_sent
    FROM food_items fi
    JOIN notification_preferences np ON fi.id = np.food_item_id
    WHERE fi.is_consumed = 0 
    AND fi.is_expired = 0
    AND fi.user_id = ?
    AND np.is_enabled = 1
    ORDER BY fi.expiration_date ASC
  `).bind(user.id).all();
  
  console.log('Found items with preferences:', itemsWithPreferences.results.length);
  
  const itemsToNotify = [];
  
  for (const item of itemsWithPreferences.results as any[]) {
    const expirationDate = new Date(item.expiration_date as string);
    const minutesUntilExpiration = Math.floor((expirationDate.getTime() - now.getTime()) / (1000 * 60));
    
    let notificationMinutes;
    
    // Calculate when to send notification based on interval
    if (item.notification_interval === 'custom' && item.custom_minutes) {
      notificationMinutes = item.custom_minutes as number;
    } else {
      const intervalMap: { [key: string]: number } = {
        '15m': 15,
        '6h': 360,
        '12h': 720,
        '24h': 1440,
        '2d': 2880,
        '3d': 4320,
      };
      notificationMinutes = intervalMap[item.notification_interval as string] || 1440;
    }
    
    console.log(`Item: ${item.name}, Expires: ${item.expiration_date}, Minutes until: ${minutesUntilExpiration}, Notification threshold: ${notificationMinutes}`);
    
    // Check if it's time to send notification (including past due items up to 1 day overdue)
    const shouldNotify = minutesUntilExpiration <= notificationMinutes && minutesUntilExpiration > -1440; // Allow 1 day past expiry
    
    // Check if we haven't sent a notification recently
    let canSend = true;
    if (item.last_notification_sent) {
      const lastSent = new Date(item.last_notification_sent as string);
      const timeSinceLastNotification = Math.floor((now.getTime() - lastSent.getTime()) / (1000 * 60));
      // For testing: send every 15 minutes, for production use 60 minutes
      const cooldownMinutes = 15; // Changed from 60 to 15 for testing
      canSend = timeSinceLastNotification >= cooldownMinutes;
      console.log(`Last notification sent: ${timeSinceLastNotification} minutes ago, cooldown: ${cooldownMinutes}, can send: ${canSend}`);
    } else {
      console.log('No previous notification sent for this item');
    }
    
    console.log(`Should notify: ${shouldNotify}, Can send: ${canSend}`);
    
    if (shouldNotify && canSend) {
      itemsToNotify.push(item);
      console.log(`Adding ${item.name} to notification list`);
      
      // Update last notification sent time
      await db.prepare(`
        UPDATE notification_preferences 
        SET last_notification_sent = CURRENT_TIMESTAMP
        WHERE food_item_id = ? AND user_id = ?
      `).bind(item.id, user.id).run();
    }
  }
  
  if (itemsToNotify.length > 0) {
    // Group items by notification email
    const emailGroups: { [email: string]: any[] } = {};
    
    for (const item of itemsToNotify) {
      const email = item.notification_email || user.email;
      if (!emailGroups[email]) {
        emailGroups[email] = [];
      }
      emailGroups[email].push(item);
    }
    
    // Send emails for each group
    const emailPromises = Object.entries(emailGroups).map(async ([email, items]) => {
      try {
        const userName = user.google_user_data?.given_name || user.google_user_data?.name || user.email.split('@')[0];
        const success = await sendExpirationEmail(
          c.env.RESEND_API_KEY,
          email,
          userName,
          items.map(item => ({
            name: item.name,
            expiration_date: item.expiration_date,
            category: item.category,
            storage_location: item.storage_location
          }))
        );
        
        if (success) {
          console.log(`Email sent successfully to ${email} for ${items.length} items`);
        } else {
          console.error(`Failed to send email to ${email}`);
        }
        
        return success;
      } catch (error) {
        console.error(`Error sending email to ${email}:`, error);
        return false;
      }
    });
    
    await Promise.all(emailPromises);
  }
  
  console.log(`Notification result: ${itemsToNotify.length} items notified`);
  
  return c.json({ 
    sent: itemsToNotify.length > 0,
    count: itemsToNotify.length,
    items: itemsToNotify.map(item => ({ name: item.name, expiration_date: item.expiration_date })),
    debug: {
      total_items_checked: itemsWithPreferences.results.length,
      notification_time: now.toISOString()
    }
  });
});

// Analytics endpoints
app.get("/api/analytics", authMiddleware, async (c) => {
  const db = c.env.DB;
  const user = c.get("user");
  const month = c.req.query('month');
  const category = c.req.query('category');
  
  if (!user) {
    return c.json({ error: "User not found" }, 401);
  }
  
  let whereClause = 'WHERE user_id = ?';
  const params = [user.id];
  
  if (month) {
    whereClause += ' AND DATE(created_at) >= ? AND DATE(created_at) < ?';
    const startDate = `${month}-01`;
    const endDate = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 1).toISOString().split('T')[0];
    params.push(startDate, endDate);
  }
  
  if (category) {
    whereClause += ' AND category = ?';
    params.push(category);
  }
  
  // Get overall stats
  const totalItems = await db.prepare(`
    SELECT COUNT(*) as count FROM food_items ${whereClause}
  `).bind(...params).first();
  
  const eatenItems = await db.prepare(`
    SELECT COUNT(*) as count FROM food_items ${whereClause} AND is_consumed = 1
  `).bind(...params).first();
  
  const expiredItems = await db.prepare(`
    SELECT COUNT(*) as count FROM food_items ${whereClause} AND is_expired = 1
  `).bind(...params).first();
  
  const total = (totalItems as any).count || 0;
  const eaten = (eatenItems as any).count || 0;
  const expired = (expiredItems as any).count || 0;
  const wastePercentage = total > 0 ? (expired / total) * 100 : 0;
  
  // Get monthly data (last 6 months)
  const monthlyData = [];
  for (let i = 5; i >= 0; i--) {
    const date = new Date();
    date.setMonth(date.getMonth() - i);
    const monthStr = date.toISOString().slice(0, 7);
    const monthName = date.toLocaleDateString('en-US', { month: 'short' });
    
    let monthWhereClause = 'WHERE user_id = ? AND DATE(created_at) >= ? AND DATE(created_at) < ?';
    const monthParams = [user.id, `${monthStr}-01`];
    const endDate = new Date(date.getFullYear(), date.getMonth() + 1, 1).toISOString().split('T')[0];
    monthParams.push(endDate);
    
    if (category) {
      monthWhereClause += ' AND category = ?';
      monthParams.push(category);
    }
    
    const monthEaten = await db.prepare(`
      SELECT COUNT(*) as count FROM food_items ${monthWhereClause} AND is_consumed = 1
    `).bind(...monthParams).first();
    
    const monthExpired = await db.prepare(`
      SELECT COUNT(*) as count FROM food_items ${monthWhereClause} AND is_expired = 1
    `).bind(...monthParams).first();
    
    monthlyData.push({
      month: monthName,
      eaten: (monthEaten as any).count || 0,
      expired: (monthExpired as any).count || 0
    });
  }
  
  // Get category data
  const categories = ['Leftovers', 'Dairy', 'Meat', 'Vegetables', 'Fruits', 'Bread/Bakery', 'Other'];
  const categoryData = [];
  
  for (const cat of categories) {
    let catWhereClause = 'WHERE user_id = ? AND category = ?';
    const catParams = [user.id, cat];
    
    if (month) {
      catWhereClause += ' AND DATE(created_at) >= ? AND DATE(created_at) < ?';
      const startDate = `${month}-01`;
      const endDate = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 1).toISOString().split('T')[0];
      catParams.push(startDate, endDate);
    }
    
    const catEaten = await db.prepare(`
      SELECT COUNT(*) as count FROM food_items ${catWhereClause} AND is_consumed = 1
    `).bind(...catParams).first();
    
    const catExpired = await db.prepare(`
      SELECT COUNT(*) as count FROM food_items ${catWhereClause} AND is_expired = 1
    `).bind(...catParams).first();
    
    const eatenCount = (catEaten as any).count || 0;
    const expiredCount = (catExpired as any).count || 0;
    
    if (eatenCount > 0 || expiredCount > 0) {
      categoryData.push({
        category: cat,
        eaten: eatenCount,
        expired: expiredCount
      });
    }
  }
  
  return c.json({
    totalItems: total,
    eatenBeforeExpiry: eaten,
    expired: expired,
    wastePercentage: wastePercentage,
    monthlyData: monthlyData,
    categoryData: categoryData
  });
});

app.get("/api/food-items/log", authMiddleware, async (c) => {
  const db = c.env.DB;
  const user = c.get("user");
  const month = c.req.query('month');
  const category = c.req.query('category');
  
  if (!user) {
    return c.json({ error: "User not found" }, 401);
  }
  
  let whereClause = 'WHERE user_id = ? AND (is_consumed = 1 OR is_expired = 1)';
  const params = [user.id];
  
  if (month) {
    whereClause += ' AND DATE(created_at) >= ? AND DATE(created_at) < ?';
    const startDate = `${month}-01`;
    const endDate = new Date(new Date(startDate).getFullYear(), new Date(startDate).getMonth() + 1, 1).toISOString().split('T')[0];
    params.push(startDate, endDate);
  }
  
  if (category) {
    whereClause += ' AND category = ?';
    params.push(category);
  }
  
  const items = await db.prepare(`
    SELECT * FROM food_items ${whereClause}
    ORDER BY updated_at DESC
    LIMIT 100
  `).bind(...params).all();
  
  return c.json(items.results);
});

// Data export endpoint
app.get("/api/export", authMiddleware, async (c) => {
  const db = c.env.DB;
  const user = c.get("user");
  const format = c.req.query('format') || 'json';
  
  if (!user) {
    return c.json({ error: "User not found" }, 401);
  }
  
  // Get all food items for the user
  const foodItems = await db.prepare(`
    SELECT * FROM food_items WHERE user_id = ?
    ORDER BY created_at DESC
  `).bind(user.id).all();
  
  // Get all notification preferences for the user
  const notificationPreferences = await db.prepare(`
    SELECT * FROM notification_preferences WHERE user_id = ?
    ORDER BY created_at DESC
  `).bind(user.id).all();
  
  const exportData = {
    user: {
      id: user.id,
      email: user.email,
      name: user.google_user_data?.name || null,
    },
    exported_at: new Date().toISOString(),
    food_items: foodItems.results,
    notification_preferences: notificationPreferences.results,
  };
  
  if (format === 'csv') {
    // Convert to CSV format
    const csvHeaders = [
      'id', 'name', 'description', 'photo_url', 'expiration_date', 
      'category', 'storage_location', 'is_consumed', 'is_expired', 
      'created_at', 'updated_at'
    ];
    
    const csvRows = [csvHeaders.join(',')];
    
    for (const item of foodItems.results as any[]) {
      const row = csvHeaders.map(header => {
        const value = item[header];
        // Escape quotes and wrap in quotes if contains comma
        if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value || '';
      });
      csvRows.push(row.join(','));
    }
    
    const csvContent = csvRows.join('\n');
    
    c.header('Content-Type', 'text/csv');
    c.header('Content-Disposition', `attachment; filename="leftknovers-export-${new Date().toISOString().split('T')[0]}.csv"`);
    return c.text(csvContent);
  }
  
  // Default JSON format
  c.header('Content-Type', 'application/json');
  c.header('Content-Disposition', `attachment; filename="leftknovers-export-${new Date().toISOString().split('T')[0]}.json"`);
  return c.json(exportData, 200);
});

// Legacy endpoint for backward compatibility
app.post("/api/notifications/expiring", authMiddleware, async (c) => {
  // Just redirect to the new endpoint logic
  const db = c.env.DB;
  const user = c.get("user");
  
  if (!user) {
    return c.json({ error: "User not found" }, 401);
  }
  
  const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  
  const expiringItems = await db.prepare(`
    SELECT * FROM food_items 
    WHERE is_consumed = 0 
    AND user_id = ?
    AND expiration_date <= ?
    ORDER BY expiration_date ASC
  `).bind(user.id, tomorrow).all();
  
  return c.json({ 
    sent: expiringItems.results.length > 0,
    count: expiringItems.results.length
  });
});

export default app;
