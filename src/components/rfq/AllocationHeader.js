// =============================================================================
// COMPONENT: AllocationHeader.js
// =============================================================================

'use client';

import React from 'react';
import { Calendar, BarChart3 } from 'lucide-react';

const AllocationHeader = ({ 
  rfq, 
  showTimeline, 
  showYearlyView, 
  onToggleTimeline, 
  onToggleYearlyView, 
  onBack, 
  onUpdate 
}) => {
  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Resource Allocation - {rfq.name}</h2>
        <div className="flex space-x-2">
          <button
            onClick={onToggleTimeline}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            <Calendar size={16} className="inline mr-1" />
            {showTimeline ? 'Hide Timeline' : 'Show Timeline'}
          </button>
          <button
            onClick={onToggleYearlyView}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            <BarChart3 size={16} className="inline mr-1" />
            {showYearlyView ? 'Hide Yearly View' : 'Show Yearly View'}
          </button>
          <button
            onClick={onBack}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Project Start Date</label>
          <input
            type="date"
            value={rfq.createdDate}
            onChange={(e) => onUpdate(rfq.id, { createdDate: e.target.value })}
            className="border border-gray-300 rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Project End Date</label>
          <input
            type="date"
            value={rfq.deadline}
            onChange={(e) => onUpdate(rfq.id, { deadline: e.target.value })}
            className="border border-gray-300 rounded px-3 py-2 w-full"
          />
        </div>
      </div>
    </>
  );
};

export default AllocationHeader;