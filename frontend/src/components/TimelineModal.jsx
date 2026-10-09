import React, { useState, useEffect } from 'react';
import { 
  X, 
  History, 
  Globe, 
  Server, 
  ShieldAlert, 
  Code, 
  CheckCircle,
  Radio, 
  Calendar
} from 'lucide-react';
import { api } from '../services/api';

export default function TimelineModal({ threat, onClose }) {
  const [timelineData, setTimelineData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadTimeline() {
      if (!threat) return;
      try {
        setLoading(true);
        const data = await api.getTimeline(threat.id);
        setTimelineData(data);
      } catch (err) {
        console.error('Failed to load timeline:', err);
      } finally {
        setLoading(false);
      }
    }
    loadTimeline();
  }, [threat]);

  if (!threat) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="surface-card w-full max-w-2xl max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-navy-900/95 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <History className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">Campaign Evolution Timeline</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  Lifecycle Reconstruction
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">{threat.indicator_value}</p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg bg-navy-950 hover:bg-navy-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Content */}
        <div className="p-6 flex-1 text-slate-200">
          
          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">
              <div className="w-6 h-6 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin mx-auto mb-2" />
              Reconstructing campaign evolutionary stages...
            </div>
          ) : timelineData && timelineData.timeline ? (
            <div className="relative pl-6 space-y-6 border-l border-slate-800 ml-3">
              {timelineData.timeline.map((step, idx) => {
                const isCurrent = step.status === 'Current';
                const isDetected = step.status === 'Detected';

                return (
                  <div key={idx} className="relative group">
                    {/* Timeline Node Dot */}
                    <div 
                      className={`absolute -left-[31px] top-1 w-3.5 h-3.5 rounded-full border-2 border-navy-900 flex items-center justify-center ${
                        isCurrent 
                          ? 'bg-teal-400 animate-pulse' 
                          : isDetected 
                          ? 'bg-rose-500' 
                          : 'bg-slate-700'
                      }`} 
                    />

                    {/* Step Card */}
                    <div className="surface-card p-3.5 space-y-1.5">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between text-xs gap-1">
                        <span className="font-semibold text-white flex items-center gap-2">
                          <span className="text-teal-400 font-mono text-[11px]">Phase {step.stage}:</span>
                          <span>{step.phase}</span>
                        </span>
                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-slate-500" />
                          {step.date}
                        </span>
                      </div>

                      <div className="text-xs font-medium text-slate-200">
                        {step.event}
                      </div>

                      <p className="text-xs text-slate-400 leading-relaxed">
                        {step.details}
                      </p>
                    </div>

                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-400 text-xs">
              Timeline data could not be reconstructed.
            </div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-navy-950 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors"
          >
            Close
          </button>
        </div>

      </div>
    </div>
  );
}
