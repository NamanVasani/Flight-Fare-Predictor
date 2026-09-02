export const AIRPORTS = [
  {
    code: "DEL",
    city: "Delhi",
    name: "Indira Gandhi International",
    country: "India",
    lat: 28.5562,
    lng: 77.1000,
    badge: "DEL • Delhi"
  },
  {
    code: "BLR",
    city: "Banglore", // Matched to dataset encoding "Banglore"
    name: "Kempegowda International",
    country: "India",
    lat: 13.1986,
    lng: 77.7066,
    badge: "BLR • Bengaluru"
  },
  {
    code: "BOM",
    city: "Mumbai",
    name: "Chhatrapati Shivaji Maharaj International",
    country: "India",
    lat: 19.0896,
    lng: 72.8656,
    badge: "BOM • Mumbai"
  },
  {
    code: "CCU",
    city: "Kolkata",
    name: "Netaji Subhash Chandra Bose International",
    country: "India",
    lat: 22.6520,
    lng: 88.4463,
    badge: "CCU • Kolkata"
  },
  {
    code: "MAA",
    city: "Chennai",
    name: "Chennai International",
    country: "India",
    lat: 12.9941,
    lng: 80.1709,
    badge: "MAA • Chennai"
  },
  {
    code: "COK",
    city: "Cochin",
    name: "Cochin International",
    country: "India",
    lat: 10.1520,
    lng: 76.4019,
    badge: "COK • Cochin"
  },
  {
    code: "HYD",
    city: "Hyderabad",
    name: "Rajiv Gandhi International",
    country: "India",
    lat: 17.2403,
    lng: 78.4294,
    badge: "HYD • Hyderabad"
  },
];

export function getAirportByCode(code) {
  return AIRPORTS.find(a => a.code === code) || AIRPORTS[0];
}

export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * (Math.PI / 180);
  const dLon = (lon2 - lon1) * (Math.PI / 180);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * (Math.PI / 180)) *
    Math.cos(lat2 * (Math.PI / 180)) *
    Math.sin(dLon / 2) *
    Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}
