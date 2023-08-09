import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

// 3D scene objects
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();

let gliderModel;

function initialize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Adding ambient light to the scene
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
    scene.add(ambientLight);

    // Creating skybox
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

    // Creating a ground plane
    const groundGeometry = new THREE.PlaneGeometry(10, 10);
    const groundMaterial = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
    const ground = new THREE.Mesh(groundGeometry, groundMaterial);
    ground.rotation.x = -Math.PI / 2; // Rotate the ground to be horizontal
    scene.add(ground);

    // Loading the glider 3D model
    const loader = new GLTFLoader();
    loader.load(
        '/glider.glb',
        function (gliderGltf) {
            gliderModel = gliderGltf.scene;
            scene.add(gliderModel);
        },
        undefined,
        function (error) {
            console.error(error);
        }
    );
}

export {
    scene,
    camera,
    renderer,
    gliderModel,
    initialize
}
