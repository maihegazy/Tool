'use client';


import React, { useState } from 'react';
import { BarChart3, PieChart, Users, TrendingUp, Calendar } from 'lucide-react';

const ResourceChart = ({ rfqs, utils, engineerRates, className = '' }) => {
  const [chartType, setChartType] = useState('utilization');
  const [selectedPeriod, setSelectedPeriod] = useState('current');

  // Calculate resource utilization data
  const calculateResourceUtilization = () => {
    const utilization = {};
    const locationStats = { HCC: 0, BCC: 0, MCC: 0 };
    const levelStats = {};
    const roleStats = {};

    rfqs.forEach(rfq => {
      const persons = utils.getUniquePersons(rfq);
      
      persons.forEach(person => {
        const personAllocations = rfq.allocations.filter(a => a.name === person);
        const totalHours = personAllocations.reduce((sum, allocation) => 
          sum + utils.calculateAllocationHours(allocation), 0
        );

        if (!utilization[person]) {
          utilization[person] = {
            name: person,
            totalHours: 0,
            projects: new Set(),
            locations: new Set(),
            levels: new Set(),
            roles: new Set()
          };
        }

        utilization[person].totalHours += totalHours;
        utilization[person].projects.add(rfq.name);

        personAllocations.forEach(allocation => {
          utilization[person].locations.add(allocation.location);
          utilization[person].levels.add(allocation.level);
          utilization[person].roles.add(allocation.role);

          // Update location stats
          locationStats[allocation.location] += utils.calculateAllocationHours(allocation);

          // Update level stats
          if (!levelStats[allocation.level]) levelStats[allocation.level] = 0;
          levelStats[allocation.level] += utils.calculateAllocationHours(allocation);

          // Update role stats
          if (!roleStats[allocation.role]) roleStats[allocation.role] = 0;
          roleStats[allocation.role] += utils.calculateAllocationHours(allocation);
        });
      });
    });

    return {
      utilization: Object.values(utilization),
      locationStats,
      levelStats,
      roleStats
    };
  };

  const resourceData = calculateResourceUtilization();

  // Simple Bar Chart Component
  const BarChart = ({ data, title, colorClass = 'bg-blue-500' }) => {
    const maxValue = Math.max(...Object.values(data));
    
    return (
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-medium text-gray-800 mb-4">{title}</h4>
        <div className="space-y-3">
          {Object.entries(data)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 10)
            .map(([key, value]) => (
            <div key={key} className="flex items-center">
              <div className="w-24 text-sm text-gray-600 truncate">{key}</div>
              <div className="flex-1 mx-3 bg-gray-200 rounded-full h-4 relative">
                <div
                  className={`h-4 rounded-full ${colorClass}`}
                  style={{ width: `${(value / maxValue) * 100}%` }}
                />
                <span className="absolute right-2 top-0 text-xs text-white font-medium leading-4">
                  {Math.round(value)}h
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Simple Pie Chart Component
  const PieChart = ({ data, title }) => {
    const total = Object.values(data).reduce((sum, val) => sum + val, 0);
    const colors = [
      'bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-red-500', 
      'bg-purple-500', 'bg-pink-500', 'bg-indigo-500', 'bg-gray-500'
    ];

    let cumulativePercentage = 0;

    return (
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-medium text-gray-800 mb-4">{title}</h4>
        <div className="flex items-center justify-center mb-4">
          <div className="relative w-40 h-40">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
              <circle
                cx="50"
                cy="50"
                r="40"
                fill="none"
                stroke="#f3f4f6"
                strokeWidth="8"
              />
              {Object.entries(data).map(([key, value], index) => {
                const percentage = (value / total) * 100;
                const strokeDasharray = `${percentage * 2.51} 251`;
                const strokeDashoffset = -cumulativePercentage * 2.51;
                cumulativePercentage += percentage;

                return (
                  <circle
                    key={key}
                    cx="50"
                    cy="50"
                    r="40"
                    fill="none"
                    stroke={colors[index % colors.length].replace('bg-', '#')}
                    strokeWidth="8"
                    strokeDasharray={strokeDasharray}
                    strokeDashoffset={strokeDashoffset}
                    className="transition-all duration-300"
                  />
                );
              })}
            </svg>
          </div>
        </div>
        <div className="space-y-2">
          {Object.entries(data)
            .sort(([,a], [,b]) => b - a)
            .map(([key, value], index) => (
            <div key={key} className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-2 ${colors[index % colors.length]}`} />
                <span className="text-gray-600">{key}</span>
              </div>
              <span className="font-medium">{Math.round((value / total) * 100)}%</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Resource Utilization Table
  const UtilizationTable = () => (
    <div className="bg-white p-4 rounded-lg border">
      <h4 className="font-medium text-gray-800 mb-4">Resource Utilization</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">Engineer</th>
              <th className="text-left py-2">Total Hours</th>
              <th className="text-left py-2">Projects</th>
              <th className="text-left py-2">Utilization</th>
            </tr>
          </thead>
          <tbody>
            {resourceData.utilization
              .sort((a, b) => b.totalHours - a.totalHours)
              .map(person => {
                const utilizationRate = Math.min((person.totalHours / 2080) * 100, 100); // Assuming 2080 hours/year max
                return (
                  <tr key={person.name} className="border-b">
                    <td className="py-2 font-medium">{person.name}</td>
                    <td className="py-2">{person.totalHours}h</td>
                    <td className="py-2">{person.projects.size}</td>
                    <td className="py-2">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div
                            className={`h-2 rounded-full ${
                              utilizationRate > 80 ? 'bg-red-500' :
                              utilizationRate > 60 ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${utilizationRate}%` }}
                          />
                        </div>
                        <span className={`text-xs font-medium ${
                          utilizationRate > 80 ? 'text-red-600' :
                          utilizationRate > 60 ? 'text-yellow-600' : 'text-green-600'
                        }`}>
                          {Math.round(utilizationRate)}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Chart Controls */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold flex items-center">
              <BarChart3 className="mr-2" size={20} />
              Resource Analytics
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setChartType('utilization')}
                className={`px-3 py-1 rounded text-sm ${
                  chartType === 'utilization' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Utilization
              </button>
              <button
                onClick={() => setChartType('distribution')}
                className={`px-3 py-1 rounded text-sm ${
                  chartType === 'distribution' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Distribution
              </button>
              <button
                onClick={() => setChartType('workload')}
                className={`px-3 py-1 rounded text-sm ${
                  chartType === 'workload' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Workload
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <Calendar size={16} className="text-gray-500" />
            <select
              value={selectedPeriod}
              onChange={(e) => setSelectedPeriod(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="current">Current Projects</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
              <option value="all">All Time</option>
            </select>
          </div>
        </div>
      </div>

      {/* Chart Content */}
      {chartType === 'utilization' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <UtilizationTable />
          <BarChart 
            data={resourceData.locationStats} 
            title="Hours by Location"
            colorClass="bg-blue-500"
          />
        </div>
      )}

      {chartType === 'distribution' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <PieChart data={resourceData.locationStats} title="Location Distribution" />
          <PieChart data={resourceData.levelStats} title="Level Distribution" />
          <BarChart 
            data={resourceData.roleStats} 
            title="Hours by Role"
            colorClass="bg-green-500"
          />
        </div>
      )}

      {chartType === 'workload' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChart 
            data={resourceData.levelStats} 
            title="Workload by Level"
            colorClass="bg-purple-500"
          />
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-medium text-gray-800 mb-4">Workload Summary</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <div className="text-2xl font-bold text-blue-600">
                  {resourceData.utilization.length}
                </div>
                <div className="text-sm text-blue-600">Active Engineers</div>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">
                  {resourceData.utilization.reduce((sum, p) => sum + p.totalHours, 0)}
                </div>
                <div className="text-sm text-green-600">Total Hours</div>
              </div>
              <div className="text-center p-4 bg-yellow-50 rounded-lg">
                <div className="text-2xl font-bold text-yellow-600">
                  {Math.round(resourceData.utilization.reduce((sum, p) => sum + p.totalHours, 0) / 
                    resourceData.utilization.length || 0)}
                </div>
                <div className="text-sm text-yellow-600">Avg Hours/Person</div>
              </div>
              <div className="text-center p-4 bg-purple-50 rounded-lg">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(resourceData.locationStats).length}
                </div>
                <div className="text-sm text-purple-600">Active Locations</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Summary Stats */}
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-medium text-gray-800 mb-4">Key Insights</h4>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-sm">
          <div className="flex items-center">
            <Users className="mr-2 text-blue-500" size={16} />
            <span className="text-gray-600">
              Most utilized: {resourceData.utilization.length > 0 ? 
                resourceData.utilization.sort((a, b) => b.totalHours - a.totalHours)[0]?.name : 'N/A'}
            </span>
          </div>
          <div className="flex items-center">
            <TrendingUp className="mr-2 text-green-500" size={16} />
            <span className="text-gray-600">
              Peak location: {Object.entries(resourceData.locationStats)
                .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
            </span>
          </div>
          <div className="flex items-center">
            <BarChart3 className="mr-2 text-purple-500" size={16} />
            <span className="text-gray-600">
              Top level: {Object.entries(resourceData.levelStats)
                .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
            </span>
          </div>
          <div className="flex items-center">
            <PieChart className="mr-2 text-orange-500" size={16} />
            <span className="text-gray-600">
              Main role: {Object.entries(resourceData.roleStats)
                .sort(([,a], [,b]) => b - a)[0]?.[0] || 'N/A'}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResourceChart;