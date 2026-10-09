import React, { useState } from 'react';
import { 
  X, 
  ShieldAlert, 
  CheckCircle2, 
  AlertTriangle,
  ArrowRight, 
  Globe, 
  ShieldCheck,
  Crosshair,
  ExternalLink
} from 'lucide-react';
import { api } from '../services/api';

export default function ScanThreatModal({ brands, onClose, onThreatCreated, onNavigateTab }) {
  const [indicator, setIndicator] = useState('');
  const [threatType, setThreatType] = useState('Phishing Website');
  const [brandId, setBrandId] = useState(brands[0]?.id || '');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [scanResult, setScanResult] = useState(null);

  const handleScan = async (e) => {
    e.preventDefault();
    if (!indicator.trim()) {
      setError('Please provide a suspicious URL or indicator link.');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      const res = await api.scanThreat({
        indicator_value: indicator.trim(),
        threat_type: threatType,
        brand_id: brandId ? Number(brandId) : null,
        title: title.trim() || undefined,
        notes: notes.trim() || undefined
      });

      setScanResult(res);
      if (onThreatCreated) onThreatCreated(res);
    } catch (err) {
      setError(err.message || 'Threat scan failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs animate-in fade-in">
      <div className="surface-card w-full max-w-xl max-h-[90vh] overflow-y-auto flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-navy-900/95 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400">
              <Crosshair className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-sm font-semibold text-white">Threat Telemetry Scanner</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-500/10 text-teal-300 border border-teal-500/20">
                  SSRF PROTECTED
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">Submit external URL or profile for AI-driven risk scoring</p>
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

        {/* Content */}
        <div className="p-6 space-y-4 flex-1 text-xs">
          
          {error && (
            <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {scanResult ? (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-navy-950 border border-slate-800 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <div>
                    <span className="text-[10px] text-slate-500 uppercase font-mono">Assigned Severity</span>
                    <div className="text-base font-bold text-white flex items-center gap-2 mt-0.5">
                      <span className={`px-2 py-0.5 rounded text-xs ${
                        scanResult.risk_score >= 70 ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
                        scanResult.risk_score >= 40 ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                        'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {scanResult.severity} ({scanResult.risk_score}/100)
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 uppercase font-mono">Status</span>
                    <div className="text-xs font-semibold text-teal-400 mt-0.5">Logged as {scanResult.status}</div>
                  </div>
                </div>

                <div className="font-mono text-slate-300 break-all text-xs">
                  {scanResult.indicator_value}
                </div>

                {scanResult.detection_reasons && scanResult.detection_reasons.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] text-slate-400 font-semibold">Key Detection Reasons:</span>
                    {scanResult.detection_reasons.slice(0, 3).map((r, i) => (
                      <div key={i} className="text-[11px] text-slate-300 flex items-start gap-1.5">
                        <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1 shrink-0" />
                        <span>{r}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setScanResult(null);
                    setIndicator('');
                  }}
                  className="px-3 py-1.5 rounded-lg bg-navy-950 hover:bg-navy-800 border border-slate-800 text-slate-300 text-xs transition-colors"
                >
                  Analyze Another
                </button>
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-1.5 rounded-lg bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleScan} className="space-y-3.5">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Suspicious Indicator / URL <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="https://apex-banking-update.xyz/login"
                  value={indicator}
                  onChange={(e) => setIndicator(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500/60"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Target Brand
                  </label>
                  <select
                    value={brandId}
                    onChange={(e) => setBrandId(e.target.value)}
                    className="w-full bg-navy-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500/60 cursor-pointer"
                  >
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Threat Type
                  </label>
                  <select
                    value={threatType}
                    onChange={(e) => setThreatType(e.target.value)}
                    className="w-full bg-navy-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500/60 cursor-pointer"
                  >
                    <option value="Phishing Website">Phishing Website</option>
                    <option value="Typosquatting Domain">Typosquatting Domain</option>
                    <option value="Fake Support Profile">Fake Support Profile</option>
                    <option value="Malicious App">Malicious App</option>
                    <option value="Executive Impersonation">Executive Impersonation</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  placeholder="e.g. Credential Harvester Lookalike"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500/60"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1">
                  Analyst Notes
                </label>
                <textarea
                  rows={2}
                  placeholder="Context regarding source of telemetry or observed lure..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full bg-navy-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500/60 resize-none"
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {loading ? (
                    <span>Evaluating...</span>
                  ) : (
                    <>
                      <span>Scan Threat</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </div>
            </form>
          )}

        </div>

      </div>
    </div>
  );
}
