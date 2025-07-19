
import { useState, useCallback, useMemo } from 'react';

const useResourceAllocation = (rfq, engineerRates) => {
  const [allocations, setAllocations] = useState(rfq?.allocations || []);
  const [conflicts, setConflicts] = useState([]);
  const [suggestions, setSuggestions] = useState([]);

  // Engineer levels and locations
  const engineerLevels = Object.keys(engineerRates || {});
  const locations = ['HCC', 'BCC', 'MCC'];
  
  const roles = [
    'Project Manager', 'Technical Lead', 'Test Lead', 'Architect',
    'BSW SW Architect', 'FO', 'Integration Lead', 'Software Developer',
    'Software Test Engineer (UT, IT)', 'Software Test Engineer (QT)'
  ];

  const features = [
    'Diagnostics & Degradation', 'Log & Trace', 'Flashing & Coding',
    'Life Cycle', 'Cluster (MCAL, OS)', 'FUSA', 'Cyber Security',
    'Network', 'Integration', 'Architecture', 'Project Management',
    'Resident Engineer', 'Other'
  ];

  // Add new allocation
  const addAllocation = useCallback((baseAllocation = {}) => {
    const newAllocation = {
      id: Date.now() + Math.random(),
      level: 'Standard',
      location: 'HCC',
      name: '',
      role: 'Software Developer',
      feature: 'Integration',
      customFeature: '',
      allocationType: 'Whole Project',
      ftePercentage: 100,
      startDate: rfq?.createdDate || new Date().toISOString().split('T')[0],
      endDate: rfq?.deadline || new Date().toISOString().split('T')[0],
      monthlyFTE: {},
      skills: [],
      notes: '',
      ...baseAllocation
    };

    setAllocations(prev => [...prev, newAllocation]);
    return newAllocation;
  }, [rfq]);

  // Update allocation
  const updateAllocation = useCallback((id, updates) => {
    setAllocations(prev => prev.map(allocation => {
      if (allocation.id === id) {
        const updated = { ...allocation, ...updates };
        
        // Auto-update dates if allocation type changes
        if (updates.allocationType === 'Whole Project') {
          updated.startDate = rfq?.createdDate || updated.startDate;
          updated.endDate = rfq?.deadline || updated.endDate;
        }
        
        return updated;
      }
      return allocation;
    }));
  }, [rfq]);

  // Remove allocation
  const removeAllocation = useCallback((id) => {
    setAllocations(prev => prev.filter(allocation => allocation.id !== id));
  }, []);

  // Update monthly FTE
  const updateMonthlyFTE = useCallback((allocationId, monthKey, fte) => {
    setAllocations(prev => prev.map(allocation => {
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
    }));
  }, []);

  // Calculate allocation hours
  const calculateAllocationHours = useCallback((allocation) => {
    if (!allocation.startDate || !allocation.endDate) return 0;

    const start = new Date(allocation.startDate);
    const end = new Date(allocation.endDate);
    const months = [];
    const current = new Date(start.getFullYear(), start.getMonth(), 1);

    while (current <= end) {
      const monthKey = current.getFullYear() + "-" + current.getMonth().toString().padStart(2, '0');
      months.push(monthKey);
      current.setMonth(current.getMonth() + 1);
    }

    let totalHours = 0;
    months.forEach(monthKey => {
      const monthFTE = allocation.monthlyFTE[monthKey] || allocation.ftePercentage;
      totalHours += (monthFTE / 100) * 160; // 160 hours per month
    });

    return Math.round(totalHours);
  }, []);

  // Calculate allocation cost
  const calculateAllocationCost = useCallback((allocation) => {
    if (!engineerRates) return 0;
    
    const hours = calculateAllocationHours(allocation);
    const rate = engineerRates[allocation.level]?.[allocation.location] || 0;
    return hours * rate;
  }, [calculateAllocationHours, engineerRates]);

  // Get unique persons
  const getUniquePersons = useCallback(() => {
    const persons = new Set();
    allocations.forEach(allocation => {
      if (allocation.name.trim()) {
        persons.add(allocation.name.trim());
      }
    });
    return Array.from(persons).sort();
  }, [allocations]);

  // Get person allocations
  const getPersonAllocations = useCallback((personName) => {
    return allocations
      .filter(allocation => allocation.name.toLowerCase() === personName.toLowerCase())
      .sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
  }, [allocations]);

  // Check for overlapping allocations
  const checkConflicts = useCallback(() => {
    const conflicts = [];
    const persons = getUniquePersons();

    persons.forEach(person => {
      const personAllocations = getPersonAllocations(person);
      
      for (let i = 0; i < personAllocations.length; i++) {
        for (let j = i + 1; j < personAllocations.length; j++) {
          const a1 = personAllocations[i];
          const a2 = personAllocations[j];
          const start1 = new Date(a1.startDate);
          const end1 = new Date(a1.endDate);
          const start2 = new Date(a2.startDate);
          const end2 = new Date(a2.endDate);

          if (start1 <= end2 && start2 <= end1) {
            conflicts.push({
              type: 'overlap',
              person,
              allocations: [a1.id, a2.id],
              message: `${person} has overlapping allocations`
            });
          }
        }
      }
    });

    setConflicts(conflicts);
    return conflicts;
  }, [getUniquePersons, getPersonAllocations]);

  // Generate optimization suggestions
  const generateSuggestions = useCallback(() => {
    const suggestions = [];
    
    // Suggest role consolidation
    const roleGroups = {};
    allocations.forEach(allocation => {
      if (!roleGroups[allocation.role]) {
        roleGroups[allocation.role] = [];
      }
      roleGroups[allocation.role].push(allocation);
    });

    Object.entries(roleGroups).forEach(([role, allocsInRole]) => {
      if (allocsInRole.length > 1) {
        const totalHours = allocsInRole.reduce((sum, alloc) => sum + calculateAllocationHours(alloc), 0);
        if (totalHours < 320) { // Less than 2 months full-time
          suggestions.push({
            type: 'consolidation',
            role,
            allocations: allocsInRole.map(a => a.id),
            message: `Consider consolidating ${role} allocations (${totalHours}h total)`
          });
        }
      }
    });

    // Suggest cost optimization
    const costByLocation = {};
    allocations.forEach(allocation => {
      const cost = calculateAllocationCost(allocation);
      if (!costByLocation[allocation.location]) {
        costByLocation[allocation.location] = 0;
      }
      costByLocation[allocation.location] += cost;
    });

    const totalCost = Object.values(costByLocation).reduce((sum, cost) => sum + cost, 0);
    if (costByLocation.HCC > totalCost * 0.7) {
      suggestions.push({
        type: 'cost_optimization',
        message: 'Consider moving some resources to lower-cost locations (BCC/MCC)'
      });
    }

    setSuggestions(suggestions);
    return suggestions;
  }, [allocations, calculateAllocationHours, calculateAllocationCost]);

  // Calculate total project metrics
  const projectMetrics = useMemo(() => {
    const totalHours = allocations.reduce((sum, allocation) => sum + calculateAllocationHours(allocation), 0);
    const totalCost = allocations.reduce((sum, allocation) => sum + calculateAllocationCost(allocation), 0);
    const uniquePersons = getUniquePersons();
    
    const locationBreakdown = {};
    const levelBreakdown = {};
    const featureBreakdown = {};

    allocations.forEach(allocation => {
      const hours = calculateAllocationHours(allocation);
      const cost = calculateAllocationCost(allocation);

      // Location breakdown
      if (!locationBreakdown[allocation.location]) {
        locationBreakdown[allocation.location] = { hours: 0, cost: 0 };
      }
      locationBreakdown[allocation.location].hours += hours;
      locationBreakdown[allocation.location].cost += cost;

      // Level breakdown
      if (!levelBreakdown[allocation.level]) {
        levelBreakdown[allocation.level] = { hours: 0, cost: 0 };
      }
      levelBreakdown[allocation.level].hours += hours;
      levelBreakdown[allocation.level].cost += cost;

      // Feature breakdown
      const feature = allocation.feature === 'Other' ? allocation.customFeature : allocation.feature;
      if (!featureBreakdown[feature]) {
        featureBreakdown[feature] = { hours: 0, cost: 0 };
      }
      featureBreakdown[feature].hours += hours;
      featureBreakdown[feature].cost += cost;
    });

    return {
      totalHours,
      totalCost,
      teamSize: uniquePersons.length,
      allocationsCount: allocations.length,
      averageHoursPerPerson: uniquePersons.length > 0 ? totalHours / uniquePersons.length : 0,
      averageCostPerHour: totalHours > 0 ? totalCost / totalHours : 0,
      locationBreakdown,
      levelBreakdown,
      featureBreakdown
    };
  }, [allocations, calculateAllocationHours, calculateAllocationCost, getUniquePersons]);

  // Validate allocation
  const validateAllocation = useCallback((allocation) => {
    const errors = [];
    
    if (!allocation.name.trim()) {
      errors.push('Engineer name is required');
    }
    
    if (!allocation.startDate) {
      errors.push('Start date is required');
    }
    
    if (!allocation.endDate) {
      errors.push('End date is required');
    }
    
    if (allocation.startDate && allocation.endDate && new Date(allocation.startDate) > new Date(allocation.endDate)) {
      errors.push('Start date must be before end date');
    }
    
    if (allocation.ftePercentage < 0 || allocation.ftePercentage > 100) {
      errors.push('FTE percentage must be between 0 and 100');
    }

    return errors;
  }, []);

  // Bulk operations
  const bulkUpdateAllocations = useCallback((allocationIds, updates) => {
    setAllocations(prev => prev.map(allocation => 
      allocationIds.includes(allocation.id) 
        ? { ...allocation, ...updates }
        : allocation
    ));
  }, []);

  const bulkDeleteAllocations = useCallback((allocationIds) => {
    setAllocations(prev => prev.filter(allocation => !allocationIds.includes(allocation.id)));
  }, []);

  return {
    // State
    allocations,
    conflicts,
    suggestions,
    projectMetrics,
    
    // Constants
    engineerLevels,
    locations,
    roles,
    features,
    
    // Actions
    addAllocation,
    updateAllocation,
    removeAllocation,
    updateMonthlyFTE,
    bulkUpdateAllocations,
    bulkDeleteAllocations,
    
    // Calculations
    calculateAllocationHours,
    calculateAllocationCost,
    
    // Utilities
    getUniquePersons,
    getPersonAllocations,
    checkConflicts,
    generateSuggestions,
    validateAllocation,
    
    // Setters
    setAllocations
  };
};

export default useResourceAllocation;