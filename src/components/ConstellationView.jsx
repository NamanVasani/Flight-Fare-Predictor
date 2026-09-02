import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import Globe3D from './Globe3D';

export default function ConstellationView({ source, destination, onEnterIntelligence, onOpenAccount }) {
  return (
    <div className="w-full flex-grow flex flex-col justify-between relative overflow-hidden bg-[#FAF7F2] min-h-[calc(100dvh-100px)] animate-fade-in">
      
      {/* Main Orbital Content Grid (+80% size) */}
      <div className="max-w-[1920px] w-full mx-auto px-6 sm:px-12 lg:px-20 py-10 my-auto grid grid-cols-1 lg:grid-cols-12 gap-16 items-center relative z-20">
        
        {/* Left Column (Headline & Action Buttons - Shifted 10-15% Left) */}
        <div className="lg:col-span-6 space-y-8 max-w-3xl lg:-ml-12 xl:-ml-20 z-30">
          
          <div className="inline-flex items-center space-x-2">
            <span className="tracking-[0.28em] text-sm sm:text-base font-black uppercase text-[#7A5C61]">
              FLIGHT INTELLIGENCE NETWORK
            </span>
          </div>

          <h1 className="text-4xl sm:text-6xl md:text-8xl lg:text-9xl xl:text-[118px] font-serif text-[#3C1318] leading-[1.08] sm:leading-[1.03] tracking-tight">
            Every journey <br />
            <span className="italic font-normal">starts in orbit.</span>
          </h1>

          <p className="text-[#525252] text-base sm:text-xl lg:text-2xl xl:text-3xl leading-relaxed font-medium">
            A quieter, clearer way to analyze and predict airfare dynamics across global routes with live machine learning intelligence.
          </p>

          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 sm:gap-5 pt-4">
            <button
              onClick={onEnterIntelligence}
              className="bg-[#3C1318] hover:bg-[#280C10] text-white px-6 py-4 sm:px-10 sm:py-5 rounded-2xl font-bold text-base sm:text-2xl flex items-center justify-center space-x-3 sm:space-x-4 transition-all shadow-lg active:scale-95 cursor-pointer group"
            >
              <span>Enter flight intelligence</span>
              <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6 group-hover:translate-x-1.5 transition-transform shrink-0" />
            </button>

            <button
              onClick={onOpenAccount}
              className="border-2 border-[#3C1318] hover:bg-[#3C1318]/5 text-[#3C1318] px-6 py-4 sm:px-10 sm:py-5 rounded-2xl font-bold text-base sm:text-2xl flex items-center justify-center space-x-2 sm:space-x-3 transition-all active:scale-95 cursor-pointer"
            >
              <span>Join FlyFinder Free</span>
              <Sparkles className="w-4 h-4 sm:w-5 sm:h-5 text-[#3C1318] shrink-0" />
            </button>
          </div>

        </div>

        {/* Right Column (3D Globe 20% Larger & Shifted 5% Right) */}
        <div className="lg:col-span-6 flex items-center justify-end relative my-auto">
          <Globe3D source={source} destination={destination} hideMarkers={true} sizeScale={1.2} shiftRight={true} />
        </div>

      </div>

      {/* Bottom Orbital Status Bar (+80% size) */}
      <div className="w-full border-t border-stone-300/60 bg-[#FAF7F2]/80 backdrop-blur-md py-3 sm:py-5 px-4 sm:px-8 lg:px-16 flex items-center justify-between gap-2 text-[9px] xs:text-[10px] sm:text-sm font-mono font-black tracking-wide sm:tracking-widest text-[#7A5C61] uppercase z-30 overflow-x-auto whitespace-nowrap">
        <div>ORBITAL PATH / LOCKED</div>
        <div className="hidden md:block">ALTITUDE / 38,000 FT</div>
        <div className="flex items-center space-x-1.5 sm:space-x-2.5 shrink-0">
          <span className="w-2 h-2 sm:w-2.5 sm:h-2.5 rounded-full bg-emerald-500 animate-pulse shrink-0"></span>
          <span>AI NAV / ACTIVE</span>
        </div>
      </div>

    </div>
  );
}
