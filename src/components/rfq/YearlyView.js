// =============================================================================
// COMPONENT: YearlyView.js
// =============================================================================

'use client';

import React, { useState, useMemo } from 'react';
import { BarChart3, TrendingUp, Users, Calendar, AlertCircle, PieChart } from 'lucide-react';

const YearlyView = ({ rfq }) => {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [viewType, setViewType] = useState('utilization'); // 'utilization', 'capacity', 'cost'
  const [selectedMetric, setSelectedMetric] = useState('hours'); // 'hours', 'fte', 'cost'

  // Generate yearly data
  const yearlyData = useMemo(() => {
    if (!rfq.allocations || rfq.allocations.length === 0) return null;

    const startDate = new Date(rfq.createdDate);
    const endDate = new Date(rfq.deadline);
    
    // Get all years in the project timeline
    const years = [];
    for (let year = startDate.getFullYear(); year <= endDate.getFullYear(); year++) {
      years.push(year);
    }

    // Generate monthly data for selected year
    const monthlyData = [];
    for (let month = 0; month < 12; month++) {
      const monthStart = new Date(selectedYear, month, 1);
      const monthEnd = new Date(selectedYear, month + 1, 0);
      
      const monthData = {
        month: monthStart.toLocaleDateString('en-US', { month: 'short' }),
        monthIndex: month,
        fullMonth: monthStart.toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
        allocations: [],
        totalHours: 0,
        totalFTE: 0,
        totalCost: 0,
        uniquePersons: new Set(),
        roleDistribution: {},
        levelDistribution: {},
        locationDistribution: {}
      };

      // Process allocations that overlap with this month
      rfq.allocations.forEach(allocation => {
        const allocStart = new Date(allocation.startDate);
        const allocEnd = new Date(allocation.endDate);
        
        // Check if allocation overlaps with this month
        if (allocStart <= monthEnd && allocEnd >= monthStart) {
          // Calculate overlap period
          const overlapStart = new Date(Math.max(allocStart, monthStart));
          const overlapEnd = new Date(Math.min(allocEnd, monthEnd));
          
          // Calculate working days in overlap period
          const overlapDays = Math.max(1, Math.ceil((overlapEnd - overlapStart) / (1000 * 60 * 60 * 24)));
          const workingDays = Math.min(overlapDays, 22); // Assume 22 working days per month
          
          // Calculate hours for this month
          const monthHours = workingDays * 8 * (allocation.ftePercentage / 100);
          const monthFTE = allocation.ftePercentage / 100;
          
          monthData.allocations.push({
            ...allocation,
            monthHours,
            monthFTE,
            overlapDays,
            workingDays
          });
          
          monthData.totalHours += monthHours;
          monthData.totalFTE += monthFTE;
          monthData.uniquePersons.add(allocation.name);
          
          // Role distribution
          if (!monthData.roleDistribution[allocation.role]) {
            monthData.roleDistribution[allocation.role] = { hours: 0, count: 0 };
          }
          monthData.roleDistribution[allocation.role].hours += monthHours;
          monthData.roleDistribution[allocation.role].count += 1;
          
          // Level distribution
          if (!monthData.levelDistribution[allocation.level]) {
            monthData.levelDistribution[allocation.level] = { hours: 0, count: 0 };
          }
          monthData.levelDistribution[allocation.level].hours += monthHours;
          monthData.levelDistribution[allocation.level].count += 1;
          
          // Location distribution
          if (!monthData.locationDistribution[allocation.location]) {
            monthData.locationDistribution[allocation.location] = { hours: 0, count: 0 };
          }
          monthData.locationDistribution[allocation.location].hours += monthHours;
          monthData.locationDistribution[allocation.location].count += 1;
        }
      });

      monthData.uniquePersons = Array.from(monthData.uniquePersons);
      monthlyData.push(monthData);
    }

    return { years, monthlyData };
  }, [rfq, selectedYear]);

  // Calculate capacity metrics
  const capacityMetrics = useMemo(() => {
    if (!yearlyData) return null;

    const { monthlyData } = yearlyData;
    
    // Calculate peak and average utilization
    const peakMonth = monthlyData.reduce((max, month) => 
      month.totalHours > max.totalHours ? month : max
    );
    
    const avgHours = monthlyData.reduce((sum, month) => sum + month.totalHours, 0) / 12;
    const avgFTE = monthlyData.reduce((sum, month) => sum + month.totalFTE, 0) / 12;
    
    // Calculate quarterly data
    const quarters = [
      { name: 'Q1', months: [0, 1, 2] },
      { name: 'Q2', months: [3, 4, 5] },
      { name: 'Q3', months: [6, 7, 8] },
      { name: 'Q4', months: [9, 10, 11] }
    ];
    
    const quarterlyData = quarters.map(quarter => {
      const quarterHours = quarter.months.reduce((sum, monthIndex) => 
        sum + monthlyData[monthIndex].totalHours, 0
      );
      const quarterFTE = quarter.months.reduce((sum, monthIndex) => 
        sum + monthlyData[monthIndex].totalFTE, 0
      ) / 3; // Average FTE for quarter
      
      return {
        ...quarter,
        hours: quarterHours,
        fte: quarterFTE
      };
    });

    return {
      peakMonth,
      avgHours,
      avgFTE,
      quarterlyData,
      totalYearHours: monthlyData.reduce((sum, month) => sum + month.totalHours, 0)
    };
  }, [yearlyData]);

  // Get chart data based on selected metric
  const getChartData = () => {
    if (!yearlyData) return [];
    
    return yearlyData.monthlyData.map(month => ({
      month: month.month,
      value: selectedMetric === 'hours' ? month.totalHours : 
             selectedMetric === 'fte' ? month.totalFTE : 
             month.totalCost,
      persons: month.uniquePersons.length,
      allocations: month.allocations.length
    }));
  };

  // Get max value for chart scaling
  const getMaxValue = () => {
    const data = getChartData();
    return Math.max(...data.map(d => d.value));
  };

  // Render utilization chart
  const UtilizationChart = () => {
    const data = getChartData();
    const maxValue = getMaxValue();
    
    return (
      <div className="bg-white p-4 rounded-lg">
        <h4 className="font-medium mb-4">
          Monthly {selectedMetric === 'hours' ? 'Hours' : selectedMetric === 'fte' ? 'FTE' : 'Cost'} Distribution
        </h4>
        <div className="flex items-end space-x-2" style={{ height: '200px' }}>
          {data.map((item, index) => {
            const height = maxValue > 0 ? (item.value / maxValue) * 180 : 0;
            return (
              <div key={index} className="flex-1 flex flex-col items-center">
                <div
                  className="bg-blue-500 hover:bg-blue-600 transition-colors rounded-t cursor-pointer relative group"
                  style={{ height: `${height}px`, minHeight: item.value > 0 ? '4px' : '0' }}
                  title={`${item.month}: ${item.value.toFixed(1)} ${selectedMetric === 'hours' ? 'hours' : selectedMetric === 'fte' ? 'FTE' : '€'}`}
                >
                  {/* Tooltip */}
                  <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-800 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                    {item.month}<br/>
                    {selectedMetric === 'hours' ? `${item.value.toFixed(0)}h` : 
                     selectedMetric === 'fte' ? `${item.value.toFixed(1)} FTE` : 
                     `€${item.value.toFixed(0)}`}<br/>
                    {item.persons} people
                  </div>
                </div>
                <div className="text-xs text-gray-600 mt-1">{item.month}</div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  // Render capacity planning view
  const CapacityView = () => {
    if (!capacityMetrics) return null;

    return (
      <div className="space-y-6">
        {/* Quarterly Summary */}
        <div className="bg-white p-4 rounded-lg">
          <h4 className="font-medium mb-4">Quarterly Resource Summary</h4>
          <div className="grid grid-cols-4 gap-4">
            {capacityMetrics.quarterlyData.map((quarter, index) => (
              <div key={quarter.name} className="text-center">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h5 className="font-medium text-gray-700">{quarter.name}</h5>
                  <p className="text-2xl font-bold text-blue-600">{quarter.hours.toFixed(0)}h</p>
                  <p className="text-sm text-gray-600">{quarter.fte.toFixed(1)} avg FTE</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Capacity Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <h4 className="font-medium text-blue-800">Peak Utilization</h4>
            <p className="text-2xl font-bold text-blue-600">{capacityMetrics.peakMonth.totalHours.toFixed(0)}h</p>
            <p className="text-sm text-blue-600">in {capacityMetrics.peakMonth.fullMonth}</p>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <h4 className="font-medium text-green-800">Average Monthly</h4>
            <p className="text-2xl font-bold text-green-600">{capacityMetrics.avgHours.toFixed(0)}h</p>
            <p className="text-sm text-green-600">{capacityMetrics.avgFTE.toFixed(1)} FTE average</p>
          </div>
          
          <div className="bg-purple-50 p-4 rounded-lg">
            <h4 className="font-medium text-purple-800">Total Year</h4>
            <p className="text-2xl font-bold text-purple-600">{capacityMetrics.totalYearHours.toFixed(0)}h</p>
            <p className="text-sm text-purple-600">across all resources</p>
          </div>
        </div>
      </div>
    );
  };

  // Render role distribution
  const RoleDistribution = () => {
    if (!yearlyData) return null;

    // Aggregate role data across all months
    const roleData = {};
    yearlyData.monthlyData.forEach(month => {
      Object.entries(month.roleDistribution).forEach(([role, data]) => {
        if (!roleData[role]) {
          roleData[role] = { hours: 0, count: 0 };
        }
        roleData[role].hours += data.hours;
        roleData[role].count += data.count;
      });
    });

    const totalHours = Object.values(roleData).reduce((sum, data) => sum + data.hours, 0);

    return (
      <div className="bg-white p-4 rounded-lg">
        <h4 className="font-medium mb-4">Role Distribution</h4>
        <div className="space-y-3">
          {Object.entries(roleData)
            .sort(([,a], [,b]) => b.hours - a.hours)
            .map(([role, data]) => {
              const percentage = totalHours > 0 ? (data.hours / totalHours) * 100 : 0;
              return (
                <div key={role} className="flex items-center">
                  <div className="w-32 text-sm text-gray-600">{role}</div>
                  <div className="flex-1 mx-4">
                    <div className="bg-gray-200 rounded-full h-4 relative">
                      <div
                        className="bg-blue-500 h-4 rounded-full transition-all duration-300"
                        style={{ width: `${percentage}%` }}
                      />
                      <div className="absolute inset-0 flex items-center justify-center text-xs text-white font-medium">
                        {percentage.toFixed(0)}%
                      </div>
                    </div>
                  </div>
                  <div className="w-20 text-sm text-gray-600 text-right">
                    {data.hours.toFixed(0)}h
                  </div>
                </div>
              );
            })}
        </div>
      </div>
    );
  };

  if (!yearlyData) {
    return (
      <div className="mt-6 bg-white rounded-lg shadow-md p-6">
        <h3 className="text-lg font-semibold mb-4">Yearly Resource View</h3>
        <div className="text-center py-8 text-gray-500">
          <BarChart3 size={48} className="mx-auto mb-4" />
          <p>No allocations to display in yearly view.</p>
          <p className="text-sm mt-2">Add team members to see yearly resource analytics.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6 bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold">Yearly Resource View</h3>
        
        {/* Controls */}
        <div className="flex space-x-4">
          {/* Year Selection */}
          <select
            value={selectedYear}
            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          >
            {yearlyData.years.map(year => (
              <option key={year} value={year}>{year}</option>
            ))}
          </select>

          {/* Metric Selection */}
          <select
            value={selectedMetric}
            onChange={(e) => setSelectedMetric(e.target.value)}
            className="border border-gray-300 rounded px-3 py-2 text-sm"
          >
            <option value="hours">Hours</option>
            <option value="fte">FTE</option>
          </select>

          {/* View Type Toggle */}
          <div className="flex border border-gray-300 rounded overflow-hidden">
            <button
              onClick={() => setViewType('utilization')}
              className={`px-3 py-2 text-sm ${
                viewType === 'utilization' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Utilization
            </button>
            <button
              onClick={() => setViewType('capacity')}
              className={`px-3 py-2 text-sm ${
                viewType === 'capacity' 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-white text-gray-700 hover:bg-gray-50'
              }`}
            >
              Capacity
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="space-y-6">
        {/* Utilization Chart */}
        <UtilizationChart />

        {/* Conditional Views */}
        {viewType === 'capacity' && <CapacityView />}

        {/* Role Distribution */}
        <RoleDistribution />

        {/* Monthly Details Table */}
        <div className="bg-white rounded-lg">
          <h4 className="font-medium mb-4">Monthly Breakdown</h4>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-3 py-2 text-left">Month</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">Total Hours</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">Avg FTE</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">People</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">Allocations</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">Top Role</th>
                </tr>
              </thead>
              <tbody>
                {yearlyData.monthlyData.map((month, index) => {
                  const topRole = Object.entries(month.roleDistribution)
                    .sort(([,a], [,b]) => b.hours - a.hours)[0];
                  
                  return (
                    <tr key={index} className="hover:bg-gray-50">
                      <td className="border border-gray-200 px-3 py-2 font-medium">{month.fullMonth}</td>
                      <td className="border border-gray-200 px-3 py-2">{month.totalHours.toFixed(0)}h</td>
                      <td className="border border-gray-200 px-3 py-2">{month.totalFTE.toFixed(1)}</td>
                      <td className="border border-gray-200 px-3 py-2">{month.uniquePersons.length}</td>
                      <td className="border border-gray-200 px-3 py-2">{month.allocations.length}</td>
                      <td className="border border-gray-200 px-3 py-2">
                        {topRole ? `${topRole[0]} (${topRole[1].hours.toFixed(0)}h)` : '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default YearlyView;