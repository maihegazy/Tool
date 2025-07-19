// =============================================================================
// UPDATED HOOK: useUtilities.js (Extended)
// =============================================================================

import { useState } from 'react';

const useUtilities = () => {
  const getRoleDisplayName = (role) => {
    const roleNames = {
      'Admin': 'System Administrator',
      'Delivery Manager': 'Delivery Manager',
      'Project Leader': 'Project Leader',
      'Resource Manager': 'Resource Manager'
    };
    return roleNames[role] || role;
  };

  const getRoleColor = (role) => {
    const colors = {
      'Admin': 'bg-red-500',
      'Delivery Manager': 'bg-green-500',
      'Project Leader': 'bg-blue-500',
      'Resource Manager': 'bg-purple-500'
    };
    return colors[role] || 'bg-gray-500';
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

  const calculateTotalHours = (rfq) => {
    return rfq.allocations.reduce((total, allocation) => total + calculateAllocationHours(allocation), 0);
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

  const calculateRfqCost = (rfq, engineerRates) => {
    if (!engineerRates) return 0;
    
    return rfq.allocations.reduce((total, allocation) => {
      const rate = engineerRates[allocation.level]?.[allocation.location] || 0;
      const hours = calculateAllocationHours(allocation);
      return total + (rate * hours);
    }, 0);
  };

  const getPersonAllocations = (rfq, personName) => {
    return rfq.allocations.filter(allocation =>
      allocation.name.toLowerCase() === personName.toLowerCase()
    ).sort((a, b) => new Date(a.startDate) - new Date(b.startDate));
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

  return {
    getRoleDisplayName,
    getRoleColor,
    generateMonthsRange,
    generateYearsRange,
    calculateAllocationHours,
    calculateTotalHours,
    getUniquePersons,
    calculateRfqCost,
    getPersonAllocations,
    getPersonTotalHours,
    hasOverlappingAllocations,
    getFeatureGroups
  };
};

export default useUtilities;