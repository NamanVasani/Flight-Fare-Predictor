import React from 'react';
import { X, Brain, TrendingUp, Clock, MapPin, Award, Layers, BarChart2 } from 'lucide-react';

export default function MLInsightsModal({ isOpen, onClose }) {
  if (!isOpen) return null;

  const insights = [
    {
      id: 1,
      title: "1. Price Distribution",
      icon: BarChart2,
      badge: "RIGHT-SKEWED",
      badgeColor: "bg-blue-100 text-blue-800",
      description: "Flight prices are right-skewed, meaning most tickets are in the lower to medium price range. Only a small number of flights have very high prices, indicating the presence of expensive premium tickets or outliers."
    },
    {
      id: 2,
      title: "2. Duration vs Price",
      icon: Clock,
      badge: "POSITIVE CORRELATION",
      badgeColor: "bg-emerald-100 text-emerald-800",
      description: "Flight duration generally has a positive relationship with ticket price. Longer flights tend to be more expensive, although some exceptions exist due to airline pricing and route differences."
    },
    {
      id: 3,
      title: "3. Total Stops vs Price",
      icon: Layers,
      badge: "MULTI-STOP SCALING",
      badgeColor: "bg-[#00F2FE]/20 text-[#2E0C10]",
      description: "Ticket prices generally increase as the number of stops increases. Flights with one or more stops are often priced higher because they usually cover longer routes or involve multiple flight segments."
    },
    {
      id: 4,
      title: "4. Airline vs Price",
      icon: Award,
      badge: "CARRIER IMPACT",
      badgeColor: "bg-purple-100 text-purple-800",
      description: "Ticket prices vary significantly across airlines. Premium airlines generally charge higher fares, while budget airlines offer lower-priced tickets. Airline choice is one of the strongest factors affecting ticket price."
    },
    {
      id: 5,
      title: "5. Source vs Price",
      icon: MapPin,
      badge: "DEPARTURE DEMAND",
      badgeColor: "bg-amber-100 text-amber-800",
      description: "The departure city influences ticket prices. Some cities have noticeably higher average fares than others due to demand, airport traffic, and route availability."
    },
    {
      id: 6,
      title: "6. Destination vs Price",
      icon: TrendingUp,
      badge: "ROUTE POPULARITY",
      badgeColor: "bg-rose-100 text-rose-800",
      description: "Destination city affects price based on demand and route popularity. High-traffic destination hubs show consistent pricing trends influenced by seasonal demand patterns."
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#2E0C10]/65 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto border border-gray-200 shadow-2xl p-6 sm:p-8 relative">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 hover:bg-gray-200 text-[#2E0C10] transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-11 h-11 rounded-2xl bg-[#2E0C10] text-[#00F2FE] flex items-center justify-center shadow-md">
            <Brain className="w-6 h-6" />
          </div>
          <div>
            <div className="text-[10px] font-bold tracking-widest text-[#38BDF8] uppercase font-sans">
              MACHINE LEARNING DATA SCIENCE
            </div>
            <h2 className="text-2xl sm:text-3xl font-serif font-bold text-[#2E0C10]">
              Flight Fare Model Insights
            </h2>
          </div>
        </div>

        <p className="text-xs sm:text-sm text-gray-600 mb-6 leading-relaxed">
          Comprehensive data exploration & feature analysis synthesized from XGBoost & CatBoost trained regressor models.
        </p>

        {/* Insights Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {insights.map((item) => {
            const IconComp = item.icon;
            return (
              <div
                key={item.id}
                className="bg-[#FAF8F5] border border-gray-200 rounded-2xl p-5 hover:border-[#38BDF8] transition-all duration-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 text-[#2E0C10] flex items-center justify-center shadow-xs">
                        <IconComp className="w-4 h-4 text-[#38BDF8]" />
                      </div>
                      <h3 className="font-serif font-bold text-lg text-[#2E0C10]">
                        {item.title}
                      </h3>
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full ${item.badgeColor}`}>
                      {item.badge}
                    </span>
                  </div>

                  <p className="text-xs text-gray-600 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-gray-200/60 flex items-center justify-between text-[11px] font-medium text-gray-500">
                  <span>Model Weighting</span>
                  <span className="font-bold text-[#2E0C10]">High Significance</span>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer info */}
        <div className="mt-6 pt-4 border-t border-gray-200 flex items-center justify-between text-xs text-gray-500">
          <span>Source: FLIGHT_KNOWLEDGE Analytics Report & XGBoost Feature Importance</span>
          <button
            onClick={onClose}
            className="bg-[#2E0C10] text-white px-5 py-2 rounded-full font-bold hover:bg-[#1a0709] transition-colors"
          >
            Close Insights
          </button>
        </div>

      </div>
    </div>
  );
}
