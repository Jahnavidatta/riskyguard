import React, { useState } from 'react';
import { 
  Shield, 
  LayoutDashboard, 
  Crosshair, 
  Network, 
  Radar, 
  FileText, 
  Settings, 
  ChevronLeft, 
  ChevronRight, 
  LogOut, 
  User, 
  Building,
  ExternalLink
} from 'lucide-react';

export default function Sidebar({
  activeTab,
  setActiveTab,
  isCollapsed,
  setIsCollapsed,
  currentUser,
  onLogout
}) {
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  const navItems = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'analysis', label: 'Threat Analysis', icon: Crosshair },
    { id: 'connections', label: 'Threat Connections', icon: Network },
    { id: 'warnings', label: 'Early Warnings', icon: Radar },
    { id: 'investigations', label: 'Investigations', icon: FileText },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <aside 
      className={`bg-navy-900 border-r border-slate-800/90 flex flex-col justify-between transition-all duration-200 z-30 select-none ${
        isCollapsed ? 'w-16' : 'w-60'
      }`}
    >
      {/* Top Header & Brand */}
      <div>
        <div className={`h-16 flex items-center px-4 border-b border-slate-800/80 ${isCollapsed ? 'justify-center' : 'justify-between'}`}>
          <div className="flex items-center gap-3 overflow-hidden">
            <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
              <Shield className="w-5 h-5" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <span className="font-semibold text-sm text-white tracking-tight block">RiskRadar</span>
                <span className="text-[10px] text-slate-400 font-mono block uppercase tracking-wider">DRP Platform</span>
              </div>
            )}
          </div>
          {!isCollapsed && (
            <button
              type="button"
              onClick={() => setIsCollapsed(true)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-navy-850 transition-colors"
              title="Collapse sidebar"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Collapsed expand toggle button */}
        {isCollapsed && (
          <div className="p-2 flex justify-center border-b border-slate-800/50">
            <button
              type="button"
              onClick={() => setIsCollapsed(false)}
              className="p-1 rounded-md text-slate-400 hover:text-slate-200 hover:bg-navy-850 transition-colors"
              title="Expand sidebar"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Navigation list */}
        <nav className="p-2 space-y-1 mt-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30 shadow-subtle'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-navy-850/80 border border-transparent'
                } ${isCollapsed ? 'justify-center px-0' : ''}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-teal-400' : 'text-slate-400'}`} />
                {!isCollapsed && <span className="truncate">{item.label}</span>}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Bottom User Profile Section */}
      <div className="p-2 border-t border-slate-800/80 relative">
        <div 
          onClick={() => setShowProfileMenu(!showProfileMenu)}
          className={`flex items-center gap-2.5 p-2 rounded-lg cursor-pointer hover:bg-navy-850 transition-colors ${
            isCollapsed ? 'justify-center' : ''
          }`}
        >
          <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-300 font-medium text-xs shrink-0">
            {currentUser?.full_name ? currentUser.full_name[0].toUpperCase() : 'U'}
          </div>
          {!isCollapsed && (
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-slate-200 truncate leading-tight">
                {currentUser?.full_name || 'Security Analyst'}
              </div>
              <div className="text-[10px] text-slate-400 truncate leading-tight">
                {currentUser?.organization || 'Apex Financial Group'}
              </div>
            </div>
          )}
        </div>

        {/* Profile Dropdown Menu */}
        {showProfileMenu && (
          <div className={`absolute bottom-14 ${isCollapsed ? 'left-16' : 'left-2 right-2'} bg-navy-850 border border-slate-700/80 rounded-xl shadow-card p-2 z-50 text-xs space-y-1 min-w-[200px]`}>
            <div className="px-2.5 py-1.5 border-b border-slate-800">
              <div className="font-medium text-slate-200">{currentUser?.full_name}</div>
              <div className="text-[10px] text-slate-400">{currentUser?.email}</div>
              <div className="text-[10px] text-teal-400 mt-0.5">{currentUser?.role || 'Analyst'} &bull; {currentUser?.organization}</div>
            </div>

            <button
              type="button"
              onClick={() => { setActiveTab('settings'); setShowProfileMenu(false); }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-slate-300 hover:bg-navy-800 transition-colors text-left"
            >
              <Settings className="w-3.5 h-3.5 text-slate-400" />
              <span>Platform Settings</span>
            </button>

            <button
              type="button"
              onClick={() => { setShowProfileMenu(false); onLogout(); }}
              className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-md text-rose-300 hover:bg-rose-500/10 transition-colors text-left"
            >
              <LogOut className="w-3.5 h-3.5 text-rose-400" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}
