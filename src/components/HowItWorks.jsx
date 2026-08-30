import React from 'react';
import { Plane, BarChart3, Brain, DollarSign } from 'lucide-react';

export default function HowItWorks() {
  const steps = [
    {
      icon: Plane,
      title: "Flight details",
      desc: "Real-time schedules\n& aircraft insights"
    },
    {
      icon: BarChart3,
      title: "Feature signals",
      desc: "Weather, traffic &\nroute patterns"
    },
    {
      icon: Brain,
      title: "Model analysis",
      desc: "AI/ML models predict\noutcomes"
    },
    {
      icon: DollarSign,
      title: "Fare intelligence",
      desc: "Smart fare forecast\n& recommendations"
    }
  ];

  return (
    <div className="w-full pt-4 pb-2 z-20 relative">
      {/* Section Title */}
      <div className="flex items-center space-x-2 mb-3.5">
        <h3 className="text-[#35979A] font-extrabold text-[11px] tracking-[0.2em] uppercase font-sans">
          HOW FLYFINDER WORKS
        </h3>
      </div>

      {/* 4 Step Cards Container */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5 items-center">
        {steps.map((step, idx) => {
          const IconComp = step.icon;
          return (
            <div key={step.title} className="flex items-center space-x-2 w-full">
              
              {/* Step Card */}
              <div className="bg-white rounded-2xl p-3 border border-stone-200/60 shadow-step-card flex items-center space-x-3 flex-1 min-h-[76px] hover:shadow-md transition-shadow">
                <div className="w-10 h-10 rounded-xl bg-white border border-[#35979A]/30 text-[#35979A] flex items-center justify-center shrink-0 shadow-2xs">
                  <IconComp className="w-5 h-5 stroke-[1.75]" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-[#3C1318] mb-0.5 leading-tight">
                    {step.title}
                  </h4>
                  <p className="text-[11px] text-stone-500 leading-tight whitespace-pre-line font-medium">
                    {step.desc}
                  </p>
                </div>
              </div>

              {/* Dotted Arrow Indicator matching mockup */}
              {idx < steps.length - 1 && (
                <div className="hidden lg:flex items-center text-[#35979A] shrink-0 px-1">
                  <svg width="24" height="12" viewBox="0 0 24 12" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-5 h-3 opacity-80">
                    <line x1="1" y1="6" x2="17" y2="6" stroke="#35979A" strokeWidth="1.5" strokeDasharray="2 3" />
                    <path d="M15 3L19 6L15 9" stroke="#35979A" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
              )}

            </div>
          );
        })}
      </div>
    </div>
  );
}

