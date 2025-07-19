import { useState, useCallback } from 'react';

const useRfqManagement = (initialRfqs = []) => {
  const [rfqs, setRfqs] = useState(initialRfqs);
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  // Create new RFQ
  const createRfq = useCallback(async (rfqData) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const newRfq = {
        id: Date.now(),
        ...rfqData,
        status: 'Draft',
        createdDate: new Date().toISOString().split('T')[0],
        lastModified: new Date().toISOString(),
        allocations: [],
        approvals: [],
        comments: [],
        watchers: [],
        tags: []
      };
      
      setRfqs(prev => [...prev, newRfq]);
      setIsLoading(false);
      return newRfq;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  }, []);

  // Update existing RFQ
  const updateRfq = useCallback(async (id, updates) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const updatedRfq = {
        ...updates,
        lastModified: new Date().toISOString(),
      };
      
      setRfqs(prev => prev.map(rfq => 
        rfq.id === id ? { ...rfq, ...updatedRfq } : rfq
      ));
      
      if (selectedRfq && selectedRfq.id === id) {
        setSelectedRfq(prev => ({ ...prev, ...updatedRfq }));
      }
      
      setIsLoading(false);
      return updatedRfq;
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  }, [selectedRfq]);

  // Delete RFQ
  const deleteRfq = useCallback(async (id) => {
    setIsLoading(true);
    setError(null);
    
    try {
      setRfqs(prev => prev.filter(rfq => rfq.id !== id));
      
      if (selectedRfq && selectedRfq.id === id) {
        setSelectedRfq(null);
      }
      
      setIsLoading(false);
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
      throw err;
    }
  }, [selectedRfq]);

  // Duplicate RFQ
  const duplicateRfq = useCallback(async (rfq) => {
    const duplicatedRfq = {
      ...rfq,
      id: Date.now(),
      name: `${rfq.name} (Copy)`,
      status: 'Draft',
      createdDate: new Date().toISOString().split('T')[0],
      lastModified: new Date().toISOString(),
      allocations: rfq.allocations.map(allocation => ({
        ...allocation,
        id: Date.now() + Math.random(),
        monthlyFTE: { ...allocation.monthlyFTE }
      })),
      approvals: [],
      comments: []
    };
    
    return createRfq(duplicatedRfq);
  }, [createRfq]);

  // Search and filter RFQs
  const searchRfqs = useCallback((query, filters = {}) => {
    return rfqs.filter(rfq => {
      const matchesQuery = !query || 
        rfq.name.toLowerCase().includes(query.toLowerCase()) ||
        rfq.description?.toLowerCase().includes(query.toLowerCase());
      
      const matchesStatus = !filters.status || rfq.status === filters.status;
      const matchesDateRange = !filters.dateRange || 
        (new Date(rfq.createdDate) >= new Date(filters.dateRange.start) &&
         new Date(rfq.createdDate) <= new Date(filters.dateRange.end));
      
      return matchesQuery && matchesStatus && matchesDateRange;
    });
  }, [rfqs]);

  // Get RFQ statistics
  const getRfqStats = useCallback(() => {
    const stats = {
      total: rfqs.length,
      byStatus: {},
      totalBudget: 0,
      totalHours: 0,
      averageTeamSize: 0
    };

    rfqs.forEach(rfq => {
      // Count by status
      stats.byStatus[rfq.status] = (stats.byStatus[rfq.status] || 0) + 1;
      
      // Calculate totals
      stats.totalHours += rfq.allocations?.reduce((sum, alloc) => sum + (alloc.hours || 0), 0) || 0;
      stats.totalBudget += rfq.budget || 0;
    });

    stats.averageTeamSize = rfqs.length > 0 
      ? rfqs.reduce((sum, rfq) => sum + (rfq.allocations?.length || 0), 0) / rfqs.length 
      : 0;

    return stats;
  }, [rfqs]);

  // Export RFQ data
  const exportRfqs = useCallback((format = 'json') => {
    const data = {
      rfqs,
      exportDate: new Date().toISOString(),
      version: '1.0'
    };

    if (format === 'json') {
      const dataStr = JSON.stringify(data, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);
      
      const link = document.createElement('a');
      link.href = url;
      link.download = `rfqs-export-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  }, [rfqs]);

  // Import RFQ data
  const importRfqs = useCallback(async (file) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      if (data.rfqs && Array.isArray(data.rfqs)) {
        setRfqs(prev => [...prev, ...data.rfqs]);
        setIsLoading(false);
        return data.rfqs.length;
      } else {
        throw new Error('Invalid file format');
      }
    } catch (err) {
      setError('Failed to import RFQs: ' + err.message);
      setIsLoading(false);
      throw err;
    }
  }, []);

  return {
    // State
    rfqs,
    selectedRfq,
    isLoading,
    error,
    
    // Actions
    setSelectedRfq,
    createRfq,
    updateRfq,
    deleteRfq,
    duplicateRfq,
    
    // Utilities
    searchRfqs,
    getRfqStats,
    exportRfqs,
    importRfqs,
    
    // Setters
    setRfqs,
    setError
  };
};

export default useRfqManagement;