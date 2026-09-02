import React from 'react';
import { ArrowLeftRight, Search, SlidersHorizontal } from 'lucide-react';
import { AIRPORTS } from '../data/airports';

export default function HeroSection({
  source,
  destination,
  date,
  onSourceChange,
  onDestinationChange,
  onDateChange,
  onSwap,
  onSearch
}) {
  return (
    <div className="w-full flex flex-col justify-center py-6 lg:py-12 relative z-30">
      
      {/* 1. Uppercase Tracking Badge */}
      <div className="mb-4 sm:mb-6">
        <span className="tracking-[0.25em] text-base sm:text-lg text-[#7A5C61] font-black uppercase">
          ROUTE FORECASTING <span className="opacity-50 mx-1">/</span> LIVE
        </span>
      </div>

      {/* 2. Main Headline (+80% size) */}
      <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-[124px] font-serif text-[#3C1318] leading-[1.05] sm:leading-[1.02] tracking-tight mb-8">
        Where will <br />
        <span className="italic font-normal">you go next?</span>
      </h1>

      {/* 3. Subtitle Paragraph (+80% size) */}
      <p className="text-[#525252] max-w-2xl text-base sm:text-xl lg:text-2xl xl:text-3xl leading-relaxed mb-10 sm:mb-14 font-medium">
        Select origin and destination to generate live flight schedules <br className="hidden sm:inline" />
        &amp; fare forecasts with AI precision.
      </p>

      {/* 4. Search Widget (+80% size) */}
      <div className="bg-white rounded-3xl p-6 sm:p-7 shadow-search-card border border-stone-200/80 flex flex-col lg:flex-row items-stretch lg:items-center gap-4 sm:gap-6 w-full max-w-6xl relative z-30">
        
        {/* FROM */}
        <div className="flex-1 lg:min-w-[280px] bg-[#F7F5F0] px-6 py-4.5 rounded-2xl border border-stone-200/50">
          <div className="flex items-center space-x-2 mb-1.5 whitespace-nowrap">
            <span className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-stone-700">FROM</span>
            <span className="text-xs sm:text-sm font-medium text-stone-500">(SOURCE)</span>
          </div>
          <select
            value={source.code}
            onChange={(e) => {
              const selected = AIRPORTS.find(a => a.code === e.target.value);
              if (selected) onSourceChange(selected);
            }}
            className="w-full bg-transparent text-xl sm:text-2xl font-black text-[#3C1318] focus:outline-none cursor-pointer p-0"
          >
            {AIRPORTS.map((apt) => (
              <option key={apt.code} value={apt.code} disabled={apt.code === destination.code}>
                {apt.city} ({apt.code})
              </option>
            ))}
          </select>
        </div>

        {/* Swap Control */}
        <div className="flex items-center justify-center shrink-0">
          <button
            onClick={onSwap}
            type="button"
            title="Swap origin and destination"
            className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-white hover:bg-stone-50 border border-stone-200 text-[#3C1318] flex items-center justify-center shadow-sm active:scale-90 transition-all group cursor-pointer"
          >
            <ArrowLeftRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:rotate-180 transition-transform duration-300" />
          </button>
        </div>

        {/* TO */}
        <div className="flex-1 lg:min-w-[280px] bg-[#F7F5F0] px-6 py-4.5 rounded-2xl border border-stone-200/50">
          <div className="flex items-center space-x-2 mb-1.5 whitespace-nowrap">
            <span className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-stone-700">TO</span>
            <span className="text-xs sm:text-sm font-medium text-stone-500">(DESTINATION)</span>
          </div>
          <select
            value={destination.code}
            onChange={(e) => {
              const selected = AIRPORTS.find(a => a.code === e.target.value);
              if (selected) onDestinationChange(selected);
            }}
            className="w-full bg-transparent text-xl sm:text-2xl font-black text-[#3C1318] focus:outline-none cursor-pointer p-0"
          >
            {AIRPORTS.map((apt) => (
              <option key={apt.code} value={apt.code} disabled={apt.code === source.code}>
                {apt.city} ({apt.code})
              </option>
            ))}
          </select>
        </div>

        {/* Filter Sliders Icon */}
        <div className="hidden lg:flex items-center justify-center text-stone-500 px-1 shrink-0">
          <div className="w-14 h-14 rounded-2xl bg-[#F7F5F0] border border-stone-200/50 flex items-center justify-center text-stone-600">
            <SlidersHorizontal className="w-6 h-6" />
          </div>
        </div>

        {/* DATE */}
        <div className="w-full lg:w-56 bg-[#F7F5F0] px-6 py-4.5 rounded-2xl border border-stone-200/50 shrink-0">
          <div className="text-sm sm:text-base font-extrabold uppercase tracking-wider text-stone-700 mb-1">
            DATE
          </div>
          <input
            type="date"
            value={date}
            min="2026-01-01"
            max="2027-12-31"
            onChange={(e) => onDateChange(e.target.value)}
            className="w-full bg-transparent text-lg sm:text-xl font-black text-[#3C1318] focus:outline-none cursor-pointer p-0"
          />
        </div>

        {/* Search Action Button */}
        <div className="shrink-0">
          <button
            onClick={onSearch}
            type="button"
            className="w-full lg:w-auto bg-[#3C1318] hover:bg-[#280C10] px-6 py-4 sm:px-10 sm:py-5 rounded-2xl text-white font-bold text-lg sm:text-2xl flex items-center justify-center space-x-3 transition-all shadow-md active:scale-95 group cursor-pointer"
          >
            <Search className="w-5 h-5 sm:w-6 sm:h-6 text-white group-hover:scale-110 transition-transform" />
            <span>Search</span>
          </button>
        </div>

      </div>

    </div>
  );
}
