import { XMLBuilder, XMLParser } from 'fast-xml-parser';

import {
  Collision,
  Geometry,
  Inertial,
  Joint,
  Link,
  Material,
  Robot,
  Transmission,
  Visual,
} from '../types/urdf';
import { ensureArray, getAttribute, parseNumber, parseRGBA, parseVector3 } from '../utils/parsing';

/**
 * Options for URDF parser
 */
export interface URDFParserOptions {
  /**
   * Base path for resolving relative paths
   */
  basePath?: string;
  /**
   * Options for XML parser
   */
  xmlParserOptions?: any;
}

/**
 * URDF Parser class
 */
export class URDFParser {
  private parser: XMLParser;
  private builder: XMLBuilder;
  private options: URDFParserOptions;

  /**
   * Constructor
   * @param options Parser options
   */
  constructor(options: URDFParserOptions = {}) {
    this.options = options;
    const defaultXmlOptions = {
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      allowBooleanAttributes: true,
      format: true,
      indentBy: '  ',
    };

    this.parser = new XMLParser({
      ...defaultXmlOptions,
      ...options.xmlParserOptions,
    });
    this.builder = new XMLBuilder({
      ...defaultXmlOptions,
      ...options.xmlParserOptions,
    });
  }

  /**
   * Parse URDF text
   * @param text URDF text
   * @returns Parsed URDF object
   */
  parse(text: string): Robot {
    const parsed = this.parser.parse(text);
    return this.processURDF(parsed);
  }

  /**
   * Generate URDF from parsed object
   * @param parsed Parsed object
   * @returns URDF object
   */
  private processURDF(parsed: any): Robot {
    if (!parsed.robot) {
      throw new Error('Invalid URDF: Missing robot element');
    }

    const robot = parsed.robot;

    // Process elements, ensuring they are always arrays
    const links = this.processLinks(robot.link || []);
    const joints = this.processJoints(robot.joint || []);
    const materials = this.processMaterials(robot.material || []);
    const transmissions = this.processTransmissions(robot.transmission || []);

    return {
      name: getAttribute(robot, 'name') || '',
      links: links,
      joints: joints,
      materials: materials,
      transmissions: transmissions,
    };
  }

  /**
   * Process links
   * @param linkData Link data
   * @returns Processed link array
   */
  private processLinks(linkData: any): Link[] {
    const links: Link[] = [];
    const linkArray = ensureArray(linkData);

    for (const link of linkArray) {
      const name = getAttribute(link, 'name');
      if (!name) {
        console.warn('Link without name found, skipping');
        continue;
      }

      const processedLink: Link = {
        name,
        visuals: [], // Initialize with empty array
        collisions: [], // Initialize with empty array
      };

      // Process inertial element
      if (link.inertial) {
        processedLink.inertial = this.processInertial(link.inertial);
      }

      // Process visual element
      if (link.visual) {
        processedLink.visuals = ensureArray(link.visual).map(v => this.processVisual(v));
      }

      // Process collision element
      if (link.collision) {
        processedLink.collisions = ensureArray(link.collision).map(c => this.processCollision(c));
      }

      links.push(processedLink);
    }

    return links;
  }

  /**
   * Process inertial element
   * @param inertialData Inertial data
   * @returns Processed inertial object
   */
  private processInertial(inertialData: any): Inertial {
    const inertial: Inertial = {};

    // Process origin
    if (inertialData.origin) {
      inertial.origin = {};

      if (getAttribute(inertialData.origin, 'xyz')) {
        inertial.origin.xyz = parseVector3(getAttribute(inertialData.origin, 'xyz'));
      }

      if (getAttribute(inertialData.origin, 'rpy')) {
        inertial.origin.rpy = parseVector3(getAttribute(inertialData.origin, 'rpy'));
      }
    }

    // Process mass
    if (inertialData.mass) {
      inertial.mass = {
        value: parseNumber(getAttribute(inertialData.mass, 'value'), 0),
      };
    }

    // Process inertia tensor
    if (inertialData.inertia) {
      inertial.inertia = {
        ixx: parseNumber(getAttribute(inertialData.inertia, 'ixx'), 0),
        ixy: parseNumber(getAttribute(inertialData.inertia, 'ixy'), 0),
        ixz: parseNumber(getAttribute(inertialData.inertia, 'ixz'), 0),
        iyy: parseNumber(getAttribute(inertialData.inertia, 'iyy'), 0),
        iyz: parseNumber(getAttribute(inertialData.inertia, 'iyz'), 0),
        izz: parseNumber(getAttribute(inertialData.inertia, 'izz'), 0),
      };
    }

    return inertial;
  }

  /**
   * Process visual element
   * @param visualData Visual data
   * @returns Processed visual object
   */
  private processVisual(visualData: any): Visual {
    const visual: Visual = {};

    // Process name
    const name = getAttribute(visualData, 'name');
    if (name) {
      visual.name = name;
    }

    // Process origin
    if (visualData.origin) {
      visual.origin = {};

      if (getAttribute(visualData.origin, 'xyz')) {
        visual.origin.xyz = parseVector3(getAttribute(visualData.origin, 'xyz'));
      }

      if (getAttribute(visualData.origin, 'rpy')) {
        visual.origin.rpy = parseVector3(getAttribute(visualData.origin, 'rpy'));
      }
    }

    // Process geometry
    if (visualData.geometry) {
      visual.geometry = this.processGeometry(visualData.geometry);
    }

    // Process material
    if (visualData.material) {
      visual.material = this.processMaterial(visualData.material);
    }

    return visual;
  }

  /**
   * Process collision element
   * @param collisionData Collision data
   * @returns Processed collision object
   */
  private processCollision(collisionData: any): Collision {
    const collision: Collision = {};

    // Process name
    const name = getAttribute(collisionData, 'name');
    if (name) {
      collision.name = name;
    }

    // Process origin
    if (collisionData.origin) {
      collision.origin = {};

      if (getAttribute(collisionData.origin, 'xyz')) {
        collision.origin.xyz = parseVector3(getAttribute(collisionData.origin, 'xyz'));
      }

      if (getAttribute(collisionData.origin, 'rpy')) {
        collision.origin.rpy = parseVector3(getAttribute(collisionData.origin, 'rpy'));
      }
    }

    // Process geometry
    if (collisionData.geometry) {
      collision.geometry = this.processGeometry(collisionData.geometry);
    }

    return collision;
  }

  /**
   * Process geometry
   * @param geometryData Geometry data
   * @returns Processed geometry object
   */
  private processGeometry(geometryData: any): Geometry {
    const geometry: Geometry = {};

    // Process box
    if (geometryData.box) {
      geometry.box = {
        size: parseVector3(getAttribute(geometryData.box, 'size')),
      };
    }

    // Process cylinder
    if (geometryData.cylinder) {
      geometry.cylinder = {
        radius: parseNumber(getAttribute(geometryData.cylinder, 'radius')),
        length: parseNumber(getAttribute(geometryData.cylinder, 'length')),
      };
    }

    // Process sphere
    if (geometryData.sphere) {
      geometry.sphere = {
        radius: parseNumber(getAttribute(geometryData.sphere, 'radius')),
      };
    }

    // Process mesh
    if (geometryData.mesh) {
      geometry.mesh = {
        filename: getAttribute(geometryData.mesh, 'filename'),
      };

      const scale = getAttribute(geometryData.mesh, 'scale');
      if (scale) {
        geometry.mesh.scale = parseVector3(scale, { x: 1, y: 1, z: 1 });
      }
    }

    return geometry;
  }

  /**
   * Process material
   * @param materialData Material data
   * @returns Processed material object
   */
  private processMaterial(materialData: any): Material {
    const material: Material = {};

    // Process name
    const name = getAttribute(materialData, 'name');
    if (name) {
      material.name = name;
    }

    // Process color
    if (materialData.color) {
      material.color = {
        rgba: parseRGBA(getAttribute(materialData.color, 'rgba')),
      };
    }

    // Process texture
    if (materialData.texture) {
      material.texture = {
        filename: getAttribute(materialData.texture, 'filename'),
      };
    }

    return material;
  }

  /**
   * Process joints
   * @param jointData Joint data
   * @returns Processed joint array
   */
  private processJoints(jointData: any): Joint[] {
    const joints: Joint[] = [];
    const jointArray = ensureArray(jointData);

    for (const joint of jointArray) {
      const name = getAttribute(joint, 'name');
      const type = getAttribute(joint, 'type');

      if (!name || !type) {
        console.warn('Joint without name or type found, skipping');
        continue;
      }

      // Validate parent and child links
      if (
        !joint.parent ||
        !joint.child ||
        !getAttribute(joint.parent, 'link') ||
        !getAttribute(joint.child, 'link')
      ) {
        console.warn(`Joint ${name} missing parent or child link, skipping`);
        continue;
      }

      const processedJoint: Joint = {
        name,
        type: type as any,
        parent: {
          link: getAttribute(joint.parent, 'link')!,
        },
        child: {
          link: getAttribute(joint.child, 'link')!,
        },
      };

      // Process origin
      if (joint.origin) {
        processedJoint.origin = {};

        if (getAttribute(joint.origin, 'xyz')) {
          processedJoint.origin.xyz = parseVector3(getAttribute(joint.origin, 'xyz'));
        }

        if (getAttribute(joint.origin, 'rpy')) {
          processedJoint.origin.rpy = parseVector3(getAttribute(joint.origin, 'rpy'));
        }
      }

      // Process axis
      if (joint.axis) {
        processedJoint.axis = {
          xyz: parseVector3(getAttribute(joint.axis, 'xyz'), { x: 1, y: 0, z: 0 }),
        };
      }

      // Process limits
      if (joint.limit) {
        processedJoint.limit = {
          lower: parseNumber(getAttribute(joint.limit, 'lower')),
          upper: parseNumber(getAttribute(joint.limit, 'upper')),
          effort: parseNumber(getAttribute(joint.limit, 'effort')),
          velocity: parseNumber(getAttribute(joint.limit, 'velocity')),
        };
      }

      // Process dynamics
      if (joint.dynamics) {
        processedJoint.dynamics = {
          damping: parseNumber(getAttribute(joint.dynamics, 'damping')),
          friction: parseNumber(getAttribute(joint.dynamics, 'friction')),
        };
      }

      // Process calibration
      if (joint.calibration) {
        processedJoint.calibration = {
          rising: parseNumber(getAttribute(joint.calibration, 'rising')),
          falling: parseNumber(getAttribute(joint.calibration, 'falling')),
        };
      }

      // Process mimic
      if (joint.mimic) {
        const mimicJoint = getAttribute(joint.mimic, 'joint');
        if (mimicJoint) {
          processedJoint.mimic = {
            joint: mimicJoint,
            multiplier: parseNumber(getAttribute(joint.mimic, 'multiplier'), 1),
            offset: parseNumber(getAttribute(joint.mimic, 'offset'), 0),
          };
        }
      }

      joints.push(processedJoint);
    }

    return joints;
  }

  /**
   * Process materials (root level)
   * @param materialData Material data
   * @returns Processed material array
   */
  private processMaterials(materialData: any): Material[] {
    const materials: Material[] = [];
    const materialArray = ensureArray(materialData);

    for (const material of materialArray) {
      materials.push(this.processMaterial(material));
    }

    return materials;
  }

  /**
   * Process transmissions
   * @param transmissionData Transmission data
   * @returns Processed transmission array
   */
  private processTransmissions(transmissionData: any): Transmission[] {
    const transmissions: Transmission[] = [];
    const transmissionArray = ensureArray(transmissionData);

    for (const transmission of transmissionArray) {
      const processedTransmission: Transmission = {};

      // Process name
      const name = getAttribute(transmission, 'name');
      if (name) {
        processedTransmission.name = name;
      }

      // Process type (type is a element, not an attribute)
      if (transmission.type) {
        // If type is an object with inner text content
        if (typeof transmission.type === 'object' && transmission.type['#text']) {
          processedTransmission.type = transmission.type['#text'];
        }
        // If type is directly a string
        else if (typeof transmission.type === 'string') {
          processedTransmission.type = transmission.type;
        }
        // For XML parser that extracts text content differently
        else {
          processedTransmission.type = transmission.type.toString();
        }
      }

      // Process joint
      if (transmission.joint) {
        processedTransmission.joint = {
          name: getAttribute(transmission.joint, 'name') || '',
        };
      }

      // Process actuator
      if (transmission.actuator) {
        processedTransmission.actuator = {
          name: getAttribute(transmission.actuator, 'name') || '',
        };

        // Process mechanicalReduction (element, not attribute)
        if (transmission.actuator.mechanicalReduction) {
          // If mechanicalReduction is an object with inner text content
          if (
            typeof transmission.actuator.mechanicalReduction === 'object' &&
            transmission.actuator.mechanicalReduction['#text']
          ) {
            processedTransmission.actuator.mechanicalReduction = parseNumber(
              transmission.actuator.mechanicalReduction['#text']
            );
          }
          // If mechanicalReduction is directly a string or number
          else if (
            typeof transmission.actuator.mechanicalReduction === 'string' ||
            typeof transmission.actuator.mechanicalReduction === 'number'
          ) {
            processedTransmission.actuator.mechanicalReduction = parseNumber(
              transmission.actuator.mechanicalReduction.toString()
            );
          }
        }
      }
      transmissions.push(processedTransmission);
    }

    return transmissions;
  }
}
