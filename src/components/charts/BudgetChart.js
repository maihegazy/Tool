'use client';

import React, { useState } from 'react';
import { DollarSign, TrendingUp, PieChart, BarChart3, AlertTriangle, CheckCircle } from 'lucide-react';

const BudgetChart = ({ rfqs, utils, engineerRates, className = '' }) => {
  const [chartType, setChartType] = useState('overview');
  const [selectedRfq, setSelectedRfq] = useState('all');

  // Calculate budget data
  const calculateBudgetData = () => {
    const budgetData = {
      totalBudget: 0,
      totalCost: 0,
      rfqBreakdown: [],
      locationBreakdown: { HCC: 0, BCC: 0, MCC: 0 },
      levelBreakdown: {},
      monthlyBreakdown: {},
      overBudgetRfqs: [],
      profitMargins: []
    };

    rfqs.forEach(rfq => {
      const cost = utils.calculateRfqCost(rfq, engineerRates);
      const budget = rfq.budget || cost * 1.2; // Default 20% margin if no budget set
      const profit = budget - cost;
      const margin = budget > 0 ? (profit / budget) * 100 : 0;

      budgetData.totalBudget += budget;
      budgetData.totalCost += cost;

      budgetData.rfqBreakdown.push({
        id: rfq.id,
        name: rfq.name,
        budget,
        cost,
        profit,
        margin,
        hours: utils.calculateTotalHours(rfq),
        isOverBudget: cost > budget
      });

      if (cost > budget) {
        budgetData.overBudgetRfqs.push(rfq);
      }

      budgetData.profitMargins.push({ name: rfq.name, margin, profit });

      // Location breakdown
      rfq.allocations.forEach(allocation => {
        const allocationCost = utils.calculateAllocationHours(allocation) * 
          (engineerRates[allocation.level]?.[allocation.location] || 0);
        budgetData.locationBreakdown[allocation.location] += allocationCost;

        // Level breakdown
        if (!budgetData.levelBreakdown[allocation.level]) {
          budgetData.levelBreakdown[allocation.level] = 0;
        }
        budgetData.levelBreakdown[allocation.level] += allocationCost;

        // Monthly breakdown (simplified)
        const months = utils.generateMonthsRange(allocation.startDate, allocation.endDate);
        months.forEach(month => {
          const monthKey = `${month.year}-${String(month.month + 1).padStart(2, '0')}`;
          if (!budgetData.monthlyBreakdown[monthKey]) {
            budgetData.monthlyBreakdown[monthKey] = 0;
          }
          budgetData.monthlyBreakdown[monthKey] += allocationCost / months.length;
        });
      });
    });

    return budgetData;
  };

  const budgetData = calculateBudgetData();

  // Simple Bar Chart Component
  const BarChart = ({ data, title, colorClass = 'bg-blue-500', formatValue = (v) => `€${Math.round(v).toLocaleString()}` }) => {
    const maxValue = Math.max(...Object.values(data));
    
    return (
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-medium text-gray-800 mb-4">{title}</h4>
        <div className="space-y-3">
          {Object.entries(data)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 8)
            .map(([key, value]) => (
            <div key={key} className="flex items-center">
              <div className="w-28 text-sm text-gray-600 truncate" title={key}>{key}</div>
              <div className="flex-1 mx-3 bg-gray-200 rounded-full h-6 relative">
                <div
                  className={`h-6 rounded-full ${colorClass}`}
                  style={{ width: `${(value / maxValue) * 100}%` }}
                />
                <span className="absolute right-2 top-0 text-xs text-white font-medium leading-6">
                  {formatValue(value)}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Budget Overview Cards
  const BudgetOverview = () => (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Budget</p>
            <p className="text-2xl font-bold text-blue-600">
              €{Math.round(budgetData.totalBudget).toLocaleString()}
            </p>
          </div>
          <DollarSign className="text-blue-500" size={32} />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          Across {rfqs.length} active RFQs
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Total Cost</p>
            <p className="text-2xl font-bold text-green-600">
              €{Math.round(budgetData.totalCost).toLocaleString()}
            </p>
          </div>
          <TrendingUp className="text-green-500" size={32} />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {((budgetData.totalCost / budgetData.totalBudget) * 100).toFixed(1)}% of budget used
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Profit Margin</p>
            <p className={`text-2xl font-bold ${
              budgetData.totalBudget - budgetData.totalCost >= 0 ? 'text-green-600' : 'text-red-600'
            }`}>
              €{Math.round(budgetData.totalBudget - budgetData.totalCost).toLocaleString()}
            </p>
          </div>
          {budgetData.totalBudget - budgetData.totalCost >= 0 ? (
            <CheckCircle className="text-green-500" size={32} />
          ) : (
            <AlertTriangle className="text-red-500" size={32} />
          )}
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {(((budgetData.totalBudget - budgetData.totalCost) / budgetData.totalBudget) * 100).toFixed(1)}% margin
        </p>
      </div>

      <div className="bg-white p-6 rounded-lg border">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-600">Over Budget</p>
            <p className="text-2xl font-bold text-red-600">
              {budgetData.overBudgetRfqs.length}
            </p>
          </div>
          <AlertTriangle className="text-red-500" size={32} />
        </div>
        <p className="text-xs text-gray-500 mt-2">
          {((budgetData.overBudgetRfqs.length / rfqs.length) * 100).toFixed(1)}% of projects
        </p>
      </div>
    </div>
  );

  // RFQ Budget Table
  const RfqBudgetTable = () => (
    <div className="bg-white p-4 rounded-lg border">
      <h4 className="font-medium text-gray-800 mb-4">RFQ Budget Analysis</h4>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b">
              <th className="text-left py-2">RFQ Name</th>
              <th className="text-right py-2">Budget</th>
              <th className="text-right py-2">Cost</th>
              <th className="text-right py-2">Profit</th>
              <th className="text-right py-2">Margin</th>
              <th className="text-center py-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {budgetData.rfqBreakdown
              .sort((a, b) => b.cost - a.cost)
              .map(rfq => (
                <tr key={rfq.id} className="border-b hover:bg-gray-50">
                  <td className="py-2 font-medium truncate max-w-xs" title={rfq.name}>
                    {rfq.name}
                  </td>
                  <td className="py-2 text-right">€{Math.round(rfq.budget).toLocaleString()}</td>
                  <td className="py-2 text-right">€{Math.round(rfq.cost).toLocaleString()}</td>
                  <td className={`py-2 text-right font-medium ${
                    rfq.profit >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    €{Math.round(rfq.profit).toLocaleString()}
                  </td>
                  <td className={`py-2 text-right ${
                    rfq.margin >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {rfq.margin.toFixed(1)}%
                  </td>
                  <td className="py-2 text-center">
                    {rfq.isOverBudget ? (
                      <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">
                        Over Budget
                      </span>
                    ) : (
                      <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">
                        On Track
                      </span>
                    )}
                  </td>
                </tr>
              ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  // Monthly Budget Trend
  const MonthlyTrend = () => {
    const monthlyData = budgetData.monthlyBreakdown;
    const maxValue = Math.max(...Object.values(monthlyData));

    return (
      <div className="bg-white p-4 rounded-lg border">
        <h4 className="font-medium text-gray-800 mb-4">Monthly Budget Trend</h4>
        <div className="flex items-end space-x-2 h-40">
          {Object.entries(monthlyData)
            .sort(([a], [b]) => a.localeCompare(b))
            .slice(-12)
            .map(([month, value]) => (
            <div key={month} className="flex-1 flex flex-col items-center">
              <div className="w-full bg-gray-200 rounded-t relative" style={{ height: '120px' }}>
                <div
                  className="bg-blue-500 rounded-t absolute bottom-0 w-full"
                  style={{ height: `${(value / maxValue) * 100}%` }}
                />
              </div>
              <div className="text-xs text-gray-600 mt-2 transform rotate-45 origin-bottom-left">
                {month}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Chart Controls */}
      <div className="bg-white p-4 rounded-lg border">
        <div className="flex flex-wrap gap-4 items-center justify-between">
          <div className="flex items-center space-x-4">
            <h3 className="text-lg font-semibold flex items-center">
              <DollarSign className="mr-2" size={20} />
              Budget Analysis
            </h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setChartType('overview')}
                className={`px-3 py-1 rounded text-sm ${
                  chartType === 'overview' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Overview
              </button>
              <button
                onClick={() => setChartType('breakdown')}
                className={`px-3 py-1 rounded text-sm ${
                  chartType === 'breakdown' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Breakdown
              </button>
              <button
                onClick={() => setChartType('trends')}
                className={`px-3 py-1 rounded text-sm ${
                  chartType === 'trends' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                Trends
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <select
              value={selectedRfq}
              onChange={(e) => setSelectedRfq(e.target.value)}
              className="border border-gray-300 rounded px-2 py-1 text-sm"
            >
              <option value="all">All RFQs</option>
              {rfqs.map(rfq => (
                <option key={rfq.id} value={rfq.id}>{rfq.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Chart Content */}
      {chartType === 'overview' && (
        <div className="space-y-6">
          <BudgetOverview />
          <RfqBudgetTable />
        </div>
      )}

      {chartType === 'breakdown' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <BarChart 
            data={budgetData.locationBreakdown} 
            title="Budget by Location"
            colorClass="bg-green-500"
          />
          <BarChart 
            data={budgetData.levelBreakdown} 
            title="Budget by Engineer Level"
            colorClass="bg-purple-500"
          />
        </div>
      )}

      {chartType === 'trends' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <MonthlyTrend />
          <div className="bg-white p-4 rounded-lg border">
            <h4 className="font-medium text-gray-800 mb-4">Budget Health Indicators</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg">
                <span className="text-sm font-medium text-green-800">Projects on Budget</span>
                <span className="text-lg font-bold text-green-600">
                  {rfqs.length - budgetData.overBudgetRfqs.length}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
                <span className="text-sm font-medium text-red-800">Projects over Budget</span>
                <span className="text-lg font-bold text-red-600">
                  {budgetData.overBudgetRfqs.length}
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-blue-50 rounded-lg">
                <span className="text-sm font-medium text-blue-800">Average Margin</span>
                <span className="text-lg font-bold text-blue-600">
                  {budgetData.rfqBreakdown.length > 0 
                    ? (budgetData.rfqBreakdown.reduce((sum, r) => sum + r.margin, 0) / budgetData.rfqBreakdown.length).toFixed(1)
                    : 0}%
                </span>
              </div>
              <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg">
                <span className="text-sm font-medium text-yellow-800">Budget Utilization</span>
                <span className="text-lg font-bold text-yellow-600">
                  {((budgetData.totalCost / budgetData.totalBudget) * 100).toFixed(1)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BudgetChart;