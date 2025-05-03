// URDF Parser Tests
import * as fs from 'fs';
import * as path from 'path';

import { URDFParser } from '../src/parser/urdfParser';
import { Robot } from '../src/types/urdf';
// Types import removed as it's not used directly in the tests

describe('URDFParser', () => {
  // Sample URDF for testing
  const sampleUrdfPath = path.join(__dirname, '../samples/sample_robot.urdf');
  const sampleUrdf = fs.readFileSync(sampleUrdfPath, 'utf8');

  let parser: URDFParser;
  let result: Robot;

  beforeEach(() => {
    parser = new URDFParser();
    result = parser.parse(sampleUrdf);
  });

  describe('Basic Parsing Functionality', () => {
    test('Can parse a valid URDF file', () => {
      expect(result).toBeDefined();
      expect(result.name).toBe('simple_robot');
    });

    test('Correctly parses robot name', () => {
      expect(result.name).toBe('simple_robot');
    });

    test('Throws an error for invalid XML', () => {
      const invalidXml = '<robot></invalid>';
      expect(() => parser.parse(invalidXml)).toThrow();
    });

    test('Throws an error when robot element is not found', () => {
      const noRobotXml = '<not_a_robot></not_a_robot>';
      expect(() => parser.parse(noRobotXml)).toThrow('Invalid URDF: Missing robot element');
    });
  });

  describe('Link Parsing', () => {
    test('Correctly parses links', () => {
      expect(result.links).toBeDefined();
      expect(result.links.length).toBe(7); // base_link, right_wheel, left_wheel, caster, arm, gripper, slider

      // Check the first link structure
      const baseLink = result.links.find(link => link.name === 'base_link');
      expect(baseLink).toBeDefined();
      expect(baseLink?.name).toBe('base_link');
    });

    test('Correctly parses link visual elements', () => {
      const baseLink = result.links.find(link => link.name === 'base_link');

      expect(baseLink).toBeDefined();
      expect(baseLink?.visuals).toBeDefined();
      expect(Array.isArray(baseLink?.visuals)).toBe(true);

      // Check the first visual element
      if (baseLink) {
        expect(baseLink.visuals.length).toBeGreaterThan(0);
        const firstVisual = baseLink.visuals[0];
        expect(firstVisual.geometry).toBeDefined();
        if (firstVisual.geometry) {
          expect(firstVisual.geometry.box).toBeDefined();
          expect(firstVisual.geometry.box?.size).toEqual({ x: 0.2, y: 0.2, z: 0.1 });
        }
        expect(firstVisual.material).toBeDefined();
        expect(firstVisual.material?.name).toBe('blue');
      }

      // Check for material from root level materials
      const blueMaterial = result.materials.find(m => m.name === 'blue');
      expect(blueMaterial).toBeDefined();
      expect(blueMaterial?.color).toBeDefined();
      expect(blueMaterial?.color?.rgba).toEqual([0, 0, 1, 1]);
    });

    test('Correctly parses link collision elements', () => {
      const baseLink = result.links.find(link => link.name === 'base_link');

      expect(baseLink).toBeDefined();
      expect(baseLink?.collisions).toBeDefined();
      expect(Array.isArray(baseLink?.collisions)).toBe(true);

      // Check the first collision element
      if (baseLink) {
        expect(baseLink.collisions.length).toBeGreaterThan(0);
        const firstCollision = baseLink.collisions[0];
        expect(firstCollision.geometry).toBeDefined();
        if (firstCollision.geometry) {
          expect(firstCollision.geometry.box).toBeDefined();
          expect(firstCollision.geometry.box?.size).toEqual({ x: 0.2, y: 0.2, z: 0.1 });
        }
      }
    });

    test('Correctly parses inertial data', () => {
      const baseLink = result.links.find(link => link.name === 'base_link');

      expect(baseLink).toBeDefined();
      expect(baseLink?.inertial).toBeDefined();

      if (baseLink) {
        const inertial = baseLink.inertial;
        expect(inertial).toBeDefined();

        if (inertial) {
          expect(inertial.mass).toBeDefined();
          expect(inertial.mass?.value).toBe(1.0);

          expect(inertial.inertia).toBeDefined();
          expect(inertial.inertia?.ixx).toBe(0.1);
          expect(inertial.inertia?.ixy).toBe(0);
          expect(inertial.inertia?.ixz).toBe(0);
          expect(inertial.inertia?.iyy).toBe(0.1);
          expect(inertial.inertia?.iyz).toBe(0);
          expect(inertial.inertia?.izz).toBe(0.1);

          expect(inertial.origin).toBeDefined();
          expect(inertial.origin?.xyz).toEqual({ x: 0, y: 0, z: 0 });
          expect(inertial.origin?.rpy).toEqual({ x: 0, y: 0, z: 0 });
        }
      }
    });

    test('Correctly parses mesh geometry', () => {
      const armLink = result.links.find(link => link.name === 'arm');
      expect(armLink).toBeDefined();

      if (armLink) {
        expect(armLink.visuals.length).toBeGreaterThan(0);
        const visual = armLink.visuals[0];
        expect(visual.geometry?.mesh).toBeDefined();
        expect(visual.geometry?.mesh?.filename).toBe('meshes/arm.stl');
        expect(visual.geometry?.mesh?.scale).toEqual({ x: 0.1, y: 0.1, z: 0.1 });
      }
    });
  });

  describe('Joint Parsing', () => {
    test('Correctly parses joints', () => {
      expect(result.joints).toBeDefined();

      expect(Array.isArray(result.joints)).toBe(true);
      expect(result.joints.length).toBe(6); // base_to_right_wheel, base_to_left_wheel, base_to_caster, base_to_arm, arm_to_gripper, base_to_slider

      // Check the first joint structure
      const rightWheelJoint = result.joints.find(joint => joint.name === 'base_to_right_wheel');
      expect(rightWheelJoint).toBeDefined();
      expect(rightWheelJoint?.type).toBe('continuous');
      expect(rightWheelJoint?.parent.link).toBe('base_link');
      expect(rightWheelJoint?.child.link).toBe('right_wheel');
    });

    test('Correctly parses joint axes', () => {
      const rightWheelJoint = result.joints.find(joint => joint.name === 'base_to_right_wheel');

      expect(rightWheelJoint).toBeDefined();
      expect(rightWheelJoint?.axis).toBeDefined();

      if (rightWheelJoint && rightWheelJoint.axis) {
        expect(rightWheelJoint.axis.xyz).toEqual({ x: 0, y: 1, z: 0 });
      }
    });

    test('Correctly parses joint origins', () => {
      const rightWheelJoint = result.joints.find(joint => joint.name === 'base_to_right_wheel');

      expect(rightWheelJoint).toBeDefined();
      expect(rightWheelJoint?.origin).toBeDefined();

      if (rightWheelJoint && rightWheelJoint.origin) {
        expect(rightWheelJoint.origin.xyz).toEqual({ x: 0, y: -0.15, z: 0 });
        expect(rightWheelJoint.origin.rpy).toEqual({ x: 0, y: 0, z: 0 });
      }
    });

    test('Correctly parses joint dynamics', () => {
      const rightWheelJoint = result.joints.find(joint => joint.name === 'base_to_right_wheel');

      expect(rightWheelJoint).toBeDefined();
      expect(rightWheelJoint?.dynamics).toBeDefined();

      if (rightWheelJoint && rightWheelJoint.dynamics) {
        expect(rightWheelJoint.dynamics.damping).toBe(0.1);
        expect(rightWheelJoint.dynamics.friction).toBe(0.1);
      }
    });

    test('Correctly parses mimic joints', () => {
      const leftWheelJoint = result.joints.find(joint => joint.name === 'base_to_left_wheel');

      expect(leftWheelJoint).toBeDefined();
      expect(leftWheelJoint?.mimic).toBeDefined();

      if (leftWheelJoint && leftWheelJoint.mimic) {
        expect(leftWheelJoint.mimic.joint).toBe('base_to_right_wheel');
        expect(leftWheelJoint.mimic.multiplier).toBe(1);
        expect(leftWheelJoint.mimic.offset).toBe(0);
      }
    });

    test('Correctly parses revolute joint with limits', () => {
      const armJoint = result.joints.find(joint => joint.name === 'base_to_arm');

      expect(armJoint).toBeDefined();
      expect(armJoint?.type).toBe('revolute');
      expect(armJoint?.limit).toBeDefined();

      if (armJoint && armJoint.limit) {
        expect(armJoint.limit.lower).toBe(-1.57);
        expect(armJoint.limit.upper).toBe(1.57);
        expect(armJoint.limit.effort).toBe(100);
        expect(armJoint.limit.velocity).toBe(1.0);
      }
    });

    test('Correctly parses prismatic joint', () => {
      const sliderJoint = result.joints.find(joint => joint.name === 'base_to_slider');

      expect(sliderJoint).toBeDefined();
      expect(sliderJoint?.type).toBe('prismatic');
      expect(sliderJoint?.limit).toBeDefined();

      if (sliderJoint && sliderJoint.limit) {
        expect(sliderJoint.limit.lower).toBe(0);
        expect(sliderJoint.limit.upper).toBe(0.2);
      }
    });

    test('Correctly parses joint calibration', () => {
      const armJoint = result.joints.find(joint => joint.name === 'base_to_arm');

      expect(armJoint).toBeDefined();
      expect(armJoint?.calibration).toBeDefined();

      if (armJoint && armJoint.calibration) {
        expect(armJoint.calibration.rising).toBe(0.1);
        expect(armJoint.calibration.falling).toBe(0.0);
      }
    });
  });

  describe('Material Parsing', () => {
    test('Correctly parses root-level materials', () => {
      expect(result.materials).toBeDefined();
      expect(Array.isArray(result.materials)).toBe(true);
      expect(result.materials.length).toBe(5); // blue, black, gray, red, textured

      // check blue material
      const blueMaterial = result.materials.find(m => m.name === 'blue');
      expect(blueMaterial).toBeDefined();
      expect(blueMaterial?.color?.rgba).toEqual([0, 0, 1, 1]);

      // check textured material
      const texturedMaterial = result.materials.find(m => m.name === 'textured');
      expect(texturedMaterial).toBeDefined();
      expect(texturedMaterial?.texture).toBeDefined();
      expect(texturedMaterial?.texture?.filename).toBe('textures/default.png');

      // check base_link material
      const baseLink = result.links.find(link => link.name === 'base_link');
      expect(baseLink).toBeDefined();

      if (baseLink) {
        expect(baseLink.visuals.length).toBeGreaterThan(0);
        const firstVisual = baseLink.visuals[0];
        expect(firstVisual.material).toBeDefined();
        expect(firstVisual.material?.name).toBe('blue');
      }

      // check left_wheel material
      const leftWheel = result.links.find(link => link.name === 'left_wheel');
      expect(leftWheel).toBeDefined();

      if (leftWheel) {
        expect(leftWheel.visuals.length).toBeGreaterThan(0);
        const firstVisual = leftWheel.visuals[0];
        expect(firstVisual.material).toBeDefined();
        expect(firstVisual.material?.name).toBe('black');
      }
    });
  });

  describe('Transmission Parsing', () => {
    test('Correctly parses transmissions', () => {
      expect(result.transmissions).toBeDefined();

      expect(Array.isArray(result.transmissions)).toBe(true);
      expect(result.transmissions.length).toBe(2); // wheel_trans と arm_trans

      // check wheel_trans
      const wheelTrans = result.transmissions.find(t => t.name === 'wheel_trans');
      expect(wheelTrans).toBeDefined();
      expect(wheelTrans?.type).toBe('transmission_interface/SimpleTransmission');
      expect(wheelTrans?.joint?.name).toBe('base_to_right_wheel');
      expect(wheelTrans?.actuator?.name).toBe('wheel_motor');
      expect(wheelTrans?.actuator?.mechanicalReduction).toBe(10);

      // check arm_trans
      const armTrans = result.transmissions.find(t => t.name === 'arm_trans');
      expect(armTrans).toBeDefined();
      expect(armTrans?.type).toBe('transmission_interface/SimpleTransmission');
      expect(armTrans?.joint?.name).toBe('base_to_arm');
      expect(armTrans?.actuator?.name).toBe('arm_motor');
      expect(armTrans?.actuator?.mechanicalReduction).toBe(50);
    });
  });

  describe('Geometry Parsing', () => {
    test('Correctly parses box geometry', () => {
      const minimalUrdf = `
        <robot name="test">
          <link name="link">
            <visual>
              <geometry>
                <box size="1 2 3"/>
              </geometry>
            </visual>
          </link>
        </robot>
      `;

      const result = parser.parse(minimalUrdf);
      const links = result.links;
      expect(links[0].visuals.length).toBe(1);
      const visual = links[0].visuals[0];

      expect(visual).toBeDefined();
      if (visual.geometry) {
        expect(visual.geometry.box).toBeDefined();
        expect(visual.geometry.box?.size).toEqual({ x: 1, y: 2, z: 3 });
      }
    });

    test('Correctly parses cylinder geometry', () => {
      const minimalUrdf = `
        <robot name="test">
          <link name="link">
            <visual>
              <geometry>
                <cylinder radius="0.5" length="2"/>
              </geometry>
            </visual>
          </link>
        </robot>
      `;

      const result = parser.parse(minimalUrdf);
      const links = result.links;
      expect(links[0].visuals.length).toBe(1);
      const visual = links[0].visuals[0];

      expect(visual).toBeDefined();
      if (visual.geometry) {
        expect(visual.geometry.cylinder).toBeDefined();
        expect(visual.geometry.cylinder?.radius).toBe(0.5);
        expect(visual.geometry.cylinder?.length).toBe(2);
      }
    });

    test('Correctly parses sphere geometry', () => {
      const minimalUrdf = `
        <robot name="test">
          <link name="link">
            <visual>
              <geometry>
                <sphere radius="0.75"/>
              </geometry>
            </visual>
          </link>
        </robot>
      `;

      const result = parser.parse(minimalUrdf);
      const links = result.links;
      expect(links[0].visuals.length).toBe(1);
      const visual = links[0].visuals[0];

      expect(visual).toBeDefined();
      if (visual.geometry) {
        expect(visual.geometry.sphere).toBeDefined();
        expect(visual.geometry.sphere?.radius).toBe(0.75);
      }
    });

    test('Correctly parses mesh geometry', () => {
      const minimalUrdf = `
        <robot name="test">
          <link name="link">
            <visual>
              <geometry>
                <mesh filename="package://model.stl" scale="1 1 1"/>
              </geometry>
            </visual>
          </link>
        </robot>
      `;

      const result = parser.parse(minimalUrdf);
      const links = result.links;
      expect(links[0].visuals.length).toBe(1);
      const visual = links[0].visuals[0];

      expect(visual).toBeDefined();
      if (visual.geometry) {
        expect(visual.geometry.mesh).toBeDefined();
        expect(visual.geometry.mesh?.filename).toBe('package://model.stl');
        expect(visual.geometry.mesh?.scale).toEqual({ x: 1, y: 1, z: 1 });
      }
    });

    test('Correctly parses material references', () => {
      // Check the link material reference to root-level material
      const baseLink = result.links.find(link => link.name === 'base_link');
      expect(baseLink).toBeDefined();

      if (baseLink) {
        expect(baseLink.visuals.length).toBeGreaterThan(0);
        const firstVisual = baseLink.visuals[0];
        expect(firstVisual.material).toBeDefined();
        expect(firstVisual.material?.name).toBe('blue');

        // Find the corresponding root material
        const blueMaterial = result.materials.find(m => m.name === 'blue');
        expect(blueMaterial).toBeDefined();
        expect(blueMaterial?.color?.rgba).toEqual([0, 0, 1, 1]);
      }

      // Another link material reference check
      const leftWheel = result.links.find(link => link.name === 'left_wheel');
      expect(leftWheel).toBeDefined();

      if (leftWheel) {
        expect(leftWheel.visuals.length).toBeGreaterThan(0);
        const firstVisual = leftWheel.visuals[0];
        expect(firstVisual.material).toBeDefined();
        expect(firstVisual.material?.name).toBe('black');

        // Find the corresponding root material
        const blackMaterial = result.materials.find(m => m.name === 'black');
        expect(blackMaterial).toBeDefined();
        expect(blackMaterial?.color?.rgba).toEqual([0, 0, 0, 1]);
      }
    });
  });

  describe('Parser Options', () => {
    test('Parser instance can be created with options', () => {
      // Simpler test - just check that parser can be created with options
      const customOptions = {
        basePath: '/custom/path',
        xmlParserOptions: {
          attributeNamePrefix: '_custom_',
        },
      };

      // Create parser instance
      const customParser = new URDFParser(customOptions);

      // Check that parser was created successfully
      expect(customParser).toBeDefined();
      expect(customParser).toBeInstanceOf(URDFParser);
    });
  });
});
