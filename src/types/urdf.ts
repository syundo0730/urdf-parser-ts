/**
 * URDF type definitions
 */

// 3D vector
export interface Vector3 {
  x: number;
  y: number;
  z: number;
}

// Link inertial properties
export interface Inertial {
  origin?: {
    xyz?: Vector3;
    rpy?: Vector3;
  };
  mass?: {
    value: number;
  };
  inertia?: {
    ixx: number;
    ixy: number;
    ixz: number;
    iyy: number;
    iyz: number;
    izz: number;
  };
}

// Visual element
export interface Visual {
  name?: string;
  origin?: {
    xyz?: Vector3;
    rpy?: Vector3;
  };
  geometry?: Geometry;
  material?: Material;
}

// Collision element
export interface Collision {
  name?: string;
  origin?: {
    xyz?: Vector3;
    rpy?: Vector3;
  };
  geometry?: Geometry;
}

// Geometry
export interface Geometry {
  box?: {
    size?: Vector3;
  };
  cylinder?: {
    radius?: number;
    length?: number;
  };
  sphere?: {
    radius?: number;
  };
  mesh?: {
    filename?: string;
    scale?: Vector3;
  };
}

// Material
export interface Material {
  name?: string;
  color?: {
    rgba?: [number, number, number, number];
  };
  texture?: {
    filename?: string;
  };
}

// Link
export interface Link {
  name: string;
  inertial?: Inertial;
  visuals: Visual[];
  collisions: Collision[];
}

// Joint limits
export interface JointLimit {
  lower?: number;
  upper?: number;
  effort?: number;
  velocity?: number;
}

// Joint dynamics
export interface JointDynamics {
  damping?: number;
  friction?: number;
}

// Calibration
export interface Calibration {
  rising?: number;
  falling?: number;
}

// Mimic
export interface Mimic {
  joint: string;
  multiplier?: number;
  offset?: number;
}

// Joint
export interface Joint {
  name: string;
  type: 'revolute' | 'continuous' | 'prismatic' | 'fixed' | 'floating' | 'planar';
  origin?: {
    xyz?: Vector3;
    rpy?: Vector3;
  };
  parent: {
    link: string;
  };
  child: {
    link: string;
  };
  axis?: {
    xyz?: Vector3;
  };
  limit?: JointLimit;
  dynamics?: JointDynamics;
  calibration?: Calibration;
  mimic?: Mimic;
}

// Transmission
export interface Transmission {
  name?: string;
  type?: string;
  joint?: {
    name: string;
  };
  actuator?: {
    name: string;
    mechanicalReduction?: number;
  };
}

// Root element <robot> in URDF, represented as Robot interface for better usability
export interface Robot {
  name: string;
  links: Link[]; // Changed from Link | Link[] to Link[]
  joints: Joint[]; // Changed from Joint | Joint[] to Joint[] (undefined の可能性をなくしました)
  transmissions: Transmission[]; // Changed from Transmission | Transmission[] to Transmission[] (undefined の可能性をなくしました)
  materials: Material[]; // Changed from Material | Material[] to Material[] (undefined の可能性をなくしました)
}
