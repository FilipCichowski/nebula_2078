
var scene, camera, renderer, mesh;
var meshFloor;

var keyboard = {};
var player = { height: 1.8, speed: 2, turnSpeed: Math.PI * 0.01 };
var USE_WIREFRAME = false;

function init() {
	document.getElementById("wrapper").style.display = "none";

	scene = new THREE.Scene();
	camera = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 45, 30000);

	camera.position.set(0, player.height, -5);
	camera.lookAt(new THREE.Vector3(0, player.height , 0));

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setSize(window.innerWidth, window.innerHeight);
	document.body.appendChild(renderer.domElement);

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

	generateFloor()

	animate();
}

function animate() {
	requestAnimationFrame(animate);

	// Keyboard movement inputs
	if (keyboard[87]) { // W key
		camera.position.x -= Math.sin(camera.rotation.y) * player.speed;
		camera.position.z -= -Math.cos(camera.rotation.y) * player.speed;
	}
	if (keyboard[83]) { // S key
		camera.position.x += Math.sin(camera.rotation.y) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y) * player.speed;
	}
	if (keyboard[65]) { // A key
		// Redirect motion by 90 degrees
		camera.position.x += Math.sin(camera.rotation.y + Math.PI / 2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y + Math.PI / 2) * player.speed;
	}
	if (keyboard[68]) { // D key
		camera.position.x += Math.sin(camera.rotation.y - Math.PI / 2) * player.speed;
		camera.position.z += -Math.cos(camera.rotation.y - Math.PI / 2) * player.speed;
	}

	// Keyboard turn inputs
	if (keyboard[37]) { // left arrow key
		camera.rotation.y -= player.turnSpeed;
	}
	if (keyboard[39]) { // right arrow key
		camera.rotation.y += player.turnSpeed;
	}

	renderer.render(scene, camera);
}

function keyDown(event) {
	keyboard[event.keyCode] = true;
}

function keyUp(event) {
	keyboard[event.keyCode] = false;
}

window.addEventListener('keydown', keyDown);
window.addEventListener('keyup', keyUp);

function generateFloor() {
	meshFloor = new THREE.Mesh(
		new THREE.PlaneGeometry(1000, 1000, 10, 10),
		new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true})
	);
	meshFloor.rotation.x -= Math.PI / 2; // Rotate the floor 90 degrees
	meshFloor.position.y = meshFloor.position.y - 50
	scene.add(meshFloor);
}
