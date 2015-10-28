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

  layer.resizeWorld();

  things_group = game.add.group();

  game.physics.startSystem(Phaser.Physics.ARCADE);


  // player
  p = game.add.sprite(game.world.centerX, game.world.centerY, 'walrus');
  game.physics.arcade.enable(p);
  game.camera.follow(p);
  p.body.collideWorldBounds = true;
  p.body.setSize(16, 16, 8, 8);
  things_group.add(p);

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

function update() {

  game.physics.arcade.collide(p, layer3);

  var being_moved = false;
  var dy = 0;
  var dx = 0;

  if (cursors.up.isDown) {
    dy -= 200;
    being_moved = true;
  }
  if (cursors.down.isDown) {
    dy += 200;
    being_moved = true;
  }
  if (cursors.right.isDown) {
    dx += 200;
    being_moved = true;
  }
  if (cursors.left.isDown) {
    dx -= 200;
    being_moved = true;
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
      p.body.velocity.x *= 0.7;
      p.body.velocity.y *= 0.7;
    }

  // Math.sign(p.body.velocity)
  // p.body.velocity.y -= 2;
  // p.body.velocity.x -= 2;

  things_group.sort('y', Phaser.Group.SORT_ASCENDING);
}

function render() {
  game.debug.bodyInfo(p, 32, 320);
}