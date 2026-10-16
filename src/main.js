import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js";
import { initScene, updateScene } from "./scene.js";
import { setupControls, updateCameraFromControls } from "./controls.js";

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x071512);
scene.fog = new THREE.FogExp2(0x071512, 0.018);

const camera = new THREE.PerspectiveCamera(65, innerWidth / innerHeight, 0.1, 260);
camera.position.set(0, 2.15, 15);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
renderer.setSize(innerWidth, innerHeight);
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 0.9;
document.body.appendChild(renderer.domElement);

// 初始化场景（返回我们需要每帧更新的对象）
const sceneState = initScene(scene, renderer, camera);

// 初始化控制（保留你原来的交互语义）
const controls = setupControls({
  camera,
  domElement: renderer.domElement,
  initial: { yaw: 0, pitch: -0.14, distance: 15 }
});

let lastTime = 0;
function animate(time) {
  requestAnimationFrame(animate);
  const dt = (time - lastTime) * 0.001;
  lastTime = time;
  // 更新水和场景内部动画
  updateScene(sceneState, time * 0.001, dt);
  // 更新相机（平滑过渡）
  updateCameraFromControls(camera, controls, dt);
  renderer.render(scene, camera);
}
animate(0);

window.addEventListener("resize", () => {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
});
