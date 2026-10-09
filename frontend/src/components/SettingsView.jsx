import React, { useState } from 'react';
import { api } from '../services/api';
import { 
  Settings, 
  Building, 
  User, 
  Shield, 
  Plus, 
  Trash2, 
  Edit3, 
  Check, 
  X, 
  AlertCircle, 
  RotateCcw,
  Globe,
  Share2,
  ExternalLink,
  Info
} from 'lucide-react';

export default function SettingsView({
  currentUser,
  brands,
  onRefreshBrands,
  onResetDemo
}) {
  const [activeTab, setActiveTab] = useState('brands'); // 'brands', 'profile', 'data'
  
  // Brand form state
  const [isCreatingBrand, setIsCreatingBrand] = useState(false);
  const [editingBrandId, setEditingBrandId] = useState(null);
  
  const [brandName, setBrandName] = useState('');
  const [brandDomain, setBrandDomain] = useState('');
  const [brandDescription, setBrandDescription] = useState('');
  const [socialX, setSocialX] = useState('');
  const [socialLinkedIn, setSocialLinkedIn] = useState('');
  const [keywordsStr, setKeywordsStr] = useState('');
  
  const [actionLoading, setActionLoading] = useState(false);
  const [msg, setMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const handleStartEdit = (b) => {
    setEditingBrandId(b.id);
    setIsCreatingBrand(false);
    setBrandName(b.name);
    setBrandDomain(b.official_domain);
    setBrandDescription(b.description || '');
    setSocialX(b.official_handles?.x || '');
    setSocialLinkedIn(b.official_handles?.linkedin || '');
    setKeywordsStr((b.target_keywords || []).join(', '));
    setErrorMsg('');
    setMsg('');
  };

  const handleStartCreate = () => {
    setIsCreatingBrand(true);
    setEditingBrandId(null);
    setBrandName('');
    setBrandDomain('');
    setBrandDescription('');
    setSocialX('');
    setSocialLinkedIn('');
    setKeywordsStr('');
    setErrorMsg('');
    setMsg('');
  };

  const handleCancelForm = () => {
    setIsCreatingBrand(false);
    setEditingBrandId(null);
    setErrorMsg('');
  };

  const handleSaveBrand = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setMsg('');

    if (!brandName.trim() || !brandDomain.trim()) {
      setErrorMsg('Brand name and official domain are required.');
      return;
    }

    const handles = {};
    if (socialX.trim()) handles.x = socialX.trim();
    if (socialLinkedIn.trim()) handles.linkedin = socialLinkedIn.trim();

    const keywords = keywordsStr
      .split(',')
      .map(k => k.trim().toLowerCase())
      .filter(Boolean);

    try {
      setActionLoading(true);
      if (editingBrandId) {
        // Update brand
        await api.updateBrand(editingBrandId, {
          name: brandName.trim(),
          official_domain: brandDomain.trim(),
          description: brandDescription.trim() || undefined,
          official_handles: handles,
          target_keywords: keywords.length ? keywords : [brandName.toLowerCase().trim()]
        });
        setMsg(`Brand '${brandName}' updated successfully.`);
      } else {
        // Create brand
        await api.createBrand({
          name: brandName.trim(),
          official_domain: brandDomain.trim(),
          description: brandDescription.trim() || undefined,
          official_handles: handles,
          target_keywords: keywords.length ? keywords : [brandName.toLowerCase().trim()]
        });
        setMsg(`Brand '${brandName}' registered for active protection.`);
      }

      setIsCreatingBrand(false);
      setEditingBrandId(null);
      await onRefreshBrands();
    } catch (err) {
      setErrorMsg(err.message || 'Operation failed.');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteBrand = async (brandId, name) => {
    if (!window.confirm(`Are you sure you want to remove '${name}' from monitoring?`)) return;
    try {
      setActionLoading(true);
      await api.deleteBrand(brandId);
      setMsg(`Brand '${name}' removed.`);
      await onRefreshBrands();
    } catch (err) {
      setErrorMsg(err.message || 'Failed to remove brand.');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Sub-navigation tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800/80 pb-3">
        <button
          type="button"
          onClick={() => { setActiveTab('brands'); setErrorMsg(''); setMsg(''); }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'brands'
              ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-navy-850'
          }`}
        >
          Monitored Brands ({brands.length})
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('profile'); setErrorMsg(''); setMsg(''); }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'profile'
              ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-navy-850'
          }`}
        >
          Organization & Profile
        </button>
        <button
          type="button"
          onClick={() => { setActiveTab('data'); setErrorMsg(''); setMsg(''); }}
          className={`px-3.5 py-1.5 rounded-lg text-xs font-medium transition-colors ${
            activeTab === 'data'
              ? 'bg-teal-500/10 text-teal-300 border border-teal-500/30'
              : 'text-slate-400 hover:text-slate-200 hover:bg-navy-850'
          }`}
        >
          Demonstration Dataset
        </button>
      </div>

      {msg && (
        <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/20 text-teal-300 text-xs flex items-center gap-2">
          <Check className="w-4 h-4" />
          <span>{msg}</span>
        </div>
      )}

      {errorMsg && (
        <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-300 text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{errorMsg}</span>
        </div>
      )}

      {/* TAB 1: MONITORED BRANDS */}
      {activeTab === 'brands' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-semibold text-white">Registered Protected Brands</h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Official domains, descriptions, and verified profiles used as references for impersonation detection.
              </p>
            </div>
            {!isCreatingBrand && !editingBrandId && (
              <button
                type="button"
                onClick={handleStartCreate}
                className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 self-start sm:self-auto"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Register New Brand</span>
              </button>
            )}
          </div>

          {/* Form for Creating / Editing Brand */}
          {(isCreatingBrand || editingBrandId) && (
            <div className="surface-card p-5 space-y-4 border-teal-500/40">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <h4 className="text-xs font-semibold text-teal-300 uppercase tracking-wider">
                  {editingBrandId ? 'Edit Brand Asset Reference' : 'Register New Brand Asset Reference'}
                </h4>
                <button
                  type="button"
                  onClick={handleCancelForm}
                  className="text-slate-400 hover:text-slate-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveBrand} className="space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Brand Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. Apex Global Bank"
                      value={brandName}
                      onChange={(e) => setBrandName(e.target.value)}
                      className="w-full bg-navy-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500/60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Official Primary Domain <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. apexbank.com"
                      value={brandDomain}
                      onChange={(e) => setBrandDomain(e.target.value)}
                      className="w-full bg-navy-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Brand Description
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Brief description of business operations and key digital assets..."
                    value={brandDescription}
                    onChange={(e) => setBrandDescription(e.target.value)}
                    className="w-full bg-navy-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500/60 resize-none"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Official X (Twitter) Handle
                    </label>
                    <input
                      type="text"
                      placeholder="@officialbrand"
                      value={socialX}
                      onChange={(e) => setSocialX(e.target.value)}
                      className="w-full bg-navy-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500/60"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-300 mb-1">
                      Official LinkedIn Profile Path
                    </label>
                    <input
                      type="text"
                      placeholder="company/officialbrand"
                      value={socialLinkedIn}
                      onChange={(e) => setSocialLinkedIn(e.target.value)}
                      className="w-full bg-navy-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500/60"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1">
                    Monitored Keywords (Comma-separated)
                  </label>
                  <input
                    type="text"
                    placeholder="apex, apexbank, apex-pay, secure-apex"
                    value={keywordsStr}
                    onChange={(e) => setKeywordsStr(e.target.value)}
                    className="w-full bg-navy-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-teal-500/60"
                  />
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={handleCancelForm}
                    className="px-3 py-1.5 rounded-lg text-xs text-slate-400 hover:text-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="bg-teal-600 hover:bg-teal-500 text-white text-xs font-medium px-4 py-1.5 rounded-lg transition-colors disabled:opacity-50"
                  >
                    {actionLoading ? 'Saving...' : editingBrandId ? 'Update Brand' : 'Register Brand'}
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Brands List Table */}
          <div className="surface-card overflow-hidden">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium bg-navy-950/60">
                  <th className="py-3 px-4">Brand Name</th>
                  <th className="py-3 px-4">Official Domain</th>
                  <th className="py-3 px-4">Social Handles</th>
                  <th className="py-3 px-4">Protected Indicators</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {brands.map((b) => (
                  <tr key={b.id} className="hover:bg-navy-850/40 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-semibold text-white">{b.name}</div>
                      {b.description && (
                        <div className="text-[11px] text-slate-400 max-w-sm truncate mt-0.5">
                          {b.description}
                        </div>
                      )}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-teal-300">
                      {b.official_domain}
                    </td>
                    <td className="py-3.5 px-4 text-slate-400">
                      <div className="space-y-0.5 text-[11px]">
                        {b.official_handles?.x && <div>X: {b.official_handles.x}</div>}
                        {b.official_handles?.linkedin && <div>LinkedIn: {b.official_handles.linkedin}</div>}
                        {!b.official_handles?.x && !b.official_handles?.linkedin && <span className="text-slate-600">None set</span>}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded bg-navy-950 border border-slate-800 text-slate-300 text-[11px]">
                        {b.threat_count || 0} Cases
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        type="button"
                        onClick={() => handleStartEdit(b)}
                        className="px-2 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors"
                        title="Edit Brand"
                      >
                        <Edit3 className="w-3.5 h-3.5 inline mr-1" />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteBrand(b.id, b.name)}
                        className="px-2 py-1 rounded bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 text-xs font-medium transition-colors border border-rose-500/20"
                        title="Remove Brand"
                      >
                        <Trash2 className="w-3.5 h-3.5 inline mr-1" />
                        Remove
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: ORGANIZATION & USER PROFILE */}
      {activeTab === 'profile' && (
        <div className="surface-card p-6 space-y-5 max-w-2xl">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <Building className="w-4 h-4 text-teal-400" />
            Organization & Analyst Identity
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-medium">Organization</span>
              <span className="font-semibold text-white text-sm mt-0.5 block">{currentUser?.organization}</span>
              <span className="text-[10px] text-teal-400 mt-1 block">Multi-tenant Data Isolation Active</span>
            </div>

            <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-medium">Assigned Role</span>
              <span className="font-semibold text-white text-sm mt-0.5 block">{currentUser?.role || 'Security Analyst'}</span>
              <span className="text-[10px] text-slate-400 mt-1 block">Full Read/Write SOC Privileges</span>
            </div>

            <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-medium">Full Name</span>
              <span className="font-medium text-slate-200 mt-0.5 block">{currentUser?.full_name}</span>
            </div>

            <div className="p-3 rounded-lg bg-navy-950 border border-slate-800">
              <span className="text-slate-400 block text-[10px] uppercase font-medium">Work Email</span>
              <span className="font-mono text-slate-200 mt-0.5 block">{currentUser?.email}</span>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-navy-950/60 border border-slate-800 text-[11px] text-slate-400 flex items-start gap-2">
            <Info className="w-4 h-4 text-teal-400 shrink-0 mt-0.5" />
            <span>
              Authentication is protected with PBKDF2-HMAC-SHA256 password hashing and cryptographically signed JWT bearer tokens. Organization data boundaries are enforced on every database query.
            </span>
          </div>
        </div>
      )}

      {/* TAB 3: DEMONSTRATION DATASET */}
      {activeTab === 'data' && (
        <div className="surface-card p-6 space-y-4 max-w-2xl">
          <h3 className="text-sm font-semibold text-white flex items-center gap-2">
            <RotateCcw className="w-4 h-4 text-amber-400" />
            Demonstration Dataset Management
          </h3>

          <p className="text-xs text-slate-300 leading-relaxed">
            RiskRadar provides a pre-configured sample dataset containing realistic brand-impersonation indicators, shared bulletproof infrastructure links, and early warning surges.
          </p>

          <div className="p-3.5 rounded-lg bg-navy-950 border border-slate-800 text-xs text-slate-400 space-y-1">
            <div className="text-slate-200 font-medium">Sample Data Transparency:</div>
            <div>&bull; All demonstration threat records are explicitly demarcated as <span className="font-mono text-slate-300">[SAMPLE DATA]</span>.</div>
            <div>&bull; Live user scans submitted during this session are tagged as <span className="font-mono text-teal-300">[LIVE]</span>.</div>
          </div>

          <div className="pt-2">
            <button
              type="button"
              onClick={onResetDemo}
              className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset to Clean Demo Dataset</span>
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
