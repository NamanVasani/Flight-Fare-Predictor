import React, { useState } from 'react';
import Navbar from './components/Navbar';
import CoherentView from './components/CoherentView';
import HeroSection from './components/HeroSection';
import Globe3D from './components/Globe3D';
import ConstellationView from './components/ConstellationView';
import FlightResultsModal from './components/FlightResultsModal';
import CreateAccountModal from './components/CreateAccountModal';
import LoginModal from './components/LoginModal';
import MLInsightsModal from './components/MLInsightsModal';
import Footer from './components/Footer';
import { getAirportByCode } from './data/airports';

export default function App() {
  const [activeTheme, setActiveTheme] = useState('constellation');

  const [source, setSource] = useState(() => getAirportByCode('DEL'));
  const [destination, setDestination] = useState(() => getAirportByCode('BOM'));
  const [date, setDate] = useState('2026-09-15');

  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const [isAccountModalOpen, setIsAccountModalOpen] = useState(false);
  const [isLoginModalOpen, setIsLoginModalOpen] = useState(false);
  const [isInsightsModalOpen, setIsInsightsModalOpen] = useState(false);
  const [selectedFlight, setSelectedFlight] = useState(null);
  const [user, setUser] = useState(null);

  const handleSwap = () => {
    const temp = source;
    setSource(destination);
    setDestination(temp);
  };

  const handlePerformSearch = () => {
    setActiveTheme('coherent');
  };

  return (
    <div className="min-h-dvh bg-[#FAF7F2] text-[#3C1318] flex flex-col justify-between overflow-x-hidden selection:bg-[#00F2FE]/30 selection:text-[#3C1318] relative font-sans">
      
      <Navbar
        onGoHome={() => setActiveTheme('constellation')}
        onOpenAccountModal={() => setIsAccountModalOpen(true)}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        user={user}
        onLogout={() => setUser(null)}
      />

      <main className="flex-grow flex flex-col justify-center">
        
        {activeTheme === 'constellation' && (
          <ConstellationView
            source={source}
            destination={destination}
            onEnterIntelligence={() => setActiveTheme('spinner')}
            onOpenAccount={() => setIsAccountModalOpen(true)}
          />
        )}

        {activeTheme === 'spinner' && (
          <div className="w-full flex-grow flex items-center justify-center px-6 sm:px-10 lg:px-16 xl:px-24 py-6 animate-fade-in">
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 md:gap-12 lg:gap-16 items-center w-full max-w-[1600px] mx-auto min-h-[calc(100vh-180px)]">
              <div className="md:col-span-7 lg:col-span-7 flex flex-col justify-center z-30">
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
              <div className="md:col-span-5 lg:col-span-5 flex items-center justify-start relative overflow-visible z-20 pl-4 md:pl-6">
                <Globe3D source={source} destination={destination} sizeScale={0.85} shiftRight={false} compact={true} />
              </div>
            </div>
          </div>
        )}

        {activeTheme === 'coherent' && (
          <CoherentView
            source={source}
            destination={destination}
            date={date}
            onSourceChange={setSource}
            onDestinationChange={setDestination}
            onSwap={handleSwap}
            onSearchFlight={(flight) => {
              if (flight) {
                setSelectedFlight(flight);
                setIsSearchModalOpen(true);
              }
            }}
          />
        )}

      </main>

      <FlightResultsModal
        isOpen={isSearchModalOpen}
        onClose={() => {
          setIsSearchModalOpen(false);
          setSelectedFlight(null);
        }}
        source={source}
        destination={destination}
        date={date}
        flight={selectedFlight}
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

      <Footer />

    </div>
  );
}
