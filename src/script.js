import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import * as dat from "dat.gui";

//!!!!!!!!!!!! Physics !!!!!!!!!!!!!!

// Constant factors in the study
const g = 9.8; //? acceleration due to gravity
const R = 287.058; //? specific gas constant for dry air
const SEA_LEVEL_PRESSURE = 101325;
// Pr = SEA_LEVEL_PRESSURE * Math.exp(-altitude / 7000); // simplified, assumes standard atmospheric conditions

let I = [
  [0, 0, 0],
  [0, 0, 0],
  [0, 0, 0]
]; //? moment of inertia tensor


// Assignable Factors
let CD; //? drag coefficient

let K4 = 0,
  K5 = 0,
  A1 = 0; //? experimental constants for lift coefficient

let mass_of_glider = 0; //? mass of the glider

//? Geometric characteristics of the glider:
let wingspan;
let wingarea;
let fuselageLength;
let fuselageHeight;
let tailHeight;
let tailSpan;

let wind_speed; //? wind speed relative to the wing of the glider
let air_temperature; //? air temperature
let atmospheric_pressure; //? atmospheric pressure


// Working variables
let angular_velocity = new THREE.Vector3(1, 1, 1); //? instantaneous angular velocity

let CL = A1 * (K4 * Math.pow(wind_speed, 2) + K5); //? lift coefficient
let air_density = atmospheric_pressure / (R * air_temperature); //? air density

let starting_position = new THREE.Vector3(0, 5, 0); //? starting position 

let starting_linear_veloctiy = new THREE.Vector3(1, 0, 1);
let linear_velocity = new THREE.Vector3(0, 0, 0); //? linear velocity

let starting_euler_angles = new THREE.Vector3(0, 1, 1); //? initial pitch, roll, and yaw angles
let euler_angles = new THREE.Vector3(0, 1, 1); //? pitch, roll, and yaw angles (Euler angles)

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


let scene, camera, renderer;

const gui = new dat.GUI();
function init_gui() {
  const factors = {
    CD: null,
    K4: 0,
    K5: 0,
    A1: 0,
    mass_of_glider: 0,
    wingspan: null,
    wingarea: null,
    fuselageLength: null,
    fuselageHeight: null,
    tailHeight: null,
    tailSpan: null,
    wind_speed: null,
    air_temperature: null,
    atmospheric_pressure: null,
  };
  gui
    .add(factors, 'mass_of_glider', 20, 2000).onChange(()=>{
      mass_of_glider = factors.mass_of_glider;
      console.log(mass_of_glider);
    })
    .name("Mass of Glider");
}

function init_camera() {
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1, // near clipping plane
    10000 // far clipping plane
  );
  camera.position.set(0, 0, 10); // Move the camera outside the skybox

}

function add_orbit_controls() {
  // Create OrbitControls and add them to the scene
  const controls = new OrbitControls(camera, renderer.domElement);

  // Set some optional OrbitControls settings
  controls.enableDamping = true; // Smoother camera movements
  controls.dampingFactor = 0.05; // Damping factor for smoother movements
  controls.rotateSpeed = 0.1; // Adjust the rotation speed

}

function add_sky_box() {
  const texture_ft = new THREE.TextureLoader().load("/textures/skyrender0005.jpg");//right
  const texture_bk = new THREE.TextureLoader().load("/textures/skyrender0002.jpg");//left
  const texture_up = new THREE.TextureLoader().load("/textures/skyrender0003.jpg");//up
  const texture_dn = new THREE.TextureLoader().load("/textures/skyrender0006.jpg");//bottom
  const texture_rt = new THREE.TextureLoader().load("/textures/skyrender0004.jpg");
  const texture_lf = new THREE.TextureLoader().load("/textures/skyrender0001.jpg");

  const materialArray = [
    new THREE.MeshBasicMaterial({ map: texture_ft, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ map: texture_bk, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ map: texture_up, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ map: texture_dn, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ map: texture_rt, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ map: texture_lf, side: THREE.DoubleSide }),
  ];

  const skyboxGeo = new THREE.BoxGeometry(8000, 8000, 8000);
  const skybox = new THREE.Mesh(skyboxGeo, materialArray);

  scene.add(skybox);

}

function add_light() {
  // Add an environment light
  const light = new THREE.HemisphereLight(0xffffff, 0x000000, 1);
  scene.add(light);

}

function add_glider_model() {
  // Load the 3D model
  const loader = new GLTFLoader();
  loader.load(
    '/models/glider.glb',

    (gltf) => {
      scene.add(gltf.scene)
    },


    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded');
    },
    function (error) {
      console.error('Error loading model:', error);
    }
  );
}

function init() {
  scene = new THREE.Scene();
  init_camera();
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);


  add_orbit_controls();
  add_sky_box();
  add_light();

  add_glider_model();
  init_gui();


  window.addEventListener("resize", onWindowResize);
  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  renderer.render(scene, camera);
  requestAnimationFrame(animate);
}

init();
