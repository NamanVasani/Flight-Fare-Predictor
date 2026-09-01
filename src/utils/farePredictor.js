// src/utils/farePredictor.js
import { calculateDistanceKm } from '../data/airports';

// Dynamic API_BASE — uses Render URL if configured, otherwise falls back to local port 5001 or fallback mock
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? "http://localhost:5001"
  : "https://flight-fare-predictor-ggn7.onrender.com";

// Only these cities exist in the trained dataset — anything else is flagged as unsupported
const KNOWN_CITIES = new Set(["Delhi", "Kolkata", "Mumbai", "Chennai", "Banglore", "Cochin", "Hyderabad"]);

export async function predictCategorizedFlightFares(source, destination, date) {
  let sourceCity = source.city === "Bengaluru" ? "Banglore" : source.city;
  let destCity = destination.city === "Bengaluru" ? "Banglore" : destination.city;

  if (!KNOWN_CITIES.has(sourceCity) || !KNOWN_CITIES.has(destCity)) {
    return { lowTier: [], mediumTier: [], highTier: [], unsupportedRoute: true };
  }

  const parsedDate = date ? new Date(date) : null;
  const isValidDate = parsedDate instanceof Date && !isNaN(parsedDate);
  const day = isValidDate ? parsedDate.getDate() : 15;
  const month = isValidDate ? parsedDate.getMonth() + 1 : 9;

  try {
    const res = await fetch(`${API_BASE}/api/search`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        source: sourceCity,
        destination: destCity,
        day,
        month,
      }),
    });

    if (!res.ok) throw new Error("Search API call failed");
    const data = await res.json();
    if (!data.success || !Array.isArray(data.flights)) throw new Error("Invalid API response format");

    const flights = data.flights.map(f => ({
      id: f.id,
      code: f.logo,
      airline: f.airline,
      depTime: f.depTime,
      arrTime: f.arrTime,
      duration: f.duration,
      stopsLabel: f.stops,
      formattedPrice: f.price,
      numericPrice: f.numericPrice,
      tier: f.predictedTier || f.tier,
      isOfflineFallback: false,
    }));

    return {
      lowTier: flights.filter(f => f.tier === "Low"),
      mediumTier: flights.filter(f => f.tier === "Medium"),
      highTier: flights.filter(f => f.tier === "High" || f.tier === "Premium"),
      unsupportedRoute: false,
      isOfflineFallback: false
    };
  } catch (err) {
    console.warn("Backend API unavailable, displaying offline estimate:", err);
    return fallbackCategorizedFares(source, destination);
  }
}

export function predictFlightFares(source, destination, dateString) {
  const dist = calculateDistanceKm(source.lat, source.lng, destination.lat, destination.lng);
  const isInternational = dist > 2200;

  const slots = [
    { dep: "06:15 AM", label: "Early Morning", trend: "lowest", airline: "IndiGo", code: "6E" },
    { dep: "10:30 AM", label: "Morning", trend: "best_value", airline: "Vistara", code: "UK" },
    { dep: "04:45 PM", label: "Evening", trend: "rising_soon", airline: "Air India", code: "AI" },
    { dep: "08:20 PM", label: "Night", trend: "stable", airline: "SpiceJet", code: "SG" }
  ];

  const flights = slots.map((slot, idx) => {
    const baseFare = (isInternational ? 11500 : 2600) + (dist * 3.4);
    const finalFareRaw = Math.round(baseFare * (1 + idx * 0.1));

    return {
      id: `FL-${idx + 101}`,
      airline: slot.airline,
      logo: slot.code,
      flightNo: `${slot.code}-${100 + idx * 12}`,
      depTime: slot.dep,
      arrTime: "08:30 AM",
      duration: `${Math.floor(dist / 400)}h ${(dist % 400) % 60}m`,
      stops: dist > 3500 ? "1 Stop" : "Non-stop",
      predictedFare: `₹ ${finalFareRaw.toLocaleString('en-IN')}`,
      numericFare: finalFareRaw,
      confidence: "Heuristic Estimate",
      trend: slot.trend,
      aircraft: "Airbus A320neo"
    };
  });

  return {
    flights,
    recommendation: {
      status: "HEURISTIC ESTIMATE (OFFLINE)",
      badgeBg: "bg-amber-100 text-amber-800 border border-amber-300",
      message: "Distance-based estimate active (Model offline).",
      confidence: "Distance Heuristic"
    },
    distanceKm: dist,
    isHeuristicEstimate: true
  };
}

function fallbackCategorizedFares(source, destination) {
  const lowTier = [
    { id: '6e-1', code: '6E', logoBg: '#0B2545', airline: 'IndiGo', depTime: '06:20 AM', arrTime: '08:10 AM', duration: '1h 50m', stopsLabel: 'Non-stop', formattedPrice: '₹ 4,290', isOfflineFallback: true, offlineNotice: 'Offline Estimate — Model Unavailable' },
    { id: 'sg-1', code: 'SG', logoBg: '#D90429', airline: 'SpiceJet', depTime: '09:15 PM', arrTime: '11:10 PM', duration: '1h 55m', stopsLabel: 'Non-stop', formattedPrice: '₹ 4,800', isOfflineFallback: true, offlineNotice: 'Offline Estimate — Model Unavailable' }
  ];
  const mediumTier = [
    { id: 'uk-1', code: 'UK', logoBg: '#4A154B', airline: 'Vistara', depTime: '07:30 AM', arrTime: '12:40 PM', duration: '5h 10m', stopsLabel: '1 Stop', formattedPrice: '₹ 8,650', isOfflineFallback: true, offlineNotice: 'Offline Estimate — Model Unavailable' },
    { id: 'ai-1', code: 'AI', logoBg: '#E63946', airline: 'Air India', depTime: '11:00 AM', arrTime: '04:30 PM', duration: '5h 30m', stopsLabel: '1 Stop', formattedPrice: '₹ 9,240', isOfflineFallback: true, offlineNotice: 'Offline Estimate — Model Unavailable' },
    { id: 'op-1', code: 'OP', logoBg: '#FF5A16', airline: 'Akasa Air', depTime: '03:20 PM', arrTime: '08:10 PM', duration: '4h 50m', stopsLabel: '1 Stop', formattedPrice: '₹ 11,500', isOfflineFallback: true, offlineNotice: 'Offline Estimate — Model Unavailable' },
    { id: 'g8-1', code: 'G8', logoBg: '#0070BA', airline: 'Go First', depTime: '08:45 PM', arrTime: '02:25 AM', duration: '5h 40m', stopsLabel: '1 Stop', formattedPrice: '₹ 12,780', isOfflineFallback: true, offlineNotice: 'Offline Estimate — Model Unavailable' }
  ];
  const highTier = [
    { id: 'ai-2', code: 'AI', logoBg: '#E63946', airline: 'Air India', depTime: '06:55 AM', arrTime: '06:15 PM', duration: '11h 20m', stopsLabel: '2 Stops', formattedPrice: '₹ 19,850', isOfflineFallback: true, offlineNotice: 'Offline Estimate — Model Unavailable' },
    { id: 'uk-2', code: 'UK', logoBg: '#451343', airline: 'Vistara', depTime: '10:40 AM', arrTime: '09:30 PM', duration: '10h 50m', stopsLabel: '2 Stops', formattedPrice: '₹ 21,600', isOfflineFallback: true, offlineNotice: 'Offline Estimate — Model Unavailable' }
  ];

  return { lowTier, mediumTier, highTier, unsupportedRoute: false, isOfflineFallback: true, offlineNotice: "Offline Estimate — Model Unavailable" };
}
