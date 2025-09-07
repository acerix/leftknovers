import z from "zod";

export const FoodItemSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().nullable(),
  photo_url: z.string().nullable(),
  expiration_date: z.string(), // ISO date string
  category: z.string().nullable(),
  storage_location: z.string().nullable(),
  is_consumed: z.boolean(),
  is_expired: z.boolean(),
  notes: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateFoodItemSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  photo_url: z.string().optional(),
  expiration_date: z.string(),
  category: z.string().optional(),
  storage_location: z.string().optional(),
});

export const UpdateFoodItemSchema = z.object({
  name: z.string().optional(),
  description: z.string().optional(),
  photo_url: z.string().optional(),
  expiration_date: z.string().optional(),
  category: z.string().optional(),
  storage_location: z.string().optional(),
  is_consumed: z.boolean().optional(),
  is_expired: z.boolean().optional(),
  notes: z.string().optional(),
});

export const NotificationPreferenceSchema = z.object({
  id: z.number(),
  food_item_id: z.number(),
  user_id: z.string(),
  notification_interval: z.string(),
  custom_minutes: z.number().nullable(),
  is_enabled: z.boolean(),
  notification_email: z.string().nullable(),
  last_notification_sent: z.string().nullable(),
  created_at: z.string(),
  updated_at: z.string(),
});

export const CreateNotificationPreferenceSchema = z.object({
  food_item_id: z.number(),
  notification_interval: z.string(),
  custom_minutes: z.number().optional(),
  is_enabled: z.boolean().optional(),
  notification_email: z.string().optional(),
});

export const UpdateNotificationPreferenceSchema = z.object({
  notification_interval: z.string().optional(),
  custom_minutes: z.number().optional(),
  is_enabled: z.boolean().optional(),
  notification_email: z.string().optional(),
});

export type FoodItem = z.infer<typeof FoodItemSchema>;
export type CreateFoodItem = z.infer<typeof CreateFoodItemSchema>;
export type UpdateFoodItem = z.infer<typeof UpdateFoodItemSchema>;
export type NotificationPreference = z.infer<typeof NotificationPreferenceSchema>;
export type CreateNotificationPreference = z.infer<typeof CreateNotificationPreferenceSchema>;
export type UpdateNotificationPreference = z.infer<typeof UpdateNotificationPreferenceSchema>;
