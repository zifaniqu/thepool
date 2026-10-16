import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js"

export function createWater({ width=16, length=60, texture=null, positionY=-0.12, scene=null, renderer=null }) {
  // 减少顶点数以兼顾性能
  const segW = 72, segL = 140;
  const geo = new THREE.PlaneGeometry(width, length, segW, segL);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0x0589a0,
    map: texture || null,
    roughness: 0.06,
    metalness: 0.03,
    clearcoat: 1.0,
    clearcoatRoughness: 0.12,
    transmission: 0.20,
    thickness: 0.9,
    transparent: true,
    opacity: 0.88,
    depthWrite: false,
    side: THREE.DoubleSide,
    envMapIntensity: 1.6
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI/2;
  mesh.position.y = positionY;

  // store original positions for stable displacement
  const pos = geo.attributes.position;
  const original = new Float32Array(pos.array);
  geo.setAttribute('origPos', new THREE.BufferAttribute(original, 3));

  // 构造 CubeCamera（低分辨率即可）
  let cubeCamera = null;
  if (scene && renderer) {
    const cubeRenderTarget = new THREE.WebGLCubeRenderTarget(256, { generateMipmaps: true, minFilter: THREE.LinearMipmapLinearFilter });
    cubeCamera = new THREE.CubeCamera(0.1, 500, cubeRenderTarget);
    cubeCamera.position.set(mesh.position.x, mesh.position.y + 0.1, mesh.position.z);
    scene.add(cubeCamera);
  }

  return { mesh, geo, mat, cubeCamera, renderer };
}

export function updateWater(waterObj, time, dt) {
  const geo = waterObj.geo;
  const pos = geo.attributes.position;
  const orig = geo.attributes.origPos;
  // 逐顶点位移：组合多频率正弦以获得自然感
  for (let i = 0; i < pos.count; i++) {
    const ox = orig.getX(i), oy = orig.getY(i);
    // 使用 x/y 作为平面坐标
    const h = Math.sin(ox * 0.82 + time * 1.15) * 0.055
            + Math.cos(oy * 0.54 - time * 0.9) * 0.035
            + Math.sin((ox + oy) * 0.28 + time * 0.6) * 0.02;
    pos.setZ(i, h);
  }
  pos.needsUpdate = true;
  geo.computeVertexNormals();

  // 每 N 帧更新 envMap（避免每帧太慢）
  waterObj._frameCounter = (waterObj._frameCounter || 0) + 1;
  const UPDATE_EVERY = 6;
  if (waterObj._frameCounter >= UPDATE_EVERY && waterObj.cubeCamera && waterObj.renderer) {
    waterObj._frameCounter = 0;
    const mesh = waterObj.mesh;
    const cubeCam = waterObj.cubeCamera;
    const renderer = waterObj.renderer;
    // 隐藏水体再采样以避免自反射
    mesh.visible = false;
    cubeCam.update(renderer, mesh.parent || mesh.parent || null);
    mesh.visible = true;
    // 将结果赋给水材质 envMap
    try {
      waterObj.mat.envMap = cubeCam.renderTarget.texture;
      waterObj.mat.needsUpdate = true;
    } catch (e) {
      // 如果出错，静默处理
      // console.warn('envMap update failed', e);
    }
  }
}
