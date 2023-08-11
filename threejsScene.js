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


/**
 * Create the ground plane geometry
*/
function create_ground_plane() {
    const planeWidth = 10;
    const planeHeight = 10;
    const planeSegments = 50;

    const geometry = new THREE.PlaneGeometry(planeWidth, planeHeight, planeSegments, planeSegments);

    // Define the height of each vertex
    const positionAttribute = geometry.attributes.position;
    const vertexCount = positionAttribute.count;
    const vertexHeight = new Float32Array(vertexCount);

    const randomRange = 0.5; // Adjust this to control the mountain shape

    for (let i = 0; i < vertexCount; i++) {
        const x = positionAttribute.getX(i);
        const y = positionAttribute.getY(i);
        const noise = Math.random() * randomRange;
        // Calculate the height using a mountain-like function
        const height = noise * Math.sin(x * 10) * Math.sin(y * 10);
        positionAttribute.setZ(i, height);
        vertexHeight[i] = height;
    }

    geometry.attributes.position.needsUpdate = true;
    geometry.setAttribute('height', new THREE.BufferAttribute(vertexHeight, 1));

    // Create a material
    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load('/textures/rocky_mountain.jpg',
        function (loadedTexture) {
            // Texture loaded successfully
            material.map = loadedTexture;
            material.needsUpdate = true;
        },
        undefined,
        function (error) {
            // Error callback
            console.error('Texture loading error:', error);
        }
    );
    const material = new THREE.MeshLambertMaterial({ map: texture });
    console.log(texture);

    // Create a mesh and add it to the scene
    const ground = new THREE.Mesh(geometry, material);

    // Rotate the mesh to be vertical
    ground.rotation.x = Math.PI / 2;

    // Position the ground plane higher
    ground.position.y = 1;

    scene.add(ground);
}



/**
 * Create the sky box
 */
function create_sky_box() {
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
}

/**
 * loads the glider model
 */
function load_glider_model() {
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

/**
 * Add an environment light
 */
function add_light() {
    const light = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
    scene.add(light);

}

function initialize() {
    renderer.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(renderer.domElement);

    create_sky_box(),
        add_light(),
        create_ground_plane(),
        load_glider_model();
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