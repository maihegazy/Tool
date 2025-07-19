'use client';

import React, { useState } from 'react';
import { Plus, AlertCircle, Trash2, CheckSquare, Square } from 'lucide-react';

const AllocationTable = ({ rfq, auth, resourceAllocation }) => {
  const [activeAllocationId, setActiveAllocationId] = useState(null);
  const [selectedAllocations, setSelectedAllocations] = useState(new Set());
  const [showBulkActions, setShowBulkActions] = useState(false);

  // Destructure from resourceAllocation hook
  const {
    allocations,
    engineerLevels,
    locations,
    roles,
    features,
    addAllocation,
    updateAllocation,
    removeAllocation,
    calculateAllocationHours,
    validateAllocation
  } = resourceAllocation;

  // Selection handlers
  const toggleSelection = (allocationId) => {
    const newSelected = new Set(selectedAllocations);
    if (newSelected.has(allocationId)) {
      newSelected.delete(allocationId);
    } else {
      newSelected.add(allocationId);
    }
    setSelectedAllocations(newSelected);
    setShowBulkActions(newSelected.size > 0);
  };

  const selectAll = () => {
    if (selectedAllocations.size === allocations.length) {
      setSelectedAllocations(new Set());
      setShowBulkActions(false);
    } else {
      setSelectedAllocations(new Set(allocations.map(a => a.id)));
      setShowBulkActions(true);
    }
  };

  // Bulk actions
  const bulkDelete = () => {
    if (window.confirm(`Delete ${selectedAllocations.size} selected allocations?`)) {
      resourceAllocation.bulkDeleteAllocations(Array.from(selectedAllocations));
      setSelectedAllocations(new Set());
      setShowBulkActions(false);
    }
  };

  const bulkUpdateLocation = (location) => {
    resourceAllocation.bulkUpdateAllocations(Array.from(selectedAllocations), { location });
    setSelectedAllocations(new Set());
    setShowBulkActions(false);
  };

  const bulkUpdateLevel = (level) => {
    resourceAllocation.bulkUpdateAllocations(Array.from(selectedAllocations), { level });
    setSelectedAllocations(new Set());
    setShowBulkActions(false);
  };

  return (
    <div className="mb-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-medium">Team Allocations</h3>
        <div className="flex space-x-2">
          {showBulkActions && (
            <div className="flex items-center space-x-2 bg-blue-50 px-3 py-2 rounded-lg">
              <span className="text-sm text-blue-700">{selectedAllocations.size} selected</span>
              <div className="flex space-x-1">
                <select
                  onChange={(e) => e.target.value && bulkUpdateLocation(e.target.value)}
                  className="text-xs border border-blue-300 rounded px-2 py-1"
                  defaultValue=""
                >
                  <option value="">Change Location</option>
                  {locations.map(location => (
                    <option key={location} value={location}>{location}</option>
                  ))}
                </select>
                <select
                  onChange={(e) => e.target.value && bulkUpdateLevel(e.target.value)}
                  className="text-xs border border-blue-300 rounded px-2 py-1"
                  defaultValue=""
                >
                  <option value="">Change Level</option>
                  {engineerLevels.map(level => (
                    <option key={level} value={level}>{level}</option>
                  ))}
                </select>
                <button
                  onClick={bulkDelete}
                  className="text-xs bg-red-500 text-white px-2 py-1 rounded hover:bg-red-600"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
          <button
            onClick={() => {
              const newAllocation = addAllocation();
              setActiveAllocationId(newAllocation.id);
            }}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            <Plus size={16} className="inline mr-1" />
            Add Engineer
          </button>
        </div>
      </div>

      {allocations.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          <AlertCircle size={48} className="mx-auto mb-4" />
          <p>No engineers allocated yet. Click Add Engineer to start planning.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-3 py-2 text-left">
                  <button onClick={selectAll} className="flex items-center">
                    {selectedAllocations.size === allocations.length ? (
                      <CheckSquare size={16} className="text-blue-500" />
                    ) : selectedAllocations.size > 0 ? (
                      <div className="w-4 h-4 bg-blue-500 border border-blue-500 rounded flex items-center justify-center">
                        <div className="w-2 h-1 bg-white"></div>
                      </div>
                    ) : (
                      <Square size={16} className="text-gray-400" />
                    )}
                  </button>
                </th>
                <th className="border border-gray-200 px-3 py-2 text-left">Name</th>
                <th className="border border-gray-200 px-3 py-2 text-left">Level</th>
                <th className="border border-gray-200 px-3 py-2 text-left">Location</th>
                <th className="border border-gray-200 px-3 py-2 text-left">Role</th>
                <th className="border border-gray-200 px-3 py-2 text-left">Feature</th>
                <th className="border border-gray-200 px-3 py-2 text-left">Period</th>
                <th className="border border-gray-200 px-3 py-2 text-left">FTE %</th>
                <th className="border border-gray-200 px-3 py-2 text-left">Hours</th>
                {auth.hasPermission('view_budgets') && (
                  <>
                    <th className="border border-gray-200 px-3 py-2 text-left">Rate (€/h)</th>
                    <th className="border border-gray-200 px-3 py-2 text-left">Cost (€)</th>
                  </>
                )}
                <th className="border border-gray-200 px-3 py-2 text-left">Status</th>
                <th className="border border-gray-200 px-3 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allocations.map((allocation) => (
                <AllocationRow
                  key={allocation.id}
                  allocation={allocation}
                  rfq={rfq}
                  auth={auth}
                  resourceAllocation={resourceAllocation}
                  activeAllocationId={activeAllocationId}
                  setActiveAllocationId={setActiveAllocationId}
                  isSelected={selectedAllocations.has(allocation.id)}
                  onToggleSelection={toggleSelection}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const AllocationRow = ({ 
  allocation, 
  rfq, 
  auth, 
  resourceAllocation,
  activeAllocationId,
  setActiveAllocationId,
  isSelected,
  onToggleSelection
}) => {
  const {
    engineerLevels,
    locations,
    roles,
    features,
    updateAllocation,
    removeAllocation,
    calculateAllocationHours,
    calculateAllocationCost,
    validateAllocation
  } = resourceAllocation;

  const hours = calculateAllocationHours(allocation);
  const cost = calculateAllocationCost(allocation);
  const errors = validateAllocation(allocation);
  const hasErrors = errors.length > 0;

  return (
    <tr className={`${hasErrors ? 'bg-red-50' : ''} ${isSelected ? 'bg-blue-50' : ''} hover:bg-gray-50`}>
      {/* Selection Checkbox */}
      <td className="border border-gray-200 px-3 py-2">
        <button onClick={() => onToggleSelection(allocation.id)}>
          {isSelected ? (
            <CheckSquare size={16} className="text-blue-500" />
          ) : (
            <Square size={16} className="text-gray-400" />
          )}
        </button>
      </td>

      {/* Name */}
      <td className="border border-gray-200 px-3 py-2">
        <input
          type="text"
          ref={el => {
            if (el && activeAllocationId === allocation.id) {
              el.focus();
              const end = el.value.length;
              el.setSelectionRange(end, end);
            }
          }}
          onFocus={e => {
            setActiveAllocationId(allocation.id);
            e.target.select();
          }}
          onClick={() => setActiveAllocationId(allocation.id)}
          value={allocation.name}
          onChange={(e) => updateAllocation(allocation.id, { name: e.target.value })}
          className={`w-full border rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
            hasErrors && !allocation.name.trim() ? 'border-red-300 bg-red-50' : 'border-gray-300'
          }`}
          placeholder="Engineer name"
        />
      </td>

      {/* Level */}
      <td className="border border-gray-200 px-3 py-2">
        <select
          value={allocation.level}
          onChange={(e) => updateAllocation(allocation.id, { level: e.target.value })}
          className="w-full border border-gray-300 rounded px-2 py-1"
        >
          {engineerLevels.map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </td>

      {/* Location */}
      <td className="border border-gray-200 px-3 py-2">
        <select
          value={allocation.location}
          onChange={(e) => updateAllocation(allocation.id, { location: e.target.value })}
          className="w-full border border-gray-300 rounded px-2 py-1"
        >
          {locations.map(location => (
            <option key={location} value={location}>{location}</option>
          ))}
        </select>
      </td>

      {/* Role */}
      <td className="border border-gray-200 px-3 py-2">
        <select
          value={allocation.role}
          onChange={(e) => updateAllocation(allocation.id, { role: e.target.value })}
          className="w-full border border-gray-300 rounded px-2 py-1"
        >
          {roles.map(role => (
            <option key={role} value={role}>{role}</option>
          ))}
        </select>
      </td>

      {/* Feature */}
      <td className="border border-gray-200 px-3 py-2">
        <div className="space-y-1">
          <select
            value={allocation.feature}
            onChange={(e) => updateAllocation(allocation.id, { feature: e.target.value })}
            className="w-full border border-gray-300 rounded px-2 py-1"
          >
            {features.map(feature => (
              <option key={feature} value={feature}>{feature}</option>
            ))}
          </select>
          {allocation.feature === 'Other' && (
            <input
              type="text"
              value={allocation.customFeature}
              onChange={(e) => updateAllocation(allocation.id, { customFeature: e.target.value })}
              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
              placeholder="Specify custom feature"
            />
          )}
        </div>
      </td>

      {/* Period */}
      <td className="border border-gray-200 px-3 py-2">
        <div className="space-y-2">
          <select
            value={allocation.allocationType}
            onChange={(e) => {
              const newType = e.target.value;
              updateAllocation(allocation.id, {
                allocationType: newType,
                startDate: newType === 'Whole Project' ? rfq.createdDate : allocation.startDate,
                endDate: newType === 'Whole Project' ? rfq.deadline : allocation.endDate
              });
            }}
            className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
          >
            <option value="Whole Project">Whole Project</option>
            <option value="Specific Period">Specific Period</option>
          </select>
          {allocation.allocationType === 'Specific Period' ? (
            <div className="space-y-1">
              <input
                type="date"
                value={allocation.startDate}
                onChange={(e) => updateAllocation(allocation.id, { startDate: e.target.value })}
                className={`w-full border rounded px-2 py-1 text-xs ${
                  hasErrors && !allocation.startDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
              <input
                type="date"
                value={allocation.endDate}
                onChange={(e) => updateAllocation(allocation.id, { endDate: e.target.value })}
                className={`w-full border rounded px-2 py-1 text-xs ${
                  hasErrors && !allocation.endDate ? 'border-red-300 bg-red-50' : 'border-gray-300'
                }`}
              />
            </div>
          ) : (
            <div className="text-xs text-gray-500">
              {rfq.createdDate} to {rfq.deadline}
            </div>
          )}
        </div>
      </td>

      {/* FTE % */}
      <td className="border border-gray-200 px-3 py-2">
        <select
          value={allocation.ftePercentage}
          onChange={(e) => updateAllocation(allocation.id, { ftePercentage: parseInt(e.target.value) })}
          className="w-full border border-gray-300 rounded px-2 py-1"
        >
          {[25, 50, 75, 100].map(percentage => (
            <option key={percentage} value={percentage}>{percentage}%</option>
          ))}
        </select>
      </td>

      {/* Hours */}
      <td className="border border-gray-200 px-3 py-2">
        <span className="font-medium">{hours}h</span>
      </td>

      {/* Rate & Cost (if permissions allow) */}
      {auth.hasPermission('view_budgets') && (
        <>
          <td className="border border-gray-200 px-3 py-2">
            €{resourceAllocation.engineerRates?.[allocation.level]?.[allocation.location] || 0}
          </td>
          <td className="border border-gray-200 px-3 py-2">
            €{cost.toLocaleString()}
          </td>
        </>
      )}

      {/* Status */}
      <td className="border border-gray-200 px-3 py-2">
        {hasErrors ? (
          <div className="flex items-center text-red-600" title={errors.join(', ')}>
            <AlertCircle size={16} className="mr-1" />
            <span className="text-xs">Errors</span>
          </div>
        ) : (
          <div className="flex items-center text-green-600">
            <div className="w-2 h-2 bg-green-500 rounded-full mr-2"></div>
            <span className="text-xs">Valid</span>
          </div>
        )}
      </td>

      {/* Actions */}
      <td className="border border-gray-200 px-3 py-2">
        <button
          onClick={() => removeAllocation(allocation.id)}
          className="text-red-500 hover:text-red-700"
          title="Delete allocation"
        >
          <Trash2 size={16} />
        </button>
      </td>
    </tr>
  );
};

export default AllocationTable;