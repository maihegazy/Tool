import { useState, useEffect, useCallback, useMemo } from 'react';

const useLocalStorage = () => {
  const defaultPreferences = useMemo(() => ({
    theme: 'light',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    timeFormat: '24h',
    currency: 'EUR',
    notifications: {
      email: true,
      browser: true,
      sound: true
    },
    dashboard: {
      layout: 'grid',
      itemsPerPage: 10,
      showCompletedRfqs: false
    },
    // sidebar: {
    //   collapsed: false,
    //   position: 'left'
    // }
  }), []);

  const [preferences, setPreferences] = useState(defaultPreferences);
  const [recentActivity, setRecentActivity] = useState([]);
  const [favoriteRfqs, setFavoriteRfqs] = useState([]);
  const [quickActions, setQuickActions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load data from localStorage on mount
  useEffect(() => {
    const loadStoredData = () => {
      try {
        const storedPrefs = localStorage.getItem('rfq_preferences');
        const storedActivity = localStorage.getItem('rfq_recent_activity');
        const storedFavorites = localStorage.getItem('rfq_favorites');
        const storedQuickActions = localStorage.getItem('rfq_quick_actions');

        if (storedPrefs) {
          setPreferences(prev => ({ ...prev, ...JSON.parse(storedPrefs) }));
        }
        if (storedActivity) {
          setRecentActivity(JSON.parse(storedActivity));
        }
        if (storedFavorites) {
          setFavoriteRfqs(JSON.parse(storedFavorites));
        }
        if (storedQuickActions) {
          setQuickActions(JSON.parse(storedQuickActions));
        }
      } catch (error) {
        console.error('Error loading data from localStorage:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadStoredData();
  }, []);

  // Save preferences to localStorage
  const savePreferences = useCallback((newPreferences) => {
    try {
      const mergedPrefs = { ...defaultPreferences, ...newPreferences };
      localStorage.setItem('rfq_preferences', JSON.stringify(mergedPrefs));
      setPreferences(mergedPrefs);
      return true;
    } catch (error) {
      console.error('Error saving preferences:', error);
      return false;
    }
  }, [defaultPreferences]);

  // Update specific preference
  const updatePreference = useCallback((key, value) => {
    const newPreferences = {
      ...preferences,
      [key]: typeof value === 'object' && value !== null 
        ? { ...preferences[key], ...value }
        : value
    };
    return savePreferences(newPreferences);
  }, [preferences, savePreferences]);

  // Reset preferences to default
  const resetPreferences = useCallback(() => {
    try {
      localStorage.removeItem('rfq_preferences');
      setPreferences(defaultPreferences);
      return true;
    } catch (error) {
      console.error('Error resetting preferences:', error);
      return false;
    }
  }, [defaultPreferences]);

  // Recent activity management
  const addRecentActivity = useCallback((activity) => {
    const newActivity = {
      id: Date.now(),
      timestamp: new Date().toISOString(),
      ...activity
    };

    const updatedActivity = [newActivity, ...recentActivity.slice(0, 49)]; // Keep last 50
    
    try {
      localStorage.setItem('rfq_recent_activity', JSON.stringify(updatedActivity));
      setRecentActivity(updatedActivity);
      return true;
    } catch (error) {
      console.error('Error saving recent activity:', error);
      return false;
    }
  }, [recentActivity]);

  const clearRecentActivity = useCallback(() => {
    try {
      localStorage.removeItem('rfq_recent_activity');
      setRecentActivity([]);
      return true;
    } catch (error) {
      console.error('Error clearing recent activity:', error);
      return false;
    }
  }, []);

  // Favorites management
  const addToFavorites = useCallback((rfqId) => {
    if (!favoriteRfqs.includes(rfqId)) {
      const updatedFavorites = [...favoriteRfqs, rfqId];
      try {
        localStorage.setItem('rfq_favorites', JSON.stringify(updatedFavorites));
        setFavoriteRfqs(updatedFavorites);
        return true;
      } catch (error) {
        console.error('Error adding to favorites:', error);
        return false;
      }
    }
    return false;
  }, [favoriteRfqs]);

  const removeFromFavorites = useCallback((rfqId) => {
    const updatedFavorites = favoriteRfqs.filter(id => id !== rfqId);
    try {
      localStorage.setItem('rfq_favorites', JSON.stringify(updatedFavorites));
      setFavoriteRfqs(updatedFavorites);
      return true;
    } catch (error) {
      console.error('Error removing from favorites:', error);
      return false;
    }
  }, [favoriteRfqs]);

  const isFavorite = useCallback((rfqId) => {
    return favoriteRfqs.includes(rfqId);
  }, [favoriteRfqs]);

  // Quick actions management
  const addQuickAction = useCallback((action) => {
    const newAction = {
      id: Date.now(),
      ...action
    };

    const updatedActions = [...quickActions, newAction].slice(0, 10); // Keep max 10
    
    try {
      localStorage.setItem('rfq_quick_actions', JSON.stringify(updatedActions));
      setQuickActions(updatedActions);
      return true;
    } catch (error) {
      console.error('Error adding quick action:', error);
      return false;
    }
  }, [quickActions]);

  const removeQuickAction = useCallback((actionId) => {
    const updatedActions = quickActions.filter(action => action.id !== actionId);
    try {
      localStorage.setItem('rfq_quick_actions', JSON.stringify(updatedActions));
      setQuickActions(updatedActions);
      return true;
    } catch (error) {
      console.error('Error removing quick action:', error);
      return false;
    }
  }, [quickActions]);

  // Export/Import functionality
  const exportSettings = useCallback(() => {
    try {
      const data = {
        preferences,
        recentActivity,
        favoriteRfqs,
        quickActions,
        exportDate: new Date().toISOString(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `rfq-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      
      return true;
    } catch (error) {
      console.error('Error exporting settings:', error);
      return false;
    }
  }, [preferences, recentActivity, favoriteRfqs, quickActions]);

  const importSettings = useCallback((file) => {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const data = JSON.parse(e.target.result);
          
          if (data.preferences) {
            savePreferences(data.preferences);
          }
          if (data.recentActivity) {
            localStorage.setItem('rfq_recent_activity', JSON.stringify(data.recentActivity));
            setRecentActivity(data.recentActivity);
          }
          if (data.favoriteRfqs) {
            localStorage.setItem('rfq_favorites', JSON.stringify(data.favoriteRfqs));
            setFavoriteRfqs(data.favoriteRfqs);
          }
          if (data.quickActions) {
            localStorage.setItem('rfq_quick_actions', JSON.stringify(data.quickActions));
            setQuickActions(data.quickActions);
          }
          
          resolve(true);
        } catch (error) {
          console.error('Error importing settings:', error);
          resolve(false);
        }
      };
      reader.readAsText(file);
    });
  }, [savePreferences]);

  // Clear all data
  const clearAllData = useCallback(() => {
    try {
      localStorage.removeItem('rfq_preferences');
      localStorage.removeItem('rfq_recent_activity');
      localStorage.removeItem('rfq_favorites');
      localStorage.removeItem('rfq_quick_actions');
      
      setPreferences(defaultPreferences);
      setRecentActivity([]);
      setFavoriteRfqs([]);
      setQuickActions([]);
      
      return true;
    } catch (error) {
      console.error('Error clearing all data:', error);
      return false;
    }
  }, [defaultPreferences]);

  // Get storage usage info
  const getStorageInfo = useCallback(() => {
    try {
      let totalSize = 0;
      const items = {
        preferences: localStorage.getItem('rfq_preferences') || '',
        recentActivity: localStorage.getItem('rfq_recent_activity') || '',
        favorites: localStorage.getItem('rfq_favorites') || '',
        quickActions: localStorage.getItem('rfq_quick_actions') || ''
      };

      Object.values(items).forEach(item => {
        totalSize += new Blob([item]).size;
      });

      return {
        totalSize,
        itemSizes: Object.entries(items).reduce((acc, [key, value]) => {
          acc[key] = new Blob([value]).size;
          return acc;
        }, {}),
        maxSize: 5 * 1024 * 1024, // 5MB typical localStorage limit
        percentageUsed: (totalSize / (5 * 1024 * 1024)) * 100
      };
    } catch (error) {
      console.error('Error getting storage info:', error);
      return null;
    }
  }, []);

  return {
    // State
    preferences,
    recentActivity,
    favoriteRfqs,
    quickActions,
    isLoading,

    // Preferences
    savePreferences,
    updatePreference,
    resetPreferences,

    // Recent Activity
    addRecentActivity,
    clearRecentActivity,

    // Favorites
    addToFavorites,
    removeFromFavorites,
    isFavorite,

    // Quick Actions
    addQuickAction,
    removeQuickAction,

    // Import/Export
    exportSettings,
    importSettings,

    // Utilities
    clearAllData,
    getStorageInfo
  };
};

export default useLocalStorage;