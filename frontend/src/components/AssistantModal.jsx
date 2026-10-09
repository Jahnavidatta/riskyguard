import React, { useState, useEffect } from 'react';
import { 
  X, 
  Sparkles, 
  ShieldAlert, 
  CheckCircle, 
  AlertCircle, 
  FileText,
  ExternalLink, 
  ArrowRight, 
  Download, 
  HelpCircle,
  ShieldCheck,
  CheckCircle2
} from 'lucide-react';
import { api } from '../services/api';

export default function AssistantModal({ threat, onClose }) {
  const [brief, setBrief] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadBrief() {
      if (!threat) return;
      try {
        setLoading(true);
        const data = await api.getAssistantBrief(threat.id);
        setBrief(data);
      } catch (err) {
        console.error('Failed to load assistant brief:', err);
      } finally {
        setLoading(false);
      }
    }
    loadBrief();
  }, [threat]);

  if (!threat) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="surface-card w-full max-w-3xl max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Modal Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-navy-900/95 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">Explainable Investigation Assistant</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  AI SOC COPILOT
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono mt-0.5">Threat #{threat.id}: {threat.domain}</p>
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
        <div className="p-6 space-y-5 flex-1 text-slate-200 text-xs">
          
          {loading ? (
            <div className="py-12 text-center text-slate-400">
              <div className="w-6 h-6 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin mx-auto mb-2" />
              <p className="font-mono text-xs">Synthesizing threat evidence and formulating SOC investigation playbook...</p>
            </div>
          ) : brief ? (
            <>
              {/* Executive Summary */}
              <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 leading-relaxed text-slate-300">
                <span className="font-semibold text-white block mb-1">Executive Threat Brief:</span>
                {brief.executive_summary}
              </div>

              {/* Score Explanation & Takedown Readiness */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-navy-950 border border-slate-800 space-y-1">
                  <div className="text-[11px] text-slate-400">Assessment Rationale:</div>
                  <div className="text-xs font-semibold text-white">
                    {brief.score_explanation?.severity} Severity ({brief.score_explanation?.score}/100)
                  </div>
                  <div className="text-[11px] text-slate-400 leading-relaxed">
                    {brief.score_explanation?.rationale}
                  </div>
                </div>

                <div className="p-3.5 rounded-xl bg-teal-500/10 border border-teal-500/30 space-y-1">
                  <div className="text-[11px] text-teal-400 flex items-center gap-1.5 font-medium">
                    <ShieldCheck className="w-4 h-4" />
                    Takedown Readiness Status:
                  </div>
                  <div className="text-xs font-bold text-teal-200">
                    {brief.takedown_readiness}
                  </div>
                  <div className="text-[11px] text-slate-300">
                    Corroborated technical markers meet ICANN & registrar abuse dispatch requirements.
                  </div>
                </div>
              </div>

              {/* Missing Evidence Checklist */}
              <div>
                <h4 className="text-xs font-semibold text-slate-200 mb-2.5 flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-amber-400" />
                  Missing Evidence & Corroboration Checklist:
                </h4>
                <div className="space-y-2">
                  {brief.missing_evidence_checklist && brief.missing_evidence_checklist.map((item, idx) => (
                    <div key={idx} className="p-3 rounded-lg bg-navy-950 border border-slate-800 flex items-start justify-between gap-3">
                      <div>
                        <div className="font-semibold text-slate-200 text-xs">{item.item}</div>
                        <div className="text-[11px] text-slate-400 mt-0.5">{item.action}</div>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/15 text-amber-300 border border-amber-500/30 shrink-0">
                        {item.status}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Step-by-Step Suggested Playbook */}
              <div>
                <h4 className="text-xs font-semibold text-slate-200 mb-2.5 flex items-center gap-2">
                  <FileText className="w-4 h-4 text-teal-400" />
                  Recommended SOC Mitigation Playbook:
                </h4>
                <div className="space-y-2">
                  {brief.suggested_investigation_playbook && brief.suggested_investigation_playbook.map((step) => (
                    <div key={step.step} className="p-3 rounded-lg bg-navy-950 border border-slate-800 flex items-start gap-3">
                      <div className="w-5 h-5 rounded-full bg-teal-500/20 text-teal-400 flex items-center justify-center font-bold text-[11px] shrink-0 mt-0.5">
                        {step.step}
                      </div>
                      <div>
                        <div className="font-semibold text-white text-xs">{step.title}</div>
                        <div className="text-[11px] text-slate-300 mt-0.5 leading-relaxed">{step.description}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          ) : (
            <div className="text-center py-8 text-slate-500">Failed to load assistant analysis.</div>
          )}

        </div>

        {/* Modal Footer */}
        <div className="p-4 border-t border-slate-800 bg-navy-950 flex items-center justify-between">
          <a
            href={`/api/reports/export/${threat.id}`}
            target="_blank"
            rel="noreferrer"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium transition-colors"
          >
            <Download className="w-3.5 h-3.5 text-amber-400" />
            <span>Export Printable HTML Dossier</span>
          </a>

          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium transition-colors"
          >
            Close Copilot
          </button>
        </div>

      </div>
    </div>
  );
}
