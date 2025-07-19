'use client';

import React, { useState, useMemo } from 'react';
import { Calendar, Users, Clock, AlertTriangle, Eye, EyeOff, Download, Filter } from 'lucide-react';

const TimelineTable = ({ 
  rfq, 
  utils, 
  auth, 
  onEditFTE, 
  showCosts = false 
}) => {
  const [viewMode, setViewMode] = useState('months'); // months, quarters, years
  const [showEmptyRows, setShowEmptyRows] = useState(false);
  const [selectedPersons, setSelectedPersons] = useState(new Set());

  // Generate time periods based on view mode
  const timePeriods = useMemo(() => {
    if (!rfq.createdDate || !rfq.deadline) return [];

    const start = new Date(rfq.createdDate);
    const end = new Date(rfq.deadline);
    const periods = [];

    if (viewMode === 'months') {
      const current = new Date(start.getFullYear(), start.getMonth(), 1);
      const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

      while (current <= endMonth) {
        periods.push({
          key: `${current.getFullYear()}-${current.getMonth().toString().padStart(2, '0')}`,
          label: current.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
          date: new Date(current),
          type: 'month'
        });
        current.setMonth(current.getMonth() + 1);
      }
    } else if (viewMode === 'quarters') {
      const startYear = start.getFullYear();
      const endYear = end.getFullYear();
      const startQuarter = Math.floor(start.getMonth() / 3);
      const endQuarter = Math.floor(end.getMonth() / 3);

      for (let year = startYear; year <= endYear; year++) {
        const startQ = year === startYear ? startQuarter : 0;
        const endQ = year === endYear ? endQuarter : 3;
        
        for (let quarter = startQ; quarter <= endQ; quarter++) {
          periods.push({
            key: `${year}-Q${quarter + 1}`,
            label: `Q${quarter + 1} ${year}`,
            date: new Date(year, quarter * 3, 1),
            type: 'quarter'
          });
        }
      }
    } else { // years
      const startYear = start.getFullYear();
      const endYear = end.getFullYear();
      
      for (let year = startYear; year <= endYear; year++) {
        periods.push({
          key: year.toString(),
          label: year.toString(),
          date: new Date(year, 0, 1),
          type: 'year'
        });
      }
    }

    return periods;
  }, [rfq.createdDate, rfq.deadline, viewMode]);

  // Get unique persons
  const uniquePersons = useMemo(() => {
    return utils.getUniquePersons(rfq);
  }, [rfq, utils]);

  // Calculate allocation data for each person and period
  const timelineData = useMemo(() => {
    const data = {};

    uniquePersons.forEach(personName => {
      data[personName] = {
        allocations: utils.getPersonAllocations ? utils.getPersonAllocations(rfq, personName) : [],
        periods: {}
      };

      timePeriods.forEach(period => {
        let totalFTE = 0;
        let totalHours = 0;
        let totalCost = 0;
        let allocationsInPeriod = [];

        data[personName].allocations.forEach(allocation => {
          if (isPeriodInAllocation(period, allocation)) {
            const monthlyFTE = allocation.monthlyFTE?.[period.key] || allocation.ftePercentage;
            totalFTE += monthlyFTE;
            
            if (viewMode === 'months') {
              const hours = (monthlyFTE / 100) * 160;
              totalHours += hours;
              
              if (showCosts) {
                const rate = auth.engineerRates?.[allocation.level]?.[allocation.location] || 0;
                totalCost += hours * rate;
              }
            }
            
            allocationsInPeriod.push({
              ...allocation,
              effectiveFTE: monthlyFTE
            });
          }
        });

        data[personName].periods[period.key] = {
          totalFTE,
          totalHours,
          totalCost,
          allocations: allocationsInPeriod,
          hasOverlap: allocationsInPeriod.length > 1,
          hasCustomFTE: allocationsInPeriod.some(a => a.monthlyFTE?.[period.key] !== undefined)
        };
      });
    });

    return data;
  }, [uniquePersons, timePeriods, rfq, utils, viewMode, showCosts, auth.engineerRates]);

  const isPeriodInAllocation = (period, allocation) => {
    const periodStart = period.date;
    let periodEnd;

    if (period.type === 'month') {
      periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 1, 0);
    } else if (period.type === 'quarter') {
      periodEnd = new Date(periodStart.getFullYear(), periodStart.getMonth() + 3, 0);
    } else { // year
      periodEnd = new Date(periodStart.getFullYear(), 11, 31);
    }

    const allocStart = new Date(allocation.startDate);
    const allocEnd = new Date(allocation.endDate);

    return allocStart <= periodEnd && allocEnd >= periodStart;
  };

  const handlePersonToggle = (personName) => {
    const newSelected = new Set(selectedPersons);
    if (newSelected.has(personName)) {
      newSelected.delete(personName);
    } else {
      newSelected.add(personName);
    }
    setSelectedPersons(newSelected);
  };

  const toggleAllPersons = () => {
    if (selectedPersons.size === uniquePersons.length) {
      setSelectedPersons(new Set());
    } else {
      setSelectedPersons(new Set(uniquePersons));
    }
  };

  const exportTimeline = () => {
    const headers = ['Person', ...timePeriods.map(p => p.label)];
    const csvData = uniquePersons.map(person => {
      const row = [person];
      timePeriods.forEach(period => {
        const periodData = timelineData[person]?.periods[period.key];
        row.push(periodData?.totalFTE || 0);
      });
      return row;
    });

    const csvContent = [headers, ...csvData]
      .map(row => row.map(cell => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timeline-${rfq.name}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  };

  const getCellColor = (totalFTE) => {
    if (totalFTE === 0) return 'bg-gray-100';
    if (totalFTE >= 100) return 'bg-red-200 text-red-800';
    if (totalFTE >= 75) return 'bg-orange-200 text-orange-800';
    if (totalFTE >= 50) return 'bg-yellow-200 text-yellow-800';
    if (totalFTE >= 25) return 'bg-green-200 text-green-800';
    return 'bg-blue-200 text-blue-800';
  };

  const filteredPersons = showEmptyRows ? uniquePersons : 
    uniquePersons.filter(person => 
      Object.values(timelineData[person]?.periods || {}).some(p => p.totalFTE > 0)
    );

  return (
    <div className="bg-white rounded-lg shadow-md">
      {/* Header */}
      <div className="flex justify-between items-center p-6 border-b">
        <div className="flex items-center">
          <Calendar className="mr-2 text-blue-600" size={24} />
          <h3 className="text-lg font-semibold">Resource Timeline</h3>
          <span className="ml-2 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
            {filteredPersons.length} resources
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={exportTimeline}
            className="px-3 py-2 bg-gray-500 text-white rounded hover:bg-gray-600 flex items-center text-sm"
          >
            <Download size={14} className="mr-1" />
            Export
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 bg-gray-50 border-b space-y-4">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center">
            <span className="text-sm font-medium text-gray-700 mr-2">View:</span>
            <div className="flex rounded-lg border border-gray-300 overflow-hidden">
              {['months', 'quarters', 'years'].map(mode => (
                <button
                  key={mode}
                  onClick={() => setViewMode(mode)}
                  className={`px-3 py-1 text-sm ${
                    viewMode === mode 
                      ? 'bg-blue-500 text-white' 
                      : 'bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {mode.charAt(0).toUpperCase() + mode.slice(1)}
                </button>
              ))}
            </div>
          </div>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={showEmptyRows}
              onChange={(e) => setShowEmptyRows(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Show empty rows</span>
          </label>

          <div className="flex items-center space-x-2">
            <button
              onClick={toggleAllPersons}
              className="text-sm text-blue-600 hover:text-blue-800"
            >
              {selectedPersons.size === uniquePersons.length ? 'Deselect All' : 'Select All'}
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 text-xs">
          <span className="font-medium text-gray-700">FTE Legend:</span>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-blue-200 rounded"></div>
            <span>&lt;25%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-green-200 rounded"></div>
            <span>25-49%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-yellow-200 rounded"></div>
            <span>50-74%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-orange-200 rounded"></div>
            <span>75-99%</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 bg-red-200 rounded"></div>
            <span>100%+</span>
          </div>
          <div className="flex items-center space-x-1">
            <span className="text-blue-600">●</span>
            <span>Custom FTE</span>
          </div>
          <div className="flex items-center space-x-1">
            <AlertTriangle size={12} className="text-orange-600" />
            <span>Multiple allocations</span>
          </div>
        </div>
      </div>

      {/* Timeline Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead className="bg-gray-50">
            <tr>
              <th className="sticky left-0 bg-gray-50 border-b border-r px-4 py-3 text-left font-medium text-gray-700 min-w-[200px]">
                <input
                  type="checkbox"
                  checked={selectedPersons.size === uniquePersons.length}
                  onChange={toggleAllPersons}
                  className="mr-2"
                />
                Team Member
              </th>
              {timePeriods.map(period => (
                <th key={period.key} className="border-b px-2 py-3 text-center font-medium text-gray-700 min-w-[80px]">
                  <div>{period.label}</div>
                </th>
              ))}
              <th className="border-b px-4 py-3 text-center font-medium text-gray-700">
                Total Hours
              </th>
            </tr>
          </thead>
          <tbody>
            {filteredPersons.length === 0 ? (
              <tr>
                <td 
                  colSpan={timePeriods.length + 2} 
                  className="px-4 py-8 text-center text-gray-500"
                >
                  <Users size={32} className="mx-auto mb-2 text-gray-300" />
                  <p>No timeline data available</p>
                </td>
              </tr>
            ) : (
              filteredPersons.map(personName => {
                const personData = timelineData[personName];
                const totalHours = utils.getPersonTotalHours ? utils.getPersonTotalHours(rfq, personName) : 0;
                const hasOverlaps = utils.hasOverlappingAllocations ? 
                  utils.hasOverlappingAllocations(personData.allocations) : false;
                const isSelected = selectedPersons.has(personName);

                return (
                  <tr 
                    key={personName} 
                    className={`hover:bg-gray-50 ${hasOverlaps ? 'bg-red-50' : ''} ${isSelected ? 'bg-blue-50' : ''}`}
                  >
                    <td className="sticky left-0 bg-white border-b border-r px-4 py-3">
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handlePersonToggle(personName)}
                          className="mr-2"
                        />
                        <div>
                          <div className="font-medium">{personName}</div>
                          <div className="text-xs text-gray-500 mt-1">
                            {personData.allocations.length} period{personData.allocations.length !== 1 ? 's' : ''}
                          </div>
                          {hasOverlaps && (
                            <div className="text-xs text-red-600 mt-1 flex items-center">
                              <AlertTriangle size={12} className="mr-1" />
                              Overlapping periods
                            </div>
                          )}
                        </div>
                      </div>
                    </td>

                    {timePeriods.map(period => {
                      const periodData = personData.periods[period.key];
                      const { totalFTE, hasOverlap, hasCustomFTE, allocations } = periodData;

                      if (totalFTE === 0) {
                        return (
                          <td key={period.key} className="border-b px-1 py-1 text-center">
                            <div className="text-gray-300">-</div>
                          </td>
                        );
                      }

                      return (
                        <td key={period.key} className="border-b px-1 py-1 text-center">
                          <div
                            className={`cursor-pointer rounded px-2 py-1 text-xs font-medium transition-all hover:shadow-md relative ${
                              hasCustomFTE ? 'ring-2 ring-blue-300 ' : ''
                            } ${
                              hasOverlap ? 'ring-2 ring-orange-400 ' : ''
                            } ${getCellColor(totalFTE)}`}
                            onClick={() => onEditFTE && onEditFTE(personName, period.key, allocations)}
                            title={`${personName} - ${period.label}\nTotal FTE: ${totalFTE}%\nAllocations: ${allocations.length}\n${hasCustomFTE ? 'Custom FTE set' : 'Default FTE'}\nClick to edit`}
                          >
                            <div>{totalFTE}%</div>
                            {hasCustomFTE && <div className="text-xs">●</div>}
                            {hasOverlap && <div className="text-xs">×{allocations.length}</div>}
                          </div>
                        </td>
                      );
                    })}

                    <td className="border-b px-4 py-3 text-center font-medium">
                      {totalHours}h
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Summary */}
      {filteredPersons.length > 0 && (
        <div className="p-4 bg-gray-50 border-t">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">Active Resources:</span>
              <span className="ml-2 font-medium">{filteredPersons.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Time Periods:</span>
              <span className="ml-2 font-medium">{timePeriods.length}</span>
            </div>
            <div>
              <span className="text-gray-600">Total Allocations:</span>
              <span className="ml-2 font-medium">{rfq.allocations?.length || 0}</span>
            </div>
            <div>
              <span className="text-gray-600">Project Duration:</span>
              <span className="ml-2 font-medium">
                {rfq.createdDate && rfq.deadline ? 
                  Math.ceil((new Date(rfq.deadline) - new Date(rfq.createdDate)) / (1000 * 60 * 60 * 24 * 30)) 
                  : 0} months
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TimelineTable;