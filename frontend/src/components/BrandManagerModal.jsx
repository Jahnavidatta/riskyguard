import React, { useState } from 'react';
import { X, Building2, Plus, Trash2, Globe, Shield, Tag } from 'lucide-react';
import { api } from '../services/api';

export default function BrandManagerModal({ brands, onClose, onRefresh }) {
  const [name, setName] = useState('');
  const [domain, setDomain] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [keywords, setKeywords] = useState('');
  const [twitter, setTwitter] = useState('');
  const [linkedin, setLinkedin] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name || !domain) {
      setError('Brand name and official domain are required.');
      return;
    }

    try {
      setLoading(true);
      setError(null);
      
      const kwList = keywords
        .split(',')
        .map(k => k.trim().toLowerCase())
        .filter(k => k.length > 0);

      const handles = {};
      if (twitter) handles['x'] = twitter;
      if (linkedin) handles['linkedin'] = linkedin;

      await api.createBrand({
        name,
        official_domain: domain,
        logo_url: logoUrl || null,
        target_keywords: kwList,
        official_handles: handles
      });

      setName('');
      setDomain('');
      setLogoUrl('');
      setKeywords('');
      setTwitter('');
      setLinkedin('');
      
      await onRefresh();
    } catch (err) {
      setError(err.message || 'Failed to register brand');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (brandId) => {
    if (!window.confirm('Are you sure you want to delete this brand and its associated telemetry?')) return;
    try {
      await api.deleteBrand(brandId);
      await onRefresh();
    } catch (err) {
      alert(err.message || 'Failed to delete');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#0b1329] border border-cyan-500/40 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl flex flex-col">
        
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-[#0b1329]/95 z-10 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-blue-500/20 border border-blue-500/40 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-blue-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-white">Brand Asset Management</h3>
              <p className="text-xs text-slate-400">Register official brand profiles, domains, and keywords for impersonation comparison</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6 flex-1 text-xs">
          
          {/* Add Brand Form */}
          <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 space-y-3">
            <div className="font-bold text-white uppercase text-[11px] font-mono flex items-center gap-1.5">
              <Plus className="w-3.5 h-3.5 text-cyan-400" />
              <span>Register New Brand</span>
            </div>

            {error && (
              <div className="p-2.5 rounded bg-red-950/40 border border-red-500/40 text-red-300 text-xs">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Company / Brand Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Apex Global Bank"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Official Primary Domain *</label>
                <input
                  type="text"
                  placeholder="e.g. apexbank.com"
                  value={domain}
                  onChange={(e) => setDomain(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Official Social Media Handle (X/Twitter)</label>
                <input
                  type="text"
                  placeholder="e.g. @apexbank"
                  value={twitter}
                  onChange={(e) => setTwitter(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500 font-mono"
                />
              </div>

              <div>
                <label className="text-slate-400 text-[11px] block mb-1">Target Keywords (Comma Separated)</label>
                <input
                  type="text"
                  placeholder="e.g. apex, apex-login, apex-pay"
                  value={keywords}
                  onChange={(e) => setKeywords(e.target.value)}
                  className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-1.5 text-white focus:outline-none focus:border-cyan-500"
                />
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-semibold rounded-lg shadow-glow-cyan text-xs transition"
              >
                {loading ? 'Registering...' : 'Add Brand to RiskRadar'}
              </button>
            </div>
          </form>

          {/* Existing Brands List */}
          <div className="space-y-2">
            <h4 className="font-bold text-white uppercase text-[11px] font-mono">
              Currently Monitored Brands ({brands.length})
            </h4>

            <div className="space-y-2">
              {brands.map(b => (
                <div key={b.id} className="p-3 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-white text-xs">{b.name}</span>
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-cyan-300 border border-slate-700">
                        {b.official_domain}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-mono flex items-center gap-3">
                      <span>Monitored Threats: <strong className="text-white">{b.threat_count || 0}</strong></span>
                      {b.target_keywords && b.target_keywords.length > 0 && (
                        <span>Keywords: {b.target_keywords.slice(0, 3).join(', ')}</span>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleDelete(b.id)}
                    className="p-1.5 text-slate-400 hover:text-red-400 rounded hover:bg-slate-800 transition"
                    title="Delete Brand"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
