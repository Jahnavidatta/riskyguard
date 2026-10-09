import React from 'react';
import { 
  ShieldAlert, 
  AlertTriangle, 
  FileText, 
  TrendingUp, 
  ArrowUpRight, 
  ExternalLink,
  Radar,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer, 
  CartesianGrid 
} from 'recharts';

export default function DashboardView({
  stats,
  selectedBrandObj,
  currentUser,
  onNavigateTab,
  onSelectThreat
}) {
  const metrics = stats?.metrics || {
    active_threats: 0,
    high_risk_threats: 0,
    open_investigations: 0
  };

  const activityData = stats?.activity_chart || [];
  const recentHighPriority = stats?.recent_high_priority || [];
  const earlyWarning = stats?.early_warning_summary || { has_warnings: false };

  const brandDisplayName = selectedBrandObj ? selectedBrandObj.name : 'All Registered Brands';

  return (
    <div className="space-y-6">
      
      {/* 1. Concise Welcome & Selected Brand Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-1 border-b border-slate-800/60">
        <div>
          <h1 className="text-xl font-semibold text-white tracking-tight">
            Security Overview
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Welcome back, <span className="text-slate-200 font-medium">{currentUser?.full_name || 'Analyst'}</span>. Monitoring digital risks for{' '}
            <span className="text-teal-400 font-medium">{brandDisplayName}</span>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            Continuous Monitoring Active
          </span>
        </div>
      </div>

      {/* 2. Small Early-Warning Summary (when available) */}
      {earlyWarning.has_warnings && (
        <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-200 text-xs flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <Radar className="w-4 h-4 text-amber-400 shrink-0" />
            <div>
              <span className="font-semibold text-amber-300">
                {earlyWarning.active_count} Active Early Warning Signal{earlyWarning.active_count > 1 ? 's' : ''}:
              </span>{' '}
              <span className="text-slate-300">{earlyWarning.latest_alert?.title}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('warnings')}
            className="text-[11px] font-medium text-amber-300 hover:text-amber-100 flex items-center gap-1 hover:underline shrink-0"
          >
            <span>Review Radar</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* 3. Three Key Metrics (Active Threats, High-Risk Threats, Open Investigations) */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        {/* Metric 1: Active Threats */}
        <div 
          onClick={() => onNavigateTab('investigations')}
          className="surface-card p-5 surface-hover cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Active Threats</span>
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-400 flex items-center justify-center">
              <ShieldAlert className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {metrics.active_threats}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span>External indicators under surveillance</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-blue-400 transition-colors" />
          </div>
        </div>

        {/* Metric 2: High-Risk Threats */}
        <div 
          onClick={() => onNavigateTab('investigations')}
          className="surface-card p-5 surface-hover cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">High-Risk Threats</span>
            <div className="w-8 h-8 rounded-lg bg-rose-500/10 text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {metrics.high_risk_threats}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span>Risk score ≥ 70 requiring takedown</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-rose-400 transition-colors" />
          </div>
        </div>

        {/* Metric 3: Open Investigations */}
        <div 
          onClick={() => onNavigateTab('investigations')}
          className="surface-card p-5 surface-hover cursor-pointer group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400">Open Investigations</span>
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-400 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">
            {metrics.open_investigations}
          </div>
          <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-800/80 text-[11px] text-slate-400">
            <span>New, Review & Reported cases</span>
            <ArrowUpRight className="w-3.5 h-3.5 text-slate-500 group-hover:text-teal-400 transition-colors" />
          </div>
        </div>

      </div>

      {/* 4. One Clear Threat Activity Chart */}
      <div className="surface-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Threat Activity & Ingestion Volume
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Daily telemetry over the past 7 days (All Ingested vs High-Risk Severity)
            </p>
          </div>
          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-blue-500" />
              <span className="text-slate-300 text-[11px]">All Ingested</span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
              <span className="text-slate-300 text-[11px]">High-Risk</span>
            </div>
          </div>
        </div>

        <div className="h-64 w-full">
          {activityData.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={activityData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="totalColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.25}/>
                    <stop offset="95%" stopColor="#38bdf8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="highRiskColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                <XAxis 
                  dataKey="date" 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={{ stroke: '#334155' }}
                />
                <YAxis 
                  stroke="#64748b" 
                  fontSize={11} 
                  tickLine={false} 
                  axisLine={{ stroke: '#334155' }}
                  allowDecimals={false}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '8px',
                    fontSize: '12px',
                    color: '#f8fafc'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="threats" 
                  name="All Threats"
                  stroke="#38bdf8" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#totalColor)" 
                />
                <Area 
                  type="monotone" 
                  dataKey="high_risk" 
                  name="High-Risk"
                  stroke="#ef4444" 
                  strokeWidth={2}
                  fillOpacity={1} 
                  fill="url(#highRiskColor)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-500">
              No historical trend data available.
            </div>
          )}
        </div>
      </div>

      {/* 5. Compact List of Recent High-Priority Threats */}
      <div className="surface-card p-5">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-100">
              Recent High-Priority Threats
            </h2>
            <p className="text-[11px] text-slate-400 mt-0.5">
              Indicators flagged with critical impersonation or deceptive characteristics
            </p>
          </div>
          <button
            type="button"
            onClick={() => onNavigateTab('investigations')}
            className="text-xs text-teal-400 hover:text-teal-300 font-medium flex items-center gap-1 hover:underline"
          >
            <span>View All in Investigations</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentHighPriority.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="pb-2.5">Indicator / Domain</th>
                  <th className="pb-2.5">Threat Type</th>
                  <th className="pb-2.5">Risk Score</th>
                  <th className="pb-2.5">Status</th>
                  <th className="pb-2.5">Data Tag</th>
                  <th className="pb-2.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {recentHighPriority.map((t) => {
                  const isHigh = t.risk_score >= 70;
                  return (
                    <tr key={t.id} className="hover:bg-navy-850/50 transition-colors">
                      <td className="py-3 font-mono text-slate-200">
                        <span className="font-semibold text-white block">{t.domain}</span>
                        <span className="text-[10px] text-slate-500 truncate block max-w-xs">{t.title}</span>
                      </td>
                      <td className="py-3 text-slate-300">
                        {t.threat_type}
                      </td>
                      <td className="py-3">
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                            isHigh ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {t.risk_score}/100
                          </span>
                          <span className="text-[11px] text-slate-400">{t.severity}</span>
                        </div>
                      </td>
                      <td className="py-3">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                          t.status === 'Resolved' ? 'bg-emerald-500/10 text-emerald-400' :
                          t.status === 'Reported' ? 'bg-purple-500/10 text-purple-400' :
                          t.status === 'Under Review' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-blue-500/10 text-blue-400'
                        }`}>
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3">
                        {t.is_sample ? (
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 text-[10px] font-mono border border-slate-700/60">
                            [SAMPLE DATA]
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-400 text-[10px] font-mono border border-teal-500/20">
                            [LIVE]
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-right">
                        <button
                          type="button"
                          onClick={() => {
                            if (onSelectThreat) onSelectThreat(t);
                            onNavigateTab('investigations');
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
                        >
                          Inspect Case
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            No high-priority threats recorded.
          </div>
        )}
      </div>

    </div>
  );
}
