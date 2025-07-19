// =============================================================================
// NEW COMPONENT: ConflictPanel.js
// =============================================================================

'use client';

import React from 'react';
import { AlertTriangle, X, Calendar, User } from 'lucide-react';

const ConflictPanel = ({ conflicts, resourceAllocation, onResolve }) => {
  const resolveConflict = (conflict) => {
    // Auto-resolve by adjusting dates or suggesting alternatives
    if (conflict.type === 'overlap') {
      // Implementation for conflict resolution
      console.log('Resolving conflict:', conflict);
    }
  };

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <AlertTriangle className="text-red-500 mr-2" size={20} />
          <h3 className="font-medium text-red-800">Resource Conflicts Detected</h3>
        </div>
        <button onClick={onResolve} className="text-red-600 hover:text-red-800">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-3">
        {conflicts.map((conflict, index) => (
          <div key={index} className="bg-white border border-red-300 rounded p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <User className="text-red-500 mr-2" size={16} />
                <span className="font-medium text-red-700">{conflict.message}</span>
              </div>
              <button
                onClick={() => resolveConflict(conflict)}
                className="text-sm bg-red-100 text-red-700 px-3 py-1 rounded hover:bg-red-200"
              >
                Resolve
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ConflictPanel;