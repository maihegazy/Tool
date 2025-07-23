// =============================================================================
// COMPONENT: RfqDashboard.js
// =============================================================================

'use client';

import React from 'react';
import { Plus, FileText } from 'lucide-react';
import CreateRfqForm from './CreateRfqForm';
import RfqCard from '../RfqCard';

const RfqDashboard = ({ 
  rfqs, 
  auth, 
  utils, 
  engineerRates,
  isAddingRfq,
  onStartAddRfq,
  onCancelAddRfq,
  onAddRfq,
  onDeleteRfq,
  onEditRfq,
  onAnalysisRfq 
}) => {
  const calculateTotalHours = (rfqs) => {
    return rfqs.reduce((total, rfq) => total + utils.calculateTotalHours(rfq), 0);
  };

  const calculateTotalCost = (rfqs) => {
    return rfqs.reduce((total, rfq) => total + utils.calculateRfqCost(rfq, engineerRates), 0);
  };

  return (
    <div>
      {/* RFQ List Header */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Active RFQs</h2>
        {auth.hasPermission('create_rfqs') && (
          <button
            onClick={onStartAddRfq}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 flex items-center"
          >
            <Plus size={16} className="mr-1" />
            New RFQ
          </button>
        )}
      </div>

      {/* Add RFQ Form */}
      {isAddingRfq && auth.hasPermission('create_rfqs') && (
        <CreateRfqForm 
          onSubmit={onAddRfq}
          onCancel={onCancelAddRfq}
        />
      )}

      {/* RFQ List */}
      <div className="grid grid-cols-1 gap-6">
        {rfqs.length === 0 ? (
          <div className="text-center py-12">
            <FileText size={64} className="mx-auto mb-4 text-gray-400" />
            <p className="text-gray-600 mb-4">
              {auth.hasPermission('create_rfqs') 
                ? 'No RFQs created yet. Click "New RFQ" to get started.'
                : 'No RFQs available. Contact a Project Leader to create RFQs.'
              }
            </p>
            {auth.hasPermission('create_rfqs') && (
              <button
                onClick={onStartAddRfq}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Create Your First RFQ
              </button>
            )}
          </div>
        ) : (
          rfqs.map(rfq => (
            <RfqCard 
              key={rfq.id} 
              rfq={rfq} 
              auth={auth}
              utils={utils}
              engineerRates={engineerRates}
              onEdit={onEditRfq}
              onDelete={onDeleteRfq}
              onAnalysis={onAnalysisRfq}
            />
          ))
        )}
      </div>

      {/* Overview Summary */}
      {rfqs.length > 0 && (
        <div className="mt-8 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-medium mb-4">Overview</h3>
          <div className={auth.hasPermission('view_budgets') ? 'grid grid-cols-3 gap-4' : 'grid grid-cols-2 gap-4'}>
            <div className="text-center">
              <p className="text-2xl font-bold text-blue-600">{rfqs.length}</p>
              <p className="text-sm text-gray-600">Active RFQs</p>
            </div>
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">
                {calculateTotalHours(rfqs)}h
              </p>
              <p className="text-sm text-gray-600">Total Planned Hours</p>
            </div>
            {auth.hasPermission('view_budgets') && (
              <div className="text-center">
                <p className="text-2xl font-bold text-purple-600">
                  €{calculateTotalCost(rfqs).toLocaleString()}
                </p>
                <p className="text-sm text-gray-600">Total Budget</p>
              </div>
            )}
          </div>
        </div>
      )}
    { hasAccess('rfq:approve') && ['submitted','under_review'].includes(rfq.status) && (
  <>
    <button onClick={() => api.post(`/api/rfqs/${rfq.id}/approve`)}>Approve</button>
    <button onClick={() => setShowRejectModal(true)}>Reject</button>
  </>
)}

{ showRejectModal && (
  <RejectionModal
    onCancel={()=>setShowRejectModal(false)}
    onSubmit={reason => {
      api.post(`/api/rfqs/${rfq.id}/reject`, { reason })
         .then(refreshRfq)
         .finally(()=>setShowRejectModal(false));
    }}
  />
)}
  
    </div>
  );
};

export default RfqDashboard;