/**
 * GIS & Pemetaan Sempadan Pelabuhan Kemaman — Phase 2 (X-2).
 *
 * Handles:
 * 1. Port Limit & MRA Polygon validation (X-2).
 * 2. Point-in-polygon coordinate checking for port berths & anchorages.
 * 3. ISPS Zone security perimeter classification.
 *
 * Pure domain logic (Rule G7, G4).
 */

export interface GeoCoordinate {
  latitude: number
  longitude: number
}

export interface PortZonePolygon {
  zoneId: string
  zoneCode: string
  nameMs: string
  nameEn: string
  ispsLevel: 1 | 2 | 3
  polygonCoordinates: GeoCoordinate[]
  areaKm2: number
  governingAuthority: string
}

/**
 * Standard boundary coordinates of Had Pelabuhan Kemaman (Port Limits).
 */
export const KEMAMAN_PORT_LIMITS_POLYGON: GeoCoordinate[] = [
  { latitude: 4.28, longitude: 103.44 },
  { latitude: 4.28, longitude: 103.58 },
  { latitude: 4.21, longitude: 103.58 },
  { latitude: 4.21, longitude: 103.44 },
]

/**
 * Point-in-polygon Ray Casting Algorithm to verify if a vessel/activity is within Kemaman Port Limits (X-2).
 */
export function isPointInsidePolygon(point: GeoCoordinate, polygon: GeoCoordinate[]): boolean {
  let inside = false
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].latitude
    const yi = polygon[i].longitude
    const xj = polygon[j].latitude
    const yj = polygon[j].longitude

    const intersect =
      yi > point.longitude !== yj > point.longitude &&
      point.latitude < ((xj - xi) * (point.longitude - yi)) / (yj - yi) + xi
    if (intersect) inside = !inside
  }
  return inside
}

/**
 * Validates vessel activity position against Kemaman statutory port limits.
 */
export function validateVesselPortLimitPosition(
  position: GeoCoordinate,
  customPolygon = KEMAMAN_PORT_LIMITS_POLYGON,
): {
  isWithinPortLimits: boolean
  statusMs: string
  statusEn: string
} {
  const isInside = isPointInsidePolygon(position, customPolygon)

  if (isInside) {
    return {
      isWithinPortLimits: true,
      statusMs: 'Lokasi koordinat berada di dalam Had Pelabuhan Kemaman yang diwartakan.',
      statusEn: 'Coordinate location is within gazetted Kemaman Port Limits.',
    }
  }

  return {
    isWithinPortLimits: false,
    statusMs: 'Lokasi koordinat berada di luar kawasan Had Pelabuhan Kemaman (Zon Perairan Antarabangsa / Terbuka).',
    statusEn: 'Coordinate location is outside Kemaman Port Limits (International / Open Waters Zone).',
  }
}
