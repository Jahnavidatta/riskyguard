import React, { useState } from 'react';
import { api } from '../services/api';
import { 
  Radar, 
  AlertTriangle, 
  ShieldAlert, 
  CheckCircle2, 
  Info, 
  Activity, 
  Clock, 
  Check, 
  X, 
  ArrowRight,
  RotateCcw
} from 'lucide-react';

export default function EarlyWarningView({ warningData, onRefresh }) {
  const [filterState, setFilterState] = useState('ALL'); // ALL, Active, Acknowledged, Dismissed
  const [updatingId, setUpdatingId] = useState(null);

  if (!warningData) {
    return (
      <div className="surface-card p-12 text-center text-slate-400 text-xs">
        <div className="w-8 h-8 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin mx-auto mb-3" />
        Synchronizing Early Warning Radar Telemetry...
      </div>
    );
  }

  const { brand_name, monitored_window, signals = [], summary } = warningData;

  const handleStatusChange = async (signalId, newStatus) => {
    try {
      setUpdatingId(signalId);
      await api.updateEarlyWarningStatus(signalId, newStatus);
      if (onRefresh) await onRefresh();
    } catch (err) {
      alert('Failed to update warning status: ' + err.message);
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredSignals = signals.filter(s => {
    if (filterState === 'ALL') return true;
    return s.status === filterState;
  });

  return (
    <div className="space-y-6">
      
      {/* Top Header Card */}
      <div className="surface-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Radar className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">
                Early Warning Radar & Surge Detector
              </h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30">
                {monitored_window} Sliding Window
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Detects unusual increases in lookalike registrations and infrastructure reuse before active phishing campaigns are weaponized against {brand_name}.
            </p>
          </div>
        </div>

        {/* Status Metrics */}
        <div className="flex items-center gap-2 font-mono text-xs shrink-0">
          <div className="px-3 py-1.5 rounded-lg bg-navy-950 border border-slate-800 text-center">
            <span className="text-[10px] text-slate-400 block">Active Signals</span>
            <span className="text-base font-bold text-amber-400">{summary.active_signals_count ?? summary.total_signals}</span>
          </div>
          <div className="px-3 py-1.5 rounded-lg bg-navy-950 border border-rose-500/30 text-center">
            <span className="text-[10px] text-rose-400 block">Critical Surges</span>
            <span className="text-base font-bold text-rose-400">{summary.critical_signals_count}</span>
          </div>
        </div>
      </div>

      {/* Compact Timeline of Emerging Patterns */}
      <div className="surface-card p-5">
        <h3 className="text-xs font-semibold text-slate-200 mb-3 flex items-center gap-2">
          <Clock className="w-3.5 h-3.5 text-teal-400" />
          Timeline of Emerging Patterns (Past 72 Hours)
        </h3>

        <div className="relative pl-6 space-y-4 border-l border-slate-800 ml-2">
          <div className="relative">
            <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-rose-500 border-2 border-navy-900" />
            <div className="text-[11px] font-mono text-rose-400 font-semibold">T-12 Hours &bull; Domain Surge Velocity</div>
            <p className="text-xs text-slate-300 mt-0.5">
              4 combosquatting domains registered simultaneously targeting banking brand keywords.
            </p>
          </div>

          <div className="relative">
            <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-amber-400 border-2 border-navy-900" />
            <div className="text-[11px] font-mono text-amber-400 font-semibold">T-24 Hours &bull; Host Infrastructure Staging</div>
            <p className="text-xs text-slate-300 mt-0.5">
              Bulletproof IP host 185.220.101.45 populated with automated SSL certificates via Namecheap.
            </p>
          </div>

          <div className="relative">
            <span className="absolute -left-[31px] top-1 w-3 h-3 rounded-full bg-blue-400 border-2 border-navy-900" />
            <div className="text-[11px] font-mono text-blue-400 font-semibold">T-48 Hours &bull; Social Media Reconnaissance</div>
            <p className="text-xs text-slate-300 mt-0.5">
              Unverified Twitter and LinkedIn accounts mimicking executive support handles detected.
            </p>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2">
        <div className="flex items-center gap-1.5 text-xs">
          {['ALL', 'Active', 'Acknowledged', 'Dismissed'].map((st) => (
            <button
              key={st}
              type="button"
              onClick={() => setFilterState(st)}
              className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                filterState === st
                  ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-navy-850'
              }`}
            >
              {st} {st === 'Active' && `(${summary.active_signals_count ?? 0})`}
            </button>
          ))}
        </div>
      </div>

      {/* Signals List */}
      <div className="space-y-4">
        {filteredSignals.length > 0 ? (
          filteredSignals.map((signal) => {
            const isCrit = signal.severity === 'Critical';
            const isAcknowledged = signal.status === 'Acknowledged';
            const isDismissed = signal.status === 'Dismissed';

            return (
              <div 
                key={signal.id} 
                className={`surface-card p-5 space-y-3.5 transition-all ${
                  isDismissed ? 'opacity-60 bg-navy-950/40' : ''
                }`}
              >
                {/* Title & Status */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <AlertTriangle className={`w-4 h-4 shrink-0 ${
                      isCrit ? 'text-rose-400' : 'text-amber-400'
                    }`} />
                    <h4 className="text-sm font-semibold text-white tracking-wide">
                      {signal.title}
                    </h4>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-slate-400">
                      Observed {signal.detected_at}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                      isCrit ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                    }`}>
                      {signal.severity} Priority
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                      isAcknowledged ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      isDismissed ? 'bg-slate-800 text-slate-400' :
                      'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                    }`}>
                      {signal.status}
                    </span>
                  </div>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 font-mono text-xs">
                  <div className="p-2.5 rounded-lg bg-navy-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Pattern Signature:</span>
                    <span className="text-teal-300 font-semibold">{signal.pattern_type}</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-navy-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Velocity Cluster:</span>
                    <span className="text-amber-300 font-semibold">{signal.surge_count} Correlated Indicators</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-navy-950 border border-slate-800">
                    <span className="text-[10px] text-slate-500 block">Confidence Metric:</span>
                    <span className="text-emerald-400 font-semibold">{Math.round(signal.confidence * 100)}% Pattern Match</span>
                  </div>
                </div>

                {/* Evidence Summary */}
                <div className="p-3 rounded-lg bg-navy-950/80 border border-slate-800 text-xs text-slate-300 leading-relaxed">
                  <strong className="text-white">Corroborating Evidence: </strong>
                  {signal.evidence_summary}
                </div>

                {/* Countermeasure Recommendation */}
                <div className="p-2.5 rounded-lg bg-teal-500/5 border border-teal-500/20 text-xs text-teal-200">
                  <strong className="text-teal-400">Recommended Preventive Action: </strong>
                  {signal.recommended_action}
                </div>

                {/* Acknowledge / Dismiss Review Controls */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-800/80 text-xs">
                  <div className="flex items-start gap-1.5 text-[11px] text-slate-500 italic">
                    <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-600" />
                    <span><strong>Limitation: </strong>{signal.limitations}</span>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {signal.status === 'Active' ? (
                      <>
                        <button
                          type="button"
                          disabled={updatingId === signal.id}
                          onClick={() => handleStatusChange(signal.id, 'Acknowledged')}
                          className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <Check className="w-3.5 h-3.5" />
                          <span>Acknowledge</span>
                        </button>
                        <button
                          type="button"
                          disabled={updatingId === signal.id}
                          onClick={() => handleStatusChange(signal.id, 'Dismissed')}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
                        >
                          <X className="w-3.5 h-3.5" />
                          <span>Dismiss</span>
                        </button>
                      </>
                    ) : (
                      <button
                        type="button"
                        disabled={updatingId === signal.id}
                        onClick={() => handleStatusChange(signal.id, 'Active')}
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-medium transition-colors flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reactivate Alert</span>
                      </button>
                    )}
                  </div>
                </div>

              </div>
            );
          })
        ) : (
          <div className="surface-card p-12 text-center text-slate-400 text-xs">
            <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p>No early warning records found matching the "{filterState}" filter.</p>
          </div>
        )}
      </div>

    </div>
  );
}
