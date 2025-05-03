# urdf-parser

A URDF (Unified Robot Description Format) parser library for TypeScript. It uses fast-xml-parser to parse URDF files and converts them into type-safe JavaScript objects.

## Features

- Fast XML parsing using fast-xml-parser
- Type-safe URDF manipulation with TypeScript type definitions
- Support for URDF elements including links, joints, visuals, collisions, materials, etc.
- Utility functions for parsing vector and numerical data

## Installation

```
npm install urdf-parser
```

or

```
yarn add urdf-parser
```

## Usage

### Basic Usage

```typescript
import fs from 'fs';
import { URDFParser } from 'urdf-parser';

// Load URDF file
const urdfContent = fs.readFileSync('path/to/robot.urdf', 'utf-8');

// Initialize parser
const parser = new URDFParser();

// Parse URDF
const robot = parser.parse(urdfContent);

// Use the results
console.log(`Robot name: ${robot.name}`);
console.log(`Number of links: ${robot.links.length}`);
console.log(`Number of joints: ${robot.joints.length}`);
```

### Parser Options

```typescript
const parser = new URDFParser({
  // Base path for resolving relative paths
  basePath: './models',
  
  // Options to pass to fast-xml-parser
  xmlParserOptions: {
    // Customize as needed
  }
});
```

## Type Definitions

This library is written in TypeScript and provides complete type definitions for URDF structures:

```typescript
// Robot (root element in URDF)
export interface Robot {
  name: string;
  links: Link[];
  joints: Joint[];
  transmissions: Transmission[];
  materials: Material[];
}

// Link
export interface Link {
  name: string;
  inertial?: Inertial;
  visuals: Visual[];
  collisions: Collision[];
}
```

For detailed type definitions of each component (Link, Joint, Visual, Collision, Material, Geometry, etc.), please refer to the [type definition file](https://github.com/syundo0730/urdf-parser-ts/blob/main/src/types/urdf.ts).

## Examples

Refer to the [sample code](https://github.com/syundo0730/urdf-parser-ts/blob/main/samples/parseExample.ts). To run the sample:

```
# Build TypeScript
npm run build

# Run the sample
node dist/examples/parseExample.js
```

## License

MIT

## Contributing

Pull requests and feature requests are welcome. For major changes, please open an issue first to discuss what you would like to change. 
