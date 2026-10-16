import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js";

export function createWater({ width=16, length=60, texture=null, positionY=-0.12 }) {
  // 减少顶点数以兼顾性能
  const segW = 72, segL = 140;
  const geo = new THREE.PlaneGeometry(width, length, segW, segL);
  const mat = new THREE.MeshPhysicalMaterial({
    color: 0x0d5f5b,
    map: texture || null,
    roughness: 0.17,
    metalness: 0.06,
    clearcoat: 1.0,
    clearcoatRoughness: 0.34,
    transmission: 0.05,
    thickness: 0.8,
    transparent: true,
    opacity: 0.82,
    depthWrite: false,
    side: THREE.DoubleSide
  });
  const mesh = new THREE.Mesh(geo, mat);
  mesh.rotation.x = -Math.PI/2;
  mesh.position.y = positionY;

  // store original positions for stable displacement
  const pos = geo.attributes.position;
  const original = new Float32Array(pos.array);
  geo.setAttribute('origPos', new THREE.BufferAttribute(original, 3));

  return { mesh, geo, mat };
}

export function updateWater(waterObj, time, dt) {
  const geo = waterObj.geo;
  const pos = geo.attributes.position;
  const orig = geo.attributes.origPos;
  // 逐顶点位移：组合多频率正弦以获得自然感
  for (let i = 0; i < pos.count; i++) {
    const ox = orig.getX(i), oy = orig.getY(i);
    // 使用 x/y 作为平面坐标
    const h = Math.sin(ox * 0.82 + time * 1.25) * 0.06
            + Math.cos(oy * 0.54 - time * 0.9) * 0.04
            + Math.sin((ox + oy) * 0.28 + time * 0.7) * 0.025;
    pos.setZ(i, h);
  }
  pos.needsUpdate = true;
  // 为性能考虑：不是每帧都计算法线，这里我们每帧更新（分辨率较小）
  geo.computeVertexNormals();
}
