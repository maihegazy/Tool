'use client';
import { useState, useCallback, useEffect, useMemo } from 'react';

const useNotifications = () => {
  const [notifications, setNotifications] = useState([]);
  const [settings, setSettings] = useState({
    sound: true,
    desktop: true,
    email: true,
    inApp: true
  });

  const notificationTemplates = useMemo(() => ({
    rfq_created: {
      title: 'New RFQ Created',
      message: 'RFQ "{rfqName}" has been created',
      type: 'info',
      priority: 'medium'
    },
    rfq_updated: {
      title: 'RFQ Updated',
      message: 'RFQ "{rfqName}" has been updated',
      type: 'info',
      priority: 'low'
    },
    rfq_approved: {
      title: 'RFQ Approved',
      message: 'RFQ "{rfqName}" has been approved',
      type: 'success',
      priority: 'high'
    },
    rfq_rejected: {
      title: 'RFQ Rejected',
      message: 'RFQ "{rfqName}" has been rejected',
      type: 'error',
      priority: 'high'
    },
    allocation_conflict: {
      title: 'Resource Conflict',
      message: 'Resource allocation conflict detected for {resourceName}',
      type: 'warning',
      priority: 'high'
    },
    deadline_approaching: {
      title: 'Deadline Approaching',
      message: 'RFQ "{rfqName}" deadline is in {days} days',
      type: 'warning',
      priority: 'medium'
    },
    user_assigned: {
      title: 'You were assigned',
      message: 'You have been assigned to RFQ "{rfqName}"',
      type: 'info',
      priority: 'medium'
    },
    comment_mention: {
      title: 'You were mentioned',
      message: '{userName} mentioned you in a comment',
      type: 'info',
      priority: 'medium'
    }
  }), []);

  const playNotificationSound = useCallback(() => {
    if (settings.sound && typeof window !== 'undefined') {
      try {
        const audio = new Audio('/sounds/notification.mp3');
        audio.volume = 0.3;
        audio.play().catch(console.error);
      } catch (error) {
        console.error('Error playing notification sound:', error);
      }
    }
  }, [settings.sound]);

  const showDesktopNotification = useCallback((title, message, options = {}) => {
    if (!settings.desktop || typeof window === 'undefined') return;

    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        new Notification(title, {
          body: message,
          icon: '/icon-192x192.png',
          badge: '/badge-72x72.png',
          ...options
        });
      } else if (Notification.permission !== 'denied') {
        Notification.requestPermission().then(permission => {
          if (permission === 'granted') {
            new Notification(title, {
              body: message,
              icon: '/icon-192x192.png',
              badge: '/badge-72x72.png',
              ...options
            });
          }
        });
      }
    }
  }, [settings.desktop]);

  const addNotification = useCallback((notification) => {
    const newNotification = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toISOString(),
      read: false,
      ...notification
    };

    setNotifications(prev => [newNotification, ...prev]);

    // Play sound and show desktop notification
    playNotificationSound();
    showDesktopNotification(newNotification.title, newNotification.message);

    return newNotification.id;
  }, [playNotificationSound, showDesktopNotification]);

  const markAsRead = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.map(notification =>
        notification.id === notificationId
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev =>
      prev.map(notification => ({ ...notification, read: true }))
    );
  }, []);

  const removeNotification = useCallback((notificationId) => {
    setNotifications(prev =>
      prev.filter(notification => notification.id !== notificationId)
    );
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
  }, []);

  const getUnreadCount = useCallback(() => {
    return notifications.filter(n => !n.read).length;
  }, [notifications]);

  const getNotificationsByType = useCallback((type) => {
    return notifications.filter(n => n.type === type);
  }, [notifications]);

  const getNotificationsByPriority = useCallback((priority) => {
    return notifications.filter(n => n.priority === priority);
  }, [notifications]);

  // Template-based notification creation
  const createFromTemplate = useCallback((templateKey, variables = {}) => {
    const template = notificationTemplates[templateKey];
    if (!template) {
      console.error(`Notification template "${templateKey}" not found`);
      return null;
    }

    let message = template.message;
    Object.entries(variables).forEach(([key, value]) => {
      message = message.replace(new RegExp(`{${key}}`, 'g'), value);
    });

    return addNotification({
      title: template.title,
      message,
      type: template.type,
      priority: template.priority,
      templateKey
    });
  }, [notificationTemplates, addNotification]);

  // Auto-cleanup old notifications
  useEffect(() => {
    const cleanup = () => {
      const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days
      const cutoff = new Date(Date.now() - maxAge);
      
      setNotifications(prev =>
        prev.filter(notification => 
          new Date(notification.timestamp) > cutoff
        )
      );
    };

    const interval = setInterval(cleanup, 24 * 60 * 60 * 1000); // Daily cleanup
    return () => clearInterval(interval);
  }, []);

  // Request notification permissions on first load
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && settings.desktop) {
      if (Notification.permission === 'default') {
        Notification.requestPermission();
      }
    }
  }, [settings.desktop]);

  // Bulk operations
  const bulkMarkAsRead = useCallback((notificationIds) => {
    setNotifications(prev =>
      prev.map(notification =>
        notificationIds.includes(notification.id)
          ? { ...notification, read: true }
          : notification
      )
    );
  }, []);

  const bulkRemove = useCallback((notificationIds) => {
    setNotifications(prev =>
      prev.filter(notification => !notificationIds.includes(notification.id))
    );
  }, []);

  // Update notification settings
  const updateSettings = useCallback((newSettings) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  }, []);

  // Get notifications with pagination
  const getPaginatedNotifications = useCallback((page = 1, limit = 10) => {
    const start = (page - 1) * limit;
    const end = start + limit;
    
    return {
      notifications: notifications.slice(start, end),
      total: notifications.length,
      page,
      limit,
      hasMore: end < notifications.length
    };
  }, [notifications]);

  // Search notifications
  const searchNotifications = useCallback((query) => {
    const lowercaseQuery = query.toLowerCase();
    return notifications.filter(notification =>
      notification.title.toLowerCase().includes(lowercaseQuery) ||
      notification.message.toLowerCase().includes(lowercaseQuery)
    );
  }, [notifications]);

  return {
    // State
    notifications,
    settings,
    unreadCount: getUnreadCount(),

    // Core functions
    addNotification,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,

    // Template functions
    createFromTemplate,
    notificationTemplates,

    // Filtering
    getNotificationsByType,
    getNotificationsByPriority,
    searchNotifications,

    // Bulk operations
    bulkMarkAsRead,
    bulkRemove,

    // Settings
    updateSettings,

    // Pagination
    getPaginatedNotifications,

    // Utilities
    playNotificationSound,
    showDesktopNotification
  };
};

export default useNotifications;