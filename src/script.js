import * as THREE from "three"
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls"
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader"
import * as dat from "dat.gui"




//!!!!!!!!!!!! Physics !!!!!!!!!!!!!!
// Constant factors in the study
const R = 287.058 // specific gas constant for dry air
const SEA_LEVEL_PRESSURE = 101325
var I = 0

// Assignable Factors
var g = 9.81 // acceleration due to gravity

var drag_coefficient = 0.021 // drag coefficient
var lift_coefficient = 0.9 // lift coefficient

var mass_of_glider = 500 // mass of the glider

// Geometric characteristics of the glider:
var wingspan = 15 // meters
var wing_area = 21.0 // square meters
var fuselageLength = 4 // meters
var fuselageHeight = 0.5 // meters
var tailHeight = 0.6 // meters
var tailSpan = 4 // meters
var projected_area = 18.0 // square meters
var glider_length = 6 // meters, projected area of the glider

var air_temperature = 288.15 // Kelvin (15°C)
var atmospheric_pressure = 101000 // Pascal

// Working variables
var air_density = 1.225 // kg/m^3, air density at sea level

var position = new THREE.Vector3(0, 1500, 0)

var longitudinal_speed = 20 // meters per second, initial speed of the glider

var linear_velocity = new THREE.Vector3(0, 0, 20)

// var starting_euler_angles = new THREE.Vector3(0, 0, 0) // initial pitch, roll, and yaw angles
var euler_angles = {
  pitch: 0,
  yaw: 0,
  roll: 0
} // pitch, roll, and yaw angles (Euler angles)

//!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!


// Simulation loop time
const clock = new THREE.Clock()
var delta_time

var scene, camera, renderer
var camera_offset = new THREE.Vector3(0, 4, -6)

var glider_model

const gui = new dat.GUI()
var monitored_values = {
  atmos_pressure: 0,
  longitudinal_speed: 0.0001,
  vertical_speed: 0.0001,
  altitude: 0,
  drag: 0.0,
  lift: 0.0,
  weight: 0.0,
}

//TODO: fix the code accordingly
//! Very Important
//* X is the lateral axis (pitch)
//* Y is the vertical axis (yaw)
//* Z is the longitudinal axis (roll)
//! 

//* Factors to Change
const factors = {
  drag_coefficient: 0,
  lift_coefficient: 0,
  mass_of_glider: 0,
  wing_area: 0,
  projected_area: 0,
  air_temperature: 0,
  atmospheric_pressure: 0,
  camera_offset_x: 0,
  camera_offset_y: 0,
  camera_offset_z: 0,
  initial_longi_speed: 0,
  initial_alt: 0,
  g,
}

function init_gui() {

  gui.width = 350

  const initial = gui.addFolder("Initial Factors")
  initial.open()

  factors.initial_longi_speed = linear_velocity.z
  initial.add(factors, 'initial_longi_speed', 10, 40).name('Initial Longitudinal Speed').onChange(() => {
    linear_velocity.z = factors.initial_longi_speed
  })

  factors.initial_alt = position.y
  initial.add(factors, 'initial_alt', 100, 3000).name('Initial Altitude').onChange(() => {
    position.y = factors.initial_alt
  })



  //* Monitor Lift and its factors
  const lift_folder = gui.addFolder('Lift')
  lift_folder.open()

  factors.lift_coefficient = lift_coefficient
  lift_folder.add(factors, 'lift_coefficient', 0.5, 1.5).name('Left Coefficient').onChange(() => {
    lift_coefficient = factors.lift_coefficient
  })

  factors.wing_area = wing_area
  lift_folder.add(factors, 'wing_area', 18, 21).name('Wing Area').onChange(() => {
    wing_area = factors.wing_area
  })

  const controller3 = lift_folder.add(monitored_values, 'lift').name('Lift').listen()
  controller3.domElement.style.pointerEvents = 'none'
  controller3.domElement.style.opacity = 0.5
  //*------------------------------


  //* Monitor Drag and its factors
  const drag_folder = gui.addFolder('Drag')
  drag_folder.open()

  factors.drag_coefficient = drag_coefficient
  drag_folder.add(factors, 'drag_coefficient', 0.018, 0.026).name('Drag Coefficient').onChange(() => {
    drag_coefficient = factors.drag_coefficient
  })

  factors.projected_area = projected_area
  drag_folder.add(factors, 'projected_area', 15, 25).name('Projected Area').onChange(() => {
    projected_area = factors.projected_area
  })

  const drag_controller = drag_folder.add(monitored_values, 'drag').name('Drag').listen()
  drag_controller.domElement.style.pointerEvents = 'none'
  drag_controller.domElement.style.opacity = 0.5
  //*------------------------------

  factors.g = g
  gui.add(factors, 'g', 2, 30).name('Acceleration due Gravity').onChange(() => {
    g = factors.g
  })


  factors.mass_of_glider = mass_of_glider
  gui.add(factors, 'mass_of_glider', 200, 1000).name('Mass of Glider').onChange(() => {
    mass_of_glider = factors.mass_of_glider
  })

  factors.air_temperature = air_temperature
  gui.add(factors, 'air_temperature', 260, 300).name('Air Temperature').onChange(() => {
    air_temperature = factors.air_temperature
  })

  const pressure_controller = gui.add(monitored_values, 'atmos_pressure').name('Atmospheric Pressure').listen()
  pressure_controller.domElement.style.pointerEvents = 'none'
  pressure_controller.domElement.style.opacity = 0.5

  const camera_folder = gui.addFolder('Camera')
  camera_folder.open()

  factors.camera_offset_x = camera_offset.x
  camera_folder.add(factors, 'camera_offset_x', -10, 10).name('Camera X').onChange(() => {
    camera_offset.x = factors.camera_offset_x
    look_at_glider()
  })

  factors.camera_offset_y = camera_offset.y
  camera_folder.add(factors, 'camera_offset_y', -10, 20).name('Camera Y').onChange(() => {
    camera_offset.y = factors.camera_offset_y
    look_at_glider()
  })

  factors.camera_offset_z = camera_offset.z
  camera_folder.add(factors, 'camera_offset_z', -40, 10).name('Camera Z').onChange(() => {
    camera_offset.z = factors.camera_offset_z
    look_at_glider()
  })


  //* Values to Watch

  const controller6 = gui.add(monitored_values, 'longitudinal_speed').name('Longitudinal Speed').listen()
  controller6.domElement.style.pointerEvents = 'none'
  controller6.domElement.style.opacity = 0.5

  const controller1 = gui.add(monitored_values, 'vertical_speed').name('Vertical Speed').listen()
  controller1.domElement.style.pointerEvents = 'none'
  controller1.domElement.style.opacity = 0.5

  const controller2 = gui.add(monitored_values, 'altitude').name('Altitude').listen()
  controller2.domElement.style.pointerEvents = 'none'
  controller2.domElement.style.opacity = 0.5

  const controller5 = gui.add(monitored_values, 'weight').name('Weight').listen()
  controller5.domElement.style.pointerEvents = 'none'
  controller5.domElement.style.opacity = 0.5

  var controls = { start_simulation: function () { animate() } }
  gui.add(controls, 'start_simulation').name('Start Simulation')

}

function init_camera() {
  camera = new THREE.PerspectiveCamera(
    90,
    window.innerWidth / window.innerHeight,
    0.1, // near clipping plane
    50000 // far clipping plane
  )
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
  const texture_ft = new THREE.TextureLoader().load("/textures/skyrender0005.jpg")
  const texture_bk = new THREE.TextureLoader().load("/textures/skyrender0002.jpg")
  const texture_up = new THREE.TextureLoader().load("/textures/skyrender0003.jpg")
  const texture_dn = new THREE.TextureLoader().load("/textures/skyrender0006.jpg")
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

  const skyboxGeo = new THREE.BoxGeometry(30000, 30000, 30000)
  const skybox = new THREE.Mesh(skyboxGeo, materialArray)

  scene.add(skybox)
}

function add_light() {
  // Add an environment light
  const light = new THREE.HemisphereLight(0xffffff, 0x000000, 1)
  scene.add(light)
}

const axisHelper = new THREE.AxesHelper(4)
function add_glider_model() {

  // Load the 3D model
  const loader = new GLTFLoader()
  loader.load(
    '/models/glider.glb',

    (gltf) => {
      scene.add(gltf.scene)
      glider_model = gltf.scene
      // glider_model.add(axisHelper) // DEBUG: shows visual axis on the glider to help
    },

    function (xhr) {
      console.log((xhr.loaded / xhr.total) * 100 + '% loaded')
    },

    function (error) {
      console.error('Error loading model:', error)
    }
  )
}

function add_land() {
  var widthSegments = 100
  var heightSegments = 100
  var sphereGeometry = new THREE.SphereGeometry(widthSegments, heightSegments)
  sphereGeometry.scale(2000, 0, 2000)
  sphereGeometry.translate(-1000, -0.65, -500)

  const texture = new THREE.TextureLoader().load('textures/grass.jpg')
  texture.wrapS = THREE.RepeatWrapping
  texture.wrapT = THREE.RepeatWrapping

  // Define how many times the texture should repeat
  const repeatX = 120
  const repeatY = 120
  texture.repeat.set(repeatX, repeatY)

  const sphereMaterial = new THREE.MeshBasicMaterial({ map: texture })

  var sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial)
  scene.add(sphereMesh)
}

function init() {
  scene = new THREE.Scene()

  init_camera()
  renderer = new THREE.WebGLRenderer({ antialias: true })
  renderer.setSize(window.innerWidth, window.innerHeight)
  document.body.appendChild(renderer.domElement)

  init_gui()

  // add_orbit_controls()
  look_at_glider()
  // add_key_controls()

  add_light()

  add_sky_box()
  add_glider_model()
  add_land()

  window.addEventListener("resize", onWindowResize)

  // Assign starting values
  I = (1 / 12) * mass_of_glider * Math.pow(glider_length, 2)
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight
  camera.updateProjectionMatrix()
  renderer.setSize(window.innerWidth, window.innerHeight)
}

function update_monitored_values() {
  // update the monitored values in gui
  monitored_values.atmos_pressure = atmospheric_pressure
  monitored_values.vertical_speed = world_to_glider_trans(linear_velocity).y
  monitored_values.longitudinal_speed = world_to_glider_trans(linear_velocity).z
  monitored_values.altitude = position.y
}


function glider_to_world_trans(vector) {
  var rotationMatrixPitch = new THREE.Matrix4().makeRotationX(euler_angles.pitch)
  var rotationMatrixYaw = new THREE.Matrix4().makeRotationY(euler_angles.yaw)
  var rotationMatrixRoll = new THREE.Matrix4().makeRotationZ(euler_angles.roll)

  var glider_world_trans_matrix = new THREE.Matrix4()

  glider_world_trans_matrix.multiply(rotationMatrixRoll)
  glider_world_trans_matrix.multiply(rotationMatrixYaw)
  glider_world_trans_matrix.multiply(rotationMatrixPitch)

  var resulted_vector = vector.clone()
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

  var resulted_vector = vector.clone()
  resulted_vector.applyMatrix4(world_glider_trans_matrix)
  return resulted_vector
}


function calc_lift() {
  // Calculate lift in glider body-fixed frame
  var lift = 0.5 * air_density * Math.pow(longitudinal_speed, 2) * wing_area * lift_coefficient
  monitored_values.lift = lift
  lift = new THREE.Vector3(0, lift, 0)
  // Transform to World frame
  lift.copy(glider_to_world_trans(lift))

  return lift
}

function calc_drag() {
  // Calculate drag in glider body-fixed frame
  var drag = 0.5 * air_density * Math.pow(longitudinal_speed, 2) * drag_coefficient * projected_area
  monitored_values.drag = drag
  drag = new THREE.Vector3(0, 0, -drag)
  // Transform to World frame
  drag.copy(glider_to_world_trans(drag))

  return drag
}

function calc_weight() {
  var weight = mass_of_glider * g
  monitored_values.weight = weight
  var weight = new THREE.Vector3(0, -weight, 0)
  return weight
}

var last_step = 0, current_step = 0

function linear_movement() {
  longitudinal_speed = world_to_glider_trans(linear_velocity).z

  //* Calculate Forces
  var lift = calc_lift()
  var drag = calc_drag()
  var weight = calc_weight()

  var aero_force = new THREE.Vector3().add(lift).add(drag).add(weight)
  var acceleration = aero_force.clone().divideScalar(mass_of_glider) // F = m*a, Newton's second law => a = F/m


  // Euler's method in integeration to find velocity and position
  linear_velocity = linear_velocity.clone().add(acceleration.clone().multiplyScalar(delta_time)) // V = V + a*dt 

  // Update Position
  position = position.clone().add(linear_velocity.clone().multiplyScalar(delta_time)) // Pos = Pos + V*dt

  if (glider_model) {
    glider_model.position.copy(position)
    look_at_glider()
  }

  // Log values in console
  current_step += clock.getDelta()
  if (current_step - last_step > 0.003) {
    console.clear()
    // console.log("delta time:", delta_time)
    console.log("position: ", position)
    console.log("aero force: ", aero_force)
    console.log("velocity: ", linear_velocity)
    console.log("acceleration: ", acceleration)
    console.log("atmospheric pressure", atmospheric_pressure)
    console.log(euler_angles)
    last_step = current_step
  }

}

function look_at_glider() {

  // Update the camera position to follow the glider
  camera.position.copy(position.clone().add(camera_offset))

  // Update the camera lookAt direction to look at the glider
  camera.lookAt(position)
}

// Animation Loop
function animate() {

  renderer.render(scene, camera)

  delta_time = clock.getDelta() * 2

  atmospheric_pressure = SEA_LEVEL_PRESSURE * Math.exp(-position.y / 7000)
  air_density = atmospheric_pressure / (R * air_temperature) //? air density

  if (position.y >= 0)
    linear_movement()
  else {
    position.y=0;
    linear_velocity = new THREE.Vector3(0, 0, 0);
  }

  update_monitored_values()
  requestAnimationFrame(animate)
}

init()
