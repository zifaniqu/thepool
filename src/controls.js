export function setupControls({ camera, domElement, initial }) {
  let dragging = false
  let lastX = 0, lastY = 0
  const state = {
    yaw: initial?.yaw || 0,
    pitch: initial?.pitch || 0,
    distance: initial?.distance || 15,
    targetYaw: initial?.yaw || 0,
    targetPitch: initial?.pitch || 0,
    targetDistance: initial?.distance || 15
  }

  domElement.addEventListener('pointerdown', (e) => {
    dragging = true; lastX = e.clientX; lastY = e.clientY
  })
  window.addEventListener('pointerup', ()=> dragging=false)
  window.addEventListener('pointermove', (e)=>{
    if(!dragging) return
    state.targetYaw -= (e.clientX - lastX) * 0.0034
    state.targetPitch -= (e.clientY - lastY) * 0.0026
    state.targetPitch = Math.max(-1.2, Math.min(1.2, state.targetPitch))
    lastX = e.clientX; lastY = e.clientY
  })
  window.addEventListener('wheel', (e)=>{
    state.targetDistance += e.deltaY * 0.02
    state.targetDistance = Math.max(9, Math.min(32, state.targetDistance))
  })

  return state
}

export function updateCameraFromControls(camera, controls, dt) {
  controls.yaw += (controls.targetYaw - controls.yaw) * 0.08
  controls.pitch += (controls.targetPitch - controls.pitch) * 0.08
  controls.distance += (controls.targetDistance - controls.distance) * 0.08

  const desiredX = Math.sin(controls.yaw) * controls.distance
  const desiredZ = Math.cos(controls.yaw) * controls.distance
  const desiredY = 2.2 + controls.pitch * 2.2

  camera.position.x += (desiredX - camera.position.x) * 0.08
  camera.position.y += (desiredY - camera.position.y) * 0.08
  camera.position.z += (desiredZ - camera.position.z) * 0.08

  camera.lookAt(0, 0.9, 0)
}
