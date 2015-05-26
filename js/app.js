  'use strict';

  Physijs.scripts.worker = './bower_components/physijs/physijs_worker.js';
  Physijs.scripts.ammo = '../ammo.js/builds/ammo.js';

  var settings = {
      stickCount: 40,
      marbleCount: 50
  }

  var initScene, controls, materials, render, renderer, scene, camera, box, board, light, stats, physics_stats, raycaster, mouse, objects = [],
      marbles = [],
      hovered,
      _vector;

  function initScene() {
      renderer = new THREE.WebGLRenderer({
          antialias: false
      });
      renderer.setSize(window.innerWidth, window.innerHeight);

      renderer.shadowMapEnabled = true;
      renderer.shadowMapType = THREE.PCFSoftShadowMap;

      document.getElementById('viewport').appendChild(renderer.domElement);

      scene = new Physijs.Scene({
          fixedTimeStep: 1 / 180
      });
      scene.setGravity(new THREE.Vector3(0, -10, 0));

      // SKYBOX/FOG
      var skyBoxGeometry = new THREE.BoxGeometry(10000, 10000, 10000);
      var skyBoxMaterial = new THREE.MeshBasicMaterial({
          color: 0x9999ff,
          side: THREE.BackSide
      });
      var skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
      // scene.add(skyBox);
      scene.fog = new THREE.FogExp2(0x9999ff, 0.00025);

      raycaster = new THREE.Raycaster();
      mouse = new THREE.Vector2();

      document.addEventListener('mousedown', onDocumentMouseDown, false);
      document.addEventListener('touchstart', onDocumentTouchStart, false);
      document.addEventListener('mouseup', onDocumentMouseUp, false);
      document.addEventListener('mousemove', onDocumentMouseMove, false);
  }

  function onDocumentTouchStart(event) {

      event.preventDefault();

      event.clientX = event.touches[0].clientX;
      event.clientY = event.touches[0].clientY;
      onDocumentMouseDown(event);

  }

  function onDocumentMouseDown() {

  }

  function onDocumentMouseUp(event) {
      event.preventDefault();

      if (hovered) {
          objects.splice(hovered.object.index, 1);

          objects.map(function(object, index) {
              object.index = index;
          })

          // scene.remove(intersects[0].object._physijs);
          scene.remove(hovered.object);

          _vector = new THREE.Vector3(0, -0.001, 0)
          marbles.forEach(function(marble) {
              if (marble) {
                  marble.setLinearVelocity(_vector);
              }
          });
      }
  }

  function getIntersections() {
      mouse.x = (event.clientX / renderer.domElement.width) * 2 - 1;
      mouse.y = -(event.clientY / renderer.domElement.height) * 2 + 1;

      raycaster.setFromCamera(mouse, camera);

      var intersects = raycaster.intersectObjects(objects);

      return intersects;
  }

  function onDocumentMouseMove(event) {
      event.preventDefault();

      var intersects = getIntersections(event);

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
              color: '#F31717',
              // transparent: true,
              // opacity: .5
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


  function initLights() {

      // var ambientLight = new THREE.AmbientLight(0x222222);
      // scene.add(ambientLight);

      var spotLight = new THREE.SpotLight(0xFFAA88);
      spotLight.target.position.set(0, 0, 0);
      spotLight.shadowCameraNear = 0.01;
      spotLight.castShadow = true;
      spotLight.shadowDarkness = 0.15;
      // spotLight.shadowCameraVisible = true;
      // console.dir(spotLight)
      // spotLight.shadowMapWidth = 1024;
      // spotLight.shadowMapHeight  = 1024;
      spotLight.position.x = 3;
      spotLight.position.y = 50;
      spotLight.position.z = 3;

      scene.add(spotLight);
  }

  function initCamera() {
      camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 1, 50);
      camera.position.z = 10;
      camera.position.y = 10;

      controls = new THREE.OrbitControls(camera);
      // controls.damping = 0.2;

      controls.minDistance = 4;
      controls.maxDistance = 10;
      controls.minPolarAngle = .15; // radians
      controls.maxPolarAngle = Math.PI / 2;

      controls.target.setY(4);

      controls.addEventListener('change', render);
  }

  function addBoard() {
      board = board();
      board.position.y - -1;
      scene.add(board);
  }


  function addMarbles() {
      for (var i = 0; i < settings.marbleCount; i++) {
          var oneMarble = marble();

          oneMarble.position.set(
              posOrNeg() * Math.random() * 0.25,
              Math.random() * 45 + 10,
              posOrNeg() * Math.random() * 0.25
          );

          marbles.push(oneMarble);

          scene.add(oneMarble);
          // console.log(marble);
      };
  }

  function addGameContainer() {
      var y = 7 / 2;

      var side1 = wall();
      side1.position.set(-1, y, 0);
      side1.rotation.set(0, 1.5, 0);

      var side2 = wall();
      side2.position.set(0, y, 1);
      side2.rotation.set(0, 0, 0);

      var side3 = wall();
      side3.position.set(1, y, 0);
      side3.rotation.set(0, 1.5, 0);

      var side4 = wall();
      side4.position.set(0, y, -1);
      side4.rotation.set(0, 0, 0);


      var side5 = wall();
      side5.position.set(-0.70, y, -0.70); //top left
      side5.rotation.set(0, 0.75, 0);

      var side6 = wall();
      side6.position.set(0.70, y, -0.70); //top right
      side6.rotation.set(0, -0.75, 0);

      var side7 = wall();
      side7.position.set(-0.70, y, 0.70); //bottom left
      side7.rotation.set(0, -0.75, 0);

      var side8 = wall();
      side8.position.set(0.70, y, 0.70); //bottom right
      side8.rotation.set(0, 0.75, 0);

      scene.add(side1);
      scene.add(side2);
      scene.add(side3);
      scene.add(side4);
      scene.add(side5);
      scene.add(side6);
      scene.add(side7);
      scene.add(side8);
  }

  function addBoundary() {
      var oneBoundary = boundary();
      oneBoundary.position.set(0, 1, 0);

      oneBoundary.addEventListener('collision', function(other_object, relative_velocity, relative_rotation, contact_normal) {
          console.log(other_object);
          // `this` has collided with `other_object` with an impact speed of `relative_velocity` and a rotational force of `relative_rotation` and at normal `contact_normal`
      });

      scene.add(oneBoundary);
  }

  function addSticks() {
      var heightVariation = 0.9;
      var horizontalVariation = .25;

      for (var i = 0; i < settings.stickCount; i++) {

          var shift = posOrNeg() * Math.random() * horizontalVariation;
          var oneStick = stick();

          var x = shift,
              y = Math.random() * heightVariation + 3.5,
              z = shift * -1;

          oneStick.position.set(x, y, z);

          oneStick.rotation.set(
              0,
              Math.random() * 3,
              posOrNeg() * (Math.random() * 0.4 + 1.1) // up to 1.5 in either direction
          );

          oneStick.index = objects.length;
          objects.push(oneStick);


          scene.add(oneStick);
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
      stats.domElement.style.top = '0';
      stats.domElement.style.zIndex = 100;
      document.getElementById('viewport').appendChild(stats.domElement);

      physics_stats = new Stats();
      physics_stats.domElement.style.position = 'absolute';
      physics_stats.domElement.style.top = '50px';
      physics_stats.domElement.style.zIndex = 100;
      document.getElementById('viewport').appendChild(physics_stats.domElement);

      scene.addEventListener(
          'update',
          function() {
              requestAnimationFrame(render);
              marbles.forEach(function(marble, index) {
                  if (marble.position.y < 1) {
                      scene.remove(marbles[index]);
                      marbles.splice(index, 1);
                  }
              });

              physics_stats.update();
              scene.simulate(undefined, 1);
          }
      );
  }

  function start() {
      initCamera();
      initScene();
      initStats();
      initLights();

      addBoard();
      // addBoundary();
      addGameContainer();
      addSticks();

      addMarbles();

      scene.simulate()
          // requestAnimationFrame(render);
      controls.update();

      window.addEventListener('resize', onWindowResize, false);
  };

  function render() {
      stats.update();
      // scene.simulate(); // run physics
      renderer.render(scene, camera); // render the scene
  };

  window.onload = start;
