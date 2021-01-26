let scene, camera, renderer, mesh, clock;
let meshFloor, ambientLight, light;
let crate, crateTexture, crateNormalMap, crateBumpMap;
let keyboard = {};
const player = { height: 1.8, speed: 0.2, turnSpeed: Math.PI * 0.02, canShoot: 0 };
const useWireframe = false;
let loadingManager = null;
let resourcesLoaded = false;

// Models index
let models = {
	tent: {
		obj: "models/Tent_Poles_01.obj",
		mtl: "models/Tent_Poles_01.mtl",
		mesh: null
	},
	campfire: {
		obj: "models/Campfire_01.obj",
		mtl: "models/Campfire_01.mtl",
		mesh: null
	},
	pirateship: {
		obj: "models/Pirateship.obj",
		mtl: "models/Pirateship.mtl",
		mesh: null
	},
	machine_gun: {
		obj: "models/M4a1.obj",
		mtl: "models/M4a1.mtl",
		mesh: null,
		castShadow: false
	}
};

// Meshes index
let meshes = {};

// Bullets array
let bullets = [];

function init() {
	document.getElementById("wrapper").style.display = "none";

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(55, window.innerWidth / window.innerHeight, 0, 30000);
	camera.position.set(-900, -200, -900);
	camera = new THREE.PerspectiveCamera(90, window.innerWidth / window.innerHeight, 0.4, 7500);
	clock = new THREE.Clock();

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

	loadingManager = new THREE.LoadingManager();
	loadingManager.onProgress = function (item, loaded, total) {
		console.log(item, loaded, total);
	};
	loadingManager.onLoad = function () {
		console.log("loaded all resources");
		resourcesLoaded = true;
		onResourcesLoaded();
	};

	// mesh = new THREE.Mesh(
	// 	new THREE.BoxGeometry(1, 1, 1),
	// 	new THREE.MeshPhongMaterial({ color: 0xff4444, wireframe: useWireframe })
	// );
	// mesh.position.y += 1;
	// mesh.receiveShadow = true;
	// mesh.castShadow = true;
	// scene.add(mesh);

	meshFloor = new THREE.Mesh(
		new THREE.PlaneGeometry(200, 200, 200, 200),
		new THREE.MeshPhongMaterial({ color: 0xffffff, wireframe: true })
	);
	meshFloor.rotation.x -= Math.PI / 2;
	meshFloor.receiveShadow = true;
	scene.add(meshFloor);


	ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
	scene.add(ambientLight);

	light = new THREE.PointLight(0xffffff, 0.8, 18);
	light.position.set(-3, 6, -3);
	light.castShadow = true;
	light.shadow.camera.near = 0.1;
	light.shadow.camera.far = 25;
	scene.add(light);


	// let textureLoader = new THREE.TextureLoader(loadingManager);
	// crateTexture = textureLoader.load("crate0/crate0_diffuse.jpg");
	// crateBumpMap = textureLoader.load("crate0/crate0_bump.jpg");
	// crateNormalMap = textureLoader.load("crate0/crate0_normal.jpg");

	// crate = new THREE.Mesh(
	// 	new THREE.BoxGeometry(3, 3, 3),
	// 	new THREE.MeshPhongMaterial({
	// 		color: 0xffffff,
	// 		map: crateTexture,
	// 		bumpMap: crateBumpMap,
	// 		normalMap: crateNormalMap
	// 	})
	// );
	// scene.add(crate);
	// crate.position.set(2.5, 3 / 2, 2.5);
	// crate.receiveShadow = true;
	// crate.castShadow = true;

	for (let _key in models) {
		(function (key) {

			let mtlLoader = new THREE.MTLLoader(loadingManager);
			mtlLoader.load(models[key].mtl, function (materials) {
				materials.preload();

				let objLoader = new THREE.OBJLoader(loadingManager);

				objLoader.setMaterials(materials);
				objLoader.load(models[key].obj, function (mesh) {

					mesh.traverse(function (node) {
						if (node instanceof THREE.Mesh) {
							if ('castShadow' in models[key])
								node.castShadow = models[key].castShadow;
							else
								node.castShadow = true;

							if ('receiveShadow' in models[key])
								node.receiveShadow = models[key].receiveShadow;
							else
								node.receiveShadow = true;
						}
					});
					models[key].mesh = mesh;

				});
			});

		})(_key);
	}


	camera.position.set(0, player.height, -5);
	camera.lookAt(new THREE.Vector3(0, player.height, 0));

	let materialArray = [];
	let texture_ft = new THREE.TextureLoader().load('../img/corona_ft.png');
	let texture_bk = new THREE.TextureLoader().load('../img/corona_bk.png');
	let texture_up = new THREE.TextureLoader().load('../img/corona_up.png');
	let texture_dn = new THREE.TextureLoader().load('../img/corona_dn.png');
	let texture_rt = new THREE.TextureLoader().load('../img/corona_rt.png');
	let texture_lf = new THREE.TextureLoader().load('../img/corona_lf.png');

	materialArray.push(new THREE.MeshBasicMaterial({ map: texture_ft }));
	materialArray.push(new THREE.MeshBasicMaterial({ map: texture_bk }));
	materialArray.push(new THREE.MeshBasicMaterial({ map: texture_up }));
	materialArray.push(new THREE.MeshBasicMaterial({ map: texture_dn }));
	materialArray.push(new THREE.MeshBasicMaterial({ map: texture_rt }));
	materialArray.push(new THREE.MeshBasicMaterial({ map: texture_lf }));

	for (let i = 0; i < 6; i++)
		materialArray[i].side = THREE.BackSide;

	let skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000);
	let skybox = new THREE.Mesh(skyboxGeo, materialArray);
	scene.add(skybox);

	animate();
}

// Runs when all resources are loaded
function onResourcesLoaded() {

	// // Clone models into meshes.
	// meshes["tent1"] = models.tent.mesh.clone();
	// meshes["tent2"] = models.tent.mesh.clone();
	// meshes["campfire1"] = models.campfire.mesh.clone();
	// meshes["campfire2"] = models.campfire.mesh.clone();
	// meshes["pirateship"] = models.pirateship.mesh.clone();

	// // Reposition individual meshes, then add meshes to scene
	// meshes["tent1"].position.set(-5, 0, 4);
	// scene.add(meshes["tent1"]);

	// meshes["tent2"].position.set(-8, 0, 4);
	// scene.add(meshes["tent2"]);

	// meshes["campfire1"].position.set(-5, 0, 1);
	// meshes["campfire2"].position.set(-8, 0, 1);

	// scene.add(meshes["campfire1"]);
	// scene.add(meshes["campfire2"]);

	// meshes["pirateship"].position.set(-11, -1, 1);
	// meshes["pirateship"].rotation.set(0, Math.PI, 0); // Rotate it to face the other way.
	// scene.add(meshes["pirateship"]);

	// player weapon
	meshes["playerweapon"] = models.machine_gun.mesh.clone();
	meshes["playerweapon"].position.set(0, 1, 0);
	meshes["playerweapon"].scale.set(0.12, 0.12, 0.12);
	scene.add(meshes["playerweapon"]);
}

function animate() {

	if (resourcesLoaded == false) {
		requestAnimationFrame(animate);
		renderer.render(loadingScreen.scene, loadingScreen.camera);
		return;
	}

	let time = Date.now() * 0.0005;
	let delta = clock.getDelta();

	// mesh.rotation.x += 0.01;
	// mesh.rotation.y += 0.02;
	// crate.rotation.y += 0.01;

	// go through bullets array and update position
	// remove bullets when appropriate
	for (let index = 0; index < bullets.length; index += 1) {
		if (bullets[index] === undefined) continue;
		if (bullets[index].alive == false) {
			bullets.splice(index, 1);
			continue;
		}

		bullets[index].position.add(bullets[index].velocity);
	}

	if (keyboard[87]) { // W key
		camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
		camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
	}
	if (keyboard[83]) { // S key
		camera.position.x += Math.sin(camera.rotation.y) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
	}
	if (keyboard[65]) { // A key
		camera.position.x += Math.sin(camera.rotation.y + Math.PI / 2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y + Math.PI / 2) * player.speed;
	}
	if (keyboard[68]) { // D key
		camera.position.x += Math.sin(camera.rotation.y - Math.PI / 2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y - Math.PI / 2) * player.speed;
	}

	if (keyboard[37]) { // left arrow key
		camera.rotation.y -= player.turnSpeed;
	}
	if (keyboard[39]) { // right arrow key
		camera.rotation.y += player.turnSpeed;
	}

	// shoot a bullet
	if (keyboard[32] && player.canShoot <= 0) { // spacebar key
		// creates a bullet as a Mesh object
		let bullet = new THREE.Mesh(
			new THREE.SphereGeometry(0.05, 8, 8),
			new THREE.MeshBasicMaterial({ color: 0xffffff })
		);

		//TODO: fix bullet position
		bullet.position.set(
			meshes["playerweapon"].position.x,
			meshes["playerweapon"].position.y + 0.1,
			meshes["playerweapon"].position.z 
		);

		// set the velocity of the bullet
		bullet.velocity = new THREE.Vector3(
			-Math.sin(camera.rotation.y),
			0,
			Math.cos(camera.rotation.y)
		);

		// after 1000ms, set alive to false and remove from scene
		// setting alive to false flags our update code to remove
		// the bullet from the bullets array
		bullet.alive = true;
		setTimeout(function () {
			bullet.alive = false;
			scene.remove(bullet);
		}, 1000);

		// add to scene, array, and set the delay to 10 frames
		bullets.push(bullet);
		scene.add(bullet);
		player.canShoot = 10;
	}
	if (player.canShoot > 0) player.canShoot -= 1;

	// position the gun in front of the camera
	meshes["playerweapon"].position.set(
		camera.position.x - Math.sin(camera.rotation.y + Math.PI / 6) * 0.75,
		camera.position.y - 0.5 + Math.sin(time * 4 + camera.position.x + camera.position.z) * 0.01,
		camera.position.z + Math.cos(camera.rotation.y + Math.PI / 6) * 0.75
	);
	meshes["playerweapon"].rotation.set(
		camera.rotation.x,
		camera.rotation.y + Math.PI,
		camera.rotation.z
	);

	renderer.render(scene, camera);
	requestAnimationFrame(animate);
}

function keyDown(event) {
	keyboard[event.keyCode] = true;
}

function keyUp(event) {
	keyboard[event.keyCode] = false;
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

//for debug purpose left uncomment
window.onload = init;
