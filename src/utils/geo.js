import * as THREE from 'three';

/**
 * Converts Latitude & Longitude to 3D Cartesian Vector3 on sphere of given radius.
 * @param {number} lat - Latitude in degrees
 * @param {number} lng - Longitude in degrees
 * @param {number} radius - Sphere radius
 * @returns {THREE.Vector3}
 */
export function latLngToVector3(lat, lng, radius = 2.2) {
  const phi = (90 - lat) * (Math.PI / 180);
  const theta = (lng + 180) * (Math.PI / 180);

  const x = -(radius * Math.sin(phi) * Math.cos(theta));
  const z = radius * Math.sin(phi) * Math.sin(theta);
  const y = radius * Math.cos(phi);

  return new THREE.Vector3(x, y, z);
}

/**
 * Calculates geographic midpoint vector between two lat/lng points.
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @param {number} radius 
 * @returns {THREE.Vector3}
 */
export function getRouteMidpointVector(lat1, lon1, lat2, lon2, radius = 2.2) {
  const v1 = latLngToVector3(lat1, lon1, radius);
  const v2 = latLngToVector3(lat2, lon2, radius);
  
  const mid = new THREE.Vector3().addVectors(v1, v2).multiplyScalar(0.5);
  if (mid.lengthSq() < 0.001) {
    // If antipodal, offset slightly
    mid.copy(v1).add(new THREE.Vector3(0, 0.5, 0));
  }
  return mid.normalize().multiplyScalar(radius);
}

/**
 * Creates 3D Quadratic Bezier Curve points between two lat/lng locations.
 * @param {number} lat1 
 * @param {number} lon1 
 * @param {number} lat2 
 * @param {number} lon2 
 * @param {number} radius 
 * @param {number} numPoints 
 * @returns {THREE.Vector3[]}
 */
export function createRouteArcPoints(lat1, lon1, lat2, lon2, radius = 2.2, numPoints = 64) {
  const p0 = latLngToVector3(lat1, lon1, radius);
  const p2 = latLngToVector3(lat2, lon2, radius);

  const distance = p0.distanceTo(p2);
  // Curve height scales with distance
  const arcHeight = Math.min(Math.max(distance * 0.35, 0.3), 1.2);

  const mid = new THREE.Vector3().addVectors(p0, p2).multiplyScalar(0.5);
  const p1 = mid.clone().normalize().multiplyScalar(radius + arcHeight);

  const curve = new THREE.QuadraticBezierCurve3(p0, p1, p2);
  return curve.getPoints(numPoints);
}
