import React from 'react';

export default function Footer() {
  return (
    <footer className="w-full font-sans">
      <div id="about" className="w-full px-6 sm:px-12 lg:px-16 pt-10 pb-6 max-w-[1536px] mx-auto grid grid-cols-1 sm:grid-cols-2 gap-6 border-t border-stone-200/60">
        <div>
          <h3 className="text-[#3C1318] font-extrabold text-sm uppercase tracking-wider mb-2">About Us</h3>
          <p className="text-stone-500 text-sm max-w-md">
            FlyFinder is a flight fare intelligence tool that combines a live XGBoost/CatBoost
            price ensemble with route-based tier predictions to help you spot a good deal before you book.
          </p>
        </div>
        <div id="support">
          <h3 className="text-[#3C1318] font-extrabold text-sm uppercase tracking-wider mb-2">Support</h3>
          <p className="text-stone-500 text-sm max-w-md">
            Questions or issues with a booking or prediction? Reach us at{' '}
            <a href="mailto:support@flyfinder.example" className="text-[#35979A] font-semibold hover:underline">
              support@flyfinder.example
            </a>.
          </p>
        </div>
      </div>

      <div className="w-full px-6 sm:px-12 lg:px-16 py-7 flex flex-col sm:flex-row justify-between items-center text-sm sm:text-base z-30 relative max-w-[1536px] mx-auto border-t border-stone-200/60">
        <span className="text-[#35979A] font-extrabold tracking-[0.22em] uppercase text-base sm:text-lg">
          FLYFINDER
        </span>
        <span className="text-stone-500 font-medium text-sm sm:text-base">
          © 2026-2027 FlyFinder Flight Intelligence Network
        </span>
      </div>
    </footer>
  );
}
