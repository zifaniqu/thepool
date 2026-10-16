import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js";

export function makeTileTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#1b4a46"; ctx.fillRect(0,0,256,256);
  const tileSize = 32;
  for (let y=0;y<256;y+=tileSize){
    for (let x=0;x<256;x+=tileSize){
      ctx.fillStyle = ((x+y)/(tileSize))%2===0 ? "#123a39" : "#1b4a46";
      ctx.fillRect(x,y,tileSize,tileSize);
      ctx.strokeStyle = "rgba(175,212,206,0.12)";
      ctx.lineWidth = 1;
      ctx.strokeRect(x+0.5,y+0.5,tileSize-1,tileSize-1);
    }
  }
  // 轻微噪点
  for (let i=0;i<700;i++){
    ctx.fillStyle = "rgba(220,233,231,"+(Math.random()*0.18+0.05).toFixed(3)+")";
    const s = Math.random()*2.5+0.5;
    ctx.fillRect(Math.random()*256, Math.random()*256, s, s);
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(6,12);
  tex.needsUpdate = true;
  return tex;
}

export function makeWaterTexture() {
  const canvas = document.createElement("canvas");
  canvas.width = 256; canvas.height = 256;
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "#0b2b2c"; ctx.fillRect(0,0,256,256);
  for (let i=0;i<14000;i++){
    const x=Math.random()*256, y=Math.random()*256, r=Math.random()*3+1.2;
    ctx.fillStyle = "rgba(145,218,209,"+(Math.random()*0.16+0.04).toFixed(3)+")";
    ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill();
  }
  const tex = new THREE.CanvasTexture(canvas);
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
  tex.repeat.set(3,9);
  tex.needsUpdate = true;
  return tex;
}
