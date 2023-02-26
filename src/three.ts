import * as THREE from "three";
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const words = ["Fast Learner", "Team Player", "Observant", "Motivated", "Curious", "Creative", "Reliable", "Problem\nSolver", "Adaptable", "Critical\nThinker"];
const SPHERE_RADIUS = 100;
let sphereMeshes: THREE.Mesh[] = [];
let sphereBodies: CANNON.Body[] = [];

// Scene
const scene = new THREE.Scene();
const world = new CANNON.World();

// Standard Sphere Mesh
for (const word of words) {
  const sphereGeometry = new THREE.SphereGeometry(SPHERE_RADIUS, 32, 32);
  const sphereMaterial = new THREE.MeshPhongMaterial();
  const sphereMesh = new THREE.Mesh(sphereGeometry, sphereMaterial);
  sphereMesh.position.set(Math.random()*window.innerWidth, Math.random()*window.innerHeight, 0);
  scene.add(sphereMesh);
  sphereMeshes.push(sphereMesh);

  // CANNON Sphere Body
  const sphereShape = new CANNON.Sphere(SPHERE_RADIUS);
  const sphereBody = new CANNON.Body({ mass: 0.01 });
  sphereBody.position.set(sphereMesh.position.x, sphereMesh.position.y, sphereMesh.position.z);
  sphereBody.addShape(sphereShape);
  sphereBody.linearDamping = 0.5;
  world.addBody(sphereBody);
  sphereBodies.push(sphereBody);
}

// Lighting
const dLight1 = new THREE.DirectionalLight(0x7638FA, 1);
dLight1.position.set(-1, 1, 1);
scene.add(dLight1);
const dLight2 = new THREE.DirectionalLight(0xD300C5, 0.8);
dLight2.position.set(1, 1, 1);
scene.add(dLight2);
const dLight3 = new THREE.DirectionalLight(0xFFD600, 0.4);
dLight3.position.set(-1, -1, 1);
scene.add(dLight3);
const dLight4 = new THREE.DirectionalLight(0xFF7A00, 0.6);
dLight4.position.set(1, -1, 1);
scene.add(dLight4);

// Camera
const camera = new THREE.OrthographicCamera(-window.innerWidth/2, window.innerWidth/2, window.innerHeight/2, -window.innerHeight/2, 0, SPHERE_RADIUS*10);
camera.position.setZ(SPHERE_RADIUS*5);
scene.add(camera);

// Render
const canvas = document.querySelector("#three") as HTMLCanvasElement;
const renderer = new THREE.WebGLRenderer({ canvas });
renderer.setPixelRatio(window.devicePixelRatio);
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.shadowMap.type = THREE.VSMShadowMap

// // OrbitControl - to be removed at distribution
// const controls = new OrbitControls(camera, renderer.domElement);
// controls.update();

// Animate
function animate() {
  requestAnimationFrame(animate);

  // Step the physics world
  world.fixedStep();

  sphereBodies.forEach((s, i) => {
    // Sync the three.js meshes with the bodies
    sphereMeshes[i].position.set(s.position.x, s.position.y, s.position.z);
    sphereMeshes[i].quaternion.set(s.quaternion.x, s.quaternion.y, s.quaternion.z, s.quaternion.w);
  });

  // Render three.js
  renderer.render(scene, camera);
}
console.log(sphereMeshes);
animate();

// Gravity - https://sbcode.net/threejs/gravity-centre/
world.addEventListener('postStep', () => {
  for (const sphereBody of sphereBodies) {
    // Gravity towards (0,0,0)
    const v = new CANNON.Vec3();
    v.set(-sphereBody.position.x, -sphereBody.position.y, 0).normalize();
    v.scale(9.8, sphereBody.force);
    sphereBody.applyLocalForce(v);
    sphereBody.force.y += sphereBody.mass; //cancel out world gravity
  }
})