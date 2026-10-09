import React, { useState } from 'react';
import { api } from '../services/api';
import SimulatorView from './SimulatorView';
import { 
  Crosshair, 
  Search, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ArrowRight, 
  ExternalLink,
  Sliders,
  ShieldCheck,
  Server,
  Globe,
  FileText
} from 'lucide-react';

export default function ThreatAnalysisView({
  brands,
  selectedBrand,
  onThreatCreated,
  onNavigateTab
}) {
  const [activeSubTab, setActiveSubTab] = useState('live_analysis'); // 'live_analysis' or 'what_if_simulator'
  
  // Form State
  const [indicatorValue, setIndicatorValue] = useState('');
  const [threatType, setThreatType] = useState('Phishing Website');
  const [brandId, setBrandId] = useState(selectedBrand || (brands[0]?.id || ''));
  const [customTitle, setCustomTitle] = useState('');
  const [analystNotes, setAnalystNotes] = useState('');

  // Execution State
  const [analyzing, setAnalyzing] = useState(false);
  const [analysisStage, setAnalysisStage] = useState('');
  const [analysisResult, setAnalysisResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  const quickSamples = [
    { label: 'Phishing Portal', url: 'https://apex-bank-verify.xyz/login.php', type: 'Phishing Website' },
    { label: 'Fake X Support', url: 'https://twitter.com/ApexBank_HelpDesk_Official', type: 'Fake Support Profile' },
    { label: 'Combosquatting KYC', url: 'https://apex-banking-update.click', type: 'Typosquatting Domain' },
    { label: 'Crypto Seed Trap', url: 'https://safepay-wallet-recovery.work', type: 'Phishing Website' },
  ];

  const handleRunAnalysis = async (e) => {
    e.preventDefault();
    if (!indicatorValue.trim()) {
      setErrorMessage('Please enter a suspicious URL, domain, or profile URL to analyze.');
      return;
    }

    setErrorMessage('');
    setAnalysisResult(null);
    setAnalyzing(true);

    try {
      setAnalysisStage('Verifying SSRF perimeter & host safety...');
      await new Promise(r => setTimeout(r, 350));
      setAnalysisStage('Extracting lexical features, entropy, and homoglyphs...');
      await new Promise(r => setTimeout(r, 400));
      setAnalysisStage('Evaluating brand impersonation & scoring explainability...');
      
      const payload = {
        indicator_value: indicatorValue.trim(),
        threat_type: threatType,
        brand_id: brandId ? Number(brandId) : null,
        title: customTitle.trim() || undefined,
        notes: analystNotes.trim() || undefined
      };

      const result = await api.scanThreat(payload);
      setAnalysisResult(result);
      if (onThreatCreated) onThreatCreated(result);
    } catch (err) {
      setErrorMessage(err.message || 'Threat analysis failed.');
    } finally {
      setAnalyzing(false);
      setAnalysisStage('');
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-tab navigation */}
      <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveSubTab('live_analysis')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeSubTab === 'live_analysis'
                ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-navy-850'
            }`}
          >
            Live Threat Analysis
          </button>
          <button
            type="button"
            onClick={() => setActiveSubTab('what_if_simulator')}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              activeSubTab === 'what_if_simulator'
                ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-navy-850'
            }`}
          >
            Digital Risk What-If Simulator
          </button>
        </div>

        <div className="text-[11px] text-slate-400 font-mono hidden md:flex items-center gap-2">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
          <span>SSRF Defense Active &bull; No Untrusted Browser Visits</span>
        </div>
      </div>

      {activeSubTab === 'what_if_simulator' ? (
        <SimulatorView />
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Analysis Input Form (Left 5 Cols or 6 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="surface-card p-5">
              <h2 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                <Crosshair className="w-4 h-4 text-teal-400" />
                Analyze Suspicious Indicator
              </h2>
              <p className="text-xs text-slate-400 mb-4">
                Submit an unverified domain, URL, or profile for AI-driven lexical analysis and brand comparison.
              </p>

              {/* Quick Sample Presets */}
              <div className="mb-4">
                <span className="text-[10px] text-slate-400 font-medium uppercase tracking-wider block mb-1.5">
                  Quick Demonstration Presets:
                </span>
                <div className="flex flex-wrap gap-1.5">
                  {quickSamples.map((s, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => {
                        setIndicatorValue(s.url);
                        setThreatType(s.type);
                        setErrorMessage('');
                      }}
                      className="px-2 py-1 rounded bg-navy-950 hover:bg-navy-850 border border-slate-800 text-[11px] text-slate-300 hover:text-teal-300 transition-colors"
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              </div>

              {errorMessage && (
                <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-rose-400" />
                  <span>{errorMessage}</span>
                </div>
              )}

              <form onSubmit={handleRunAnalysis} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Suspicious Indicator (URL or Domain) <span className="text-rose-400">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="https://apex-banking-token.xyz/login"
                    value={indicatorValue}
                    onChange={(e) => setIndicatorValue(e.target.value)}
                    className="w-full bg-navy-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500/60"
                  />
                  <span className="text-[10px] text-slate-500 mt-1 block">
                    Protected against SSRF. Private subnets and localhost are strictly blocked.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Monitored Brand
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
                      Threat Classification
                    </label>
                    <select
                      value={threatType}
                      onChange={(e) => setThreatType(e.target.value)}
                      className="w-full bg-navy-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-teal-500/60 cursor-pointer"
                    >
                      <option value="Phishing Website">Phishing Website</option>
                      <option value="Typosquatting Domain">Typosquatting Domain</option>
                      <option value="Fake Support Profile">Fake Support Profile</option>
                      <option value="Malicious App">Malicious App / APK</option>
                      <option value="Executive Impersonation">Executive Impersonation</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Custom Title (Optional)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 2FA Lure Mimicking Login Portal"
                    value={customTitle}
                    onChange={(e) => setCustomTitle(e.target.value)}
                    className="w-full bg-navy-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500/60"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Analyst Notes
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Initial triage observations..."
                    value={analystNotes}
                    onChange={(e) => setAnalystNotes(e.target.value)}
                    className="w-full bg-navy-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500/60 resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={analyzing}
                  className="w-full mt-2 bg-teal-600 hover:bg-teal-500 text-white font-medium py-2.5 px-4 rounded-lg text-xs transition-colors flex items-center justify-center gap-2 shadow-subtle disabled:opacity-50"
                >
                  {analyzing ? (
                    <div className="flex items-center gap-2">
                      <div className="w-3.5 h-3.5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      <span>{analysisStage || 'Analyzing...'}</span>
                    </div>
                  ) : (
                    <>
                      <span>Analyze Indicator</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>

          {/* Analysis Results Display (Right 7 Cols) */}
          <div className="lg:col-span-7 space-y-4">
            {analysisResult ? (
              <div className="surface-card p-5 space-y-5 animate-in fade-in duration-200">
                
                {/* Result Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-slate-800 gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-medium text-slate-200">
                        {analysisResult.domain}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-500/10 text-teal-400 border border-teal-500/20">
                        [LIVE INGESTION]
                      </span>
                    </div>
                    <h3 className="text-base font-semibold text-white mt-1">
                      {analysisResult.title}
                    </h3>
                  </div>

                  {/* Big Risk Score Gauge */}
                  <div className="flex items-center gap-3 bg-navy-950 p-2.5 rounded-xl border border-slate-800 self-start sm:self-auto">
                    <div>
                      <div className="text-[10px] text-slate-400 uppercase font-medium">Risk Score</div>
                      <div className="text-xl font-bold font-mono text-white">
                        {analysisResult.risk_score}
                        <span className="text-xs font-normal text-slate-500">/100</span>
                      </div>
                    </div>
                    <span className={`px-2.5 py-1 rounded text-xs font-bold ${
                      analysisResult.risk_score >= 70 ? 'bg-rose-500/15 text-rose-400 border border-rose-500/30' :
                      analysisResult.risk_score >= 40 ? 'bg-amber-500/15 text-amber-400 border border-amber-500/30' :
                      'bg-emerald-500/15 text-emerald-400 border border-emerald-500/30'
                    }`}>
                      {analysisResult.severity} Risk
                    </span>
                  </div>
                </div>

                {/* Evidence Metrics Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                  <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-medium">Host IP</div>
                    <div className="text-xs font-mono font-medium text-slate-200 mt-0.5 truncate">
                      {analysisResult.ip_address}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-medium">Registrar</div>
                    <div className="text-xs font-medium text-slate-200 mt-0.5 truncate">
                      {analysisResult.registrar}
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-medium">Confidence</div>
                    <div className="text-xs font-medium text-teal-400 mt-0.5">
                      {Math.round((analysisResult.confidence || 0.85) * 100)}% Verified
                    </div>
                  </div>
                  <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase font-medium">Case State</div>
                    <div className="text-xs font-medium text-blue-400 mt-0.5">
                      {analysisResult.status}
                    </div>
                  </div>
                </div>

                {/* Documented Evidence & Contributing Reasons */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-teal-400" />
                    Explainable Assessment Factors
                  </h4>
                  <div className="space-y-1.5">
                    {analysisResult.detection_reasons && analysisResult.detection_reasons.length > 0 ? (
                      analysisResult.detection_reasons.map((reason, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-navy-950/70 border border-slate-800/80 text-xs text-slate-300 flex items-start gap-2">
                          <span className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                          <span>{reason}</span>
                        </div>
                      ))
                    ) : (
                      <div className="text-xs text-slate-500">No high-severity factors triggered.</div>
                    )}
                  </div>
                </div>

                {/* Quick Investigation Transition Button */}
                <div className="pt-3 border-t border-slate-800 flex items-center justify-between">
                  <span className="text-xs text-emerald-400 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4 h-4" />
                    Successfully logged to case inventory (#{analysisResult.id})
                  </span>
                  <button
                    type="button"
                    onClick={() => onNavigateTab('investigations')}
                    className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors flex items-center gap-1.5"
                  >
                    <span>View in Investigations</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                </div>

              </div>
            ) : (
              <div className="surface-card p-12 text-center flex flex-col items-center justify-center space-y-3 min-h-[360px]">
                <div className="w-12 h-12 rounded-xl bg-slate-800/60 border border-slate-700/60 flex items-center justify-center text-slate-400">
                  <Search className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-medium text-slate-200">
                    Awaiting Indicator Submission
                  </h3>
                  <p className="text-xs text-slate-500 max-w-sm mt-1">
                    Enter a suspicious domain or select one of the quick presets on the left to evaluate risk score, homoglyph traps, and brand imitation.
                  </p>
                </div>
              </div>
            )}
          </div>

        </div>
      )}

    </div>
  );
}
