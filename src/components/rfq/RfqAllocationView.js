// =============================================================================
// UPDATED: RfqAllocationView.js - Enhanced with advanced features
// =============================================================================

'use client';

import React, { useState } from 'react';
import { Calendar, BarChart3, AlertTriangle, CheckCircle, Lightbulb } from 'lucide-react';
import AllocationHeader from './AllocationHeader';
import AllocationTable from '../tables/AllocationTable';
import AllocationSummary from './AllocationSummary';
import TimelineView from './TimelineView';
import YearlyView from './YearlyView';
import ConflictPanel from './ConflictPanel';
import SuggestionPanel from './SuggestionPanel';

const RfqAllocationView = ({ 
  rfq, 
  auth, 
  utils, 
  engineerRates, 
  resourceAllocation,
  onUpdate, 
  onBack 
}) => {
  const [showTimeline, setShowTimeline] = useState(false);
  const [showYearlyView, setShowYearlyView] = useState(false);
  const [showConflicts, setShowConflicts] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);

  // Check for conflicts and generate suggestions
  const conflicts = resourceAllocation.checkConflicts();
  const suggestions = resourceAllocation.generateSuggestions();

  return (
    <div className="space-y-6">
      {/* Status Bar */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            {/* Conflicts Indicator */}
            <div className="flex items-center">
              {conflicts.length > 0 ? (
                <AlertTriangle className="text-red-500 mr-2" size={20} />
              ) : (
                <CheckCircle className="text-green-500 mr-2" size={20} />
              )}
              <span className={`font-medium ${conflicts.length > 0 ? 'text-red-600' : 'text-green-600'}`}>
                {conflicts.length > 0 ? `${conflicts.length} Conflict${conflicts.length > 1 ? 's' : ''}` : 'No Conflicts'}
              </span>
              {conflicts.length > 0 && (
                <button
                  onClick={() => setShowConflicts(!showConflicts)}
                  className="ml-2 text-sm text-red-600 hover:text-red-800 underline"
                >
                  View Details
                </button>
              )}
            </div>

            {/* Suggestions Indicator */}
            <div className="flex items-center">
              <Lightbulb className="text-yellow-500 mr-2" size={20} />
              <span className="font-medium text-yellow-600">
                {suggestions.length} Suggestion{suggestions.length !== 1 ? 's' : ''}
              </span>
              {suggestions.length > 0 && (
                <button
                  onClick={() => setShowSuggestions(!showSuggestions)}
                  className="ml-2 text-sm text-yellow-600 hover:text-yellow-800 underline"
                >
                  View
                </button>
              )}
            </div>

            {/* Project Metrics */}
            <div className="flex items-center space-x-4 text-sm text-gray-600">
              <span>{resourceAllocation.projectMetrics.totalHours}h total</span>
              <span>{resourceAllocation.projectMetrics.teamSize} people</span>
              <span>€{resourceAllocation.projectMetrics.totalCost.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Conflict Panel */}
      {showConflicts && conflicts.length > 0 && (
        <ConflictPanel 
          conflicts={conflicts}
          resourceAllocation={resourceAllocation}
          onResolve={() => setShowConflicts(false)}
        />
      )}

      {/* Suggestion Panel */}
      {showSuggestions && suggestions.length > 0 && (
        <SuggestionPanel 
          suggestions={suggestions}
          resourceAllocation={resourceAllocation}
          onApply={() => setShowSuggestions(false)}
        />
      )}

      {/* Main Allocation View */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <AllocationHeader 
          rfq={rfq}
          showTimeline={showTimeline}
          showYearlyView={showYearlyView}
          onToggleTimeline={() => setShowTimeline(!showTimeline)}
          onToggleYearlyView={() => setShowYearlyView(!showYearlyView)}
          onBack={onBack}
          onUpdate={onUpdate}
        />

        <AllocationTable 
          rfq={rfq}
          auth={auth}
          utils={utils}
          engineerRates={engineerRates}
          resourceAllocation={resourceAllocation} // Use advanced hook
        />

        <AllocationSummary 
          rfq={rfq}
          auth={auth}
          utils={utils}
          engineerRates={engineerRates}
          resourceAllocation={resourceAllocation} // Enhanced metrics
        />

        {showTimeline && <TimelineView rfq={rfq} />}
        {showYearlyView && <YearlyView rfq={rfq} />}
      </div>
    </div>
  );
};

export default RfqAllocationView;