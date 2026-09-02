import React, { useState, useEffect, useRef } from 'react';
import { Cpu, CheckCircle2, Sliders, Play, RefreshCw, BarChart, Layers, AlertTriangle, Brain } from 'lucide-react';
import { AIRPORTS } from '../data/airports';

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? "http://localhost:5001"
  : "https://flight-fare-predictor-ggn7.onrender.com";

export default function BlueprintView({ source, destination, onOpenInsights }) {
  const [selectedSource, setSelectedSource] = useState(source.city);
  const [selectedDest, setSelectedDest] = useState(destination.city);
  const [selectedAirline, setSelectedAirline] = useState('IndiGo');
  const [durationMins, setDurationMins] = useState(110);
  const [depHour, setDepHour] = useState(6);
  const [stops, setStops] = useState(0);
  const [date, setDate] = useState('2026-09-15');

  const [prediction, setPrediction] = useState(null);
  const [loading, setLoading] = useState(false);
  const [apiOnline, setApiOnline] = useState(true);
  const isMountedRef = useRef(true);
  const fallbackTimeoutRef = useRef(null);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (fallbackTimeoutRef.current) clearTimeout(fallbackTimeoutRef.current);
    };
  }, []);

  const runPrediction = async () => {
    setLoading(true);
    const day = parseInt(date.split('-')[2] || '15', 10);
    const month = parseInt(date.split('-')[1] || '9', 10);

    try {
      const res = await fetch(`${API_BASE}/api/predict`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          source: selectedSource,
          destination: selectedDest,
          airline: selectedAirline,
          dep_hour: depHour,
          duration_mins: durationMins,
          stops,
          day,
          month
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          if (isMountedRef.current) {
            setPrediction({ ...data, isOfflineFallback: false });
            setApiOnline(true);
            setLoading(false);
          }
          return;
        }
      }
    } catch (err) {
      if (isMountedRef.current) setApiOnline(false);
    }

    // Client Heuristic fallback when backend is offline
    fallbackTimeoutRef.current = setTimeout(() => {
      fallbackTimeoutRef.current = null;
      if (!isMountedRef.current) return;
      const baseFare = 3200 + (durationMins * 18.5) + (stops * 1400);
      const airlineMultipliers = {
        'IndiGo': 0.95,
        'SpiceJet': 0.90,
        'Air India': 1.18,
        'Vistara': 1.25,
        'Akasa Air': 0.88,
        'Go First': 0.92
      };
      const mult = airlineMultipliers[selectedAirline] || 1.0;

      const xgbPrice = Math.round(baseFare * mult * 0.98);
      const catPrice = Math.round(baseFare * mult * 1.02);
      const ensemblePrice = Math.round((xgbPrice + catPrice) / 2);

      let tier = 'Medium';
      if (ensemblePrice < 6000) tier = 'Low';
      else if (ensemblePrice < 14000) tier = 'Medium';
      else if (ensemblePrice < 20000) tier = 'High';
      else tier = 'Premium';

      setPrediction({
        success: true,
        xgb_reg_price: xgbPrice,
        catboost_reg_price: catPrice,
        ensemble_price: ensemblePrice,
        predicted_tier: tier,
        isOfflineFallback: true,
        tier_probabilities: {
          Low: tier === 'Low' ? 0.88 : 0.04,
          Medium: tier === 'Medium' ? 0.85 : 0.10,
          High: tier === 'High' ? 0.82 : 0.08,
          Premium: tier === 'Premium' ? 0.91 : 0.02
        }
      });
      setLoading(false);
    }, 300);
  };

  useEffect(() => {
    runPrediction();
  }, [selectedSource, selectedDest, selectedAirline, durationMins, depHour, stops, date]);

  const featureImportance = [
    { name: 'Duration (Mins)', importance: '28.4%', barWidth: '92%' },
    { name: 'Total Stops', importance: '22.1%', barWidth: '78%' },
    { name: 'Dep Time Hour', importance: '16.8%', barWidth: '60%' },
    { name: 'Journey Date / Month', importance: '14.2%', barWidth: '50%' },
    { name: 'Airline One-Hot', importance: '11.5%', barWidth: '40%' },
    { name: 'Source / Destination', importance: '7.0%', barWidth: '25%' }
  ];

  return (
    <div className="w-full max-w-[1500px] mx-auto py-8 px-4 sm:px-8 space-y-8 animate-fade-in">
      
      {/* Blueprint Header */}
      <div className="bg-[#1E293B] text-white rounded-3xl p-6 sm:p-8 border border-slate-700 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div>
          <div className="flex items-center space-x-2 text-cyan-400 font-mono text-xs font-bold uppercase tracking-widest mb-2">
            <Cpu className="w-4 h-4" />
            <span>FLIGHT1.PY MODEL ARCHITECTURE &amp; PIPELINE INSPECTOR</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
            XGBoost &amp; CatBoost Ensemble Workbench
          </h2>
          <p className="text-slate-400 text-sm mt-1 max-w-2xl">
            Inspect real-time log-transformed regression models (`xgb_regressor.pkl`, `catboost_regressor.pkl`) and tier classification (`xgb_classifier.pkl`).
          </p>
        </div>

        <div className="flex flex-col items-stretch gap-3 shrink-0">
          <div className="flex items-center space-x-3 bg-slate-800 px-4 py-2.5 rounded-2xl border border-slate-700">
            <span className={`w-3 h-3 rounded-full ${apiOnline ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`}></span>
            <span className="text-xs font-mono text-slate-300">
              {apiOnline ? 'PYTHON SERVER ONLINE (LIVE ENSEMBLE)' : 'OFFLINE HEURISTIC ESTIMATE (MODEL UNREACHABLE)'}
            </span>
          </div>
          {onOpenInsights && (
            <button
              type="button"
              onClick={onOpenInsights}
              className="flex items-center justify-center space-x-2 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-400/40 text-cyan-300 px-4 py-2.5 rounded-2xl font-bold text-xs uppercase tracking-wider cursor-pointer transition-colors"
            >
              <Brain className="w-4 h-4" />
              <span>View ML Insights</span>
            </button>
          )}
        </div>
      </div>

      {prediction?.isOfflineFallback && (
        <div className="bg-amber-50 border border-amber-300 text-amber-900 rounded-2xl p-4 flex items-center space-x-3 text-sm">
          <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />
          <span>
            <strong>Offline Mode Notice:</strong> The ML API backend is unreachable. Displaying standalone heuristic estimates. Connect the Python server to run live model inference.
          </span>
        </div>
      )}

      {/* Grid: Predictor Control vs Model Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left: Input Feature Controls */}
        <div className="lg:col-span-5 bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-5">
          <div className="flex items-center space-x-2 pb-3 border-b border-stone-200">
            <Sliders className="w-5 h-5 text-[#3C1318]" />
            <h3 className="font-extrabold text-lg text-[#3C1318]">Model Feature Inputs</h3>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-extrabold text-stone-500 uppercase block mb-1">Source</label>
                <select
                  value={selectedSource}
                  onChange={(e) => setSelectedSource(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl p-2.5 text-sm font-bold text-[#3C1318]"
                >
                  {AIRPORTS.map(a => <option key={a.code} value={a.city}>{a.city} ({a.code})</option>)}
                </select>
              </div>

              <div>
                <label className="text-xs font-extrabold text-stone-500 uppercase block mb-1">Destination</label>
                <select
                  value={selectedDest}
                  onChange={(e) => setSelectedDest(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl p-2.5 text-sm font-bold text-[#3C1318]"
                >
                  {AIRPORTS.map(a => <option key={a.code} value={a.city}>{a.city} ({a.code})</option>)}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs font-extrabold text-stone-500 uppercase block mb-1">Airline Carrier</label>
              <select
                value={selectedAirline}
                onChange={(e) => setSelectedAirline(e.target.value)}
                className="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl p-2.5 text-sm font-bold text-[#3C1318]"
              >
                <option value="IndiGo">IndiGo</option>
                <option value="SpiceJet">SpiceJet</option>
                <option value="Vistara">Vistara</option>
                <option value="Air India">Air India</option>
                <option value="Akasa Air">Akasa Air</option>
                <option value="Go First">Go First</option>
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-extrabold text-stone-500 uppercase block mb-1">Duration: {durationMins} mins</label>
                <input
                  type="range"
                  min="60"
                  max="480"
                  step="10"
                  value={durationMins}
                  onChange={(e) => setDurationMins(parseInt(e.target.value, 10))}
                  className="w-full accent-[#3C1318]"
                />
              </div>

              <div>
                <label className="text-xs font-extrabold text-stone-500 uppercase block mb-1">Dep Hour: {depHour}:00</label>
                <input
                  type="range"
                  min="0"
                  max="23"
                  value={depHour}
                  onChange={(e) => setDepHour(parseInt(e.target.value, 10))}
                  className="w-full accent-[#3C1318]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-extrabold text-stone-500 uppercase block mb-1">Stops: {stops}</label>
                <select
                  value={stops}
                  onChange={(e) => setStops(parseInt(e.target.value, 10))}
                  className="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl p-2.5 text-sm font-bold text-[#3C1318]"
                >
                  <option value={0}>0 (Non-stop)</option>
                  <option value={1}>1 Stop</option>
                  <option value={2}>2+ Stops</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-extrabold text-stone-500 uppercase block mb-1">Journey Date</label>
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="w-full bg-[#FAF7F2] border border-stone-200 rounded-xl p-2 text-sm font-bold text-[#3C1318]"
                />
              </div>
            </div>

            <button
              onClick={runPrediction}
              disabled={loading}
              className="w-full bg-[#3C1318] hover:bg-[#280C10] text-white py-3 rounded-2xl font-bold flex items-center justify-center space-x-2 transition shadow-md disabled:opacity-50"
            >
              {loading ? (
                <RefreshCw className="w-5 h-5 animate-spin" />
              ) : (
                <>
                  <Play className="w-4 h-4 fill-white" />
                  <span>Run Model Inference</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Model Predictions & Feature Importance */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Prediction Outputs */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-lg text-[#3C1318] flex items-center justify-between">
              <span>Live Ensemble Predictions</span>
              {prediction && (
                <span className="text-xs font-mono bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">
                  Tier: {prediction.predicted_tier}
                </span>
              )}
            </h3>

            {prediction && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
                <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-stone-200 text-center">
                  <div className="text-xs text-stone-500 font-bold uppercase mb-1">XGBoost Regressor</div>
                  <div className="text-2xl font-extrabold text-[#3C1318]">₹ {prediction.xgb_reg_price.toLocaleString('en-IN')}</div>
                  <div className="text-[10px] text-stone-400 font-mono mt-1">xgb_regressor.pkl</div>
                </div>

                <div className="bg-[#FAF7F2] rounded-2xl p-4 border border-stone-200 text-center">
                  <div className="text-xs text-stone-500 font-bold uppercase mb-1">CatBoost Regressor</div>
                  <div className="text-2xl font-extrabold text-[#3C1318]">₹ {prediction.catboost_reg_price.toLocaleString('en-IN')}</div>
                  <div className="text-[10px] text-stone-400 font-mono mt-1">catboost_regressor.pkl</div>
                </div>

                <div className="bg-gradient-to-br from-[#3C1318] to-[#280C10] text-white rounded-2xl p-4 text-center shadow-md">
                  <div className="text-xs text-amber-300 font-bold uppercase mb-1">Ensemble Average</div>
                  <div className="text-2xl font-extrabold text-white">₹ {prediction.ensemble_price.toLocaleString('en-IN')}</div>
                  <div className="text-[10px] text-stone-300 font-mono mt-1">(XGB + CatBoost) / 2</div>
                </div>
              </div>
            )}
          </div>

          {/* Classification Probabilities */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-4">
            <h3 className="font-extrabold text-base text-[#3C1318] flex items-center space-x-2">
              <Layers className="w-4 h-4 text-purple-600" />
              <span>XGBoost Classification Tier Probabilities (`xgb_classifier.pkl`)</span>
            </h3>

            {prediction && prediction.tier_probabilities && (
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                {Object.entries(prediction.tier_probabilities).map(([tierName, prob]) => (
                  <div key={tierName} className="bg-stone-50 p-3 rounded-xl border border-stone-200 text-center">
                    <div className="text-xs font-bold text-stone-600">{tierName}</div>
                    <div className="text-lg font-extrabold text-[#3C1318]">{(prob * 100).toFixed(1)}%</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Feature Importance Breakdown */}
          <div className="bg-white rounded-3xl p-6 border border-stone-200 shadow-sm space-y-3">
            <h3 className="font-extrabold text-base text-[#3C1318] flex items-center space-x-2">
              <BarChart className="w-4 h-4 text-cyan-600" />
              <span>Illustrative Feature Importance (Approximated)</span>
            </h3>

            <div className="space-y-2.5 pt-2">
              {featureImportance.map((feat) => (
                <div key={feat.name} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-bold text-stone-700">
                    <span>{feat.name}</span>
                    <span>{feat.importance}</span>
                  </div>
                  <div className="w-full h-2 bg-stone-100 rounded-full overflow-hidden">
                    <div className="h-full bg-[#3C1318] rounded-full transition-all duration-500" style={{ width: feat.barWidth }}></div>
                  </div>
                </div>
              ))}
            </div>
            <p className="text-[10px] text-stone-400 mt-2">
              * These values are illustrative approximations. For live importance, export from FLIGHT1.py.
            </p>
          </div>


        </div>

      </div>

    </div>
  );
}
