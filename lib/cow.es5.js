/* global THREE, Tone */
var randf = function (start, end) {
  var n0 = typeof start === 'number',
    n1 = typeof end === 'number'

  if (n0 && !n1) {
    end = start
    start = 0
  } else if (!n0 && !n1) {
    start = 0
    end = 1
  }
  return start + Math.random() * (end - start)
}

/** Buble compiler output start **/
var RADIUS = 3
var BPM = 180
var AUDIO_VARIATION = 12
var ANGLE_ACCEPT = 0.5 / AUDIO_VARIATION * Math.PI

var Cow = (function (superclass) {
  function Cow() {
    superclass.call(this)
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

    var helper = new THREE.LineSegments(
      new THREE.SphereGeometry( RADIUS, 16, 16 )
    )
    this.add(helper)

    this.setCowRandom()
    // set up audio
    this.player = new Player()
  }

  if ( superclass ) Cow.__proto__ = superclass;
  Cow.prototype = Object.create( superclass && superclass.prototype );
  Cow.prototype.constructor = Cow;
  Cow.prototype.setCowRandom = function setCowRandom () {
    var pos = new THREE.Vector3(0, 0, RADIUS)
    var rot = new THREE.Euler(
      randf(Math.PI * 2),
      randf(Math.PI * 2),
      randf(Math.PI * 2)
    )
    pos.applyEuler(rot)
    this.cowPos = pos;
  };
  Cow.prototype.update = function update (cam) {
    this.raycaster.setFromCamera( this.cursor, cam )
    var angleDiff = this.getAngleDiff()

    // Update player which to play
    this.player.setTrack( AUDIO_VARIATION - Math.ceil( angleDiff / Math.PI * AUDIO_VARIATION ) )
  };
  Cow.prototype.getAngleDiff = function getAngleDiff () {
    var intersects = this.raycaster.intersectObject( this.raySphere )
    if (intersects.length === 0) {
      console.warn('raycaster isn\'t hitting anything. ')
      return
    }
    var angleDiff = this.cowPos.angleTo( intersects[0].point )
    return angleDiff
  };
  Cow.prototype.check = function check () {
    var angleDiff = this.getAngleDiff()
    console.log(angleDiff);
    if (angleDiff < ANGLE_ACCEPT) {
      this.foundCow()
    }
  };
  Cow.prototype.foundCow = function foundCow () {
    console.log('moo');
    // TODO elaborate celebration
    this.setCowRandom()
  };

  return Cow;
}(THREE.Group));

var Player = function Player() {
  var this$1 = this;

  // set up audio players
  this.players = []
  for (var i = 0; i < AUDIO_VARIATION; i++) {
    var url = "/assets/cow/" + i + ".mp3"
    var p = new Tone.Player(url).toMaster()
    this$1.players.push(p)
  }
  this.trackIndex = 0
  this.loop()
};
Player.prototype.setTrack = function setTrack (index) {
  if (index > this.players.length - 1 || index < 0) {
    console.warn('index out of bound')
    return
  }
  this.trackIndex = index
};
Player.prototype.loop = function loop () {
    var this$1 = this;

  var loop = new Tone.Loop(function (time){
    console.log(this$1.trackIndex);
    this$1.players[this$1.trackIndex].start()
  }, '4n').start(0)
  Tone.Transport.bpm.value = BPM
  Tone.Transport.start()
};
/** Buble compiler output end **/

window.Cow = Cow
