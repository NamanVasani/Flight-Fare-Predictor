import React, { useState } from 'react';
import Navbar from './components/Navbar';
import CoherentView from './components/CoherentView';
import HeroSection from './components/HeroSection';
import Globe3D from './components/Globe3D';
import HowItWorks from './components/HowItWorks';
import ConstellationView from './components/ConstellationView';
import BlueprintView from './components/BlueprintView';
import FlightResultsModal from './components/FlightResultsModal';
import CreateAccountModal from './components/CreateAccountModal';
import LoginModal from './components/LoginModal';
import MLInsightsModal from './components/MLInsightsModal';
import Footer from './components/Footer';
import { getAirportByCode } from './data/airports';

export default function App() {
  // Connected Flow starting at Page 1: 'constellation' ("Every journey starts in orbit.")
  // Page 1: 'constellation' -> Page 2: 'spinner' (Search) -> Page 3: 'coherent' (Results)
  const [activeTheme, setActiveTheme] = useState('constellation');

  // Search defaults: AMD (Ahmedabad) -> DEL (Delhi)
  const [source, setSource] = useState(() => getAirportByCode('AMD'));
  const [destination, setDestination] = useState(() => getAirportByCode('DEL'));
  const [date, setDate] = useState('2026-09-15');

  // Modals state
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isInsightsModalOpen, setIsInsightsModalOpen] = useState(false);
  const [, setUser] = useState(null);

  // Swap logic
  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  // Step 2 -> Step 3: Trigger search and transition to results view
  const handlePerformSearch = () => {
    setActiveTheme('coherent');
  };

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-[#3C1318] flex flex-col justify-between overflow-x-hidden selection:bg-[#00F2FE]/30 selection:text-[#3C1318] relative font-sans">
      
      {/* Top Header Navigation */}
      <Navbar
        onGoHome={() => setActiveTheme('constellation')}
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
      />

      {/* Main Content Area rendered based on active page step */}
      <main className="flex-grow flex flex-col justify-center">
        
        {/* PAGE 1: CONSTELLATION LANDING ("Every journey starts in orbit.") */}
        {activeTheme === 'constellation' && (
          <ConstellationView
            source={source}
            destination={destination}
            onEnterIntelligence={() => setActiveTheme('spinner')}
            onOpenAccount={() => setIsAccountModalOpen(true)}
          />
        )}

        {/* PAGE 2: ROUTE FORECASTING / SEARCH PAGE ("Where will you go next?") */}
        {activeTheme === 'spinner' && (
          <div className="w-full px-6 sm:px-12 lg:px-20 flex-grow flex flex-col justify-between max-w-[1920px] mx-auto py-8 animate-fade-in">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center w-full min-h-[calc(100vh-220px)]">
              
              {/* Left Column (Hero Title & Search Card - Shifted 20-25% Left) */}
              <div className="lg:col-span-6 flex flex-col justify-center my-auto lg:-ml-20 xl:-ml-32 z-30">
                <HeroSection
                  source={source}
                  destination={destination}
                  date={date}
                  onSourceChange={setSource}
                  onDestinationChange={setDestination}
                  onDateChange={setDate}
                  onSwap={handleSwap}
                  onSearch={handlePerformSearch}
                />
              </div>

              {/* Right Column (3D Earth Globe - 30% Bigger) */}
              <div className="lg:col-span-6 flex items-center justify-end relative overflow-visible my-auto">
                <Globe3D source={source} destination={destination} sizeScale={1.3} />
              </div>

            </div>

            {/* Bottom: How FlyFinder Works */}
            <div className="mt-8 border-t border-stone-200/60 pt-6">
              <HowItWorks />
            </div>
          </div>
        )}

        {/* PAGE 3: DYNAMIC SEARCH RESULTS VIEW (Low, Medium, High Pricing Tiers) */}
        {activeTheme === 'coherent' && (
          <CoherentView
            source={source}
            destination={destination}
            date={date}
            onSourceChange={setSource}
            onDestinationChange={setDestination}
            onSwap={handleSwap}
            onSearchFlight={(airlineCode) => {
              if (airlineCode) {
                setIsSearchModalOpen(true);
              }
            }}
          />
        )}

        {/* PAGE 4: BLUEPRINT (ML Architecture & Model Inspector) */}
        {activeTheme === 'blueprint' && (
          <BlueprintView
            source={source}
            destination={destination}
          />
        )}

      </main>

      {/* Modals */}
      <FlightResultsModal
        isOpen={isSearchModalOpen}
        onClose={() => setIsSearchModalOpen(false)}
        source={source}
        destination={destination}
        date={date}
      />

      <CreateAccountModal
        isOpen={isAccountModalOpen}
        onClose={() => setIsAccountModalOpen(false)}
      />

      <LoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onLoginSuccess={(userData) => {
          setUser(userData);
          setActiveTheme('spinner');
        }}
      />

      <MLInsightsModal
        isOpen={isInsightsModalOpen}
        onClose={() => setIsInsightsModalOpen(false)}
      />

      {/* Footer Baseline */}
      <Footer />

    </div>
  );
}




