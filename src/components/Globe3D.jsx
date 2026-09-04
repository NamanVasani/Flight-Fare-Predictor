import React, { useRef, useEffect, useState, useMemo } from 'react';
import Globe from 'react-globe.gl';

function getArcPoint(lat1, lon1, lat2, lon2, t) {
  const rLat1 = (lat1 * Math.PI) / 180;
  const rLon1 = (lon1 * Math.PI) / 180;
  const rLat2 = (lat2 * Math.PI) / 180;
  const rLon2 = (lon2 * Math.PI) / 180;

  const d = 2 * Math.asin(
    Math.sqrt(
      Math.sin((rLat1 - rLat2) / 2) ** 2 +
      Math.cos(rLat1) * Math.cos(rLat2) * Math.sin((rLon1 - rLon2) / 2) ** 2
    )
  );

  if (d === 0) return { lat: lat1, lng: lon1, alt: 0.05, angle: 0 };

  const A = Math.sin((1 - t) * d) / Math.sin(d);
  const B = Math.sin(t * d) / Math.sin(d);

  const x = A * Math.cos(rLat1) * Math.cos(rLon1) + B * Math.cos(rLat2) * Math.cos(rLon2);
  const y = A * Math.cos(rLat1) * Math.sin(rLon1) + B * Math.cos(rLat2) * Math.sin(rLon2);
  const z = A * Math.sin(rLat1) + B * Math.sin(rLat2);

  const lat = Math.atan2(z, Math.sqrt(x * x + y * y)) * (180 / Math.PI);
  const lng = Math.atan2(y, x) * (180 / Math.PI);
  const alt = Math.sin(t * Math.PI) * 0.28 + 0.03;

  // Compute bearing for aircraft direction
  const yB = Math.sin(rLon2 - rLon1) * Math.cos(rLat2);
  const xB = Math.cos(rLat1) * Math.sin(rLat2) - Math.sin(rLat1) * Math.cos(rLat2) * Math.cos(rLon2 - rLon1);
  const angle = (Math.atan2(yB, xB) * 180) / Math.PI;

  return { lat, lng, alt, angle };
}

export default function Globe3D({ 
  source, 
  destination, 
  hideMarkers = false,
  sizeScale = 1.0,
  shiftRight = false,
  compact = false
}) {
  const globeRef = useRef();

  // Track viewport width so the globe's pixel dimensions never exceed what the
  // device can actually show (a fixed px size regardless of screen would either
  // overflow tiny phones or look comically small on large desktops).
  const [viewportWidth, setViewportWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1280
  );

  useEffect(() => {
    let frame;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => setViewportWidth(window.innerWidth));
    };
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('resize', onResize);
      cancelAnimationFrame(frame);
    };
  }, []);

  // Calculated dimension based on scale — renders at full configured size,
  // not shrunk by viewport.
  const desiredDimension = Math.round((compact ? 550 : 1250) * sizeScale);
  const globeDimension = desiredDimension;

  // Animated airplane position along the arc
  const [planePos, setPlanePos] = useState(() => 
    getArcPoint(source.lat, source.lng, destination.lat, destination.lng, 0)
  );

  // Smooth animation loop for the airplane along the flight path arc.
  // Throttled to ~20fps (updates ~50ms) instead of every animation frame (~60fps) to avoid
  // recomputing/recreating the HTML overlay markers on every single frame.
  useEffect(() => {
    let animId;
    let startTime = null;
    let lastUpdate = 0;
    const duration = 4200; // 4.2 seconds per flight loop
    const updateIntervalMs = 50;

    const animate = (timestamp) => {
      if (!startTime) startTime = timestamp;
      const elapsed = timestamp - startTime;

      if (timestamp - lastUpdate >= updateIntervalMs) {
        lastUpdate = timestamp;
        const progress = (elapsed % duration) / duration;
        const pt = getArcPoint(source.lat, source.lng, destination.lat, destination.lng, progress);
        setPlanePos(pt);
      }

      animId = requestAnimationFrame(animate);
    };

    animId = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animId);
  }, [source, destination]);

  // Calculate midpoint for camera pointOfView targeting South Asia / route
  const midpoint = useMemo(() => {
    const lat1 = source.lat;
    const lon1 = source.lng;
    const lat2 = destination.lat;
    const lon2 = destination.lng;

    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const lat1Rad = lat1 * (Math.PI / 180);
    const lat2Rad = lat2 * (Math.PI / 180);
    const lon1Rad = lon1 * (Math.PI / 180);

    const Bx = Math.cos(lat2Rad) * Math.cos(dLon);
    const By = Math.cos(lat2Rad) * Math.sin(dLon);

    const midLat = Math.atan2(
      Math.sin(lat1Rad) + Math.sin(lat2Rad),
      Math.sqrt((Math.cos(lat1Rad) + Bx) * (Math.cos(lat1Rad) + Bx) + By * By)
    ) * (180 / Math.PI);

    const midLng = (lon1Rad + Math.atan2(By, Math.cos(lat1Rad) + Bx)) * (180 / Math.PI);

    return { lat: midLat, lng: midLng };
  }, [source, destination]);

  // Camera settings
  useEffect(() => {
    if (globeRef.current) {
      globeRef.current.pointOfView(
        {
          lat: midpoint.lat,
          lng: midpoint.lng,
          altitude: 4.0
        },
        1200
      );

      // On touchscreens, drag-to-rotate on the globe traps the page-scroll
      // gesture (a user trying to scroll past it ends up spinning the globe
      // instead). Disable rotate/pan via touch while keeping it for mouse users.
      const isCoarsePointer = typeof window !== 'undefined' &&
        window.matchMedia && window.matchMedia('(pointer: coarse)').matches;
      const controls = globeRef.current.controls && globeRef.current.controls();
      if (controls) {
        controls.enableRotate = !isCoarsePointer;
        controls.enablePan = !isCoarsePointer;
      }
    }
  }, [midpoint]);

  // Arcs data for glowing cyan flight trajectory
  const arcsData = useMemo(() => {
    return [
      {
        startLat: source.lat,
        startLng: source.lng,
        endLat: destination.lat,
        endLng: destination.lng,
        color: '#00F2FE'
      }
    ];
  }, [source, destination]);

  // HTML Overlay Markers (Source, Destination + 3D Toy Airplane)
  // Static markers are memoized separately from the plane so they don't get
  // recomputed every time the plane's animated position changes.
  const staticMarkers = useMemo(() => {
    if (hideMarkers) return [];
    return [
      { lat: source.lat, lng: source.lng, text: source.badge, alt: 0.01, isPlane: false },
      { lat: destination.lat, lng: destination.lng, text: destination.badge, alt: 0.01, isPlane: false }
    ];
  }, [source, destination, hideMarkers]);

  const combinedHtmlData = useMemo(() => {
    const items = [...staticMarkers];

    // Add 3D Toy Airplane marker
    if (planePos) {
      items.push({
        lat: planePos.lat,
        lng: planePos.lng,
        alt: planePos.alt,
        angle: planePos.angle,
        isPlane: true
      });
    }

    return items;
  }, [staticMarkers, planePos]);

  // Dynamic Shift Class — shifts the globe further right when `shiftRight` is true
  const shiftClass = shiftRight
    ? 'translate-x-20 sm:translate-x-28 lg:translate-x-36 xl:translate-x-44' 
    : compact
      ? 'translate-x-0'
      : 'translate-x-16 sm:translate-x-28 lg:translate-x-36 xl:translate-x-44';

  return (
    <div
      className={`relative w-full flex items-center ${compact ? 'justify-start' : 'justify-end'} pointer-events-auto overflow-visible my-auto`}
      style={{ minHeight: `${Math.round(globeDimension * 1.12)}px` }}
    >
      
      {/* Soft Cyan Atmospheric Halo behind Globe — sized relative to the actual globe so it stays contained around the earth */}
      <div
        className={`absolute rounded-full bg-[#00F2FE]/18 blur-2xl pointer-events-none -z-10 ${shiftClass}`}
        style={{ width: `${Math.round(globeDimension * 1.12)}px`, height: `${Math.round(globeDimension * 1.12)}px` }}
      ></div>

      {/* 3D Globe Canvas Container */}
      <div 
        style={{ width: `${globeDimension}px`, height: `${globeDimension}px`, touchAction: 'pan-y' }}
        className={`rounded-full relative cursor-grab active:cursor-grabbing overflow-hidden flex items-center justify-center ${shiftClass}`}
      >
        <Globe
          ref={globeRef}
          width={globeDimension}
          height={globeDimension}
          globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
          bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
          backgroundColor="rgba(0,0,0,0)"
          atmosphereColor="#00F2FE"
          atmosphereAltitude={0.25}
          
          // Arcs Configuration
          arcsData={arcsData}
          arcColor={(d) => d.color}
          arcDashLength={0.45}
          arcDashGap={0.2}
          arcDashAnimateTime={1600}
          arcStroke={4.2}
          arcAltitudeScale={0.28}

          // HTML Overlay Markers (City Badges + 3D Toy Airplane)
          htmlElementsData={combinedHtmlData}
          htmlAltitude={(d) => d.alt || 0.01}
          htmlElement={(d) => {
            const el = document.createElement('div');
            el.className = 'pointer-events-none select-none transform -translate-x-1/2 -translate-y-1/2 z-40';
            
            if (d.isPlane) {
              el.innerHTML = `
                <div class="relative flex items-center justify-center pointer-events-none select-none">
                  <!-- Jet Thrust Particle Halo -->
                  <div class="absolute -z-10 w-16 h-16 rounded-full bg-[#00F2FE]/30 blur-md animate-pulse"></div>
                  <div class="absolute -z-10 w-8 h-8 rounded-full bg-[#00F2FE] blur-sm animate-ping"></div>

                  <!-- 3D Toy Jet Airplane Vessel styled to match FlyFinder theme -->
                  <div class="relative transform transition-transform duration-75 drop-shadow-[0_15px_25px_rgba(0,0,0,0.7)]" style="transform: rotate(${d.angle + 45}deg) scale(1.65);">
                    <svg width="56" height="56" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <defs>
                        <!-- Metallic Burgundy Fuselage (#3C1318) -->
                        <linearGradient id="fuselageGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stop-color="#5C1921" />
                          <stop offset="50%" stop-color="#3C1318" />
                          <stop offset="100%" stop-color="#21080B" />
                        </linearGradient>

                        <!-- Electric Cyan Wing & Trim (#00F2FE) -->
                        <linearGradient id="cyanWingGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stop-color="#00F2FE" />
                          <stop offset="100%" stop-color="#0077FE" />
                        </linearGradient>

                        <!-- Gold Cockpit Glass (#FFD700) -->
                        <linearGradient id="goldCockpit" x1="0%" y1="0%" x2="100%" y2="100%">
                          <stop offset="0%" stop-color="#FFE600" />
                          <stop offset="100%" stop-color="#FF9900" />
                        </linearGradient>

                        <!-- Specular Toy Glare Highlight -->
                        <linearGradient id="toyHighlight" x1="0%" y1="0%" x2="0%" y2="100%">
                          <stop offset="0%" stop-color="#FFFFFF" stop-opacity="0.65" />
                          <stop offset="100%" stop-color="#FFFFFF" stop-opacity="0" />
                        </linearGradient>
                      </defs>

                      <!-- Engine Thrust Stream -->
                      <path d="M32 46 L32 60" stroke="#00F2FE" stroke-width="4.5" stroke-linecap="round" opacity="0.85" />

                      <!-- Main Swept Wings -->
                      <path d="M32 20 L58 38 L48 42 L32 30 L16 42 L6 38 Z" fill="url(#cyanWingGrad)" stroke="#3C1318" stroke-width="1.5" />
                      <path d="M32 20 L56 37 L50 39 L32 26 Z" fill="url(#toyHighlight)" opacity="0.45" />

                      <!-- Dual Jet Engines under wings -->
                      <rect x="19" y="32" width="4.5" height="11" rx="2" fill="#FAF7F2" stroke="#3C1318" />
                      <rect x="40.5" y="32" width="4.5" height="11" rx="2" fill="#FAF7F2" stroke="#3C1318" />
                      <circle cx="21.2" cy="43" r="1.6" fill="#00F2FE" />
                      <circle cx="42.7" cy="43" r="1.6" fill="#00F2FE" />

                      <!-- Tail Stabilizers -->
                      <path d="M32 44 L44 54 L38 56 L32 50 L26 56 L20 54 Z" fill="url(#cyanWingGrad)" />

                      <!-- Fuselage Body -->
                      <path d="M32 4 C36 4, 38 12, 38 32 C38 48, 35 56, 32 58 C29 56, 26 48, 26 32 C26 12, 28 4, 32 4 Z" fill="url(#fuselageGrad)" stroke="#00F2FE" stroke-width="1.3" />
                      <path d="M32 6 C34 6, 35 12, 35 30 C35 44, 34 50, 32 52 C31 50, 30.5 44, 30.5 30 Z" fill="url(#toyHighlight)" opacity="0.35" />

                      <!-- Cockpit Glass Canopy -->
                      <path d="M32 10 C34.5 10, 35.5 14, 35.5 18 C35.5 21, 34 22, 32 22 C30 22, 28.5 21, 28.5 18 C28.5 14, 29.5 10, 32 10 Z" fill="url(#goldCockpit)" stroke="#FFFFFF" stroke-width="0.8" />
                      <path d="M32 11 C33.5 11, 34 13, 34 16 Z" fill="#FFFFFF" opacity="0.75" />

                      <!-- Tail Fin -->
                      <path d="M32 42 L32 56 L34.5 55 Z" fill="#FAF7F2" opacity="0.95" />
                    </svg>
                  </div>
                </div>
              `;
              return el;
            }

            el.innerHTML = `
              <div class="bg-[#111111]/85 backdrop-blur-md px-5 py-2.5 rounded-lg border border-white/20 shadow-2xl flex items-center space-x-3 whitespace-nowrap">
                <span class="w-3 h-3 rounded-full bg-[#00F2FE] shadow-[0_0_12px_#00F2FE]"></span>
                <span class="text-base font-extrabold text-white tracking-tight font-sans">${d.text}</span>
              </div>
            `;
            return el;
          }}
        />

        {/* Subtle Ambient Blend at bottom */}
        <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-[#FAF7F2] to-transparent pointer-events-none z-20"></div>
      </div>

    </div>
  );
}
