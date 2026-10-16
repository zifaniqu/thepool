import * as THREE from 'three'

export function makeTileTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 512
  canvas.height = 512
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#0f3d3a'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  const tile = 32
  for (let y = 0; y < canvas.height; y += tile) {
    for (let x = 0; x < canvas.width; x += tile) {
      const shade = ((x + y) / tile) % 2 === 0 ? '#134f4c' : '#0f3d3a'
      ctx.fillStyle = shade
      ctx.fillRect(x, y, tile, tile)
      ctx.strokeStyle = 'rgba(20,40,38,0.18)'
      ctx.lineWidth = 1
      ctx.strokeRect(x + 0.5, y + 0.5, tile - 1, tile - 1)
    }
  }
  for (let i = 0; i < 900; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const r = Math.random() * 1.8 + 0.3
    ctx.fillStyle = `rgba(200,245,240,${(Math.random() * 0.18 + 0.02).toFixed(3)})`
    ctx.fillRect(x, y, r, r)
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(6, 12)
  tex.anisotropy = 4
  tex.needsUpdate = true
  return tex
}

export function makeWaterTexture() {
  const canvas = document.createElement('canvas')
  canvas.width = 256
  canvas.height = 256
  const ctx = canvas.getContext('2d')
  ctx.fillStyle = '#042524'
  ctx.fillRect(0, 0, canvas.width, canvas.height)
  for (let i = 0; i < 6000; i++) {
    const x = Math.random() * canvas.width
    const y = Math.random() * canvas.height
    const a = Math.random() * 0.12 + 0.02
    const r = Math.random() * 2.2 + 0.6
    ctx.fillStyle = `rgba(140,230,220,${a.toFixed(3)})`
    ctx.beginPath()
    ctx.arc(x, y, r, 0, Math.PI * 2)
    ctx.fill()
  }
  const tex = new THREE.CanvasTexture(canvas)
  tex.wrapS = tex.wrapT = THREE.RepeatWrapping
  tex.repeat.set(3, 9)
  tex.anisotropy = 4
  tex.needsUpdate = true
  return tex
}
