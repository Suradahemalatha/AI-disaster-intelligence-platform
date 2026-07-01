import React, { useState, useEffect } from 'react';
import { User, DisasterReport, Alert, ResourceAllocation } from './types';
import AuthModal from './components/AuthModal';
import Dashboard from './components/Dashboard';
import IncidentReporting from './components/IncidentReporting';
import Chatbot from './components/Chatbot';
import DamageAnalysis from './components/DamageAnalysis';
import RiskPrediction from './components/RiskPrediction';
import AlertCenter from './components/AlertCenter';
import { 
  ShieldAlert, LayoutDashboard, AlertOctagon, HelpCircle, HardHat, Zap, 
  LogOut, Shield, Siren, User as UserIcon, Clock, Wifi, Calendar
} from 'lucide-react';

export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [reports, setReports] = useState<DisasterReport[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [allocations, setAllocations] = useState<ResourceAllocation[]>([]);
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [loading, setLoading] = useState<boolean>(false);
  const [time, setTime] = useState<Date>(new Date());

  // Dynamic real-time clock update
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  // Sync data once logged in
  useEffect(() => {
    if (user) {
      syncOperationalFeeds();
    }
  }, [user]);

  const syncOperationalFeeds = async () => {
    setLoading(true);
    try {
      const [reportsRes, alertsRes, allocationsRes] = await Promise.all([
        fetch('/api/reports'),
        fetch('/api/alerts'),
        fetch('/api/allocations')
      ]);

      if (reportsRes.ok && alertsRes.ok && allocationsRes.ok) {
        const reportsData = await reportsRes.json();
        const alertsData = await alertsRes.json();
        const allocationsData = await allocationsRes.json();

        setReports(reportsData);
        setAlerts(alertsData);
        setAllocations(allocationsData);
      }
    } catch (err) {
      console.error('Failed to sync EOC metrics:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (authenticatedUser: User) => {
    setUser(authenticatedUser);
  };

  const handleLogout = () => {
    setUser(null);
    setActiveTab('dashboard');
  };

  const handleUpdateReportStatus = async (id: string, status: string) => {
    try {
      const response = await fetch(`/api/reports/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        const updated: DisasterReport = await response.json();
        setReports(prev => prev.map(r => r.id === id ? updated : r));
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleAllocateResource = (reportId: string, allocation: ResourceAllocation) => {
    setAllocations(prev => [...prev, allocation]);
    setReports(prev => prev.map(r => r.id === reportId ? { ...r, status: 'dispatched' } : r));
  };

  const handleAddReport = (newReport: DisasterReport) => {
    setReports(prev => [newReport, ...prev]);
  };

  const handleAddAlert = (newAlert: Alert) => {
    setAlerts(prev => [newAlert, ...prev]);
  };

  const handleDismissAlert = (id: string) => {
    setAlerts(prev => prev.filter(a => a.id !== id));
  };

  // If user is not logged in, render the Auth Switchboard
  if (!user) {
    return <AuthModal onLogin={handleLogin} />;
  }

  const getRoleBadge = (role: string) => {
    switch (role) {
      case 'admin': return { label: 'Administrator', icon: <Shield className="w-3.5 h-3.5 text-red-400" />, color: 'border-red-500/30 text-red-400 bg-red-950/20' };
      case 'responder': return { label: 'EOC First Responder', icon: <Siren className="w-3.5 h-3.5 text-sky-400" />, color: 'border-sky-500/30 text-sky-400 bg-sky-950/20' };
      default: return { label: 'Citizen Portal', icon: <UserIcon className="w-3.5 h-3.5 text-amber-400" />, color: 'border-amber-500/30 text-amber-400 bg-amber-950/20' };
    }
  };

  const roleInfo = getRoleBadge(user.role);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      
      {/* Top operational telemetry header bar */}
      <header className="bg-slate-900 border-b border-slate-800 px-6 py-3 shrink-0 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-red-950/40 border border-red-900/40 rounded-xl text-red-500">
            <ShieldAlert className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <h1 className="text-sm font-bold tracking-tight text-slate-100 leading-tight">
              AI Disaster Intelligence Platform
            </h1>
            <p className="text-[10px] text-slate-500 uppercase font-semibold font-mono tracking-wider flex items-center gap-1.5">
              <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              EOC-COMM-GATEWAY ACTIVE
            </p>
          </div>
        </div>

        {/* Server metrics (E.g. Clock / User status info) */}
        <div className="flex items-center gap-5 text-slate-400 text-xs font-mono">
          <div className="hidden md:flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-slate-600" />
            <span>{time.toLocaleDateString([], { weekday: 'short', month: 'short', day: '2-digit' })}</span>
          </div>

          <div className="flex items-center gap-1.5">
            <Clock className="w-4 h-4 text-slate-600" />
            <span>{time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false })} UTC</span>
          </div>

          <div className="hidden lg:flex items-center gap-1.5 border border-slate-800 bg-slate-950 px-2.5 py-1 rounded-md text-[10px] text-emerald-400">
            <Wifi className="w-3.5 h-3.5 animate-pulse" />
            <span>LINK SECURED</span>
          </div>
        </div>
      </header>

      {/* Main Container: Sidebar + Content */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden relative">
        
        {/* Left Drawer Navigation bar */}
        <aside className="w-full md:w-64 bg-slate-900 border-b md:border-b-0 md:border-r border-slate-800 p-4 flex flex-col justify-between shrink-0 overflow-y-auto">
          <div className="space-y-6">
            
            {/* Logged-in Operator details */}
            <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
              <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Active Terminal operator</div>
              <div className="flex items-center gap-2.5">
                <div className="p-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300">
                  <UserIcon className="w-4 h-4" />
                </div>
                <div className="overflow-hidden">
                  <div className="text-slate-200 text-xs font-bold truncate">{user.name}</div>
                  <div className="text-[10px] text-slate-500 truncate">{user.email}</div>
                </div>
              </div>

              {/* Styled Role Badge */}
              <div className={`border p-1.5 rounded-lg flex items-center gap-1.5 text-[10.5px] font-mono tracking-wide ${roleInfo.color}`}>
                {roleInfo.icon}
                <span className="font-semibold">{roleInfo.label}</span>
              </div>
            </div>

            {/* Ingress Router Tabs list */}
            <div className="space-y-1">
              <div className="text-[9px] font-bold text-slate-600 uppercase tracking-widest px-2 mb-2">EOC Operations</div>
              
              <button
                onClick={() => setActiveTab('dashboard')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'dashboard'
                    ? 'bg-red-950/40 border border-red-900/60 text-red-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40 border border-transparent'
                }`}
              >
                <LayoutDashboard className="w-4 h-4" />
                Command Dashboard
              </button>

              <button
                onClick={() => setActiveTab('report')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'report'
                    ? 'bg-red-950/40 border border-red-900/60 text-red-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40 border border-transparent'
                }`}
              >
                <ShieldAlert className="w-4 h-4" />
                File Disaster Report
              </button>

              <button
                onClick={() => setActiveTab('chat')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'chat'
                    ? 'bg-red-950/40 border border-red-900/60 text-red-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40 border border-transparent'
                }`}
              >
                <HelpCircle className="w-4 h-4" />
                AI Emergency Assistant
              </button>

              <button
                onClick={() => setActiveTab('analysis')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'analysis'
                    ? 'bg-red-950/40 border border-red-900/60 text-red-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40 border border-transparent'
                }`}
              >
                <HardHat className="w-4 h-4" />
                Visual Damage Analyzer
              </button>

              <button
                onClick={() => setActiveTab('prediction')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all ${
                  activeTab === 'prediction'
                    ? 'bg-red-950/40 border border-red-900/60 text-red-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40 border border-transparent'
                }`}
              >
                <Zap className="w-4 h-4" />
                AI Hazard Forecaster
              </button>

              <button
                onClick={() => setActiveTab('alerts')}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold tracking-wide transition-all relative ${
                  activeTab === 'alerts'
                    ? 'bg-red-950/40 border border-red-900/60 text-red-400'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-950/40 border border-transparent'
                }`}
              >
                <AlertOctagon className="w-4 h-4" />
                EAS Alert Broadcaster
                {alerts.length > 0 && (
                  <span className="absolute right-3 bg-red-600 text-slate-100 text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-full">
                    {alerts.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* Bottom logout control panel */}
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-3 py-2.5 mt-6 rounded-xl text-xs font-semibold tracking-wide text-slate-500 hover:text-red-400 hover:bg-red-950/15 transition-all border border-transparent cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            Switch Operator Profile
          </button>
        </aside>

        {/* Content Container Canvas with standard, fluid scrolling layout */}
        <main className="flex-1 overflow-y-auto p-6 bg-slate-950 relative">
          
          {/* Main content render conditional */}
          {activeTab === 'dashboard' && (
            <Dashboard 
              user={user}
              reports={reports}
              alerts={alerts}
              allocations={allocations}
              onRefresh={syncOperationalFeeds}
              onUpdateReportStatus={handleUpdateReportStatus}
              onAllocateResource={handleAllocateResource}
            />
          )}

          {activeTab === 'report' && (
            <IncidentReporting 
              reportedBy={user.name}
              onReportCreated={handleAddReport}
            />
          )}

          {activeTab === 'chat' && (
            <Chatbot />
          )}

          {activeTab === 'analysis' && (
            <DamageAnalysis />
          )}

          {activeTab === 'prediction' && (
            <RiskPrediction />
          )}

          {activeTab === 'alerts' && (
            <AlertCenter 
              user={user}
              alerts={alerts}
              onAddAlert={handleAddAlert}
              onDismissAlert={handleDismissAlert}
            />
          )}

        </main>
      </div>

    </div>
  );
}
