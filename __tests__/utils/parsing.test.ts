// Parsing Utilities Tests
import {
  ensureArray,
  getAttribute,
  parseNumber,
  parseRGBA,
  parseVector3,
} from '../../src/utils/parsing';

describe('Parsing Utilities', () => {
  describe('parseNumber', () => {
    test('correctly parses numeric strings', () => {
      expect(parseNumber('42')).toBe(42);
      expect(parseNumber('3.14')).toBe(3.14);
      expect(parseNumber('-1.5')).toBe(-1.5);
    });

    test('uses default value for undefined input', () => {
      expect(parseNumber(undefined, 10)).toBe(10);
    });

    test('uses default value for non-numeric strings', () => {
      expect(parseNumber('not-a-number', 5)).toBe(5);
    });
  });

  describe('parseVector3', () => {
    test('correctly parses space-separated values', () => {
      const result = parseVector3('1.0 2.0 3.0');
      expect(result).toEqual({ x: 1.0, y: 2.0, z: 3.0 });
    });

    test('uses default value for undefined input', () => {
      const defaultValue = { x: 0, y: 0, z: 0 };
      const result = parseVector3(undefined, defaultValue);
      expect(result).toEqual(defaultValue);
    });

    test('parses each element even from malformed input', () => {
      const result = parseVector3('1.0 abc 3.0');
      expect(result.x).toBe(1.0);
      expect(result.y).toBe(0); // abc cannot be parsed, so 0 is used
      expect(result.z).toBe(3.0);
    });

    test('uses default value when there are not enough elements', () => {
      const defaultValue = { x: 0, y: 0, z: 0 };
      const result = parseVector3('1.0 2.0', defaultValue);
      expect(result).toEqual(defaultValue);
    });
  });

  describe('parseRGBA', () => {
    test('correctly parses space-separated RGBA values', () => {
      const result = parseRGBA('0.1 0.2 0.3 1.0');
      expect(result).toEqual([0.1, 0.2, 0.3, 1.0]);
    });

    test('uses default value for undefined input', () => {
      const defaultValue = [1, 1, 1, 1] as [number, number, number, number];
      const result = parseRGBA(undefined, defaultValue);
      expect(result).toEqual(defaultValue);
    });

    test('uses default value when there are not enough elements', () => {
      const defaultValue = [1, 1, 1, 1] as [number, number, number, number];
      const result = parseRGBA('0.1 0.2 0.3', defaultValue);
      expect(result).toEqual(defaultValue);
    });
  });

  describe('ensureArray', () => {
    test('wraps non-array values in an array', () => {
      expect(ensureArray('item')).toEqual(['item']);
      expect(ensureArray(42)).toEqual([42]);
      expect(ensureArray({ key: 'value' })).toEqual([{ key: 'value' }]);
    });

    test('returns the array if input is already an array', () => {
      const array = [1, 2, 3];
      expect(ensureArray(array)).toBe(array);
    });

    test('returns an empty array for undefined input', () => {
      expect(ensureArray(undefined)).toEqual([]);
    });
  });

  describe('getAttribute', () => {
    test('correctly retrieves an attribute', () => {
      const obj = { '@_attr': 'value' };
      expect(getAttribute(obj, 'attr')).toBe('value');
    });

    test('returns undefined for non-existent attributes', () => {
      const obj = { '@_other': 'value' };
      expect(getAttribute(obj, 'missing')).toBeUndefined();
    });

    test('handles undefined objects', () => {
      expect(getAttribute(undefined, 'attr')).toBeUndefined();
    });

    test('handles null objects', () => {
      expect(getAttribute(null, 'attr')).toBeUndefined();
    });
  });
});
