// =============================================================================
// COMPONENT: FeatureSummary.js
// =============================================================================

'use client';

import React from 'react';

const FeatureSummary = ({ rfq, utils }) => {
  const featureGroups = utils.getFeatureGroups(rfq);
  
  if (rfq.allocations.length === 0) {
    return null;
  }

  return (
    <div>
      <h4 className="text-md font-medium mb-3">Feature Distribution</h4>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
        {Object.entries(featureGroups).map(([featureName, allocations]) => (
          <div key={featureName} className="bg-white p-3 rounded border">
            <h5 className="font-medium text-sm mb-2">{featureName || 'Unspecified'}</h5>
            <div className="space-y-1">
              {allocations.map(allocation => (
                <div key={allocation.id} className="text-xs text-gray-600">
                  {allocation.name || 'Unnamed'} ({utils.calculateAllocationHours(allocation)}h - {allocation.ftePercentage}%)
                </div>
              ))}
            </div>
            <div className="text-xs font-medium text-gray-700 mt-2">
              Total: {allocations.reduce((sum, a) => sum + utils.calculateAllocationHours(a), 0)}h
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default FeatureSummary;