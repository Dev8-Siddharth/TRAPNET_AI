import React, { useState, useEffect } from 'react';
import { 
  Shield, LayoutDashboard, PlusCircle, FileText, Network, 
  Bot, Flame, MapPin, Settings, Menu, X, Info, Sparkles 
} from 'lucide-react';
import Dashboard from './components/Dashboard';
import NewInvestigation from './components/NewInvestigation';
import CasesList from './components/CasesList';
import ThreatIntelligence from './components/ThreatIntelligence';
import FraudGraph from './components/FraudGraph';
import AIInvestigator from './components/AIInvestigator';
import ReportsView from './components/ReportsView';
import NearbyOffices from './components/NearbyOffices';
import SettingsView from './components/SettingsView';
import { InvestigationRecord } from './types';
import { DEMO_INVESTIGATIONS } from './demoData';

type TabType = 
  | 'dashboard' 
  | 'investigate' 
  | 'cases' 
  | 'threats' 
  | 'graph' 
  | 'investigator' 
  | 'reports' 
  | 'offices' 
  | 'settings';

const App: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>('investigate');
  const [investigations, setInvestigations] = useState<InvestigationRecord[]>(DEMO_INVESTIGATIONS);
  const [activeInvestigation, setActiveInvestigation] = useState<InvestigationRecord | null>(DEMO_INVESTIGATIONS[0]);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Load from local storage if available
  useEffect(() => {
    const saved = localStorage.getItem('trapnet_investigations');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setInvestigations(parsed);
          setActiveInvestigation(parsed[0]);
        }
      } catch (e) {
        // use default demo cases
      }
    }
  }, []);

  const handleInvestigationCreated = (newRecord: InvestigationRecord) => {
    setInvestigations(prev => {
      const exists = prev.some(r => r.id === newRecord.id);
      const updated = exists ? prev.map(r => r.id === newRecord.id ? newRecord : r) : [newRecord, ...prev];
      localStorage.setItem('trapnet_investigations', JSON.stringify(updated));
      return updated;
    });
    setActiveInvestigation(newRecord);
  };

  const handleSelectCase = (record: InvestigationRecord) => {
    setActiveInvestigation(record);
    setActiveTab('investigate');
  };

  const NavItem = ({ id, label, icon: Icon }: { id: TabType; label: string; icon: any }) => (
    <button
      onClick={() => {
        setActiveTab(id);
        setIsSidebarOpen(false);
      }}
      className={`flex items-center space-x-3 px-3.5 py-2.5 rounded-xl transition-all w-full text-xs font-semibold ${
        activeTab === id
          ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30 shadow-lg shadow-blue-900/20'
          : 'text-gray-400 hover:bg-white/5 hover:text-white'
      }`}
    >
      <Icon size={18} />
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#0a0a0a] text-gray-200">
      {/* Mobile Header */}
      <div className="md:hidden flex items-center justify-between p-4 charcoal-bg border-b border-white/5">
        <div className="flex items-center space-x-2">
          <div className="rotate-3d shrink-0">
            <Shield className="text-blue-500" size={24} />
          </div>
          <div>
            <span className="font-extrabold text-sm text-white tracking-tight block">TRAPNET AI</span>
            <span className="text-[9px] text-blue-400 font-mono">Multimodal Fraud Platform</span>
          </div>
        </div>
        <button onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
          {isSidebarOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Sidebar Navigation */}
      <aside className={`fixed md:relative z-50 inset-y-0 left-0 w-72 charcoal-bg border-r border-white/5 p-5 transition-transform duration-300 transform 
        ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0 flex flex-col justify-between`}>
        <div>
          {/* Brand Logo */}
          <div className="hidden md:flex items-center space-x-3 mb-8 pb-4 border-b border-white/5">
            <div className="rotate-3d shrink-0 p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30 shadow-lg">
              <Shield size={28} />
            </div>
            <div>
              <h1 className="font-black text-lg text-white tracking-tight leading-none">TRAPNET AI</h1>
              <p className="text-[10px] text-blue-400 font-mono tracking-widest uppercase mt-1">
                Cognitive Security System
              </p>
            </div>
          </div>

          {/* Navigation Links */}
          <nav className="space-y-1.5">
            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mb-2 ml-3 font-mono">Investigation Hub</p>
            <NavItem id="dashboard" label="Dashboard" icon={LayoutDashboard} />
            <NavItem id="investigate" label="Investigate" icon={PlusCircle} />
            <NavItem id="cases" label="Cases Registry" icon={FileText} />

            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mt-5 mb-2 ml-3 font-mono">Fraud Intelligence</p>
            <NavItem id="threats" label="Threat Intelligence" icon={Flame} />
            <NavItem id="graph" label="Fraud Intelligence Graph" icon={Network} />
            <NavItem id="investigator" label="AI Investigator" icon={Bot} />

            <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider mt-5 mb-2 ml-3 font-mono">Output & Tools</p>
            <NavItem id="reports" label="Evidence Pack Reports" icon={FileText} />
            <NavItem id="offices" label="Cybersecurity Nearby" icon={MapPin} />
            <NavItem id="settings" label="Settings" icon={Settings} />
          </nav>
        </div>

        {/* Footer Mission Status */}
        <div className="mt-8 p-3.5 rounded-xl bg-blue-900/10 border border-blue-800/20 text-xs">
          <div className="flex items-center space-x-2 text-blue-400 mb-1">
            <Sparkles size={14} />
            <span className="font-bold text-[10px] uppercase tracking-wider">Engine Status</span>
          </div>
          <p className="text-[11px] text-gray-400 leading-tight">
            Gemini 3 Multimodal & ML Feature Risk Engine Active.
          </p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 lg:p-10">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'dashboard' && (
            <Dashboard 
              reports={investigations} 
              onNavigate={setActiveTab} 
              onSelectCase={handleSelectCase} 
            />
          )}

          {activeTab === 'investigate' && (
            <NewInvestigation
              onInvestigationCreated={handleInvestigationCreated}
              onOpenInvestigator={() => setActiveTab('investigator')}
              onPrepareReport={() => setActiveTab('reports')}
            />
          )}

          {activeTab === 'cases' && (
            <CasesList 
              cases={investigations} 
              onSelectCase={handleSelectCase} 
            />
          )}

          {activeTab === 'threats' && <ThreatIntelligence />}

          {activeTab === 'graph' && (
            <FraudGraph nodes={activeInvestigation?.connected_entities} />
          )}

          {activeTab === 'investigator' && (
            <AIInvestigator activeInvestigation={activeInvestigation} />
          )}

          {activeTab === 'reports' && (
            <ReportsView 
              investigation={activeInvestigation} 
              allInvestigations={investigations} 
            />
          )}

          {activeTab === 'offices' && <NearbyOffices />}

          {activeTab === 'settings' && <SettingsView />}
        </div>
      </main>

      {/* Mobile Sidebar Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/70 z-40 md:hidden backdrop-blur-sm" 
          onClick={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
};

export default App;
