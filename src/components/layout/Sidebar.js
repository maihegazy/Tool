'use client';
import React, { useState } from 'react';
import { 
  Home, 
  FileText, 
  Users, 
  Calculator, 
  BarChart3, 
  Settings, 
  User, 
  Calendar,
  Clock,
  TrendingUp,
  Shield,
  ChevronDown,
  ChevronRight,
  Bell,
  HelpCircle
} from 'lucide-react';

const Sidebar = ({ auth, currentView, onViewChange, isCollapsed, onToggleCollapse }) => {
  const [expandedSections, setExpandedSections] = useState({
    rfqs: true,
    analytics: false,
    admin: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const menuItems = [
    {
      id: 'dashboard',
      label: 'Dashboard',
      icon: Home,
      view: 'dashboard',
      permissions: []
    },
    {
      id: 'rfqs',
      label: 'RFQs',
      icon: FileText,
      expandable: true,
      permissions: ['view_rfqs'],
      subItems: [
        { id: 'rfq-list', label: 'All RFQs', view: 'rfq-list', permissions: ['view_rfqs'] },
        { id: 'rfq-create', label: 'Create RFQ', view: 'rfq-create', permissions: ['create_rfqs'] },
        { id: 'rfq-templates', label: 'Templates', view: 'rfq-templates', permissions: ['view_rfqs'] }
      ]
    },
    {
      id: 'resources',
      label: 'Resources',
      icon: Users,
      view: 'resources',
      permissions: ['view_allocations']
    },
    {
      id: 'timeline',
      label: 'Timeline',
      icon: Calendar,
      view: 'timeline',
      permissions: ['view_allocations']
    },
    {
      id: 'analytics',
      label: 'Analytics',
      icon: BarChart3,
      expandable: true,
      permissions: ['view_reports'],
      subItems: [
        { id: 'resource-analytics', label: 'Resource Utilization', view: 'resource-analytics', permissions: ['view_reports'] },
        { id: 'budget-analytics', label: 'Budget Analysis', view: 'budget-analytics', permissions: ['view_budgets'] },
        { id: 'timeline-analytics', label: 'Timeline Analysis', view: 'timeline-analytics', permissions: ['view_reports'] },
        { id: 'performance', label: 'Performance', view: 'performance', permissions: ['view_reports'] }
      ]
    },
    {
      id: 'cost-analysis',
      label: 'Cost Analysis',
      icon: Calculator,
      view: 'cost-analysis',
      permissions: ['view_budgets']
    }
  ];

  const adminItems = [
    {
      id: 'user-management',
      label: 'User Management',
      icon: User,
      view: 'admin-users',
      permissions: ['admin']
    },
    {
      id: 'rate-settings',
      label: 'Rate Settings',
      icon: TrendingUp,
      view: 'admin-rates',
      permissions: ['edit_rates']
    },
    {
      id: 'system-settings',
      label: 'System Settings',
      icon: Settings,
      view: 'admin-settings',
      permissions: ['admin']
    },
    {
      id: 'audit-log',
      label: 'Audit Log',
      icon: Shield,
      view: 'admin-audit',
      permissions: ['admin']
    }
  ];

  const hasPermission = (permissions) => {
    if (!permissions || permissions.length === 0) return true;
    if (auth.currentUser?.role === 'Admin') return true;
    return permissions.some(permission => auth.hasPermission(permission));
  };

  const renderMenuItem = (item, isSubItem = false) => {
    if (!hasPermission(item.permissions)) return null;

    const isActive = currentView === item.view;
    const hasSubItems = item.subItems && item.subItems.length > 0;
    const isExpanded = expandedSections[item.id];

    return (
      <div key={item.id}>
        <button
          onClick={() => {
            if (hasSubItems) {
              toggleSection(item.id);
            } else {
              onViewChange(item.view);
            }
          }}
          className={`w-full flex items-center px-4 py-3 text-left transition-colors duration-200 ${
            isActive 
              ? 'bg-blue-100 text-blue-700 border-r-2 border-blue-500' 
              : 'text-gray-700 hover:bg-gray-100'
          } ${isSubItem ? 'pl-12 py-2' : ''}`}
        >
          <item.icon 
            size={18} 
            className={`${isCollapsed ? 'mx-auto' : 'mr-3'} ${
              isActive ? 'text-blue-600' : 'text-gray-500'
            }`} 
          />
          {!isCollapsed && (
            <>
              <span className="flex-1 font-medium">{item.label}</span>
              {hasSubItems && (
                isExpanded ? 
                  <ChevronDown size={16} className="text-gray-400" /> : 
                  <ChevronRight size={16} className="text-gray-400" />
              )}
            </>
          )}
        </button>

        {/* Sub-items */}
        {hasSubItems && isExpanded && !isCollapsed && (
          <div className="bg-gray-50">
            {item.subItems.map(subItem => renderMenuItem(subItem, true))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className={`bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ${
      isCollapsed ? 'w-16' : 'w-64'
    } flex flex-col h-full`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-200">
        {!isCollapsed ? (
          <div className="flex items-center">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
              <FileText className="text-white" size={16} />
            </div>
            <div>
              <h1 className="font-bold text-gray-800">RFQ Planning</h1>
              <p className="text-xs text-gray-500">Resource Management</p>
            </div>
          </div>
        ) : (
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mx-auto">
            <FileText className="text-white" size={16} />
          </div>
        )}
      </div>

      {/* User Info */}
      {!isCollapsed && (
        <div className="p-4 border-b border-gray-200">
          <div className="flex items-center">
            <div className={`w-10 h-10 rounded-full text-white text-sm flex items-center justify-center ${
              auth.currentUser?.role === 'Admin' ? 'bg-red-500' :
              auth.currentUser?.role === 'Delivery Manager' ? 'bg-green-500' :
              auth.currentUser?.role === 'Project Leader' ? 'bg-blue-500' :
              'bg-purple-500'
            }`}>
              {auth.currentUser?.name?.split(' ').map(n => n[0]).join('') || 'U'}
            </div>
            <div className="ml-3 flex-1">
              <p className="text-sm font-medium text-gray-800">{auth.currentUser?.name}</p>
              <p className="text-xs text-gray-500">{auth.currentUser?.role}</p>
            </div>
            <Bell size={16} className="text-gray-400" />
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto">
        <div className="py-4">
          {/* Main Menu Items */}
          <div className="space-y-1">
            {menuItems.map(item => renderMenuItem(item))}
          </div>

          {/* Admin Section */}
          {(auth.currentUser?.role === 'Admin' || auth.hasPermission('edit_rates')) && (
            <>
              <div className="my-4 border-t border-gray-200"></div>
              {!isCollapsed && (
                <div className="px-4 mb-2">
                  <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Administration
                  </h3>
                </div>
              )}
              <div className="space-y-1">
                {adminItems.map(item => renderMenuItem(item))}
              </div>
            </>
          )}
        </div>
      </nav>

      {/* Footer */}
      <div className="border-t border-gray-200 p-4">
        {!isCollapsed ? (
          <div className="space-y-2">
            <button className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg">
              <HelpCircle size={16} className="mr-3" />
              Help & Support
            </button>
            <button 
              onClick={onToggleCollapse}
              className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:bg-gray-100 rounded-lg"
            >
              <ChevronRight size={16} className="mr-3" />
              Collapse Sidebar
            </button>
          </div>
        ) : (
          <button 
            onClick={onToggleCollapse}
            className="w-full flex items-center justify-center p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
          >
            <ChevronRight size={16} />
          </button>
        )}
      </div>
    </div>
  );
};

export default Sidebar;