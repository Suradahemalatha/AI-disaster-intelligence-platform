import React, { useState } from 'react';
import { DisasterType, RiskFactors } from '../types';
import { 
  ShieldAlert, Thermometer, Wind, Zap, AlertTriangle, Loader2, Sparkles, 
  HelpCircle, CheckSquare, RefreshCw, BarChart2, CheckCircle, Flame, Droplets
} from 'lucide-react';

export default function RiskPrediction() {
  const [region, setRegion] = useState('Southern California Hills');
  const [disasterType, setDisasterType] = useState<DisasterType>('wildfire');
  const [factors, setFactors] = useState<RiskFactors>({
    temperature: 98,
    humidity: 12,
    windSpeed: 28,
    seismicActivity: 1.2,
    vegetationDryness: 85,
    historicalIncidentsCount: 8
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [result, setResult] = useState<any>(null);

  const handlePredict = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/predict-risk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ factors, region, disasterType })
      });

      if (!response.ok) {
        throw new Error('Risk forecasting failed.');
      }

      const data = await response.json();
      setResult(data);
    } catch (err) {
      setError('Could not run cognitive risk forecasting. Please verify local sensor feeds.');
    } finally {
      setLoading(false);
    }
  };

  const loadPresetScenarios = (scenarioName: string) => {
    if (scenarioName === 'wildfire') {
      setDisasterType('wildfire');
      setRegion('Sierra Foothills Zone B');
      setFactors({
        temperature: 104,
        humidity: 9,
        windSpeed: 32,
        seismicActivity: 0.5,
        vegetationDryness: 92,
        historicalIncidentsCount: 12
      });
    } else if (scenarioName === 'flood') {
      setDisasterType('flood');
      setRegion('Miami Coastline Sector 3');
      setFactors({
        temperature: 84,
        humidity: 94,
        windSpeed: 45,
        seismicActivity: 0,
        vegetationDryness: 10,
        historicalIncidentsCount: 15
      });
    } else if (scenarioName === 'earthquake') {
      setDisasterType('earthquake');
      setRegion('San Andreas Fault Ring');
      setFactors({
        temperature: 72,
        humidity: 45,
        windSpeed: 8,
        seismicActivity: 6.8,
        vegetationDryness: 40,
        historicalIncidentsCount: 3
      });
    }
    setResult(null);
  };

  const getRiskLevelStyle = (level: string) => {
    switch (level) {
      case 'high': return 'bg-red-950/40 border border-red-500 text-red-400 animate-pulse font-bold';
      case 'medium': return 'bg-amber-950/40 border border-amber-500 text-amber-400 font-bold';
      default: return 'bg-emerald-950/40 border border-emerald-500 text-emerald-400 font-bold';
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 font-sans">
      
      {/* Upper header section */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-100 flex items-center gap-2">
            <Zap className="w-6 h-6 text-amber-400" />
            AI Meteorological & Regional Risk Forecaster
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Feed environmental telemetry metrics into Gemini to assess regional risk indices, calculate confidence ratings, and generate preparatory tactical advisories
          </p>
        </div>
        <span className="text-[10px] font-mono text-slate-500 uppercase bg-slate-950 border border-slate-800 px-3 py-1 rounded">
          METEOROLOGICAL COMPUTE
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Environmental input gauges */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between space-y-5">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-2">
              <h3 className="text-slate-100 font-bold text-sm">
                Environmental Telemetry Inputs
              </h3>
              
              {/* Presets links */}
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => loadPresetScenarios('wildfire')}
                  className="text-[10px] bg-red-950/30 text-red-400 border border-red-900/40 px-2 py-0.5 rounded-md hover:bg-red-900 hover:text-white transition-colors cursor-pointer"
                >
                  Fire
                </button>
                <button 
                  onClick={() => loadPresetScenarios('flood')}
                  className="text-[10px] bg-sky-950/30 text-sky-400 border border-sky-900/40 px-2 py-0.5 rounded-md hover:bg-sky-900 hover:text-white transition-colors cursor-pointer"
                >
                  Flood
                </button>
                <button 
                  onClick={() => loadPresetScenarios('earthquake')}
                  className="text-[10px] bg-amber-950/30 text-amber-400 border border-amber-900/40 px-2 py-0.5 rounded-md hover:bg-amber-900 hover:text-white transition-colors cursor-pointer"
                >
                  Quake
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3.5 bg-red-950/30 border border-red-900/30 text-red-400 text-xs rounded-xl flex gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1">Target Geographic Region</label>
                <input
                  type="text"
                  required
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-200 focus:outline-none focus:border-red-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1">Threat Context Classification</label>
                <select
                  value={disasterType}
                  onChange={(e) => setDisasterType(e.target.value as DisasterType)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="wildfire">Wildfire</option>
                  <option value="flood">Flood</option>
                  <option value="earthquake">Earthquake</option>
                  <option value="cyclone">Cyclone / Wind Storm</option>
                  <option value="landslide">Landslide</option>
                  <option value="heatwave">Heatwave</option>
                </select>
              </div>
            </div>

            {/* Dial Sliders range */}
            <div className="space-y-3.5 pt-2">
              <div>
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Thermometer className="w-3.5 h-3.5 text-red-400" /> Ambient Temperature
                  </span>
                  <span className="text-slate-200 font-bold">{factors.temperature}°F</span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="130"
                  value={factors.temperature}
                  onChange={(e) => setFactors({ ...factors, temperature: parseInt(e.target.value) })}
                  className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-red-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Droplets className="w-3.5 h-3.5 text-sky-400" /> Relative Humidity
                  </span>
                  <span className="text-slate-200 font-bold">{factors.humidity}%</span>
                </div>
                <input
                  type="range"
                  min="2"
                  max="100"
                  value={factors.humidity}
                  onChange={(e) => setFactors({ ...factors, humidity: parseInt(e.target.value) })}
                  className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1 font-mono">
                  <span className="text-slate-400 flex items-center gap-1">
                    <Wind className="w-3.5 h-3.5 text-slate-400" /> Continuous Wind Speed
                  </span>
                  <span className="text-slate-200 font-bold">{factors.windSpeed} mph</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="120"
                  value={factors.windSpeed}
                  onChange={(e) => setFactors({ ...factors, windSpeed: parseInt(e.target.value) })}
                  className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-slate-400"
                />
              </div>

              <div className="grid grid-cols-3 gap-3 text-[11px] pt-1">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <label className="block text-slate-500 mb-1 font-semibold uppercase tracking-wider text-[9px]">Seismic (0-10)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    max="10"
                    value={factors.seismicActivity}
                    onChange={(e) => setFactors({ ...factors, seismicActivity: parseFloat(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-center text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <label className="block text-slate-500 mb-1 font-semibold uppercase tracking-wider text-[9px]">Dry Fuel %</label>
                  <input
                    type="number"
                    min="0"
                    max="100"
                    value={factors.vegetationDryness}
                    onChange={(e) => setFactors({ ...factors, vegetationDryness: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-center text-slate-200 focus:outline-none"
                  />
                </div>
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-3">
                  <label className="block text-slate-500 mb-1 font-semibold uppercase tracking-wider text-[9px]">Hist. Records</label>
                  <input
                    type="number"
                    min="0"
                    value={factors.historicalIncidentsCount}
                    onChange={(e) => setFactors({ ...factors, historicalIncidentsCount: parseInt(e.target.value) || 0 })}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-1.5 text-center text-slate-200 focus:outline-none"
                  />
                </div>
              </div>
            </div>
          </div>

          <button
            onClick={handlePredict}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-500 active:bg-red-700 text-slate-100 font-bold rounded-xl py-3.5 mt-4 transition-all flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Gemini Synthesizing Regional Forecaster Models...
              </>
            ) : (
              <>
                <BarChart2 className="w-4 h-4" />
                Compute Cognitive Hazard Forecast
              </>
            )}
          </button>
        </div>

        {/* Right Column: Predictive outputs */}
        <div className="lg:col-span-6 bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between min-h-[400px]">
          {result ? (
            <div className="space-y-5 animate-fade-in flex-1 flex flex-col justify-between">
              
              <div className="space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800 pb-2.5">
                  <h3 className="text-slate-100 font-bold text-sm flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    Cognitive Risk Report Findings
                  </h3>
                  <span className="text-[10px] font-mono text-slate-500">
                    FORECAST READY
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Hazard Risk Index</div>
                    <div className={`text-xs font-bold uppercase px-2.5 py-0.5 rounded-md inline-block font-mono ${getRiskLevelStyle(result.riskLevel)}`}>
                      {result.riskLevel} Risk
                    </div>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 p-4 rounded-xl space-y-1">
                    <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Calculation Confidence</div>
                    <div className="text-sm font-bold font-mono text-amber-400">
                      {(result.confidenceScore * 100).toFixed(0)}% Rating
                    </div>
                  </div>
                </div>

                {/* Contributing factors */}
                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Contributing Risk Indicators</div>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 max-h-[120px] overflow-y-auto">
                    {result.environmentalFactors.map((factor: string, i: number) => (
                      <div key={i} className="flex gap-2 text-xs text-slate-300 leading-normal">
                        <AlertTriangle className="w-3.5 h-3.5 text-red-500 shrink-0 mt-0.5" />
                        <span>{factor}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Preparatory advisory */}
                <div className="space-y-1.5">
                  <div className="text-[10px] uppercase font-bold text-slate-400 tracking-wider flex items-center gap-1">
                    <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
                    Pre-Incident Tactical Recommendations
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-2 max-h-[140px] overflow-y-auto">
                    {result.recommendations.map((rec: string, i: number) => (
                      <div key={i} className="flex gap-2 text-xs text-slate-300">
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                        <span>{rec}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

            </div>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
              <BarChart2 className="w-12 h-12 text-slate-800 mb-2" />
              <h4 className="text-slate-400 font-bold text-sm">No Forecast Computed</h4>
              <p className="text-slate-600 text-xs mt-1">Configure environmental telemetry indices on the left, then click Compute to trigger model simulations.</p>
            </div>
          )}

          <div className="p-3.5 bg-slate-950 border border-slate-800/80 rounded-xl flex gap-2 text-[10px] text-slate-500 leading-normal mt-5 shrink-0">
            <ShieldAlert className="w-4 h-4 text-slate-600 shrink-0 mt-0.5" />
            <span>
              Meteorological computations are based on real-time sensory thresholds. Preparatory actions should follow local Emergency Management Agency broadcast directions.
            </span>
          </div>
        </div>

      </div>

    </div>
  );
}
