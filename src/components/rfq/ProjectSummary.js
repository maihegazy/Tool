// =============================================================================
// COMPONENT: ProjectSummary.js
// =============================================================================

'use client';

import React from 'react';

const ProjectSummary = ({ rfq, auth, utils, engineerRates }) => {
  const totalHours = utils.calculateTotalHours(rfq);
  const totalCost = utils.calculateRfqCost(rfq, engineerRates);

  return (
    <div className={auth.hasPermission('view_budgets') ? 'grid grid-cols-2 gap-4 mb-6' : 'grid grid-cols-1 gap-4 mb-6'}>
      <div>
        <p className="text-sm text-gray-600">Total Hours</p>
        <p className="text-xl font-semibold">{totalHours}h</p>
      </div>
      {auth.hasPermission('view_budgets') && (
        <div>
          <p className="text-sm text-gray-600">Total Cost</p>
          <p className="text-xl font-semibold text-green-600">€{totalCost.toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default ProjectSummary;