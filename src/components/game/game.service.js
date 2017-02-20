const THREE = window.THREE;

const Physijs = window.Physijs;
Physijs.scripts.worker = 'physijs_worker.js';
Physijs.scripts.ammo = 'ammo.js';

import lightCreator from './lights';
const lightControls = lightCreator(THREE);

import wallCreator from './walls';
const wallControls = wallCreator(THREE, Physijs);

import marbleCreator from './marbles';
const marbleControls = marbleCreator(THREE, Physijs);

import stickCreator from './sticks';
const stickControls = stickCreator(THREE, Physijs);

import createOrbitControls from 'three-orbit-controls';
const OrbitControls = createOrbitControls(THREE);

import createBoard from '../../materials/board';

var settings = {
  stickCount: 30,
  marbleCount: 30
};

var controls,
  renderer,
  scene,
  camera,
  raycaster,
  mouse,
  running = false,
  hovered,
  _vector;

var marbles = [], sticks = [], walls = [];

function initScene() {
  renderer = new THREE.WebGLRenderer({
    antialias: false
  });
  renderer.setSize(window.innerWidth, window.innerHeight);

  renderer.shadowMapEnabled = true;
  renderer.shadowMapType = THREE.PCFSoftShadowMap;

  document.getElementById('viewport').appendChild(renderer.domElement);

  scene = new Physijs.Scene({
    fixedTimeStep: 1 / 60
  });
  scene.setGravity(new THREE.Vector3(0, -10, 0));

  // SKYBOX/FOG
  var skyBoxGeometry = new THREE.BoxGeometry(10000, 10000, 10000);
  var skyBoxMaterial = new THREE.MeshBasicMaterial({
    color: 0x9999ff,
    side: THREE.BackSide
  });
  var skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
  scene.add(skyBox);
  scene.fog = new THREE.FogExp2(0x9999ff, 0.00025);

  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();

  document.addEventListener('mousedown', onDocumentMouseDown, false);
  document.addEventListener('touchstart', onDocumentTouchStart, false);
  document.addEventListener('mouseup', onDocumentMouseUp, false);
  document.addEventListener('mousemove', onDocumentMouseMove, false);

  window.addEventListener('focus', windowFocusOn, false);
  window.addEventListener('blur', windowFocusOut, false);
}

function onDocumentTouchStart(event) {
  event.preventDefault();

  event.clientX = event.touches[0].clientX;
  event.clientY = event.touches[0].clientY;
  onDocumentMouseDown(event);
}

function onDocumentMouseDown() {}

function onDocumentMouseUp(event) {
  event.preventDefault();

  if (hovered) {
    sticks = sticks.filter(stick => stick !== hovered.object);
    scene.remove(hovered.object);

    _vector = new THREE.Vector3(0, -0.001, 0);
    marbles.forEach(marble => marble.setLinearVelocity(_vector));
  }
}

function getIntersections(event, type) {
  mouse.x = event.clientX / renderer.domElement.width * 2 - 1;
  mouse.y = (-(event.clientY / renderer.domElement.height)) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);

  var intersects = raycaster.intersectObjects(type);

  return intersects;
}

function onDocumentMouseMove(event) {
  event.preventDefault();

  var intersects = getIntersections(event, sticks);

  if (intersects.length > 0) {
    if (!hovered) {
      document.children[0].style.cursor = 'pointer';
      hoverStick(intersects[0]);
    } else if (hovered && hovered !== intersects[0]) {
      unhoverStick(hovered);
      hoverStick(intersects[0]);
    }
  } else {
    if (hovered) {
      document.children[0].style.cursor = 'auto';
      unhoverStick(hovered);
    }
  }
}

function hoverStick(stick) {
  hovered = stick;
  hovered.object.originalMaterial = hovered.object.material;

  hovered.object.material = Physijs.createMaterial(
    new THREE.MeshLambertMaterial({
      color: '#F31717'
    }),
    0, //friction
    0 //restitution
  );
}

function unhoverStick(stick) {
  stick.object.material = stick.object.originalMaterial;
  delete stick.object.originalMaterial;
  hovered = false;
}

function initCamera() {
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    1,
    50
  );
  camera.position.z = 7;
  camera.position.y = 10;

  controls = new OrbitControls(camera);
  // controls.damping = 0.2;

  controls.minDistance = 3;
  controls.maxDistance = 7;
  controls.minPolarAngle = 0.15; // radians
  controls.maxPolarAngle = Math.PI / 2;

  controls.target.setY(4);

  controls.addEventListener('change', render);
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();

  renderer.setSize(window.innerWidth, window.innerHeight);

  render();
}

function removeOutofBoundsMarbles() {
  marbles = marbles.filter(marble => {
    if (marble.position.y >= 0.25) {
      return true;
    }

    scene.remove(marble);
    return false;
  });
}

function windowFocusOn() {
  startSimulation();
}

function windowFocusOut() {
  running = false;
}

function startSimulation() {
  running = true;
  simulate();
}

function simulate() {
  scene.simulate(undefined, 1);
}

function start() {
  initCamera();
  initScene();

  lightControls.initLights(scene);

  var oneBoard = createBoard(THREE, Physijs);
  oneBoard.position.y = -1;
  scene.add(oneBoard);

  scene.addEventListener('update', function() {
    if (running) {
      requestAnimationFrame(render);
      removeOutofBoundsMarbles();

      simulate();
    }
  });

  // newRound();
  requestAnimationFrame(render);
  controls.update();

  window.addEventListener('resize', onWindowResize, false);
}

function newRound() {
  walls = wallControls.addWalls(scene);
  sticks = stickControls.addSticks(scene, settings.stickCount);
  marbles = marbleControls.addMarbles(scene, settings.marbleCount);

  startSimulation();
}

function endRound() {
  running = false;
  wallControls.removeWalls(scene, walls);
  walls.length = 0;
  marbleControls.removeMarbles(scene, marbles);
  marbles.length = 0;
  stickControls.removeSticks(scene, sticks);
  sticks.length = 0;
}

function render() {
  // scene.simulate(); // run physics
  renderer.render(scene, camera); // render the scene
  // requestAnimationFrame(render);
}

module.exports = {
  start,
  newRound,
  endRound
};
