
import { useState } from 'react';

const useAuth = () => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // User database - in a real app, this would be in a backend database
  const userDatabase = [
    // Admin users
    { 
      id: 1, 
      email: 'admin@company.com', 
      password: 'admin123', 
      role: 'Admin',
      name: 'System Administrator',
      department: 'IT',
      lastLogin: null,
      isActive: true,
      permissions: ['all']
    },
    { 
      id: 2, 
      email: 'super.admin@company.com', 
      password: 'superadmin123', 
      role: 'Admin',
      name: 'Super Admin',
      department: 'Management',
      lastLogin: null,
      isActive: true,
      permissions: ['all']
    },

    // Delivery Managers
    { 
      id: 3, 
      email: 'sarah.connor@company.com', 
      password: 'delivery123', 
      role: 'Delivery Manager',
      name: 'Sarah Connor',
      department: 'Delivery',
      lastLogin: null,
      isActive: true,
      permissions: ['view_rates', 'edit_rates', 'view_budgets', 'approve_rfqs', 'manage_teams']
    },
    { 
      id: 4, 
      email: 'michael.brown@company.com', 
      password: 'delivery456', 
      role: 'Delivery Manager',
      name: 'Michael Brown',
      department: 'Delivery',
      lastLogin: null,
      isActive: true,
      permissions: ['view_rates', 'edit_rates', 'view_budgets', 'approve_rfqs', 'manage_teams']
    },

    // Project Leaders
    { 
      id: 5, 
      email: 'john.smith@company.com', 
      password: 'project123', 
      role: 'Project Leader',
      name: 'John Smith',
      department: 'Engineering',
      lastLogin: null,
      isActive: true,
      permissions: ['create_rfqs', 'edit_rfqs', 'view_allocations', 'manage_resources']
    },
    { 
      id: 6, 
      email: 'alice.johnson@company.com', 
      password: 'project456', 
      role: 'Project Leader',
      name: 'Alice Johnson',
      department: 'Engineering',
      lastLogin: null,
      isActive: true,
      permissions: ['create_rfqs', 'edit_rfqs', 'view_allocations', 'manage_resources']
    },
    { 
      id: 7, 
      email: 'david.lee@company.com', 
      password: 'project789', 
      role: 'Project Leader',
      name: 'David Lee',
      department: 'Engineering',
      lastLogin: null,
      isActive: true,
      permissions: ['create_rfqs', 'edit_rfqs', 'view_allocations', 'manage_resources']
    },

    // Resource Managers
    { 
      id: 8, 
      email: 'emma.wilson@company.com', 
      password: 'resource123', 
      role: 'Resource Manager',
      name: 'Emma Wilson',
      department: 'HR',
      lastLogin: null,
      isActive: true,
      permissions: ['view_allocations', 'manage_resources', 'view_reports']
    },
    { 
      id: 9, 
      email: 'robert.davis@company.com', 
      password: 'resource456', 
      role: 'Resource Manager',
      name: 'Robert Davis',
      department: 'Operations',
      lastLogin: null,
      isActive: true,
      permissions: ['view_allocations', 'manage_resources', 'view_reports']
    }
  ];

  const authenticateUser = (email, password) => {
    const user = userDatabase.find(u => 
      u.email.toLowerCase() === email.toLowerCase() && 
      u.password === password &&
      u.isActive
    );
    
    if (user) {
      user.lastLogin = new Date().toISOString();
      return { ...user, password: undefined };
    }
    
    return null;
  };

  const hasPermission = (permission) => {
    if (!currentUser) return false;
    if (currentUser.role === 'Admin' ||currentUser.role === 'Delivery Manager'  ) return true;
    return currentUser.permissions?.includes(permission) || false;
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setLoginError('');

    setTimeout(() => {
      const user = authenticateUser(loginForm.email, loginForm.password);
      
      if (user) {
        setCurrentUser(user);
        setLoginForm({ email: '', password: '' });
      } else {
        setLoginError('Invalid email or password. Please check your credentials and try again.');
      }
      
      setIsLoading(false);
    }, 1000);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setLoginForm({ email: '', password: '' });
    setLoginError('');
  };

  return {
    currentUser,
    setCurrentUser,
    loginForm,
    setLoginForm,
    loginError,
    isLoading,
    userDatabase,
    hasPermission,
    handleLogin,
    handleLogout
  };
};

export default useAuth;