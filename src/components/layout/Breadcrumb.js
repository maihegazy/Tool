import React from 'react';
import { ChevronRight, Home } from 'lucide-react';

const Breadcrumb = ({ 
  items = [], 
  onNavigate, 
  separator = <ChevronRight size={14} className="text-gray-400" />,
  showHome = true 
}) => {
  const breadcrumbItems = showHome ? [{ label: 'Dashboard', value: 'dashboard', icon: Home }, ...items] : items;

  const handleClick = (item, index) => {
    // Don't navigate if it's the last item (current page)
    if (index === breadcrumbItems.length - 1) return;
    
    if (onNavigate && item.value) {
      onNavigate(item.value);
    }
  };

  if (breadcrumbItems.length === 0) return null;

  return (
    <nav className="flex items-center space-x-2 text-sm text-gray-600 mb-6">
      {breadcrumbItems.map((item, index) => {
        const isLast = index === breadcrumbItems.length - 1;
        const isClickable = !isLast && item.value && onNavigate;

        return (
          <div key={index} className="flex items-center">
            {/* Separator (except for first item) */}
            {index > 0 && (
              <span className="mx-2">
                {separator}
              </span>
            )}

            {/* Breadcrumb Item */}
            <div 
              className={`flex items-center ${
                isClickable 
                  ? 'text-blue-600 hover:text-blue-800 cursor-pointer hover:underline' 
                  : isLast 
                    ? 'text-gray-800 font-medium' 
                    : 'text-gray-500'
              }`}
              onClick={() => handleClick(item, index)}
            >
              {/* Icon */}
              {item.icon && (
                <item.icon 
                  size={14} 
                  className={`mr-1 ${
                    isClickable ? 'text-blue-600' : isLast ? 'text-gray-600' : 'text-gray-400'
                  }`} 
                />
              )}
              
              {/* Label */}
              <span className={`${isLast ? 'font-medium' : ''}`}>
                {item.label}
              </span>
            </div>
          </div>
        );
      })}
    </nav>
  );
};

// Helper function to generate breadcrumbs based on current view
export const generateBreadcrumbs = (currentView, additionalContext = {}) => {
  const breadcrumbMap = {
    'dashboard': [],
    'rfq-list': [
      { label: 'RFQs', value: 'rfq-list' }
    ],
    'rfq-create': [
      { label: 'RFQs', value: 'rfq-list' },
      { label: 'Create New', value: 'rfq-create' }
    ],
    'rfq-edit': [
      { label: 'RFQs', value: 'rfq-list' },
      { label: additionalContext.rfqName || 'Edit RFQ', value: 'rfq-edit' }
    ],
    'rfq-view': [
      { label: 'RFQs', value: 'rfq-list' },
      { label: additionalContext.rfqName || 'View RFQ', value: 'rfq-view' }
    ],
    'rfq-templates': [
      { label: 'RFQs', value: 'rfq-list' },
      { label: 'Templates', value: 'rfq-templates' }
    ],
    'resources': [
      { label: 'Resources', value: 'resources' }
    ],
    'timeline': [
      { label: 'Timeline', value: 'timeline' }
    ],
    'resource-analytics': [
      { label: 'Analytics', value: 'analytics' },
      { label: 'Resource Utilization', value: 'resource-analytics' }
    ],
    'budget-analytics': [
      { label: 'Analytics', value: 'analytics' },
      { label: 'Budget Analysis', value: 'budget-analytics' }
    ],
    'timeline-analytics': [
      { label: 'Analytics', value: 'analytics' },
      { label: 'Timeline Analysis', value: 'timeline-analytics' }
    ],
    'performance': [
      { label: 'Analytics', value: 'analytics' },
      { label: 'Performance', value: 'performance' }
    ],
    'cost-analysis': [
      { label: 'Cost Analysis', value: 'cost-analysis' }
    ],
    'admin-users': [
      { label: 'Administration', value: 'admin' },
      { label: 'User Management', value: 'admin-users' }
    ],
    'admin-rates': [
      { label: 'Administration', value: 'admin' },
      { label: 'Rate Settings', value: 'admin-rates' }
    ],
    'admin-settings': [
      { label: 'Administration', value: 'admin' },
      { label: 'System Settings', value: 'admin-settings' }
    ],
    'admin-audit': [
      { label: 'Administration', value: 'admin' },
      { label: 'Audit Log', value: 'admin-audit' }
    ]
  };

  return breadcrumbMap[currentView] || [];
};

// Breadcrumb with auto-generation based on current view
export const AutoBreadcrumb = ({ currentView, onNavigate, additionalContext = {} }) => {
  const items = generateBreadcrumbs(currentView, additionalContext);
  
  return (
    <Breadcrumb 
      items={items}
      onNavigate={onNavigate}
    />
  );
};

export default Breadcrumb;