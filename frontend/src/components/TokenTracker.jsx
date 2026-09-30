import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Clock, 
  Users, 
  AlertCircle, 
  CheckCircle, 
  MapPin, 
  TrendingUp, 
  TrendingDown, 
  ShieldAlert,
  ArrowRight,
  RefreshCw,
  BellRing
} from 'lucide-react';
import { api } from '../services/api';

export default function TokenTracker({ 
  initialTokenNumber = '', 
  tokens = [], 
  onRefresh 
}) {
  const [searchQuery, setSearchQuery] = useState(initialTokenNumber || '');
  const [selectedToken, setSelectedToken] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto-load if initialTokenNumber changes
  useEffect(() => {
    if (initialTokenNumber) {
      setSearchQuery(initialTokenNumber);
      handleSearch(initialTokenNumber);
    } else if (tokens.length > 0 && !selectedToken) {
      // Pick first waiting token as default demo
      const firstWaiting = tokens.find(t => t.status === 'WAITING') || tokens[0];
      if (firstWaiting) {
        setSearchQuery(firstWaiting.tokenNumber);
        setSelectedToken(firstWaiting);
      }
    }
  }, [initialTokenNumber, tokens]);

  // Keep selected token synced with live tokens updates
  useEffect(() => {
    if (selectedToken) {
      const refreshed = tokens.find(t => t.id === selectedToken.id);
      if (refreshed) {
        setSelectedToken(refreshed);
      }
    }
  }, [tokens]);

  const handleSearch = async (queryToSearch) => {
    const q = (queryToSearch || searchQuery).trim();
    if (!q) return;

    setIsLoading(true);
    setErrorMsg('');

    try {
      const res = await api.getTokenByIdOrNumber(q);
      if (res.success && res.data) {
        setSelectedToken(res.data);
      } else {
        setErrorMsg('Token not found. Please verify the token code.');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Error locating token');
    } finally {
      setIsLoading(false);
    }
  };

  const getQueuePosition = (tok) => {
    if (!tok || tok.status !== 'WAITING') return null;
    const sameServiceWaiting = tokens.filter(t => 
      t.serviceId === tok.serviceId && t.status === 'WAITING'
    );
    const pos = sameServiceWaiting.findIndex(t => t.id === tok.id);
    return pos !== -1 ? pos + 1 : 1;
  };

  const queuePos = getQueuePosition(selectedToken);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Search Header */}
      <div className="text-center mb-8">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Passenger & Patient Tracker
        </span>
        <h1 className="text-3xl font-extrabold text-white mt-2">Live Token Tracker</h1>
        <p className="text-slate-400 text-xs sm:text-sm mt-1">
          Monitor your dynamic queue position, live countdown, and service counter alerts in real time.
        </p>

        {/* Search Bar */}
        <form 
          onSubmit={(e) => { e.preventDefault(); handleSearch(); }}
          className="mt-6 max-w-md mx-auto flex gap-2"
        >
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-3 h-4 w-4 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Enter Token (e.g. MED-003, LOA-001)"
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 uppercase tracking-wider font-mono"
            />
          </div>
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs transition-all shadow-md shadow-indigo-600/30 disabled:opacity-50"
          >
            {isLoading ? <RefreshCw className="h-4 w-4 animate-spin" /> : 'Track'}
          </button>
        </form>

        {/* Quick Pick Chips */}
        {tokens.filter(t => t.status === 'WAITING' || t.status === 'CALLED' || t.status === 'IN_PROGRESS').length > 0 && (
          <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5 text-xs">
            <span className="text-slate-500 text-[11px] mr-1">Quick Select:</span>
            {tokens
              .filter(t => t.status === 'WAITING' || t.status === 'CALLED' || t.status === 'IN_PROGRESS')
              .slice(0, 5)
              .map(t => (
                <button
                  key={t.id}
                  onClick={() => {
                    setSearchQuery(t.tokenNumber);
                    handleSearch(t.tokenNumber);
                  }}
                  className={`px-2.5 py-1 rounded-lg font-mono text-xs border transition-all ${
                    selectedToken && selectedToken.id === t.id
                      ? 'bg-indigo-600 text-white border-indigo-500'
                      : 'bg-slate-900 text-slate-300 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {t.tokenNumber}
                </button>
              ))}
          </div>
        )}

        {errorMsg && (
          <div className="mt-4 max-w-md mx-auto p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs">
            {errorMsg}
          </div>
        )}
      </div>

      {/* Main Token Display Card */}
      {selectedToken && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden backdrop-blur-md">
          {/* Status Glow Bar */}
          <div className={`h-1.5 w-full absolute top-0 left-0 ${
            selectedToken.status === 'CALLED' 
              ? 'bg-amber-500 animate-pulse' 
              : selectedToken.status === 'IN_PROGRESS' 
              ? 'bg-emerald-500' 
              : selectedToken.status === 'COMPLETED' 
              ? 'bg-slate-600' 
              : 'bg-indigo-500'
          }`} />

          {/* Top Row: Token & Status */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                  {selectedToken.department}
                </span>
                <span className="text-xs text-slate-400">
                  Issued: {new Date(selectedToken.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </span>
                {selectedToken.priority !== 'REGULAR' && (
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                    {selectedToken.priority}
                  </span>
                )}
              </div>

              <div className="text-4xl sm:text-5xl font-black font-mono text-indigo-400 tracking-tight mt-1">
                {selectedToken.tokenNumber}
              </div>
              <div className="text-base font-semibold text-slate-200 mt-0.5">
                {selectedToken.customerName} • <span className="text-slate-400 font-normal">{selectedToken.serviceName}</span>
              </div>
            </div>

            {/* Status Pill */}
            <div className="self-start sm:self-center">
              <span className={`inline-flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-bold border ${
                selectedToken.status === 'CALLED'
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                  : selectedToken.status === 'IN_PROGRESS'
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                  : selectedToken.status === 'COMPLETED'
                  ? 'bg-slate-800 text-slate-400 border-slate-700'
                  : 'bg-indigo-500/20 text-indigo-300 border-indigo-500/40'
              }`}>
                {selectedToken.status === 'CALLED' && <BellRing className="h-4 w-4 animate-bounce" />}
                {selectedToken.status === 'WAITING' && <Clock className="h-4 w-4" />}
                {selectedToken.status === 'IN_PROGRESS' && <RefreshCw className="h-4 w-4 animate-spin" />}
                {selectedToken.status === 'COMPLETED' && <CheckCircle className="h-4 w-4" />}
                <span>
                  {selectedToken.status === 'CALLED' && 'NOW BEING CALLED!'}
                  {selectedToken.status === 'WAITING' && 'IN WAITING QUEUE'}
                  {selectedToken.status === 'IN_PROGRESS' && 'CURRENTLY BEING SERVED'}
                  {selectedToken.status === 'COMPLETED' && 'SERVICE COMPLETED'}
                </span>
              </span>
            </div>
          </div>

          {/* Active Callout Banner when Called */}
          {selectedToken.status === 'CALLED' && (
            <div className="my-6 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-between text-amber-200 animate-pulse">
              <div className="flex items-center gap-3">
                <MapPin className="h-6 w-6 text-amber-400 shrink-0" />
                <div>
                  <h4 className="font-bold text-sm">Please proceed immediately:</h4>
                  <p className="text-xs text-amber-300">
                    Assigned to <b className="text-white text-sm">{selectedToken.counterNumber || 'Counter'}</b> (Officer: {selectedToken.officerName || 'Staff'})
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Middle Section: Dynamic vs Static Waiting Breakdown */}
          {selectedToken.status === 'WAITING' && (
            <div className="my-6 grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Card 1: Queue Position */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
                <span className="text-xs font-semibold text-slate-400 block mb-1">Queue Position</span>
                <div className="text-3xl font-extrabold text-white flex items-center justify-center gap-1.5">
                  <Users className="h-6 w-6 text-indigo-400" />
                  <span>#{queuePos || 1}</span>
                </div>
                <span className="text-[11px] text-slate-500 mt-1 block">
                  Ahead in your service category
                </span>
              </div>

              {/* Card 2: Live Dynamic Wait Time */}
              <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-500/30 text-center relative overflow-hidden">
                <span className="text-xs font-bold text-indigo-300 block mb-1">
                  ⚡ Dynamic Expected Wait
                </span>
                <div className="text-3xl sm:text-4xl font-black text-indigo-200 font-mono">
                  ~{selectedToken.dynamicEstimatedWaitTimeMinutes || 10} <span className="text-base font-normal">mins</span>
                </div>
                <span className="text-[11px] text-indigo-400/80 mt-1 block">
                  Est. Call: {selectedToken.estimatedCallTime ? new Date(selectedToken.estimatedCallTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Soon'}
                </span>
              </div>

              {/* Card 3: Static Benchmark Comparison */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 text-center">
                <span className="text-xs font-semibold text-slate-500 block mb-1">Static Guess (Old Way)</span>
                <div className="text-2xl font-bold text-slate-400 line-through font-mono">
                  ~{selectedToken.staticEstimatedWaitTimeMinutes || 10} mins
                </div>
                <div className="mt-1 flex items-center justify-center gap-1 text-[11px]">
                  {(selectedToken.delayVarianceMinutes || 0) > 0 ? (
                    <span className="text-amber-400 flex items-center gap-0.5">
                      <TrendingUp className="h-3 w-3" /> +{selectedToken.delayVarianceMinutes}m dynamic shift
                    </span>
                  ) : (selectedToken.delayVarianceMinutes || 0) < 0 ? (
                    <span className="text-emerald-400 flex items-center gap-0.5">
                      <TrendingDown className="h-3 w-3" /> {selectedToken.delayVarianceMinutes}m faster
                    </span>
                  ) : (
                    <span className="text-slate-400">On exact schedule</span>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Dynamic Reason Explanation Pill */}
          {selectedToken.status === 'WAITING' && selectedToken.delayReason && (
            <div className="mb-6 p-3.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300 flex items-start gap-2.5">
              <AlertCircle className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold text-white">Dynamic Calibration Insight: </span>
                <span>{selectedToken.delayReason}</span>
              </div>
            </div>
          )}

          {/* Stepper / Timeline */}
          <div className="pt-4 border-t border-slate-800">
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-4">
              Real-Time Status Milestones
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              {/* Step 1 */}
              <div className="p-3 rounded-xl bg-slate-950 border border-slate-800">
                <div className="flex items-center gap-1.5 text-emerald-400 font-semibold mb-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>1. Token Booked</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {new Date(selectedToken.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </p>
              </div>

              {/* Step 2 */}
              <div className={`p-3 rounded-xl border ${
                selectedToken.status !== 'CANCELLED' 
                  ? 'bg-slate-950 border-indigo-500/40 text-indigo-300' 
                  : 'bg-slate-950/50 border-slate-800 text-slate-600'
              }`}>
                <div className="flex items-center gap-1.5 font-semibold mb-1">
                  <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  <span>2. Dynamic Engine</span>
                </div>
                <p className="text-[11px] text-slate-400">Continuous ETA recalculation</p>
              </div>

              {/* Step 3 */}
              <div className={`p-3 rounded-xl border ${
                selectedToken.status === 'CALLED' || selectedToken.status === 'IN_PROGRESS' || selectedToken.status === 'COMPLETED'
                  ? 'bg-slate-950 border-emerald-500/40 text-emerald-400' 
                  : 'bg-slate-950/50 border-slate-800 text-slate-600'
              }`}>
                <div className="flex items-center gap-1.5 font-semibold mb-1">
                  <MapPin className="h-3.5 w-3.5" />
                  <span>3. Counter Call</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {selectedToken.counterNumber || 'Assigned soon'}
                </p>
              </div>

              {/* Step 4 */}
              <div className={`p-3 rounded-xl border ${
                selectedToken.status === 'COMPLETED' 
                  ? 'bg-slate-950 border-emerald-500 text-emerald-400' 
                  : 'bg-slate-950/50 border-slate-800 text-slate-600'
              }`}>
                <div className="flex items-center gap-1.5 font-semibold mb-1">
                  <CheckCircle className="h-3.5 w-3.5" />
                  <span>4. Service Done</span>
                </div>
                <p className="text-[11px] text-slate-400">
                  {selectedToken.actualDurationMinutes ? `Took ${selectedToken.actualDurationMinutes}m` : 'Pending'}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
