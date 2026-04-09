// server/src/utils/geo.ts
// Lightweight geo utilities: point-in-polygon and Haversine distance.
/**
 * Ray-casting algorithm to determine if a lat/lng point is inside a GeoJSON Polygon.
 */
export const isPointInPolygon = (lat, lng, boundary) => {
    const ring = boundary.coordinates[0];
    if (ring === undefined)
        return false;
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const coordI = ring[i];
        const coordJ = ring[j];
        if (coordI === undefined || coordJ === undefined)
            continue;
        const [xi, yi] = coordI;
        const [xj, yj] = coordJ;
        const intersects = (yi > lat) !== (yj > lat) &&
            lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
        if (intersects)
            inside = !inside;
    }
    return inside;
};
/**
 * Haversine formula — returns the great-circle distance (km) between two coordinates.
 */
export const haversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6_371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat / 2) ** 2 +
        Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};
const toRad = (deg) => (deg * Math.PI) / 180;
//# sourceMappingURL=geo.js.map