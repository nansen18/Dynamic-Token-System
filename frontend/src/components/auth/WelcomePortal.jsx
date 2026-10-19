import React from 'react';
import { 
  Ticket, 
  UserCog, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles, 
  Tv, 
  Search, 
  Lock, 
  CheckCircle2, 
  Clock, 
  Zap,
  Activity
} from 'lucide-react';

export default function WelcomePortal({ onSelectView, onQuickTrack, onOpenLobby }) {
  return (
    <div className="min-h-[calc(100vh-140px)] flex flex-col items-center justify-center px-4 py-10 sm:px-6 lg:px-8">
      {/* Ambient background glows */}
      <div className="relative w-full max-w-6xl">
        <div className="absolute -top-24 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Hero Section */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-300 text-xs font-semibold mb-4 backdrop-blur-sm animate-pulse">
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>Next-Gen Smart Queue & Dynamic Wait Estimation</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            Select Your <span className="bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400 bg-clip-text text-transparent">Portal & Access Role</span>
          </h1>

          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            Welcome to NexusQueue. Choose your role below to access self-service ticket booking, officer desk terminals, or system analytics and staff provisioning.
          </p>
        </div>

        {/* 3 Role Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8 max-w-6xl mx-auto">
          
          {/* 1. CUSTOMER PORTAL */}
          <div className="group relative rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-emerald-500/50 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-emerald-500/10 hover:-translate-y-1 backdrop-blur-md">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20 group-hover:scale-105 transition-transform">
                  <Ticket className="h-7 w-7 text-white" />
                </div>
                <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  Public • Self-Service
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                Customer
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                Book smart queue tokens for Hospital, Banking, or DMV appointments. Track live waiting times with dynamic AI estimation on your mobile device.
              </p>

              <div className="space-y-2 mb-8">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Instant self-service token generation</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Live moving-average wait time tracker</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                  <span>Free registration with name & email</span>
                </div>
              </div>
            </div>

            <div className="space-y-3 pt-4 border-t border-slate-800/80">
              <button
                onClick={() => onSelectView('customer-login')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Customer Login</span>
                <ArrowRight className="h-4 w-4" />
              </button>

              <button
                onClick={() => onSelectView('customer-signup')}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-xs sm:text-sm bg-slate-800/80 hover:bg-slate-700/80 text-emerald-300 border border-emerald-500/30 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Create New Account (Sign Up)</span>
              </button>
            </div>
          </div>

          {/* 2. STAFF OFFICER TERMINAL */}
          <div className="group relative rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-amber-500/50 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-amber-500/10 hover:-translate-y-1 backdrop-blur-md">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-amber-600 to-orange-400 flex items-center justify-center shadow-lg shadow-amber-500/20 group-hover:scale-105 transition-transform">
                  <UserCog className="h-7 w-7 text-white" />
                </div>
                <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  Officer Desk
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-amber-300 transition-colors">
                Staff Officer
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                Dedicated desk officer workstation. Call waiting tokens to your counter, initiate consultations, record service completion, and manage no-shows.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Real-time counter calling & TV chime</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Live service duration & delay logging</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-amber-400 shrink-0" />
                  <span>Multi-sector counter assignment</span>
                </div>
              </div>

              {/* Informative notice for Staff accounts */}
              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300/90 leading-snug mb-6 flex items-start gap-2">
                <Lock className="h-3.5 w-3.5 text-amber-400 shrink-0 mt-0.5" />
                <span>Staff accounts are provisioned exclusively by authorized administrators.</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80">
              <button
                onClick={() => onSelectView('staff-login')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-lg shadow-amber-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Staff Officer Login</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* 3. ADMIN CONTROL CENTER */}
          <div className="group relative rounded-2xl bg-slate-900/80 border border-slate-800 hover:border-indigo-500/50 p-6 sm:p-8 flex flex-col justify-between transition-all duration-300 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 backdrop-blur-md">
            <div>
              <div className="flex items-center justify-between mb-6">
                <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
                  <ShieldCheck className="h-7 w-7 text-white" />
                </div>
                <span className="text-[11px] font-bold tracking-wider uppercase px-2.5 py-1 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  Security Clearance
                </span>
              </div>

              <h2 className="text-xl sm:text-2xl font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors">
                Administrator
              </h2>
              <p className="text-slate-400 text-xs sm:text-sm leading-relaxed mb-6">
                System configuration hub. Monitor SLA compliance, tune moving-average estimation parameters, inspect real-time database stats, and provision staff.
              </p>

              <div className="space-y-2 mb-6">
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Authorized Staff Account Provisioning</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Dynamic EWMA duration benchmark tuning</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-slate-300">
                  <CheckCircle2 className="h-4 w-4 text-indigo-400 shrink-0" />
                  <span>Database health & SLA variance metrics</span>
                </div>
              </div>

              {/* Informative notice for Admin accounts */}
              <div className="p-3 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-[11px] text-indigo-300/90 leading-snug mb-6 flex items-start gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-indigo-400 shrink-0 mt-0.5" />
                <span>Admin accounts must be created through the authorized setup process.</span>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800/80">
              <button
                onClick={() => onSelectView('admin-login')}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-xl font-semibold text-sm bg-gradient-to-r from-indigo-600 via-indigo-500 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-lg shadow-indigo-600/25 transition-all hover:scale-[1.02] active:scale-[0.98]"
              >
                <span>Admin Portal Login</span>
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Public Access Helper Bar */}
        <div className="mt-12 sm:mt-14 max-w-4xl mx-auto rounded-2xl bg-slate-900/60 border border-slate-800/80 p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md">
          <div className="flex items-center gap-3 text-center sm:text-left">
            <div className="h-10 w-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 text-slate-300">
              <Tv className="h-5 w-5 text-indigo-400" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-semibold text-slate-200">Looking for the Public Waiting Lobby Screen?</p>
              <p className="text-[11px] text-slate-400">View real-time called tokens, audio announcements, and counter status without signing in.</p>
            </div>
          </div>

          <button
            onClick={onOpenLobby}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs sm:text-sm font-medium bg-slate-800 hover:bg-slate-700 text-indigo-300 border border-slate-700 transition-all hover:scale-105 active:scale-95 whitespace-nowrap"
          >
            <Tv className="h-4 w-4 text-indigo-400" />
            <span>Open Lobby TV Display</span>
          </button>
        </div>
      </div>
    </div>
  );
}
