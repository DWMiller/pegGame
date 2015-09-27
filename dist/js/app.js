var pegGame = angular.module('app', ['ui.router', 'launcherModule', 'gameModule']).run(function($rootScope) {
    'use strict';
    $rootScope.title = "Peg Game";
});

angular.module('gameModule', []);

angular.module('launcherModule', []);

(function() {
    "use strict";
    angular.module('app').config(['$stateProvider', '$urlRouterProvider', appConfig]);

    function appConfig($stateProvider, $urlRouterProvider) {

        $urlRouterProvider.otherwise("/");

        $stateProvider.state("default", {
            url: "/",
            templateUrl: "components/launcher/launcher.template.html",
            controller: "launcherController"
        });

        $stateProvider.state("game", {
            url: "/game",
            templateUrl: "components/game/game.template.html",
            controller: "gameController"
        });
    }
})();


(function() {
    "use strict";

    angular.module('gameModule').controller('gameController', ["$scope", "gameService", gameController]);

    function gameController($scope, gameService) {
        console.log('Game Controller ran');
        'use strict';

        $scope.play = function() {
            gameService.start();
            gameService.endRound();
            gameService.newRound();
        };
    }
})();


(function() {
    "use strict";

    angular.module('launcherModule').controller('launcherController', [launcherController]);

    function launcherController() {
        console.log('Launcher Controller ran');
        'use strict';

    }
})();
/**
 * @author qiao / https://github.com/qiao
 * @author mrdoob / http://mrdoob.com
 * @author alteredq / http://alteredqualia.com/
 * @author WestLangley / http://github.com/WestLangley
 * @author erich666 / http://erichaines.com
 */
/*global THREE, console */

// This set of controls performs orbiting, dollying (zooming), and panning. It maintains
// the "up" direction as +Y, unlike the TrackballControls. Touch on tablet and phones is
// supported.
//
//    Orbit - left mouse / touch: one finger move
//    Zoom - middle mouse, or mousewheel / touch: two finger spread or squish
//    Pan - right mouse, or arrow keys / touch: three finter swipe

THREE.OrbitControls = function ( object, domElement ) {

	this.object = object;
	this.domElement = ( domElement !== undefined ) ? domElement : document;

	// API

	// Set to false to disable this control
	this.enabled = true;

	// "target" sets the location of focus, where the control orbits around
	// and where it pans with respect to.
	this.target = new THREE.Vector3();

	// center is old, deprecated; use "target" instead
	this.center = this.target;

	// This option actually enables dollying in and out; left as "zoom" for
	// backwards compatibility
	this.noZoom = false;
	this.zoomSpeed = 1.0;

	// Limits to how far you can dolly in and out ( PerspectiveCamera only )
	this.minDistance = 0;
	this.maxDistance = Infinity;

	// Limits to how far you can zoom in and out ( OrthographicCamera only )
	this.minZoom = 0;
	this.maxZoom = Infinity;

	// Set to true to disable this control
	this.noRotate = false;
	this.rotateSpeed = 1.0;

	// Set to true to disable this control
	this.noPan = false;
	this.keyPanSpeed = 7.0;	// pixels moved per arrow key push

	// Set to true to automatically rotate around the target
	this.autoRotate = false;
	this.autoRotateSpeed = 2.0; // 30 seconds per round when fps is 60

	// How far you can orbit vertically, upper and lower limits.
	// Range is 0 to Math.PI radians.
	this.minPolarAngle = 0; // radians
	this.maxPolarAngle = Math.PI; // radians

	// How far you can orbit horizontally, upper and lower limits.
	// If set, must be a sub-interval of the interval [ - Math.PI, Math.PI ].
	this.minAzimuthAngle = - Infinity; // radians
	this.maxAzimuthAngle = Infinity; // radians

	// Set to true to disable use of the keys
	this.noKeys = false;

	// The four arrow keys
	this.keys = { LEFT: 37, UP: 38, RIGHT: 39, BOTTOM: 40 };

	// Mouse buttons
	this.mouseButtons = { ORBIT: THREE.MOUSE.LEFT, ZOOM: THREE.MOUSE.MIDDLE, PAN: THREE.MOUSE.RIGHT };

	////////////
	// internals

	var scope = this;

	var EPS = 0.000001;

	var rotateStart = new THREE.Vector2();
	var rotateEnd = new THREE.Vector2();
	var rotateDelta = new THREE.Vector2();

	var panStart = new THREE.Vector2();
	var panEnd = new THREE.Vector2();
	var panDelta = new THREE.Vector2();
	var panOffset = new THREE.Vector3();

	var offset = new THREE.Vector3();

	var dollyStart = new THREE.Vector2();
	var dollyEnd = new THREE.Vector2();
	var dollyDelta = new THREE.Vector2();

	var theta;
	var phi;
	var phiDelta = 0;
	var thetaDelta = 0;
	var scale = 1;
	var pan = new THREE.Vector3();

	var lastPosition = new THREE.Vector3();
	var lastQuaternion = new THREE.Quaternion();

	var STATE = { NONE : -1, ROTATE : 0, DOLLY : 1, PAN : 2, TOUCH_ROTATE : 3, TOUCH_DOLLY : 4, TOUCH_PAN : 5 };

	var state = STATE.NONE;

	// for reset

	this.target0 = this.target.clone();
	this.position0 = this.object.position.clone();
	this.zoom0 = this.object.zoom;

	// so camera.up is the orbit axis

	var quat = new THREE.Quaternion().setFromUnitVectors( object.up, new THREE.Vector3( 0, 1, 0 ) );
	var quatInverse = quat.clone().inverse();

	// events

	var changeEvent = { type: 'change' };
	var startEvent = { type: 'start' };
	var endEvent = { type: 'end' };

	this.rotateLeft = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		thetaDelta -= angle;

	};

	this.rotateUp = function ( angle ) {

		if ( angle === undefined ) {

			angle = getAutoRotationAngle();

		}

		phiDelta -= angle;

	};

	// pass in distance in world space to move left
	this.panLeft = function ( distance ) {

		var te = this.object.matrix.elements;

		// get X column of matrix
		panOffset.set( te[ 0 ], te[ 1 ], te[ 2 ] );
		panOffset.multiplyScalar( - distance );

		pan.add( panOffset );

	};

	// pass in distance in world space to move up
	this.panUp = function ( distance ) {

		var te = this.object.matrix.elements;

		// get Y column of matrix
		panOffset.set( te[ 4 ], te[ 5 ], te[ 6 ] );
		panOffset.multiplyScalar( distance );

		pan.add( panOffset );

	};

	// pass in x,y of change desired in pixel space,
	// right and down are positive
	this.pan = function ( deltaX, deltaY ) {

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		if ( scope.object instanceof THREE.PerspectiveCamera ) {

			// perspective
			var position = scope.object.position;
			var offset = position.clone().sub( scope.target );
			var targetDistance = offset.length();

			// half of the fov is center to top of screen
			targetDistance *= Math.tan( ( scope.object.fov / 2 ) * Math.PI / 180.0 );

			// we actually don't use screenWidth, since perspective camera is fixed to screen height
			scope.panLeft( 2 * deltaX * targetDistance / element.clientHeight );
			scope.panUp( 2 * deltaY * targetDistance / element.clientHeight );

		} else if ( scope.object instanceof THREE.OrthographicCamera ) {

			// orthographic
			scope.panLeft( deltaX * (scope.object.right - scope.object.left) / element.clientWidth );
			scope.panUp( deltaY * (scope.object.top - scope.object.bottom) / element.clientHeight );

		} else {

			// camera neither orthographic or perspective
			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - pan disabled.' );

		}

	};

	this.dollyIn = function ( dollyScale ) {

		if ( dollyScale === undefined ) {

			dollyScale = getZoomScale();

		}

		if ( scope.object instanceof THREE.PerspectiveCamera ) {

			scale /= dollyScale;

		} else if ( scope.object instanceof THREE.OrthographicCamera ) {

			scope.object.zoom = Math.max( this.minZoom, Math.min( this.maxZoom, this.object.zoom * dollyScale ) );
			scope.object.updateProjectionMatrix();
			scope.dispatchEvent( changeEvent );

		} else {

			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );

		}

	};

	this.dollyOut = function ( dollyScale ) {

		if ( dollyScale === undefined ) {

			dollyScale = getZoomScale();

		}

		if ( scope.object instanceof THREE.PerspectiveCamera ) {

			scale *= dollyScale;

		} else if ( scope.object instanceof THREE.OrthographicCamera ) {

			scope.object.zoom = Math.max( this.minZoom, Math.min( this.maxZoom, this.object.zoom / dollyScale ) );
			scope.object.updateProjectionMatrix();
			scope.dispatchEvent( changeEvent );

		} else {

			console.warn( 'WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled.' );

		}

	};

	this.update = function () {

		var position = this.object.position;

		offset.copy( position ).sub( this.target );

		// rotate offset to "y-axis-is-up" space
		offset.applyQuaternion( quat );

		// angle from z-axis around y-axis

		theta = Math.atan2( offset.x, offset.z );

		// angle from y-axis

		phi = Math.atan2( Math.sqrt( offset.x * offset.x + offset.z * offset.z ), offset.y );

		if ( this.autoRotate && state === STATE.NONE ) {

			this.rotateLeft( getAutoRotationAngle() );

		}

		theta += thetaDelta;
		phi += phiDelta;

		// restrict theta to be between desired limits
		theta = Math.max( this.minAzimuthAngle, Math.min( this.maxAzimuthAngle, theta ) );

		// restrict phi to be between desired limits
		phi = Math.max( this.minPolarAngle, Math.min( this.maxPolarAngle, phi ) );

		// restrict phi to be betwee EPS and PI-EPS
		phi = Math.max( EPS, Math.min( Math.PI - EPS, phi ) );

		var radius = offset.length() * scale;

		// restrict radius to be between desired limits
		radius = Math.max( this.minDistance, Math.min( this.maxDistance, radius ) );

		// move target to panned location
		this.target.add( pan );

		offset.x = radius * Math.sin( phi ) * Math.sin( theta );
		offset.y = radius * Math.cos( phi );
		offset.z = radius * Math.sin( phi ) * Math.cos( theta );

		// rotate offset back to "camera-up-vector-is-up" space
		offset.applyQuaternion( quatInverse );

		position.copy( this.target ).add( offset );

		this.object.lookAt( this.target );

		thetaDelta = 0;
		phiDelta = 0;
		scale = 1;
		pan.set( 0, 0, 0 );

		// update condition is:
		// min(camera displacement, camera rotation in radians)^2 > EPS
		// using small-angle approximation cos(x/2) = 1 - x^2 / 8

		if ( lastPosition.distanceToSquared( this.object.position ) > EPS
		    || 8 * (1 - lastQuaternion.dot(this.object.quaternion)) > EPS ) {

			this.dispatchEvent( changeEvent );

			lastPosition.copy( this.object.position );
			lastQuaternion.copy (this.object.quaternion );

		}

	};


	this.reset = function () {

		state = STATE.NONE;

		this.target.copy( this.target0 );
		this.object.position.copy( this.position0 );
		this.object.zoom = this.zoom0;

		this.object.updateProjectionMatrix();
		this.dispatchEvent( changeEvent );

		this.update();

	};

	this.getPolarAngle = function () {

		return phi;

	};

	this.getAzimuthalAngle = function () {

		return theta

	};

	function getAutoRotationAngle() {

		return 2 * Math.PI / 60 / 60 * scope.autoRotateSpeed;

	}

	function getZoomScale() {

		return Math.pow( 0.95, scope.zoomSpeed );

	}

	function onMouseDown( event ) {

		if ( scope.enabled === false ) return;
		event.preventDefault();

		if ( event.button === scope.mouseButtons.ORBIT ) {
			if ( scope.noRotate === true ) return;

			state = STATE.ROTATE;

			rotateStart.set( event.clientX, event.clientY );

		} else if ( event.button === scope.mouseButtons.ZOOM ) {
			if ( scope.noZoom === true ) return;

			state = STATE.DOLLY;

			dollyStart.set( event.clientX, event.clientY );

		} else if ( event.button === scope.mouseButtons.PAN ) {
			if ( scope.noPan === true ) return;

			state = STATE.PAN;

			panStart.set( event.clientX, event.clientY );

		}

		if ( state !== STATE.NONE ) {
			document.addEventListener( 'mousemove', onMouseMove, false );
			document.addEventListener( 'mouseup', onMouseUp, false );
			scope.dispatchEvent( startEvent );
		}

	}

	function onMouseMove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		if ( state === STATE.ROTATE ) {

			if ( scope.noRotate === true ) return;

			rotateEnd.set( event.clientX, event.clientY );
			rotateDelta.subVectors( rotateEnd, rotateStart );

			// rotating across whole screen goes 360 degrees around
			scope.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );

			// rotating up and down along whole screen attempts to go 360, but limited to 180
			scope.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

			rotateStart.copy( rotateEnd );

		} else if ( state === STATE.DOLLY ) {

			if ( scope.noZoom === true ) return;

			dollyEnd.set( event.clientX, event.clientY );
			dollyDelta.subVectors( dollyEnd, dollyStart );

			if ( dollyDelta.y > 0 ) {

				scope.dollyIn();

			} else if ( dollyDelta.y < 0 ) {

				scope.dollyOut();

			}

			dollyStart.copy( dollyEnd );

		} else if ( state === STATE.PAN ) {

			if ( scope.noPan === true ) return;

			panEnd.set( event.clientX, event.clientY );
			panDelta.subVectors( panEnd, panStart );

			scope.pan( panDelta.x, panDelta.y );

			panStart.copy( panEnd );

		}

		if ( state !== STATE.NONE ) scope.update();

	}

	function onMouseUp( /* event */ ) {

		if ( scope.enabled === false ) return;

		document.removeEventListener( 'mousemove', onMouseMove, false );
		document.removeEventListener( 'mouseup', onMouseUp, false );
		scope.dispatchEvent( endEvent );
		state = STATE.NONE;

	}

	function onMouseWheel( event ) {

		if ( scope.enabled === false || scope.noZoom === true || state !== STATE.NONE ) return;

		event.preventDefault();
		event.stopPropagation();

		var delta = 0;

		if ( event.wheelDelta !== undefined ) { // WebKit / Opera / Explorer 9

			delta = event.wheelDelta;

		} else if ( event.detail !== undefined ) { // Firefox

			delta = - event.detail;

		}

		if ( delta > 0 ) {

			scope.dollyOut();

		} else if ( delta < 0 ) {

			scope.dollyIn();

		}

		scope.update();
		scope.dispatchEvent( startEvent );
		scope.dispatchEvent( endEvent );

	}

	function onKeyDown( event ) {

		if ( scope.enabled === false || scope.noKeys === true || scope.noPan === true ) return;

		switch ( event.keyCode ) {

			case scope.keys.UP:
				scope.pan( 0, scope.keyPanSpeed );
				scope.update();
				break;

			case scope.keys.BOTTOM:
				scope.pan( 0, - scope.keyPanSpeed );
				scope.update();
				break;

			case scope.keys.LEFT:
				scope.pan( scope.keyPanSpeed, 0 );
				scope.update();
				break;

			case scope.keys.RIGHT:
				scope.pan( - scope.keyPanSpeed, 0 );
				scope.update();
				break;

		}

	}

	function touchstart( event ) {

		if ( scope.enabled === false ) return;

		switch ( event.touches.length ) {

			case 1:	// one-fingered touch: rotate

				if ( scope.noRotate === true ) return;

				state = STATE.TOUCH_ROTATE;

				rotateStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;

			case 2:	// two-fingered touch: dolly

				if ( scope.noZoom === true ) return;

				state = STATE.TOUCH_DOLLY;

				var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
				var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
				var distance = Math.sqrt( dx * dx + dy * dy );
				dollyStart.set( 0, distance );
				break;

			case 3: // three-fingered touch: pan

				if ( scope.noPan === true ) return;

				state = STATE.TOUCH_PAN;

				panStart.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				break;

			default:

				state = STATE.NONE;

		}

		if ( state !== STATE.NONE ) scope.dispatchEvent( startEvent );

	}

	function touchmove( event ) {

		if ( scope.enabled === false ) return;

		event.preventDefault();
		event.stopPropagation();

		var element = scope.domElement === document ? scope.domElement.body : scope.domElement;

		switch ( event.touches.length ) {

			case 1: // one-fingered touch: rotate

				if ( scope.noRotate === true ) return;
				if ( state !== STATE.TOUCH_ROTATE ) return;

				rotateEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				rotateDelta.subVectors( rotateEnd, rotateStart );

				// rotating across whole screen goes 360 degrees around
				scope.rotateLeft( 2 * Math.PI * rotateDelta.x / element.clientWidth * scope.rotateSpeed );
				// rotating up and down along whole screen attempts to go 360, but limited to 180
				scope.rotateUp( 2 * Math.PI * rotateDelta.y / element.clientHeight * scope.rotateSpeed );

				rotateStart.copy( rotateEnd );

				scope.update();
				break;

			case 2: // two-fingered touch: dolly

				if ( scope.noZoom === true ) return;
				if ( state !== STATE.TOUCH_DOLLY ) return;

				var dx = event.touches[ 0 ].pageX - event.touches[ 1 ].pageX;
				var dy = event.touches[ 0 ].pageY - event.touches[ 1 ].pageY;
				var distance = Math.sqrt( dx * dx + dy * dy );

				dollyEnd.set( 0, distance );
				dollyDelta.subVectors( dollyEnd, dollyStart );

				if ( dollyDelta.y > 0 ) {

					scope.dollyOut();

				} else if ( dollyDelta.y < 0 ) {

					scope.dollyIn();

				}

				dollyStart.copy( dollyEnd );

				scope.update();
				break;

			case 3: // three-fingered touch: pan

				if ( scope.noPan === true ) return;
				if ( state !== STATE.TOUCH_PAN ) return;

				panEnd.set( event.touches[ 0 ].pageX, event.touches[ 0 ].pageY );
				panDelta.subVectors( panEnd, panStart );

				scope.pan( panDelta.x, panDelta.y );

				panStart.copy( panEnd );

				scope.update();
				break;

			default:

				state = STATE.NONE;

		}

	}

	function touchend( /* event */ ) {

		if ( scope.enabled === false ) return;

		scope.dispatchEvent( endEvent );
		state = STATE.NONE;

	}

	this.domElement.addEventListener( 'contextmenu', function ( event ) { event.preventDefault(); }, false );
	this.domElement.addEventListener( 'mousedown', onMouseDown, false );
	this.domElement.addEventListener( 'mousewheel', onMouseWheel, false );
	this.domElement.addEventListener( 'DOMMouseScroll', onMouseWheel, false ); // firefox

	this.domElement.addEventListener( 'touchstart', touchstart, false );
	this.domElement.addEventListener( 'touchend', touchend, false );
	this.domElement.addEventListener( 'touchmove', touchmove, false );

	window.addEventListener( 'keydown', onKeyDown, false );

	// force an update at start
	this.update();

};

THREE.OrbitControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.OrbitControls.prototype.constructor = THREE.OrbitControls;

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
(function() {
    "use strict";

    angular.module("app").service("boardFactory", [boardFactory]);

    function boardFactory() {

        var api = {};

        var config = {
            geometry: new THREE.BoxGeometry(25, 1, 25),
            material: Physijs.createMaterial(
                new THREE.MeshBasicMaterial({
                    // color: '#876334',
                    map: THREE.ImageUtils.loadTexture('assets/images/wood.jpg'),
                }),
                0.5,
                0
            ),
            mass: 0
        };

        api.create = function createBoard() {
            var board = new Physijs.BoxMesh(config.geometry, config.material, config.mass);
            board.castShadow = false;
            board.receiveShadow = true;
            return board;
        };

        return api;
    }

})();
(function() {
    "use strict";

    angular.module("app").service("marbleFactory", [marbleFactory]);

    function marbleFactory() {

        var api = {};

        var materials = [];
        var colors = ['#0332FD', '#C30FDE', '#0DCE0D', '#F0FE11', '#33FAF3', '#ED0C0C', '#FF8A00', '#9301FA', '#000000', '#FFF', '#4A2E18'];

        populateColors();

        var friction = 0.2,
            restitution = 0.6,
            sides = 2,
            radius = 0.125;

        var config = {
            geometry: new THREE.IcosahedronGeometry(radius, sides),
            mass: 0.1
        };

        function populateColors() {
            for(var i = 0; i < colors.length; i++) {
                materials.push(Physijs.createMaterial(
                    new THREE.MeshPhongMaterial({
                        color: colors[i],
                        // specular: colors[i],
                        shininess: 100,
                        // metal:true
                    }), friction,
                    restitution
                ));
            }
        }

        api.create = function createMarble() {
            var marble = new Physijs.SphereMesh(config.geometry, materials[Math.floor(Math.random() * materials.length)], config.mass);

            // var scale = Math.random() * 0.2 + 0.9;
            // marble.scale.set(scale, scale, scale);

            // Enable CCD if the object moves more than 1 meter in one simulation frame
            // marble.setCcdMotionThreshold(0.5);

            // Set the radius of the embedded sphere such that it is smaller than the object
            // marble.setCcdSweptSphereRadius(0.1);
            marble.castShadow = true;
            marble.receiveShadow = true;
            return marble;
        };

        return api;
    }

})();
(function() {
    "use strict";

    angular.module("app").service("objectGenerator", ["stickFactory", "boardFactory", "marbleFactory", "wallFactory", objectGenerator]);

    function objectGenerator(stickFactory, boardFactory, marbleFactory, wallFactory) {

        var factoryMap = {
            'stick': stickFactory,
            'board': boardFactory,
            'marble': marbleFactory,
            'wall': wallFactory
        };

        var api = {};

        api.create = function createObject(type) {
            return factoryMap[type].create();
        };

        return api;
    }

})();
(function() {
    "use strict";

    angular.module("app").service("stickFactory", [stickFactory]);

    function stickFactory() {

        var api = {};

        var height = 0.02,
            length = 2.5,
            width = 0.02;
        //0.2;

        var config = {
            geometry: new THREE.BoxGeometry(height, width, length),
            material: Physijs.createMaterial(
                new THREE.MeshLambertMaterial({
                    // color: '#3BC856',
                    map: THREE.ImageUtils.loadTexture('assets/images/plywood.jpg'),
                }),
                0.2, //friction
                0 //restitution
            ),
            mass: 0
        };

        api.create = function createStick() {
            var stick = new Physijs.BoxMesh(config.geometry, config.material, config.mass);
            stick.castShadow = true;
            stick.receiveShadow = true;
            return stick;
        };

        return api;
    }

})();
(function() {
    "use strict";

    angular.module("app").service("wallFactory", [wallFactory]);

    function wallFactory() {

        var api = {};

        var width = 0.55,
            height = 75,
            thickness = 0.01;

        var config = {
            geometry: new THREE.BoxGeometry(width, height, thickness),
            material: Physijs.createMaterial(
                new THREE.MeshPhongMaterial({
                    color: '#FFF',
                    emissive: '#FFF',
                    specular: '#FFF',
                    // shininess: 100,
                    // metal: true,
                    transparent: true,
                    opacity: 0.1,
                }),
                0, //friction
                0 //restitution
            ),
            mass: 0
        };

        api.create = function createWall() {
            var wall = new Physijs.BoxMesh(config.geometry, config.material, config.mass);
            // wall.castShadow = false;
            // wall.receiveShadow = false;

            return wall;
        };

        return api;
    }

})();
(function() {
    "use strict";

    angular.module("app").service("UtilitiesService", [UtilitiesService]);

    function UtilitiesService() {

        var api = {};

        api.posOrNeg = function posOrNeg() {
            'use strict';
            return Math.round(Math.random()) * 2 - 1;
        };

        return api;
    }
})();