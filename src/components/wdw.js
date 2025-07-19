'use client'; 

import React, { useState, useEffect } from 'react';
import { Plus, Trash2, Edit3, Users, Calculator, FileText, AlertCircle, Settings, LogOut, User, Calendar, Clock, BarChart3, TrendingUp } from 'lucide-react';

const RFQPlanningTool = ({ initialRfqs = [] }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [rfqs, setRfqs] = useState(initialRfqs);
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [isAddingRfq, setIsAddingRfq] = useState(false);
  const [newRfqName, setNewRfqName] = useState('');
  const [showRateSettings, setShowRateSettings] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showYearlyView, setShowYearlyView] = useState(false);
  const [editingAllocation, setEditingAllocation] = useState(null);
  const [showCostProfitAnalysis, setShowCostProfitAnalysis] = useState(false);
  const [showTMSettings, setShowTMSettings] = useState(false);
  const [showWPSettings, setShowWPSettings] = useState(false);
  const [estimatedStoryPoints, setEstimatedStoryPoints] = useState(0);
  const [estimationMethod, setEstimationMethod] = useState('storyPoints');
  const [directTicketCounts, setDirectTicketCounts] = useState({
    small: 0,
    medium: 0,
    large: 0
  });

  // Default hourly rates (in EUR) - can be modified by Delivery Manager
  const [engineerRates, setEngineerRates] = useState({
    'Junior': { HCC: 45, BCC: 35, MCC: 25 },
    'Standard': { HCC: 60, BCC: 50, MCC: 35 },
    'Senior': { HCC: 80, BCC: 65, MCC: 50 },
    'Principal': { HCC: 100, BCC: 80, MCC: 65 },
    'Technical Leader': { HCC: 120, BCC: 95, MCC: 75 },
    'FO': { HCC: 140, BCC: 110, MCC: 85 }
  });

  // Time & Material selling rates
  const [tmSellRates, setTmSellRates] = useState({
    HCC: 120,
    BCC: 95,
    MCC: 75
  });

  // Work Package configuration
  const [wpConfig, setWpConfig] = useState({
    storyPointsToHours: 8,
    hardwareCostPerHour: 5,
    riskFactor: 15,
    tickets: {
      small: { storyPoints: 5, price: 2500, quotePercentage: 25 },
      medium: { storyPoints: 13, price: 6500, quotePercentage: 25 },
      large: { storyPoints: 21, price: 12000, quotePercentage: 50 }
    }
  });

  const engineerLevels = Object.keys(engineerRates);
  const locations = ['HCC', 'BCC', 'MCC'];

  const roles = [
    'Project Manager', 'Defect Manager', 'Technical Lead', 'Test Lead',
    'Architect', 'BSW SW Architect', 'FO', 'Integration Lead', 'Integration',
    'Integrator', 'Software Developer', 'Software Test Engineer (UT, IT)',
    'Software Test Engineer (QT)'
  ];

  const features = [
    'Diagnostics & Degradation', 'Log & Trace', 'Flashing & Coding', 'Life Cycle',
    'Cluster (MCAL, OS)', 'FUSA', 'Cyber Security', 'Network', 'Integration',
    'Architecture', 'Project Management', 'Resident Engineer', 'Other'
  ];

  const ftePercentages = [100, 75, 50, 25];

  // Sample initial data
  useEffect(() => {
    if (rfqs.length === 0) {
      setRfqs([
        {
          id: 1,
          name: 'RFQ-2024-001 - Automotive System',
          status: 'Planning',
          createdDate: '2024-01-15',
          deadline: '2025-06-15',
          allocations: [
            {
              id: 1, level: 'Senior', location: 'HCC', name: 'Max Mueller',
              role: 'Technical Lead', feature: 'Architecture', customFeature: '',
              allocationType: 'Specific Period', ftePercentage: 100,
              startDate: '2024-01-15', endDate: '2024-06-28', monthlyFTE: {}
            },
            {
              id: 2, level: 'Standard', location: 'BCC', name: 'Ahmed Hassan',
              role: 'Software Developer', feature: 'Integration', customFeature: '',
              allocationType: 'Specific Period', ftePercentage: 100,
              startDate: '2024-07-01', endDate: '2025-03-31', monthlyFTE: {}
            },
            {
              id: 3, level: 'Senior', location: 'HCC', name: 'Max Mueller',
              role: 'Project Manager', feature: 'Project Management', customFeature: '',
              allocationType: 'Specific Period', ftePercentage: 50,
              startDate: '2024-03-15', endDate: '2025-06-15', monthlyFTE: {}
            }
          ]
        }
      ]);
    }
  }, [rfqs.length]);

  const handleLogin = (role) => {
    setCurrentUser({ role });
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setSelectedRfq(null);
    setShowRateSettings(false);
    setShowTimeline(false);
    setShowYearlyView(false);
    setShowCostProfitAnalysis(false);
    setShowTMSettings(false);
    setShowWPSettings(false);
  };

  const generateMonthsRange = (startDate, endDate) => {
    const months = [];
    if (!startDate || !endDate) return months;

    const start = new Date(startDate);
    const end = new Date(endDate);
    const current = new Date(start.getFullYear(), start.getMonth(), 1);
    const endMonth = new Date(end.getFullYear(), end.getMonth(), 1);

    while (current <= endMonth) {
      months.push({
        year: current.getFullYear(),
        month: current.getMonth(),
        key: current.getFullYear() + "-" + current.getMonth().toString().padStart(2, '0')
      });
      current.setMonth(current.getMonth() + 1);
    }

    return months;
  };

  const generateYearsRange = (startDate, endDate) => {
    const years = [];
    if (!startDate || !endDate) return years;

    const startYear = new Date(startDate).getFullYear();
    const endYear = new Date(endDate).getFullYear();

    for (let year = startYear; year <= endYear; year++) {
      years.push(year);
    }

    return years;
  };

  const calculateYearlyData = (rfq) => {
    const years = generateYearsRange(rfq.createdDate, rfq.deadline);
    const yearlyData = {};

    years.forEach(year => {
      yearlyData[year] = {
        totalHours: 0,
        totalCost: 0,
        resourceCount: 0,
        locationBreakdown: { HCC: 0, BCC: 0, MCC: 0 },
        levelBreakdown: {},
        featureBreakdown: {},
        personBreakdown: {}
      };

      engineerLevels.forEach(level => {
        yearlyData[year].levelBreakdown[level] = { hours: 0, cost: 0 };
      });
    });

    rfq.allocations.forEach(allocation => {
      const allocationMonths = generateMonthsRange(allocation.startDate, allocation.endDate);

      allocationMonths.forEach(month => {
        const monthFTE = allocation.monthlyFTE[month.key] || allocation.ftePercentage;
        const monthHours = (monthFTE / 100) * 160;
        const rate = engineerRates[allocation.level][allocation.location];
        const monthCost = monthHours * rate;

        if (yearlyData[month.year]) {
          yearlyData[month.year].totalHours += monthHours;
          yearlyData[month.year].totalCost += monthCost;
          yearlyData[month.year].locationBreakdown[allocation.location] += monthHours;
          yearlyData[month.year].levelBreakdown[allocation.level].hours += monthHours;
          yearlyData[month.year].levelBreakdown[allocation.level].cost += monthCost;

          const featureName = allocation.feature === 'Other' ? allocation.customFeature : allocation.feature;
          if (!yearlyData[month.year].featureBreakdown[featureName]) {
            yearlyData[month.year].featureBreakdown[featureName] = { hours: 0, cost: 0 };
          }
          yearlyData[month.year].featureBreakdown[featureName].hours += monthHours;
          yearlyData[month.year].featureBreakdown[featureName].cost += monthCost;

          if (allocation.name) {
            if (!yearlyData[month.year].personBreakdown[allocation.name]) {
              yearlyData[month.year].personBreakdown[allocation.name] = { hours: 0, cost: 0 };
            }
            yearlyData[month.year].personBreakdown[allocation.name].hours += monthHours;
            yearlyData[month.year].personBreakdown[allocation.name].cost += monthCost;
          }
        }
      });
    });

    years.forEach(year => {
      const uniquePersons = new Set();
      rfq.allocations.forEach(allocation => {
        if (allocation.name) {
          const allocationMonths = generateMonthsRange(allocation.startDate, allocation.endDate);
          const hasMonthInYear = allocationMonths.some(month => month.year === year);
          if (hasMonthInYear) {
            uniquePersons.add(allocation.name);
          }
        }
      });
      yearlyData[year].resourceCount = uniquePersons.size;
    });

    return yearlyData;
  };

  const calculateAllocationHours = (allocation) => {
    if (!allocation.startDate || !allocation.endDate) return 0;

    const allocationMonths = generateMonthsRange(allocation.startDate, allocation.endDate);
    let totalHours = 0;

    allocationMonths.forEach(month => {
      const monthFTE = allocation.monthlyFTE[month.key] || allocation.ftePercentage;
      totalHours += (monthFTE / 100) * 160;
    });

    return Math.round(totalHours);
  };

  const addRfq = () => {
    if (newRfqName.trim()) {
      const newRfq = {
        id: Date.now(),
        name: newRfqName,
        status: 'Planning',
        createdDate: new Date().toISOString().split('T')[0],
        deadline: '',
        allocations: []
      };
      setRfqs([...rfqs, newRfq]);
      setNewRfqName('');
      setIsAddingRfq(false);
    }
  };

  const deleteRfq = (id) => {
    setRfqs(rfqs.filter(rfq => rfq.id !== id));
    if (selectedRfq && selectedRfq.id === id) {
      setSelectedRfq(null);
    }
  };

  const updateRfq = (id, updates) => {
    setRfqs(rfqs.map(rfq => rfq.id === id ? { ...rfq, ...updates } : rfq));
    if (selectedRfq && selectedRfq.id === id) {
      setSelectedRfq({ ...selectedRfq, ...updates });
    }
  };

  const addAllocation = (rfqId) => {
    const rfq = rfqs.find(r => r.id === rfqId);
    const newAllocation = {
      id: Date.now(),
      level: 'Standard',
      location: 'HCC',
      name: '',
      role: 'Software Developer',
      feature: 'Integration',
      customFeature: '',
      allocationType: 'Whole Project',
      ftePercentage: 100,
      startDate: rfq.createdDate,
      endDate: rfq.deadline,
      monthlyFTE: {}
    };

    const updatedRfq = rfqs.find(rfq => rfq.id === rfqId);
    const newAllocations = [...updatedRfq.allocations, newAllocation];
    updateRfq(rfqId, { allocations: newAllocations });
  };

  const calculateRfqCost = (rfq) => {
    return rfq.allocations.reduce((total, allocation) => {
      const rate = engineerRates[allocation.level][allocation.location];
      const hours = calculateAllocationHours(allocation);
      return total + (rate * hours);
    }, 0);
  };

  const calculateTotalHours = (rfq) => {
    return rfq.allocations.reduce((total, allocation) => total + calculateAllocationHours(allocation), 0);
  };

  const getPersonAllocations = (rfq, personName) => {
    return rfq.allocations.filter(allocation =>
      allocation.name.toLowerCase() === personName.toLowerCase()
    ).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  };

  const getUniquePersons = (rfq) => {
    const persons = new Set();
    rfq.allocations.forEach(allocation => {
      if (allocation.name.trim()) {
        persons.add(allocation.name.trim());
      }
    });
    return Array.from(persons).sort();
  };

  const getPersonTotalHours = (rfq, personName) => {
    const personAllocations = getPersonAllocations(rfq, personName);
    return personAllocations.reduce((total, allocation) => total + calculateAllocationHours(allocation), 0);
  };

  const hasOverlappingAllocations = (allocations) => {
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

  const getFeatureGroups = (rfq) => {
    const groups = {};
    rfq.allocations.forEach(allocation => {
      const featureName = allocation.feature === 'Other' ? allocation.customFeature : allocation.feature;
      if (!groups[featureName]) {
        groups[featureName] = [];
      }
      groups[featureName].push(allocation);
    });
    return groups;
  };

  const updateRate = (level, location, newRate) => {
    setEngineerRates(prev => ({
      ...prev,
      [level]: {
        ...prev[level],
        [location]: parseFloat(newRate) || 0
      }
    }));
  };

  const updateAllocation = (rfqId, allocationId, updates) => {
    const updatedRfq = rfqs.find(rfq => rfq.id === rfqId);
    const newAllocations = updatedRfq.allocations.map(allocation => {
      if (allocation.id === allocationId) {
        const updated = { ...allocation, ...updates };

        // If allocation type changes to "Whole Project", update dates
        if (updates.allocationType === 'Whole Project') {
          updated.startDate = updatedRfq.createdDate;
          updated.endDate = updatedRfq.deadline;
        }

        return updated;
      }
      return allocation;
    });
    updateRfq(rfqId, { allocations: newAllocations });
  };

  const removeAllocation = (rfqId, allocationId) => {
    const updatedRfq = rfqs.find(rfq => rfq.id === rfqId);
    const newAllocations = updatedRfq.allocations.filter(allocation => allocation.id !== allocationId);
    updateRfq(rfqId, { allocations: newAllocations });
  };

  const updateMonthlyFTE = (rfqId, allocationId, monthKey, fte) => {
    const updatedRfq = rfqs.find(rfq => rfq.id === rfqId);
    const newAllocations = updatedRfq.allocations.map(allocation => {
      if (allocation.id === allocationId) {
        return {
          ...allocation,
          monthlyFTE: {
            ...allocation.monthlyFTE,
            [monthKey]: fte
          }
        };
      }
      return allocation;
    });
    updateRfq(rfqId, { allocations: newAllocations });
  };

  // T&M Revenue Calculation
  const calculateTMRevenue = (rfq) => {
    const locationHours = { HCC: 0, BCC: 0, MCC: 0 };

    rfq.allocations.forEach(allocation => {
      const hours = calculateAllocationHours(allocation);
      locationHours[allocation.location] += hours;
    });

    let totalRevenue = 0;
    Object.entries(locationHours).forEach(([location, hours]) => {
      totalRevenue += hours * tmSellRates[location];
    });

    return {
      totalRevenue,
      locationBreakdown: Object.entries(locationHours).map(([location, hours]) => ({
        location,
        hours,
        sellRate: tmSellRates[location],
        revenue: hours * tmSellRates[location]
      }))
    };
  };

  // Work Package Revenue Calculation  
  const calculateWPRevenue = (rfq, estimatedStoryPoints = 0, directTickets = null) => {
    const totalHours = calculateTotalHours(rfq);
    const hardwareCost = totalHours * wpConfig.hardwareCostPerHour;
    const developmentCost = calculateRfqCost(rfq);
    const totalCost = developmentCost + hardwareCost;
    const riskAdjustedCost = totalCost * (1 + wpConfig.riskFactor / 100);

    // Use risk-adjusted cost as base for quote calculation
    const baseQuote = riskAdjustedCost;

    let ticketCombination;
    let estimatedSP;

    if (directTickets && (directTickets.small > 0 || directTickets.medium > 0 || directTickets.large > 0)) {
      // Direct ticket estimation method
      ticketCombination = {
        small: directTickets.small,
        medium: directTickets.medium,
        large: directTickets.large
      };

      // Calculate total story points from direct ticket counts
      estimatedSP =
        ticketCombination.small * wpConfig.tickets.small.storyPoints +
        ticketCombination.medium * wpConfig.tickets.medium.storyPoints +
        ticketCombination.large * wpConfig.tickets.large.storyPoints;
    } else {
      // Story points estimation method (original)
      estimatedSP = estimatedStoryPoints || Math.ceil(totalHours / wpConfig.storyPointsToHours);
      ticketCombination = calculateOptimalTickets(estimatedSP, null);
    }

    // Calculate quote distribution based on percentages
    const quoteDistribution = {
      small: baseQuote * (wpConfig.tickets.small.quotePercentage / 100),
      medium: baseQuote * (wpConfig.tickets.medium.quotePercentage / 100),
      large: baseQuote * (wpConfig.tickets.large.quotePercentage / 100)
    };

    // Calculate final ticket combination with pricing
    const finalTicketCombination = calculateTicketPricing(ticketCombination, quoteDistribution);

    return {
      estimatedStoryPoints: estimatedSP,
      hardwareCost,
      developmentCost,
      totalCost,
      riskAdjustedCost,
      baseQuote,
      quoteDistribution,
      ticketCombination: finalTicketCombination,
      totalRevenue: finalTicketCombination.totalPrice,
      estimationMethod: directTickets ? 'tickets' : 'storyPoints'
    };
  };

  const calculateOptimalTickets = (storyPoints, quoteDistribution) => {
    // Simple greedy algorithm to find ticket combination
    let remaining = storyPoints;
    const combination = { large: 0, medium: 0, small: 0 };

    // Fill with large tickets first
    combination.large = Math.floor(remaining / wpConfig.tickets.large.storyPoints);
    remaining -= combination.large * wpConfig.tickets.large.storyPoints;

    // Fill with medium tickets
    combination.medium = Math.floor(remaining / wpConfig.tickets.medium.storyPoints);
    remaining -= combination.medium * wpConfig.tickets.medium.storyPoints;

    // Fill remaining with small tickets
    combination.small = Math.ceil(remaining / wpConfig.tickets.small.storyPoints);

    return combination;
  };

  const calculateTicketPricing = (combination, quoteDistribution) => {
    // Calculate individual ticket prices based on quote distribution
    let ticketPrices = {};

    ticketPrices.large = combination.large > 0 ? quoteDistribution.large / combination.large : 0;
    ticketPrices.medium = combination.medium > 0 ? quoteDistribution.medium / combination.medium : 0;
    ticketPrices.small = combination.small > 0 ? quoteDistribution.small / combination.small : 0;

    const totalPrice = quoteDistribution.large + quoteDistribution.medium + quoteDistribution.small;

    const totalSP =
      combination.large * wpConfig.tickets.large.storyPoints +
      combination.medium * wpConfig.tickets.medium.storyPoints +
      combination.small * wpConfig.tickets.small.storyPoints;

    return {
      ...combination,
      ticketPrices,
      quoteDistribution,
      totalPrice,
      totalStoryPoints: totalSP,
      efficiency: totalSP > 0 ? 1 : 0 // Direct planning is always 100% efficient
    };
  };

  const LoginScreen = () => (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="bg-white rounded-lg shadow-lg p-8 w-96">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">RFQ Resource Planning</h1>
          <p className="text-gray-600">Please select your role to continue</p>
        </div>

        <div className="space-y-4">
          <button
            onClick={() => handleLogin('Project Leader')}
            className="w-full bg-blue-500 text-white py-3 px-4 rounded-lg hover:bg-blue-600 flex items-center justify-center"
          >
            <User className="mr-2" size={20} />
            Project Leader
          </button>

          <button
            onClick={() => handleLogin('Delivery Manager')}
            className="w-full bg-green-500 text-white py-3 px-4 rounded-lg hover:bg-green-600 flex items-center justify-center"
          >
            <Settings className="mr-2" size={20} />
            Delivery Manager
          </button>
        </div>

        <div className="mt-8 text-sm text-gray-600">
          <p><strong>Project Leader:</strong> Resource planning and allocation</p>
          <p><strong>Delivery Manager:</strong> Full access including rates and budgets</p>
        </div>
      </div>
    </div>
  );

  const TMSettingsModal = () => (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
      style={{ zIndex: 20000 }}
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          setShowTMSettings(false);
        }
      }}
    >
      <div
        className="bg-white rounded-lg w-full max-w-md shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold">Time & Material Sell Rates</h2>
          <button
            onClick={() => setShowTMSettings(false)}
            className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded transition-colors"
            title="Close"
          >
            <span className="text-xl font-bold">×</span>
          </button>
        </div>

        <div className="p-6">
          <div className="space-y-4">
            {locations.map(location => (
              <div key={location}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {location} Hourly Sell Rate (€/h)
                </label>
                <input
                  type="number"
                  value={tmSellRates[location]}
                  onChange={(e) => setTmSellRates(prev => ({
                    ...prev,
                    [location]: parseFloat(e.target.value) || 0
                  }))}
                  className="w-full border border-gray-300 rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  min="0"
                  step="0.01"
                />
              </div>
            ))}
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowTMSettings(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  const WPSettingsModal = () => {
    const totalQuotePercentage = Object.values(wpConfig.tickets).reduce((sum, ticket) => sum + ticket.quotePercentage, 0);

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" style={{ zIndex: 20000 }}>
        <div className="bg-white rounded-lg p-6 w-4/5 max-w-4xl max-h-[80vh] overflow-y-auto">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold">Work Package Configuration</h2>
            <button
              onClick={() => setShowWPSettings(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              ✕
            </button>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-medium mb-4">General Settings</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Story Points to Hours Multiplier
                  </label>
                  <input
                    type="number"
                    value={wpConfig.storyPointsToHours}
                    onChange={(e) => setWpConfig(prev => ({
                      ...prev,
                      storyPointsToHours: parseFloat(e.target.value) || 1
                    }))}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    min="0.1"
                    step="0.1"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Hardware Cost per Hour (€)
                  </label>
                  <input
                    type="number"
                    value={wpConfig.hardwareCostPerHour}
                    onChange={(e) => setWpConfig(prev => ({
                      ...prev,
                      hardwareCostPerHour: parseFloat(e.target.value) || 0
                    }))}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    min="0"
                    step="0.01"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Risk Factor (%)
                  </label>
                  <input
                    type="number"
                    value={wpConfig.riskFactor}
                    onChange={(e) => setWpConfig(prev => ({
                      ...prev,
                      riskFactor: parseFloat(e.target.value) || 0
                    }))}
                    className="w-full border border-gray-300 rounded px-3 py-2"
                    min="0"
                    max="200"
                    step="0.1"
                  />
                </div>
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-medium">Ticket Configuration</h3>
                <div className="text-blue-600 text-sm">
                  Total Quote: {totalQuotePercentage}%
                </div>
              </div>
              <div className="space-y-4">
                {Object.entries(wpConfig.tickets).map(([size, config]) => (
                  <div key={size} className="border rounded p-3">
                    <h4 className="font-medium text-sm mb-3 capitalize">{size} Tickets</h4>
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Story Points
                        </label>
                        <input
                          type="number"
                          value={config.storyPoints}
                          onChange={(e) => setWpConfig(prev => ({
                            ...prev,
                            tickets: {
                              ...prev.tickets,
                              [size]: {
                                ...prev.tickets[size],
                                storyPoints: parseInt(e.target.value) || 1
                              }
                            }
                          }))}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          min="1"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Base Price (€)
                        </label>
                        <input
                          type="number"
                          value={config.price}
                          onChange={(e) => setWpConfig(prev => ({
                            ...prev,
                            tickets: {
                              ...prev.tickets,
                              [size]: {
                                ...prev.tickets[size],
                                price: parseInt(e.target.value) || 0
                              }
                            }
                          }))}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                          min="0"
                          placeholder="Base price"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-gray-700 mb-1">
                          Quote %
                        </label>
                        <input
                          type="number"
                          value={config.quotePercentage}
                          onChange={(e) => setWpConfig(prev => ({
                            ...prev,
                            tickets: {
                              ...prev.tickets,
                              [size]: {
                                ...prev.tickets[size],
                                quotePercentage: parseFloat(e.target.value) || 0
                              }
                            }
                          }))}
                          className="w-full border border-gray-300 rounded px-2 py-1 text-sm"
                          min="0"
                          max="1000"
                          step="0.1"
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4 p-3 bg-blue-50 rounded">
                <div className="text-sm text-blue-800">
                  <strong>Flexible Quote Percentages:</strong>
                  <br />
                  Set any percentage distribution you want. Total can be above or below 100% to adjust overall pricing strategy.
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button
              onClick={() => setShowWPSettings(false)}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    );
  };

  const CostProfitAnalysisModal = ({ rfq }) => {
    const tmAnalysis = calculateTMRevenue(rfq);
    const wpAnalysis = calculateWPRevenue(rfq, estimatedStoryPoints, estimationMethod === 'tickets' ? directTicketCounts : null);
    const totalCost = calculateRfqCost(rfq);

    const tmProfit = tmAnalysis.totalRevenue - totalCost;
    const wpProfit = wpAnalysis.totalRevenue - wpAnalysis.riskAdjustedCost;

    return (
      <div
        className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4"
        style={{ zIndex: 9999 }}
        onClick={(e) => {
          if (e.target === e.currentTarget) {
            setShowCostProfitAnalysis(false);
          }
        }}
      >
        <div
          className="bg-white rounded-lg w-full max-w-7xl shadow-xl"
          style={{ height: '90vh', maxHeight: '90vh' }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="flex justify-between items-center p-4 md:p-6 border-b border-gray-200 bg-white rounded-t-lg flex-shrink-0">
            <h2 className="text-lg md:text-2xl font-semibold truncate pr-4">
              Cost-Profit Analysis: {rfq.name}
            </h2>
            <div className="flex space-x-2 flex-shrink-0">
              <button
                onClick={() => setShowTMSettings(true)}
                className="px-2 md:px-3 py-1 bg-blue-500 text-white rounded text-xs md:text-sm hover:bg-blue-600 transition-colors"
              >
                T&M Settings
              </button>
              <button
                onClick={() => setShowWPSettings(true)}
                className="px-2 md:px-3 py-1 bg-green-500 text-white rounded text-xs md:text-sm hover:bg-green-600 transition-colors"
              >
                WP Settings
              </button>
              <button
                onClick={() => setShowCostProfitAnalysis(false)}
                className="text-gray-500 hover:text-gray-700 p-2 hover:bg-gray-100 rounded transition-colors"
                title="Close"
              >
                <span className="text-xl font-bold">×</span>
              </button>
            </div>
          </div>

          <div className="p-4 md:p-6 bg-white rounded-b-lg overflow-y-auto" style={{ height: 'calc(90vh - 80px)' }}>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-6">
              <div className="bg-gray-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-sm md:text-base">Project Overview</h3>
                <div className="text-sm space-y-1">
                  <div>Total Hours: {calculateTotalHours(rfq)}h</div>
                  <div>Total Cost: €{totalCost.toLocaleString()}</div>
                  <div>Team Members: {getUniquePersons(rfq).length}</div>
                </div>
              </div>

              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-blue-800 text-sm md:text-base">Time & Material</h3>
                <div className="text-sm space-y-1">
                  <div>Revenue: €{tmAnalysis.totalRevenue.toLocaleString()}</div>
                  <div>Profit: €{tmProfit.toLocaleString()}</div>
                  <div className={tmProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                    Margin: {((tmProfit / tmAnalysis.totalRevenue) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>

              <div className="bg-green-50 p-4 rounded-lg">
                <h3 className="font-semibold mb-2 text-green-800 text-sm md:text-base">Work Package</h3>
                <div className="text-sm space-y-1">
                  <div>Revenue: €{wpAnalysis.totalRevenue.toLocaleString()}</div>
                  <div>Profit: €{wpProfit.toLocaleString()}</div>
                  <div className={wpProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                    Margin: {((wpProfit / wpAnalysis.totalRevenue) * 100).toFixed(1)}%
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed project breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Project Details */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Project Breakdown by Location</h3>
                <div className="space-y-3">
                  {locations.map(location => {
                    const locationHours = rfq.allocations
                      .filter(a => a.location === location)
                      .reduce((sum, a) => sum + calculateAllocationHours(a), 0);
                    const locationCost = rfq.allocations
                      .filter(a => a.location === location)
                      .reduce((sum, a) => sum + (calculateAllocationHours(a) * engineerRates[a.level][a.location]), 0);

                    return locationHours > 0 ? (
                      <div key={location} className="border-b pb-2">
                        <div className="flex justify-between font-medium">
                          <span>{location}</span>
                          <span>{locationHours}h</span>
                        </div>
                        <div className="text-sm text-gray-600">
                          Cost: €{locationCost.toLocaleString()}
                        </div>
                      </div>
                    ) : null;
                  })}
                </div>
              </div>

              {/* Time & Material Analysis */}
              <div className="bg-white border rounded-lg p-6">
                <h3 className="text-lg font-semibold mb-4">Time & Material Revenue</h3>
                <div className="space-y-3">
                  {tmAnalysis.locationBreakdown.map(loc => (
                    <div key={loc.location} className="border-b pb-2">
                      <div className="flex justify-between">
                        <span>{loc.location}:</span>
                        <span className="font-medium">€{loc.revenue.toLocaleString()}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {loc.hours}h × €{loc.sellRate}/h
                      </div>
                    </div>
                  ))}
                  <div className="pt-2 font-semibold">
                    <div className="flex justify-between">
                      <span>Total Revenue:</span>
                      <span>€{tmAnalysis.totalRevenue.toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Work Package Analysis */}
            <div className="bg-white border rounded-lg p-6 mb-6">
              <h3 className="text-lg font-semibold mb-4">Work Package Analysis</h3>

              {/* Estimation Method Selection */}
              <div className="mb-6">
                <h4 className="font-medium mb-3">Estimation Method</h4>
                <div className="flex space-x-4">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="storyPoints"
                      checked={estimationMethod === 'storyPoints'}
                      onChange={(e) => setEstimationMethod(e.target.value)}
                      className="mr-2"
                    />
                    Story Points Estimation
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      value="tickets"
                      checked={estimationMethod === 'tickets'}
                      onChange={(e) => setEstimationMethod(e.target.value)}
                      className="mr-2"
                    />
                    Direct Ticket Planning
                  </label>
                </div>
              </div>

              {estimationMethod === 'storyPoints' ? (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estimated Story Points (Auto: {Math.ceil(calculateTotalHours(rfq) / wpConfig.storyPointsToHours)} SP)
                  </label>
                  <input
                    type="number"
                    value={estimatedStoryPoints || ''}
                    onChange={(e) => setEstimatedStoryPoints(parseInt(e.target.value) || 0)}
                    placeholder={`Auto-calculated: ${Math.ceil(calculateTotalHours(rfq) / wpConfig.storyPointsToHours)}`}
                    className="w-full md:w-1/3 border border-gray-300 rounded px-3 py-2"
                    min="0"
                  />
                </div>
              ) : (
                <div className="mb-6">
                  <h4 className="font-medium mb-3">Direct Ticket Quantities</h4>
                  <div className="grid grid-cols-3 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Small Tickets ({wpConfig.tickets.small.storyPoints} SP each)
                      </label>
                      <input
                        type="number"
                        value={directTicketCounts.small}
                        onChange={(e) => setDirectTicketCounts(prev => ({
                          ...prev,
                          small: parseInt(e.target.value) || 0
                        }))}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Medium Tickets ({wpConfig.tickets.medium.storyPoints} SP each)
                      </label>
                      <input
                        type="number"
                        value={directTicketCounts.medium}
                        onChange={(e) => setDirectTicketCounts(prev => ({
                          ...prev,
                          medium: parseInt(e.target.value) || 0
                        }))}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        min="0"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Large Tickets ({wpConfig.tickets.large.storyPoints} SP each)
                      </label>
                      <input
                        type="number"
                        value={directTicketCounts.large}
                        onChange={(e) => setDirectTicketCounts(prev => ({
                          ...prev,
                          large: parseInt(e.target.value) || 0
                        }))}
                        className="w-full border border-gray-300 rounded px-3 py-2"
                        min="0"
                      />
                    </div>
                  </div>
                  <div className="mt-3 text-sm text-gray-600">
                    Total Story Points: {
                      directTicketCounts.small * wpConfig.tickets.small.storyPoints +
                      directTicketCounts.medium * wpConfig.tickets.medium.storyPoints +
                      directTicketCounts.large * wpConfig.tickets.large.storyPoints
                    } SP
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium mb-3">Cost Analysis</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Development Cost:</span>
                      <span>€{wpAnalysis.developmentCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Hardware Cost:</span>
                      <span>€{wpAnalysis.hardwareCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between border-t pt-2">
                      <span>Base Cost:</span>
                      <span>€{wpAnalysis.totalCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between text-orange-600">
                      <span>Risk Factor ({wpConfig.riskFactor}%):</span>
                      <span>€{(wpAnalysis.riskAdjustedCost - wpAnalysis.totalCost).toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Risk-Adjusted Cost:</span>
                      <span>€{wpAnalysis.riskAdjustedCost.toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium mb-3">Ticket Pricing</h4>
                  <div className="space-y-2 text-sm">
                    <div className="mb-2 text-xs text-gray-600">
                      Base Quote: €{Math.round(wpAnalysis.baseQuote).toLocaleString()}
                    </div>
                    <div className="flex justify-between">
                      <span>Small ({wpAnalysis.ticketCombination.small}):</span>
                      <span>€{Math.round(wpAnalysis.ticketCombination.ticketPrices.small).toLocaleString()} each</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Medium ({wpAnalysis.ticketCombination.medium}):</span>
                      <span>€{Math.round(wpAnalysis.ticketCombination.ticketPrices.medium).toLocaleString()} each</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Large ({wpAnalysis.ticketCombination.large}):</span>
                      <span>€{Math.round(wpAnalysis.ticketCombination.ticketPrices.large).toLocaleString()} each</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Total Revenue:</span>
                      <span>€{wpAnalysis.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-gray-600 mt-2">
                      Story Points: {wpAnalysis.estimatedStoryPoints} |
                      Efficiency: {(wpAnalysis.ticketCombination.efficiency * 100).toFixed(1)}%
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Profit Comparison */}
            <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
              <h3 className="text-lg font-semibold mb-4">Profit Comparison</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-blue-800 mb-3">Time & Material Model</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Revenue:</span>
                      <span className="font-medium">€{tmAnalysis.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Cost:</span>
                      <span>€{totalCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Profit:</span>
                      <span className={tmProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        €{tmProfit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Margin:</span>
                      <span className={tmProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {((tmProfit / tmAnalysis.totalRevenue) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-white rounded-lg p-4">
                  <h4 className="font-medium text-green-800 mb-3">Work Package Model</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>Revenue:</span>
                      <span className="font-medium">€{wpAnalysis.totalRevenue.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Risk-Adjusted Cost:</span>
                      <span>€{wpAnalysis.riskAdjustedCost.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between font-semibold border-t pt-2">
                      <span>Profit:</span>
                      <span className={wpProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        €{wpProfit.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span>Margin:</span>
                      <span className={wpProfit >= 0 ? 'text-green-600' : 'text-red-600'}>
                        {((wpProfit / wpAnalysis.totalRevenue) * 100).toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="mt-6 text-center">
                <div className="text-2xl font-bold">
                  {wpProfit > tmProfit ? (
                    <span className="text-green-600">
                      Work Package model is more profitable by €{(wpProfit - tmProfit).toLocaleString()}
                    </span>
                  ) : (
                    <span className="text-blue-600">
                      Time & Material model is more profitable by €{(tmProfit - wpProfit).toLocaleString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  const RateSettingsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-4/5 max-w-4xl max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Hourly Rate Settings</h2>
          <button
            onClick={() => setShowRateSettings(false)}
            className="text-gray-500 hover:text-gray-700"
          >
            ✕
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-4 py-2 text-left">Engineer Level</th>
                <th className="border border-gray-200 px-4 py-2 text-left">HCC (€/h)</th>
                <th className="border border-gray-200 px-4 py-2 text-left">BCC (€/h)</th>
                <th className="border border-gray-200 px-4 py-2 text-left">MCC (€/h)</th>
              </tr>
            </thead>
            <tbody>
              {engineerLevels.map(level => (
                <tr key={level}>
                  <td className="border border-gray-200 px-4 py-2 font-medium">{level}</td>
                  {locations.map(location => (
                    <td key={location} className="border border-gray-200 px-4 py-2">
                      <input
                        type="number"
                        value={engineerRates[level][location]}
                        onChange={(e) => updateRate(level, location, e.target.value)}
                        onBlur={e => e.target.focus()}
                        className="w-full border border-gray-300 rounded px-2 py-1"
                        min="0"
                        step="0.01"
                      />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            onClick={() => setShowRateSettings(false)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );

  const TimelineView = ({ rfq }) => {
    if (!rfq.createdDate || !rfq.deadline) return null;

    const projectMonths = generateMonthsRange(rfq.createdDate, rfq.deadline);
    const uniquePersons = getUniquePersons(rfq);

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold">Resource Timeline</h3>
          <div className="flex space-x-2">
            <div className="text-sm text-gray-600">
              Click any month cell to edit FTE allocation
            </div>
            <button
              onClick={() => setShowTimeline(false)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Close Timeline
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-200 text-sm">
            <thead>
              <tr className="bg-gray-50">
                <th className="border border-gray-200 px-3 py-2 text-left sticky left-0 bg-gray-50 min-w-[200px]">
                  Team Member
                </th>
                {projectMonths.map(month => (
                  <th key={month.key} className="border border-gray-200 px-2 py-2 text-center min-w-[80px]">
                    <div>{new Date(month.year, month.month).toLocaleDateString('en-US', { month: 'short' })}</div>
                    <div className="text-xs text-gray-500">{month.year}</div>
                  </th>
                ))}
                <th className="border border-gray-200 px-3 py-2 text-center">Total Hours</th>
              </tr>
            </thead>
            <tbody>
              {uniquePersons.map(personName => {
                const personAllocations = getPersonAllocations(rfq, personName);
                const totalHours = getPersonTotalHours(rfq, personName);
                const hasOverlap = hasOverlappingAllocations(personAllocations);

                return (
                  <tr key={personName} className={hasOverlap ? 'bg-red-50' : ''}>
                    <td className="border border-gray-200 px-3 py-2 sticky left-0 bg-white">
                      <div className="font-medium">{personName}</div>
                      <div className="text-xs text-gray-600 mt-1">
                        {personAllocations.length} period{personAllocations.length > 1 ? 's' : ''}
                      </div>
                      {hasOverlap && (
                        <div className="text-xs text-red-600 mt-1">
                          ⚠️ Overlapping periods
                        </div>
                      )}
                    </td>

                    {projectMonths.map(month => {
                      const monthAllocations = personAllocations.filter(allocation => {
                        const allocationMonths = generateMonthsRange(allocation.startDate, allocation.endDate);
                        return allocationMonths.some(am => am.key === month.key);
                      });

                      if (monthAllocations.length === 0) {
                        return (
                          <td key={month.key} className="border border-gray-200 px-1 py-1 text-center">
                            <div className="text-gray-300">-</div>
                          </td>
                        );
                      }

                      let totalMonthlyFTE = 0;
                      const allocationDetails = monthAllocations.map(allocation => {
                        const monthlyFTE = allocation.monthlyFTE[month.key] !== undefined
                          ? allocation.monthlyFTE[month.key]
                          : allocation.ftePercentage;
                        totalMonthlyFTE += monthlyFTE;

                        return {
                          allocation,
                          fte: monthlyFTE,
                          isCustom: allocation.monthlyFTE[month.key] !== undefined
                        };
                      });

                      const hasCustomFTE = allocationDetails.some(detail => detail.isCustom);
                      const hasMultipleAllocations = monthAllocations.length > 1;

                      return (
                        <td key={month.key} className="border border-gray-200 px-1 py-1 text-center">
                          <div
                            className={
                              'cursor-pointer rounded px-2 py-1 text-xs font-medium transition-all hover:shadow-md ' +
                              (hasCustomFTE ? 'ring-2 ring-blue-300 ' : '') +
                              (hasMultipleAllocations ? 'ring-2 ring-orange-400 ' : '') +
                              (totalMonthlyFTE >= 100 ? 'bg-red-200 text-red-800 hover:bg-red-300' :
                                totalMonthlyFTE >= 75 ? 'bg-orange-200 text-orange-800 hover:bg-orange-300' :
                                  totalMonthlyFTE >= 50 ? 'bg-yellow-200 text-yellow-800 hover:bg-yellow-300' :
                                    totalMonthlyFTE >= 25 ? 'bg-green-200 text-green-800 hover:bg-green-300' :
                                      'bg-blue-200 text-blue-800 hover:bg-blue-300')
                            }
                            onClick={() => {
                              if (monthAllocations.length === 1) {
                                const allocation = monthAllocations[0];
                                const monthlyFTE = allocation.monthlyFTE[month.key] !== undefined
                                  ? allocation.monthlyFTE[month.key]
                                  : allocation.ftePercentage;
                                setEditingAllocation({
                                  rfqId: rfq.id,
                                  allocationId: allocation.id,
                                  monthKey: month.key,
                                  currentFTE: monthlyFTE,
                                  defaultFTE: allocation.ftePercentage,
                                  isCustom: allocation.monthlyFTE[month.key] !== undefined,
                                  monthName: new Date(month.year, month.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                                  personName: personName,
                                  multipleAllocations: monthAllocations,
                                  allocationDetails: allocationDetails
                                });
                              } else {
                                setEditingAllocation({
                                  rfqId: rfq.id,
                                  monthKey: month.key,
                                  monthName: new Date(month.year, month.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }),
                                  personName: personName,
                                  multipleAllocations: monthAllocations,
                                  allocationDetails: allocationDetails,
                                  isMultipleSelection: true
                                });
                              }
                            }}
                            title={
                              monthAllocations.length === 1
                                ? monthAllocations[0].role + " - " + (monthAllocations[0].feature === 'Other' ? monthAllocations[0].customFeature : monthAllocations[0].feature) + "\nClick to edit FTE for " + new Date(month.year, month.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' }) + (hasCustomFTE ? ' (Custom)' : ' (Default)')
                                : "Multiple allocations (" + totalMonthlyFTE + "% total)\nClick to edit individual periods"
                            }
                          >
                            <div>{totalMonthlyFTE}%</div>
                            {hasCustomFTE && <div className="text-xs">●</div>}
                            {hasMultipleAllocations && <div className="text-xs">×{monthAllocations.length}</div>}
                          </div>
                        </td>
                      );
                    })}

                    <td className="border border-gray-200 px-3 py-2 text-center font-medium">
                      {totalHours}h
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="mt-4 flex items-center justify-between">
          <div className="flex items-center space-x-4 text-xs">
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
          </div>
          <div className="text-xs text-gray-600">
            ● = Custom FTE | ×N = Multiple periods | Blue ring = Custom | Orange ring = Multiple allocations
          </div>
        </div>
      </div>
    );
  };

  const EditFTEModal = () => {
    const [newFTE, setNewFTE] = useState(editingAllocation?.currentFTE || 0);
    const [useDefault, setUseDefault] = useState(!editingAllocation?.isCustom);

    if (!editingAllocation) return null;

    if (editingAllocation.isMultipleSelection) {
      return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
            <h3 className="text-lg font-semibold mb-4">
              Select Allocation Period to Edit
            </h3>
            <p className="text-sm text-gray-600 mb-4">
              {editingAllocation.personName} has multiple allocation periods in {editingAllocation.monthName}. Select which one to edit:
            </p>

            <div className="space-y-3 mb-6">
              {editingAllocation.allocationDetails.map((detail, index) => (
                <div key={detail.allocation.id} className="border rounded p-3 hover:bg-gray-50">
                  <button
                    onClick={() => {
                      setEditingAllocation({
                        ...editingAllocation,
                        allocationId: detail.allocation.id,
                        currentFTE: detail.fte,
                        defaultFTE: detail.allocation.ftePercentage,
                        isCustom: detail.isCustom,
                        isMultipleSelection: false
                      });
                    }}
                    className="w-full text-left"
                  >
                    <div className="font-medium text-sm">
                      Period {index + 1}: {detail.allocation.role}
                    </div>
                    <div className="text-xs text-gray-600">
                      Feature: {detail.allocation.feature === 'Other' ? detail.allocation.customFeature : detail.allocation.feature}
                    </div>
                    <div className="text-xs text-gray-600">
                      Period: {new Date(detail.allocation.startDate).toLocaleDateString()} - {new Date(detail.allocation.endDate).toLocaleDateString()}
                    </div>
                    <div className="text-xs font-medium text-blue-600">
                      Current FTE: {detail.fte}% {detail.isCustom && '(Custom)'}
                    </div>
                  </button>
                </div>
              ))}
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setEditingAllocation(null)}
                className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      );
    }

    const saveFTE = () => {
      if (useDefault) {
        const updatedRfq = rfqs.find(rfq => rfq.id === editingAllocation.rfqId);
        const newAllocations = updatedRfq.allocations.map(allocation => {
          if (allocation.id === editingAllocation.allocationId) {
            const newMonthlyFTE = { ...allocation.monthlyFTE };
            delete newMonthlyFTE[editingAllocation.monthKey];
            return { ...allocation, monthlyFTE: newMonthlyFTE };
          }
          return allocation;
        });
        updateRfq(editingAllocation.rfqId, { allocations: newAllocations });
      } else {
        updateMonthlyFTE(editingAllocation.rfqId, editingAllocation.allocationId, editingAllocation.monthKey, newFTE);
      }
      setEditingAllocation(null);
    };

    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 w-96">
          <h3 className="text-lg font-semibold mb-4">
            Edit FTE for {editingAllocation.monthName}
          </h3>

          {editingAllocation.personName && (
            <div className="mb-4 p-3 bg-blue-50 rounded">
              <div className="text-sm font-medium text-blue-800">
                {editingAllocation.personName}
              </div>
            </div>
          )}

          <div className="mb-4 p-3 bg-gray-50 rounded">
            <div className="text-sm text-gray-600 mb-2">Current Settings:</div>
            <div className="text-sm">
              <span className="font-medium">Default FTE:</span> {editingAllocation.defaultFTE}%
            </div>
            <div className="text-sm">
              <span className="font-medium">Current FTE:</span> {editingAllocation.currentFTE}%
              {editingAllocation.isCustom && <span className="text-blue-600"> (Custom)</span>}
            </div>
          </div>

          <div className="mb-4">
            <div className="flex items-center space-x-3 mb-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={useDefault}
                  onChange={() => setUseDefault(true)}
                  className="mr-2"
                />
                Use Default FTE ({editingAllocation.defaultFTE}%)
              </label>
            </div>

            <div className="flex items-center space-x-3 mb-3">
              <label className="flex items-center">
                <input
                  type="radio"
                  checked={!useDefault}
                  onChange={() => setUseDefault(false)}
                  className="mr-2"
                />
                Set Custom FTE
              </label>
            </div>

            {!useDefault && (
              <div className="ml-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Custom FTE Percentage
                </label>
                <div className="flex space-x-2">
                  <input
                    type="number"
                    value={newFTE}
                    onChange={(e) => setNewFTE(parseInt(e.target.value) || 0)}
                    className="flex-1 border border-gray-300 rounded px-3 py-2"
                    min="0"
                    max="100"
                  />
                  <span className="flex items-center text-gray-600">%</span>
                </div>
                <div className="mt-2 flex flex-wrap gap-1">
                  {[0, 25, 50, 75, 100].map(percentage => (
                    <button
                      key={percentage}
                      onClick={() => setNewFTE(percentage)}
                      className="px-2 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
                    >
                      {percentage}%
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="flex space-x-3">
            <button
              onClick={saveFTE}
              className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Save Changes
            </button>
            <button
              onClick={() => setEditingAllocation(null)}
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  };

  const YearlyView = ({ rfq }) => {
    if (!rfq.createdDate || !rfq.deadline) return null;

    const yearlyData = calculateYearlyData(rfq);
    const years = Object.keys(yearlyData).map(Number).sort();

    return (
      <div className="bg-white rounded-lg shadow-md p-6 mt-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold flex items-center">
            <BarChart3 className="mr-2" size={20} />
            Yearly Resource & Budget Planning
          </h3>
          <button
            onClick={() => setShowYearlyView(false)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Close Yearly View
          </button>
        </div>

        {/* Yearly Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {years.map(year => (
            <div key={year} className="bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-lg font-semibold text-blue-800 mb-3">{year}</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Resources:</span>
                  <span className="font-medium">{yearlyData[year].resourceCount}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Hours:</span>
                  <span className="font-medium">{Math.round(yearlyData[year].totalHours)}h</span>
                </div>
                {currentUser.role === 'Delivery Manager' && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Budget:</span>
                    <span className="font-medium text-green-600">€{Math.round(yearlyData[year].totalCost).toLocaleString()}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Detailed Yearly Breakdown */}
        <div className="space-y-8">
          {years.map(year => (
            <div key={year} className="border rounded-lg p-6 bg-gray-50">
              <h4 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
                <TrendingUp className="mr-2" size={20} />
                {year} - Detailed Breakdown
              </h4>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Location Breakdown */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h5 className="font-medium mb-3 text-gray-700">Resource Hours by Location</h5>
                  <div className="space-y-2">
                    {Object.entries(yearlyData[year].locationBreakdown).map(([location, hours]) => (
                      <div key={location} className="flex justify-between items-center">
                        <span className="text-sm text-gray-600">{location}:</span>
                        <div className="flex items-center space-x-2">
                          <div className="w-32 bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${yearlyData[year].totalHours > 0 ? (hours / yearlyData[year].totalHours) * 100 : 0}%` }}
                            ></div>
                          </div>
                          <span className="text-sm font-medium w-16 text-right">{Math.round(hours)}h</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Level Breakdown */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h5 className="font-medium mb-3 text-gray-700">Resource Hours by Level</h5>
                  <div className="space-y-2">
                    {Object.entries(yearlyData[year].levelBreakdown)
                      .filter(([, data]) => data.hours > 0)
                      .sort(([, a], [, b]) => b.hours - a.hours)
                      .map(([level, data]) => (
                        <div key={level} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600">{level}:</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-32 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-green-500 h-2 rounded-full"
                                style={{ width: `${yearlyData[year].totalHours > 0 ? (data.hours / yearlyData[year].totalHours) * 100 : 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-16 text-right">{Math.round(data.hours)}h</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Feature Breakdown */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h5 className="font-medium mb-3 text-gray-700">Hours by Feature</h5>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {Object.entries(yearlyData[year].featureBreakdown)
                      .sort(([, a], [, b]) => b.hours - a.hours)
                      .map(([feature, data]) => (
                        <div key={feature} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 truncate mr-2">{feature || 'Unspecified'}:</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-purple-500 h-2 rounded-full"
                                style={{ width: `${yearlyData[year].totalHours > 0 ? (data.hours / yearlyData[year].totalHours) * 100 : 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-12 text-right">{Math.round(data.hours)}h</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Team Members */}
                <div className="bg-white rounded-lg p-4 shadow-sm">
                  <h5 className="font-medium mb-3 text-gray-700">Team Members</h5>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {Object.entries(yearlyData[year].personBreakdown)
                      .sort(([, a], [, b]) => b.hours - a.hours)
                      .map(([person, data]) => (
                        <div key={person} className="flex justify-between items-center">
                          <span className="text-sm text-gray-600 truncate mr-2">{person}:</span>
                          <div className="flex items-center space-x-2">
                            <div className="w-24 bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-orange-500 h-2 rounded-full"
                                style={{ width: `${yearlyData[year].totalHours > 0 ? (data.hours / yearlyData[year].totalHours) * 100 : 0}%` }}
                              ></div>
                            </div>
                            <span className="text-sm font-medium w-12 text-right">{Math.round(data.hours)}h</span>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              {/* Budget Information for Delivery Manager */}
              {currentUser.role === 'Delivery Manager' && (
                <div className="mt-6 bg-white rounded-lg p-4 shadow-sm">
                  <h5 className="font-medium mb-3 text-gray-700">Budget Breakdown for {year}</h5>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {/* Cost by Location */}
                    <div>
                      <h6 className="text-sm font-medium text-gray-600 mb-2">Cost by Location</h6>
                      {Object.entries(yearlyData[year].locationBreakdown).map(([location, hours]) => {
                        const locationCost = Object.values(yearlyData[year].levelBreakdown).reduce((sum, levelData) => sum + levelData.cost, 0) * (hours / (yearlyData[year].totalHours || 1));
                        return (
                          <div key={location} className="flex justify-between text-sm">
                            <span>{location}:</span>
                            <span className="font-medium">€{Math.round(locationCost).toLocaleString()}</span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Cost by Level */}
                    <div>
                      <h6 className="text-sm font-medium text-gray-600 mb-2">Cost by Level</h6>
                      {Object.entries(yearlyData[year].levelBreakdown)
                        .filter(([, data]) => data.cost > 0)
                        .sort(([, a], [, b]) => b.cost - a.cost)
                        .map(([level, data]) => (
                          <div key={level} className="flex justify-between text-sm">
                            <span>{level}:</span>
                            <span className="font-medium">€{Math.round(data.cost).toLocaleString()}</span>
                          </div>
                        ))}
                    </div>

                    {/* Cost by Feature */}
                    <div>
                      <h6 className="text-sm font-medium text-gray-600 mb-2">Cost by Feature</h6>
                      <div className="max-h-32 overflow-y-auto">
                        {Object.entries(yearlyData[year].featureBreakdown)
                          .sort(([, a], [, b]) => b.cost - a.cost)
                          .slice(0, 5)
                          .map(([feature, data]) => (
                            <div key={feature} className="flex justify-between text-sm">
                              <span className="truncate mr-2">{feature || 'Unspecified'}:</span>
                              <span className="font-medium">€{Math.round(data.cost).toLocaleString()}</span>
                            </div>
                          ))}
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-700">Total {year} Budget:</span>
                      <span className="font-bold text-lg text-green-600">€{Math.round(yearlyData[year].totalCost).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Summary Totals */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-6 border border-blue-200">
          <h4 className="text-lg font-semibold text-gray-800 mb-4">Project Totals</h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">
                {years.reduce((sum, year) => sum + yearlyData[year].totalHours, 0).toFixed(0)}h
              </div>
              <div className="text-sm text-gray-600">Total Hours</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {Math.max(...years.map(year => yearlyData[year].resourceCount))}
              </div>
              <div className="text-sm text-gray-600">Peak Resources</div>
            </div>
            {currentUser.role === 'Delivery Manager' && (
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  €{years.reduce((sum, year) => sum + yearlyData[year].totalCost, 0).toFixed(0).replace(/\B(?=(\d{3})+(?!\d))/g, ",")}
                </div>
                <div className="text-sm text-gray-600">Total Budget</div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  const RfqCard = ({ rfq }) => (
    <div className="bg-white rounded-lg shadow-md p-6 mb-4 border border-gray-200">
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-800">{rfq.name}</h3>
          <p className="text-sm text-gray-600">Project Start Date: {rfq.createdDate}</p>
          {rfq.deadline && <p className="text-sm text-gray-600">Project End Date: {rfq.deadline}</p>}
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => setSelectedRfq(rfq)}
            className="px-3 py-1 bg-blue-500 text-white rounded text-sm hover:bg-blue-600 flex items-center"
          >
            <Edit3 size={16} className="mr-1" />
            Edit
          </button>
          {currentUser.role === 'Delivery Manager' && (
            <button
              onClick={() => {
                setSelectedRfq(rfq);
                setShowCostProfitAnalysis(true);
              }}
              className="px-3 py-1 bg-emerald-500 text-white rounded text-sm hover:bg-emerald-600 flex items-center"
            >
              <Calculator size={16} className="mr-1" />
              Analysis
            </button>
          )}
          <button
            onClick={() => deleteRfq(rfq.id)}
            className="px-3 py-1 bg-red-500 text-white rounded text-sm hover:bg-red-600"
          >
            <Trash2 size={16} />
          </button>
        </div>
      </div>

      <div className={currentUser.role === 'Delivery Manager' ? 'grid grid-cols-3 gap-4 text-sm' : 'grid grid-cols-2 gap-4 text-sm'}>
        <div className="bg-gray-50 p-3 rounded">
          <div className="flex items-center mb-1">
            <Users size={16} className="mr-1 text-gray-600" />
            <span className="font-medium">Resources</span>
          </div>
          <p className="text-gray-700">{rfq.allocations.length} engineers</p>
        </div>

        <div className="bg-gray-50 p-3 rounded">
          <div className="flex items-center mb-1">
            <Clock size={16} className="mr-1 text-gray-600" />
            <span className="font-medium">Total Hours</span>
          </div>
          <p className="text-gray-700">{calculateTotalHours(rfq)}h</p>
        </div>

        {currentUser.role === 'Delivery Manager' && (
          <div className="bg-gray-50 p-3 rounded">
            <div className="flex items-center mb-1">
              <FileText size={16} className="mr-1 text-gray-600" />
              <span className="font-medium">Budget</span>
            </div>
            <p className="text-gray-700">€{calculateRfqCost(rfq).toLocaleString()}</p>
          </div>
        )}
      </div>
    </div>
  );
  const [activeAllocationId, setActiveAllocationId] = useState(null);
  const AllocationForm = ({ rfq }) => (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-semibold">Resource Allocation - {rfq.name}</h2>
        <div className="flex space-x-2">
          <button
            onClick={() => setShowTimeline(!showTimeline)}
            className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
          >
            <Calendar size={16} className="inline mr-1" />
            {showTimeline ? 'Hide Timeline' : 'Show Timeline'}
          </button>
          <button
            onClick={() => setShowYearlyView(!showYearlyView)}
            className="px-4 py-2 bg-indigo-500 text-white rounded hover:bg-indigo-600"
          >
            <BarChart3 size={16} className="inline mr-1" />
            {showYearlyView ? 'Hide Yearly View' : 'Show Yearly View'}
          </button>
          <button
            onClick={() => setSelectedRfq(null)}
            className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Project Start Date</label>
          <input
            type="date"
            value={rfq.createdDate}
            onChange={(e) => updateRfq(rfq.id, { createdDate: e.target.value })}
            className="border border-gray-300 rounded px-3 py-2 w-full"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Proejct End Date</label>
          <input
            type="date"
            value={rfq.deadline}
            onChange={(e) => updateRfq(rfq.id, { deadline: e.target.value })}
            className="border border-gray-300 rounded px-3 py-2 w-full"
          />
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium">Team Allocations</h3>
          <button
            onClick={() => addAllocation(rfq.id)}
            className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
          >
            <Plus size={16} className="inline mr-1" />
            Add Engineer
          </button>
        </div>

        {rfq.allocations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <AlertCircle size={48} className="mx-auto mb-4" />
            <p>No engineers allocated yet. Click FEngineer to start planning.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse border border-gray-200 text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="border border-gray-200 px-3 py-2 text-left">Name</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">Level</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">Location</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">Role</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">Feature</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">Period</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">FTE %</th>
                  <th className="border border-gray-200 px-3 py-2 text-left">Hours</th>
                  {currentUser.role === 'Delivery Manager' && (
                    <>
                      <th className="border border-gray-200 px-3 py-2 text-left">Rate (€/h)</th>
                      <th className="border border-gray-200 px-3 py-2 text-left">Cost (€)</th>
                    </>
                  )}
                  <th className="border border-gray-200 px-3 py-2 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {rfq.allocations.map((allocation) => (
                  <tr key={allocation.id}>
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
                        onChange={(e) => updateRfq(rfq.id, {
                          allocations: rfq.allocations.map(a =>
                            a.id === allocation.id ? { ...a, name: e.target.value } : a
                          )
                        })}
                        className=" border border-gray-300 rounded px-2 py-1 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent selection:bg-blue-200 selection:text-blue-900 transition"
                        placeholder="Engineer name"
                      />
                    </td>
                    <td className="border border-gray-200 px-3 py-2">
                      <select
                        value={allocation.level}
                        onChange={(e) => updateRfq(rfq.id, {
                          allocations: rfq.allocations.map(a =>
                            a.id === allocation.id ? { ...a, level: e.target.value } : a
                          )
                        })}
                        className=" border border-gray-300 rounded px-2 py-1"
                      >
                        {engineerLevels.map(level => (
                          <option key={level} value={level}>{level}</option>
                        ))}
                      </select>
                    </td>
                    <td className="border border-gray-200 px-3 py-2">
                      <select
                        value={allocation.location}
                        onChange={(e) => updateRfq(rfq.id, {
                          allocations: rfq.allocations.map(a =>
                            a.id === allocation.id ? { ...a, location: e.target.value } : a
                          )
                        })}
                        className=" border border-gray-300 rounded px-2 py-1"
                      >
                        {locations.map(location => (
                          <option key={location} value={location}>{location}</option>
                        ))}
                      </select>
                    </td>
                    <td className="border border-gray-200 px-3 py-2">
                      <select
                        value={allocation.role}
                        onChange={(e) => updateRfq(rfq.id, {
                          allocations: rfq.allocations.map(a =>
                            a.id === allocation.id ? { ...a, role: e.target.value } : a
                          )
                        })}
                        className="border border-gray-300 rounded px-2 py-1"
                      >
                        {roles.map(role => (
                          <option key={role} value={role}>{role}</option>
                        ))}
                      </select>
                    </td>
                    <td className="border border-gray-200 px-3 py-2">
                      <div className="space-y-1">
                        <select
                          value={allocation.feature}
                          onChange={(e) => updateRfq(rfq.id, {
                            allocations: rfq.allocations.map(a =>
                              a.id === allocation.id ? { ...a, feature: e.target.value } : a
                            )
                          })}
                          className=" border border-gray-300 rounded px-2 py-1"
                        >
                          {features.map(feature => (
                            <option key={feature} value={feature}>{feature}</option>
                          ))}
                        </select>
                        {allocation.feature === 'Other' && (
                          <input
                            type="text"
                            value={allocation.customFeature}
                            onChange={(e) => updateRfq(rfq.id, {
                              allocations: rfq.allocations.map(a =>
                                a.id === allocation.id ? { ...a, customFeature: e.target.value } : a
                              )
                            })}
                            className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                            placeholder="Specify custom feature"
                          />
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-200 px-3 py-2">
                      <div className="space-y-2">
                        <select
                          value={allocation.allocationType}
                          onChange={(e) => {
                            const newType = e.target.value;
                            updateRfq(rfq.id, {
                              allocations: rfq.allocations.map(a =>
                                a.id === allocation.id ? {
                                  ...a,
                                  allocationType: newType,
                                  startDate: newType === 'Whole Project' ? rfq.createdDate : a.startDate,
                                  endDate: newType === 'Whole Project' ? rfq.deadline : a.endDate
                                } : a
                              )
                            });
                          }}
                          className=" border border-gray-300 rounded px-2 py-1 text-xs"
                        >
                          <option value="Whole Project">Whole Project</option>
                          <option value="Specific Period">Specific Period</option>
                        </select>
                        {allocation.allocationType === 'Specific Period' ? (
                          <div className="space-y-1">
                            <input
                              type="date"
                              value={allocation.startDate}
                              onChange={(e) => updateRfq(rfq.id, {
                                allocations: rfq.allocations.map(a =>
                                  a.id === allocation.id ? { ...a, startDate: e.target.value } : a
                                )
                              })}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                            />
                            <input
                              type="date"
                              value={allocation.endDate}
                              onChange={(e) => updateRfq(rfq.id, {
                                allocations: rfq.allocations.map(a =>
                                  a.id === allocation.id ? { ...a, endDate: e.target.value } : a
                                )
                              })}
                              className="w-full border border-gray-300 rounded px-2 py-1 text-xs"
                            />
                          </div>
                        ) : (
                          <div className="text-xs text-gray-500">
                            {rfq.createdDate} to {rfq.deadline}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="border border-gray-200 px-4 py-2">
                      <select
                        value={allocation.ftePercentage}
                        onChange={(e) => updateRfq(rfq.id, {
                          allocations: rfq.allocations.map(a =>
                            a.id === allocation.id ? { ...a, ftePercentage: parseInt(e.target.value) } : a
                          )
                        })}
                        className=" border border-gray-300 rounded px-1 py-1"
                      >
                        {ftePercentages.map(percentage => (
                          <option key={percentage} value={percentage}>{percentage}%</option>
                        ))}
                      </select>
                    </td>
                    <td className="border border-gray-200 px-3 py-2">
                      <span className="font-medium">{calculateAllocationHours(allocation)}h</span>
                    </td>
                    {currentUser.role === 'Delivery Manager' && (
                      <>
                        <td className="border border-gray-200 px-3 py-2">
                          €{engineerRates[allocation.level][allocation.location]}
                        </td>
                        <td className="border border-gray-200 px-3 py-2">
                          €{(engineerRates[allocation.level][allocation.location] * calculateAllocationHours(allocation)).toLocaleString()}
                        </td>
                      </>
                    )}
                    <td className="border border-gray-200 px-3 py-2">
                      <button
                        onClick={() => removeAllocation(rfq.id, allocation.id)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <h3 className="text-lg font-medium mb-4">Summary</h3>

        {/* Person-wise Summary */}
        {getUniquePersons(rfq).length > 0 && (
          <div className="mb-6">
            <h4 className="text-md font-medium mb-3">Team Member Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {getUniquePersons(rfq).map(personName => {
                const personAllocations = getPersonAllocations(rfq, personName);
                const totalHours = getPersonTotalHours(rfq, personName);
                const hasOverlap = hasOverlappingAllocations(personAllocations);

                return (
                  <div key={personName} className={hasOverlap ? 'bg-white p-3 rounded border border-red-300 bg-red-50' : 'bg-white p-3 rounded border'}>
                    <h5 className="font-medium text-sm mb-2 flex items-center">
                      {personName}
                      {hasOverlap && <span className="ml-2 text-red-600">⚠️</span>}
                    </h5>
                    <div className="space-y-1">
                      {personAllocations.map((allocation, index) => (
                        <div key={allocation.id} className="text-xs text-gray-600">
                          Period {index + 1}: {allocation.role} - {allocation.feature === 'Other' ? allocation.customFeature : allocation.feature}
                          <br />
                          {new Date(allocation.startDate).toLocaleDateString()} - {new Date(allocation.endDate).toLocaleDateString()} ({calculateAllocationHours(allocation)}h)
                        </div>
                      ))}
                    </div>
                    <div className="text-xs font-medium text-gray-700 mt-2">
                      Total: {totalHours}h
                      {hasOverlap && <span className="text-red-600 ml-1">(Overlapping periods detected)</span>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <div className={currentUser.role === 'Delivery Manager' ? 'grid grid-cols-2 gap-4 mb-6' : 'grid grid-cols-1 gap-4 mb-6'}>
          <div>
            <p className="text-sm text-gray-600">Total Hours</p>
            <p className="text-xl font-semibold">{calculateTotalHours(rfq)}h</p>
          </div>
          {currentUser.role === 'Delivery Manager' && (
            <div>
              <p className="text-sm text-gray-600">Total Cost</p>
              <p className="text-xl font-semibold text-green-600">€{calculateRfqCost(rfq).toLocaleString()}</p>
            </div>
          )}
        </div>

        {rfq.allocations.length > 0 && (
          <div>
            <h4 className="text-md font-medium mb-3">Feature Distribution</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {Object.entries(getFeatureGroups(rfq)).map(([featureName, allocations]) => (
                <div key={featureName} className="bg-white p-3 rounded border">
                  <h5 className="font-medium text-sm mb-2">{featureName || 'Unspecified'}</h5>
                  <div className="space-y-1">
                    {allocations.map(allocation => (
                      <div key={allocation.id} className="text-xs text-gray-600">
                        {allocation.name || 'Unnamed'} ({calculateAllocationHours(allocation)}h - {allocation.ftePercentage}%)
                      </div>
                    ))}
                  </div>
                  <div className="text-xs font-medium text-gray-700 mt-2">
                    Total: {allocations.reduce((sum, a) => sum + calculateAllocationHours(a), 0)}h
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showTimeline && <TimelineView rfq={rfq} />}
      {showYearlyView && <YearlyView rfq={rfq} />}
    </div>
  );

  // Show login screen if no user is logged in
  if (!currentUser) {
    return <LoginScreen />;
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold text-gray-800 mb-2">RFQ Resource Planning</h1>
            <p className="text-gray-600">Plan and manage engineering resources for RFQ responses</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <User size={20} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">{currentUser.role}</span>
            </div>
            {currentUser.role === 'Delivery Manager' && (
              <>
                <button
                  onClick={() => setShowRateSettings(true)}
                  className="px-4 py-2 bg-purple-500 text-white rounded hover:bg-purple-600"
                >
                  <Settings size={16} className="inline mr-1" />
                  Rate Settings
                </button>
                {selectedRfq && (
                  <button
                    onClick={() => setShowCostProfitAnalysis(true)}
                    className="px-4 py-2 bg-emerald-500 text-white rounded hover:bg-emerald-600"
                  >
                    <Calculator size={16} className="inline mr-1" />
                    Cost-Profit Analysis
                  </button>
                )}
              </>
            )}
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              <LogOut size={16} className="inline mr-1" />
              Logout
            </button>
          </div>
        </div>

        {selectedRfq ? (
          <AllocationForm rfq={selectedRfq} />
        ) : (
          <div>
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold">Active RFQs</h2>
              <button
                onClick={() => setIsAddingRfq(true)}
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
              >
                <Plus size={16} className="inline mr-1" />
                New RFQ
              </button>
            </div>

            {isAddingRfq && (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <h3 className="text-lg font-medium mb-4">Create New RFQ</h3>
                <div className="flex space-x-4">
                  <input
                    type="text"
                    value={newRfqName}
                    onChange={(e) => setNewRfqName(e.target.value)}
                    placeholder="RFQ Name (e.g., RFQ-2024-002 - Manufacturing System)"
                    className="flex-1 border border-gray-300 rounded px-3 py-2"
                  />
                  <button
                    onClick={addRfq}
                    className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
                  >
                    Create
                  </button>
                  <button
                    onClick={() => setIsAddingRfq(false)}
                    className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 gap-6">
              {rfqs.length === 0 ? (
                <div className="text-center py-12">
                  <FileText size={64} className="mx-auto mb-4 text-gray-400" />
                  <p className="text-gray-600">No RFQs created yet. Click New RFQ to get started.</p>
                </div>
              ) : (
                rfqs.map(rfq => <RfqCard key={rfq.id} rfq={rfq} />)
              )}
            </div>

            {rfqs.length > 0 && (
              <div className="mt-8 bg-white rounded-lg shadow-md p-6">
                <h3 className="text-lg font-medium mb-4">Overview</h3>
                <div className={currentUser.role === 'Delivery Manager' ? 'grid grid-cols-3 gap-4' : 'grid grid-cols-2 gap-4'}>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{rfqs.length}</p>
                    <p className="text-sm text-gray-600">Active RFQs</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {rfqs.reduce((total, rfq) => total + calculateTotalHours(rfq), 0)}h
                    </p>
                    <p className="text-sm text-gray-600">Total Planned Hours</p>
                  </div>
                  {currentUser.role === 'Delivery Manager' && (
                    <div className="text-center">
                      <p className="text-2xl font-bold text-purple-600">
                        €{rfqs.reduce((total, rfq) => total + calculateRfqCost(rfq), 0).toLocaleString()}
                      </p>
                      <p className="text-sm text-gray-600">Total Budget</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {showRateSettings && <RateSettingsModal />}
        {showTMSettings && <TMSettingsModal />}
        {showWPSettings && <WPSettingsModal />}
        {showCostProfitAnalysis && selectedRfq && <CostProfitAnalysisModal rfq={selectedRfq} />}
        {editingAllocation && <EditFTEModal />}
      </div>
    </div>
  );
};

export default RFQPlanningTool;