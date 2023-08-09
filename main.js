import * as THREE from 'three';

import * as physics from './physics.js';
import * as threejsScene from './threejsScene.js';


threejsScene.initialize();
let camera = threejsScene.camera;
let scene = threejsScene.scene;
let renderer = threejsScene.renderer;
let gliderModel;

const cameraRotationCenter = new THREE.Vector3(0, 0, 0);


function animateGlider() {
    if (gliderModel) {
        // Perform animation logic here
        gliderModel.rotation.y += 0.001; // Example rotation animation
    }
}


camera.position.set(20, 10, 10);


/**
 * Animation Loop
 */
function animate() {
    requestAnimationFrame(animate);
    if (!gliderModel && threejsScene.gliderModel) 
        gliderModel = threejsScene.gliderModel; // set the model when it's done loading
                                                // it shows that it takes several iterations before it finishes loading
    animateGlider();
    // Rotating the Camera
    const radius = 20; // Replace with desired radius
    // const angle = Date.now() * 0.0002; // Replace with desired rotation speed
    const angle = 0; // to stop the camera rotation
    const positionX = cameraRotationCenter.x + radius * Math.cos(angle);
    const positionZ = cameraRotationCenter.z + radius * Math.sin(angle);
    camera.position.set(positionX, camera.position.y, positionZ);


    // Point the camera towards the rotation center
    camera.lookAt(cameraRotationCenter);

    renderer.render(scene, camera);
}

animate();