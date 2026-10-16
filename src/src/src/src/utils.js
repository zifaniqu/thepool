import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js";

export function box(w,h,d,mat,x=0,y=0,z=0){
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w,h,d), mat);
  mesh.position.set(x,y,z);
  return mesh;
}

export function cylinder(rTop,rBot,height,mat,x=0,y=0,z=0,rx=0,ry=0,rz=0){
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rTop, rBot, height, 24), mat);
  mesh.position.set(x,y,z);
  mesh.rotation.set(rx,ry,rz);
  return mesh;
}
