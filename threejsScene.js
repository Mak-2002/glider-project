import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { starting_position } from './physics.js'

// 3D scene objects
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight,
    0.1, // near clipping plane
    1000 // far clipping plane
);

const renderer = new THREE.WebGLRenderer({ antialias: true });

const controls = new OrbitControls(camera, renderer.domElement);

// Set some optional OrbitControls settings
controls.enableDamping = true;
controls.dampingFactor = 0.05;
controls.rotateSpeed = 0.1;

let gliderModel;

function initialize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    // Add an environment light
    const light = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
    scene.add(light);

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
            gliderModel.position.copy(starting_position);
            console.log(starting_position);
        },
        undefined,
        function (error) {
            console.error(error);
        }
    );
    window.addEventListener("resize", onWindowResize);
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

export {
    scene,
    camera,
    renderer,
    initialize,
    gliderModel,
    controls
};