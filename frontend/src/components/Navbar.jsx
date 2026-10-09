import React from 'react';
import { 
  ShieldAlert, ShieldCheck, Plus, RefreshCw, Radio, Building2,
  FileSpreadsheet, Terminal
} from 'lucide-react';

export default function Navbar({ 
  brands, 
  selectedBrand, 
  onSelectBrand, 
  activeTab, 
  setActiveTab, 
  onOpenScan, 
  onOpenBrandManager, 
  onResetDemo,
  isResetting 
}) {
  return (
    <header className="sticky top-0 z-40 bg-[#070b14]/90 backdrop-blur-md border-b border-cyan-500/15">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Platform Name */}
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 flex items-center justify-center shadow-glow-cyan">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white font-mono">Risk<span className="text-cyan-400">Radar</span></span>
                <span className="px-1.5 py-0.5 text-[10px] uppercase font-mono font-bold bg-cyan-500/10 text-cyan-300 border border-cyan-500/30 rounded">DRP AI</span>
              </div>
              <p className="text-[11px] text-slate-400 hidden sm:block">Digital Risk Protection Platform</p>
            </div>
          </div>

          {/* Brand Switcher & Live Status */}
          <div className="flex items-center gap-3">
            
            {/* Live Threat Telemetry Badge */}
            <div className="hidden lg:flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 text-xs font-mono">
              <Radio className="w-3.5 h-3.5 animate-pulse text-emerald-400" />
              <span>SOC TELEMETRY: ACTIVE</span>
            </div>

            {/* Brand Filter Selector */}
            <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-700/60 rounded-lg px-2.5 py-1 text-sm">
              <Building2 className="w-4 h-4 text-cyan-400" />
              <select 
                value={selectedBrand || ''} 
                onChange={(e) => onSelectBrand(e.target.value ? Number(e.target.value) : null)}
                className="bg-transparent text-slate-200 text-xs font-medium focus:outline-none cursor-pointer"
              >
                <option value="" className="bg-slate-900 text-slate-200">All Brands (Enterprise-Wide)</option>
                {brands.map(b => (
                  <option key={b.id} value={b.id} className="bg-slate-900 text-slate-200">
                    {b.name} ({b.threat_count || 0})
                  </option>
                ))}
              </select>
            </div>

            {/* Manage Brands Button */}
            <button
              onClick={onOpenBrandManager}
              title="Manage Monitored Brands"
              className="p-2 rounded-lg bg-slate-800/60 border border-slate-700/60 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition"
            >
              <Building2 className="w-4 h-4" />
            </button>

            {/* Reset Demo Data Button */}
            <button
              onClick={onResetDemo}
              disabled={isResetting}
              title="Reload Demonstration Threat Dataset"
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-slate-800/60 border border-slate-700/60 text-xs text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isResetting ? 'animate-spin text-cyan-400' : ''}`} />
              <span>Reset Demo</span>
            </button>

            {/* Scan New Threat Button */}
            <button
              onClick={onOpenScan}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white text-xs font-semibold shadow-glow-cyan transition"
            >
              <Plus className="w-4 h-4" />
              <span>Scan Indicator</span>
            </button>
          </div>

        </div>

        {/* Navigation Tabs */}
        <div className="flex space-x-1 border-t border-slate-800/80 pt-1 pb-2 overflow-x-auto">
          {[
            { id: 'dashboard', label: 'Executive Dashboard' },
            { id: 'threats', label: 'Threats & Investigations' },
            { id: 'graph', label: 'Hidden Connection Finder', highlight: true },
            { id: 'early-warning', label: 'Early Warning Radar' },
            { id: 'simulator', label: 'What-If Risk Simulator', highlight: true }
          ].map(tab => {
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-3.5 py-1.5 text-xs font-medium rounded-md whitespace-nowrap transition-all ${
                  isActive 
                    ? 'bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 shadow-sm' 
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                } ${tab.highlight && !isActive ? 'text-cyan-400/90' : ''}`}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

      </div>
    </header>
  );
}
