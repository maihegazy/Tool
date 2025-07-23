'use client';
import React from 'react';
import { Settings, Calculator, LogOut } from 'lucide-react';

const AppHeader = ({ auth, utils, onShowRateSettings, onShowCostProfitAnalysis, selectedRfq, setSelectedRfq }) => {
  return (
    <div className="mb-8 flex justify-between items-center">
      <div>
        <h1 className="text-3xl font-bold text-gray-800 mb-2">RFQ Resource Planning</h1>
        <p className="text-gray-600">Plan and manage engineering resources for RFQ responses</p>
      </div>
      <div className="flex items-center space-x-4">
        {/* User Info */}
        <div className="flex items-center space-x-3 bg-white px-4 py-2 rounded-lg shadow-sm border">
          <div className={`w-10 h-10 rounded-full text-white text-sm flex items-center justify-center ${utils.getRoleColor(auth.currentUser.role)}`}>
            {auth.currentUser.name.split(' ').map(n => n[0]).join('')}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-800">{auth.currentUser.name}</div>
            <div className="text-xs text-gray-500">{utils.getRoleDisplayName(auth.currentUser.role)}</div>
          </div>
        </div>

        {/* Admin Controls */}
        {auth.hasAccess('user:manage') && (
          <button
            onClick={() => setSelectedRfq('admin')}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center"
          >
            <Settings size={16} className="mr-1" />
            Admin Panel
          </button>
        )}

        {/* Role-based Controls */}
        {auth.hasPermission('edit_rates') && (
          <button
            onClick={onShowRateSettings}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600 flex items-center"
          >
            <Settings size={16} className="mr-1" />
            Rate Settings
          </button>
        )}
        
        {auth.hasPermission('view_budgets') && selectedRfq && selectedRfq !== 'admin' && (
          <button
            onClick={onShowCostProfitAnalysis}
            className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600 flex items-center"
          >
            <Calculator size={16} className="mr-1" />
            Cost-Profit Analysis
          </button>
        )}

        <button
          onClick={auth.handleLogout}
          className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 flex items-center"
        >
          <LogOut size={16} className="mr-1" />
          Logout
        </button>
      </div>
    </div>
  );
};

export default AppHeader;