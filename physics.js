import * as THREE from 'three';

// Constant factors in the study
const g = 9.8; //? acceleration due to gravity
const R = 287.058; //? specific gas constant for dry air
const SEA_LEVEL_PRESSURE = 101325;
// Pr = SEA_LEVEL_PRESSURE * Math.exp(-altitude / 7000); // simplified, assumes standard atmospheric conditions

let K4 = 0,
    K5 = 0,
    A1 = 0; //? experimental constants for lift coefficient

// Variable factors in the study
let mass_of_glider; //? mass of the glider

//? Geometric characteristics of the glider:
let wingspan;
let wingarea;
let fuselageLength;
let fuselageHeight;
let tailHeight;
let tailSpan;

let wind_speed; //? wind speed relative to the wing of the glider

let I = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
]; //? moment of inertia tensor

let air_temperature; //? air temperature
let atmospheric_pressure; //? atmospheric pressure
let CD; //? drag coefficient

let angular_velocity = new THREE.Vector3(1, 1, 1); //? instantaneous angular velocity

let CL = A1 * (K4 * Math.pow(wind_speed, 2) + K5); //? lift coefficient
let air_density = atmospheric_pressure / (R * air_temperature); //? air density

let starting_position = new THREE.Vector3(0, 5, 0); //? starting position 

let starting_linear_veloctiy = new THREE.Vector3(1, 0, 1);
let linear_velocity = new THREE.Vector3(0, 0, 0); //? linear velocity

let starting_euler_angles = new THREE.Vector3(0, 1, 1); //? initial pitch, roll, and yaw angles
let euler_angles = new THREE.Vector3(0, 1, 1); //? pitch, roll, and yaw angles (Euler angles)


function assignValues() {
    // Assign values to variables here
    K4 = parseFloat(document.getElementById('K4').value);
    K5 = parseFloat(document.getElementById('K5').value);
    A1 = parseFloat(document.getElementById('a1').value);
    mass_of_glider = parseFloat(document.getElementById('m').value);
    wingspan = parseFloat(document.getElementById('wingspan').value);
    wingarea = parseFloat(document.getElementById('wingarea').value);
    fuselageLength = parseFloat(document.getElementById('fuselageLength').value);
    fuselageHeight = parseFloat(document.getElementById('fuselageHeight').value);
    tailHeight = parseFloat(document.getElementById('tailHeight').value);
    tailSpan = parseFloat(document.getElementById('tailSpan').value);
    wind_speed = parseFloat(document.getElementById('Vf').value);
    air_temperature = parseFloat(document.getElementById('T').value);
    atmospheric_pressure = parseFloat(document.getElementById('Pr').value);
    CD = parseFloat(document.getElementById('CD').value);

    // Do something with the assigned values
}

export {
    g,
    R,
    K4,
    K5,
    A1,
    mass_of_glider,
    wingspan,
    wingarea,
    fuselageLength,
    fuselageHeight,
    tailHeight,
    tailSpan,
    wind_speed,
    I,
    air_temperature,
    atmospheric_pressure,
    CD,
    angular_velocity,
    CL,
    air_density,
    starting_position,
    starting_linear_veloctiy,
    linear_velocity,
    starting_euler_angles,
    euler_angles,
    SEA_LEVEL_PRESSURE
};