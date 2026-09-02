// src/utils/farePredictor.js

// Dynamic API_BASE — uses Render URL if configured, otherwise falls back to local port 5001 or fallback mock
const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
  ? "http://localhost:5001"
  : "https://flight-fare-predictor-ggn7.onrender.com";

// Only these cities exist in the trained dataset — anything else is flagged as unsupported
const KNOWN_CITIES = new Set(["Delhi", "Kolkata", "Mumbai", "Chennai", "Banglore", "Cochin", "Hyderabad"]);

// Default background colors for airline logo badges (used when backend doesn't supply one)
const AIRLINE_COLORS = {
  "IndiGo": "#0B2545",
  "SpiceJet": "#D90429",
  "Vistara": "#4A154B",
  "Air India": "#E63946",
  "Akasa Air": "#FF6B35",
  "Go First": "#0077B6",
};

// Parses an "hh:mm AM/PM" time string into a 24-hour integer hour (falls back to 0)
function parseHourFromTime(timeStr) {
  if (!timeStr || typeof timeStr !== "string") return 0;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*([AaPp][Mm])$/);
  if (!match) return 0;
  let hour = parseInt(match[1], 10) % 12;
  const isPM = match[3].toUpperCase() === "PM";
  if (isPM) hour += 12;
  return hour;
}

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

    // Map and sort all flights strictly by numericPrice ascending to ensure 100% price tier consistency
    const allFlights = data.flights.map(f => ({
      id: f.id,
      code: f.logo,
      logoBg: AIRLINE_COLORS[f.airline] || "#3C1318",
      airline: f.airline,
      depTime: f.depTime,
      depHour: parseHourFromTime(f.depTime),
      arrTime: f.arrTime,
      duration: f.duration,
      stopsLabel: f.stops,
      formattedPrice: f.price,
      numericPrice: f.numericPrice,
      predictedTier: f.predictedTier || f.tier,
      isOfflineFallback: false,
    })).sort((a, b) => a.numericPrice - b.numericPrice);

    // Monotonic Price Partitioning: Low Pricing < Medium Pricing < High Pricing
    const n = allFlights.length;
    let lowTier = [];
    let mediumTier = [];
    let highTier = [];

    if (n <= 3) {
      lowTier = allFlights.slice(0, 1);
      mediumTier = allFlights.slice(1, 2);
      highTier = allFlights.slice(2);
    } else {
      const lowCount = Math.max(2, Math.floor(n * 0.3));
      const mediumCount = Math.max(2, Math.floor(n * 0.35));
      
      lowTier = allFlights.slice(0, lowCount);
      mediumTier = allFlights.slice(lowCount, lowCount + mediumCount);
      highTier = allFlights.slice(lowCount + mediumCount);
    }

    return {
      lowTier,
      mediumTier,
      highTier,
      unsupportedRoute: false,
      isOfflineFallback: false
    };
  } catch (err) {
    console.warn("Backend API unavailable, displaying offline estimate:", err);
    return fallbackCategorizedFares(source, destination);
  }
}

function fallbackCategorizedFares(source, destination) {
  const lowTier = [
    { id: '6e-1', code: '6E', logoBg: '#0B2545', airline: 'IndiGo', depTime: '06:20 AM', arrTime: '08:10 AM', duration: '1h 50m', stopsLabel: 'Non-stop', formattedPrice: '₹ 4,290', isOfflineFallback: true, offlineNotice: 'Offline Estimate — Model Unavailable' },
    { id: 'sg-1', code: 'SG', logoBg: '#D90429', airline: 'SpiceJet', depTime: '09:15 PM', arrTime: '11:10 PM', duration: '1h 55m', stopsLabel: 'Non-stop', formattedPrice: '₹ 4,800', isOfflineFallback: true, offlineNotice: 'Offline Estimate — Model Unavailable' }
  ];
  const mediumTier = [
    { id: 'uk-1', code: 'UK', logoBg: '#4A154B', airline: 'Vistara', depTime: '07:30 AM', arrTime: '12:40 PM', duration: '5h 10m', stopsLabel: '1 Stop', formattedPrice: '₹ 8,650', isOfflineFallback: true, offlineNotice: 'Offline Estimate — Model Unavailable' },
    { id: 'ai-1', code: 'AI', logoBg: '#E63946', airline: 'Air India', depTime: '11:00 AM', arrTime: '04:30 PM', duration: '5h 30m', stopsLabel: '1 Stop', formattedPrice: '₹ 9,240', isOfflineFallback: true, offlineNotice: 'Offline Estimate — Model Unavailable' },
    { id: 'op-1', code: 'OP', logoBg: '#FF5A16', airline: 'Akasa Air', depTime: '03:20 PM', arrTime: '08:10 PM', duration: '4h 50m', stopsLabel: '1 Stop', formattedPrice: '₹ 11,500', isOfflineFallback: true, offlineNotice: 'Offline Estimate — Model Unavailable' }
  ];
  const highTier = [
    { id: 'g8-1', code: 'G8', logoBg: '#0070BA', airline: 'Go First', depTime: '08:45 PM', arrTime: '02:25 AM', duration: '5h 40m', stopsLabel: '1 Stop', formattedPrice: '₹ 12,780', isOfflineFallback: true, offlineNotice: 'Offline Estimate — Model Unavailable' },
    { id: 'ai-2', code: 'AI', logoBg: '#E63946', airline: 'Air India', depTime: '06:55 AM', arrTime: '06:15 PM', duration: '11h 20m', stopsLabel: '2 Stops', formattedPrice: '₹ 19,850', isOfflineFallback: true, offlineNotice: 'Offline Estimate — Model Unavailable' },
    { id: 'uk-2', code: 'UK', logoBg: '#451343', airline: 'Vistara', depTime: '10:40 AM', arrTime: '09:30 PM', duration: '10h 50m', stopsLabel: '2 Stops', formattedPrice: '₹ 21,600', isOfflineFallback: true, offlineNotice: 'Offline Estimate — Model Unavailable' }
  ];

  const withDepHour = (tier) => tier.map(f => ({ ...f, depHour: parseHourFromTime(f.depTime) }));

  return {
    lowTier: withDepHour(lowTier),
    mediumTier: withDepHour(mediumTier),
    highTier: withDepHour(highTier),
    unsupportedRoute: false,
    isOfflineFallback: true,
    offlineNotice: "Offline Estimate — Model Unavailable"
  };
}
