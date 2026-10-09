import React, { useState } from 'react';
import { 
  Search, 
  Filter, 
  ShieldAlert, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  ExternalLink, 
  FileText, 
  Download, 
  Sparkles, 
  History, 
  Layers, 
  Globe, 
  Server, 
  MessageSquare,
  Plus,
  Send,
  X
} from 'lucide-react';
import { api } from '../services/api';

export default function ThreatsTableView({
  threats,
  onOpenAssistant,
  onOpenTimeline,
  onUpdateStatus,
  onOpenScan
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [severityFilter, setSeverityFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [sampleFilter, setSampleFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [updatingId, setUpdatingId] = useState(null);

  // Case notes modal state
  const [activeNotesThreat, setActiveNotesThreat] = useState(null);
  const [caseNotes, setCaseNotes] = useState([]);
  const [notesLoading, setNotesLoading] = useState(false);
  const [newNoteText, setNewNoteText] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  // Client-side filtering
  const filteredThreats = threats.filter(t => {
    const matchesSearch = 
      t.domain.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.indicator_value.toLowerCase().includes(searchTerm.toLowerCase()) ||
      t.registrar.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesSeverity = !severityFilter || t.severity === severityFilter;
    const matchesStatus = !statusFilter || t.status === statusFilter;
    const matchesType = !typeFilter || t.threat_type === typeFilter;
    const matchesSample = sampleFilter === '' || (sampleFilter === 'sample' ? t.is_sample : !t.is_sample);

    return matchesSearch && matchesSeverity && matchesStatus && matchesType && matchesSample;
  });

  const handleStatusChange = async (threatId, newStatus) => {
    setUpdatingId(threatId);
    await onUpdateStatus(threatId, newStatus);
    setUpdatingId(null);
  };

  const handleOpenNotes = async (threat) => {
    setActiveNotesThreat(threat);
    setNewNoteText('');
    try {
      setNotesLoading(true);
      const notes = await api.getCaseNotes(threat.id);
      setCaseNotes(notes);
    } catch (err) {
      console.error('Failed to load case notes:', err);
    } finally {
      setNotesLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNoteText.trim() || !activeNotesThreat) return;

    try {
      setSubmittingNote(true);
      const added = await api.addCaseNote(activeNotesThreat.id, 'Analyst Note', newNoteText.trim());
      setCaseNotes([added, ...caseNotes]);
      setNewNoteText('');
    } catch (err) {
      alert('Failed to save case note: ' + err.message);
    } finally {
      setSubmittingNote(false);
    }
  };

  return (
    <div className="space-y-4">
      
      {/* Top Filter and Search Bar */}
      <div className="surface-card p-4 flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3">
        
        {/* Search Input */}
        <div className="relative flex-1">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search domain, URL, registrar, or campaign indicator..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-navy-950 border border-slate-800 rounded-lg pl-9 pr-3 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-teal-500/60"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Severity */}
          <select
            value={severityFilter}
            onChange={(e) => setSeverityFilter(e.target.value)}
            className="bg-navy-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="">All Severities</option>
            <option value="High">High (70-100)</option>
            <option value="Medium">Medium (40-69)</option>
            <option value="Low">Low (0-39)</option>
          </select>

          {/* Status */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-navy-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="New">New</option>
            <option value="Under Review">Under Review</option>
            <option value="Reported">Reported</option>
            <option value="Resolved">Resolved</option>
          </select>

          {/* Data Source Filter */}
          <select
            value={sampleFilter}
            onChange={(e) => setSampleFilter(e.target.value)}
            className="bg-navy-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer"
          >
            <option value="">All Data Tags</option>
            <option value="sample">Sample Demo Dataset</option>
            <option value="live">Live User Ingestions</option>
          </select>

          {/* Threat Type Filter */}
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="bg-navy-950 border border-slate-800 text-slate-300 text-xs rounded-lg px-2.5 py-1.5 focus:outline-none cursor-pointer hidden sm:block"
          >
            <option value="">All Threat Types</option>
            <option value="Phishing Website">Phishing</option>
            <option value="Typosquatting Domain">Typosquatting</option>
            <option value="Fake Support Profile">Fake Support</option>
            <option value="Malicious App">Malicious App</option>
            <option value="Executive Impersonation">Executive Impersonation</option>
          </select>

          {/* Export CSV Button */}
          <a
            href="/api/reports/export-all/csv"
            target="_blank"
            rel="noreferrer"
            download
            className="px-3 py-1.5 rounded-lg bg-navy-850 hover:bg-navy-800 border border-slate-800 text-slate-300 hover:text-white text-xs font-medium transition-colors flex items-center gap-1.5 shrink-0"
            title="Download CSV Dossier"
          >
            <Download className="w-3.5 h-3.5 text-teal-400" />
            <span>Export CSV</span>
          </a>

        </div>

      </div>

      {/* Threats Count Status */}
      <div className="flex items-center justify-between text-xs text-slate-400 px-1">
        <div>
          Showing <span className="font-semibold text-slate-200">{filteredThreats.length}</span> of {threats.length} total monitored threat cases
        </div>
      </div>

      {/* Threats Cards Inventory */}
      <div className="space-y-3">
        {filteredThreats.length === 0 ? (
          <div className="surface-card p-12 text-center text-slate-400 text-xs">
            <CheckCircle className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
            <p>No threat indicators match the current filters.</p>
          </div>
        ) : (
          filteredThreats.map((t) => {
            const isHigh = t.risk_score >= 70;
            const isMed = t.risk_score >= 40 && t.risk_score < 70;

            return (
              <div 
                key={t.id} 
                className="surface-card p-4 space-y-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
                  
                  {/* Left Column: Info */}
                  <div className="flex-1 space-y-1.5">
                    <div className="flex flex-wrap items-center gap-2">
                      {/* Risk Score */}
                      <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold border flex items-center gap-1.5 ${
                        isHigh ? 'bg-rose-500/10 text-rose-400 border-rose-500/20' :
                        isMed ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                        'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                      }`}>
                        <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: isHigh ? '#ef4444' : isMed ? '#f59e0b' : '#10b981' }} />
                        {t.severity} Risk: {t.risk_score}/100
                      </span>

                      {/* Brand Tag */}
                      <span className="px-2 py-0.5 rounded bg-navy-950 text-slate-300 text-[11px] font-medium border border-slate-800">
                        {t.brand_name || 'Protected Brand'}
                      </span>

                      {/* Data Source Badge */}
                      {t.is_sample ? (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-700/60 text-[10px] font-mono">
                          [SAMPLE DATA]
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-teal-500/10 text-teal-300 border border-teal-500/20 text-[10px] font-mono">
                          [LIVE INGESTION]
                        </span>
                      )}

                      {/* Threat Type */}
                      <span className="text-[11px] text-slate-400">
                        {t.threat_type}
                      </span>

                      {/* Campaign Cluster */}
                      {t.campaign_cluster && (
                        <span className="px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20 text-[10px] font-mono flex items-center gap-1">
                          <Layers className="w-3 h-3 text-purple-400" />
                          {t.campaign_cluster}
                        </span>
                      )}
                    </div>

                    {/* Threat Heading & URL */}
                    <div>
                      <h4 className="text-sm font-semibold text-white tracking-wide">
                        {t.title}
                      </h4>
                      <div className="text-xs font-mono text-slate-300 break-all flex items-center gap-1.5 mt-0.5">
                        <Globe className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{t.indicator_value}</span>
                      </div>
                    </div>

                    {/* Infrastructure Specs */}
                    <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[11px] text-slate-400 font-mono pt-1">
                      <span><strong>Host IP:</strong> {t.ip_address}</span>
                      <span><strong>Registrar:</strong> {t.registrar}</span>
                      <span><strong>ASN:</strong> {t.asn}</span>
                      <span><strong>Confidence:</strong> {Math.round((t.confidence || 0.85) * 100)}%</span>
                    </div>

                    {/* Detection Rationale Preview */}
                    {t.detection_reasons && t.detection_reasons.length > 0 && (
                      <div className="text-[11px] text-slate-300 bg-navy-950 p-2 rounded-lg border border-slate-800 mt-1">
                        <strong className="text-teal-400">Detection Rationale: </strong>
                        {t.detection_reasons[0]}
                      </div>
                    )}
                  </div>

                  {/* Right Column: Case Controls */}
                  <div className="flex flex-col sm:flex-row lg:flex-col items-end gap-2 w-full lg:w-auto shrink-0 pt-2 lg:pt-0 border-t lg:border-t-0 border-slate-800">
                    
                    {/* Status Dropdown */}
                    <div className="flex items-center gap-2 w-full sm:w-auto justify-between sm:justify-end">
                      <span className="text-[11px] text-slate-400">Case State:</span>
                      <select
                        value={t.status}
                        onChange={(e) => handleStatusChange(t.id, e.target.value)}
                        disabled={updatingId === t.id}
                        className="bg-navy-950 border border-slate-800 text-slate-200 text-xs font-medium rounded-lg px-2.5 py-1 focus:outline-none cursor-pointer"
                      >
                        <option value="New">New</option>
                        <option value="Under Review">Under Review</option>
                        <option value="Reported">Reported</option>
                        <option value="Resolved">Resolved</option>
                      </select>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto justify-end">
                      
                      {/* Case Notes */}
                      <button
                        type="button"
                        onClick={() => handleOpenNotes(t)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-navy-950 hover:bg-navy-850 border border-slate-800 text-slate-300 text-xs font-medium transition-colors"
                        title="Case Notes & Analyst Audit Log"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-teal-400" />
                        <span>Notes</span>
                      </button>

                      {/* AI Copilot Assistant */}
                      <button
                        type="button"
                        onClick={() => onOpenAssistant(t)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-navy-950 hover:bg-navy-850 border border-slate-800 text-slate-300 text-xs font-medium transition-colors"
                        title="AI SOC Investigation Copilot"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-blue-400" />
                        <span>AI Assistant</span>
                      </button>

                      {/* Timeline Progression */}
                      <button
                        type="button"
                        onClick={() => onOpenTimeline(t)}
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-navy-950 hover:bg-navy-850 border border-slate-800 text-slate-300 text-xs font-medium transition-colors"
                        title="Campaign Lifecycle Timeline"
                      >
                        <History className="w-3.5 h-3.5 text-slate-400" />
                        <span>Timeline</span>
                      </button>

                      {/* Printable Dossier */}
                      <a
                        href={`/api/reports/export/${t.id}`}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1 px-2.5 py-1 rounded-md bg-navy-950 hover:bg-navy-850 border border-slate-800 text-slate-300 text-xs font-medium transition-colors"
                        title="Print Executive Security Dossier"
                      >
                        <FileText className="w-3.5 h-3.5 text-amber-400" />
                        <span>Dossier</span>
                      </a>

                    </div>

                  </div>

                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Case Notes Drawer / Modal */}
      {activeNotesThreat && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="surface-card w-full max-w-lg p-5 max-h-[85vh] flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-teal-400" />
                  Investigation Case History
                </h3>
                <span className="text-[11px] font-mono text-slate-400">
                  Case #{activeNotesThreat.id} &bull; {activeNotesThreat.domain}
                </span>
              </div>
              <button
                type="button"
                onClick={() => setActiveNotesThreat(null)}
                className="text-slate-400 hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Notes List */}
            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 pr-1 text-xs">
              {notesLoading ? (
                <div className="py-8 text-center text-slate-400">Loading audit history...</div>
              ) : caseNotes.length > 0 ? (
                caseNotes.map((n) => (
                  <div key={n.id} className="p-3 rounded-lg bg-navy-950 border border-slate-800 space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-semibold text-teal-300">{n.user_name}</span>
                      <span className="text-slate-500 font-mono">
                        {new Date(n.created_at).toLocaleString()}
                      </span>
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono">Action: {n.action}</div>
                    <p className="text-slate-300 mt-1 leading-relaxed">{n.notes}</p>
                  </div>
                ))
              ) : (
                <div className="py-8 text-center text-slate-500">No notes recorded yet.</div>
              )}
            </div>

            {/* Add Note Form */}
            <form onSubmit={handleAddNote} className="pt-3 border-t border-slate-800 space-y-2">
              <textarea
                rows={2}
                required
                placeholder="Add analyst findings, takedown reference, or triage notes..."
                value={newNoteText}
                onChange={(e) => setNewNoteText(e.target.value)}
                className="w-full bg-navy-950 border border-slate-800 rounded-lg p-2.5 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500/60 resize-none"
              />
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={submittingNote || !newNoteText.trim()}
                  className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium px-3.5 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{submittingNote ? 'Saving...' : 'Add Case Note'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
