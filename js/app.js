  'use strict';

  Physijs.scripts.worker = './bower_components/physijs/physijs_worker.js';
  Physijs.scripts.ammo = '../ammo.js/builds/ammo.js';

  var settings = {
      pegCount: 25,
      ballCount: 10
  }

  var initScene, controls, materials, render, renderer, scene, camera, box, ground, light, stats, raycaster, mouse, objects = [],
      balls = [],
      _vector;

  var friction = .6; // high friction
  var restitution = .6; // low restitution

  var materials = {};

  function initScene() {
      renderer = new THREE.WebGLRenderer({
          antialias: false
      });
      renderer.setSize(window.innerWidth, window.innerHeight);
      // renderer.shadowMapEnabled = true;
      // renderer.shadowMapSoft = true;

      document.getElementById('viewport').appendChild(renderer.domElement);

      scene = new Physijs.Scene({
          fixedTimeStep: 1 / 120
      });
      scene.setGravity(new THREE.Vector3(0, -30, 0));

      raycaster = new THREE.Raycaster();
      mouse = new THREE.Vector2();

      document.addEventListener('mousedown', onDocumentMouseDown, false);
      document.addEventListener('touchstart', onDocumentTouchStart, false);
      document.addEventListener('mouseup', onDocumentMouseUp, false);

  }

  function onDocumentTouchStart(event) {

      event.preventDefault();

      event.clientX = event.touches[0].clientX;
      event.clientY = event.touches[0].clientY;
      onDocumentMouseDown(event);

  }

  function onDocumentMouseDown(event) {

      event.preventDefault();

      mouse.x = (event.clientX / renderer.domElement.width) * 2 - 1;
      mouse.y = -(event.clientY / renderer.domElement.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      var intersects = raycaster.intersectObjects(objects);

      console.log(objects.length);

      if (intersects.length > 0) {
          objects.splice(intersects[0].object.index, 1);

          objects.map(function(object, index) {
              object.index = index;
          })

          // scene.remove(intersects[0].object._physijs);
          scene.remove(intersects[0].object);
          // scene.simulate();
          // 
          _vector = new THREE.Vector3(0, 1, 0)

          balls.forEach(function(ball) {
              ball.setLinearVelocity(_vector);
          });
      }


      /*
      // Parse all the faces
      for ( var i in intersects ) {

          intersects[ i ].face.material[ 0 ].color.setHex( Math.random() * 0xffffff | 0x80000000 );

      }
      */
  }

  function onDocumentMouseUp() {

  }

  function initLights() {
      // ambient light
      var am_light = new THREE.AmbientLight(0x444444);
      scene.add(am_light);

      // directional light
      var dir_light = new THREE.DirectionalLight(0xFFFFFF);
      dir_light.position.set(20, 30, -5);
      dir_light.target.position.copy(scene.position);
      dir_light.castShadow = true;
      dir_light.shadowCameraLeft = -30;
      dir_light.shadowCameraTop = -30;
      dir_light.shadowCameraRight = 30;
      dir_light.shadowCameraBottom = 30;
      dir_light.shadowCameraNear = 20;
      dir_light.shadowCameraFar = 200;
      dir_light.shadowBias = -.001
      dir_light.shadowMapWidth = dir_light.shadowMapHeight = 2048;
      dir_light.shadowDarkness = .5;
      scene.add(dir_light);
  }

  function initMaterials() {

      materials.ground = Physijs.createMaterial(
          new THREE.MeshBasicMaterial({
              color: '#876334'
          }),
          friction,
          restitution
      );

      materials.container = new THREE.MeshBasicMaterial({
              color: '#FFF',
              side: THREE.DoubleSide,
              transparent: true,
              opacity: 0.25,
              // wireframe: true,
          },
          friction,
          restitution);

      materials.object = Physijs.createMaterial(
          new THREE.MeshBasicMaterial({
              color: '#FFF'
          }),
          friction,
          restitution
      );
  }

  function initCamera() {
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 10000);
      camera.position.z = 50;
      camera.position.y = 35;

      controls = new THREE.OrbitControls(camera);
      controls.damping = 0.2;

      controls.minDistance = 25;
      controls.maxDistance = 50;
      controls.minPolarAngle = .25; // radians
      controls.maxPolarAngle = Math.PI / 2;

      controls.target.setY(20);

      controls.addEventListener('change', render);
  }

  function addGround() {
      // Ground
      ground = new Physijs.BoxMesh(
          new THREE.BoxGeometry(100, 1, 100),
          materials.ground,
          0 // mass
      );

      ground.position.y - -5;
      ground.receiveShadow = true;

      ground.rotation.set(0, 0, 0);

      scene.add(ground);
  }

  function addBall() {
      for (var i = 0; i < settings.ballCount; i++) {
          var ball = new Physijs.SphereMesh(
              new THREE.IcosahedronGeometry(1, 5),
              new THREE.MeshLambertMaterial({
                  color: '#0332FD'
              }),
              1
          );

          ball.position.set(
              0,
              25,
              0
          );

          balls.push(ball);
          scene.add(ball);
          // console.log(ball);
      };
  }

  function addGameContainer() {
      var width = 10,
          height = 25,
          thickness = 0.1,
          y = height / 2,
          mass = 0;

      var side1 = new Physijs.BoxMesh(new THREE.BoxGeometry(width, height, thickness), materials.container, mass);
      side1.position.set(-5, y, 0);
      side1.rotation.set(0, 1.5, 0);

      var side2 = new Physijs.BoxMesh(new THREE.BoxGeometry(width, height, thickness), materials.container, mass);
      side2.position.set(0, y, 5);
      side2.rotation.set(0, 0, 0);

      var side3 = new Physijs.BoxMesh(new THREE.BoxGeometry(width, height, thickness), materials.container, mass);
      side3.position.set(5, y, 0);
      side3.rotation.set(0, 1.5, 0);

      var side4 = new Physijs.BoxMesh(new THREE.BoxGeometry(width, height, thickness), materials.container, mass);
      side4.position.set(0, y, -5);
      side4.rotation.set(0, 0, 0);

      scene.add(side1);
      scene.add(side2);
      scene.add(side3);
      scene.add(side4);

  }

  function addPegs() {
      var topRadius = 0.3,
          bottomRadius = 0.3,
          height = 25,
          sides = 8;

      var cylinder_geometry = new THREE.CylinderGeometry(topRadius, bottomRadius, height, sides, undefined, false);

      for (var i = 0; i < settings.pegCount; i++) {

          var cylinder = new Physijs.CylinderMesh(
              cylinder_geometry, new THREE.MeshLambertMaterial({
                  color: '#3BC856'
              }), 0);

          cylinder.castShadow = true;
          cylinder.receiveShadow = true;

          cylinder.position.set(
              (Math.round(Math.random()) * 2 - 1) * Math.random() * 5,
              Math.random() * 4 + 15, (Math.round(Math.random()) * 2 - 1) * Math.random() * 5
          );

          cylinder.rotation.set(
              0,
              Math.random() * 2,
              1.5 //horizontal only
          );

          cylinder.index = objects.length;
          objects.push(cylinder);


          scene.add(cylinder);
      };

  }

  function onWindowResize() {

      camera.aspect = window.innerWidth / window.innerHeight;
      camera.updateProjectionMatrix();

      renderer.setSize(window.innerWidth, window.innerHeight);

      render();

  }

  function initStats() {
      stats = new Stats();
      stats.domElement.style.position = 'absolute';
      stats.domElement.style.top = '0px';
      stats.domElement.style.zIndex = 100;
      document.getElementById('viewport').appendChild(stats.domElement);
  }

  function start() {
      initStats();
      initCamera();
      initScene();
      initLights();

      initMaterials();
      addGround();

      addGameContainer();
      addPegs();

      addBall();

      requestAnimationFrame(render);
      controls.update();

      window.addEventListener('resize', onWindowResize, false);
  };

  function render() {
      stats.update();
      scene.simulate(); // run physics
      renderer.render(scene, camera); // render the scene
      requestAnimationFrame(render);
  };

  window.onload = start;
