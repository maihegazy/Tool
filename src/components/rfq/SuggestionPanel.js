// =============================================================================
// NEW COMPONENT: SuggestionPanel.js
// =============================================================================

'use client';

import React from 'react';
import { Lightbulb, X, CheckCircle, TrendingDown } from 'lucide-react';

const SuggestionPanel = ({ suggestions, resourceAllocation, onApply }) => {
  const applySuggestion = (suggestion) => {
    // Apply suggestion logic
    if (suggestion.type === 'consolidation') {
      // Implementation for consolidation
      console.log('Applying suggestion:', suggestion);
    }
  };

  const getSuggestionIcon = (type) => {
    switch (type) {
      case 'consolidation':
        return <CheckCircle className="text-blue-500" size={16} />;
      case 'cost_optimization':
        return <TrendingDown className="text-green-500" size={16} />;
      default:
        return <Lightbulb className="text-yellow-500" size={16} />;
    }
  };

  return (
    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <Lightbulb className="text-yellow-500 mr-2" size={20} />
          <h3 className="font-medium text-yellow-800">Optimization Suggestions</h3>
        </div>
        <button onClick={onApply} className="text-yellow-600 hover:text-yellow-800">
          <X size={20} />
        </button>
      </div>

      <div className="space-y-3">
        {suggestions.map((suggestion, index) => (
          <div key={index} className="bg-white border border-yellow-300 rounded p-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                {getSuggestionIcon(suggestion.type)}
                <span className="font-medium text-yellow-700 ml-2">{suggestion.message}</span>
              </div>
              <button
                onClick={() => applySuggestion(suggestion)}
                className="text-sm bg-yellow-100 text-yellow-700 px-3 py-1 rounded hover:bg-yellow-200"
              >
                Apply
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SuggestionPanel;