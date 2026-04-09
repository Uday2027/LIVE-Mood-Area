type GeoJsonPolygon = {
    type: 'Polygon';
    coordinates: Array<Array<[number, number]>>;
};
/**
 * Ray-casting algorithm to determine if a lat/lng point is inside a GeoJSON Polygon.
 */
export declare const isPointInPolygon: (lat: number, lng: number, boundary: GeoJsonPolygon) => boolean;
/**
 * Haversine formula — returns the great-circle distance (km) between two coordinates.
 */
export declare const haversineDistance: (lat1: number, lon1: number, lat2: number, lon2: number) => number;
export {};
//# sourceMappingURL=geo.d.ts.map