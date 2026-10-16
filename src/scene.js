import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.179.1/build/three.module.js"
import { createWater, updateWater } from './water.js'
import { makeTileTexture, makeWaterTexture } from './materials.js'
import { box, cylinder } from './utils.js'

export function initScene(scene, renderer, camera) {
  // Lighting — teal cinematic setup
  const ambient = new THREE.AmbientLight(0x053a38, 0.18)
  scene.add(ambient)

  const topDir = new THREE.DirectionalLight(0xbfeee8, 0.35)
  topDir.position.set(0, 18, 6)
  scene.add(topDir)

  const ceilingLightColor = 0xcff8f4
  const ceilingPositions = []
  for (let z = -28; z <= 28; z += 9) ceilingPositions.push(z)

  ceilingPositions.forEach((z) => {
    const spot = new THREE.SpotLight(ceilingLightColor, 1.2, 30, Math.PI * 0.22, 0.6, 1.5)
    spot.position.set(0, 6.5, z)
    spot.target.position.set(0, -1.2, z)
    spot.penumbra = 0.7
    scene.add(spot.target)
    scene.add(spot)

    const lamp = new THREE.Mesh(
      new THREE.BoxGeometry(4.8, 0.12, 0.3),
      new THREE.MeshStandardMaterial({ color: 0xdffdf9, emissive: 0x8ee8e0, emissiveIntensity: 1.6, roughness: 0.25 })
    )
    lamp.position.set(0, 6.62, z)
    scene.add(lamp)
  })

  // underwater lights
  const underwaterColor = 0x1fb3a6
  for (const x of [-6.5, 6.5]) {
    for (let z = -24; z <= 24; z += 12) {
      const pl = new THREE.PointLight(underwaterColor, 0.9, 10, 2)
      pl.position.set(x, -0.9, z)
      pl.decay = 1.8
      scene.add(pl)

      const glow = new THREE.Mesh(
        new THREE.SphereGeometry(0.18, 12, 8),
        new THREE.MeshBasicMaterial({ color: underwaterColor, transparent: true, opacity: 0.18 })
      )
      glow.position.copy(pl.position)
      scene.add(glow)
    }
  }

  // voluminous cones for subtle shafts
  const volGroup = new THREE.Group()
  ceilingPositions.forEach((z) => {
    const coneGeo = new THREE.ConeGeometry(2.6, 6.4, 32, 1, true)
    const coneMat = new THREE.MeshBasicMaterial({
      color: 0x9feee4,
      transparent: true,
      opacity: 0.04,
      blending: THREE.AdditiveBlending,
      depthWrite: false
    })
    const cone = new THREE.Mesh(coneGeo, coneMat)
    cone.position.set(0, 3.0, z)
    cone.rotation.x = Math.PI
    volGroup.add(cone)
  })
  scene.add(volGroup)

  // materials
  const tileTex = makeTileTexture()
  const waterNormalTex = makeWaterTexture()

  const poolGroup = new THREE.Group()
  scene.add(poolGroup)

  const poolW = 18, poolL = 70, poolDepth = 3.4

  // Floor
  const floor = box(poolW + 1.6, 0.42, poolL + 3, new THREE.MeshStandardMaterial({ map: tileTex, color: 0x163e39, roughness: 0.82, metalness: 0.06 }), 0, -1.75, 0)
  poolGroup.add(floor)

  // Walls
  poolGroup.add(box(0.62, poolDepth, poolL + 2.8, new THREE.MeshStandardMaterial({ color: 0x102a27, roughness: 0.9 }), -poolW / 2 - 0.3, 0.05, 0))
  poolGroup.add(box(0.62, poolDepth, poolL + 2.8, new THREE.MeshStandardMaterial({ color: 0x102a27, roughness: 0.9 }), poolW / 2 + 0.3, 0.05, 0))
  poolGroup.add(box(poolW + 1.8, poolDepth, 0.62, new THREE.MeshStandardMaterial({ color: 0x102a27, roughness: 0.9 }), 0, 0.05, -poolL / 2 - 0.3))
  poolGroup.add(box(poolW + 1.8, poolDepth, 0.62, new THREE.MeshStandardMaterial({ color: 0x102a27, roughness: 0.9 }), 0, 0.05, poolL / 2 + 0.3))

  // Rim
  poolGroup.add(box(poolW + 1.05, 0.26, poolL + 2.3, new THREE.MeshStandardMaterial({ color: 0x1a4b48, roughness: 0.7 }), 0, -1.15, 0))

  // Steps
  const stepsGroup = new THREE.Group()
  for (let i = 0; i < 4; i++) {
    const step = new THREE.Mesh(new THREE.BoxGeometry(5.8 - i * 0.6, 0.24, 2.8), new THREE.MeshStandardMaterial({ color: 0x1f4c49, roughness: 0.78 }))
    step.position.set(0, -1.2 + i * 0.25, -poolL / 2 + 5 + i * 2.1)
    stepsGroup.add(step)
  }
  poolGroup.add(stepsGroup)

  // Ladders
  function makeLadder(x, z) {
    poolGroup.add(box(0.12, 2.3, 0.12, new THREE.MeshStandardMaterial({ color: 0x8aa7a0, metalness: 0.8, roughness: 0.34 }), x, 0.1, z))
    poolGroup.add(box(0.12, 2.3, 0.12, new THREE.MeshStandardMaterial({ color: 0x8aa7a0, metalness: 0.8, roughness: 0.34 }), x, 0.1, z + 0.74))
    for (let i = 0; i < 8; i++) poolGroup.add(box(0.88, 0.07, 0.1, new THREE.MeshStandardMaterial({ color: 0x8aa7a0 }), x, -0.9 + i * 0.27, z + 0.36))
  }
  makeLadder(-poolW / 2 + 0.42, -16)
  makeLadder(poolW / 2 - 0.42, 18)

  // drains
  for (const x of [-5.8, 0, 5.8]) {
    poolGroup.add(cylinder(0.46, 0.46, 0.05, new THREE.MeshStandardMaterial({ color: 0x061713 }), x, -1.42, 0))
    for (let i = 0; i < 8; i++) {
      const a = i * (Math.PI / 4)
      const bar = box(0.68, 0.035, 0.035, new THREE.MeshStandardMaterial({ color: 0x405e58 }), x, -1.38, 0)
      bar.rotation.y = a
      poolGroup.add(bar)
    }
  }

  // ceiling and columns
  poolGroup.add(box(poolW + 14, 0.34, poolL + 14, new THREE.MeshStandardMaterial({ color: 0x071915 }), 0, 7.2, 0))
  for (let z = -30; z <= 30; z += 10) {
    for (const x of [-13, 13]) poolGroup.add(box(0.8, 7.2, 0.8, new THREE.MeshStandardMaterial({ color: 0x102a27 }), x, 3.6, z))
  }

  // balls & duck
  const ballColors = [0xe8e2cf, 0x4d8f87, 0x172a28, 0xb8c6bd]
  for (let i = 0; i < 28; i++) {
    const s = new THREE.Mesh(new THREE.SphereGeometry(0.22, 16, 12), new THREE.MeshStandardMaterial({ color: ballColors[i % ballColors.length], roughness: 0.52 }))
    const side = i % 2 ? 1 : -1
    s.position.set(side * (8.8 + Math.random() * 1.2), 0.25, -32 + Math.random() * 64)
    poolGroup.add(s)
  }
  const duck = new THREE.Group()
  const duckMat = new THREE.MeshStandardMaterial({ color: 0xc8a92d, roughness: 0.7 })
  const body = new THREE.Mesh(new THREE.SphereGeometry(0.42, 20, 14), duckMat)
  body.scale.set(1, 0.72, 1)
  duck.add(body)
  const head = new THREE.Mesh(new THREE.SphereGeometry(0.29, 20, 14), duckMat)
  head.position.set(0, 0.34, 0.26)
  duck.add(head)
  const beak = new THREE.Mesh(new THREE.ConeGeometry(0.11, 0.22, 12), new THREE.MeshStandardMaterial({ color: 0xb45c27 }))
  beak.rotation.x = Math.PI / 2
  beak.position.set(0, 0.32, 0.52)
  duck.add(beak)
  duck.position.set(-2.2, -0.18, -11)
  poolGroup.add(duck)

  // create water (pass scene & renderer so water can create cube camera)
  const waterObj = createWater({
    width: poolW - 1.2,
    length: poolL - 1.5,
    texture: waterNormalTex,
    positionY: -0.12,
    scene,
    renderer
  })
  poolGroup.add(waterObj.mesh)

  const state = { scene, poolGroup, water: waterObj, duck }
  return state
}

export function updateScene(state, time, dt) {
  updateWater(state.water, time, dt)
  state.duck.rotation.y = time * 0.7
  state.duck.position.y = -0.18 + Math.sin(time * 1.6) * 0.04
}
