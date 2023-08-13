import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import * as dat from "dat.gui"

//!!!!!!!!!!!! Physics !!!!!!!!!!!!!!

// Constant factors in the study
const g = 9.8 //? acceleration due to gravity
const R = 287.058 //? specific gas constant for dry air
const SEA_LEVEL_PRESSURE = 101325
var I = 0


// Assignable Factors
var drag_coefficient = 1 //? drag coefficient
var lift_coefficient = 2 //? lift coefficient

var mass_of_glider = 100 //? mass of the glider

//? Geometric characteristics of the glider:
var wingspan = 0
var wing_area = 1
var fuselageLength = 0
var fuselageHeight = 0
var tailHeight = 0
var tailSpan = 0
var projected_area = 2
var glider_lenght = 2

var air_speed = 0 //? wind speed relative to the wing of the glider
var air_temperature = 15 //? air temperature
var atmospheric_pressure = 0 //? atmospheric pressure


// Working variables
var angular_velocity = new THREE.Vector3(1, 1, 1) //? instantaneous angular velocity

var lift_coefficient = 0 //? lift coefficient
var air_density = 0 //? air density

var starting_position = new THREE.Vector3(0, 0, 1) //? starting position 
var position = new THREE.Vector3()

var starting_speed_glider_frame = 1
var speed_glider_frame = 0 //? linear velocity

var linear_velocity = new THREE.Vector3()

var starting_euler_angles = new THREE.Vector3(0, 1, 1) //? initial pitch, roll, and yaw angles
var euler_angles = {
  pitch: 0,
  yaw: 0,
  roll: 0
} //? pitch, roll, and yaw angles (Euler angles)

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


var scene, camera, renderer

var glider_model

const gui = new dat.GUI()
var monitored_values = {
  speed: 0.0001,
  altitude: 0
}

function init_gui() {

  //* Factors to Change
  const factors = {
    drag_coefficient: 0,
    lift_coefficient: 2,
    mass_of_glider: 0,
    wingspan: 0,
    wing_area: 0,
    fuselageLength: 0,
    fuselageHeight: 0,
    tailHeight: 0,
    tailSpan: 0,
    air_speed: 0,
    air_temperature: 0,
    atmospheric_pressure: 0,
  }
  gui.add(factors, 'drag_coefficient', 1, 100).name('Drag Coefficient').onChange(() => {
    drag_coefficient = factors.drag_coefficient
    console.log(`drag_coefficient: ${drag_coefficient}`)
  })

  gui.add(factors, 'lift_coefficient', 1, 100).name('Left Coefficient').onChange(() => {
    lift_coefficient = factors.lift_coefficient
    console.log(`lift_coefficient: ${lift_coefficient}`)
  })

  gui.add(factors, 'mass_of_glider', 20, 2000).name('Mass of Glider').onChange(() => {
    mass_of_glider = factors.mass_of_glider
    console.log(`mass_of_glider: ${mass_of_glider}`)
  })


  gui.add(factors, 'wing_area', 1, 20).name('Wing Area').onChange(() => {
    wing_area = factors.wing_area
    console.log(`wing_area: ${wing_area}`)
  })

  gui.add(factors, 'air_speed', 1, 10).name('Wind Speed').onChange(() => {
    air_speed = factors.air_speed
    console.log(`air_speed: ${air_speed}`)
  })

  gui.add(factors, 'air_temperature', 0, 40).name('Air Temperature').onChange(() => {
    air_temperature = factors.air_temperature
    console.log(`air_temperature: ${air_temperature}`)
  })

  gui.add(factors, 'atmospheric_pressure', 1, 200).name('Atmos Pressure').onChange(() => {
    atmospheric_pressure = factors.atmospheric_pressure
    console.log(`atmospheric_pressure: ${atmospheric_pressure}`)
  })


  //* Values to Watch

  const controller1 = gui.add(monitored_values, 'speed').name('Speed').listen()
  controller1.domElement.style.pointerEvents = 'none'
  controller1.domElement.style.opacity = 0.5

  const controller2 = gui.add(monitored_values, 'altitude').name('Altitude').listen()
  controller2.domElement.style.pointerEvents = 'none'
  controller2.domElement.style.opacity = 0.5
  console.log(monitored_values.altitude);

}
function init_camera() {
  camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1, // near clipping plane
    10000 // far clipping plane
  )
  camera.position.set(0, 0, 10) // Move the camera outside the skybox

}

function add_orbit_controls() {
  // Create OrbitControls and add them to the scene
  const controls = new OrbitControls(camera, renderer.domElement)

  // Set some optional OrbitControls settings
  controls.enableDamping = true // Smoother camera movements
  controls.dampingFactor = 0.05 // Damping factor for smoother movements
  controls.rotateSpeed = 0.1 // Adjust the rotation speed

}

function add_sky_box() {
  const texture_ft = new THREE.TextureLoader().load("/textures/skyrender0005.jpg")//right
  const texture_bk = new THREE.TextureLoader().load("/textures/skyrender0002.jpg")//left
  const texture_up = new THREE.TextureLoader().load("/textures/skyrender0003.jpg")//up
  const texture_dn = new THREE.TextureLoader().load("/textures/skyrender0006.jpg")//bottom
  const texture_rt = new THREE.TextureLoader().load("/textures/skyrender0004.jpg")
  const texture_lf = new THREE.TextureLoader().load("/textures/skyrender0001.jpg")

  const materialArray = [
    new THREE.MeshBasicMaterial({ map: texture_ft, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ map: texture_bk, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ map: texture_up, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ map: texture_dn, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ map: texture_rt, side: THREE.DoubleSide }),
    new THREE.MeshBasicMaterial({ map: texture_lf, side: THREE.DoubleSide }),
  ]

  const skyboxGeo = new THREE.BoxGeometry(10000, 10000, 10000)
  const skybox = new THREE.Mesh(skyboxGeo, materialArray)

  scene.add(skybox)

}

function add_light() {
  // Add an environment light
  const light = new THREE.HemisphereLight(0xffffff, 0x000000, 1)
  scene.add(light)

}

function add_glider_model() {
  // Load the 3D model
  const loader = new GLTFLoader()
  loader.load(
    '/models/glider.glb',

    (gltf) => {
      scene.add(gltf.scene)
      glider_model = gltf.scene
      glider_model.rotateY(Math.PI);
    },


    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },
    function (error) {
      console.error('Error loading model:', error)
    }
  )
}
function add_land(){
  var radius = 30;
var widthSegments = 50;
var heightSegments = 50;
var sphereGeometry = new THREE.SphereGeometry(radius, widthSegments, heightSegments);
sphereGeometry.scale(200, 3, 120); 
sphereGeometry.translate(-1000,-100,-5100)
//sphereGeometry.rotateX(5)
var textureLoader = new THREE.TextureLoader();
var landTexture = textureLoader.load('/textures/grass.jpg');
var sphereMaterial = new THREE.MeshPhongMaterial({ map: landTexture });


var sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
scene.add(sphereMesh);
}

function init() {
  scene = new THREE.Scene()
  init_camera()
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)


  add_orbit_controls()
  add_sky_box()
  add_land()
  add_light()

  add_glider_model()
  init_gui()

  window.addEventListener("resize", onWindowResize)

  // Assign starting values
  linear_velocity = new THREE.Vector3(starting_speed_glider_frame, 0, 0)
  position.copy(starting_position)
  I = (1 / 12) * mass_of_glider * Math.pow(glider_lenght, 2);

  animate()
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function update_monitored_values() {
  // update the monitored values in gui
  monitored_values.speed = speed_glider_frame
  monitored_values.altitude = position.z;
}


function glider_to_world_trans(vector) {
  var rotationMatrixPitch = new THREE.Matrix4().makeRotationX(euler_angles.pitch)
  var rotationMatrixYaw = new THREE.Matrix4().makeRotationY(euler_angles.yaw)
  var rotationMatrixRoll = new THREE.Matrix4().makeRotationZ(euler_angles.roll)
  
  var glider_world_trans_matrix = new THREE.Matrix4()
  
  glider_world_trans_matrix.multiply(rotationMatrixRoll)
  glider_world_trans_matrix.multiply(rotationMatrixYaw)
  glider_world_trans_matrix.multiply(rotationMatrixPitch)

  var resulted_vector = vector.clone();
  resulted_vector.applyMatrix4(glider_world_trans_matrix)
  return resulted_vector
}

function world_to_glider_trans(vector) {
  var rotationMatrixPitch = new THREE.Matrix4().makeRotationX(-euler_angles.pitch)
  var rotationMatrixYaw = new THREE.Matrix4().makeRotationY(-euler_angles.yaw)
  var rotationMatrixRoll = new THREE.Matrix4().makeRotationZ(-euler_angles.roll)

  var world_glider_trans_matrix = new THREE.Matrix4()
  
  world_glider_trans_matrix.multiply(rotationMatrixRoll)
  world_glider_trans_matrix.multiply(rotationMatrixYaw)
  world_glider_trans_matrix.multiply(rotationMatrixPitch)

  var resulted_vector = vector.clone();
  resulted_vector.applyMatrix4(world_glider_trans_matrix)
  return resulted_vector
}


function calc_lift() {
  // Calculate lift in glider body-fixed frame
  var lift = 0.5 * air_density * Math.pow(speed_glider_frame, 2) * wing_area * lift_coefficient
  lift = new THREE.Vector3(0, 0, lift)

  // Transform to World frame
  lift.copy(glider_to_world_trans(lift))

  return lift
}

function calc_drag() {
  // Calculate drag in glider body-fixed frame
  var drag = 0.5 * air_density * Math.pow(speed_glider_frame, 2) * drag_coefficient * projected_area
  drag = new THREE.Vector3(-drag, 0, 0)

  // Transform to World frame
  drag.copy(glider_to_world_trans(drag))

  return drag
}

function linear_movement() {

  speed_glider_frame = world_to_glider_trans(linear_velocity).x
  console.log(world_to_glider_trans(linear_velocity))

  //* Calculate Forces
  var lift = calc_lift()
  var drag = calc_drag()
  var weight = new THREE.Vector3(0, 0, -mass_of_glider * g)
  
  var aero_force = new THREE.Vector3().add(lift).add(drag).add(weight)
  var acceleration = aero_force.divideScalar(mass_of_glider)

  // Euler's method in integeration to find velocity and position
  var delta_time = clock.getDelta() / 4 // make it slower to match with real time
  linear_velocity.copy(linear_velocity.clone().add(acceleration.multiplyScalar(delta_time)))

  //Update Position
  position.copy(position.add(linear_velocity.clone().multiplyScalar(delta_time)))
  if (glider_model) glider_model.position.copy(position)
}

const clock = new THREE.Clock()
function animate() {
  renderer.render(scene, camera)

  atmospheric_pressure = SEA_LEVEL_PRESSURE * Math.exp(-position.z / 7000)
  air_density = atmospheric_pressure / (R * air_temperature) //? air density

  linear_movement();

  

  update_monitored_values()
  requestAnimationFrame(animate)
}

init()
