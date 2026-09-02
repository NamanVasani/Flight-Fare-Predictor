import React, { useState, useEffect } from 'react';
import { Plane, MapPin, ArrowLeftRight, Search, Tag, BarChart2, Gem, ShieldCheck, Headphones, XCircle, ChevronRight, Loader2, AlertTriangle } from 'lucide-react';
import { AIRPORTS } from '../data/airports';
import { predictCategorizedFlightFares } from '../utils/farePredictor';

export default function CoherentView({ source, destination, date, onSourceChange, onDestinationChange, onSwap, onSearchFlight }) {
  const [results, setResults] = useState({ lowTier: [], mediumTier: [], highTier: [], unsupportedRoute: false });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const resultsRef = React.useRef(null);

  const scrollToResults = () => {
    resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    let cancelled = false;

    async function loadFares() {
      setLoading(true);
      setError(null);
      try {
        const data = await predictCategorizedFlightFares(source, destination, date);
        if (!cancelled) {
          setResults(data);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || 'Failed to load fare predictions');
          setLoading(false);
        }
      }
    }

    loadFares();

    return () => {
      cancelled = true;
    };
  }, [source, destination, date]);

  // Sort each tier ascending by price (low to high)
  const sortAsc = (arr) => [...arr].sort((a, b) => (a.numericPrice || 0) - (b.numericPrice || 0));
  const lowTier = sortAsc(results.lowTier);
  const mediumTier = sortAsc(results.mediumTier);
  const highTier = sortAsc(results.highTier);
  const { unsupportedRoute } = results;
  const noResultsAtAll = !loading && !error && !unsupportedRoute && lowTier.length === 0 && mediumTier.length === 0 && highTier.length === 0;

  return (
    <div className="w-full max-w-[1850px] mx-auto py-8 sm:py-12 px-6 sm:px-12 lg:px-20 space-y-12 animate-fade-in">
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/80 shadow-search-card flex flex-col lg:flex-row items-center gap-6">
        <div className="flex-1 w-full lg:min-w-[280px] bg-[#FAF7F2] px-7 py-5 rounded-2xl border border-stone-200/60 flex items-center justify-between">
          <div className="w-full">
            <div className="flex items-center space-x-2 mb-1.5 whitespace-nowrap">
              <span className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-stone-700">FROM</span>
              <span className="text-xs sm:text-sm font-medium text-stone-500">(SOURCE)</span>
            </div>
            <div className="flex items-center space-x-3">
              <Plane className="w-5 h-5 sm:w-6 sm:h-6 text-[#3C1318] transform rotate-45 shrink-0" />
              <select value={source.code} onChange={(e) => onSourceChange(AIRPORTS.find(a => a.code === e.target.value))} className="bg-transparent text-xl sm:text-2xl font-black text-[#3C1318] focus:outline-none cursor-pointer w-full">
                {AIRPORTS.map((apt) => (
                  <option key={apt.code} value={apt.code} disabled={apt.code === destination.code}>{apt.city} ({apt.code})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <button onClick={onSwap} type="button" className="w-14 h-14 rounded-full bg-[#FAF7F2] hover:bg-stone-200/70 border border-stone-200 text-[#3C1318] flex items-center justify-center shrink-0 shadow-sm cursor-pointer">
          <ArrowLeftRight className="w-6 h-6" />
        </button>
        <div className="flex-1 w-full lg:min-w-[280px] bg-[#FAF7F2] px-7 py-5 rounded-2xl border border-stone-200/60 flex items-center justify-between">
          <div className="w-full">
            <div className="flex items-center space-x-2 mb-1.5 whitespace-nowrap">
              <span className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-stone-700">TO</span>
              <span className="text-xs sm:text-sm font-medium text-stone-500">(DESTINATION)</span>
            </div>
            <div className="flex items-center space-x-3">
              <MapPin className="w-5 h-5 sm:w-6 sm:h-6 text-[#E52320] fill-current shrink-0" />
              <select value={destination.code} onChange={(e) => onDestinationChange(AIRPORTS.find(a => a.code === e.target.value))} className="bg-transparent text-xl sm:text-2xl font-black text-[#3C1318] focus:outline-none cursor-pointer w-full">
                {AIRPORTS.map((apt) => (
                  <option key={apt.code} value={apt.code} disabled={apt.code === source.code}>{apt.city} ({apt.code})</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <button type="button" onClick={scrollToResults} className="w-full lg:w-auto bg-[#3C1318] hover:bg-[#280C10] text-white px-10 py-5 rounded-2xl font-bold text-xl sm:text-2xl flex items-center justify-center space-x-3 shadow-lg cursor-pointer shrink-0">
          <Search className="w-6 h-6" />
          <span>Search</span>
        </button>
      </div>

      <div ref={resultsRef}>
      {loading && (
        <div className="bg-white rounded-3xl border border-stone-200/80 p-12 flex flex-col items-center justify-center space-y-4 text-stone-500">
          <Loader2 className="w-10 h-10 animate-spin text-[#3C1318]" />
          <div className="text-lg font-semibold">Fetching live fare predictions…</div>
          <div className="text-sm text-stone-400">This can take up to a minute if the server is waking up.</div>
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 rounded-3xl border border-red-200 p-10 flex flex-col items-center justify-center space-y-3 text-center">
          <AlertTriangle className="w-9 h-9 text-red-500" />
          <div className="text-lg font-bold text-red-700">Couldn't load fare predictions</div>
          <div className="text-sm text-red-500 max-w-md">{error}</div>
        </div>
      )}

      {!loading && !error && unsupportedRoute && (
        <div className="bg-amber-50 rounded-3xl border border-amber-200 p-10 flex flex-col items-center justify-center space-y-3 text-center">
          <XCircle className="w-9 h-9 text-amber-500" />
          <div className="text-lg font-bold text-amber-700">No fare data for this route</div>
          <div className="text-sm text-amber-600 max-w-md">
            The model was only trained on flights between Delhi, Mumbai, Kolkata, Chennai, Bengaluru, Cochin, and Hyderabad. Pick two of those cities to see a prediction.
          </div>
        </div>
      )}

      {noResultsAtAll && (
        <div className="bg-stone-50 rounded-3xl border border-stone-200 p-10 flex flex-col items-center justify-center space-y-3 text-center">
          <XCircle className="w-9 h-9 text-stone-400" />
          <div className="text-lg font-bold text-stone-600">No flights found</div>
        </div>
      )}

      {!loading && !error && !unsupportedRoute && (lowTier.length > 0 || mediumTier.length > 0 || highTier.length > 0) && (
        <div className="space-y-10">
          {lowTier.length > 0 && (
            <div className="bg-[#F2FBF7] rounded-[32px] border border-emerald-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-full bg-emerald-500/15 text-emerald-600 flex items-center justify-center shrink-0">
                    <Tag className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 font-black text-[#3C1318] text-2xl sm:text-3xl">
                      <span>Low Pricing</span>
                      <span className="w-6 h-6 rounded-full bg-emerald-600 text-white text-xs font-bold flex items-center justify-center">✓</span>
                    </div>
                    <div className="text-sm sm:text-base text-stone-500 font-medium mt-0.5">Best deals for you</div>
                  </div>
                </div>
                <span className="bg-emerald-200/80 text-emerald-900 px-5 py-2 rounded-full text-base sm:text-lg font-black">{lowTier.length} Flights</span>
              </div>
              <div className="space-y-4">
                {lowTier.map((flight) => (
                  <div key={flight.id} onClick={() => onSearchFlight(flight)} className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 hover:border-emerald-500/60 hover:shadow-xl transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-2xl text-white flex items-center justify-center font-black text-xl shrink-0" style={{ backgroundColor: flight.logoBg }}>{flight.code}</div>
                      <span className="font-black text-[#3C1318] text-2xl sm:text-3xl">{flight.airline}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-base sm:text-xl font-semibold text-stone-700">
                      <span className="font-black text-[#3C1318] text-xl sm:text-2xl">{flight.depTime}</span>
                      <span className="text-stone-400 font-bold">{source.code}</span>
                      <span className="text-stone-300">•</span>
                      <span className="text-emerald-600 font-black">{flight.duration} {flight.stopsLabel}</span>
                      <span className="text-stone-300">•</span>
                      <span className="font-black text-[#3C1318] text-xl sm:text-2xl">{flight.arrTime}</span>
                      <span className="text-stone-400 font-bold">{destination.code}</span>
                    </div>
                    <div className="flex items-center space-x-4 ml-auto lg:ml-0">
                      <div className="text-emerald-600 font-black text-2xl sm:text-4xl flex items-center space-x-2">
                        <span>{flight.formattedPrice}</span>
                        <ChevronRight className="w-7 h-7 stroke-[3]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {mediumTier.length > 0 && (
            <div className="bg-[#F0F5FE] rounded-[32px] border border-blue-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-full bg-blue-500/15 text-blue-600 flex items-center justify-center shrink-0">
                    <BarChart2 className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 font-black text-[#3C1318] text-2xl sm:text-3xl">
                      <span>Medium Pricing</span>
                      <span className="w-6 h-6 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center">✓</span>
                    </div>
                    <div className="text-sm sm:text-base text-stone-500 font-medium mt-0.5">More options with more choices</div>
                  </div>
                </div>
                <span className="bg-blue-200/80 text-blue-900 px-5 py-2 rounded-full text-base sm:text-lg font-black">{mediumTier.length} Flights</span>
              </div>
              <div className="space-y-4">
                {mediumTier.map((flight) => (
                  <div key={flight.id} onClick={() => onSearchFlight(flight)} className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 hover:border-blue-500/60 hover:shadow-xl transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-2xl text-white flex items-center justify-center font-black text-xl shrink-0" style={{ backgroundColor: flight.logoBg }}>{flight.code}</div>
                      <span className="font-black text-[#3C1318] text-2xl sm:text-3xl">{flight.airline}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-base sm:text-xl font-semibold text-stone-700">
                      <span className="font-black text-[#3C1318] text-xl sm:text-2xl">{flight.depTime}</span>
                      <span className="text-stone-400 font-bold">{source.code}</span>
                      <span className="text-stone-300">•</span>
                      <span className="text-blue-600 font-black">{flight.duration} {flight.stopsLabel}</span>
                      <span className="text-stone-300">•</span>
                      <span className="font-black text-[#3C1318] text-xl sm:text-2xl">{flight.arrTime}</span>
                      <span className="text-stone-400 font-bold">{destination.code}</span>
                    </div>
                    <div className="flex items-center space-x-4 ml-auto lg:ml-0">
                      <div className="text-blue-600 font-black text-2xl sm:text-4xl flex items-center space-x-2">
                        <span>{flight.formattedPrice}</span>
                        <ChevronRight className="w-7 h-7 stroke-[3]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {highTier.length > 0 && (
            <div className="bg-[#F8F5FE] rounded-[32px] border border-purple-200/80 p-6 sm:p-8 shadow-sm space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3.5">
                  <div className="w-11 h-11 rounded-full bg-purple-500/15 text-purple-600 flex items-center justify-center shrink-0">
                    <Gem className="w-6 h-6" />
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 font-black text-[#3C1318] text-2xl sm:text-3xl">
                      <span>High Pricing</span>
                      <span className="w-6 h-6 rounded-full bg-purple-600 text-white text-xs font-bold flex items-center justify-center">✓</span>
                    </div>
                    <div className="text-sm sm:text-base text-stone-500 font-medium mt-0.5">Premium options</div>
                  </div>
                </div>
                <span className="bg-purple-200/80 text-purple-900 px-5 py-2 rounded-full text-base sm:text-lg font-black">{highTier.length} Flights</span>
              </div>
              <div className="space-y-4">
                {highTier.map((flight) => (
                  <div key={flight.id} onClick={() => onSearchFlight(flight)} className="bg-white rounded-3xl p-6 sm:p-7 border border-stone-200/80 hover:border-purple-500/60 hover:shadow-xl transition-all flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 cursor-pointer">
                    <div className="flex items-center space-x-4">
                      <div className="w-14 h-14 rounded-2xl text-white flex items-center justify-center font-black text-xl shrink-0" style={{ backgroundColor: flight.logoBg }}>{flight.code}</div>
                      <span className="font-black text-[#3C1318] text-2xl sm:text-3xl">{flight.airline}</span>
                    </div>
                    <div className="flex flex-wrap items-center gap-3 sm:gap-4 text-base sm:text-xl font-semibold text-stone-700">
                      <span className="font-black text-[#3C1318] text-xl sm:text-2xl">{flight.depTime}</span>
                      <span className="text-stone-400 font-bold">{source.code}</span>
                      <span className="text-stone-300">•</span>
                      <span className="text-purple-600 font-black">{flight.duration} {flight.stopsLabel}</span>
                      <span className="text-stone-300">•</span>
                      <span className="font-black text-[#3C1318] text-xl sm:text-2xl">{flight.arrTime}</span>
                      <span className="text-stone-400 font-bold">{destination.code}</span>
                    </div>
                    <div className="flex items-center space-x-4 ml-auto lg:ml-0">
                      <div className="text-purple-600 font-black text-2xl sm:text-4xl flex items-center space-x-2">
                        <span>{flight.formattedPrice}</span>
                        <ChevronRight className="w-7 h-7 stroke-[3]" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      </div>
    </div>
  );
}
