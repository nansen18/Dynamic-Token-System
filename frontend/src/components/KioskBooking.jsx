import React, { useState } from 'react';
import { 
  Ticket, 
  Clock, 
  Users, 
  AlertTriangle, 
  CheckCircle2, 
  ShieldAlert, 
  Sparkles,
  QrCode,
  ArrowRight,
  TrendingUp,
  HeartPulse,
  Landmark,
  FileText
} from 'lucide-react';
import { api } from '../services/api';

export default function KioskBooking({ 
  services, 
  tokens, 
  onTokenCreated, 
  onTrackToken 
}) {
  const [selectedServiceId, setSelectedServiceId] = useState('');
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [priority, setPriority] = useState('REGULAR');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdToken, setCreatedToken] = useState(null);
  const [errorMsg, setErrorMsg] = useState('');

  // Auto select first service if not selected
  const activeService = services.find(s => s.id === selectedServiceId) || services[0];
  const currentServiceId = selectedServiceId || (activeService ? activeService.id : '');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!currentServiceId) {
      setErrorMsg('Please select a service category');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg('');

    try {
      const res = await api.createToken({
        serviceId: currentServiceId,
        customerName: customerName.trim() || 'Visitor',
        customerPhone: customerPhone.trim(),
        priority
      });

      if (res.success && res.data) {
        setCreatedToken(res.data);
        if (onTokenCreated) onTokenCreated(res.data);
        setCustomerName('');
        setCustomerPhone('');
        setPriority('REGULAR');
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to issue token');
    } finally {
      setIsSubmitting(false);
    }
  };

  const getWaitingCountForService = (sId) => {
    return tokens.filter(t => t.serviceId === sId && t.status === 'WAITING').length;
  };

  const getEstimatedWaitForService = (service) => {
    const waiting = getWaitingCountForService(service.id);
    const eff = service.currentDynamicDuration || service.baseDurationMinutes || 10;
    return Math.max(1, Math.round((waiting + 1) * (eff / 1.5)));
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Intro Header */}
      <div className="text-center max-w-3xl mx-auto mb-10">
        <span className="text-xs font-semibold px-3 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
          Smart Kiosk Terminal
        </span>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mt-3 tracking-tight">
          Book a Dynamic Token
        </h1>
        <p className="text-slate-400 text-sm sm:text-base mt-2">
          Unlike static token systems with fixed intervals, our engine continuously calibrates 
          waiting schedules based on real-time consultation times and counter throughput.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Side: Service Selector Cards */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-bold text-slate-200 flex items-center gap-2">
              <Ticket className="h-4 w-4 text-indigo-400" />
              1. Select Service Category
            </h2>
            <span className="text-xs text-slate-400">{services.length} services available</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {services.map(service => {
              const isSelected = currentServiceId === service.id;
              const waitingCount = getWaitingCountForService(service.id);
              const estimatedWait = getEstimatedWaitForService(service);
              const dynamicPace = service.currentDynamicDuration || service.baseDurationMinutes;
              const isPaceElevated = dynamicPace > service.baseDurationMinutes + 2;

              return (
                <div
                  key={service.id}
                  onClick={() => setSelectedServiceId(service.id)}
                  className={`cursor-pointer rounded-xl p-4 border transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-slate-800/90 border-indigo-500 ring-2 ring-indigo-500/30 shadow-lg shadow-indigo-500/10'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                  }`}
                >
                  {/* Department Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700">
                      {service.department}
                    </span>
                    <span className="text-xs font-mono font-bold text-indigo-400">
                      {service.codePrefix}-XXX
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-slate-100 mb-1">{service.name}</h3>
                  <p className="text-xs text-slate-400 line-clamp-1 mb-3">{service.description}</p>

                  {/* Dynamic Duration Comparison */}
                  <div className="bg-slate-950/60 rounded-lg p-2.5 space-y-1.5 border border-slate-800/80 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="h-3 w-3 text-slate-400" /> Base Benchmark:
                      </span>
                      <span className="text-slate-300 font-mono">{service.baseDurationMinutes}m</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 flex items-center gap-1">
                        <TrendingUp className="h-3 w-3 text-indigo-400" /> Dynamic Live Pace:
                      </span>
                      <span className={`font-mono font-bold ${
                        isPaceElevated ? 'text-amber-400' : 'text-emerald-400'
                      }`}>
                        ~{dynamicPace}m {isPaceElevated ? '⚠️' : '✓'}
                      </span>
                    </div>

                    <div className="pt-1 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
                      <span className="text-slate-400 flex items-center gap-1">
                        <Users className="h-3 w-3 text-slate-400" /> In line: <b className="text-slate-200">{waitingCount}</b>
                      </span>
                      <span className="text-indigo-300 font-semibold">
                        Est. Wait: ~{estimatedWait}m
                      </span>
                    </div>
                  </div>

                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="h-4 w-4 text-indigo-400 fill-indigo-400/20" />
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Right Side: Customer Details & Priority Form */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl relative backdrop-blur-sm">
            <h2 className="text-base font-bold text-slate-200 mb-4 flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              2. Passenger / Visitor Details
            </h2>

            {errorMsg && (
              <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 shrink-0" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Full Name */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Full Name or Alias
                </label>
                <input
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  placeholder="e.g. John Doe / Patient Alpha"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  required
                />
              </div>

              {/* Phone / Mobile */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">
                  Mobile Number <span className="text-slate-500 font-normal">(Optional for SMS alerts)</span>
                </label>
                <input
                  type="tel"
                  value={customerPhone}
                  onChange={(e) => setCustomerPhone(e.target.value)}
                  placeholder="e.g. +1 (555) 019-2834"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Priority Tier Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-2">
                  Priority Category
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'REGULAR', label: 'Regular Visitor', icon: Users, desc: 'Standard sequential queue' },
                    { id: 'SENIOR_DISABILITY', label: 'Senior / Disability', icon: HeartPulse, desc: 'Expedited tier' },
                    { id: 'EMERGENCY', label: 'Emergency / Critical', icon: ShieldAlert, desc: 'Jumps to slot #1' },
                    { id: 'VIP', label: 'VIP / Commercial', icon: Sparkles, desc: 'Fast-track desk' }
                  ].map(p => {
                    const isPriSelected = priority === p.id;
                    const Icon = p.icon;
                    return (
                      <div
                        key={p.id}
                        onClick={() => setPriority(p.id)}
                        className={`cursor-pointer rounded-xl p-2.5 border text-left transition-all ${
                          isPriSelected
                            ? p.id === 'EMERGENCY'
                              ? 'bg-rose-950/40 border-rose-500 text-rose-200'
                              : 'bg-indigo-950/40 border-indigo-500 text-indigo-200'
                            : 'bg-slate-950/50 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1.5 font-semibold text-xs mb-0.5">
                          <Icon className={`h-3.5 w-3.5 ${
                            p.id === 'EMERGENCY' ? 'text-rose-400' : 'text-indigo-400'
                          }`} />
                          <span>{p.label}</span>
                        </div>
                        <p className="text-[10px] text-slate-500">{p.desc}</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Estimated Summary Info Box */}
              {activeService && (
                <div className="p-3 rounded-xl bg-indigo-500/5 border border-indigo-500/20 text-xs space-y-1">
                  <div className="flex justify-between text-slate-300">
                    <span>Target Service:</span>
                    <span className="font-semibold text-white">{activeService.name}</span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>Dynamic Queue Schedule:</span>
                    <span className="font-bold text-indigo-400">
                      ~{getEstimatedWaitForService(activeService)} mins wait time
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-400 pt-1">
                    ✨ Your schedule will automatically adjust in real time if any consultation ahead runs short or long.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSubmitting ? (
                  <span>Generating Dynamic Token...</span>
                ) : (
                  <>
                    <Ticket className="h-4 w-4" />
                    <span>Generate Digital Token Slip</span>
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </div>

      {/* Token Slip Modal (Appears when token is created) */}
      {createdToken && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-slate-900 border border-indigo-500/50 rounded-2xl max-w-md w-full p-6 shadow-2xl relative text-center">
            {/* Top Badge */}
            <div className="inline-flex items-center justify-center h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-400 mb-3 border border-emerald-500/30">
              <CheckCircle2 className="h-6 w-6" />
            </div>

            <h3 className="text-xl font-extrabold text-white">Token Generated Successfully!</h3>
            <p className="text-xs text-slate-400 mt-1">Please keep this digital slip handy or monitor the lobby display.</p>

            {/* Token Card */}
            <div className="mt-5 p-5 bg-slate-950 rounded-xl border border-slate-800 text-left relative overflow-hidden">
              <div className="flex justify-between items-start">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    {createdToken.department} • {createdToken.serviceName}
                  </span>
                  <div className="text-3xl font-extrabold font-mono text-indigo-400 tracking-tight mt-0.5">
                    {createdToken.tokenNumber}
                  </div>
                  <div className="text-sm font-semibold text-slate-200 mt-1">
                    {createdToken.customerName}
                  </div>
                </div>

                <div className="p-2 bg-white rounded-lg">
                  <QrCode className="h-12 w-12 text-slate-950" />
                </div>
              </div>

              {/* Timing metrics */}
              <div className="mt-4 pt-4 border-t border-slate-800 grid grid-cols-2 gap-3 text-xs">
                <div>
                  <span className="text-slate-500 block text-[11px]">Static Default Guess:</span>
                  <span className="font-mono text-slate-400 line-through">
                    ~{createdToken.staticEstimatedWaitTimeMinutes || 10} mins
                  </span>
                </div>
                <div>
                  <span className="text-indigo-400 font-semibold block text-[11px]">⚡ Dynamic Real Wait:</span>
                  <span className="font-mono font-bold text-indigo-300 text-sm">
                    ~{createdToken.dynamicEstimatedWaitTimeMinutes || 12} mins
                  </span>
                </div>
              </div>

              {createdToken.priority !== 'REGULAR' && (
                <div className="mt-3 text-[11px] font-semibold px-2.5 py-1 rounded-md bg-rose-500/20 text-rose-300 border border-rose-500/30 inline-block">
                  Priority: {createdToken.priority}
                </div>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex flex-col sm:flex-row gap-2.5">
              <button
                onClick={() => {
                  const tok = createdToken;
                  setCreatedToken(null);
                  if (onTrackToken) onTrackToken(tok.tokenNumber);
                }}
                className="flex-1 py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs flex items-center justify-center gap-1.5 transition-all shadow-md shadow-indigo-600/30"
              >
                <span>Track Live Progress</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>

              <button
                onClick={() => setCreatedToken(null)}
                className="py-2.5 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs transition-all"
              >
                Close Slip
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
