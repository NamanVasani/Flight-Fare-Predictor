import React from 'react';
import { Plane, UserCircle2, LogOut } from 'lucide-react';

export default function Navbar({ onGoHome, onOpenAccountModal, onOpenLoginModal, user, onLogout }) {
  return (
    <header className="w-full bg-[#FAF7F2] py-4 sm:py-6 lg:py-8 px-4 sm:px-6 lg:px-12 xl:px-20 flex items-center justify-between gap-3 z-40 relative max-w-[1920px] mx-auto border-b border-stone-200/50">
      
      {/* Left: Logo (+50% size) */}
      <button
        type="button"
        onClick={onGoHome}
        className="flex items-center space-x-2 sm:space-x-3.5 cursor-pointer group shrink-0 bg-transparent border-0 p-0 text-left min-w-0"
      >
        <div className="text-[#3C1318] transform rotate-45 group-hover:scale-110 transition-transform shrink-0">
          <Plane className="w-6 h-6 sm:w-9 sm:h-9 lg:w-11 lg:h-11 fill-current" />
        </div>
        <span className="font-extrabold text-xl sm:text-3xl lg:text-4xl xl:text-5xl tracking-tight text-[#3C1318] font-sans truncate">
          FlyFinder
        </span>
      </button>

      {/* Right: Nav Links & Account Button (+50% size) */}
      <div className="flex items-center space-x-3 sm:space-x-8 lg:space-x-12 shrink-0">
        <nav className="hidden sm:flex items-center space-x-8 lg:space-x-10 text-lg sm:text-xl font-bold text-[#3C1318]">
          <a href="#about" className="hover:opacity-75 transition-opacity">
            About Us
          </a>
          <a href="#support" className="hover:opacity-75 transition-opacity">
            Support
          </a>
          {!user && (
            <button
              onClick={onOpenLoginModal}
              className="hover:opacity-75 transition-opacity font-bold cursor-pointer"
            >
              Login
            </button>
          )}
        </nav>

        {user ? (
          <div className="flex items-center space-x-2 sm:space-x-4">
            <div className="hidden sm:flex items-center space-x-2.5 bg-white border border-stone-200 rounded-full pl-3 pr-4 py-2 shadow-sm">
              <UserCircle2 className="w-7 h-7 text-[#3C1318]" />
              <div className="leading-tight text-left">
                <div className="text-sm font-extrabold text-[#3C1318]">{user.name}</div>
                <div className="text-[11px] font-bold text-emerald-600">{user.tier}</div>
              </div>
            </div>
            <button
              onClick={onLogout}
              title="Log out"
              className="flex items-center space-x-1.5 sm:space-x-2 bg-[#3C1318] hover:bg-[#280C10] text-white px-3.5 sm:px-7 py-2.5 sm:py-4 rounded-full font-bold text-xs sm:text-lg transition-all duration-200 shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
            >
              <LogOut className="w-4 h-4 sm:w-5 sm:h-5 shrink-0" />
              <span>Log Out</span>
            </button>
          </div>
        ) : (
          <button
            onClick={onOpenAccountModal}
            className="bg-[#3C1318] hover:bg-[#280C10] text-white px-3.5 sm:px-10 py-2.5 sm:py-4 rounded-full font-bold text-xs sm:text-xl transition-all duration-200 shadow-md active:scale-95 cursor-pointer whitespace-nowrap"
          >
            Create Account
          </button>
        )}
      </div>

    </header>
  );
}
