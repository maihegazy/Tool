'use client'

import React, { useState } from 'react';
import Sidebar from './layout/Sidebar';
import  AutoBreadcrumb  from './layout/Breadcrumb';

const AppWrapper = ({ children, auth, currentView, onViewChange }) => {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  return (
    <div className="flex h-screen bg-gray-100">
      {/* <Sidebar 
        auth={auth}
        currentView={currentView}
        onViewChange={onViewChange}
        isCollapsed={sidebarCollapsed}
        onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
      /> */}
      
      <div className="flex-1 flex flex-col overflow-hidden">
        <main className="flex-1 overflow-y-auto p-6">
          <AutoBreadcrumb 
            currentView={currentView}
            onNavigate={onViewChange}
            additionalContext={{ rfqName: 'Current RFQ Name' }}
          />
          {children}
        </main>
      </div>
    </div>
  );
};

export default AppWrapper;