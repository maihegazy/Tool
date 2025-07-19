'use client';

import React, { useState, useEffect } from 'react';
import { Plus, FileText } from 'lucide-react';

// Import custom hooks
import useAuth from './hooks/useAuth';
import useUtilities from './hooks/useUtilities';
import useRfqManagement from './hooks/useRfqManagement';
import useResourceAllocation from './hooks/useResourceAllocation';

// Import components
import LoginScreen from './components/LoginScreen';
import AppHeader from './components/AppHeader';
import AdminUserManagement from './components/AdminUserManagement';
import RfqCard from './components/RfqCard';
import RateSettingsModal from './components/modals/RateSettingsModal';
import CostProfitAnalysisModal from './components/modals/CostProfitAnalysisModal';
import AppWrapper from './components/AppWrapper';
import RfqDashboard from './components/rfq/RfqDashboard';
import RfqAllocationView from './components/rfq/RfqAllocationView';

const RFQPlanningTool = ({ initialRfqs = [] }) => {
  // Initialize custom hooks
  const auth = useAuth();
  const utils = useUtilities();
  const rfqManager = useRfqManagement(initialRfqs);
  
  // Layout state
  const [currentView, setCurrentView] = useState('dashboard');
  
  // UI state
  const [selectedRfq, setSelectedRfq] = useState(null);
  const [isAddingRfq, setIsAddingRfq] = useState(false);
  
  // Modal states
  const [showRateSettings, setShowRateSettings] = useState(false);
  const [showCostProfitAnalysis, setShowCostProfitAnalysis] = useState(false);

  // Engineer rates configuration
  const [engineerRates, setEngineerRates] = useState({
    'Junior': { HCC: 45, BCC: 35, MCC: 25 },
    'Standard': { HCC: 60, BCC: 50, MCC: 35 },
    'Senior': { HCC: 80, BCC: 65, MCC: 50 },
    'Principal': { HCC: 100, BCC: 80, MCC: 65 },
    'Technical Leader': { HCC: 120, BCC: 95, MCC: 75 },
    'FO': { HCC: 140, BCC: 110, MCC: 85 }
  });

  // Initialize resource allocation hook for selected RFQ
  const resourceAllocation = useResourceAllocation(selectedRfq, engineerRates);

  // Sync allocations back to RFQ when they change
  useEffect(() => {
    if (selectedRfq && resourceAllocation.allocations) {
      rfqManager.updateRfq(selectedRfq.id, {
        allocations: resourceAllocation.allocations
      });
    }
  }, [resourceAllocation.allocations, selectedRfq, rfqManager]);

  // Event handlers
  const handleEditRfq = (rfq) => {
    console.log('Edit RFQ called:', rfq); // Add this debug line
    setSelectedRfq(rfq);
  };

  const handleAnalysisRfq = (rfq) => {
    console.log('Analysis RFQ called:', rfq); // Add this debug line
    setSelectedRfq(rfq);
    setShowCostProfitAnalysis(true);
  };

  // Reset states when user logs out
  useEffect(() => {
    if (!auth.currentUser) {
      setSelectedRfq(null);
      setShowRateSettings(false);
      setShowCostProfitAnalysis(false);
    }
  }, [auth.currentUser]);

  // Show login screen if no user is logged in
  if (!auth.currentUser) {
    return <LoginScreen auth={auth} utils={utils} />;
  }

  // Main content to be wrapped
  const mainContent = (
    <div className="max-w-7xl mx-auto">
      <AppHeader 
        auth={auth}
        utils={utils}
        onShowRateSettings={() => setShowRateSettings(true)}
        onShowCostProfitAnalysis={() => setShowCostProfitAnalysis(true)}
        selectedRfq={selectedRfq}
        setSelectedRfq={setSelectedRfq}
      />

      {/* Main Content Area */}
      {selectedRfq === 'admin' ? (
        <AdminUserManagement auth={auth} utils={utils} />
      ) : selectedRfq ? (
        <RfqAllocationView 
          rfq={selectedRfq}
          auth={auth}
          utils={utils}
          engineerRates={engineerRates}
          resourceAllocation={resourceAllocation} // Pass the advanced hook
          onUpdate={rfqManager.updateRfq}
          onBack={() => setSelectedRfq(null)}
        />
      ) : (
        <RfqDashboard 
          rfqs={rfqManager.rfqs}
          auth={auth}
          utils={utils}
          engineerRates={engineerRates}
          isAddingRfq={isAddingRfq}
          onStartAddRfq={() => setIsAddingRfq(true)}
          onCancelAddRfq={() => setIsAddingRfq(false)}
          onAddRfq={rfqManager.addRfq}
          onDeleteRfq={rfqManager.deleteRfq}
          onEditRfq={handleEditRfq}
          onAnalysisRfq={handleAnalysisRfq}
        />
      )}

      {/* Modals */}
      {showRateSettings && (
        <RateSettingsModal
          engineerRates={engineerRates}
          setEngineerRates={setEngineerRates}
          onClose={() => setShowRateSettings(false)}
        />
      )}

      {showCostProfitAnalysis && selectedRfq && (
        <CostProfitAnalysisModal
          rfq={selectedRfq}
          utils={utils}
          engineerRates={engineerRates}
          resourceAllocation={resourceAllocation} // Enhanced with advanced metrics
          onClose={() => setShowCostProfitAnalysis(false)}
        />
      )}
    </div>
  );

  return (
    <AppWrapper 
      auth={auth} 
      currentView={currentView} 
      onViewChange={setCurrentView}
    >
      {mainContent}
    </AppWrapper>
  );
};

export default RFQPlanningTool;