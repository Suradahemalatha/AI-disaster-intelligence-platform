import React, { useState } from 'react';
import { Alert, User } from '../types';
import { 
  AlertOctagon, Megaphone, Siren, ShieldAlert, CheckCircle, Trash2, 
  MapPin, Clock, PlusCircle, Loader2, AlertTriangle, ShieldCheck
} from 'lucide-react';

interface AlertCenterProps {
  user: User;
  alerts: Alert[];
  onAddAlert: (newAlert: Alert) => void;
  onDismissAlert: (id: string) => void;
}

export default function AlertCenter({ user, alerts, onAddAlert, onDismissAlert }: AlertCenterProps) {
  const [title, setTitle] = useState('');
  const [message, setMessage] = useState('');
  const [type, setType] = useState<'info' | 'warning' | 'danger'>('warning');
  const [area, setArea] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleCreateAlert = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) {
      setError('Title and warning bulletin message are required.');
      return;
    }

    setSubmitting(true);
    setError('');

    try {
      const response = await fetch('/api/alerts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, message, type, area })
      });

      if (!response.ok) {
        throw new Error('Failed to create alert.');
      }

      const freshAlert: Alert = await response.json();
      onAddAlert(freshAlert);
      
      // Reset Form State
      setTitle('');
      setMessage('');
      setArea('');
    } catch (err) {
      setError('Connection to emergency broadcast server timed out.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteAlert = async (id: string) => {
    try {
      const response = await fetch(`/api/alerts/${id}`, {
        method: 'DELETE'
      });
      if (response.ok) {
        onDismissAlert(id);
      }
    } catch (err) {
      console.error(err);
    }
  };

  const getAlertStyle = (alertType: string) => {
    switch (alertType) {
      case 'danger': return 'bg-red-950/20 border-red-900/60 text-red-400';
      case 'warning': return 'bg-amber-950/20 border-amber-900/60 text-amber-400';
      default: return 'bg-sky-950/20 border-sky-900/60 text-sky-400';
    }
  };

  const getAlertIcon = (alertType: string) => {
    switch (alertType) {
      case 'danger': return <AlertOctagon className="w-5 h-5 text-red-500 shrink-0" />;
      case 'warning': return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      default: return <Megaphone className="w-5 h-5 text-sky-500 shrink-0" />;
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      
      {/* Header element */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Megaphone className="w-6 h-6 text-red-500 animate-pulse" />
            Emergency EAS Broadcasting Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Dispatch mass alerts, safety advisories, and red-flag weather warnings to all civilian mobile terminal overlays
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] font-mono text-slate-500 bg-slate-950 border border-slate-800 px-3 py-1 rounded">
            CAP COMPLIANT (EAS)
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Create broadcast form (Visible strictly to Responders/Admins) */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          {user.role !== 'citizen' ? (
            <form onSubmit={handleCreateAlert} className="space-y-4">
              <h3 className="text-slate-100 font-bold text-sm border-b border-slate-800 pb-2.5 flex items-center gap-2">
                <PlusCircle className="w-4 h-4 text-red-500" />
                Dispatch Emergency EAS Bulletin
              </h3>

              {error && (
                <div className="p-3 bg-red-950/30 border border-red-900/30 text-red-400 text-xs rounded-xl flex gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wider">Alert Heading / Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Mandatory Zone B Evacuation Order"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider">Bulletin Class</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-2 py-2 text-xs text-slate-300 focus:outline-none cursor-pointer"
                  >
                    <option value="danger">Red Alert (Danger)</option>
                    <option value="warning">Orange Alert (Advisory)</option>
                    <option value="info">Blue Alert (Information)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-400 font-semibold mb-1.5 uppercase tracking-wider">Targeted Sector / Area</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maricopa County"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-400 text-xs font-semibold mb-1.5 uppercase tracking-wider font-sans">EAS Bulletin Message Body</label>
                <textarea
                  required
                  rows={4}
                  placeholder="Draft clear, instruction-focused tactical safety warnings for affected citizens..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-red-500 resize-none leading-relaxed"
                />
              </div>

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-slate-100 font-bold rounded-xl py-3 text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    Broadcasting EAS alert...
                  </>
                ) : (
                  <>
                    <Megaphone className="w-3.5 h-3.5" />
                    Broadcast Public Bulletin
                  </>
                )}
              </button>
            </form>
          ) : (
            <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-4">
              <ShieldCheck className="w-12 h-12 text-emerald-500/80 animate-pulse" />
              <div>
                <h4 className="text-slate-300 font-bold text-sm">EAS Terminals Active</h4>
                <p className="text-slate-500 text-xs mt-1.5 leading-relaxed">
                  Your terminal is fully synced to EOC priority alerts. Civilian accounts can monitor live broadcasts, but are restricted from generating EAS alert triggers.
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Alerts Feed List */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 min-h-[400px] flex flex-col justify-between">
          <div className="space-y-4 flex-1">
            <h3 className="text-slate-100 font-bold text-sm border-b border-slate-800 pb-2.5 flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-slate-400" />
              Current Public Alert Feed ({alerts.length})
            </h3>

            <div className="space-y-3 max-h-[340px] overflow-y-auto pr-1">
              {alerts.length === 0 ? (
                <div className="text-center py-12 text-slate-600 text-xs italic border border-dashed border-slate-800 rounded-xl">
                  No active emergency warnings currently logged in this sector
                </div>
              ) : (
                alerts.map((a) => (
                  <div 
                    key={a.id} 
                    className={`p-4 border rounded-xl flex gap-3.5 transition-all animate-fade-in ${getAlertStyle(a.type)}`}
                  >
                    {getAlertIcon(a.type)}

                    <div className="flex-1 space-y-1 overflow-hidden">
                      <div className="flex items-center justify-between">
                        <h4 className="font-bold text-xs leading-none tracking-tight">{a.title}</h4>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono opacity-50 flex items-center gap-0.5">
                            <Clock className="w-3 h-3" />
                            {new Date(a.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                          
                          {user.role !== 'citizen' && (
                            <button
                              onClick={() => handleDeleteAlert(a.id)}
                              className="p-1 hover:bg-red-500/15 rounded text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                              title="Dismiss Alert"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] leading-relaxed opacity-90">{a.message}</p>
                      
                      <div className="flex items-center gap-1.5 text-[9.5px] font-mono opacity-60 uppercase tracking-wide pt-1">
                        <MapPin className="w-3 h-3 shrink-0" />
                        <span>Sectors: {a.area}</span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl flex gap-2 text-[10px] text-slate-500 leading-normal mt-5 shrink-0">
            <ShieldAlert className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
            <span>
              EAS sirens and localized cellphone carrier broadcasts occur within 180 seconds of public dispatch. Cooperating agencies maintain compliance with emergency guidelines.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
