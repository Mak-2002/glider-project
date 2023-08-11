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
let CD = 0; //? drag coefficient

let K4 = 0,
  K5 = 0,
  A1 = 0; //? experimental constants for lift coefficient

let mass_of_glider = 0; //? mass of the glider

//? Geometric characteristics of the glider:
let wingspan = 0;
let wingarea = 0;
let fuselageLength = 0;
let fuselageHeight = 0;
let tailHeight = 0;
let tailSpan = 0;

let wind_speed = 0; //? wind speed relative to the wing of the glider
let air_temperature = 0; //? air temperature
let atmospheric_pressure = 0; //? atmospheric pressure


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
let values_to_watch = {
  temp:0,
}

function init_gui() {

  //* Factors to Change
  const factors = {
    CD: 0,
    K4: 0,
    K5: 0,
    A1: 0,
    mass_of_glider: 0,
    wingspan: 0,
    wingarea: 0,
    fuselageLength: 0,
    fuselageHeight: 0,
    tailHeight: 0,
    tailSpan: 0,
    wind_speed: 0,
    air_temperature: 0,
    atmospheric_pressure: 0,
  };
  gui.add(factors, 'CD', 1, 30).name('Drag Coefficient').onChange(() => {
    CD = factors.CD;
    console.log(`CD: ${CD}`);
  });

  gui.add(factors, 'K4', 1, 10).name('Left Co K4 const').onChange(() => {
    K4 = factors.K4;
    console.log(`K4: ${K4}`);
  });

  gui.add(factors, 'K5', 1, 10).name('Left Co K5 const').onChange(() => {
    K5 = factors.K5;
    console.log(`K5: ${K5}`);
  });

  gui.add(factors, 'A1', 1, 10).name('Left Co A1 const').onChange(() => {
    A1 = factors.A1;
    console.log(`A1: ${A1}`);
  });

  gui.add(factors, 'mass_of_glider', 20, 2000).name('Mass of Glider').onChange(() => {
    mass_of_glider = factors.mass_of_glider;
    console.log(`mass_of_glider: ${mass_of_glider}`);
  });


  gui.add(factors, 'wingarea', 1, 20).name('Wing Area').onChange(() => {
    wingarea = factors.wingarea;
    console.log(`wingarea: ${wingarea}`);
  });

  gui.add(factors, 'wind_speed', 1, 10).name('Wind Speed').onChange(() => {
    wind_speed = factors.wind_speed;
    console.log(`wind_speed: ${wind_speed}`);
  });

  gui.add(factors, 'air_temperature', 0, 40).name('Air Temperature').onChange(() => {
    air_temperature = factors.air_temperature;
    console.log(`air_temperature: ${air_temperature}`);
  });

  gui.add(factors, 'atmospheric_pressure', 1, 200).name('Atmos Pressure').onChange(() => {
    atmospheric_pressure = factors.atmospheric_pressure;
    console.log(`atmospheric_pressure: ${atmospheric_pressure}`);
  });

  // gui.add(factors, 'wingspan').name('wingspan').onChange(() => {
  //   wingspan = factors.wingspan;
  //   console.log(`wingspan: ${wingspan}`);
  // });

  // gui.add(factors, 'fuselageLength').name('fuselageLength').onChange(() => {
  //   fuselageLength = factors.fuselageLength;
  //   console.log(`fuselageLength: ${fuselageLength}`);
  // });

  // gui.add(factors, 'fuselageHeight').name('fuselageHeight').onChange(() => {
  //   fuselageHeight = factors.fuselageHeight;
  //   console.log(`fuselageHeight: ${fuselageHeight}`);
  // });

  // gui.add(factors, 'tailHeight').name('tailHeight').onChange(() => {
  //   tailHeight = factors.tailHeight;
  //   console.log(`tailHeight: ${tailHeight}`);
  // });

  // gui.add(factors, 'tailSpan').name('tailSpan').onChange(() => {
  //   tailSpan = factors.tailSpan;
  //   console.log(`tailSpan: ${tailSpan}`);
  // });

  //* Values to Watch

  gui.add(values_to_watch, 'temp').listen();
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

function update_values() {
  
}

function animate() {
  renderer.render(scene, camera);
  update_values();
  requestAnimationFrame(animate);
}

init();
