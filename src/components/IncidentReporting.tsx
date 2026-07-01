import React, { useState, useRef } from 'react';
import { DisasterType, DisasterSeverity, DisasterReport } from '../types';
import { 
  FileUp, MapPin, Loader2, AlertCircle, Sparkles, CheckCircle2, 
  Map, ShieldAlert, Camera, Image as ImageIcon, Send
} from 'lucide-react';

interface IncidentReportingProps {
  reportedBy: string;
  onReportCreated: (newReport: DisasterReport) => void;
}

export default function IncidentReporting({ reportedBy, onReportCreated }: IncidentReportingProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState<DisasterType>('flood');
  const [severity, setSeverity] = useState<DisasterSeverity>('medium');
  const [address, setAddress] = useState('');
  const [latitude, setLatitude] = useState<number | null>(null);
  const [longitude, setLongitude] = useState<number | null>(null);
  const [imageBlob, setImageBlob] = useState<string>(''); // Base64
  
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [latestReport, setLatestReport] = useState<DisasterReport | null>(null);

  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto detect location via Geolocation API
  const handleDetectLocation = () => {
    setDetectingLocation(true);
    setError('');

    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser.');
      setDetectingLocation(false);
      // Fallback
      loadPresetCoordinates();
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLatitude(position.coords.latitude);
        setLongitude(position.coords.longitude);
        setAddress(`EOC Coordinates: Lat ${position.coords.latitude.toFixed(4)}, Lng ${position.coords.longitude.toFixed(4)}`);
        setDetectingLocation(false);
      },
      (err) => {
        console.warn("Geolocation permission blocked or timed out:", err);
        setError('Location access denied. Loaded preset disaster coordinates.');
        setDetectingLocation(false);
        loadPresetCoordinates();
      },
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const loadPresetCoordinates = () => {
    // Generate logical presets based on selected disaster type
    const presets: Record<DisasterType, { lat: number, lng: number, address: string }> = {
      flood: { lat: 25.7617, lng: -80.1918, address: "840 Ocean Drive, Miami Beach, FL 33139" },
      wildfire: { lat: 37.8044, lng: -122.2712, address: "Oakland Foothills Preserve, Alameda County, CA" },
      earthquake: { lat: 34.0522, lng: -118.2437, address: "San Andreas Fault Zone, Palmdale, CA" },
      cyclone: { lat: 27.9506, lng: -82.4572, address: "Tampa Bay Coastal Highway, FL" },
      landslide: { lat: 47.6062, lng: -122.3321, address: "Cascade Pass Mountain Road, WA" },
      heatwave: { lat: 33.4484, lng: -112.0740, address: "Desert Foothills Valley, Maricopa County, AZ" },
      other: { lat: 40.7128, lng: -74.0060, address: "Downtown Metro Crossing, NY" }
    };

    const selPreset = presets[type] || presets.other;
    setLatitude(selPreset.lat);
    setLongitude(selPreset.lng);
    setAddress(selPreset.address);
  };

  // Drag and drop handlers
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Invalid file format. Please attach a valid JPG/PNG image.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (event.target?.result) {
        setImageBlob(event.target.result as string);
        setError('');
      }
    };
    reader.onerror = () => setError('Failed to process image attachment.');
    reader.readAsDataURL(file);
  };

  const triggerFileSelect = () => {
    fileInputRef.current?.click();
  };

  const removeImage = () => {
    setImageBlob('');
  };

  const handleSubmitReport = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!title) {
      setError('Incident designation title is required.');
      return;
    }

    if (!latitude || !longitude || !address) {
      setError('Physical location coordinates must be set.');
      return;
    }

    setSubmitting(true);

    try {
      const response = await fetch('/api/reports', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title,
          description,
          type,
          severity,
          location: { lat: latitude, lng: longitude, address },
          imageUrl: imageBlob,
          reportedBy
        })
      });

      if (!response.ok) {
        throw new Error('EOC Report filing failed.');
      }

      const freshReport: DisasterReport = await response.json();
      setLatestReport(freshReport);
      onReportCreated(freshReport);
      setSuccess(true);
      
      // Reset Form State
      setTitle('');
      setDescription('');
      setImageBlob('');
      setAddress('');
      setLatitude(null);
      setLongitude(null);
    } catch (err) {
      setError('Failed to submit incident report to server.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Upper header segment */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-red-500" />
            File Emergency Disaster Incident Report
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Publish civilian hazard updates, upload visual damage attachments, and generate automated AI assessment models
          </p>
        </div>
        <div className="px-4 py-2 bg-emerald-950/30 border border-emerald-900/30 rounded-xl text-xs font-semibold text-emerald-400">
          AUTHORIZED AGENCY INGRESS
        </div>
      </div>

      {success && latestReport && (
        <div className="bg-emerald-950/20 border border-emerald-900/40 rounded-2xl p-6 space-y-4 animate-fade-in">
          <div className="flex items-center gap-3 text-emerald-400">
            <CheckCircle2 className="w-6 h-6" />
            <h2 className="font-bold text-lg">Emergency Report Filed Successfully!</h2>
          </div>
          <p className="text-slate-300 text-xs">
            Incident profile <strong>{latestReport.id.toUpperCase()}</strong> is registered in the command console. The EOC has dispatched an emergency task force review.
          </p>

          {latestReport.aiAssessment && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 mt-3 animate-slide-up">
              <div className="text-sky-400 text-xs font-bold flex items-center gap-1.5 uppercase tracking-wider font-mono">
                <Sparkles className="w-4 h-4" />
                Gemini AI Cognitive Assessment feedback
              </div>
              <p className="text-slate-300 text-xs leading-relaxed italic">
                "{latestReport.aiAssessment.damageAssessment}"
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                <div>
                  <strong className="text-slate-400">Identified Hazards:</strong>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {latestReport.aiAssessment.hazardsIdentified.map((h, i) => (
                      <span key={i} className="text-[10px] bg-sky-950 text-sky-400 border border-sky-900 px-2 py-0.5 rounded">
                        {h}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <strong className="text-slate-400">Response Plan:</strong>
                  <p className="text-slate-300 text-xs mt-1">{latestReport.aiAssessment.recommendedResponse}</p>
                </div>
              </div>
            </div>
          )}

          <button
            onClick={() => setSuccess(false)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-100 font-semibold text-xs rounded-lg transition-colors cursor-pointer"
          >
            File Another Report
          </button>
        </div>
      )}

      {!success && (
        <form onSubmit={handleSubmitReport} className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Block: Primary Fields */}
          <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-6 space-y-5">
            <h3 className="text-slate-100 font-bold text-base border-b border-slate-800 pb-3">
              Incident Profiles
            </h3>

            {error && (
              <div className="p-4 bg-red-950/30 border border-red-900/30 rounded-xl flex gap-2.5 text-red-400 text-xs leading-relaxed">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                Incident Designation / Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g., Collins Ave Submerged Retaining Wall Break"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-colors"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                  Disaster Classification
                </label>
                <select
                  value={type}
                  onChange={(e) => {
                    setType(e.target.value as DisasterType);
                    // Clear coordinates to prompt redetection or reload presets
                    setLatitude(null);
                    setLongitude(null);
                    setAddress('');
                  }}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-3 py-3 text-sm text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="flood">Flood</option>
                  <option value="wildfire">Wildfire</option>
                  <option value="earthquake">Earthquake</option>
                  <option value="cyclone">Cyclone</option>
                  <option value="landslide">Landslide</option>
                  <option value="heatwave">Heatwave</option>
                  <option value="other">Other / Multi-hazard</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                  Observed Severity Level
                </label>
                <select
                  value={severity}
                  onChange={(e) => setSeverity(e.target.value as DisasterSeverity)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-3 py-3 text-sm text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="low">Low (Localized Threat)</option>
                  <option value="medium">Medium (Moderate Impact)</option>
                  <option value="high">High (Evacuations Pre-staged)</option>
                  <option value="critical">Critical (Immediate Danger)</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-300 text-xs font-bold uppercase tracking-wider mb-2">
                Ocular Description & Details
              </label>
              <textarea
                required
                rows={4}
                placeholder="Detail the status of people, physical structures, roads, active utilities, firefront behavior or water depths..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl px-4 py-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none transition-colors resize-none leading-relaxed"
              />
            </div>

            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-slate-300 text-xs font-bold uppercase tracking-wider">
                  GIS Location Coordinates
                </span>
                <button
                  type="button"
                  disabled={detectingLocation}
                  onClick={handleDetectLocation}
                  className="text-xs text-red-400 hover:text-red-300 active:text-red-500 flex items-center gap-1 font-semibold transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {detectingLocation ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <MapPin className="w-3.5 h-3.5" />
                  )}
                  Detect GPS Coordinates
                </button>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-slate-500 mb-1">Latitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. 25.7617"
                    value={latitude || ''}
                    onChange={(e) => setLatitude(parseFloat(e.target.value) || null)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-red-500 rounded-lg p-2.5 text-slate-200 focus:outline-none font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-500 mb-1">Longitude</label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="e.g. -80.1918"
                    value={longitude || ''}
                    onChange={(e) => setLongitude(parseFloat(e.target.value) || null)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-red-500 rounded-lg p-2.5 text-slate-200 focus:outline-none font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-slate-500 text-xs mb-1">Physical Address / Sector Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Collins Ave, Sector 4 Block C"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-red-500 rounded-lg p-2.5 text-xs text-slate-200 focus:outline-none"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-slate-100 font-bold rounded-xl py-3.5 px-4 shadow-lg hover:shadow-red-900/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Analyzing Report with Gemini Cognitive Engine...
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  File Emergency Incident & Request AI Assessment
                </>
              )}
            </button>
          </div>

          {/* Right Block: Image Drag and Drop */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col h-full justify-between">
              <div>
                <h3 className="text-slate-100 font-bold text-base border-b border-slate-800 pb-3 mb-4">
                  Visual Damage Attachment
                </h3>
                <p className="text-slate-400 text-xs mb-4">
                  Attach real photographic proof of the structural damage. Gemini will inspect the image to calculate damage indices and structural safety ratings.
                </p>

                {/* Drag Zone */}
                <div 
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                  className={`border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition-all min-h-[220px] ${
                    dragActive 
                      ? 'border-red-500 bg-red-950/10' 
                      : imageBlob ? 'border-slate-800 bg-slate-950' : 'border-slate-800 bg-slate-950/40 hover:border-slate-700'
                  }`}
                  onClick={triggerFileSelect}
                >
                  <input
                    ref={fileInputRef}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                  />

                  {imageBlob ? (
                    <div className="relative w-full max-h-[180px] overflow-hidden rounded-lg group">
                      <img 
                        src={imageBlob} 
                        alt="Filing Proof" 
                        className="w-full h-full object-contain max-h-[160px]"
                      />
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity rounded-lg">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            removeImage();
                          }}
                          className="bg-red-600 hover:bg-red-500 text-white font-bold rounded-lg px-3 py-1.5 text-xs"
                        >
                          Remove Photo
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="inline-flex p-3.5 bg-slate-900 border border-slate-800 text-slate-400 rounded-xl">
                        <FileUp className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <span className="text-red-400 font-semibold text-xs hover:underline cursor-pointer">
                          Upload image proof
                        </span>
                        <span className="text-slate-500 text-xs"> or drag and drop</span>
                        <p className="text-slate-600 text-[10px] uppercase font-mono tracking-wider mt-1.5">
                          JPEG, PNG up to 10MB
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Real-time warnings */}
              <div className="p-4 bg-slate-950 border border-slate-800/80 rounded-xl text-[11px] text-slate-500 flex gap-2.5 leading-relaxed mt-4">
                <ShieldAlert className="w-5 h-5 text-red-500/80 shrink-0 mt-0.5" />
                <span>
                  <strong>CIVILIAN WARNING:</strong> Visual upload should only be captured from safe, remote distances. Do not enter compromised buildings or swift waters.
                </span>
              </div>
            </div>
          </div>

        </form>
      )}

    </div>
  );
}
