import React from 'react';
import { Shield, ChevronDown, Plus, Search, Building2 } from 'lucide-react';

export default function Header({
  activeTab,
  brands,
  selectedBrand,
  onSelectBrand,
  onOpenScan,
  onOpenBrandManager
}) {
  const getTabTitle = () => {
    switch (activeTab) {
      case 'overview': return { title: 'Security Overview', desc: 'Enterprise Digital Risk Posture' };
      case 'analysis': return { title: 'Threat Analysis', desc: 'Explainable AI Threat Detection & Risk Scoring' };
      case 'connections': return { title: 'Threat Connections', desc: 'Hidden Threat Connection Finder & NetworkX Topology' };
      case 'warnings': return { title: 'Early Warnings', desc: 'Surge Velocity & Infrastructure Reuse Signals' };
      case 'investigations': return { title: 'Investigations', desc: 'Evidence Dossiers & Incident Case Management' };
      case 'settings': return { title: 'Platform Settings', desc: 'Brand Management & Organization Preferences' };
      default: return { title: 'RiskRadar', desc: 'Digital Risk Protection' };
    }
  };

  const currentBrand = brands.find(b => b.id === Number(selectedBrand));
  const { title, desc } = getTabTitle();

  return (
    <header className="h-16 bg-navy-900 border-b border-slate-800/90 px-4 sm:px-6 flex items-center justify-between z-20">
      {/* Title & Breadcrumbs */}
      <div>
        <h2 className="text-sm font-semibold text-white tracking-tight leading-none">
          {title}
        </h2>
        <p className="text-[11px] text-slate-400 mt-0.5 hidden sm:block">
          {desc}
        </p>
      </div>

      {/* Right Controls: Brand Selector + Action */}
      <div className="flex items-center gap-3">
        {/* Brand Selector */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 hidden md:block">Scope:</label>
          <div className="relative">
            <select
              value={selectedBrand || ''}
              onChange={(e) => onSelectBrand(e.target.value ? Number(e.target.value) : null)}
              className="appearance-none bg-navy-950 border border-slate-800 text-xs font-medium text-slate-200 rounded-lg pl-3 pr-8 py-1.5 focus:outline-none focus:border-teal-500/60 focus:ring-1 focus:ring-teal-500/20 cursor-pointer"
            >
              <option value="">All Monitored Brands ({brands.length})</option>
              {brands.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.name} ({b.official_domain})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-2 pointer-events-none" />
          </div>
        </div>

        {/* Action Button: Quick Analyze */}
        <button
          type="button"
          onClick={onOpenScan}
          className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-subtle shrink-0"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Analyze Threat</span>
          <span className="sm:hidden">Scan</span>
        </button>
      </div>
    </header>
  );
}
