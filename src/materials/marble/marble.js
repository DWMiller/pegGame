const colors = [
  '#0332FD',
  '#C30FDE',
  '#0DCE0D',
  '#F0FE11',
  '#33FAF3',
  '#ED0C0C',
  '#FF8A00',
  '#9301FA',
  '#000000',
  '#FFF',
  '#4A2E18'
];

const friction = 0.2, restitution = 0.6, sides = 2, radius = 0.125, mass = 0.1;
const materials = [];
let initialized = false, geometry;

function populateColors(THREE, Physijs) {
  for (var i = 0; i < colors.length; i++) {
    materials.push(
      Physijs.createMaterial(
        new THREE.MeshPhongMaterial({
          color: colors[i],
          // specular: colors[i],
          shininess: 100
          // metal:true
        }),
        friction,
        restitution
      )
    );
  }
}

function initialize(THREE, Physijs) {
  populateColors(THREE, Physijs);
  geometry = new THREE.IcosahedronGeometry(radius, sides);
  initialized = true;
}

export default function(THREE, Physijs) {
  if (!initialized) {
    initialize(THREE, Physijs);
  }

  const marble = new Physijs.SphereMesh(
    geometry,
    materials[Math.floor(Math.random() * materials.length)],
    mass
  );

  // var scale = Math.random() * 0.2 + 0.9;
  // marble.scale.set(scale, scale, scale);

  // Enable CCD if the object moves more than 1 meter in one simulation frame
  // marble.setCcdMotionThreshold(0.5);

  // Set the radius of the embedded sphere such that it is smaller than the object
  // marble.setCcdSweptSphereRadius(0.1);
  marble.castShadow = true;
  marble.receiveShadow = true;
  return marble;
}
