import React, { useState, useEffect } from 'react';
import { 
  Tv, 
  Volume2, 
  VolumeX, 
  Clock, 
  Users, 
  Building2, 
  BellRing,
  ArrowRight,
  Sparkles,
  Maximize2
} from 'lucide-react';
import { playLobbyChime, speakAnnouncement } from '../utils/sound';

export default function LobbyDisplay({ 
  counters = [], 
  tokens = [], 
  selectedDepartment 
}) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [lastCalledId, setLastCalledId] = useState(null);

  // Live clock ticker
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Filter for selected department
  const filteredTokens = tokens.filter(t => 
    !selectedDepartment || selectedDepartment === 'ALL' || t.department === selectedDepartment
  );

  const filteredCounters = counters.filter(c => 
    !selectedDepartment || selectedDepartment === 'ALL' || c.department === selectedDepartment
  );

  // Active / Called tokens
  const nowServingTokens = filteredTokens.filter(t => 
    t.status === 'CALLED' || t.status === 'IN_PROGRESS'
  );

  // Upcoming waiting tokens
  const nextInLineTokens = filteredTokens
    .filter(t => t.status === 'WAITING')
    .slice(0, 8);

  const handleTestChime = () => {
    playLobbyChime();
    speakAnnouncement('MED-002', 'Room 101');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Lobby TV Header Board */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 mb-6 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: TV Title */}
        <div className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-2xl bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center text-indigo-400">
            <Tv className="h-6 w-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-extrabold text-white">Central Waiting Hall Display</h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                LIVE BROADCAST
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {selectedDepartment && selectedDepartment !== 'ALL' ? selectedDepartment : 'All Service Centers'} • Automated Real-Time Calling
            </p>
          </div>
        </div>

        {/* Center: Live Time Display */}
        <div className="flex items-center gap-6 bg-slate-950 px-6 py-2.5 rounded-2xl border border-slate-800">
          <div className="text-center">
            <span className="text-[10px] text-slate-500 font-semibold block uppercase">Current Time</span>
            <div className="text-2xl font-mono font-bold text-white tracking-wider">
              {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
            </div>
          </div>
          <div className="h-8 w-px bg-slate-800" />
          <div className="text-center">
            <span className="text-[10px] text-slate-500 font-semibold block uppercase">In Waiting Hall</span>
            <div className="text-2xl font-mono font-bold text-indigo-400">
              {nextInLineTokens.length} <span className="text-xs text-slate-400 font-normal">queued</span>
            </div>
          </div>
        </div>

        {/* Right: Audio Chime Controls */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setAudioEnabled(!audioEnabled)}
            className={`p-2.5 rounded-xl border text-xs font-semibold flex items-center gap-2 transition-all ${
              audioEnabled 
                ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500/40' 
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
            title="Toggle Chime"
          >
            {audioEnabled ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
            <span className="hidden sm:inline">{audioEnabled ? 'Chime ON' : 'Chime Muted'}</span>
          </button>

          <button
            onClick={handleTestChime}
            className="px-3 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-all flex items-center gap-1.5"
          >
            <BellRing className="h-3.5 w-3.5 text-indigo-400" />
            <span>Test Sound</span>
          </button>
        </div>
      </div>

      {/* Main Grid: NOW SERVING (Left/Major) vs UPCOMING (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* NOW SERVING BOARD (Col 7) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2 uppercase tracking-wide">
              <span className="h-3 w-3 rounded-full bg-emerald-500 animate-ping" />
              Now Serving / Called
            </h3>
            <span className="text-xs text-slate-400">{nowServingTokens.length} active counters</span>
          </div>

          {nowServingTokens.length === 0 ? (
            <div className="bg-slate-900/60 border border-slate-800 rounded-3xl p-12 text-center text-slate-400">
              <Users className="h-10 w-10 mx-auto text-slate-600 mb-3" />
              <h4 className="text-base font-bold text-slate-300">All Counters are Currently Standby</h4>
              <p className="text-xs text-slate-500 mt-1">Officers will call the next queued tokens shortly.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {nowServingTokens.map(token => {
                const isJustCalled = token.status === 'CALLED';
                return (
                  <div
                    key={token.id}
                    className={`rounded-3xl p-5 border relative overflow-hidden transition-all shadow-xl ${
                      isJustCalled
                        ? 'bg-gradient-to-br from-amber-950/60 via-slate-900 to-slate-900 border-amber-500/80 ring-2 ring-amber-500/40 glow-pulse'
                        : 'bg-gradient-to-br from-indigo-950/40 via-slate-900 to-slate-900 border-indigo-500/40'
                    }`}
                  >
                    {/* Glowing status banner */}
                    <div className="flex items-center justify-between mb-3">
                      <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        isJustCalled
                          ? 'bg-amber-500 text-slate-950 animate-pulse'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}>
                        {isJustCalled ? '🔔 NOW CALLING' : 'IN SERVICE'}
                      </span>

                      <span className="text-xs font-mono text-slate-400">
                        {token.department}
                      </span>
                    </div>

                    {/* Giant Token Code */}
                    <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white mb-2">
                      {token.tokenNumber}
                    </div>

                    {/* Assigned Counter & Officer */}
                    <div className="bg-slate-950/80 rounded-2xl p-3 border border-slate-800 mt-2">
                      <div className="text-xs text-slate-400 uppercase font-semibold">Proceed To:</div>
                      <div className="text-lg font-bold text-amber-300">
                        {token.counterNumber || 'Designated Counter'}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Officer: {token.officerName || 'Staff Member'}
                      </div>
                    </div>

                    {/* Bottom service info */}
                    <div className="mt-3 flex items-center justify-between text-xs text-slate-400">
                      <span>{token.serviceName}</span>
                      <span className="font-semibold text-slate-300">{token.customerName}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* UPCOMING NEXT IN QUEUE (Col 5) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-white flex items-center gap-2 uppercase tracking-wide">
              <Clock className="h-4 w-4 text-indigo-400" />
              Next in Line (Dynamic ETA)
            </h3>
            <span className="text-xs text-indigo-400 font-semibold">Priority Calibrated</span>
          </div>

          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-4 shadow-xl space-y-2">
            {nextInLineTokens.length === 0 ? (
              <div className="py-8 text-center text-slate-500 text-xs">
                No tokens currently waiting in queue.
              </div>
            ) : (
              nextInLineTokens.map((token, idx) => {
                const isEmergency = token.priority === 'EMERGENCY';
                const isSenior = token.priority === 'SENIOR_DISABILITY';

                return (
                  <div
                    key={token.id}
                    className={`flex items-center justify-between p-3 rounded-2xl border transition-all ${
                      idx === 0 
                        ? 'bg-indigo-950/30 border-indigo-500/40 text-slate-200' 
                        : 'bg-slate-950/60 border-slate-800/80 text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-xl font-mono text-xs font-bold flex items-center justify-center ${
                        idx === 0 ? 'bg-indigo-600 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        #{idx + 1}
                      </div>

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-bold text-base text-white">
                            {token.tokenNumber}
                          </span>
                          {isEmergency && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-rose-500/20 text-rose-300">
                              EMERGENCY
                            </span>
                          )}
                          {isSenior && (
                            <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-indigo-500/20 text-indigo-300">
                              SENIOR
                            </span>
                          )}
                        </div>
                        <div className="text-xs text-slate-400 line-clamp-1">
                          {token.serviceName}
                        </div>
                      </div>
                    </div>

                    {/* Dynamic Countdown */}
                    <div className="text-right">
                      <div className="text-sm font-mono font-bold text-indigo-400">
                        ~{token.dynamicEstimatedWaitTimeMinutes}m
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {token.estimatedCallTime 
                          ? new Date(token.estimatedCallTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
                          : 'Est.'}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Dynamic Information Banner */}
          <div className="p-4 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-xs text-indigo-300">
            <div className="flex items-center gap-2 font-bold text-white mb-1">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              Dynamic Notice for Waiting Passengers
            </div>
            <p className="text-[11px] text-slate-300 leading-relaxed">
              Waiting schedules update automatically as officers complete transactions. If an acute or complex case occurs ahead of you, your expected call time will smoothly adapt.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
