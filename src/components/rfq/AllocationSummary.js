// =============================================================================
// COMPONENT: AllocationSummary.js
// =============================================================================

'use client';

import React from 'react';
import PersonSummary from './PersonSummary';
import FeatureSummary from './FeatureSummary';
import ProjectSummary from './ProjectSummary';

const AllocationSummary = ({ rfq, auth, utils, engineerRates }) => {
  return (
    <div className="bg-gray-50 p-4 rounded-lg">
      <h3 className="text-lg font-medium mb-4">Summary</h3>
      
      <PersonSummary rfq={rfq} utils={utils} />
      <ProjectSummary rfq={rfq} auth={auth} utils={utils} engineerRates={engineerRates} />
      <FeatureSummary rfq={rfq} utils={utils} />
    </div>
  );
};

export default AllocationSummary;