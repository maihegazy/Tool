'use client';
import React from 'react';

const CostProfitAnalysisModal = ({ rfq, utils, engineerRates, onClose }) => {
  const totalCost = utils.calculateRfqCost(rfq, engineerRates);
  const totalHours = utils.calculateTotalHours(rfq);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-4/5 max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Cost-Profit Analysis: {rfq.name}</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2">Project Overview</h3>
            <div className="text-sm space-y-1">
              <div>Total Hours: {totalHours}h</div>
              <div>Total Cost: €{totalCost.toLocaleString()}</div>
              <div>Team Members: {utils.getUniquePersons(rfq).length}</div>
            </div>
          </div>

          <div className="bg-blue-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-blue-800">Resource Breakdown</h3>
            <div className="text-sm space-y-1">
              <div>Engineers: {rfq.allocations.length}</div>
              <div>Avg Hours per Engineer: {rfq.allocations.length > 0 ? Math.round(totalHours / rfq.allocations.length) : 0}h</div>
              <div>Avg Cost per Hour: €{totalHours > 0 ? Math.round(totalCost / totalHours) : 0}</div>
            </div>
          </div>

          <div className="bg-green-50 p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-green-800">Cost Analysis</h3>
            <div className="text-sm space-y-1">
              <div>Total Project Cost: €{totalCost.toLocaleString()}</div>
              <div>Monthly Average: €{Math.round(totalCost / 12).toLocaleString()}</div>
              <div>Daily Rate: €{Math.round(totalCost / 365).toLocaleString()}</div>
            </div>
          </div>
        </div>

        {/* Resource Allocation Details */}
        <div className="bg-white border rounded-lg p-6">
          <h3 className="text-lg font-semibold mb-4">Resource Allocation Details</h3>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-3 py-2 text-left">Engineer</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">Level</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">Location</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">Role</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">Hours</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">Rate (€/h)</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">Cost (€)</th>
                </tr>
              </thead>
              <tbody>
                {rfq.allocations.map(allocation => {
                  const hours = utils.calculateAllocationHours(allocation);
                  const rate = engineerRates[allocation.level]?.[allocation.location] || 0;
                  const cost = hours * rate;
                  
                  return (
                    <tr key={allocation.id}>
                      <td className="border border-gray-200 px-3 py-2 font-medium">
                        {allocation.name || 'Unnamed'}
                      </td>
                      <td className="border border-gray-200 px-3 py-2">{allocation.level}</td>
                      <td className="border border-gray-200 px-3 py-2">{allocation.location}</td>
                      <td className="border border-gray-200 px-3 py-2">{allocation.role}</td>
                      <td className="border border-gray-200 px-3 py-2">{hours}h</td>
                      <td className="border border-gray-200 px-3 py-2">€{rate}</td>
                      <td className="border border-gray-200 px-3 py-2">€{cost.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
};

export default CostProfitAnalysisModal;