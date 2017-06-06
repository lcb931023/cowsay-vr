global.THREE = require('three')
const createOrbitViewer = require('three-orbit-viewer')(THREE)
import ArToolkitSource from './lib/artoolkitsource'
import Cow from './lib/cow'

/* Scene */
const app = createOrbitViewer({
  clearColor: 0x000000,
  clearAlpha: 0,
  fov: 65,
  position: new THREE.Vector3(0, 0, 0), // camera
  target: new THREE.Vector3(0, 0, -1), // default was (0, 0, 0). pass this so it can look ahead
})

const arToolkitSource = new ArToolkitSource({
  sourceType: 'webcam',
})
arToolkitSource.init(onResize)
window.addEventListener('resize', onResize)
function onResize() {
  arToolkitSource.onResize()
  arToolkitSource.copySizeTo(app.renderer.domElement)
}

const cow = new Cow()
app.scene.add(cow)

window.addEventListener('keypress', handleKeyboard)
function handleKeyboard (e) {
  if (e.key !== ' ') return
  cow.check()
}

app.on('tick', function(dt) {
  //.. handle pre-render updates
  cow.update(app.camera)
})
