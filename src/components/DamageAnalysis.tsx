import React, { useState, useRef } from 'react';
import { 
  ShieldAlert, Upload, Loader2, Sparkles, CheckCircle, AlertTriangle, 
  Flame, DollarSign, Hammer, HardHat, FileText, Image as ImageIcon
} from 'lucide-react';

export default function DamageAnalysis() {
  const [imageBlob, setImageBlob] = useState<string>(''); // Base64
  const [disasterType, setDisasterType] = useState('flood');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (!file.type.startsWith('image/')) {
        setError('Please upload a valid image file.');
        return;
      }
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setImageBlob(event.target.result as string);
          setResult(null);
          setError('');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAnalyze = async () => {
    if (!imageBlob) {
      setError('Please upload a damage photograph first.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/analyze-damage', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ imageUrl: imageBlob, disasterType })
      });

      if (!response.ok) {
        throw new Error('Analysis server failed.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Failed to analyze photograph. Gemini servers may be under heavy load.');
    } finally {
      setLoading(false);
    }
  };

  const getIntegrityColor = (status: string) => {
    switch (status) {
      case 'high': return 'text-emerald-400 bg-emerald-950/40 border border-emerald-900/60';
      case 'moderate': return 'text-amber-400 bg-amber-950/40 border border-amber-900/60';
      case 'critical': return 'text-orange-400 bg-orange-950/40 border border-orange-900/60';
      default: return 'text-red-400 bg-red-950/40 border border-red-900/60 animate-pulse';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      
      {/* Header section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <HardHat className="w-6 h-6 text-red-500" />
            AI Visual Damage & Structural Analyzer
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Leverage Gemini Computer Vision to analyze high-resolution photographs, estimate remediation, and detect hidden threats
          </p>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase bg-slate-950 border border-slate-800 px-3 py-1 rounded">
          COMPUTER VISION INGRESS
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left column: Upload form */}
        <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <h3 className="text-slate-100 font-bold text-sm border-b border-slate-800 pb-2">
              Damage Photographic Input
            </h3>

            {error && (
              <div className="p-3.5 bg-red-950/30 border border-red-900/30 text-red-400 text-xs rounded-xl flex gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">Disaster Context</label>
              <select
                value={disasterType}
                onChange={(e) => setDisasterType(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="flood">Flood Inundation</option>
                <option value="wildfire">Wildfire Burn / Thermal Stress</option>
                <option value="earthquake">Earthquake Shockwave Fracture</option>
                <option value="cyclone">Cyclone / Tornado Wind Damage</option>
                <option value="landslide">Landslide Mass Erosion</option>
              </select>
            </div>

            {/* Clickable drag block */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/40 hover:bg-slate-950 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer min-h-[180px] transition-all"
            >
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                accept="image/*"
                onChange={handleFileChange}
              />

              {imageBlob ? (
                <img 
                  src={imageBlob} 
                  alt="Pre-analysis attachment" 
                  className="max-h-[140px] rounded border border-slate-800"
                />
              ) : (
                <div className="space-y-2">
                  <Upload className="w-8 h-8 text-slate-600 mx-auto animate-bounce" />
                  <div className="text-xs text-slate-400">
                    <span className="text-red-400 font-semibold underline">Click to upload</span> a photo
                  </div>
                  <p className="text-[10px] font-mono text-slate-600">JPG, PNG up to 10MB</p>
                </div>
              )}
            </div>
          </div>

          <button
            onClick={handleAnalyze}
            disabled={loading || !imageBlob}
            className="w-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-slate-100 font-bold rounded-xl py-3 mt-4 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 disabled:bg-slate-850"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gemini Vision Inspecting Image...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Run Gemini Forensic Analysis
              </>
            )}
          </button>
        </div>

        {/* Right column: Analysis output */}
        <div className="lg:col-span-7 bg-slate-900 border border-slate-800 rounded-2xl p-5 min-h-[350px] flex flex-col justify-between">
          {result ? (
            <div className="space-y-5 animate-fade-in">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-slate-100 font-bold text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-sky-400 animate-pulse" />
                  Cognitive Forensic Inspection Findings
                </h3>
                <span className="text-[10px] font-mono text-slate-500 uppercase">
                  UTC RECORDED
                </span>
              </div>

              {/* Stats badges */}
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-slate-500" />
                    Structural Integrity
                  </div>
                  <div className={`text-xs font-bold font-mono uppercase px-2 py-0.5 rounded inline-block ${getIntegrityColor(result.structuralIntegrity)}`}>
                    {result.structuralIntegrity}
                  </div>
                </div>

                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3.5 space-y-1">
                  <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-slate-500" />
                    Estimated Damage Cost
                  </div>
                  <div className="text-sm font-bold font-mono text-amber-400">
                    {result.estimatedDamageCostUSD}
                  </div>
                </div>
              </div>

              {/* Immediate threats list */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  Critical Threats Identified in Image
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2">
                  {result.immediateThreats.map((threat: string, i: number) => (
                    <div key={i} className="flex gap-2 text-xs text-slate-300">
                      <span className="text-red-500 font-bold font-mono">•</span>
                      <span>{threat}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Remediation detailed advice */}
              <div className="space-y-2">
                <div className="text-xs font-bold text-slate-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <Hammer className="w-4 h-4 text-emerald-400" />
                  Engineering Remediation Guidelines
                </div>
                <p className="text-slate-300 text-xs bg-slate-950 border border-slate-800 rounded-xl p-4 leading-relaxed font-sans">
                  {result.suggestedRemediation}
                </p>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <ImageIcon className="w-12 h-12 text-slate-800 mb-2" />
              <h4 className="text-slate-400 font-bold text-sm">No Analysis Profile Loaded</h4>
              <p className="text-slate-600 text-xs mt-1">Upload a damage photograph to trigger cognitive computer vision analysis models.</p>
            </div>
          )}

          <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl flex gap-2 text-[10px] text-slate-500 leading-normal mt-5">
            <HardHat className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
            <span>
              Estimations and safety ratings are computed based on image pixel indices. Command forces should execute onsite material inspection before deploying human labor.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
