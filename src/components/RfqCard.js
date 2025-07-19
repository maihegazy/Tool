'use client';
import React from 'react';
import { Edit3, Calculator, Trash2, Users, Clock, FileText, AlertTriangle, CheckCircle, TrendingUp, MapPin } from 'lucide-react';

const RfqCard = ({ rfq, auth, utils, onEdit, onDelete, onAnalysis, engineerRates }) => {
    // Add these debug logs
  console.log('Auth permissions:', {
    hasEditRfqs: auth.hasPermission('edit_rfqs'),
    hasViewBudgets: auth.hasPermission('view_budgets'),
    userRole: auth.currentUser?.role  });
  console.log('Handler types:', {
    onEdit: typeof onEdit,
    onDelete: typeof onDelete,
    onAnalysis: typeof onAnalysis
  });

  // Enhanced calculations
  const totalHours = utils.calculateTotalHours(rfq);
  const totalCost = utils.calculateRfqCost(rfq, engineerRates);
  const uniquePersons = utils.getUniquePersons(rfq);
  
  // Check for potential issues
  const hasOverlaps = uniquePersons.some(person => 
    utils.hasOverlappingAllocations(utils.getPersonAllocations(rfq, person))
  );
  
  const hasUnnamedAllocations = rfq.allocations.some(a => !a.name.trim());
  const hasIncompleteDates = rfq.allocations.some(a => !a.startDate || !a.endDate);
  
  // Calculate progress indicators
  const completionRate = rfq.allocations.length > 0 ? 
    (rfq.allocations.filter(a => a.name.trim() && a.startDate && a.endDate).length / rfq.allocations.length) * 100 : 0;
  
  // Location breakdown
  const locationBreakdown = {};
  rfq.allocations.forEach(allocation => {
    if (!locationBreakdown[allocation.location]) {
      locationBreakdown[allocation.location] = 0;
    }
    locationBreakdown[allocation.location] += 1;
  });
  
  // Get status color and message
  const getStatusInfo = () => {
    if (hasOverlaps || hasIncompleteDates) {
      return { color: 'text-red-600', bg: 'bg-red-50', message: 'Needs Attention' };
    }
    if (hasUnnamedAllocations) {
      return { color: 'text-yellow-600', bg: 'bg-yellow-50', message: 'In Progress' };
    }
    if (completionRate === 100) {
      return { color: 'text-green-600', bg: 'bg-green-50', message: 'Complete' };
    }
    return { color: 'text-blue-600', bg: 'bg-blue-50', message: 'Planning' };
  };
  
  const statusInfo = getStatusInfo();

  return (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-200 hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="flex justify-between items-start mb-4">
        <div className="flex-1">
          <div className="flex items-center mb-2">
            <h3 className="text-lg font-semibold text-gray-800 mr-3">{rfq.name}</h3>
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusInfo.bg} ${statusInfo.color}`}>
              {statusInfo.message}
            </span>
          </div>
          <p className="text-sm text-gray-600">Project Start Date: {rfq.createdDate}</p>
          {rfq.deadline && <p className="text-sm text-gray-600">Project End Date: {rfq.deadline}</p>}
          
          {/* Progress Bar */}
          <div className="mt-2">
            <div className="flex justify-between text-xs text-gray-500 mb-1">
              <span>Completion</span>
              <span>{Math.round(completionRate)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${
                  completionRate === 100 ? 'bg-green-500' : 
                  completionRate > 50 ? 'bg-blue-500' : 'bg-yellow-500'
                }`}
                style={{ width: `${completionRate}%` }}
              />
            </div>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex space-x-2">
          {auth.hasPermission('edit_rfqs') && (
            <button
              onClick={() => onEdit(rfq)}
              className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 flex items-center"
            >
              <Edit3 size={16} className="mr-1" />
              Edit
            </button>
          )}
          {auth.hasPermission('view_budgets') && (
            <button
              onClick={() => onAnalysis(rfq)}
              className="px-3 py-1 bg-emerald-500 text-white rounded text-sm hover:bg-emerald-600 flex items-center"
            >
              <Calculator size={16} className="mr-1" />
              Analysis
            </button>
          )}
          {(auth.hasPermission('edit_rfqs') || auth.currentUser.role === 'Admin') && (
            <button
              onClick={() => onDelete(rfq.id)}
              className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      </div>

      {/* Alerts */}
      {(hasOverlaps || hasIncompleteDates || hasUnnamedAllocations) && (
        <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
          <div className="flex items-center text-amber-800">
            <AlertTriangle size={16} className="mr-2" />
            <span className="text-sm font-medium">
              {hasOverlaps && 'Overlapping allocations detected. '}
              {hasIncompleteDates && 'Incomplete dates found. '}
              {hasUnnamedAllocations && 'Unnamed allocations need attention.'}
            </span>
          </div>
        </div>
      )}

      {/* Main Metrics */}
      <div className={auth.hasPermission('view_budgets') ? 'grid grid-cols-3 gap-4 text-sm mb-4' : 'grid grid-cols-2 gap-4 text-sm mb-4'}>
        <div className="bg-gray-50 p-3 rounded">
          <div className="flex items-center mb-1">
            <Users size={16} className="mr-1 text-gray-600" />
            <span className="font-medium">Resources</span>
          </div>
          <p className="text-gray-700">{rfq.allocations.length} engineers</p>
          <p className="text-xs text-gray-500">{uniquePersons.length} unique people</p>
        </div>

        <div className="bg-gray-50 p-3 rounded">
          <div className="flex items-center mb-1">
            <Clock size={16} className="mr-1 text-gray-600" />
            <span className="font-medium">Total Hours</span>
          </div>
          <p className="text-gray-700">{totalHours}h</p>
          <p className="text-xs text-gray-500">
            {uniquePersons.length > 0 ? Math.round(totalHours / uniquePersons.length) : 0}h avg/person
          </p>
        </div>

        {auth.hasPermission('view_budgets') && (
          <div className="bg-gray-50 p-3 rounded">
            <div className="flex items-center mb-1">
              <FileText size={16} className="mr-1 text-gray-600" />
              <span className="font-medium">Budget</span>
            </div>
            <p className="text-gray-700">€{totalCost.toLocaleString()}</p>
            <p className="text-xs text-gray-500">
              €{totalHours > 0 ? Math.round(totalCost / totalHours) : 0}/hour
            </p>
          </div>
        )}
      </div>

      {/* Location Distribution */}
      {Object.keys(locationBreakdown).length > 0 && (
        <div className="mb-4">
          <div className="flex items-center mb-2">
            <MapPin size={14} className="mr-1 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Location Distribution</span>
          </div>
          <div className="flex space-x-2">
            {Object.entries(locationBreakdown).map(([location, count]) => (
              <div key={location} className="flex items-center bg-blue-50 px-2 py-1 rounded text-xs">
                <span className="font-medium text-blue-700">{location}</span>
                <span className="text-blue-600 ml-1">({count})</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Quick Stats */}
      <div className="flex items-center justify-between pt-3 border-t border-gray-200">
        <div className="flex items-center space-x-4 text-xs text-gray-500">
          <div className="flex items-center">
            <div className={`w-2 h-2 rounded-full mr-1 ${statusInfo.color.replace('text-', 'bg-')}`} />
            <span>{statusInfo.message}</span>
          </div>
          {totalHours > 0 && (
            <div className="flex items-center">
              <TrendingUp size={12} className="mr-1" />
              <span>Active Project</span>
            </div>
          )}
        </div>
        
        <div className="text-xs text-gray-500">
          Updated: {new Date().toLocaleDateString()}
        </div>
      </div>
    </div>
  );
};

export default RfqCard;