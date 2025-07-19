import { useState, useCallback, useMemo, useEffect } from 'react';

const usePermissions = (currentUser = null) => {
  const [customPermissions, setCustomPermissions] = useState({});
  const [permissionCache, setPermissionCache] = useState({});

  // Define role-based permissions
  const rolePermissions = useMemo(() => ({
    'Admin': [
      'all', // Admin has all permissions
      'create_rfqs',
      'edit_rfqs',
      'delete_rfqs',
      'view_rfqs',
      'approve_rfqs',
      'manage_users',
      'view_rates',
      'edit_rates',
      'view_budgets',
      'edit_budgets',
      'view_allocations',
      'manage_resources',
      'view_reports',
      'manage_teams',
      'system_settings',
      'audit_logs'
    ],
    'Delivery Manager': [
      'all', 
      'create_rfqs',
      'edit_rfqs',
      'delete_rfqs',
      'view_rfqs',
      'approve_rfqs',
      'manage_users',
      'view_rates',
      'edit_rates',
      'view_budgets',
      'edit_budgets',
      'view_allocations',
      'manage_resources',
      'view_reports',
      'manage_teams',
      'system_settings',
      'audit_logs'
    ],
    'Project Leader': [
      'create_rfqs',
      'edit_rfqs',
      'view_rfqs',
      'view_allocations',
      'manage_resources',
      'view_reports'
    ],
    'Resource Manager': [
      'view_rfqs',
      'view_allocations',
      'manage_resources',
      'view_reports'
    ],
    'Viewer': [
      'view_rfqs',
      'view_allocations',
      'view_reports'
    ]
  }), []);

  // All available permissions
  const allPermissions = useMemo(() => [
    'create_rfqs',
    'edit_rfqs',
    'delete_rfqs',
    'view_rfqs',
    'approve_rfqs',
    'manage_users',
    'view_rates',
    'edit_rates',
    'view_budgets',
    'edit_budgets',
    'view_allocations',
    'manage_resources',
    'view_reports',
    'manage_teams',
    'system_settings',
    'audit_logs'
  ], []);

  // Get permissions for a specific role
  const getRolePermissions = useMemo(() => {
    return (role) => {
      if (!role) return [];
      return rolePermissions[role] || [];
    };
  }, [rolePermissions]);

  // Get user's effective permissions (role + custom)
  const getUserPermissions = useCallback((user = currentUser) => {
    if (!user) return [];
    
    const cacheKey = `${user.id}_${user.role}_${JSON.stringify(user.customPermissions || {})}`;
    
    // Check cache first
    if (permissionCache[cacheKey]) {
      return permissionCache[cacheKey];
    }

    let permissions = new Set();

    // Add role-based permissions
    const rolePerms = getRolePermissions(user.role);
    rolePerms.forEach(perm => permissions.add(perm));

    // Add custom permissions (if any)
    if (user.customPermissions) {
      user.customPermissions.forEach(perm => permissions.add(perm));
    }

    // Add global custom permissions for this user
    if (customPermissions[user.id]) {
      customPermissions[user.id].forEach(perm => permissions.add(perm));
    }

    const finalPermissions = Array.from(permissions);
    
    // Cache the result
    setPermissionCache(prev => ({
      ...prev,
      [cacheKey]: finalPermissions
    }));

    return finalPermissions;
  }, [currentUser, rolePermissions, customPermissions, permissionCache, getRolePermissions]);

  // Check if user has a specific permission
  const hasPermission = useCallback((permission, user = currentUser) => {
    if (!user || !permission) return false;
    
    // Admin role has all permissions
    if (user.role === 'Admin') return true;

    const userPermissions = getUserPermissions(user);
    return userPermissions.includes(permission) || userPermissions.includes('all');
  }, [currentUser, getUserPermissions]);

  // Check if user has any of the specified permissions
  const hasAnyPermission = useCallback((permissions, user = currentUser) => {
    if (!user || !permissions || !Array.isArray(permissions)) return false;
    return permissions.some(permission => hasPermission(permission, user));
  }, [hasPermission, currentUser]);

  // Check if user has all of the specified permissions
  const hasAllPermissions = useCallback((permissions, user = currentUser) => {
    if (!user || !permissions || !Array.isArray(permissions)) return false;
    return permissions.every(permission => hasPermission(permission, user));
  }, [hasPermission, currentUser]);

  // Add custom permission to a user
  const addCustomPermission = useCallback((userId, permission) => {
    if (!allPermissions.includes(permission)) {
      console.warn(`Permission "${permission}" is not recognized`);
      return false;
    }

    setCustomPermissions(prev => ({
      ...prev,
      [userId]: [...(prev[userId] || []), permission].filter((p, i, arr) => arr.indexOf(p) === i)
    }));

    // Clear cache for this user
    setPermissionCache(prev => {
      const newCache = { ...prev };
      Object.keys(newCache).forEach(key => {
        if (key.startsWith(`${userId}_`)) {
          delete newCache[key];
        }
      });
      return newCache;
    });

    return true;
  }, [allPermissions]);

  // Remove custom permission from a user
  const removeCustomPermission = useCallback((userId, permission) => {
    setCustomPermissions(prev => ({
      ...prev,
      [userId]: (prev[userId] || []).filter(p => p !== permission)
    }));

    // Clear cache for this user
    setPermissionCache(prev => {
      const newCache = { ...prev };
      Object.keys(newCache).forEach(key => {
        if (key.startsWith(`${userId}_`)) {
          delete newCache[key];
        }
      });
      return newCache;
    });

    return true;
  }, []);

  // Set all custom permissions for a user
  const setUserCustomPermissions = useCallback((userId, permissions) => {
    const validPermissions = permissions.filter(p => allPermissions.includes(p));
    
    if (validPermissions.length !== permissions.length) {
      const invalidPerms = permissions.filter(p => !allPermissions.includes(p));
      console.warn(`Invalid permissions: ${invalidPerms.join(', ')}`);
    }

    setCustomPermissions(prev => ({
      ...prev,
      [userId]: validPermissions
    }));

    // Clear cache for this user
    setPermissionCache(prev => {
      const newCache = { ...prev };
      Object.keys(newCache).forEach(key => {
        if (key.startsWith(`${userId}_`)) {
          delete newCache[key];
        }
      });
      return newCache;
    });

    return true;
  }, [allPermissions]);

  // Clear all custom permissions for a user
  const clearUserCustomPermissions = useCallback((userId) => {
    setCustomPermissions(prev => {
      const newPerms = { ...prev };
      delete newPerms[userId];
      return newPerms;
    });

    // Clear cache for this user
    setPermissionCache(prev => {
      const newCache = { ...prev };
      Object.keys(newCache).forEach(key => {
        if (key.startsWith(`${userId}_`)) {
          delete newCache[key];
        }
      });
      return newCache;
    });

    return true;
  }, []);

  // Get permission groups for UI display
  const getPermissionGroups = useCallback(() => {
    return {
      'RFQ Management': [
        'create_rfqs',
        'edit_rfqs',
        'delete_rfqs',
        'view_rfqs',
        'approve_rfqs'
      ],
      'User Management': [
        'manage_users',
        'manage_teams'
      ],
      'Financial': [
        'view_rates',
        'edit_rates',
        'view_budgets',
        'edit_budgets'
      ],
      'Resource Management': [
        'view_allocations',
        'manage_resources'
      ],
      'Reporting': [
        'view_reports'
      ],
      'System Administration': [
        'system_settings',
        'audit_logs'
      ]
    };
  }, []);

  // Check if user can access a specific route/view
  const canAccessRoute = useCallback((route, requiredPermissions = [], user = currentUser) => {
    if (!requiredPermissions || requiredPermissions.length === 0) return true;
    return hasAnyPermission(requiredPermissions, user);
  }, [hasAnyPermission, currentUser]);

  // Get user's accessible routes
  const getAccessibleRoutes = useCallback((routes, user = currentUser) => {
    return routes.filter(route => 
      canAccessRoute(route.path, route.requiredPermissions, user)
    );
  }, [canAccessRoute, currentUser]);

  // Permission level checker (for hierarchical permissions)
  const hasPermissionLevel = useCallback((permission, level, user = currentUser) => {
    const levels = ['view', 'edit', 'create', 'delete', 'manage'];
    const permissionIndex = levels.indexOf(permission.split('_')[0]);
    const requiredIndex = levels.indexOf(level);
    
    return permissionIndex >= requiredIndex && hasPermission(permission, user);
  }, [hasPermission, currentUser]);

  // Clear permission cache when user changes
  useEffect(() => {
    setPermissionCache({});
  }, [currentUser?.id, currentUser?.role]);

  // Validate permissions on mount
  useEffect(() => {
    const validateCustomPermissions = () => {
      const validatedPermissions = {};
      
      Object.entries(customPermissions).forEach(([userId, permissions]) => {
        validatedPermissions[userId] = permissions.filter(p => allPermissions.includes(p));
      });
      
      setCustomPermissions(validatedPermissions);
    };

    validateCustomPermissions();
  }, [allPermissions, customPermissions]);

  return {
    // Core permission checking
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasPermissionLevel,

    // User permission management
    getUserPermissions,
    addCustomPermission,
    removeCustomPermission,
    setUserCustomPermissions,
    clearUserCustomPermissions,

    // Route/access control
    canAccessRoute,
    getAccessibleRoutes,

    // Utilities
    getRolePermissions,
    getPermissionGroups,
    
    // Data
    allPermissions,
    rolePermissions,
    customPermissions,

    // Current user helpers
    currentUserPermissions: getUserPermissions(currentUser),
    isAdmin: currentUser?.role === 'Admin',
    isDeliveryManager: currentUser?.role === 'Delivery Manager',
    isProjectLeader: currentUser?.role === 'Project Leader',
    isResourceManager: currentUser?.role === 'Resource Manager'
  };
};

export default usePermissions;