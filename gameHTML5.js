var keys = []
var shells = []
var bubbles = []
var apples = []
var pause = false;
var maxBubbles = 7;
setInterval(update, 20);

window.addEventListener('keydown', function (e) {
    keys[e.keyCode] = true;
})
window.addEventListener('keyup', function (e) {
    keys[e.keyCode] = false;

    if (player.jumpFrame == 0)
      player.imgAction = "idle";
})

function update() {
    if (pause) return;
    if (keys && (keys[65] || keys[37])) player.walk("left");
    if (keys && (keys[68] || keys[39])) player.walk("right");
    player.crouching = (keys[83] || keys[40])
    if (keys && keys[32]) player.jump();
    player.update();
    npc.update();

    bubbles.forEach((bubble, i) => {
      bubble.update();
    });

    shells.forEach((shell, i) => {
      shell.update();
    });

    apples.forEach((apple, i) => {
      apple.update();
    });

    if (bubbles.length < maxBubbles)
      Object.create(bubble).spawn();
}

let player = {
  speed: 7,//setting
  jumpHeight: 20,//setting
  x: 100,//setting: spawn x
  y: 100,//setting: spawn y
  looking: "right",
  imgAction: "idle",
  lastImg: "idle",
  crouching: false,
  img: document.getElementById("player"),
  score: 0,
  falling: false,
  health: 4,
  spawnAppleThreshold: 25,//setting: spawn an apple every time the player pops this manny bubbles
  update: function() {
    //set position
    this.img.style.left = this.x;
    this.img.style.bottom = this.y;

    //looking left/right
    if (this.looking == "left") this.img.style.transform = "scaleX(-1)"
    else this.img.style.transform = "scaleX(1)"

    //crouching
    if (this.crouching && this.imgAction != "jump" && !this.imgAction.includes("_crouch")) {
      this.imgAction += "_crouch";
    }

    //set image
    if (this.imgAction != this.lastImg) {
      this.img.src = 'images/' + this.imgAction + ".gif";
      this.lastImg = this.imgAction;
    }

    //jumping
    if (this.jumpFrame > 0) {
      this.y += 11;
      this.jumpFrame -= 1;
    }

    //gravity
    //if player is not jumping
    if (this.jumpFrame == 0) {

      //if player is not on foor (y=100 is the ground)
      if (this.y > 100) {

        this.falling = true;

        //check if player is on a platform
        Array.from(document.getElementsByClassName("platform")).forEach((platform, i) => {
          if (this.x + this.img.width - 80 > platform.offsetLeft) //right of player is to right of platform edge
            if (this.x < platform.offsetLeft + this.img.width + 30) //left of player is to left of platform edge
              if (this.y > parseInt(platform.style.bottom)) //feet are above bottom of platform
                if (this.y < parseInt(platform.style.bottom) + platform.height) { //feet are below top of platform
                  this.falling = false;
                  return;
                }
        });

        if (this.falling) this.y -= 10;
        if (this.y == 100 || !this.falling) player.imgAction = "idle";
      } else this.falling = false;
    }
  },
  walk: function(direction) {
    if (direction == "left") {
      player.x -= player.speed;
      if (player.x < 0) player.x = 0;
      player.looking = "left";
      if (this.jumpFrame == 0)
        player.imgAction = "walk";
    } else {
      player.x += player.speed;
      if (player.x > document.body.offsetWidth - player.img.width) player.x = document.body.offsetWidth - player.img.width;
      player.looking = "right";
      if (this.jumpFrame == 0)
        player.imgAction = "walk";
    }
  },
  jumpFrame: 0,
  jump: function() {
    if (this.jumpFrame == 0 && this.falling == false) {
      this.jumpFrame = this.jumpHeight;
      this.imgAction = "jump";
    }
  },
  addScore: function() {
    this.score += 1;
    document.getElementById("score").innerHTML = "Score: " + this.score;

    //spawn an apple every time you pickup 10 apples
    if (this.score % this.spawnAppleThreshold == 0) {
      Object.create(apple).spawn();
    }
  },
  changeHealth: function(change) {
    this.health += change;
    if (this.health == 0) {
      //player died, display game over screen
      document.getElementById("pauseScore").innerHTML = "Score: " + player.score;
      document.getElementById("gameover").style.display = "block"
      document.getElementById("pause").style.display = "block"
      pause = true;
    } else if (this.health == 5) {
      //don't allow collecting more than 4 hearts
      this.health = 4;
    }
    if (this.health >= 1) document.getElementById("heart1").src = "images/heart.png";
    else document.getElementById("heart1").src = "images/heart_empty.png";

    if (this.health >= 2) document.getElementById("heart2").src = "images/heart.png";
    else document.getElementById("heart2").src = "images/heart_empty.png";

    if (this.health >= 3) document.getElementById("heart3").src = "images/heart.png";
    else document.getElementById("heart3").src = "images/heart_empty.png";

    if (this.health >= 4) document.getElementById("heart4").src = "images/heart.png";
    else document.getElementById("heart4").src = "images/heart_empty.png";
  }
}

let npc = {
  speed: 3,//setting
  viewDistance: 500,//setting
  x: 100,
  y: 100,
  looking: "right",
  imgAction: "idle",
  lastImg: "idle",
  shellTimeout: 300,//setting: ticks to wait between throwing shells
  maxShells: 2,//setting: number of shells to spawn at once
  shelltick: 0,
  img: document.getElementById("npc"),
  update: function() {
    this.img.style.left = this.x;
    this.img.style.bottom = this.y;

    if (this.looking == "left") this.img.style.transform = "scaleX(-1)"
    else this.img.style.transform = "scaleX(1)"

    if (this.imgAction != this.lastImg) {
      this.img.src = 'images/NPC_' + this.imgAction + ".gif";
      this.lastImg = this.imgAction;
    }

    if (shells.length < this.maxShells) {
      if (this.shelltick++ >= this.shellTimeout) {
        this.spawnShell();
        this.shelltick = 0;
      }
    }

    //follow player
    var distance = Math.sqrt(Math.pow(player.x - npc.x, 2) + Math.pow(player.y - npc.y, 2));
    if (distance < this.viewDistance) {
      this.imgAction = "walk"
      if (player.x > npc.x + 3) this.walk("right"); //+3 so it dosen't teleport back and forth when directly on player
      else if (player.x < npc.x) this.walk("left");
      else this.imgAction = "idle"
    } else this.imgAction = "idle"

  },
  walk: function(direction) {
    if (direction == "left") {
      this.x -= this.speed;
      this.looking = "left";
    } else {
      this.x += this.speed;
      this.looking = "right";
    }
  },
  spawnShell: function() {
    Object.create(shell).spawn();
  }
}

let bubble = {
  x: 0,
  y: 0,
  speed: 0.3,//setting: how fast to rise
  img: null,
  pop: false,
  popWait: 10,//setting: how manny frames to show pop image
  spawn: function() {
    this.x = Math.floor(Math.random() * (document.body.offsetWidth - 80));
    this.y = Math.floor(Math.random() * 400) + 100;
    this.img = document.createElement('img');
    this.img.width = 80;
    this.img.src = "images/bubble.gif";
    document.body.appendChild(this.img);
    bubbles.push(this);
  },
  update: function() {

    if (this.pop == true) {
      if (this.popWait-- == 0) {
        bubbles.splice(bubbles.indexOf(this), 1);
        this.img.remove();
      }
      return;
    }

    this.img.style.left = this.x;
    this.img.style.bottom = this.y;

    //check if it collides with player
    if (player.x + player.img.width - 30 > this.x) //right of player is to right of bubble side (-30 to compensate for transparency in player image)
      if (player.x < this.x + this.img.width - 30) //left of player is to left of bubble side
        if (player.y + player.img.height > this.y + 30) //head is above bottom of bubble
          if (player.y < this.y + this.img.height) //feet are below top of bubble
            this.pop();
  },
  pop: function() {
    this.img.src = "images/pop.png";
    this.pop = true;
    player.addScore();
    new Audio('pop.mp3').play();
  }
}

let apple = {
  x: 0,
  y: 0,
  img: null,
  falling: false,
  spawn: function() {
    this.x = Math.floor(Math.random() * (document.body.offsetWidth - 80));
    this.y = Math.floor(Math.random() * 400) + 100;
    this.img = document.createElement('img');
    this.img.width = 80;
    this.img.src = "images/apple.gif";
    document.body.appendChild(this.img);
    apples.push(this);
  },
  update: function() {
    this.img.style.left = this.x;
    this.img.style.bottom = this.y;

    //check if it collides with player
    if (player.x + player.img.width - 30 > this.x) //right of player is to right of bubble side (-30 to compensate for transparency in player image)
      if (player.x < this.x + this.img.width - 30) //left of player is to left of bubble side
        if (player.y + player.img.height > this.y + 30) //head is above bottom of bubble
          if (player.y < this.y + this.img.height) //feet are below top of bubble
            this.pop();

    //gravity
    if (this.y > 100) {
      this.falling = true;

      //check if on a platform
      //TODO fix this.. it dosen't work every time
      Array.from(document.getElementsByClassName("platform")).forEach((platform, i) => {
        if (this.x + this.img.width> platform.offsetLeft) //right of player is to right of platform edge
          if (this.x < platform.offsetLeft + this.img.width) //left of player is to left of platform edge
            if (this.y > parseInt(platform.style.bottom)) //feet are above bottom of platform
              if (this.y < parseInt(platform.style.bottom) + platform.height) { //feet are below top of platform
                this.falling = false;
                return;
              }
      });
      if (this.falling) this.y -= 10;
    }
  },
  pop: function() {
    player.changeHealth(1);
    new Audio('eat.mp3').play();
    apples.splice(apples.indexOf(this), 1);
    this.img.remove();
  }
}

let shell = {
  x: 0,
  y: 0,
  addX: 0,
  addY: 0,
  img: null,
  speed: 4,//setting
  lifetime: 300,//setting: how manny ticks untill shell despawns
  currentlife: 0,
  spawn: function() {
    new Audio('pew.mp3').play();
    this.x = npc.x + (npc.img.width / 2);
    this.y = npc.y + (npc.img.height / 2);
    this.img = document.createElement('img');
    this.img.width = 80;
    this.img.src = "images/shell.png";
    document.body.appendChild(this.img);
    shells.push(this);

    this.currentlife = 0;
    changeX = (player.x + (player.img.width / 2)) - this.x;
    changeY = (player.y) - this.y;
    ratio = (Math.sqrt(Math.pow(changeX, 2) + Math.pow(changeY, 2)) / this.speed)
    this.addX = changeX / ratio;
    this.addY = changeY / ratio;
  },
  update: function() {
    //destroy after specified ammount of ticks
    if (this.currentlife++ == this.lifetime) {
      this.die();
      return;
    }

    this.x += this.addX;
    this.y += this.addY;
    this.img.style.left = this.x;
    this.img.style.bottom = this.y;

    if (this.y < 0 || this.x > document.body.offsetWidth - this.img.width) {
      this.die();
      return;
    }

    //check if it collides with player
    if (player.x + player.img.width - 30 > this.x) //right of player is to right of bubble side (-30 to compensate for transparency in player image)
      if (player.x < this.x + this.img.width - 30) //left of player is to left of bubble side
        if (player.y + player.img.height > this.y + 30) //head is above bottom of bubble
          if (player.y < this.y + this.img.height) //feet are below top of bubble
            this.pop();
  },
  pop: function() {
    player.changeHealth(-1);
    new Audio('pll.mp3').play();
    this.die();
  },
  die: function() {
    shells.splice(shells.indexOf(this), 1);
    this.img.remove();
  }
}

function openSettings() {
  console.log("openSettings");
  document.getElementById("settingsMenu").style.display = "block"
  document.getElementById("gameover").style.display = "none"
  document.getElementById("pause").style.display = "block"

  document.getElementById("player.speed").value = player.speed;
  document.getElementById("player.jumpHeight").value = player.jumpHeight;
  document.getElementById("player.spawnAppleThreshold").value = player.spawnAppleThreshold;
  document.getElementById("npc.speed").value = npc.speed;
  document.getElementById("npc.viewDistance").value = npc.viewDistance;
  document.getElementById("npc.shellTimeout").value = npc.shellTimeout;
  document.getElementById("npc.maxShells").value = npc.maxShells;
  document.getElementById("shell.speed").value = shell.speed;
  document.getElementById("shell.lifetime").value = shell.lifetime;
  document.getElementById("maxBubbles").value = maxBubbles;
  pause = true;
}

function returnToGame() {
  console.log("returnToGame");
  document.getElementById("settingsMenu").style.display = "none"
  document.getElementById("pause").style.display = "none"

  player.speed = parseFloat(document.getElementById("player.speed").value);
  npc.speed = parseFloat(document.getElementById("npc.speed").value);
  player.jumpHeight = parseFloat(document.getElementById("player.jumpHeight").value);
  player.spawnAppleThreshold = parseFloat(document.getElementById("player.spawnAppleThreshold").value);
  npc.viewDistance = parseFloat(document.getElementById("npc.viewDistance").value);
  npc.shellTimeout = parseFloat(document.getElementById("npc.shellTimeout").value);
  npc.maxShells = parseFloat(document.getElementById("npc.maxShells").value);
  shell.speed = parseFloat(document.getElementById("shell.speed").value);
  shell.lifetime = parseFloat(document.getElementById("shell.lifetime").value);
  maxBubbles = parseFloat(document.getElementById("maxBubbles").value);
  pause = false;
}
