(function() {
    "use strict";

    angular.module("gameModule").service("gameService", ["objectGenerator", "UtilitiesService", gameService]);

    function gameService(objectGenerator, UtilitiesService) {

        Physijs.scripts.worker = 'js/async/physijs_worker.js';
        Physijs.scripts.ammo = '../async/ammo.js';

        var settings = {
            stickCount: 30,
            marbleCount: 30
        };

        var controls, materials, renderer, scene, camera, box, light, stats, physics_stats, raycaster, mouse, running = false,
            hovered, _vector;

        var marbles = [],
            sticks = [],
            walls = [];

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
            // scene.add(skyBox);
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

        function onDocumentMouseDown() {

        }

        function onDocumentMouseUp(event) {
            event.preventDefault();

            if (hovered) {
                sticks.splice(hovered.object.index, 1);

                sticks.map(function(stick, index) {
                    stick.index = index;
                });

                // scene.remove(intersects[0].object._physijs);
                scene.remove(hovered.object);

                _vector = new THREE.Vector3(0, -0.001, 0);
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

            var intersects = raycaster.intersectObjects(sticks);

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
            camera.position.z = 7;
            camera.position.y = 10;

            controls = new THREE.OrbitControls(camera);
            // controls.damping = 0.2;

            controls.minDistance = 3;
            controls.maxDistance = 7;
            controls.minPolarAngle = 0.15; // radians
            controls.maxPolarAngle = Math.PI / 2;

            controls.target.setY(4);

            controls.addEventListener('change', render);
        }

        function addBoard() {
            var oneBoard = objectGenerator.create('board');
            oneBoard.position.y = -1;
            scene.add(oneBoard);
        }


        function addMarbles() {
            for(var i = 0; i < settings.marbleCount; i++) {
                var oneMarble = objectGenerator.create('marble');

                oneMarble.position.set(
                    UtilitiesService.posOrNeg() * Math.random() * 0.25,
                    Math.random() * 10 + 5,
                    UtilitiesService.posOrNeg() * Math.random() * 0.25
                );

                marbles.push(oneMarble);
            }

            addMarble(0);

        }

        function addMarble(i) {
            if (i >= marbles.length) {
                return;
            }

            scene.add(marbles[i]);

            setTimeout(function() {
                //recurse to next marble
                addMarble(i + 1);
            }, 25);
        }

        function removeMarbles() {
            marbles.forEach(function(marble, index) {
                scene.remove(marbles[index]);
            });

            marbles.length = 0;
        }

        function addWalls() {
            var y = 7 / 2;

            var side1 = objectGenerator.create('wall');
            side1.position.set(-0.70, y, 0);
            side1.rotation.set(0, 1.5, 0);

            var side2 = objectGenerator.create('wall');
            side2.position.set(0, y, 0.70);
            side2.rotation.set(0, 0, 0);

            var side3 = objectGenerator.create('wall');
            side3.position.set(0.70, y, 0);
            side3.rotation.set(0, 1.5, 0);

            var side4 = objectGenerator.create('wall');
            side4.position.set(0, y, -0.70);
            side4.rotation.set(0, 0, 0);

            var side5 = objectGenerator.create('wall');
            side5.position.set(-0.5, y, -0.5); //top left
            side5.rotation.set(0, 0.75, 0);

            var side6 = objectGenerator.create('wall');
            side6.position.set(0.5, y, -0.5); //top right
            side6.rotation.set(0, -0.75, 0);

            var side7 = objectGenerator.create('wall');
            side7.position.set(-0.5, y, 0.5); //bottom left
            side7.rotation.set(0, -0.75, 0);

            var side8 = objectGenerator.create('wall');
            side8.position.set(0.5, y, 0.5); //bottom right
            side8.rotation.set(0, 0.75, 0);

            walls.push(side1);
            walls.push(side2);
            walls.push(side3);
            walls.push(side4);
            walls.push(side5);
            walls.push(side6);
            walls.push(side7);
            walls.push(side8);

            // walls.forEach(function(wall) {
            //     scene.add(wall);
            // });
            //
            addWall(0);
        }

        function addWall(i) {
            if (i >= walls.length) {
                return;
            }

            scene.add(walls[i]);

            setTimeout(function() {
                //recurse to next marble
                addWall(i + 1);
                if (i === walls.length - 1) {
                    addSticks();
                    return;
                }
            }, 75);
        }

        function removeWalls() {
            walls.forEach(function(wall) {
                scene.remove(wall);
            });

            walls.length = 0;
        }

        function addSticks() {

            for(var i = 0; i < settings.stickCount; i++) {

                var oneStick = objectGenerator.create('stick');

                // alternate walls and spin the stick to match
                var side = (i % 4);
                spinStick(oneStick, side);
                shiftStick(oneStick, side);

                oneStick.index = sticks.length;
                sticks.push(oneStick);

                // scene.add(oneStick);
            }
            addStick(0);

        }

        function spinStick(stick, side) {
            stick.rotation.set(
                UtilitiesService.posOrNeg() * Math.random() * 0.1,
                0.75 * side, //8 / 3.5, //Math.random() * 3,
                0 //UtilitiesService.posOrNeg() * (Math.random() * 0.4 + 1.1) // up to 1.5 in either direction
            );
            return stick;
        }

        function shiftStick(stick, side) {
            var horizontalVariation = 0.275,
                heightVariation = 0.3;

            var shiftX = UtilitiesService.posOrNeg() * Math.random() * horizontalVariation;
            var shiftZ = UtilitiesService.posOrNeg() * Math.random() * horizontalVariation;

            // var shiftsX = [3];
            // var shiftsZ = [1];
            // var shiftsBoth = [0, 2];

            if (side === 0 || side === 2) {

            } else if (side === 3) {
                shiftZ = 0;
            } else if (side === 1) {
                shiftX = 0;
            }

            var x = shiftX,
                y = Math.random() * heightVariation + 3.5,
                z = shiftZ;

            stick.position.set(x, y, z);
        }

        function addStick(i) {
            if (i >= sticks.length) {
                return;
            }

            scene.add(sticks[i]);

            setTimeout(function() {
                //recurse to next marble
                addStick(i + 1);

                if (i === sticks.length - 1) {
                    addMarbles();
                    return;
                }
            }, 50);

        }

        function removeSticks() {
            sticks.forEach(function(stick, index) {
                scene.remove(sticks[index]);
            });

            sticks.length = 0;
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
                    if (running) {
                        requestAnimationFrame(render);
                        removeOutofBoundsMarbles();

                        physics_stats.update();

                        simulate();
                    }

                }
            );
        }

        function removeOutofBoundsMarbles() {
            marbles.forEach(function(marble, index) {
                if (marble.position.y < 0.25) {
                    scene.remove(marbles[index]);
                    marbles.splice(index, 1);
                }
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
            initStats();
            initLights();

            addBoard();

            // newRound();
            // requestAnimationFrame(render);
            controls.update();

            window.addEventListener('resize', onWindowResize, false);
        }

        function newRound() {
            addWalls();
            // addSticks();
            // addMarbles();
            startSimulation();
        }

        function endRound() {
            running = false;
            removeWalls();
            removeMarbles();
            removeSticks();
        }

        function render() {
            stats.update();
            // scene.simulate(); // run physics
            renderer.render(scene, camera); // render the scene
            // requestAnimationFrame(render);
        }

        return {
            start: start,
            newRound: newRound,
            endRound: endRound
        };

    }

})();