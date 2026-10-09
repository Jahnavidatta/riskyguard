import React, { useState, useEffect, useCallback } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import DashboardView from './components/DashboardView';
import ThreatAnalysisView from './components/ThreatAnalysisView';
import ThreatGraphView from './components/ThreatGraphView';
import EarlyWarningView from './components/EarlyWarningView';
import ThreatsTableView from './components/ThreatsTableView';
import SettingsView from './components/SettingsView';
import AuthView from './components/AuthView';
import AssistantModal from './components/AssistantModal';
import TimelineModal from './components/TimelineModal';
import ScanThreatModal from './components/ScanThreatModal';
import { api } from './services/api';
import { Radio } from 'lucide-react';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(api.getStoredUser());
  const [authChecking, setAuthChecking] = useState(true);

  // Layout & Navigation State
  const [activeTab, setActiveTab] = useState('overview'); // overview, analysis, connections, warnings, investigations, settings
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // Platform Data State
  const [brands, setBrands] = useState([]);
  const [selectedBrand, setSelectedBrand] = useState(null);
  const [threats, setThreats] = useState([]);
  const [stats, setStats] = useState(null);
  const [graphData, setGraphData] = useState(null);
  const [warningData, setWarningData] = useState(null);
  const [loading, setLoading] = useState(false);

  // Modals State
  const [isScanOpen, setIsScanOpen] = useState(false);
  const [assistantThreat, setAssistantThreat] = useState(null);
  const [timelineThreat, setTimelineThreat] = useState(null);

  // 1. Initial Authentication Check
  useEffect(() => {
    async function verifyAuth() {
      const token = api.getToken();
      if (!token) {
        setCurrentUser(null);
        setAuthChecking(false);
        return;
      }
      try {
        const user = await api.getMe();
        setCurrentUser(user);
        localStorage.setItem('riskradar_user', JSON.stringify(user));
      } catch (err) {
        console.warn('Session expired or invalid:', err);
        api.logout();
        setCurrentUser(null);
      } finally {
        setAuthChecking(false);
      }
    }

    verifyAuth();

    const handleUnauthorized = () => {
      setCurrentUser(null);
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  // 2. Data Fetching
  const fetchData = useCallback(async () => {
    if (!currentUser) return;
    try {
      setLoading(true);
      const [brandsData, threatsData, statsData, graphRes, warningsRes] = await Promise.all([
        api.getBrands(),
        api.getThreats({ brand_id: selectedBrand }),
        api.getDashboardStats(selectedBrand),
        api.getThreatGraph(selectedBrand),
        api.getEarlyWarnings(selectedBrand)
      ]);

      setBrands(brandsData);
      setThreats(threatsData);
      setStats(statsData);
      setGraphData(graphRes);
      setWarningData(warningsRes);
    } catch (err) {
      console.error('Failed to load platform data:', err);
    } finally {
      setLoading(false);
    }
  }, [currentUser, selectedBrand]);

  useEffect(() => {
    if (currentUser) {
      fetchData();
    }
  }, [currentUser, selectedBrand, fetchData]);

  // Handlers
  const handleAuthSuccess = (user) => {
    setCurrentUser(user);
    setActiveTab('overview');
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
  };

  const handleUpdateStatus = async (threatId, newStatus) => {
    try {
      await api.updateThreatStatus(threatId, newStatus);
      await fetchData();
    } catch (err) {
      alert('Failed to update case status: ' + err.message);
    }
  };

  const handleResetDemo = async () => {
    if (!window.confirm('Reset database to clean demonstration sample data?')) return;
    try {
      setLoading(true);
      await api.resetDemoData();
      await fetchData();
      alert('Demonstration dataset reset successfully.');
    } catch (err) {
      alert('Failed to reset demo dataset: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  // If initial auth check is running
  if (authChecking) {
    return (
      <div className="min-h-screen bg-navy-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin" />
      </div>
    );
  }

  // If user is not authenticated, show Login & Sign Up view
  if (!currentUser) {
    return <AuthView onAuthSuccess={handleAuthSuccess} />;
  }

  const selectedBrandObj = brands.find(b => b.id === Number(selectedBrand));

  return (
    <div className="min-h-screen bg-navy-950 text-slate-100 flex font-sans antialiased overflow-x-hidden">
      
      {/* Compact Collapsible Sidebar (Section 3: Only the 6 requested items) */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isCollapsed={isSidebarCollapsed}
        setIsCollapsed={setIsSidebarCollapsed}
        currentUser={currentUser}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
        
        {/* Top Header */}
        <Header
          activeTab={activeTab}
          brands={brands}
          selectedBrand={selectedBrand}
          onSelectBrand={setSelectedBrand}
          onOpenScan={() => setIsScanOpen(true)}
          onOpenBrandManager={() => setActiveTab('settings')}
        />

        {/* View Container */}
        <main className="flex-1 p-4 sm:p-6 max-w-7xl w-full mx-auto space-y-6">
          {loading && !threats.length ? (
            <div className="flex flex-col items-center justify-center min-h-[40vh] space-y-3">
              <div className="w-8 h-8 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin" />
              <p className="text-xs text-slate-400 font-mono">Synchronizing telemetry & graph models...</p>
            </div>
          ) : (
            <>
              {/* 1. Overview (Section 8) */}
              {activeTab === 'overview' && (
                <DashboardView
                  stats={stats}
                  selectedBrandObj={selectedBrandObj}
                  currentUser={currentUser}
                  onNavigateTab={setActiveTab}
                  onSelectThreat={(t) => setAssistantThreat(t)}
                />
              )}

              {/* 2. Threat Analysis (Section 9 + Section 7 Simulator) */}
              {activeTab === 'analysis' && (
                <ThreatAnalysisView
                  brands={brands}
                  selectedBrand={selectedBrand}
                  onThreatCreated={fetchData}
                  onNavigateTab={setActiveTab}
                />
              )}

              {/* 3. Threat Connections (Section 5: NetworkX Connection Finder) */}
              {activeTab === 'connections' && (
                <ThreatGraphView
                  graphData={graphData}
                  onSelectThreat={(t) => {
                    const match = threats.find(item => item.id === t.id);
                    if (match) setAssistantThreat(match);
                  }}
                />
              )}

              {/* 4. Early Warnings (Section 6) */}
              {activeTab === 'warnings' && (
                <EarlyWarningView
                  warningData={warningData}
                  onRefresh={fetchData}
                />
              )}

              {/* 5. Investigations (Section 4.E) */}
              {activeTab === 'investigations' && (
                <ThreatsTableView
                  threats={threats}
                  onOpenAssistant={(t) => setAssistantThreat(t)}
                  onOpenTimeline={(t) => setTimelineThreat(t)}
                  onUpdateStatus={handleUpdateStatus}
                  onOpenScan={() => setIsScanOpen(true)}
                />
              )}

              {/* 6. Settings (Section 4.A + Preferences) */}
              {activeTab === 'settings' && (
                <SettingsView
                  currentUser={currentUser}
                  brands={brands}
                  onRefreshBrands={fetchData}
                  onResetDemo={handleResetDemo}
                />
              )}
            </>
          )}
        </main>

        {/* Minimal Footer */}
        <footer className="border-t border-slate-800/80 bg-navy-900 py-3 text-[11px] text-slate-500 px-4 sm:px-6">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>RiskRadar Platform v1.0 &bull; NetworkX Graph Engine Operational</span>
            </div>
            <div className="flex items-center gap-3 font-mono text-[10px]">
              <span>Organization: {currentUser?.organization}</span>
              <span>Backend: FastAPI (:8000)</span>
              <a href="/api/docs" target="_blank" rel="noreferrer" className="text-teal-400 hover:underline">
                OpenAPI Docs
              </a>
            </div>
          </div>
        </footer>

      </div>

      {/* Global Modals */}
      {isScanOpen && (
        <ScanThreatModal
          brands={brands}
          onClose={() => setIsScanOpen(false)}
          onThreatCreated={fetchData}
          onNavigateTab={setActiveTab}
        />
      )}

      {assistantThreat && (
        <AssistantModal
          threat={assistantThreat}
          onClose={() => setAssistantThreat(null)}
        />
      )}

      {timelineThreat && (
        <TimelineModal
          threat={timelineThreat}
          onClose={() => setTimelineThreat(null)}
        />
      )}

    </div>
  );
}
