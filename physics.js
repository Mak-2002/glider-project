
// Constant factors in the study
const g = 9.8; // acceleration due to gravity
const R = 287.058; // specific gas constant for dry air
const K4 = 0,
    K5 = 0,
    a1 = 0; // experimental constants for lift coefficient

// Variable factors in the study
let m; // mass of the glider

// Geometric characteristics of the glider:
let wingspan;
let wingarea;
let fuselageLength;
let fuselageHeight;
let tailHeight;
let tailSpan;

let Vf; // wind speed relative to the wing of the glider

let I = [
    [0, 0, 0],
    [0, 0, 0],
    [0, 0, 0]
]; // moment of inertia tensor

let T; // air temperature
let Pr; // atmospheric pressure
let CD; // drag coefficient

export {
    g,
    R,
    K4,
    K5,
    a1,
    m,
    wingspan,
    wingarea,
    fuselageLength,
    fuselageHeight,
    tailHeight,
    tailSpan,
    Vf,
    I,
    T,
    Pr,
    CD
};