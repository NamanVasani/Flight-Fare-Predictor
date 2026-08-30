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
    city: "Bengaluru",
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
  {
    code: "AMD",
    city: "Ahmedabad",
    name: "Sardar Vallabhbhai Patel International",
    country: "India",
    lat: 23.0734,
    lng: 72.6266,
    badge: "AMD • Ahmedabad"
  },
  {
    code: "DXB",
    city: "Dubai",
    name: "Dubai International Airport",
    country: "UAE",
    lat: 25.2532,
    lng: 55.3657,
    badge: "DXB • Dubai"
  },
  {
    code: "LHR",
    city: "London",
    name: "London Heathrow Airport",
    country: "United Kingdom",
    lat: 51.4700,
    lng: -0.4543,
    badge: "LHR • London"
  },
  {
    code: "SIN",
    city: "Singapore",
    name: "Singapore Changi Airport",
    country: "Singapore",
    lat: 1.3644,
    lng: 103.9915,
    badge: "SIN • Singapore"
  },
  {
    code: "JFK",
    city: "New York",
    name: "John F. Kennedy International",
    country: "USA",
    lat: 40.6413,
    lng: -73.7781,
    badge: "JFK • New York"
  }
];

export function getAirportByCode(code) {
  return AIRPORTS.find(a => a.code === code) || AIRPORTS[0];
}

export function calculateDistanceKm(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the earth in km
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
