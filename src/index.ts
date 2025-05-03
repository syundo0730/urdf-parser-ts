/**
 * URDF (Unified Robot Description Format) Parser
 * A library for parsing URDF files using fast-xml-parser
 */

// Parser
export { URDFParser, URDFParserOptions } from './parser/urdfParser';

// Type definitions
export * from './types/urdf';

// Utility functions
export { parseVector3, parseNumber, parseRGBA, ensureArray, getAttribute } from './utils/parsing';
