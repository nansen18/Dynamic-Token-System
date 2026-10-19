import React, { useState, useEffect, useCallback } from 'react';
import Navbar from './components/Navbar';
import KioskBooking from './components/KioskBooking';
import TokenTracker from './components/TokenTracker';
import LobbyDisplay from './components/LobbyDisplay';
import OfficerTerminal from './components/OfficerTerminal';
import AnalyticsDashboard from './components/AnalyticsDashboard';
import StaffManagement from './components/StaffManagement';

// Auth Pages
import WelcomePortal from './components/auth/WelcomePortal';
import CustomerLogin from './components/auth/CustomerLogin';
import CustomerSignUp from './components/auth/CustomerSignUp';
import StaffLogin from './components/auth/StaffLogin';
import AdminLogin from './components/auth/AdminLogin';

import { api, socket, authStorage } from './services/api';
import { playLobbyChime, speakAnnouncement } from './utils/sound';

export default function App() {
  // Authentication State
  const [currentUser, setCurrentUser] = useState(() => authStorage.getUser());
  const [authView, setAuthView] = useState(() => (authStorage.getUser() ? null : 'welcome'));

  // Main UI State
  const [activeTab, setActiveTab] = useState(() => {
    const user = authStorage.getUser();
    if (!user) return 'kiosk';
    if (user.role === 'STAFF') return 'officer';
    if (user.role === 'ADMIN') return 'analytics';
    return 'kiosk';
  });

  const [selectedDepartment, setSelectedDepartment] = useState('ALL');
  const [services, setServices] = useState([]);
  const [counters, setCounters] = useState([]);
  const [tokens, setTokens] = useState([]);
  const [stats, setStats] = useState(null);
  const [socketConnected, setSocketConnected] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [trackedTokenNumber, setTrackedTokenNumber] = useState('');
  const [notificationBanner, setNotificationBanner] = useState(null);

  // Validate session on mount
  useEffect(() => {
    async function verifySession() {
      if (authStorage.getToken()) {
        try {
          const res = await api.getMe();
          if (res.user) {
            setCurrentUser(res.user);
            authStorage.setUser(res.user);
          }
        } catch {
          // Token expired or invalid
          authStorage.clear();
          setCurrentUser(null);
          setAuthView('welcome');
        }
      }
    }
    verifySession();
  }, []);

  // Fetch all system data
  const loadData = useCallback(async () => {
    try {
      const [srvRes, cntRes, tokRes, statRes] = await Promise.all([
        api.getServices(selectedDepartment),
        api.getCounters(selectedDepartment),
        api.getTokens({ department: selectedDepartment }),
        api.getStats(selectedDepartment)
      ]);

      if (srvRes.data) setServices(srvRes.data);
      if (cntRes.data) setCounters(cntRes.data);
      if (tokRes.data) setTokens(tokRes.data);
      if (statRes.stats) setStats(statRes.stats);
    } catch (err) {
      console.warn('Failed loading data from backend:', err.message);
    }
  }, [selectedDepartment]);

  // Initial load and department changes
  useEffect(() => {
    loadData();
  }, [loadData]);

  // Setup Socket.IO real-time listeners
  useEffect(() => {
    function onConnect() {
      setSocketConnected(true);
    }

    function onDisconnect() {
      setSocketConnected(false);
    }

    function onTokenCreated(newToken) {
      loadData();
      showNotification(`Token ${newToken.tokenNumber} issued (${newToken.customerName})`);
    }

    function onTokenCalled(payload) {
      loadData();
      if (payload && payload.token && payload.counter) {
        playLobbyChime();
        speakAnnouncement(payload.token.tokenNumber, payload.counter.counterNumber);
        showNotification(`📢 Token ${payload.token.tokenNumber} called to ${payload.counter.counterNumber}!`, 'amber');
      }
    }

    function onScheduleUpdated() {
      loadData();
    }

    function onDataReset() {
      loadData();
      showNotification('Simulation database reloaded with rich hospital, bank, and DMV records!', 'indigo');
    }

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('TOKEN_CREATED', onTokenCreated);
    socket.on('TOKEN_CALLED', onTokenCalled);
    socket.on('SERVICE_STARTED', loadData);
    socket.on('SERVICE_COMPLETED', loadData);
    socket.on('TOKEN_NO_SHOW', loadData);
    socket.on('SCHEDULE_UPDATED', onScheduleUpdated);
    socket.on('COUNTER_STATUS_CHANGED', loadData);
    socket.on('DATA_RESET', onDataReset);

    if (socket.connected) {
      setSocketConnected(true);
    }

    // Auto-polling safety net every 8 seconds
    const interval = setInterval(() => {
      loadData();
    }, 8000);

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('TOKEN_CREATED', onTokenCreated);
      socket.off('TOKEN_CALLED', onTokenCalled);
      socket.off('SERVICE_STARTED', loadData);
      socket.off('SERVICE_COMPLETED', loadData);
      socket.off('TOKEN_NO_SHOW', loadData);
      socket.off('SCHEDULE_UPDATED', onScheduleUpdated);
      socket.off('COUNTER_STATUS_CHANGED', loadData);
      socket.off('DATA_RESET', onDataReset);
      clearInterval(interval);
    };
  }, [loadData]);

  const showNotification = (msg, type = 'indigo') => {
    setNotificationBanner({ msg, type });
    setTimeout(() => {
      setNotificationBanner(null);
    }, 4500);
  };

  // Auth Actions & Redirects
  const handleLoginSuccess = (user) => {
    setCurrentUser(user);
    setAuthView(null);

    // Redirect to correct dashboard based on role
    if (user.role === 'CUSTOMER') {
      setActiveTab('kiosk');
      showNotification(`🎉 Welcome back, ${user.name}! Customer booking dashboard ready.`, 'emerald');
    } else if (user.role === 'STAFF') {
      setActiveTab('officer');
      showNotification(`👔 Officer terminal connected. Welcome, ${user.name}!`, 'amber');
    } else if (user.role === 'ADMIN') {
      setActiveTab('analytics');
      showNotification(`🛡️ Administrator clearance verified. Welcome, ${user.name}!`, 'indigo');
    }
  };

  const handleLogout = () => {
    api.logout();
    setCurrentUser(null);
    setAuthView('welcome');
    setActiveTab('kiosk');
    showNotification('👋 You have successfully signed out.', 'indigo');
  };

  const handleOpenAuth = () => {
    setAuthView('welcome');
  };

  const handleResetData = async () => {
    setIsResetting(true);
    try {
      await api.seedData();
      await loadData();
    } catch (err) {
      alert('Reset failed: ' + err.message);
    } finally {
      setIsResetting(false);
    }
  };

  const handleTrackToken = (tokenNum) => {
    setTrackedTokenNumber(tokenNum);
    setActiveTab('tracker');
    setAuthView(null);
  };

  const handleOpenLobby = () => {
    setAuthView(null);
    setActiveTab('lobby');
  };

  const waitingCount = tokens.filter(t => t.status === 'WAITING').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      {/* Top Navbar */}
      <Navbar
        activeTab={activeTab}
        setActiveTab={(tab) => {
          setActiveTab(tab);
          setAuthView(null);
        }}
        selectedDepartment={selectedDepartment}
        setSelectedDepartment={setSelectedDepartment}
        onResetData={handleResetData}
        isResetting={isResetting}
        socketConnected={socketConnected}
        waitingCount={waitingCount}
        currentUser={currentUser}
        onLogout={handleLogout}
        onOpenAuth={handleOpenAuth}
      />

      {/* Floating Real-Time Event Banner */}
      {notificationBanner && (
        <div className="fixed bottom-5 right-5 z-50 animate-in fade-in slide-in-from-bottom-5">
          <div className={`px-4 py-3 rounded-2xl shadow-2xl border text-xs sm:text-sm font-semibold flex items-center gap-2 backdrop-blur-md ${
            notificationBanner.type === 'amber'
              ? 'bg-amber-950/90 text-amber-200 border-amber-500/50 shadow-amber-500/20'
              : notificationBanner.type === 'emerald'
              ? 'bg-emerald-950/90 text-emerald-200 border-emerald-500/50 shadow-emerald-500/20'
              : 'bg-indigo-950/90 text-indigo-200 border-indigo-500/50 shadow-indigo-500/20'
          }`}>
            <span className={`h-2 w-2 rounded-full animate-ping ${
              notificationBanner.type === 'amber' ? 'bg-amber-400' :
              notificationBanner.type === 'emerald' ? 'bg-emerald-400' : 'bg-indigo-400'
            }`} />
            <span>{notificationBanner.msg}</span>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="flex-1 pb-16">
        {/* Unauthenticated / Dedicated Auth Pages */}
        {authView === 'welcome' && (
          <WelcomePortal
            onSelectView={(view) => setAuthView(view)}
            onQuickTrack={() => {
              setAuthView(null);
              setActiveTab('tracker');
            }}
            onOpenLobby={handleOpenLobby}
          />
        )}

        {authView === 'customer-login' && (
          <CustomerLogin
            onLoginSuccess={handleLoginSuccess}
            onSwitchToSignUp={() => setAuthView('customer-signup')}
            onBackToWelcome={() => setAuthView('welcome')}
          />
        )}

        {authView === 'customer-signup' && (
          <CustomerSignUp
            onSignUpSuccess={handleLoginSuccess}
            onSwitchToLogin={() => setAuthView('customer-login')}
            onBackToWelcome={() => setAuthView('welcome')}
          />
        )}

        {authView === 'staff-login' && (
          <StaffLogin
            onLoginSuccess={handleLoginSuccess}
            onBackToWelcome={() => setAuthView('welcome')}
          />
        )}

        {authView === 'admin-login' && (
          <AdminLogin
            onLoginSuccess={handleLoginSuccess}
            onBackToWelcome={() => setAuthView('welcome')}
          />
        )}

        {/* Existing Application Views (When authView is null) */}
        {!authView && (
          <>
            {activeTab === 'kiosk' && (
              <KioskBooking
                services={services}
                tokens={tokens}
                onTokenCreated={() => loadData()}
                onTrackToken={handleTrackToken}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'tracker' && (
              <TokenTracker
                initialTokenNumber={trackedTokenNumber}
                tokens={tokens}
                onRefresh={loadData}
              />
            )}

            {activeTab === 'lobby' && (
              <LobbyDisplay
                counters={counters}
                tokens={tokens}
                selectedDepartment={selectedDepartment}
              />
            )}

            {activeTab === 'officer' && (
              <OfficerTerminal
                counters={counters}
                tokens={tokens}
                onActionComplete={loadData}
                currentUser={currentUser}
              />
            )}

            {activeTab === 'analytics' && (
              <AnalyticsDashboard
                stats={stats}
                services={services}
                counters={counters}
                onRefresh={loadData}
                onResetData={handleResetData}
              />
            )}

            {activeTab === 'staff' && (
              <StaffManagement
                counters={counters}
                onClose={() => setActiveTab('analytics')}
              />
            )}
          </>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-900 bg-slate-950/80 py-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            <span>NexusQueue Engine • Dynamic Moving Average Duration Model</span>
          </div>
          <p>
            MERN Stack Implementation with WebSockets & Real-Time Queue Synchronization
          </p>
        </div>
      </footer>
    </div>
  );
}

