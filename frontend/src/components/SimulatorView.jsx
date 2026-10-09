import React, { useState, useEffect } from 'react';
import { 
  Sliders, 
  ShieldCheck, 
  ShieldAlert, 
  DollarSign,
  Users, 
  AlertTriangle, 
  CheckSquare, 
  Square, 
  TrendingDown,
  Info
} from 'lucide-react';
import { api } from '../services/api';

export default function SimulatorView() {
  const [scenarios, setScenarios] = useState({});
  const [countermeasures, setCountermeasures] = useState({});
  const [selectedScenarioKey, setSelectedScenarioKey] = useState('credential_harvesting_portal');
  const [activeMeasures, setActiveMeasures] = useState(['dmarc_enforcement', 'automated_takedown_api']);
  const [simulationResult, setSimulationResult] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    async function loadScenarios() {
      try {
        const data = await api.getSimulationScenarios();
        setScenarios(data.scenarios || {});
        setCountermeasures(data.countermeasures || {});
      } catch (err) {
        console.error('Failed to load simulation scenarios:', err);
      }
    }
    loadScenarios();
  }, []);

  useEffect(() => {
    async function runSim() {
      if (!selectedScenarioKey) return;
      setLoading(true);
      try {
        const res = await api.runSimulation(selectedScenarioKey, activeMeasures);
        setSimulationResult(res);
      } catch (err) {
        console.error('Failed to run simulation:', err);
      } finally {
        setLoading(false);
      }
    }
    runSim();
  }, [selectedScenarioKey, activeMeasures]);

  const toggleMeasure = (key) => {
    setActiveMeasures(prev => 
      prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]
    );
  };

  return (
    <div className="space-y-5">
      
      {/* Simulator Header Card */}
      <div className="surface-card p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-400 shrink-0">
            <Sliders className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-white">Digital Risk What-If Simulator</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-teal-500/15 text-teal-300 border border-teal-500/30">
                PROACTIVE SIMULATION LAB
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-1 max-w-2xl">
              Model hypothetical digital impersonation attacks before they occur. Evaluate blast radius, financial liability, and residual risk after implementing countermeasures.
            </p>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-lg bg-navy-950 border border-slate-800 text-[11px] font-mono text-slate-400">
          <span className="text-teal-400 font-bold">[SIMULATION MODE]</span> &bull; Non-Incident Environment
        </div>
      </div>

      {/* Main Grid: Scenario Selector vs Before/After Comparison */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        
        {/* Left: Scenarios & Countermeasures (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          
          {/* Step 1: Select Scenario */}
          <div className="surface-card p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
              1. Select Hypothetical Threat Scenario
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {Object.entries(scenarios).map(([key, sc]) => {
                const isSelected = selectedScenarioKey === key;
                return (
                  <div
                    key={key}
                    onClick={() => setSelectedScenarioKey(key)}
                    className={`p-3 rounded-lg border cursor-pointer transition-all ${
                      isSelected 
                        ? 'bg-teal-500/10 border-teal-400/80 text-white' 
                        : 'bg-navy-950 border-slate-800 hover:border-slate-700 text-slate-300'
                    }`}
                  >
                    <div className="text-xs font-semibold text-white mb-1">{sc.title}</div>
                    <div className="text-[11px] text-slate-400 line-clamp-2 leading-relaxed">{sc.description}</div>
                    <div className="mt-2 text-[10px] font-mono text-teal-400 font-bold">
                      Baseline Risk: {sc.initial_risk_score}/100
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Toggle Countermeasures */}
          <div className="surface-card p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                2. Test Protective Countermeasures
              </h3>
              <span className="text-xs font-mono text-teal-400">
                {activeMeasures.length} Activated
              </span>
            </div>

            <div className="space-y-2">
              {Object.entries(countermeasures).map(([key, cm]) => {
                const isActive = activeMeasures.includes(key);
                return (
                  <div
                    key={key}
                    onClick={() => toggleMeasure(key)}
                    className={`p-2.5 rounded-lg border flex items-center justify-between cursor-pointer transition-colors ${
                      isActive 
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200' 
                        : 'bg-navy-950 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      {isActive ? (
                        <CheckSquare className="w-4 h-4 text-emerald-400 shrink-0" />
                      ) : (
                        <Square className="w-4 h-4 text-slate-600 shrink-0" />
                      )}
                      <div>
                        <div className="text-xs font-medium text-white">{cm.name}</div>
                        <div className="text-[10px] text-slate-400">Implementation Cost: {cm.cost}</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      -{cm.mitigation_pts} pts
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right: Comparative Risk Dial & Blast Radius (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          
          <div className="surface-card p-5 space-y-4">
            <h3 className="text-xs font-semibold text-slate-300 uppercase tracking-wider text-center">
              Comparative Risk Reduction Analysis
            </h3>

            {simulationResult ? (
              <div className="space-y-4">
                
                {/* Score Dials Side by Side */}
                <div className="grid grid-cols-2 gap-3 text-center">
                  
                  {/* Before */}
                  <div className="p-4 rounded-xl bg-rose-500/10 border border-rose-500/25">
                    <div className="text-[11px] font-mono text-rose-300 uppercase">Baseline Risk</div>
                    <div className="text-4xl font-extrabold font-mono text-rose-400 my-1">
                      {simulationResult.initial_risk_score}
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/20 text-rose-300 font-bold">
                      {simulationResult.initial_severity}
                    </span>
                  </div>

                  {/* After */}
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/25">
                    <div className="text-[11px] font-mono text-emerald-300 uppercase">Residual Risk</div>
                    <div className="text-4xl font-extrabold font-mono text-emerald-400 my-1">
                      {simulationResult.residual_risk_score}
                    </div>
                    <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/20 text-emerald-300 font-bold">
                      {simulationResult.residual_severity}
                    </span>
                  </div>

                </div>

                {/* Net Risk Reduction Callout */}
                <div className="p-3 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingDown className="w-4 h-4 text-teal-400" />
                    <span className="text-xs text-white font-medium">Net Risk Reduction:</span>
                  </div>
                  <span className="text-base font-extrabold font-mono text-teal-400">
                    -{simulationResult.risk_reduction_pct}%
                  </span>
                </div>

                {/* Blast Radius & Financial Liability */}
                <div className="space-y-2 text-xs font-mono pt-1">
                  <div className="p-2.5 rounded-lg bg-navy-950 border border-slate-800 flex items-start gap-2">
                    <Users className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 text-[10px]">Customer Blast Radius:</span>
                      <div className="text-slate-200">{simulationResult.scenario?.base_blast_radius}</div>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-lg bg-navy-950 border border-slate-800 flex items-start gap-2">
                    <DollarSign className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="text-slate-400 text-[10px]">Estimated Fraud & Liability:</span>
                      <div className="text-slate-200">{simulationResult.scenario?.financial_exposure}</div>
                    </div>
                  </div>
                </div>

                {/* Simulation Summary Rationale */}
                <div className="text-xs text-slate-300 bg-navy-950/80 p-3 rounded-lg border border-slate-800 leading-relaxed">
                  <strong className="text-teal-400">Simulation Takeaway: </strong>
                  {simulationResult.mitigation_summary}
                </div>

              </div>
            ) : (
              <div className="text-center text-xs text-slate-500 py-8">Calculating simulation...</div>
            )}

            {/* Disclaimer */}
            <div className="pt-2 border-t border-slate-800/80 flex items-start gap-1.5 text-[10px] text-slate-500">
              <Info className="w-3.5 h-3.5 shrink-0 text-slate-600 mt-0.5" />
              <span>All results in this module are generated through rule-based hypothetical modeling and do not represent confirmed live security incidents.</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}
