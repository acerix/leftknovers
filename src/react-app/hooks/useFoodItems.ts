import { useState, useEffect } from 'react';
import { FoodItem, CreateFoodItem, UpdateFoodItem, NotificationPreference } from '@/shared/types';

export function useFoodItems() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreference[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchItems = async () => {
    try {
      setLoading(true);
      const [itemsResponse, preferencesResponse] = await Promise.all([
        fetch('/api/food-items'),
        fetch('/api/notification-preferences')
      ]);
      
      if (!itemsResponse.ok) throw new Error('Failed to fetch items');
      if (!preferencesResponse.ok) throw new Error('Failed to fetch notification preferences');
      
      const itemsData = await itemsResponse.json();
      const preferencesData = await preferencesResponse.json();
      
      setItems(itemsData);
      setNotificationPreferences(preferencesData);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const addItem = async (item: CreateFoodItem) => {
    try {
      const response = await fetch('/api/food-items', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(item),
      });
      if (!response.ok) throw new Error('Failed to add item');
      const newItem = await response.json();
      setItems(prev => [...prev, newItem]);
      return newItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add item');
      throw err;
    }
  };

  const updateItem = async (id: number, updates: UpdateFoodItem) => {
    try {
      const response = await fetch(`/api/food-items/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!response.ok) throw new Error('Failed to update item');
      const updatedItem = await response.json();
      setItems(prev => prev.map(item => item.id === id ? updatedItem : item));
      return updatedItem;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update item');
      throw err;
    }
  };

  const deleteItem = async (id: number) => {
    try {
      const response = await fetch(`/api/food-items/${id}`, {
        method: 'DELETE',
      });
      if (!response.ok) throw new Error('Failed to delete item');
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to delete item');
      throw err;
    }
  };

  const markAsConsumed = async (id: number) => {
    try {
      await updateItem(id, { is_consumed: true, is_expired: false });
      // Remove the item from the display immediately since consumed items are filtered out
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      // If the update fails, don't remove from display
      throw error;
    }
  };

  const markAsExpired = async (id: number) => {
    try {
      await updateItem(id, { is_expired: true, is_consumed: false });
      // Remove the item from the display immediately since it's now expired
      setItems(prev => prev.filter(item => item.id !== id));
    } catch (error) {
      // If the update fails, don't remove from display
      throw error;
    }
  };

  const updateNotificationPreference = async (
    itemId: number, 
    settings: { notification_interval: string; custom_minutes?: number; is_enabled: boolean; notification_email?: string }
  ) => {
    try {
      const response = await fetch(`/api/notification-preferences/${itemId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(settings),
      });
      if (!response.ok) throw new Error('Failed to update notification preference');
      const updatedPreference = await response.json();
      
      setNotificationPreferences(prev => {
        const existing = prev.find(p => p.food_item_id === itemId);
        if (existing) {
          return prev.map(p => p.food_item_id === itemId ? updatedPreference : p);
        } else {
          return [...prev, updatedPreference];
        }
      });
      
      return updatedPreference;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update notification preference');
      throw err;
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  return {
    items,
    notificationPreferences,
    loading,
    error,
    addItem,
    updateItem,
    deleteItem,
    markAsConsumed,
    markAsExpired,
    updateNotificationPreference,
    refetch: fetchItems,
  };
}

export function useExpiringItems() {
  const [items, setItems] = useState<FoodItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpiringItems = async () => {
      try {
        const response = await fetch('/api/food-items/expiring');
        if (response.ok) {
          const data = await response.json();
          setItems(data);
        }
      } catch (err) {
        console.error('Failed to fetch expiring items:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchExpiringItems();
    const interval = setInterval(fetchExpiringItems, 60000); // Check every minute

    return () => clearInterval(interval);
  }, []);

  return { items, loading };
}
