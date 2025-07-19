// =============================================================================
// COMPONENT: TimelineView.js
// =============================================================================

'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, ChevronLeft, ChevronRight, User, Clock, AlertTriangle } from 'lucide-react';

const TimelineView = ({ rfq }) => {
  const [viewMode, setViewMode] = useState('months'); // 'months' or 'weeks'
  const [selectedPerson, setSelectedPerson] = useState('all');
  const [currentDate, setCurrentDate] = useState(new Date());

  // Generate timeline data
  const timelineData = useMemo(() => {
    if (!rfq.allocations || rfq.allocations.length === 0) return null;

    const startDate = new Date(rfq.createdDate);
    const endDate = new Date(rfq.deadline);
    
    // Generate time periods
    const periods = [];
    const current = new Date(startDate);
    
    while (current <= endDate) {
      if (viewMode === 'months') {
        periods.push({
          key: `${current.getFullYear()}-${String(current.getMonth() + 1).padStart(2, '0')}`,
          label: current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          start: new Date(current.getFullYear(), current.getMonth(), 1),
          end: new Date(current.getFullYear(), current.getMonth() + 1, 0)
        });
        current.setMonth(current.getMonth() + 1);
      } else {
        const weekStart = new Date(current);
        const weekEnd = new Date(current);
        weekEnd.setDate(weekEnd.getDate() + 6);
        
        periods.push({
          key: `${current.getFullYear()}-W${Math.ceil(current.getDate() / 7)}`,
          label: `${weekStart.getDate()}/${weekStart.getMonth() + 1}`,
          start: weekStart,
          end: weekEnd
        });
        current.setDate(current.getDate() + 7);
      }
    }

    // Filter allocations by selected person
    const filteredAllocations = selectedPerson === 'all' 
      ? rfq.allocations 
      : rfq.allocations.filter(a => a.name.toLowerCase() === selectedPerson.toLowerCase());

    // Group allocations by person
    const personGroups = {};
    filteredAllocations.forEach(allocation => {
      const personName = allocation.name || 'Unnamed';
      if (!personGroups[personName]) {
        personGroups[personName] = [];
      }
      personGroups[personName].push(allocation);
    });

    return { periods, personGroups, startDate, endDate };
  }, [rfq, viewMode, selectedPerson]);

  // Get unique persons for filter
  const uniquePersons = useMemo(() => {
    const persons = new Set();
    rfq.allocations?.forEach(allocation => {
      if (allocation.name?.trim()) {
        persons.add(allocation.name.trim());
      }
    });
    return Array.from(persons).sort();
  }, [rfq.allocations]);

  // Calculate allocation position and width
  const calculateAllocationStyle = (allocation, periods) => {
    const allocationStart = new Date(allocation.startDate);
    const allocationEnd = new Date(allocation.endDate);
    const totalStart = periods[0].start;
    const totalEnd = periods[periods.length - 1].end;
    
    const totalDuration = totalEnd - totalStart;
    const allocationDuration = allocationEnd - allocationStart;
    
    const leftPercentage = ((allocationStart - totalStart) / totalDuration) * 100;
    const widthPercentage = (allocationDuration / totalDuration) * 100;
    
    return {
      left: `${Math.max(0, leftPercentage)}%`,
      width: `${Math.min(100 - Math.max(0, leftPercentage), widthPercentage)}%`
    };
  };

  // Get allocation color based on role
  const getAllocationColor = (allocation) => {
    const colors = {
      'Software Developer': 'bg-blue-500',
      'Technical Lead': 'bg-purple-500',
      'Project Manager': 'bg-green-500',
      'QA Engineer': 'bg-orange-500',
      'DevOps Engineer': 'bg-red-500',
      'UI/UX Designer': 'bg-pink-500',
      'Business Analyst': 'bg-indigo-500'
    };
    return colors[allocation.role] || 'bg-gray-500';
  };

  // Check for overlapping allocations
  const hasOverlap = (allocations) => {
    for (let i = 0; i < allocations.length; i++) {
      for (let j = i + 1; j < allocations.length; j++) {
        const a1 = allocations[i];
        const a2 = allocations[j];
        const start1 = new Date(a1.startDate);
        const end1 = new Date(a1.endDate);
        const start2 = new Date(a2.startDate);
        const end2 = new Date(a2.endDate);

        if (start1 <= end2 && start2 <= end1) {
          return true;
        }
      }
    }
    return false;
  };

  // Calculate total hours for an allocation
  const calculateHours = (allocation) => {
    const start = new Date(allocation.startDate);
    const end = new Date(allocation.endDate);
    const diffTime = Math.abs(end - start);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    const workingDays = Math.floor(diffDays * 5 / 7); // Approximate working days
    return Math.round(workingDays * 8 * (allocation.ftePercentage / 100));
  };

  if (!timelineData) {
    return (
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Project Timeline</h3>
        <div className="text-center py-8 text-gray-500">
          <Calendar size={48} className="mx-auto mb-4" />
          <p>No allocations to display in timeline.</p>
          <p className="text-sm mt-2">Add team members to see the project timeline.</p>
        </div>
      </div>
    );
  }

  const { periods, personGroups } = timelineData;

  return (
    <div className="mt-6 bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Project Timeline</h3>
        
        {/* Controls */}
        <div className="flex space-x-4">
          {/* Person Filter */}
          <select
            value={selectedPerson}
            onChange={(e) => setSelectedPerson(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="all">All Team Members</option>
            {uniquePersons.map(person => (
              <option key={person} value={person}>{person}</option>
            ))}
          </select>

          {/* View Mode Toggle */}
          <div className="flex border border-gray-300 rounded overflow-hidden">
            <button
              onClick={() => setViewMode('months')}
              className={`px-3 py-2 text-sm ${
                viewMode === 'months' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setViewMode('weeks')}
              className={`px-3 py-2 text-sm ${
                viewMode === 'weeks' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Weekly
            </button>
          </div>
        </div>
      </div>

      {/* Timeline Header */}
      <div className="mb-4">
        <div className="flex border-b border-gray-200">
          <div className="w-48 py-3 px-4 font-medium text-gray-700 bg-gray-50 border-r">
            Team Member
          </div>
          <div className="flex-1 relative">
            <div className="flex">
              {periods.map((period, index) => (
                <div
                  key={period.key}
                  className={`flex-1 py-3 px-2 text-center text-sm font-medium text-gray-700 bg-gray-50 ${
                    index !== periods.length - 1 ? 'border-r border-gray-200' : ''
                  }`}
                  style={{ minWidth: viewMode === 'weeks' ? '60px' : '80px' }}
                >
                  {period.label}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Timeline Body */}
      <div className="space-y-2">
        {Object.entries(personGroups).map(([personName, allocations]) => {
          const personHasOverlap = hasOverlap(allocations);
          const totalHours = allocations.reduce((sum, a) => sum + calculateHours(a), 0);
          
          return (
            <div key={personName} className="flex border-b border-gray-100 hover:bg-gray-50">
              {/* Person Name Column */}
              <div className="w-48 p-4 border-r border-gray-200">
                <div className="flex items-center">
                  <User size={16} className="mr-2 text-gray-500" />
                  <div>
                    <div className="font-medium text-gray-800 flex items-center">
                      {personName}
                      {personHasOverlap && (
                        <AlertTriangle size={16} className="ml-2 text-red-500" title="Overlapping allocations" />
                      )}
                    </div>
                    <div className="text-xs text-gray-500 flex items-center mt-1">
                      <Clock size={12} className="mr-1" />
                      {totalHours}h total
                    </div>
                  </div>
                </div>
              </div>

              {/* Timeline Column */}
              <div className="flex-1 relative p-2" style={{ minHeight: '60px' }}>
                {allocations.map((allocation, index) => {
                  const style = calculateAllocationStyle(allocation, periods);
                  const color = getAllocationColor(allocation);
                  const hours = calculateHours(allocation);
                  
                  return (
                    <div
                      key={allocation.id}
                      className={`absolute h-6 rounded-md ${color} text-white text-xs flex items-center justify-center cursor-pointer hover:opacity-80 transition-opacity`}
                      style={{
                        ...style,
                        top: `${index * 28 + 8}px`,
                        minWidth: '60px'
                      }}
                      title={`${allocation.role} - ${allocation.feature === 'Other' ? allocation.customFeature : allocation.feature} (${allocation.ftePercentage}% FTE, ${hours}h)`}
                    >
                      <span className="truncate px-2">
                        {allocation.role} ({allocation.ftePercentage}%)
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {/* Timeline Legend */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <h4 className="text-sm font-medium text-gray-700 mb-3">Legend</h4>
        <div className="flex flex-wrap gap-4">
          {[
            { role: 'Software Developer', color: 'bg-blue-500' },
            { role: 'Technical Lead', color: 'bg-purple-500' },
            { role: 'Project Manager', color: 'bg-green-500' },
            { role: 'QA Engineer', color: 'bg-orange-500' },
            { role: 'DevOps Engineer', color: 'bg-red-500' },
            { role: 'UI/UX Designer', color: 'bg-pink-500' },
            { role: 'Business Analyst', color: 'bg-indigo-500' }
          ].map(({ role, color }) => (
            <div key={role} className="flex items-center">
              <div className={`w-4 h-4 rounded ${color} mr-2`}></div>
              <span className="text-sm text-gray-600">{role}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Timeline Summary */}
      <div className="mt-6 pt-4 border-t border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800">Project Duration</h4>
            <p className="text-2xl font-bold text-blue-600">
              {Math.ceil((new Date(rfq.deadline) - new Date(rfq.createdDate)) / (1000 * 60 * 60 * 24))} days
            </p>
            <p className="text-sm text-blue-600">
              {new Date(rfq.createdDate).toLocaleDateString()} - {new Date(rfq.deadline).toLocaleDateString()}
            </p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-800">Team Size</h4>
            <p className="text-2xl font-bold text-green-600">{uniquePersons.length}</p>
            <p className="text-sm text-green-600">Active team members</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-800">Total Allocations</h4>
            <p className="text-2xl font-bold text-purple-600">{rfq.allocations.length}</p>
            <p className="text-sm text-purple-600">Resource assignments</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TimelineView;