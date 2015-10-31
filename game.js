var game = new Phaser.Game(600, 600, Phaser.AUTO, '', {
  preload: preload,
  create: create,
  update: update,
});

var map;
var p;
var buttons, spacebar, cursors;
var is_floating = false;
var things_group;

function preload() {
  game.load.spritesheet('girl', 'girl.png', 32, 32);
  game.load.spritesheet('ball', 'ball.png', 32, 32);
  game.load.image('walrus', 'walrus.png');
  game.load.image('crate1', 'crate1-32.png');
  game.load.image('crate2', 'crate2-32.png');

  game.load.tilemap('map', 'map2.json', null, Phaser.Tilemap.TILED_JSON);
  game.load.image('tiles', 'LPC_Terrain/terrain.png');
}

function create() {
  game.stage.backgroundColor = '#666666';
  map = game.add.tilemap('map');
  map.addTilesetImage('Terrain', 'tiles');

  layer = map.createLayer('grass');
  
  layer2 = map.createLayer('decor');

  // blocked
  layer3 = map.createLayer('blocked');
  map.setCollisionBetween(1, 1025, true, 'blocked');

  layer4 = map.createLayer('island');

  layer.resizeWorld();

  things_group = game.add.group();

  game.physics.startSystem(Phaser.Physics.ARCADE);


  // player
  p = game.add.sprite(32, 32, 'girl');
  p.animations.add('walkdown', [1,2], 10);
  p.animations.add('walkup', [4,5], 10);
  p.animations.add('walkhoriz', [7,6,8,6], 15);

  p.anchor.setTo(.5, .5);

  game.physics.arcade.enable(p);
  game.camera.follow(p);
  p.body.collideWorldBounds = true;
  p.body.setSize(16, 10, 0, 12);
  things_group.add(p);

  // ball
  ball = game.add.sprite(64, 64, 'ball');
  game.physics.arcade.enable(ball);
  ball.body.collideWorldBounds = true;
  ball.body.bounce.x = 0.7;
  ball.body.bounce.y = 0.7;
  things_group.add(ball);

  things_group.sort();

  cursors = game.input.keyboard.createCursorKeys();
  buttons = game.input.keyboard.addKeys({
    'w': Phaser.KeyCode.W,
  })
  spacebar = game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR)

  spacebar.onDown.add(dig);
}

function dig() {
  console.log('dig');
  var crate = game.add.sprite(p.body.x, p.body.y, Date.now() % 2 ? 'crate1' : 'crate2');
  things_group.add(crate);
}

function incTo(current, max, step) {
  var val = current + step;
  val = (Math.abs(val) >= Math.abs(max) && Math.sign(val) == Math.sign(max)) ? max : val;
  return val;
}

function approachZero(x) {
  return Math.floor(Math.abs(x)) * Math.sign(x);
}

function update() {

  game.physics.arcade.collide(p, layer3);
  game.physics.arcade.collide(ball, layer3);
  game.physics.arcade.collide(p, ball);

  var being_moved = false;
  var anim = null;
  var xscale = 1;
  var dy = 0;
  var dx = 0;

  if (cursors.up.isDown) {
    dy -= 200;
    being_moved = true;
    anim = 'walkup';
    p.resting_frame = 3;
  }
  if (cursors.down.isDown) {
    dy += 200;
    being_moved = true;
    anim = 'walkdown';
    p.resting_frame = 0;
  }
  if (cursors.right.isDown) {
    dx += 200;
    being_moved = true;
    anim = 'walkhoriz';
    xscale = 1;
    p.resting_frame = 6;
  }
  if (cursors.left.isDown) {
    dx -= 200;
    being_moved = true;
    anim = 'walkhoriz';
    xscale = -1;
    p.resting_frame = 6;
  }
  if (buttons.w.isDown) {
    if (!is_floating) {
      var msg = new SpeechSynthesisUtterance('I.  Am the great thief, Moo joo!');
      var voices = speechSynthesis.getVoices();
      console.log('voices', voices);
      for (var i = 0; i < voices.length; i++) {
        console.log(i, voices[i].name, voices[i]);
      }
      msg.lang = 'en-US';
      msg.voice = voices[3];

      is_floating = true;
      speechSynthesis.speak(msg);
      msg.onend = function() {
        is_floating = false;
      }
    }
  }

  if (being_moved) {
    p.body.velocity.x = dx;
    p.body.velocity.y = dy;
  } else {
    // user is not pressing any buttons.
    p.body.velocity.x *= 0.5;
    p.body.velocity.y *= 0.5;

    p.body.velocity.y = approachZero(p.body.velocity.y);
    p.body.velocity.x = approachZero(p.body.velocity.x);
  }

  if (anim) {
    anim = p.animations.getAnimation(anim);
    if (p.animations.currentAnim !== anim) {
      p.animations.currentAnim.stop();
    }
    if (!anim.isPlaying) {
      p.scale.x = xscale;
      anim.play(null, true);
    }
  } else {
    p.animations.stop();
    p.animations.frame = p.resting_frame;
  }

  things_group.sort('y', Phaser.Group.SORT_ASCENDING);
}

function render() {
  game.debug.bodyInfo(p, 32, 320);
}