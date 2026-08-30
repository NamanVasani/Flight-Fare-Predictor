export type FlightInput = {
  from: string;
  to: string;
  date: string;
};

export type FlightRow = {
  id: string;
  airline: string;
  code: string;
  flightNumber: string;
  departureTime: string;
  departureCode: string;
  arrivalTime: string;
  arrivalCode: string;
  duration: string;
  stops: string;
  cabin: string;
  fare: number;
  logoBg: string;
  logoColor: string;
};

export type PriceGroup = {
  title: string;
  subtitle: string;
  icon: string;
  type: "low" | "medium" | "high";
  badgeBg: string;
  badgeColor: string;
  flights: FlightRow[];
};

export type Prediction = {
  from: string;
  to: string;
  date: string;
  distanceKm: number;
  recommendedFare: number;
  category: "Low" | "Medium" | "High" | "Premium";
  groups: PriceGroup[];
};

const CITY_CODES: Record<string, string> = {
  "Ahmedabad": "AMD",
  "Delhi": "DEL",
  "New Delhi": "DEL",
  "Mumbai": "BOM",
  "Bengaluru": "BLR",
  "Bangalore": "BLR",
  "Kolkata": "CCU",
  "Chennai": "MAA",
  "Hyderabad": "HYD",
  "Singapore": "SIN",
  "Dubai": "DXB",
  "London": "LHR",
  "Cochin": "COK",
};

const CITY_COORDS: Record<string, { lat: number; lon: number }> = {
  "Ahmedabad": { lat: 23.03, lon: 72.59 },
  "Bengaluru": { lat: 12.97, lon: 77.59 },
  "Chennai": { lat: 13.08, lon: 80.27 },
  "Delhi": { lat: 28.61, lon: 77.21 },
  "Dubai": { lat: 25.20, lon: 55.27 },
  "Hyderabad": { lat: 17.39, lon: 78.49 },
  "Kolkata": { lat: 22.57, lon: 88.36 },
  "London": { lat: 51.47, lon: -0.45 },
  "Mumbai": { lat: 19.08, lon: 72.88 },
  "Singapore": { lat: 1.35, lon: 103.82 },
  "Cochin": { lat: 9.93, lon: 76.26 },
};

function calculateDistanceKm(c1Name: string, c2Name: string): number {
  const c1 = CITY_COORDS[c1Name] || { lat: 20, lon: 78 };
  const c2 = CITY_COORDS[c2Name] || { lat: 25, lon: 80 };
  const R = 6371;
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLon = ((c2.lon - c1.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.max(350, Math.round(R * c));
}

export async function predictFlight(input: FlightInput): Promise<Prediction> {
  await new Promise((res) => setTimeout(res, 250));

  const fromCode = CITY_CODES[input.from] || "DEP";
  const toCode = CITY_CODES[input.to] || "ARR";
  const distance = calculateDistanceKm(input.from, input.to);

  // Scaling factor based on route distance
  const mult = distance > 2500 ? 2.4 : 1.0;

  const lowFlights: FlightRow[] = [
    {
      id: "6e-101",
      airline: "IndiGo",
      code: "6E",
      flightNumber: "6E-249",
      departureTime: "06:20 AM",
      departureCode: fromCode,
      arrivalTime: "08:10 AM",
      arrivalCode: toCode,
      duration: "1h 50m",
      stops: "Non-stop",
      cabin: "Economy",
      fare: Math.round((4289 * mult) / 10) * 10,
      logoBg: "#0b2545",
      logoColor: "#ffffff",
    },
    {
      id: "sg-202",
      airline: "SpiceJet",
      code: "SG",
      flightNumber: "SG-381",
      departureTime: "09:15 PM",
      departureCode: fromCode,
      arrivalTime: "11:10 PM",
      arrivalCode: toCode,
      duration: "1h 55m",
      stops: "Non-stop",
      cabin: "Economy",
      fare: Math.round((4799 * mult) / 10) * 10,
      logoBg: "#e63946",
      logoColor: "#ffffff",
    },
  ];

  const mediumFlights: FlightRow[] = [
    {
      id: "uk-303",
      airline: "Vistara",
      code: "UK",
      flightNumber: "UK-944",
      departureTime: "07:30 AM",
      departureCode: fromCode,
      arrivalTime: "09:20 AM",
      arrivalCode: toCode,
      duration: "1h 50m",
      stops: "Non-stop",
      cabin: "Economy",
      fare: Math.round((8650 * mult) / 10) * 10,
      logoBg: "#4a154b",
      logoColor: "#ffd700",
    },
    {
      id: "ai-404",
      airline: "Air India",
      code: "AI",
      flightNumber: "AI-812",
      departureTime: "11:00 AM",
      departureCode: fromCode,
      arrivalTime: "01:05 PM",
      arrivalCode: toCode,
      duration: "2h 05m",
      stops: "Non-stop",
      cabin: "Economy",
      fare: Math.round((9240 * mult) / 10) * 10,
      logoBg: "#d90429",
      logoColor: "#ffffff",
    },
    {
      id: "qp-505",
      airline: "Akasa Air",
      code: "QP",
      flightNumber: "QP-1102",
      departureTime: "03:20 PM",
      departureCode: fromCode,
      arrivalTime: "05:20 PM",
      arrivalCode: toCode,
      duration: "2h 00m",
      stops: "Non-stop",
      cabin: "Economy",
      fare: Math.round((11499 * mult) / 10) * 10,
      logoBg: "#ff6b35",
      logoColor: "#ffffff",
    },
    {
      id: "g8-606",
      airline: "Go First",
      code: "G8",
      flightNumber: "G8-334",
      departureTime: "08:45 PM",
      departureCode: fromCode,
      arrivalTime: "10:45 PM",
      arrivalCode: toCode,
      duration: "2h 00m",
      stops: "Non-stop",
      cabin: "Economy",
      fare: Math.round((12780 * mult) / 10) * 10,
      logoBg: "#0077b6",
      logoColor: "#ffffff",
    },
  ];

  const highFlights: FlightRow[] = [
    {
      id: "ai-707",
      airline: "Air India",
      code: "AI",
      flightNumber: "AI-466",
      departureTime: "06:55 AM",
      departureCode: fromCode,
      arrivalTime: "08:55 AM",
      arrivalCode: toCode,
      duration: "2h 00m",
      stops: "Non-stop",
      cabin: "Economy",
      fare: Math.round((19850 * mult) / 10) * 10,
      logoBg: "#d90429",
      logoColor: "#ffffff",
    },
    {
      id: "uk-808",
      airline: "Vistara",
      code: "UK",
      flightNumber: "UK-992",
      departureTime: "10:40 AM",
      departureCode: fromCode,
      arrivalTime: "12:30 PM",
      arrivalCode: toCode,
      duration: "1h 50m",
      stops: "Non-stop",
      cabin: "Economy",
      fare: Math.round((21600 * mult) / 10) * 10,
      logoBg: "#4a154b",
      logoColor: "#ffd700",
    },
  ];

  const groups: PriceGroup[] = [
    {
      title: "Low Pricing",
      subtitle: "Best deals for you",
      icon: "🏷️",
      type: "low",
      badgeBg: "#e6f4ea",
      badgeColor: "#137333",
      flights: lowFlights,
    },
    {
      title: "Medium Pricing",
      subtitle: "Great options with more choices",
      icon: "📊",
      type: "medium",
      badgeBg: "#fef7e0",
      badgeColor: "#b06000",
      flights: mediumFlights,
    },
    {
      title: "High Pricing",
      subtitle: "Premium options",
      icon: "💎",
      type: "high",
      badgeBg: "#fce8e6",
      badgeColor: "#c5221f",
      flights: highFlights,
    },
  ];

  return {
    from: input.from,
    to: input.to,
    date: input.date,
    distanceKm: distance,
    recommendedFare: lowFlights[0].fare,
    category: "Low",
    groups,
  };
}
