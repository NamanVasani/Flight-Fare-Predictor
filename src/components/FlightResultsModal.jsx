import React, { useMemo } from 'react';
import { X, ShieldCheck, Plane, Sparkles, ArrowRight } from 'lucide-react';
import { predictFlightFares } from '../utils/farePredictor';

export default function FlightResultsModal({ isOpen, onClose, source, destination, date }) {
  if (!isOpen) return null;

  // Generate real-time ML predictions based on origin, destination & date
  const predictionData = useMemo(() => {
    return predictFlightFares(source, destination, date);
  }, [source, destination, date]);

  const { flights, recommendation, distanceKm } = predictionData;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#3C1318]/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-3xl w-full max-h-[90vh] overflow-y-auto border border-stone-200 shadow-2xl p-6 sm:p-8 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-stone-100 hover:bg-stone-200 text-[#3C1318] transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header Badge & Title */}
        <div className="flex items-center space-x-3 mb-2">
          <div className="px-3 py-1 rounded-full bg-[#35979A]/15 text-[#35979A] border border-[#35979A]/30 text-xs font-extrabold uppercase tracking-wider flex items-center space-x-1.5">
            <Sparkles className="w-3.5 h-3.5 text-[#35979A]" />
            <span>XGBoost &amp; CatBoost ML Forecast</span>
          </div>
          <span className="text-xs text-stone-500 font-medium">{date} • {distanceKm} km</span>
        </div>

        <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#3C1318] mb-2 flex items-center gap-2">
          <span>{source.city} ({source.code})</span>
          <ArrowRight className="w-6 h-6 text-[#35979A]" />
          <span>{destination.city} ({destination.code})</span>
        </h2>
        <p className="text-sm text-stone-600 mb-6 font-medium">
          Synthesized from trained XGBoost &amp; CatBoost regressor models analyzing route patterns, date demand &amp; aircraft features.
        </p>

        {/* Fare Forecast Intelligence Banner */}
        <div className="bg-[#FAF7F2] border border-stone-200/80 rounded-2xl p-4 sm:p-5 mb-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-2xs">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 rounded-xl bg-[#3C1318] text-white flex items-center justify-center shrink-0 shadow-sm">
              <ShieldCheck className="w-6 h-6 text-[#00F2FE]" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-sm font-extrabold text-[#3C1318]">Optimal Booking Window</span>
                <span className={`px-2 py-0.5 rounded text-[10px] font-extrabold ${recommendation.badgeBg}`}>
                  {recommendation.status}
                </span>
              </div>
              <p className="text-xs text-stone-600 mt-0.5 font-medium">
                {recommendation.message}
              </p>
            </div>
          </div>
          <div className="text-right sm:border-l sm:border-stone-300/60 sm:pl-6 w-full sm:w-auto">
            <div className="text-xs text-stone-500 font-medium">AI Model Confidence</div>
            <div className="text-xl font-extrabold text-[#3C1318]">{recommendation.confidence}</div>
          </div>
        </div>

        {/* Flight Options List */}
        <div className="space-y-4">
          <h3 className="text-xs font-extrabold uppercase tracking-wider text-stone-500">
            LIVE SCHEDULES &amp; ML PREDICTED FARES
          </h3>

          {flights.map((flight) => (
            <div
              key={flight.id}
              className="border border-stone-200 hover:border-[#3C1318]/40 rounded-2xl p-4 transition-all duration-200 hover:shadow-md flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white"
            >
              {/* Airline & Aircraft Info */}
              <div className="flex items-center space-x-4">
                <div className="w-10 h-10 rounded-xl bg-[#3C1318]/5 border border-stone-200/60 flex items-center justify-center font-extrabold text-[#3C1318] shrink-0 text-sm">
                  {flight.logo}
                </div>
                <div>
                  <div className="font-extrabold text-[#3C1318] text-base">{flight.airline}</div>
                  <div className="text-xs text-stone-500 flex items-center space-x-2 font-medium">
                    <span>{flight.flightNo}</span>
                    <span>•</span>
                    <span className="flex items-center">
                      <Plane className="w-3 h-3 mr-1 inline text-stone-400" /> {flight.aircraft}
                    </span>
                  </div>
                </div>
              </div>

              {/* Timing */}
              <div className="flex items-center space-x-4 text-center">
                <div>
                  <div className="font-extrabold text-[#3C1318]">{flight.depTime}</div>
                  <div className="text-[11px] text-stone-500 font-medium">{source.code}</div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-[10px] font-bold text-stone-500">{flight.duration}</span>
                  <div className="w-16 h-0.5 bg-stone-300 my-1 relative">
                    <div className="w-1.5 h-1.5 rounded-full bg-[#35979A] absolute right-0 top-1/2 -translate-y-1/2"></div>
                  </div>
                  <span className="text-[10px] text-emerald-700 font-bold">{flight.stops}</span>
                </div>
                <div>
                  <div className="font-extrabold text-[#3C1318]">{flight.arrTime}</div>
                  <div className="text-[11px] text-stone-500 font-medium">{destination.code}</div>
                </div>
              </div>

              {/* Price & CTA */}
              <div className="flex items-center sm:flex-col sm:items-end justify-between w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-stone-200">
                <div>
                  <div className="text-xs text-stone-500 font-medium">Predicted Fare</div>
                  <div className="text-xl font-extrabold text-[#3C1318]">{flight.predictedFare}</div>
                </div>
                <button
                  onClick={() => alert(`Locking predicted fare for ${flight.airline} ${flight.flightNo} (${source.code} → ${destination.code})!`)}
                  className="bg-[#3C1318] hover:bg-[#280C10] text-white text-xs font-bold px-4 py-2 rounded-xl transition-all duration-200 shadow-sm cursor-pointer"
                >
                  Lock Fare
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer Note */}
        <div className="mt-6 pt-4 border-t border-stone-200 flex items-center justify-between text-xs text-stone-500">
          <span className="font-medium">Powered by FlyFinder ML Ensembled Model v2.4 (XGBoost + CatBoost)</span>
          <button onClick={onClose} className="font-bold hover:underline cursor-pointer text-[#3C1318]">
            Close Forecast
          </button>
        </div>

      </div>
    </div>
  );
}

