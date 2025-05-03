import * as fs from 'fs';
import * as path from 'path';

import { URDFParser } from '../src/parser/urdfParser';
import { Joint, Link, Material, Robot, Transmission } from '../src/types/urdf';

/**
 * Example of parsing a URDF file
 */
function parseURDFExample() {
  try {
    // Path to the sample URDF file (assuming it's in the samples directory)
    const urdfFilePath = path.join(__dirname, 'sample_robot.urdf');

    // Check if the file exists
    if (!fs.existsSync(urdfFilePath)) {
      console.error(`Error: Sample URDF file not found at ${urdfFilePath}`);
      console.log(
        'Note: Please place a URDF file (e.g., sample_robot.urdf) in the samples directory.'
      );
      return;
    }

    // Read the URDF file
    const urdfContent = fs.readFileSync(urdfFilePath, 'utf-8');

    // Initialize the parser
    const parser = new URDFParser();

    // Parse the URDF
    const robot: Robot = parser.parse(urdfContent);

    // Display the results
    console.log('Parse result:');
    console.log(`Robot name: ${robot.name}`);

    // Link information
    console.log(`\nLinks (${robot.links.length}):`);
    robot.links.forEach((link: Link) => {
      console.log(`- Link: ${link.name}`);

      // Display number of visual elements
      if (link.visuals.length > 0) {
        console.log(`  Visual elements: ${link.visuals.length}`);

        // If there is a mesh geometry, display it
        link.visuals.forEach((visual, i) => {
          if (visual.geometry?.mesh) {
            console.log(`  Visual ${i + 1} has mesh: ${visual.geometry.mesh.filename}`);
          }
        });
      }
    });

    // Joint information
    console.log(`\nJoints (${robot.joints.length}):`);
    robot.joints.forEach((joint: Joint) => {
      console.log(`- Joint: ${joint.name} (Type: ${joint.type})`);
      console.log(`  Parent link: ${joint.parent.link}, Child link: ${joint.child.link}`);

      // Display joint limit information
      if (joint.limit) {
        console.log(
          `  Limits: lower=${joint.limit.lower}, upper=${joint.limit.upper}, effort=${joint.limit.effort}, velocity=${joint.limit.velocity}`
        );
      }

      // Display calibration information
      if (joint.calibration) {
        console.log(
          `  Calibration: rising=${joint.calibration.rising}, falling=${joint.calibration.falling}`
        );
      }

      // Display mimic information
      if (joint.mimic) {
        console.log(
          `  Mimics joint: ${joint.mimic.joint} (multiplier=${joint.mimic.multiplier}, offset=${joint.mimic.offset})`
        );
      }
    });

    // Display material information
    console.log(`\nMaterials (${robot.materials.length}):`);
    robot.materials.forEach((material: Material) => {
      console.log(`- Material: ${material.name}`);
      if (material.color) {
        console.log(`  Color: rgba(${material.color.rgba?.join(', ')})`);
      }
      if (material.texture) {
        console.log(`  Texture: ${material.texture.filename}`);
      }
    });

    // Display transmission information
    console.log(`\nTransmissions (${robot.transmissions.length}):`);
    robot.transmissions.forEach((transmission: Transmission) => {
      console.log(`- Transmission: ${transmission.name}`);
      console.log(`  Type: ${transmission.type}`);
      if (transmission.joint) {
        console.log(`  Joint: ${transmission.joint.name}`);
      }
      if (transmission.actuator) {
        console.log(
          `  Actuator: ${transmission.actuator.name}, Reduction: ${transmission.actuator.mechanicalReduction}`
        );
      }
    });

    // Save the complete result as JSON
    fs.writeFileSync(
      path.join(__dirname, './parsed_result.json'),
      JSON.stringify(robot, null, 2),
      'utf-8'
    );
    console.log('\nDetailed results have been saved to samples/parsed_result.json.');
  } catch (error) {
    console.error('An error occurred:', error);
  }
}

// Execute
parseURDFExample();
