import React from 'react';
import { 
  Activity, 
  RotateCcw, 
  Tv, 
  Search, 
  Ticket, 
  UserCog, 
  BarChart3,
  LogOut,
  LogIn,
  User,
  ShieldCheck,
  Users
} from 'lucide-react';

export default function Navbar({ 
  activeTab, 
  setActiveTab, 
  selectedDepartment, 
  setSelectedDepartment,
  onResetData,
  isResetting,
  socketConnected,
  waitingCount = 0,
  currentUser,
  onLogout,
  onOpenAuth
}) {
  const departments = [
    { id: 'ALL', label: 'All Sectors' },
    { id: 'Hospital', label: '🏥 Healthcare / Hospital' },
    { id: 'Bank', label: '🏦 Retail Banking' },
    { id: 'Government Office', label: '🏛️ Government / DMV' }
  ];

  // All possible tabs
  const allTabs = [
    { id: 'kiosk', label: 'Get Token (Kiosk)', icon: Ticket, roles: ['CUSTOMER', 'ADMIN'] },
    { id: 'tracker', label: 'Live Token Tracker', icon: Search, badge: waitingCount > 0 ? waitingCount : null, roles: ['CUSTOMER', 'ADMIN'] },
    { id: 'lobby', label: 'Lobby TV Display', icon: Tv, roles: ['CUSTOMER', 'STAFF', 'ADMIN', 'GUEST'] },
    { id: 'officer', label: 'Officer Desk Terminal', icon: UserCog, roles: ['STAFF', 'ADMIN'] },
    { id: 'analytics', label: 'Dynamic Analytics & SLA', icon: BarChart3, roles: ['ADMIN'] },
    { id: 'staff', label: 'Staff Accounts', icon: Users, roles: ['ADMIN'] }
  ];

  // Filter tabs by role
  const userRole = currentUser ? currentUser.role : 'GUEST';
  const visibleTabs = allTabs.filter(tab => tab.roles.includes(userRole));

  const getRoleBadge = (role) => {
    switch (role) {
      case 'ADMIN':
        return { label: 'Admin', color: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30' };
      case 'STAFF':
        return { label: 'Staff Officer', color: 'bg-amber-500/20 text-amber-300 border-amber-500/30' };
      case 'CUSTOMER':
      default:
        return { label: 'Customer', color: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' };
    }
  };

  const roleBadge = currentUser ? getRoleBadge(currentUser.role) : null;

  return (
    <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur-md border-b border-slate-800 shadow-xl">
      {/* Top Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-3">
          
          {/* Logo & Title */}
          <div 
            onClick={() => {
              if (currentUser) {
                if (currentUser.role === 'CUSTOMER') setActiveTab('kiosk');
                else if (currentUser.role === 'STAFF') setActiveTab('officer');
                else setActiveTab('analytics');
              } else {
                onOpenAuth();
              }
            }}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-purple-500 flex items-center justify-center shadow-lg shadow-indigo-500/25 group-hover:scale-105 transition-transform">
              <Activity className="h-6 w-6 text-white animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-white group-hover:text-indigo-300 transition-colors">NexusQueue</span>
                <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  v2.0
                </span>
              </div>
              <p className="text-xs text-slate-400 hidden sm:block">Dynamic Wait-Time & Smart Token Scheduling</p>
            </div>
          </div>

          {/* Department Sector Switcher & Action Controls */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Department Filter (Visible if logged in or lobby) */}
            <div className="relative hidden lg:block">
              <select
                value={selectedDepartment}
                onChange={(e) => setSelectedDepartment(e.target.value)}
                className="bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              <span className="hidden sm:inline">{socketConnected ? 'Live Socket Sync' : 'Connecting...'}</span>
            </div>

            {/* Admin Reset / Seed Demo Data (Admin role only) */}
            {currentUser && currentUser.role === 'ADMIN' && (
              <button
                onClick={onResetData}
                disabled={isResetting}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-xl bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
                title="Reset simulation data with rich records"
              >
                <RotateCcw className={`h-3.5 w-3.5 ${isResetting ? 'animate-spin' : ''}`} />
                <span className="hidden md:inline">Reset Simulation</span>
              </button>
            )}

            {/* User Profile & Auth Button */}
            {currentUser ? (
              <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-800">
                <div className="hidden sm:flex flex-col items-end text-right">
                  <span className="text-xs font-semibold text-white leading-tight">{currentUser.name}</span>
                  <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-md border mt-0.5 ${roleBadge.color}`}>
                    {roleBadge.label}
                  </span>
                </div>

                <div className="h-8 w-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-300">
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>

                <button
                  onClick={onLogout}
                  className="flex items-center gap-1.5 p-2 sm:px-3 sm:py-1.5 text-xs font-medium rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition-all hover:scale-105 active:scale-95"
                  title="Sign Out"
                >
                  <LogOut className="h-3.5 w-3.5" />
                  <span className="hidden sm:inline">Sign Out</span>
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 pl-2 sm:pl-3 border-l border-slate-800">
                <button
                  onClick={onOpenAuth}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/25 transition-all hover:scale-105 active:scale-95"
                >
                  <LogIn className="h-3.5 w-3.5" />
                  <span>Portals & Sign In</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tab Navigation */}
        {visibleTabs.length > 0 && (
          <div className="flex items-center space-x-1 sm:space-x-2 overflow-x-auto py-2 scrollbar-none border-t border-slate-800/60">
            {visibleTabs.map(tab => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-3.5 py-1.5 sm:py-2 text-xs sm:text-sm font-medium rounded-xl transition-all whitespace-nowrap ${
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
        )}
      </div>
    </header>
  );
}

