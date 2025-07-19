// =============================================================================
// COMPONENT: PersonSummary.js
// =============================================================================

'use client';

import React from 'react';

const PersonSummary = ({ rfq, utils }) => {
  const uniquePersons = utils.getUniquePersons(rfq);
  
  if (uniquePersons.length === 0) {
    return null;
  }

  return (
    <div className="mb-6">
      <h4 className="text-md font-medium mb-3">Team Member Summary</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {uniquePersons.map(personName => {
          const personAllocations = utils.getPersonAllocations(rfq, personName);
          const totalHours = utils.getPersonTotalHours(rfq, personName);
          const hasOverlap = utils.hasOverlappingAllocations(personAllocations);

          return (
            <div 
              key={personName} 
              className={hasOverlap ? 'bg-white p-3 rounded border border-red-300 bg-red-50' : 'bg-white p-3 rounded border'}
            >
              <h5 className="font-medium text-sm mb-2 flex items-center">
                {personName}
                {hasOverlap && <span className="ml-2 text-red-600">⚠️</span>}
              </h5>
              <div className="space-y-1">
                {personAllocations.map((allocation, index) => (
                  <div key={allocation.id} className="text-xs text-gray-600">
                    Period {index + 1}: {allocation.role} - {allocation.feature === 'Other' ? allocation.customFeature : allocation.feature}
                    <br />
                    {new Date(allocation.startDate).toLocaleDateString()} - {new Date(allocation.endDate).toLocaleDateString()} ({utils.calculateAllocationHours(allocation)}h)
                  </div>
                ))}
              </div>
              <div className="text-xs font-medium text-gray-700 mt-2">
                Total: {totalHours}h
                {hasOverlap && <span className="text-red-600 ml-1">(Overlapping periods detected)</span>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PersonSummary;