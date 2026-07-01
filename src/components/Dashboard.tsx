import React, { useState, useEffect } from 'react';
import { DisasterReport, Alert, User, ResourceAllocation } from '../types';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend
} from 'recharts';
import { 
  Flame, ShieldAlert, Siren, Users, CheckCircle2, AlertTriangle, MapPin, 
  ChevronRight, RefreshCw, FileText, Send, Calendar, Clock, Map, ClipboardList
} from 'lucide-react';

interface DashboardProps {
  user: User;
  reports: DisasterReport[];
  alerts: Alert[];
  allocations: ResourceAllocation[];
  onRefresh: () => void;
  onUpdateReportStatus: (id: string, status: string) => void;
  onAllocateResource: (reportId: string, allocationData: any) => void;
}

export default function Dashboard({ 
  user, reports, alerts, allocations, onRefresh, onUpdateReportStatus, onAllocateResource 
}: DashboardProps) {
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [severityFilter, setSeverityFilter] = useState<string>('all');
  
  // Resource allocation form state
  const [responderTeam, setResponderTeam] = useState('Metro Emergency Response Taskforce');
  const [personnelCount, setPersonnelCount] = useState(6);
  const [vehicle, setVehicle] = useState('Heavy Incident Truck');
  const [equipment, setEquipment] = useState('Heavy Machinery Clearance Pack, First Aid Support');
  const [allocating, setAllocating] = useState(false);

  // Auto select first report if none is selected
  useEffect(() => {
    if (reports.length > 0 && !selectedReportId) {
      setSelectedReportId(reports[0].id);
    }
  }, [reports, selectedReportId]);

  const selectedReport = reports.find(r => r.id === selectedReportId);

  // Filter reports
  const filteredReports = reports.filter(r => {
    const matchesSearch = r.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          r.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          r.location.address.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || r.type === typeFilter;
    const matchesSeverity = severityFilter === 'all' || r.severity === severityFilter;
    return matchesSearch && matchesType && matchesSeverity;
  });

  // Calculate stats
  const activeReportsCount = reports.filter(r => r.status !== 'resolved').length;
  const criticalCount = reports.filter(r => r.severity === 'critical' && r.status !== 'resolved').length;
  const resolvedCount = reports.filter(r => r.status === 'resolved').length;
  const dispatchedCount = allocations.length;

  // Chart 1: Incidents by Type
  const typesData = ['flood', 'cyclone', 'earthquake', 'wildfire', 'landslide', 'heatwave', 'other'].map(type => {
    return {
      name: type.charAt(0).toUpperCase() + type.slice(1),
      count: reports.filter(r => r.type === type).length
    };
  }).filter(t => t.count > 0);

  // Chart 2: Incidents by Severity
  const severityData = [
    { name: 'Low', count: reports.filter(r => r.severity === 'low').length, color: '#10b981' },
    { name: 'Medium', count: reports.filter(r => r.severity === 'medium').length, color: '#f59e0b' },
    { name: 'High', count: reports.filter(r => r.severity === 'high').length, color: '#ef4444' },
    { name: 'Critical', count: reports.filter(r => r.severity === 'critical').length, color: '#7f1d1d' },
  ].filter(s => s.count > 0);

  const handleDispatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedReportId) return;
    setAllocating(true);
    
    try {
      const response = await fetch(`/api/reports/${selectedReportId}/allocate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          responderTeam,
          personnelCount,
          vehiclesAllocated: [vehicle],
          equipmentSent: equipment.split(',').map(item => item.trim())
        })
      });

      if (response.ok) {
        onRefresh();
        // Reset form
        setResponderTeam('Metro Emergency Response Taskforce');
        setPersonnelCount(6);
        setVehicle('Heavy Incident Truck');
        setEquipment('Heavy Machinery Clearance Pack, First Aid Support');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setAllocating(false);
    }
  };

  const getSeverityBadgeColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-950/40 border-red-500 text-red-400';
      case 'high': return 'bg-orange-950/40 border-orange-500 text-orange-400';
      case 'medium': return 'bg-amber-950/40 border-amber-500 text-amber-400';
      default: return 'bg-emerald-950/40 border-emerald-500 text-emerald-400';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'resolved': return 'bg-emerald-950/40 border-emerald-500 text-emerald-400';
      case 'dispatched': return 'bg-sky-950/40 border-sky-500 text-sky-400';
      case 'reviewing': return 'bg-purple-950/40 border-purple-500 text-purple-400';
      default: return 'bg-slate-950/40 border-slate-500 text-slate-400';
    }
  };

  // SVGs of simulated regional topography for tactical map representation
  return (
    <div className="space-y-6">
      {/* Upper header section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 border border-slate-800 rounded-2xl p-6">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500 animate-pulse" />
            Tactical Operations Command Center
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time incident response tracking, resource mobilization, and cognitive impact analysis
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button 
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-950 border border-slate-800 hover:border-slate-700 active:bg-slate-900 text-slate-300 rounded-xl transition-all font-semibold text-sm cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh Feeds
          </button>
          <div className="px-4 py-2 bg-red-950/30 border border-red-900/30 rounded-xl text-xs font-mono text-red-400">
            SYSTEM STATUS: ONLINE
          </div>
        </div>
      </div>

      {/* Emergency active alerts band */}
      {alerts.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-xs font-bold text-slate-500 uppercase tracking-widest px-1">Active Bulletins</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {alerts.map(a => (
              <div 
                key={a.id} 
                className={`p-4 border rounded-xl flex gap-3.5 ${
                  a.type === 'danger' 
                    ? 'bg-red-950/20 border-red-900/40 text-red-300' 
                    : 'bg-amber-950/20 border-amber-900/40 text-amber-300'
                }`}
              >
                <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <div className="font-semibold text-sm">{a.title}</div>
                  <div className="text-xs opacity-80 mt-1">{a.message}</div>
                  <div className="text-[10px] uppercase font-mono opacity-60 mt-2 tracking-wider">
                    Affected Area: {a.area}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats Cards Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Active Emergencies</div>
            <div className="text-3xl font-bold text-slate-100 mt-1">{activeReportsCount}</div>
          </div>
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <Flame className="w-6 h-6 animate-pulse" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Critical Priorities</div>
            <div className="text-3xl font-bold text-red-400 mt-1">{criticalCount}</div>
          </div>
          <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-xl">
            <Siren className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Deployed Assets</div>
            <div className="text-3xl font-bold text-sky-400 mt-1">{dispatchedCount}</div>
          </div>
          <div className="p-3 bg-sky-500/10 border border-sky-500/20 text-sky-400 rounded-xl">
            <Users className="w-6 h-6" />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex items-center justify-between">
          <div>
            <div className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Resolved Events</div>
            <div className="text-3xl font-bold text-emerald-400 mt-1">{resolvedCount}</div>
          </div>
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <CheckCircle2 className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Main Grid: Tactical Map & Analytical Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Side: Interactive Tactical Map */}
        <div className="lg:col-span-8 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-[400px] lg:h-[480px]">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-slate-100 font-bold text-base flex items-center gap-2">
                <Map className="w-5 h-5 text-red-500" />
                EOC Regional Tactical Map Overlay
              </h3>
              <p className="text-slate-500 text-xs mt-0.5">Click map pins to retrieve report profiles from the command center list</p>
            </div>
            <span className="text-[10px] font-mono bg-slate-950 px-2 py-1 border border-slate-800 rounded text-slate-400">
              SIMULATED GIS GRAPH
            </span>
          </div>

          {/* Interactive Topographic Map Grid container */}
          <div className="relative flex-1 bg-slate-950 border border-slate-800 rounded-xl overflow-hidden group">
            {/* Styled Grid Lines for modern tech aesthetic */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:40px_40px] opacity-15" />
            
            {/* Topographical Contour lines representation */}
            <svg className="absolute inset-0 w-full h-full opacity-10 text-emerald-500" pointerEvents="none">
              <path d="M 100 200 Q 250 80 400 200 T 700 200" fill="none" stroke="currentColor" strokeWidth="1" />
              <path d="M 50 300 Q 300 150 550 300 T 800 300" fill="none" stroke="currentColor" strokeWidth="1" />
              <path d="M 120 100 Q 350 40 580 100" fill="none" stroke="currentColor" strokeWidth="1" />
            </svg>

            {/* Simulated Coastal shoreline */}
            <div className="absolute right-0 bottom-0 top-0 w-1/4 bg-blue-950/20 border-l border-blue-900/40 rounded-r-xl" />
            <div className="absolute bottom-4 right-4 text-[10px] font-mono text-blue-500">ATLANTIC OCEAN BASIN</div>

            {/* Pins of reports */}
            {reports.map((r, i) => {
              // Convert lat/lng to stylized coordinate percentages on map canvas
              // Base coordinates focused on standard US/world cities (Miami, SF, Seattle)
              let x = 30 + (i * 22) % 60; // relative mock positions
              let y = 25 + (i * 28) % 60;

              // Force absolute points for our seed items to match regions nicely
              if (r.id === 'rep-1') { x = 20; y = 40; } // Sierra SF
              if (r.id === 'rep-2') { x = 72; y = 70; } // Miami Beach near shoreline
              if (r.id === 'rep-3') { x = 35; y = 20; } // Seattle Cascades

              const isSelected = selectedReportId === r.id;

              return (
                <button
                  key={r.id}
                  onClick={() => setSelectedReportId(r.id)}
                  style={{ left: `${x}%`, top: `${y}%` }}
                  className="absolute -translate-x-1/2 -translate-y-1/2 flex flex-col items-center group cursor-pointer"
                >
                  <div className="relative">
                    {/* Ring Pulses for severity */}
                    <span className={`absolute inline-flex h-6 w-6 rounded-full opacity-75 -left-1 -top-1 animate-ping ${
                      r.severity === 'critical' ? 'bg-red-500' :
                      r.severity === 'high' ? 'bg-orange-500' :
                      r.severity === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'
                    }`} />
                    
                    <div className={`p-1.5 rounded-full border shadow-xl relative z-10 transition-all ${
                      isSelected 
                        ? 'bg-slate-100 border-white text-slate-900 scale-125' 
                        : r.severity === 'critical' ? 'bg-red-950 border-red-500 text-red-400 hover:bg-red-900' :
                          r.severity === 'high' ? 'bg-orange-950 border-orange-500 text-orange-400 hover:bg-orange-900' :
                          r.severity === 'medium' ? 'bg-amber-950 border-amber-500 text-amber-400 hover:bg-amber-900' :
                          'bg-emerald-950 border-emerald-500 text-emerald-400 hover:bg-emerald-900'
                    }`}>
                      <MapPin className="w-4 h-4" />
                    </div>
                  </div>
                  
                  {/* Pin label popover */}
                  <div className={`mt-1 text-[10px] font-mono px-2 py-0.5 rounded shadow-md border pointer-events-none transition-opacity ${
                    isSelected 
                      ? 'bg-slate-100 text-slate-900 border-white font-bold opacity-100' 
                      : 'bg-slate-950 text-slate-300 border-slate-800 opacity-0 group-hover:opacity-100'
                  }`}>
                    {r.type.toUpperCase()}-{r.id.split('-')[1]}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Right Side: Charts Breakdown */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-[230px] flex flex-col justify-between">
            <div>
              <h4 className="text-slate-100 font-bold text-sm">Incident Distribution by Severity</h4>
              <p className="text-slate-500 text-xs mt-0.5">Classification profile across reported hazards</p>
            </div>
            
            <div className="flex-1 min-h-[140px] mt-2 flex items-center justify-center">
              {severityData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={severityData}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={65}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {severityData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={32} 
                      iconSize={8}
                      iconType="circle"
                      formatter={(val) => <span className="text-[11px] text-slate-400 font-medium font-sans">{val}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <span className="text-slate-500 text-xs italic">No statistics logged</span>
              )}
            </div>
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 h-[230px] flex flex-col justify-between">
            <div>
              <h4 className="text-slate-100 font-bold text-sm">Emergencies by Threat Category</h4>
              <p className="text-slate-500 text-xs mt-0.5">Quantity break down by disaster type index</p>
            </div>

            <div className="flex-1 min-h-[140px] mt-2">
              {typesData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={typesData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#64748b" fontSize={10} tickLine={false} />
                    <YAxis stroke="#64748b" fontSize={10} tickLine={false} allowDecimals={false} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', borderRadius: '8px' }}
                      itemStyle={{ color: '#e2e8f0', fontSize: '12px' }}
                    />
                    <Bar dataKey="count" fill="#dc2626" radius={[4, 4, 0, 0]}>
                      {typesData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#ef4444' : '#f97316'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-500 text-xs italic">No statistics logged</div>
              )}
            </div>
          </div>
        </div>

      </div>

      {/* Grid for Active Incident List & Comprehensive Profile Detail Card */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Incident List feed */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col h-[540px]">
          <div className="mb-4">
            <h3 className="text-slate-100 font-bold text-base flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-red-500" />
              EOC Disaster Incident Feed
            </h3>
            <p className="text-slate-500 text-xs">Search and filter active civilian hazard filings</p>
          </div>

          <div className="space-y-2.5 mb-4 shrink-0">
            <input
              type="text"
              placeholder="Search reports by description or address..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-3 py-2 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
            />
            <div className="grid grid-cols-2 gap-2">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-400 focus:border-red-500 focus:outline-none cursor-pointer"
              >
                <option value="all">All Disaster Types</option>
                <option value="flood">Floods</option>
                <option value="cyclone">Cyclones</option>
                <option value="earthquake">Earthquakes</option>
                <option value="wildfire">Wildfires</option>
                <option value="landslide">Landslides</option>
                <option value="heatwave">Heatwaves</option>
              </select>
              <select
                value={severityFilter}
                onChange={(e) => setSeverityFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-400 focus:border-red-500 focus:outline-none cursor-pointer"
              >
                <option value="all">All Severities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="critical">Critical</option>
              </select>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filteredReports.length === 0 ? (
              <div className="text-center py-12 text-slate-600 text-sm italic border border-dashed border-slate-800 rounded-xl">
                No reports matched search criteria
              </div>
            ) : (
              filteredReports.map((r) => (
                <button
                  key={r.id}
                  onClick={() => setSelectedReportId(r.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all flex justify-between items-center group cursor-pointer ${
                    selectedReportId === r.id
                      ? 'bg-slate-950 border-red-900/60 shadow-lg'
                      : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="space-y-1 overflow-hidden pr-2">
                    <div className="flex items-center gap-2">
                      <span className={`inline-block w-2 h-2 rounded-full ${
                        r.status === 'resolved' ? 'bg-emerald-500' :
                        r.status === 'dispatched' ? 'bg-sky-400 animate-pulse' :
                        'bg-purple-500 animate-ping'
                      }`} />
                      <span className="text-xs font-mono font-bold text-slate-400">{r.id.toUpperCase()}</span>
                      <span className={`text-[9px] font-mono font-bold uppercase border px-1.5 rounded ${getSeverityBadgeColor(r.severity)}`}>
                        {r.severity}
                      </span>
                    </div>
                    <h4 className="text-slate-200 text-xs font-semibold truncate group-hover:text-slate-100 transition-colors">
                      {r.title}
                    </h4>
                    <p className="text-slate-500 text-[11px] truncate flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-600 shrink-0" />
                      {r.location.address}
                    </p>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-slate-600 shrink-0 group-hover:text-slate-400 group-hover:translate-x-0.5 transition-all ${
                    selectedReportId === r.id ? 'text-red-400 translate-x-0.5' : ''
                  }`} />
                </button>
              ))
            )}
          </div>
        </div>

        {/* Selected Incident Details & EOC Action Command Center */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col min-h-[540px]">
          {selectedReport ? (
            <div className="space-y-5 flex-1 flex flex-col justify-between">
              
              {/* Header profile title */}
              <div className="space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider font-mono border rounded ${getSeverityBadgeColor(selectedReport.severity)}`}>
                    {selectedReport.severity} SEVERITY
                  </span>
                  <span className={`px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider font-mono border rounded ${getStatusBadgeColor(selectedReport.status)}`}>
                    STATUS: {selectedReport.status}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1 ml-auto">
                    <Calendar className="w-3 h-3" />
                    {new Date(selectedReport.reportedAt).toLocaleDateString()}
                  </span>
                  <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {new Date(selectedReport.reportedAt).toLocaleTimeString()}
                  </span>
                </div>
                
                <h3 className="text-slate-100 font-bold text-lg leading-tight tracking-tight">
                  {selectedReport.title}
                </h3>
                <p className="text-slate-400 text-xs flex items-center gap-1.5 font-sans">
                  <MapPin className="w-3.5 h-3.5 text-red-400" />
                  <strong>Location:</strong> {selectedReport.location.address} 
                  <span className="text-slate-500 font-mono">({selectedReport.location.lat.toFixed(4)}, {selectedReport.location.lng.toFixed(4)})</span>
                </p>
              </div>

              {/* Photos & Description */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                <div className="md:col-span-8 space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Civilian Filed Statement</div>
                  <p className="text-slate-300 text-xs leading-relaxed bg-slate-950 p-3.5 border border-slate-800/60 rounded-xl h-28 overflow-y-auto">
                    {selectedReport.description}
                  </p>
                  <div className="text-[10px] text-slate-500 font-mono">
                    Filed by: <strong className="text-slate-400">{selectedReport.reportedBy}</strong>
                  </div>
                </div>

                {/* Damage attachment or placeholder icon */}
                <div className="md:col-span-4 flex flex-col justify-between bg-slate-950 border border-slate-800 rounded-xl p-3 h-36">
                  {selectedReport.imageUrl ? (
                    <img 
                      src={selectedReport.imageUrl} 
                      alt="Disaster Damage Proof" 
                      className="w-full h-full object-cover rounded-lg border border-slate-800"
                    />
                  ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-600 text-center">
                      <Flame className="w-8 h-8 mb-1.5 text-slate-700" />
                      <span className="text-[10px] uppercase font-mono">No image attached</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Cognitive Assessment Output Box */}
              {selectedReport.aiAssessment ? (
                <div className="bg-sky-950/20 border border-sky-900/40 rounded-xl p-4 space-y-3 shrink-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sky-400 text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider font-mono">
                      <span className="inline-block w-2 h-2 rounded-full bg-sky-400 animate-pulse" />
                      Gemini Cognitive Assessment Result
                    </span>
                    <span className="text-[10px] font-mono text-sky-500 bg-sky-950 px-2 py-0.5 rounded border border-sky-900/40">
                      CONFIDENCE: {(selectedReport.aiAssessment.confidenceScore * 100).toFixed(0)}%
                    </span>
                  </div>

                  <p className="text-slate-300 text-xs italic leading-relaxed">
                    "{selectedReport.aiAssessment.damageAssessment}"
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5 pt-1 border-t border-sky-900/30">
                    <div>
                      <div className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">Identified Hazards</div>
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {selectedReport.aiAssessment.hazardsIdentified.map((h, i) => (
                          <span key={i} className="text-[10px] bg-sky-950 text-sky-300 border border-sky-900/60 px-2 py-0.5 rounded-md">
                            {h}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] uppercase font-bold text-sky-400 tracking-wider">Tactical Dispatch Advice</div>
                      <p className="text-slate-300 text-[11px] mt-1 leading-normal">
                        {selectedReport.aiAssessment.recommendedResponse}
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-center text-xs text-slate-500 italic">
                  AI assessment not generated for this incident profile
                </div>
              )}

              {/* Dispatch Allocations table for selected report */}
              {allocations.filter(a => a.reportId === selectedReport.id).length > 0 && (
                <div className="space-y-1.5">
                  <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Currently Deployed EOC Units</div>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-24 overflow-y-auto space-y-2">
                    {allocations.filter(a => a.reportId === selectedReport.id).map(a => (
                      <div key={a.id} className="flex items-center justify-between text-xs border-b border-slate-900 pb-2 last:border-0 last:pb-0">
                        <div>
                          <strong className="text-slate-200">{a.responderTeam}</strong> 
                          <span className="text-slate-500 ml-1">({a.personnelCount} members, {a.vehiclesAllocated.join(", ")})</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 bg-sky-950 border border-sky-900/40 rounded text-sky-400 uppercase">
                          {a.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Action and Dispatch Command Triggers */}
              <div className="border-t border-slate-800/80 pt-4 mt-auto">
                {user.role !== 'citizen' ? (
                  <div className="space-y-4">
                    <div className="flex flex-wrap items-center gap-3">
                      <div className="text-xs font-bold text-slate-400">COMMAND OVERRIDES:</div>
                      
                      {selectedReport.status !== 'resolved' && (
                        <button
                          onClick={() => onUpdateReportStatus(selectedReport.id, 'resolved')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-950 hover:bg-emerald-900 border border-emerald-800 text-emerald-400 font-semibold rounded-lg text-xs cursor-pointer transition-colors"
                        >
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          Resolve Incident
                        </button>
                      )}

                      {selectedReport.status === 'reported' && (
                        <button
                          onClick={() => onUpdateReportStatus(selectedReport.id, 'reviewing')}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-purple-950 hover:bg-purple-900 border border-purple-800 text-purple-400 font-semibold rounded-lg text-xs cursor-pointer transition-colors"
                        >
                          <Clock className="w-3.5 h-3.5 animate-pulse" />
                          Acknowledge & Review
                        </button>
                      )}

                      <a
                        href={`/api/reports/${selectedReport.id}/summary`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold rounded-lg text-xs cursor-pointer ml-auto transition-colors"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        Print Dispatch Summary
                      </a>
                    </div>

                    {/* Dispatch Form Expansion */}
                    {selectedReport.status !== 'resolved' && (
                      <form onSubmit={handleDispatch} className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 animate-slide-up">
                        <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                          <Siren className="w-4 h-4 text-red-500 animate-pulse" />
                          DEPLOY EMERGENCY RESPONDERS
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Response Team Name</label>
                            <input
                              type="text"
                              required
                              value={responderTeam}
                              onChange={(e) => setResponderTeam(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 focus:border-red-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Personnel Count</label>
                              <input
                                type="number"
                                required
                                value={personnelCount}
                                onChange={(e) => setPersonnelCount(parseInt(e.target.value) || 0)}
                                className="w-full bg-slate-900 border border-slate-800 focus:border-red-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                              />
                            </div>
                            <div>
                              <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">Assigned Vehicle</label>
                              <input
                                type="text"
                                required
                                value={vehicle}
                                onChange={(e) => setVehicle(e.target.value)}
                                className="w-full bg-slate-900 border border-slate-800 focus:border-red-500 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>

                        <div className="flex gap-2">
                          <div className="flex-1">
                            <input
                              type="text"
                              placeholder="Equipment sent (comma separated)..."
                              value={equipment}
                              onChange={(e) => setEquipment(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 focus:border-red-500 rounded-lg px-3 py-2 text-xs text-slate-300 placeholder-slate-600 focus:outline-none"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={allocating}
                            className="bg-red-600 hover:bg-red-500 active:bg-red-700 text-slate-100 font-bold rounded-lg px-4 py-2 text-xs transition-colors shrink-0 flex items-center gap-1 cursor-pointer"
                          >
                            <Send className="w-3 h-3" />
                            Dispatch Unit
                          </button>
                        </div>
                      </form>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center justify-between text-xs text-slate-500 italic">
                    <span>*Responders and Admins can authorize resource dispatching and resolve filings.</span>
                    <a
                      href={`/api/reports/${selectedReport.id}/summary`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-1 px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-slate-400 hover:text-slate-200 font-semibold text-[11px] transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      View Printable Summary
                    </a>
                  </div>
                )}
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <ClipboardList className="w-12 h-12 text-slate-700 mb-2" />
              <h3 className="text-slate-400 font-semibold text-sm">No Incident Selected</h3>
              <p className="text-slate-600 text-xs mt-1">Select an emergency profile from the sidebar feed to view operational status and coordinate tactical deployment</p>
            </div>
          )}
        </div>

      </div>

    </div>
  );
}
