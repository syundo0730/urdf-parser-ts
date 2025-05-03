import { Vector3 } from '../types/urdf';

/**
 * Convert string to number
 * @param value String to convert
 * @param defaultValue Default value
 * @returns Number
 */
export function parseNumber(value: string | undefined, defaultValue: number = 0): number {
  if (value === undefined) {
    return defaultValue;
  }
  const num = parseFloat(value);
  return isNaN(num) ? defaultValue : num;
}

/**
 * Convert space-separated string to Vector3
 * @param value Space-separated string "x y z"
 * @param defaultValue Default value
 * @returns Vector3 object
 */
export function parseVector3(
  value: string | undefined,
  defaultValue: Vector3 = { x: 0, y: 0, z: 0 }
): Vector3 {
  if (value === undefined) {
    return defaultValue;
  }

  const parts = value.trim().split(/\s+/);
  if (parts.length !== 3) {
    return defaultValue;
  }

  return {
    x: parseNumber(parts[0], defaultValue.x),
    y: parseNumber(parts[1], defaultValue.y),
    z: parseNumber(parts[2], defaultValue.z),
  };
}

/**
 * Convert RGBA color string to array
 * @param value Space-separated string "r g b a"
 * @param defaultValue Default value
 * @returns Array of [r, g, b, a]
 */
export function parseRGBA(
  value: string | undefined,
  defaultValue: [number, number, number, number] = [0, 0, 0, 1]
): [number, number, number, number] {
  if (value === undefined) {
    return defaultValue;
  }

  const parts = value.trim().split(/\s+/);
  if (parts.length !== 4) {
    return defaultValue;
  }

  return [
    parseNumber(parts[0], defaultValue[0]),
    parseNumber(parts[1], defaultValue[1]),
    parseNumber(parts[2], defaultValue[2]),
    parseNumber(parts[3], defaultValue[3]),
  ];
}

/**
 * Check if an element is an array, and convert it to array if not
 * @param element Element or array of elements
 * @returns Always an array
 */
export function ensureArray<T>(element: T | T[] | undefined): T[] {
  if (element === undefined) {
    return [];
  }
  return Array.isArray(element) ? element : [element];
}

/**
 * Get attribute value from XML object
 * @param obj XML object
 * @param attributeName Attribute name
 * @returns Attribute value
 */
export function getAttribute(obj: any, attributeName: string): string | undefined {
  if (!obj || !obj['@_' + attributeName]) {
    return undefined;
  }
  return obj['@_' + attributeName];
}
