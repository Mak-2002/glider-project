import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);


//* Adding ambient light to the scene
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);


//* Loading the glider 3D model
const loader = new GLTFLoader();
loader.load('/glider.glb',
    function (glider_gltf) { // callback function called after loading
        scene.add(glider_gltf.scene);
    }, undefined, // onProgress callback function undefined
    function (error) { // callback function called if an error occurred
        console.error(error);
    }
);


//* Creating skybox
const skyboxLoader = new THREE.CubeTextureLoader();
const skyboxTexture = skyboxLoader.load([
    'skybox/right.bmp',
    'skybox/left.bmp',
    'skybox/top.bmp',
    'skybox/bottom.bmp',
    'skybox/front.bmp',
    'skybox/back.bmp'
]);
scene.background = skyboxTexture;


//* Creating a ground plane
const groundGeometry = new THREE.PlaneGeometry(10, 10);
const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
const ground = new THREE.Mesh(groundGeometry, groundMaterial);
ground.rotation.x = -Math.PI / 2; // Rotate the ground to be horizontal
scene.add(ground);


//* Define the camera rotation center 
const center = new THREE.Vector3(0, 0, 0); // Replace with your desired rotation center

/**
 ** Animation Loop
 */
function animate() {
    requestAnimationFrame(animate);

    /// glider_gltf.scene.rotation.y += 0.01;

    //* Rotating the Camera
    const radius = 10; // Replace with desired radius
    const angle = Date.now() * 0.001; // Replace with desired rotation speed
    const positionX = center.x + radius * Math.cos(angle);
    const positionZ = center.z + radius * Math.sin(angle);
    camera.position.set(positionX, camera.position.y, positionZ);

    // Point the camera towards the rotation center
    camera.lookAt(center);

    renderer.render(scene, camera);
}
animate();