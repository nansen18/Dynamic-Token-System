import React, { useState, useEffect } from 'react';
import { 
  UserCog, 
  Play, 
  CheckCircle, 
  Coffee, 
  UserX, 
  PhoneCall, 
  Clock, 
  AlertTriangle, 
  Zap,
  Sparkles,
  ArrowRight,
  ShieldAlert,
  Sliders
} from 'lucide-react';
import { api } from '../services/api';
import { playLobbyChime, speakAnnouncement } from '../utils/sound';

export default function OfficerTerminal({ 
  counters = [], 
  tokens = [], 
  onActionComplete 
}) {
  const [selectedCounterId, setSelectedCounterId] = useState('');
  const [serviceElapsedTime, setServiceElapsedTime] = useState(0);
  const [completionNotes, setCompletionNotes] = useState('');
  const [customDuration, setCustomDuration] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [statusMessage, setStatusMessage] = useState(null);

  // Auto-select first counter
  const activeCounter = counters.find(c => c.id === selectedCounterId) || counters[0];
  const currentCounterId = selectedCounterId || (activeCounter ? activeCounter.id : '');

  // Find token currently attached to this counter
  const activeToken = tokens.find(t => 
    t.counterId === currentCounterId && 
    (t.status === 'CALLED' || t.status === 'IN_PROGRESS')
  );

  // Filter waiting tokens matching this counter's service capabilities
  const eligibleWaitingTokens = tokens.filter(t => {
    if (t.status !== 'WAITING') return false;
    if (!activeCounter) return false;
    if (t.department !== activeCounter.department) return false;
    if (activeCounter.supportedServiceIds && activeCounter.supportedServiceIds.length > 0) {
      return activeCounter.supportedServiceIds.includes(t.serviceId);
    }
    return true;
  });

  // Stopwatch effect for in-progress token
  useEffect(() => {
    let timer = null;
    if (activeToken && (activeToken.serviceStartedAt || activeToken.calledAt)) {
      const start = new Date(activeToken.serviceStartedAt || activeToken.calledAt).getTime();
      
      const updateElapsed = () => {
        const now = Date.now();
        const diffSeconds = Math.max(0, Math.floor((now - start) / 1000));
        setServiceElapsedTime(diffSeconds);
      };

      updateElapsed();
      timer = setInterval(updateElapsed, 1000);
    } else {
      setServiceElapsedTime(0);
    }
    return () => {
      if (timer) clearInterval(timer);
    };
  }, [activeToken]);

  // Format MM:SS
  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleCallNext = async (specificId = null) => {
    if (!activeCounter) return;
    setIsProcessing(true);
    setStatusMessage(null);
    try {
      const res = await api.callNextToken(activeCounter.id, specificId);
      if (res.success && res.data) {
        playLobbyChime();
        speakAnnouncement(res.data.tokenNumber, activeCounter.counterNumber);
        setStatusMessage({ type: 'success', text: `Called Token ${res.data.tokenNumber}` });
        if (onActionComplete) onActionComplete();
      }
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message || 'Failed to call token' });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleStartService = async () => {
    if (!activeToken) return;
    setIsProcessing(true);
    try {
      await api.startService(activeToken.id);
      setStatusMessage({ type: 'success', text: `Consultation timer started for ${activeToken.tokenNumber}` });
      if (onActionComplete) onActionComplete();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCompleteService = async () => {
    if (!activeToken) return;
    setIsProcessing(true);
    try {
      const elapsedMins = Math.max(1, Math.round(serviceElapsedTime / 60));
      const res = await api.completeService(
        activeToken.id, 
        completionNotes, 
        customDuration ? Number(customDuration) : elapsedMins
      );
      setStatusMessage({ type: 'success', text: res.message || 'Service completed!' });
      setCompletionNotes('');
      setCustomDuration('');
      if (onActionComplete) onActionComplete();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleMarkNoShow = async () => {
    if (!activeToken) return;
    if (!window.confirm(`Mark ${activeToken.tokenNumber} as No-Show?`)) return;
    setIsProcessing(true);
    try {
      await api.markNoShow(activeToken.id);
      setStatusMessage({ type: 'info', text: `${activeToken.tokenNumber} marked as No-Show` });
      if (onActionComplete) onActionComplete();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleToggleBreak = async () => {
    if (!activeCounter) return;
    const newStatus = activeCounter.status === 'ON_BREAK' ? 'ACTIVE' : 'ON_BREAK';
    try {
      await api.updateCounterStatus(activeCounter.id, newStatus);
      setStatusMessage({ 
        type: 'info', 
        text: `Counter status set to ${newStatus}. Wait times dynamically recalculated!` 
      });
      if (onActionComplete) onActionComplete();
    } catch (err) {
      setStatusMessage({ type: 'error', text: err.message });
    }
  };

  const expectedMins = activeToken ? (activeToken.expectedDurationMinutes || 10) : 10;
  const elapsedMinsFloat = serviceElapsedTime / 60;
  const isOverdue = elapsedMinsFloat > expectedMins;
  const overdueMins = Math.max(0, Math.round(elapsedMinsFloat - expectedMins));

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Officer Terminal Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            Desk Operator Interface
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white mt-2">
            Officer Service Terminal
          </h1>
          <p className="text-xs sm:text-sm text-slate-400">
            Execute consultations, record actual service durations, and dynamically feed the wait-time engine.
          </p>
        </div>

        {/* Counter Selection Dropdown */}
        <div className="flex items-center gap-2">
          <label className="text-xs text-slate-400 font-semibold whitespace-nowrap">Switch Desk:</label>
          <select
            value={currentCounterId}
            onChange={(e) => setSelectedCounterId(e.target.value)}
            className="bg-slate-900 border border-slate-700 text-slate-100 text-xs sm:text-sm rounded-xl px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
          >
            {counters.map(c => (
              <option key={c.id} value={c.id}>
                {c.counterNumber} ({c.officerName})
              </option>
            ))}
          </select>
        </div>
      </div>

      {statusMessage && (
        <div className={`mb-6 p-4 rounded-xl text-xs sm:text-sm font-semibold border flex items-center justify-between animate-in fade-in ${
          statusMessage.type === 'success' 
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
            : statusMessage.type === 'error'
            ? 'bg-rose-500/10 border-rose-500/30 text-rose-300'
            : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300'
        }`}>
          <span>{statusMessage.text}</span>
          <button onClick={() => setStatusMessage(null)} className="text-slate-400 hover:text-white ml-2">✕</button>
        </div>
      )}

      {/* Main Grid: Active Consultation Workspace (Left) & Counter Queue Peek (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        
        {/* Active Consultation Workspace (Col 7) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Desk Info & Break Status Card */}
          {activeCounter && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 shadow-xl flex items-center justify-between">
              <div>
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                  {activeCounter.department} Station
                </span>
                <h2 className="text-lg font-extrabold text-white">{activeCounter.counterNumber}</h2>
                <p className="text-xs text-slate-400">Assigned Officer: <b className="text-slate-200">{activeCounter.officerName}</b></p>
              </div>

              <div className="flex items-center gap-3">
                <span className={`text-xs font-bold px-3 py-1 rounded-full border ${
                  activeCounter.status === 'ON_BREAK'
                    ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                    : activeCounter.status === 'BUSY'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                    : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
                }`}>
                  {activeCounter.status === 'ON_BREAK' ? '☕ ON BREAK' : activeCounter.status === 'BUSY' ? '🟢 IN SESSION' : '⚪ IDLE'}
                </span>

                <button
                  onClick={handleToggleBreak}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all flex items-center gap-1.5 ${
                    activeCounter.status === 'ON_BREAK'
                      ? 'bg-emerald-600 hover:bg-emerald-500 text-white border-emerald-500 shadow-md shadow-emerald-600/30'
                      : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
                  }`}
                >
                  <Coffee className="h-3.5 w-3.5" />
                  <span>{activeCounter.status === 'ON_BREAK' ? 'Resume Desk' : 'Take Break'}</span>
                </button>
              </div>
            </div>
          )}

          {/* Active Token Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4 flex items-center justify-between">
              <span>Active Consultation Workspace</span>
              {activeToken && (
                <span className="font-mono text-indigo-400">
                  Status: {activeToken.status}
                </span>
              )}
            </h3>

            {!activeToken ? (
              <div className="py-12 text-center">
                <div className="h-16 w-16 mx-auto rounded-full bg-slate-800 flex items-center justify-center text-slate-600 mb-4">
                  <UserCog className="h-8 w-8" />
                </div>
                <h4 className="text-base font-bold text-slate-300">Desk is Currently Empty</h4>
                <p className="text-xs text-slate-500 mt-1 mb-6 max-w-sm mx-auto">
                  Click below to summon the next priority patient or customer according to the dynamic algorithm.
                </p>

                <button
                  onClick={() => handleCallNext()}
                  disabled={isProcessing || eligibleWaitingTokens.length === 0 || (activeCounter && activeCounter.status === 'ON_BREAK')}
                  className="px-6 py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-40 flex items-center gap-2 mx-auto"
                >
                  <PhoneCall className="h-4 w-4" />
                  <span>Call Next Token ({eligibleWaitingTokens.length} in queue)</span>
                </button>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Token Identity */}
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-4xl sm:text-5xl font-black font-mono text-indigo-400">
                        {activeToken.tokenNumber}
                      </span>
                      {activeToken.priority !== 'REGULAR' && (
                        <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                          {activeToken.priority}
                        </span>
                      )}
                    </div>
                    <div className="text-base font-bold text-slate-200 mt-1">
                      {activeToken.customerName}
                    </div>
                    <div className="text-xs text-slate-400">
                      Service: <b className="text-slate-300">{activeToken.serviceName}</b>
                    </div>
                  </div>

                  {/* Stopwatch Timer */}
                  <div className="text-right">
                    <span className="text-[10px] uppercase font-bold text-slate-400 block">Elapsed Service Time</span>
                    <div className={`text-3xl sm:text-4xl font-mono font-black ${
                      isOverdue ? 'text-rose-400 animate-pulse' : 'text-emerald-400'
                    }`}>
                      {formatTimer(serviceElapsedTime)}
                    </div>
                    <span className="text-xs text-slate-500">
                      Expected Benchmark: ~{expectedMins}m
                    </span>
                  </div>
                </div>

                {/* Overdue Penalty Callout */}
                {isOverdue && (
                  <div className="p-3.5 rounded-2xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-3">
                    <AlertTriangle className="h-5 w-5 text-rose-400 shrink-0" />
                    <div>
                      <span className="font-bold">Overdue Consultation (+{overdueMins} mins): </span>
                      <span>The Dynamic Engine is currently shifting waiting passengers' schedules forward in real-time.</span>
                    </div>
                  </div>
                )}

                {/* Service Notes & Custom Duration */}
                <div className="space-y-3 pt-2">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 mb-1">
                      Consultation Notes / Prescription Summary
                    </label>
                    <input
                      type="text"
                      value={completionNotes}
                      onChange={(e) => setCompletionNotes(e.target.value)}
                      placeholder="e.g., Prescribed diagnostic blood test; scheduled 2-week follow up"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="flex items-center gap-3">
                    <label className="text-xs text-slate-400 font-semibold whitespace-nowrap">
                      Override Minutes (optional):
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="120"
                      value={customDuration}
                      onChange={(e) => setCustomDuration(e.target.value)}
                      placeholder={`Current: ${Math.max(1, Math.round(serviceElapsedTime / 60))}m`}
                      className="w-32 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                    />
                    <span className="text-[11px] text-slate-500">
                      Feeds directly into adaptive moving average.
                    </span>
                  </div>
                </div>

                {/* Control Action Buttons */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800">
                  {activeToken.status === 'CALLED' ? (
                    <button
                      onClick={handleStartService}
                      disabled={isProcessing}
                      className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-600/30"
                    >
                      <Play className="h-4 w-4" />
                      <span>Start Consultation</span>
                    </button>
                  ) : (
                    <button
                      onClick={handleCompleteService}
                      disabled={isProcessing}
                      className="py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-emerald-600/30 hover:scale-[1.02]"
                    >
                      <CheckCircle className="h-4 w-4" />
                      <span>Complete & Calibrate Engine</span>
                    </button>
                  )}

                  <button
                    onClick={() => {
                      playLobbyChime();
                      speakAnnouncement(activeToken.tokenNumber, activeCounter.counterNumber);
                    }}
                    className="py-3 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <PhoneCall className="h-4 w-4 text-indigo-400" />
                    <span>Re-Announce / Call</span>
                  </button>

                  <button
                    onClick={handleMarkNoShow}
                    disabled={isProcessing}
                    className="py-3 px-4 rounded-xl bg-rose-950/40 hover:bg-rose-900/60 border border-rose-800/40 text-rose-300 font-semibold text-xs flex items-center justify-center gap-1.5 transition-all"
                  >
                    <UserX className="h-4 w-4 text-rose-400" />
                    <span>Mark No-Show</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Counter Queue Peek (Col 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-extrabold text-white flex items-center gap-2 uppercase tracking-wide">
              <Clock className="h-4 w-4 text-indigo-400" />
              Queued for this Station ({eligibleWaitingTokens.length})
            </h3>
            <span className="text-xs text-slate-400">Priority Ranked</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-2">
            {eligibleWaitingTokens.length === 0 ? (
              <div className="py-12 text-center text-slate-500 text-xs">
                No waiting tokens assigned to this desk currently.
              </div>
            ) : (
              eligibleWaitingTokens.map((token, index) => {
                const isEmergency = token.priority === 'EMERGENCY';
                return (
                  <div
                    key={token.id}
                    className={`p-3 rounded-2xl border transition-all flex items-center justify-between ${
                      index === 0 
                        ? 'bg-indigo-950/30 border-indigo-500/40' 
                        : 'bg-slate-950/60 border-slate-800/80'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono font-bold text-sm text-white">
                          {token.tokenNumber}
                        </span>
                        {isEmergency && (
                          <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300">
                            EMERGENCY
                          </span>
                        )}
                        <span className="text-xs text-slate-400">
                          {token.customerName}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        {token.serviceName} • Dynamic Wait: <b className="text-indigo-400">~{token.dynamicEstimatedWaitTimeMinutes}m</b>
                      </div>
                    </div>

                    <button
                      onClick={() => handleCallNext(token.id)}
                      disabled={isProcessing || Boolean(activeToken)}
                      className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/40 text-xs font-semibold transition-all disabled:opacity-30"
                    >
                      Call
                    </button>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
