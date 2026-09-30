import React from 'react';
import { 
  Activity, 
  Building2, 
  RotateCcw, 
  Tv, 
  Search, 
  Ticket, 
  UserCog, 
  BarChart3,
  Wifi,
  Sparkles
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  selectedDepartment, 
  setSelectedDepartment,
  onResetData,
  isResetting,
  socketConnected,
  waitingCount = 0
}) {
  const departments = [
    { id: 'ALL', label: 'All Sectors' },
    { id: 'Hospital', label: '🏥 Healthcare / Hospital' },
    { id: 'Bank', label: '🏦 Retail Banking' },
    { id: 'Government Office', label: '🏛️ Government / DMV' }
  ];

  const tabs = [
    { id: 'kiosk', label: 'Get Token (Kiosk)', icon: Ticket },
    { id: 'tracker', label: 'Live Token Tracker', icon: Search, badge: waitingCount > 0 ? waitingCount : null },
    { id: 'lobby', label: 'Lobby TV Display', icon: Tv },
    { id: 'officer', label: 'Officer Desk Terminal', icon: UserCog },
    { id: 'analytics', label: 'Dynamic Analytics & SLA', icon: BarChart3 }
  ];

  return (
    <header className="sticky top-0 z-50 bg-slate-900/90 backdrop-blur-md border-b border-slate-800">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo & Title */}
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25">
              <Activity className="h-6 w-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white">NexusQueue</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  Dynamic Wait-Time v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Adaptive Real-Time Token Scheduling Engine</p>
            </div>
          </div>

          {/* Department Sector Switcher & Action Controls */}
          <div className="flex items-center gap-3">
            {/* Department Filter */}
            <div className="relative hidden md:block">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {departments.map(d => (
                  <option key={d.id} value={d.id}>{d.label}</option>
                ))}
              </select>
            </div>

            {/* Socket Status Indicator */}
            <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${
              socketConnected 
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
            }`}>
              <span className={`h-2 w-2 rounded-full ${socketConnected ? 'bg-emerald-400 animate-ping' : 'bg-rose-400'}`} />
              <span className="hidden sm:inline">{socketConnected ? 'Live Socket Sync' : 'Reconnecting...'}</span>
            </div>

            {/* Reset / Seed Demo Data */}
            <button
              onClick={onResetData}
              disabled={isResetting}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
              title="Reset data with rich Hospital, Bank, and DMV scenarios"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${isResetting ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Reset & Seed Demo</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/60">
          {tabs.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-3.5 py-2 text-xs sm:text-sm font-medium rounded-lg transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Icon className={`h-4 w-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{tab.label}</span>
                {tab.badge && (
                  <span className={`ml-1 text-[10px] font-bold px-1.5 py-0.2 rounded-full ${
                    isActive ? 'bg-white text-indigo-700' : 'bg-indigo-500/20 text-indigo-300'
                  }`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </header>
  );
}
