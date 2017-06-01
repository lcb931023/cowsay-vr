import * as THREE from 'three'
import * as Tone from 'tone'
const randf = require('randf')

const RADIUS = 3
const BPM = 180
const AUDIO_VARIATION = 12
const ANGLE_ACCEPT = 0.5 / AUDIO_VARIATION * Math.PI

class Cow extends THREE.Group{
  constructor() {
    super()
    // set up raycasting
    this.raycaster = new THREE.Raycaster()
    this.cursor = new THREE.Vector2() // middle of the view. x=0, y=0
    this.raySphere = new THREE.Mesh(
      new THREE.SphereGeometry( RADIUS, 16, 16 ),
      new THREE.MeshNormalMaterial({
        side: THREE.DoubleSide,
      })
    )
    this.add(this.raySphere)

    let helper = new THREE.LineSegments(
      new THREE.SphereGeometry( RADIUS, 16, 16 )
    )
    this.add(helper)

    this.setCowRandom()
    // set up audio
    this.player = new Player()
  }
  setCowRandom() {
    let pos = new THREE.Vector3(0, 0, 3)
    let rot = new THREE.Euler(
      randf(Math.PI * 2),
      randf(Math.PI * 2),
      randf(Math.PI * 2)
    )
    pos.applyEuler(rot)
    this.cowPos = pos;
  }
  update(cam) {
    this.raycaster.setFromCamera( this.cursor, cam )
    let angleDiff = this.getAngleDiff()

    // Update player which to play
    this.player.setTrack( AUDIO_VARIATION - Math.ceil( angleDiff / Math.PI * AUDIO_VARIATION ) )
  }
  getAngleDiff() {
    var intersects = this.raycaster.intersectObject( this.raySphere )
    if (intersects.length === 0) {
      console.warn('raycaster isn\'t hitting anything. ')
      return
    }
    let angleDiff = this.cowPos.angleTo( intersects[0].point )
    return angleDiff
  }
  check() {
    let angleDiff = this.getAngleDiff()
    console.log(angleDiff);
    if (angleDiff < ANGLE_ACCEPT) {
      this.foundCow()
    }
  }
  foundCow() {
    console.log('moo');
    // TODO elaborate celebration
    this.setCowRandom()
  }
}

class Player {
  constructor() {
    // set up audio players
    this.players = []
    for (var i = 0; i < AUDIO_VARIATION; i++) {
      let url = `/assets/cow/${i}.mp3`
      let p = new Tone.Player(url).toMaster()
      this.players.push(p)
    }
    this.trackIndex = 0
    this.loop()
  }
  setTrack(index) {
    if (index > this.players.length - 1 || index < 0) {
      console.warn('index out of bound')
      return
    }
    this.trackIndex = index
  }
  loop() {
    const loop = new Tone.Loop((time)=>{
      console.log(this.trackIndex);
      this.players[this.trackIndex].start()
    }, '4n').start(0)
    Tone.Transport.bpm.value = BPM
    Tone.Transport.start()
  }
}

export default Cow
