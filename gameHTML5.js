var keys = []
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
    if (keys && (keys[65] || keys[37])) player.walk("left");
    if (keys && (keys[68] || keys[39])) player.walk("right");
    if (keys && keys[32]) player.jump();
    player.update();

    bubbles.forEach((bubble, i) => {
      //bubble.y += bubble.speed;
      bubble.update();
    });

    if (bubbles.length < 4) {
        var b = Object.create(bubble);
        b.spawn();
    }
}

let player = {
  speed: 7,
  jumpHeight: 20,
  x: 100,
  y: 100,
  looking: "right",
  imgAction: "idle",
  lastImg: "idle",
  img: document.getElementById("player"),
  score: 0,
  falling: false,
  update: function() {
    this.img.style.left = this.x;
    this.img.style.bottom = this.y;

    if (this.looking == "left") {
      this.img.style.transform = "scaleX(-1)"
    } else {
     this.img.style.transform = "scaleX(1)"
    }

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
          if (this.x + this.img.width - 80 > platform.offsetLeft) {//right of player is to right of platform edge
            if (this.x < platform.offsetLeft + this.img.width + 30) {//left of player is to left of platform edge
              if (this.y > parseInt(platform.style.bottom)) {//feet are above bottom of platform
                if (this.y < parseInt(platform.style.bottom) + platform.height) {//feet are below top of platform
                  this.falling = false;
                  return;
                }
              }
            }
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
      player.looking = "left";
      if (this.jumpFrame == 0)
        player.imgAction = "walk";
    } else {
      player.x += player.speed;
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
  }
}

var bubbles = []
let bubble = {
  x: 100,
  y: 100,
  speed: 0.3,//how fast to rise
  img: null,
  pop: false,
  popWait: 10,//how manny frames to show pop image
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
    if (player.x + player.img.width - 30 > this.x) {//right of player is to right of bubble side (-30 to compensate for transparency in player image)
      if (player.x < this.x + this.img.width - 30) {//left of player is to left of bubble side
        if (player.y + player.img.height > this.y + 30) {//head is above bottom of bubble
          if (player.y < this.y + this.img.height) {//feet are below top of bubble
            this.pop();
          }
        }
      }
    }

  },
  pop: function() {
    this.img.src = "images/pop.png";
    this.pop = true;
    player.addScore();
    new Audio('pop.mp3').play();
  }

}
