import React, { useState, useRef, useMemo } from 'react';
import { 
  Network, 
  Layers, 
  ShieldAlert, 
  Server, 
  Globe, 
  Lock, 
  Info,
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  HelpCircle,
  ExternalLink
} from 'lucide-react';

export default function ThreatGraphView({ graphData, onSelectThreat }) {
  const [selectedNode, setSelectedNode] = useState(null);
  const [selectedCampaign, setSelectedCampaign] = useState(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [panOffset, setPanOffset] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [filterType, setFilterType] = useState('ALL'); // ALL, THREATS, HOSTS, REGISTRARS

  const svgRef = useRef(null);

  if (!graphData || !graphData.nodes) {
    return (
      <div className="surface-card p-12 text-center text-slate-400 text-xs">
        <div className="w-8 h-8 border-2 border-teal-500/30 border-t-teal-400 rounded-full animate-spin mx-auto mb-3" />
        Analyzing NetworkX Threat Relationship Topology...
      </div>
    );
  }

  const { nodes, links, campaigns, summary } = graphData;

  // Filter nodes if user selects filter
  const displayedNodes = useMemo(() => {
    if (filterType === 'ALL') return nodes;
    if (filterType === 'THREATS') return nodes.filter(n => n.type === 'threat');
    if (filterType === 'HOSTS') return nodes.filter(n => n.type === 'infrastructure_ip' || n.type === 'threat');
    if (filterType === 'REGISTRARS') return nodes.filter(n => n.type === 'infrastructure_registrar' || n.type === 'threat');
    return nodes;
  }, [nodes, filterType]);

  const displayedNodeIds = useMemo(() => new Set(displayedNodes.map(n => n.id)), [displayedNodes]);
  const displayedLinks = useMemo(() => {
    return links.filter(l => displayedNodeIds.has(l.source) && displayedNodeIds.has(l.target));
  }, [links, displayedNodeIds]);

  // Compute 2D node positions in a clean circular force-like layout
  const nodePositions = useMemo(() => {
    const pos = {};
    const width = 850;
    const height = 550;
    const centerX = width / 2;
    const centerY = height / 2;

    const totalNodes = displayedNodes.length;
    if (totalNodes === 0) return pos;

    displayedNodes.forEach((node, i) => {
      const angle = (i / totalNodes) * 2 * Math.PI;
      // Differentiate radius by node type
      let radius = 200;
      if (node.type === 'infrastructure_ip') radius = 100;
      else if (node.type === 'infrastructure_registrar') radius = 140;
      else if (node.type === 'infrastructure_ssl') radius = 120;
      else radius = 220 + (i % 2) * 30;

      pos[node.id] = {
        x: centerX + Math.cos(angle) * radius,
        y: centerY + Math.sin(angle) * radius
      };
    });

    return pos;
  }, [displayedNodes]);

  // Pan controls
  const handleMouseDown = (e) => {
    if (e.target.tagName === 'svg' || e.target.tagName === 'rect') {
      setIsDragging(true);
      setDragStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPanOffset({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  // Connected links for selected node
  const selectedNodeLinks = useMemo(() => {
    if (!selectedNode) return [];
    return links.filter(l => l.source === selectedNode.id || l.target === selectedNode.id);
  }, [selectedNode, links]);

  return (
    <div className="space-y-4">
      
      {/* Top Header Card */}
      <div className="surface-card p-4 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
            <Network className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">Hidden Threat Connection Finder</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-500/10 text-teal-300 border border-teal-500/20">
                NetworkX Topology Engine
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Identifies shared infrastructure (IP hosts, registrars, SSL certs) and community clusters across suspicious indicators.
            </p>
          </div>
        </div>

        {/* Graph Summary Pills */}
        <div className="flex items-center gap-2 text-xs font-mono shrink-0">
          <div className="px-2.5 py-1 rounded-md bg-navy-950 border border-slate-800 text-slate-300">
            Nodes: <span className="text-white font-bold">{summary.total_nodes}</span>
          </div>
          <div className="px-2.5 py-1 rounded-md bg-navy-950 border border-slate-800 text-slate-300">
            Edges: <span className="text-teal-400 font-bold">{summary.total_links}</span>
          </div>
          <div className="px-2.5 py-1 rounded-md bg-navy-950 border border-slate-800 text-slate-300">
            Campaigns: <span className="text-purple-400 font-bold">{summary.detected_campaigns_count}</span>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Graph Canvas (8 cols) + Detail Panel (4 cols) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        
        {/* Left: Interactive Canvas */}
        <div className="lg:col-span-8 surface-card p-4 flex flex-col relative overflow-hidden">
          
          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800/80 z-10">
            {/* Filter pills */}
            <div className="flex items-center gap-1.5 text-xs">
              <span className="text-slate-400 text-[11px] mr-1">Filter:</span>
              {['ALL', 'THREATS', 'HOSTS', 'REGISTRARS'].map((f) => (
                <button
                  key={f}
                  type="button"
                  onClick={() => setFilterType(f)}
                  className={`px-2 py-1 rounded text-[11px] font-medium transition-colors ${
                    filterType === f 
                      ? 'bg-teal-500/15 text-teal-300 border border-teal-500/30' 
                      : 'bg-navy-950 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {f}
                </button>
              ))}
            </div>

            {/* Zoom / Pan controls */}
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.min(prev + 0.2, 2.2))}
                className="p-1.5 rounded-md bg-navy-950 hover:bg-navy-800 border border-slate-800 text-slate-300 transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => setZoomLevel(prev => Math.max(prev - 0.2, 0.6))}
                className="p-1.5 rounded-md bg-navy-950 hover:bg-navy-800 border border-slate-800 text-slate-300 transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={() => { setZoomLevel(1); setPanOffset({ x: 0, y: 0 }); setSelectedNode(null); }}
                className="p-1.5 rounded-md bg-navy-950 hover:bg-navy-800 border border-slate-800 text-slate-300 transition-colors"
                title="Reset View"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {/* SVG Graph Viewport */}
          <div 
            className="w-full h-[480px] bg-navy-950/60 rounded-lg relative overflow-hidden mt-3 cursor-grab active:cursor-grabbing border border-slate-800/60"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
          >
            <svg 
              ref={svgRef}
              className="w-full h-full select-none"
              viewBox="0 0 850 550"
            >
              <rect width="850" height="550" fill="transparent" />
              
              <g 
                transform={`translate(${panOffset.x}, ${panOffset.y}) scale(${zoomLevel})`}
                style={{ transformOrigin: '425px 275px' }}
              >
                {/* 1. Render Edges */}
                {displayedLinks.map((link, idx) => {
                  const s = nodePositions[link.source];
                  const t = nodePositions[link.target];
                  if (!s || !t) return null;

                  const isConnectedToSelected = selectedNode && (link.source === selectedNode.id || link.target === selectedNode.id);

                  return (
                    <g key={idx}>
                      <line
                        x1={s.x}
                        y1={s.y}
                        x2={t.x}
                        y2={t.y}
                        stroke={isConnectedToSelected ? '#14b8a6' : '#334155'}
                        strokeWidth={isConnectedToSelected ? 2.5 : link.weight > 1 ? 1.5 : 1}
                        strokeDasharray={link.relationship === 'REGISTERED_VIA' ? '4 3' : 'none'}
                        opacity={selectedNode && !isConnectedToSelected ? 0.25 : 0.75}
                        className="transition-all"
                      />
                    </g>
                  );
                })}

                {/* 2. Render Nodes */}
                {displayedNodes.map((node) => {
                  const pos = nodePositions[node.id];
                  if (!pos) return null;

                  const isSelected = selectedNode?.id === node.id;
                  const isThreat = node.type === 'threat';
                  const isIP = node.type === 'infrastructure_ip';
                  const isReg = node.type === 'infrastructure_registrar';
                  const isSSL = node.type === 'infrastructure_ssl';

                  let nodeColor = '#3b82f6';
                  let nodeRadius = 14;

                  if (isThreat) {
                    nodeRadius = 16;
                    nodeColor = node.risk_score >= 70 ? '#ef4444' : node.risk_score >= 40 ? '#f59e0b' : '#10b981';
                  } else if (isIP) {
                    nodeColor = '#14b8a6';
                    nodeRadius = 18;
                  } else if (isReg) {
                    nodeColor = '#8b5cf6';
                    nodeRadius = 15;
                  } else if (isSSL) {
                    nodeColor = '#06b6d4';
                    nodeRadius = 14;
                  }

                  return (
                    <g 
                      key={node.id} 
                      transform={`translate(${pos.x}, ${pos.y})`}
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedNode(node);
                        setSelectedCampaign(null);
                      }}
                      className="cursor-pointer group"
                    >
                      {/* Selection ring */}
                      {isSelected && (
                        <circle
                          r={nodeRadius + 6}
                          fill="none"
                          stroke="#14b8a6"
                          strokeWidth="2"
                          strokeDasharray="3 2"
                        />
                      )}

                      {/* Main Node Circle */}
                      <circle
                        r={nodeRadius}
                        fill="#0F172A"
                        stroke={nodeColor}
                        strokeWidth={isSelected ? 3 : 2}
                        className="transition-all hover:scale-110"
                      />

                      {/* Node Center Dot / Marker */}
                      <circle
                        r={nodeRadius / 3}
                        fill={nodeColor}
                      />

                      {/* Node Label */}
                      <text
                        dy={nodeRadius + 13}
                        textAnchor="middle"
                        fontSize={10}
                        fill={isSelected ? '#14b8a6' : '#cbd5e1'}
                        fontFamily="ui-monospace, monospace"
                        fontWeight={isSelected ? 'bold' : 'normal'}
                        className="pointer-events-none select-none"
                      >
                        {node.label.length > 20 ? node.label.slice(0, 18) + '...' : node.label}
                      </text>
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Bottom Left Legend */}
            <div className="absolute bottom-3 left-3 bg-navy-900/90 border border-slate-800 rounded-lg p-2.5 text-[10px] space-y-1 backdrop-blur-xs">
              <div className="text-slate-400 font-semibold mb-1">Topology Legend:</div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
                <span className="text-slate-300">High-Risk Threat (≥70)</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                <span className="text-slate-300">Medium-Risk Threat</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
                <span className="text-slate-300">Shared IP Host Pivot</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-400" />
                <span className="text-slate-300">Shared Registrar Pivot</span>
              </div>
            </div>
          </div>

          {/* Campaign Clusters Quick Bar */}
          {campaigns.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-800/80">
              <div className="text-xs font-semibold text-slate-300 mb-2 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-purple-400" />
                Discovered Threat Syndicates & Campaigns (NetworkX Clusters):
              </div>
              <div className="flex flex-wrap gap-2">
                {campaigns.map((camp) => (
                  <button
                    key={camp.campaign_id}
                    type="button"
                    onClick={() => {
                      setSelectedCampaign(camp);
                      setSelectedNode(null);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-colors text-left border ${
                      selectedCampaign?.campaign_id === camp.campaign_id
                        ? 'bg-purple-500/15 text-purple-300 border-purple-500/40'
                        : 'bg-navy-950 text-slate-300 hover:bg-navy-850 border-slate-800'
                    }`}
                  >
                    <span className="font-semibold">{camp.campaign_id}</span>
                    <span className="text-[10px] text-slate-400 ml-1.5">({camp.threat_count} threats, {camp.severity})</span>
                  </button>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Right: Dedicated Detail Panel */}
        <div className="lg:col-span-4 surface-card p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-3">
              <h3 className="text-xs font-semibold text-white uppercase tracking-wider">
                Relationship Evidence Panel
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                {selectedNode ? 'Node Selected' : selectedCampaign ? 'Cluster Selected' : 'Overview'}
              </span>
            </div>

            {selectedNode ? (
              /* NODE DETAIL VIEW */
              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-[10px] text-slate-500 uppercase font-medium">Node Label</span>
                  <div className="font-mono text-sm font-bold text-white break-all mt-0.5">
                    {selectedNode.label}
                  </div>
                  <div className="text-[11px] text-slate-400 capitalize mt-0.5">
                    Type: <span className="text-teal-400 font-medium">{selectedNode.type.replace('_', ' ')}</span>
                  </div>
                </div>

                {selectedNode.type === 'threat' && (
                  <div className="p-3 rounded-lg bg-navy-950 border border-slate-800 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-[11px]">Calculated Risk Score:</span>
                      <span className={`px-2 py-0.5 rounded text-[11px] font-bold ${
                        selectedNode.risk_score >= 70 ? 'bg-rose-500/10 text-rose-400' : 'bg-amber-500/10 text-amber-400'
                      }`}>
                        {selectedNode.risk_score}/100
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-400">Severity Tier:</span>
                      <span className="text-slate-200 font-medium">{selectedNode.severity}</span>
                    </div>
                  </div>
                )}

                {/* NetworkX Graph Metrics */}
                <div className="p-3 rounded-lg bg-navy-950 border border-slate-800 space-y-1.5 font-mono text-[11px]">
                  <div className="text-slate-400 font-sans text-xs font-medium mb-1">Graph Centrality Metrics:</div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Degree Centrality:</span>
                    <span className="text-teal-400">{selectedNode.degree_centrality}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Betweenness Centrality:</span>
                    <span className="text-blue-400">{selectedNode.betweenness_centrality}</span>
                  </div>
                </div>

                {/* Supporting Relationship Evidence */}
                <div>
                  <h4 className="text-xs font-semibold text-slate-200 mb-2 flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-teal-400" />
                    Connected Relationships & Evidence:
                  </h4>
                  {selectedNodeLinks.length > 0 ? (
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {selectedNodeLinks.map((l, i) => (
                        <div key={i} className="p-2.5 rounded-lg bg-navy-950 border border-slate-800/80 text-[11px] text-slate-300">
                          <div className="font-semibold text-teal-300 mb-0.5 flex items-center gap-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-teal-400" />
                            {l.relationship}
                          </div>
                          <div className="text-slate-400 leading-relaxed">{l.evidence}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-3 rounded bg-navy-950 text-slate-500 text-[11px]">
                      No active edge correlations detected for this indicator.
                    </div>
                  )}
                </div>

                {selectedNode.type === 'threat' && selectedNode.threat_id && (
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectThreat) onSelectThreat({ id: selectedNode.threat_id });
                    }}
                    className="w-full mt-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
                  >
                    <span>Inspect Investigation Dossier</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : selectedCampaign ? (
              /* CAMPAIGN CLUSTER DETAIL VIEW */
              <div className="space-y-3.5 text-xs">
                <div>
                  <span className="text-[10px] text-purple-400 uppercase font-mono font-medium">Syndicate Cluster</span>
                  <div className="font-mono text-base font-bold text-white mt-0.5">
                    {selectedCampaign.campaign_id}
                  </div>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    Average Risk: <span className="text-rose-400 font-bold">{selectedCampaign.average_risk}/100</span> ({selectedCampaign.severity})
                  </div>
                </div>

                <div className="p-3 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-200 text-xs">
                  <div className="font-semibold text-purple-300 mb-1">Clustering Rationale:</div>
                  <p className="text-[11px] leading-relaxed text-slate-300">{selectedCampaign.evidence_rationale}</p>
                </div>

                <div>
                  <span className="text-slate-400 font-medium block mb-1.5">
                    Member Threats ({selectedCampaign.threat_count}):
                  </span>
                  <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                    {selectedCampaign.threats.map((t) => (
                      <div 
                        key={t.id} 
                        onClick={() => {
                          const n = nodes.find(item => item.threat_id === t.id);
                          if (n) setSelectedNode(n);
                        }}
                        className="p-2 rounded bg-navy-950 hover:bg-navy-850 border border-slate-800 text-[11px] flex items-center justify-between cursor-pointer transition-colors"
                      >
                        <span className="font-mono text-slate-200 truncate">{t.domain}</span>
                        <span className="text-rose-400 font-bold shrink-0">{t.risk_score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* DEFAULT INSTRUCTIONS */
              <div className="p-6 text-center text-slate-500 space-y-2">
                <Network className="w-8 h-8 text-slate-600 mx-auto" />
                <p className="text-xs">
                  Click on any node in the relationship canvas or select a campaign syndicate below to inspect supporting infrastructure evidence.
                </p>
              </div>
            )}
          </div>

          {/* Section 5 Non-Defamatory Disclaimer */}
          <div className="mt-4 pt-3 border-t border-slate-800/80 text-[10px] text-slate-500 leading-tight">
            <span className="font-semibold text-slate-400">Disclaimer:</span> Network connections represent technical infrastructure correlation (shared IP hosts, registrars, or certificates) and do not definitively claim that connected indicators belong to the same threat actor.
          </div>
        </div>

      </div>

    </div>
  );
}
