import React, { useState } from 'react';
import { 
  BarChart3, 
  Activity, 
  TrendingUp, 
  Users, 
  Clock, 
  ShieldCheck, 
  Zap, 
  Sparkles, 
  Layers, 
  AlertTriangle,
  Play,
  RotateCcw
} from 'lucide-react';
import { api } from '../services/api';

export default function AnalyticsDashboard({ 
  stats, 
  services = [], 
  counters = [], 
  onRefresh, 
  onResetData 
}) {
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simMessage, setSimMessage] = useState('');

  const currentStats = stats || {
    totalTokensToday: 12,
    waitingCount: 6,
    inProgressCount: 2,
    completedCount: 4,
    avgDynamicWaitMinutes: 16.2,
    avgStaticWaitMinutes: 14.0,
    avgActualServiceDurationMinutes: 15.5,
    accuracyDriftMinutes: 1.8,
    activeCountersCount: 5,
    totalCountersCount: 6
  };

  // Simulate long consultation
  const handleSimulateOverdue = async () => {
    setSimulationLoading(true);
    setSimMessage('');
    try {
      // Create a test consultation completed with 32 mins
      const hospService = services.find(s => s.department === 'Hospital') || services[0];
      if (hospService) {
        // Create token, call it, then complete with 32 mins
        const tokenRes = await api.createToken({
          serviceId: hospService.id,
          customerName: 'Simulated Complex Case',
          priority: 'REGULAR'
        });
        if (tokenRes.data) {
          await api.completeService(tokenRes.data.id, 'Simulated severe symptom complication', 32);
          setSimMessage('⚡ Injected a 32-min complex consultation. Notice the dynamic wait times increase across the queue!');
          if (onRefresh) onRefresh();
        }
      }
    } catch (err) {
      setSimMessage('Simulation error: ' + err.message);
    } finally {
      setSimulationLoading(false);
    }
  };

  // Simulate express transaction
  const handleSimulateExpress = async () => {
    setSimulationLoading(true);
    setSimMessage('');
    try {
      const bnkService = services.find(s => s.codePrefix === 'CSH') || services[0];
      if (bnkService) {
        const tokenRes = await api.createToken({
          serviceId: bnkService.id,
          customerName: 'Simulated Fast Teller',
          priority: 'REGULAR'
        });
        if (tokenRes.data) {
          await api.completeService(tokenRes.data.id, 'Rapid contactless cash deposit', 2.5);
          setSimMessage('🚀 Injected a 2.5-min express transaction. Dynamic engine accelerated queue throughput!');
          if (onRefresh) onRefresh();
        }
      }
    } catch (err) {
      setSimMessage('Simulation error: ' + err.message);
    } finally {
      setSimulationLoading(false);
    }
  };

  // Simulate emergency patient
  const handleSimulateEmergency = async () => {
    setSimulationLoading(true);
    setSimMessage('');
    try {
      const hospService = services.find(s => s.department === 'Hospital') || services[0];
      if (hospService) {
        await api.createToken({
          serviceId: hospService.id,
          customerName: 'Cardiac Emergency Patient (Priority #1)',
          priority: 'EMERGENCY'
        });
        setSimMessage('🚨 Emergency Token generated! Jumps directly to slot #1; all regular tokens dynamically shifted.');
        if (onRefresh) onRefresh();
      }
    } catch (err) {
      setSimMessage('Simulation error: ' + err.message);
    } finally {
      setSimulationLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-8">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Real-Time Engine Telemetry
          </span>
          <h1 className="text-3xl font-extrabold text-white mt-2">
            Dynamic Wait Time & Queue Analytics
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Telemetry comparison between traditional static token systems vs NexusQueue's adaptive algorithm.
          </p>
        </div>

        <button
          onClick={onRefresh}
          className="self-start md:self-auto px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all flex items-center gap-1.5"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Refresh Metrics</span>
        </button>
      </div>

      {/* Hero Comparison: Static vs Dynamic */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Static Flaws */}
        <div className="bg-slate-900/60 border border-rose-950/60 rounded-3xl p-6 relative overflow-hidden">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
              TRADITIONAL STATIC SYSTEM
            </span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Static Rule: Fixed Slot Interval</h3>
          <p className="text-xs text-slate-400 leading-relaxed mb-4">
            Assumes every consultation or banking transaction takes exactly the fixed default time (e.g. 10m).
          </p>
          <ul className="space-y-2 text-xs text-rose-200/80">
            <li className="flex items-center gap-2">
              <span className="text-rose-400">✗</span> Completely blind to doctor or teller delays in progress.
            </li>
            <li className="flex items-center gap-2">
              <span className="text-rose-400">✗</span> Causes lobby crowding when 1 complex consultation delays 10 people.
            </li>
            <li className="flex items-center gap-2">
              <span className="text-rose-400">✗</span> Zero capacity adjustment when an officer takes lunch or break.
            </li>
          </ul>
        </div>

        {/* NexusQueue Innovation */}
        <div className="bg-gradient-to-br from-indigo-950/50 via-slate-900 to-slate-900 border border-indigo-500/40 rounded-3xl p-6 relative overflow-hidden shadow-xl">
          <div className="flex items-center gap-2 mb-3">
            <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              NEXUSQUEUE DYNAMIC ENGINE
            </span>
            <span className="text-xs text-emerald-400 font-bold">✓ Active</span>
          </div>
          <h3 className="text-lg font-bold text-white mb-2">Adaptive Real-Time Calibration</h3>
          <p className="text-xs text-slate-300 leading-relaxed mb-4">
            Employs Exponential Moving Averages (EWMA), real-time overdue penalty shift, and staff throughput multipliers.
          </p>
          <ul className="space-y-2 text-xs text-indigo-200">
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> In-progress consultations that run overtime immediately shift waiting ETAs.
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> Dynamically learns from recent completed transactions window.
            </li>
            <li className="flex items-center gap-2">
              <span className="text-emerald-400">✓</span> Transparent delay reason communication to visitors via live tracker.
            </li>
          </ul>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* KPI 1 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Active In Queue</span>
            <Users className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-white font-mono">
            {currentStats.waitingCount}
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            {currentStats.inProgressCount} currently in consultation
          </span>
        </div>

        {/* KPI 2 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Dynamic Avg Wait</span>
            <Clock className="h-4 w-4 text-indigo-400" />
          </div>
          <div className="text-3xl font-extrabold text-indigo-400 font-mono">
            ~{currentStats.avgDynamicWaitMinutes}m
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            vs {currentStats.avgStaticWaitMinutes}m static guess
          </span>
        </div>

        {/* KPI 3 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Avg Actual Duration</span>
            <Activity className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-400 font-mono">
            ~{currentStats.avgActualServiceDurationMinutes}m
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Across {currentStats.completedCount} completed sessions
          </span>
        </div>

        {/* KPI 4 */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold">Engine Precision Drift</span>
            <ShieldCheck className="h-4 w-4 text-purple-400" />
          </div>
          <div className="text-3xl font-extrabold text-purple-400 font-mono">
            ±{currentStats.accuracyDriftMinutes}m
          </div>
          <span className="text-[11px] text-slate-500 mt-1 block">
            Mean absolute error vs reality
          </span>
        </div>
      </div>

      {/* Interactive Simulation Studio */}
      <div className="bg-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-amber-400" />
            <h3 className="text-base font-extrabold text-white">
              Dynamic Estimation Live Simulator
            </h3>
          </div>
          <span className="text-xs text-slate-400">Instant real-time injection</span>
        </div>
        <p className="text-xs text-slate-300 mb-5">
          Trigger real-world conditions to witness how the backend estimation engine recalculates token waiting times across all active displays:
        </p>

        {simMessage && (
          <div className="mb-4 p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-semibold flex items-center justify-between animate-in fade-in">
            <span>{simMessage}</span>
            <button onClick={() => setSimMessage('')} className="text-slate-400 hover:text-white ml-2">✕</button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            onClick={handleSimulateOverdue}
            disabled={simulationLoading}
            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500/50 text-left transition-all group disabled:opacity-50"
          >
            <div className="flex items-center gap-2 font-bold text-xs text-amber-300 mb-1">
              <AlertTriangle className="h-4 w-4" />
              <span>Simulate 32-min Delay</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Injects a complex hospital case. Watch waiting ETAs increase immediately.
            </p>
          </button>

          <button
            onClick={handleSimulateExpress}
            disabled={simulationLoading}
            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-left transition-all group disabled:opacity-50"
          >
            <div className="flex items-center gap-2 font-bold text-xs text-emerald-300 mb-1">
              <TrendingUp className="h-4 w-4" />
              <span>Simulate 2.5-min Express</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Completes high-velocity transaction. Watch waiting ETAs contract.
            </p>
          </button>

          <button
            onClick={handleSimulateEmergency}
            disabled={simulationLoading}
            className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 hover:border-rose-500/50 text-left transition-all group disabled:opacity-50"
          >
            <div className="flex items-center gap-2 font-bold text-xs text-rose-300 mb-1">
              <Sparkles className="h-4 w-4" />
              <span>Emergency Preemption</span>
            </div>
            <p className="text-[11px] text-slate-400">
              Inserts priority emergency token to slot #1 and shifts other visitors.
            </p>
          </button>
        </div>
      </div>

      {/* Services Adaptive Pace Table */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl">
        <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
          <Layers className="h-4 w-4 text-indigo-400" />
          Service Pace Velocity (EWMA Model Parameters)
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Service Category</th>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4 text-center">Static Base SLA</th>
                <th className="py-3 px-4 text-center">Recent Completed Times (m)</th>
                <th className="py-3 px-4 text-center">Current Dynamic Pace</th>
                <th className="py-3 px-4 text-right">Variance Drift</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 font-mono">
              {services.map(srv => {
                const base = srv.baseDurationMinutes || 10;
                const dynamic = srv.currentDynamicDuration || base;
                const diff = Math.round((dynamic - base) * 10) / 10;
                const recents = srv.recentDurations || [];

                return (
                  <tr key={srv.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="py-3 px-4 font-sans font-semibold text-white">
                      {srv.name}
                    </td>
                    <td className="py-3 px-4 font-sans text-slate-400">
                      {srv.department}
                    </td>
                    <td className="py-3 px-4 text-center text-slate-400">
                      {base}m
                    </td>
                    <td className="py-3 px-4 text-center text-slate-400">
                      {recents.length > 0 ? `[${recents.slice(-4).join(', ')}]` : 'None'}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-indigo-400">
                      ~{dynamic}m
                    </td>
                    <td className="py-3 px-4 text-right">
                      {diff > 0 ? (
                        <span className="text-amber-400">+{diff}m ⚠️</span>
                      ) : diff < 0 ? (
                        <span className="text-emerald-400">{diff}m ✓</span>
                      ) : (
                        <span className="text-slate-400">0.0m</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
