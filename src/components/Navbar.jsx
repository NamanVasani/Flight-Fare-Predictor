import React from 'react';
import { Plane } from 'lucide-react';

export default function Navbar({ onGoHome, onOpenAccountModal, onOpenLoginModal }) {
  return (
    <header className="w-full bg-[#FAF7F2] py-6 sm:py-8 px-6 sm:px-12 lg:px-20 flex items-center justify-between z-40 relative max-w-[1920px] mx-auto border-b border-stone-200/50">
      
      {/* Left: Logo (+50% size) */}
      <div 
        onClick={onGoHome}
        className="flex items-center space-x-3.5 cursor-pointer group shrink-0"
      >
        <div className="text-[#3C1318] transform rotate-45 group-hover:scale-110 transition-transform">
          <Plane className="w-9 h-9 sm:w-11 sm:h-11 fill-current" />
        </div>
        <span className="font-extrabold text-3xl sm:text-4xl lg:text-5xl tracking-tight text-[#3C1318] font-sans">
          FlyFinder
        </span>
      </div>

      {/* Right: Nav Links & Account Button (+50% size) */}
      <div className="flex items-center space-x-8 sm:space-x-12 shrink-0">
        <nav className="hidden sm:flex items-center space-x-8 lg:space-x-10 text-lg sm:text-xl font-bold text-[#3C1318]">
          <a href="#about" className="hover:opacity-75 transition-opacity">
            About Us
          </a>
          <a href="#support" className="hover:opacity-75 transition-opacity">
            Support
          </a>
          <button
            onClick={onOpenLoginModal}
            className="hover:opacity-75 transition-opacity font-bold cursor-pointer"
          >
            Login
          </button>
        </nav>

        <button
          onClick={onOpenAccountModal}
          className="bg-[#3C1318] hover:bg-[#280C10] text-white px-8 sm:px-10 py-3.5 sm:py-4 rounded-full font-bold text-base sm:text-xl transition-all duration-200 shadow-md active:scale-95 cursor-pointer"
        >
          Create Account
        </button>
      </div>

    </header>
  );
}
