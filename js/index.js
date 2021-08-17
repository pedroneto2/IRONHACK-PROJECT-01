const startButton = document.querySelector("#button");
const poolCueHit = new Audio("./audio/poolCueHit.wav");
const ballSinking = new Audio("./audio/sinking.wav");
const music = new Audio("./audio/music.mp3");
const wallHit = new Audio("./audio/ballHitsWall.wav");
const ballHit = new Audio("./audio/ballHit.wav");

class Game {
  constructor(canvas, context) {
    this.canvas = canvas;
    this.context = context;
    this.holes = [];
    this.holesRadius = canvas.height / 30;
    this.ballsRadius = canvas.height / 37.5;
    this.walls = [];
    this.poolCueWidth = canvas.height / 1.25;
    this.poolCueHeight = canvas.height / 75;
    this.poolCue = undefined;
    this.balls = [];
    this.ballColors = [
      "blue",
      "red",
      "yellow",
      "Brown",
      "Chartreuse",
      "Cyan",
      "DarkGray",
      "DarkMagenta",
      "DeepPink",
      "LightCoral",
      "Teal",
      "Tomato",
      "Orange",
      "Olive",
      "MediumPurple",
    ];
    this.animationID = undefined;
  }
  createWalls() {
    let d = this.holesRadius * 2;
    let h = this.canvas.height;
    let w = this.canvas.width;
    this.walls.push(new Walls(context, d, 0, d, w / 2 - (3 * d) / 2, 0)); // up left
    this.walls.push(
      new Walls(context, d / 2 + w / 2, 0, d, w / 2 - (3 * d) / 2, 0) // up right
    );
    this.walls.push(new Walls(context, 0, h - d, d, h - 2 * d, -90)); //left
    this.walls.push(new Walls(context, w, d, d, h - 2 * d, 90)); // right
    this.walls.push(
      new Walls(context, w / 2 - d / 2, h, d, w / 2 - (3 * d) / 2, 180) // down left
    );
    this.walls.push(
      new Walls(context, w - d, h, d, w / 2 - (3 * d) / 2, 180) // down left
    );
  }
  createHoles() {
    let r = this.holesRadius;
    let h = this.canvas.height;
    let w = this.canvas.width;
    let color = "black";
    this.holes.push(new Holes(context, r, r, r, color)); //up left
    this.holes.push(new Holes(context, w / 2, r, r, color)); //up middle
    this.holes.push(new Holes(context, w - r, r, r, color)); // up right
    this.holes.push(new Holes(context, r, h - r, r, color)); //down left
    this.holes.push(new Holes(context, w / 2, h - r, r, color)); //down middle
    this.holes.push(new Holes(context, w - r, h - r, r, color)); //down right
  }
  createSnookerTable() {
    this.holes.forEach((hole) => hole.draw());
    this.walls.forEach((wall) => wall.drawWall());
  }
  createPoolCue() {
    this.poolCue = new PoolCue(
      this.context,
      this.canvas.width / 2,
      this.canvas.height / 3,
      this.poolCueHeight,
      this.poolCueWidth,
      0
    );
  }
  insertBalls(ballsQuantity = 15) {
    let xdistanceQueue = (2 * this.ballsRadius + 2) * Math.cos(Math.PI / 6);
    let initialPosX = this.canvas.width / 3;
    let initialPosY = this.canvas.height / 2;
    let posY;
    let queue = 1;
    let ballsperQueue = 1;
    this.ballColors.map((color, index) => {
      if (index < ballsQuantity) {
        if (ballsperQueue === 1) {
          posY = initialPosY;
        }
        this.balls.push(
          new Balls(this.context, initialPosX, posY, this.ballsRadius, color)
        );
        if (ballsperQueue < queue) {
          posY += 2 * this.ballsRadius + 2;
          ballsperQueue++;
        } else {
          initialPosX -= xdistanceQueue;
          initialPosY -= (2 * this.ballsRadius + 2) / 2;
          ballsperQueue = 1;
          queue++;
        }
      }
    });
  }
  insertWhiteBall() {
    let whiteBall = "white";
    this.balls.push(
      new Balls(
        this.context,
        (4 * this.canvas.width) / 5,
        this.canvas.height / 2,
        this.ballsRadius,
        whiteBall
      )
    );
  }
  renderBalls() {
    this.balls.forEach((ball) => ball.draw());
  }
  checkColisionBallPoolCue() {
    if (this.poolCue.colisable) {
      this.balls.forEach((ball) => {
        let distanceX = ball.posX - this.poolCue.posX;
        let distanceY = ball.posY - this.poolCue.posY;
        let distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
        if (distance <= ball.radius) {
          ball.poolCueCollision(this.poolCue.Vx, this.poolCue.Vy);
          poolCueHit.play();
        }
      });
    }
  }
  moveBalls() {
    this.balls.forEach((ball) => ball.move());
  }
  //ARRUMA=============================
  checkWallColision() {
    let r = this.ballsRadius;
    let radProj = r * 0.70710678; // modulus of 45 degrees radius projection on axis x or y
    this.balls.forEach((ball) => {
      let ballX = ball.posX;
      let ballY = ball.posY;
      this.walls.forEach((wall) => {
        let h = wall.height;
        let w = wall.width;
        let x = wall.posX;
        let y = wall.posY;
        switch (wall.rotationAngle) {
          case 0: //====-up walls-====
            if (ballY - r < y + h && ballX >= x + h && ballX <= x + w - h) {
              // STRAIGHT WALLS
              if (ball.Vy < 0) {
                ball.Vy *= -1;
              }
              ballY = y - h + r + 1; //avoid ball overlapping wall
              let sound = wallHit.cloneNode(false);
              sound.volume = wallHit.volume;
              sound.play();
            } else if (ballX < x + h && ballX > x) {
              // inclined walls
              if (ballY - radProj < y + h - (x + h - (ballX + radProj))) {
                // directs to left
                [ball.Vx, ball.Vy] = [ball.Vy, ball.Vx];
                let sound = wallHit.cloneNode(false);
                sound.volume = wallHit.volume;
                sound.play();
              }
            } else if (ballX > x + w - h && ballX < x + w) {
              // inclined walls
              if (ballY - radProj < y + h - (ballX - radProj - (x + w - h))) {
                // directs to right
                [ball.Vx, ball.Vy] = [-ball.Vy, -ball.Vx];
                let sound = wallHit.cloneNode(false);
                sound.volume = wallHit.volume;
                sound.play();
              }
            }
            break;
          case 90: // ====-right wall-====
            if (ballX + r > x - h && ballY >= y + h && ballY <= y + w - h) {
              // STRAIGHT WALLS
              if (ball.Vx > 0) {
                ball.Vx *= -1;
              }
              ballY = x - h - r - 1; //avoid ball overlapping wall
              let sound = wallHit.cloneNode(false);
              sound.volume = wallHit.volume;
              sound.play();
            } else if (ballY < y + h && ballY > y) {
              if (ballX + radProj > x - h + (y + h - (ballY + radProj))) {
                //directs to up
                [ball.Vx, ball.Vy] = [-ball.Vy, -ball.Vx];
                let sound = wallHit.cloneNode(false);
                sound.volume = wallHit.volume;
                sound.play();
              }
            } else if (ballY > y + w - h && ballY < y + w) {
              if (ballX + radProj > x - h + (ballY - radProj - (y + w - h))) {
                //directs to down
                [ball.Vx, ball.Vy] = [ball.Vy, ball.Vx];
                let sound = wallHit.cloneNode(false);
                sound.volume = wallHit.volume;
                sound.play();
              }
            }
            break;
          case 180: //====-down walls-=====
            if (ballY + r > y - h && ballX >= x - w + h && ballX <= x - h) {
              // STRAIGHT WALLS
              if (ball.Vy > 0) {
                ball.Vy *= -1;
              }
              ballY = y - h - r - 1; //avoid ball overlapping wall
              let sound = wallHit.cloneNode(false);
              sound.volume = wallHit.volume;
              sound.play();
            } else if (ballX < x && ballX > x - h) {
              // inclined walls
              if (ballY + radProj > y - h + (ballX - radProj - (x - h))) {
                //directs to right
                [ball.Vx, ball.Vy] = [ball.Vy, ball.Vx];
                let sound = wallHit.cloneNode(false);
                sound.volume = wallHit.volume;
                sound.play();
              }
            } else if (ballX > x - w && ballX < x - w + h) {
              if (ballY + radProj > y - h + (x - w + h - (ballX + radProj))) {
                //directs to left
                [ball.Vx, ball.Vy] = [-ball.Vy, -ball.Vx];
                let sound = wallHit.cloneNode(false);
                sound.volume = wallHit.volume;
                sound.play();
              }
            }
            break;
          case -90: // ====-left wall-====
            if (ballX - r < x + h && ballY >= y - w + h && ballY <= y - h) {
              // STRAIGHT WALLS
              if (ball.Vx < 0) {
                ball.Vx *= -1;
              }
              ballX = x + h + r + 1; //avoid ball overlapping wall
              let sound = wallHit.cloneNode(false);
              sound.volume = wallHit.volume;
              sound.play();
            } else if (ballY > y - w && ballY < y - w + h) {
              if (ballX - radProj < x + h - (y - w + h - (ballY + radProj))) {
                //directs to up
                [ball.Vx, ball.Vy] = [ball.Vy, ball.Vx];
                let sound = wallHit.cloneNode(false);
                sound.volume = wallHit.volume;
                sound.play();
              }
            } else if (ballY > y - h && ballY < y) {
              if (ballX - radProj < x + h - (ballY - radProj - (y - h))) {
                //directs down
                [ball.Vx, ball.Vy] = [-ball.Vy, -ball.Vx];
                let sound = wallHit.cloneNode(false);
                sound.volume = wallHit.volume;
                sound.play();
              }
            }
            break;
        }
      });
    });
  }
  checkIfBallSinked() {
    this.balls.forEach((ball, indice) => {
      let posX = (4 * this.canvas.width) / 5;
      let posY = this.canvas.height / 2;
      let color1 = "white";
      this.holes.forEach((hole) => {
        let distanceBallHole = Math.sqrt(
          (ball.posX - hole.posX) ** 2 + (ball.posY - hole.posY) ** 2
        );
        if (distanceBallHole <= hole.radius) {
          this.balls.splice(indice, 1);
          let sound = ballSinking.cloneNode(false);
          sound.volume = ballSinking.volume;
          sound.play();
          if (ball.color === color1) {
            console.log("White ball sinked, you lose point!");
            //check if there is free space to insert white ball again if it was sinked
            //case negative, subtract a ball diameter from original X position
            this.balls.forEach((ball2) => {
              let distance = Math.sqrt(
                (posX - ball2.posX) ** 2 + (posY - ball2.posY) ** 2
              );
              if (distance <= 2 * (this.ballsRadius + 2)) {
                posX -= 4 * (this.ballsRadius + 3);
              }
            });
            this.balls.push(
              new Balls(this.context, posX, posY, this.ballsRadius, color1)
            );
          }
        }
      });
    });
  }
  retrieveVelocityAngle(ball1) {
    let v1Quadrant4 = ball1.Vx > 0 && ball1.Vy <= 0;
    let v1Quadrant3 = ball1.Vx <= 0 && ball1.Vy < 0;
    let v1Quadrant2 = ball1.Vx < 0 && ball1.Vy >= 0;
    let v1Quadrant1 = ball1.Vx >= 0 && ball1.Vy > 0;
    let v1Angle;
    switch (true) {
      case v1Quadrant4:
        v1Angle = Math.atan(Math.abs(ball1.Vx / ball1.Vy)) + (3 * Math.PI) / 2;
        break;
      case v1Quadrant3:
        v1Angle = Math.atan(Math.abs(ball1.Vy / ball1.Vx)) + Math.PI;
        break;
      case v1Quadrant2:
        v1Angle = Math.atan(Math.abs(ball1.Vx / ball1.Vy)) + Math.PI / 2;
        break;
      case v1Quadrant1:
        v1Angle = Math.atan(Math.abs(ball1.Vy / ball1.Vx));
        break;
    }
    return v1Angle;
  }
  transferVelocity(ball1, ball2, ball1Vx, ball1Vy, index) {
    let v1Modulus = Math.sqrt(ball1Vx ** 2 + ball1Vy ** 2);
    let vnAngle, v1Angle, angleBetween;
    let vnQuadrant4 = ball2.posX > ball1.posX && ball2.posY <= ball1.posY;
    let vnQuadrant3 = ball2.posX <= ball1.posX && ball2.posY < ball1.posY;
    let vnQuadrant2 = ball2.posX < ball1.posX && ball2.posY >= ball1.posY;
    let vnQuadrant1 = ball2.posX >= ball1.posX && ball2.posY > ball1.posY;
    switch (true) {
      case vnQuadrant4:
        vnAngle =
          Math.atan((ball2.posX - ball1.posX) / (ball1.posY - ball2.posY)) +
          (3 * Math.PI) / 2;
        break;
      case vnQuadrant3:
        vnAngle =
          Math.atan((ball1.posY - ball2.posY) / (ball1.posX - ball2.posX)) +
          Math.PI;
        break;
      case vnQuadrant2:
        vnAngle =
          Math.atan((ball1.posX - ball2.posX) / (ball2.posY - ball1.posY)) +
          Math.PI / 2;
        break;
      case vnQuadrant1:
        vnAngle = Math.atan(
          (ball2.posY - ball1.posY) / (ball2.posX - ball1.posX)
        );
        break;
    }
    v1Angle = this.retrieveVelocityAngle(ball1);
    angleBetween = Math.abs(vnAngle - v1Angle);
    let normalVelocityModulus = v1Modulus * Math.cos(angleBetween);
    let Vnx = normalVelocityModulus * Math.cos(vnAngle);
    let Vny = normalVelocityModulus * Math.sin(vnAngle);
    let Vtx = ball1Vx - Vnx;
    let Vty = ball1Vy - Vny;
    ball2.Vx += Vnx;
    ball2.Vy += Vny;
    if (index === 0) {
      ball1.Vx = Vtx;
      ball1.Vy = Vty;
    } else {
      ball1.Vx += Vtx;
      ball1.Vy += Vty;
    }
  }
  checkBallsColision() {
    this.balls.forEach((ball1, index1) => {
      if (ball1.Vx !== 0 || ball1.Vy !== 0) {
        let ballsCollidingWithBall1 = [];
        this.balls.forEach((ball2, index2) => {
          if (ball2.colisable && index1 !== index2) {
            let distance = Math.sqrt(
              (ball2.posX - ball1.posX) ** 2 + (ball2.posY - ball1.posY) ** 2
            );
            if (distance <= 2 * ball2.radius) {
              ballsCollidingWithBall1.push(ball2);
            }
          }
        });
        let dividedVx = ball1.Vx / ballsCollidingWithBall1.length;
        let dividedVy = ball1.Vy / ballsCollidingWithBall1.length;
        ballsCollidingWithBall1.forEach((ball2, index3) => {
          this.transferVelocity(ball1, ball2, dividedVx, dividedVy, index3);
          if (index3 === 0) {
            let sound = ballHit.cloneNode(false);
            sound.volume = ballHit.volume;
            sound.play();
          }
        });
        ball1.colisable = false;
      }
    });
    this.balls.forEach((ball) => (ball.colisable = true));
  }
  regressPosition(ball1, ball2, counter = 1) {
    //regress ball position until it is located at ball boundary, where collision occurs
    let distance = Math.sqrt(
      (ball2.posX - ball1.posX) ** 2 + (ball2.posY - ball1.posY) ** 2
    );
    if (distance >= 2 * (ball1.radius - 0.1) && distance <= 2 * ball1.radius) {
      return;
    }
    let overLapping = Math.abs(2 * ball1.radius - distance);
    let angle = this.retrieveVelocityAngle(ball1);
    if (distance < 2 * (ball1.radius - 0.1)) {
      ball1.posX -= overLapping * Math.cos(angle) * 0.999;
      ball1.posY -= overLapping * Math.sin(angle) * 0.999;
    }
    if (distance > 2 * ball1.radius) {
      //this is just a safety-secure code but probably it will never be trigged
      ball1.posX += overLapping * Math.cos(angle) * 0.999;
      ball1.posY += overLapping * Math.sin(angle) * 0.999;
    }
    this.regressPosition(ball1, ball2, counter++);
  }
  fixOverLapping() {
    this.balls.forEach((ball1, index) => {
      this.balls.forEach((ball2, index2) => {
        if (index !== index2) {
          if (ball1.Vx !== 0 || ball1.Vy !== 0) {
            let distance = Math.sqrt(
              (ball2.posX - ball1.posX) ** 2 + (ball2.posY - ball1.posY) ** 2
            );
            if (distance < 2 * (ball1.radius - 0.1)) {
              this.regressPosition(ball1, ball2);
            }
          }
        }
      });
    });
  }
  startGame() {
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.createSnookerTable();
    this.renderBalls();
    this.checkColisionBallPoolCue();
    this.checkBallsColision();
    this.checkWallColision();
    this.checkIfBallSinked();
    this.moveBalls();
    this.fixOverLapping();
    this.poolCue.draw();
    this.animationID = requestAnimationFrame(() => this.startGame());
  }
}
// W I N D O W . O N L O A D ========================
window.onload = () => {
  startButton.style = "display:block";
  startButton.onclick = () => {
    increaseVol = document.querySelector("#increase");
    decreaseVol = document.querySelector("#decrease");
    musicButton = document.querySelector("#mute");
    increaseAmbientButton = document.querySelector("#increaseAmbient");
    decreaseAmbientButton = document.querySelector("#decreaseAmbient");
    ambientButton = document.querySelector("#muteAmbient");
    ambientContainer = document.querySelector("#ambient");
    musicContainer = document.querySelector("#music");
    music.volume = 0.1;
    poolCueHit.volume = 0.5;
    ballHit.volume = 0.5;
    ballSinking.volume = 0.5;
    wallHit.volume = 0.5;
    musicState = true;
    ambientState = true;
    startButton.style = "transform: translateX(-1500px)";
    setTimeout(() => clickButton(), 300);
  };
};
// W I N D O W . O N L O A D ========================

function clickButton() {  
  music.play();
  music.loop = true
  startButton.style = "display:none";
  canvas = document.querySelector("#canvas");
  canvas.style = "background-image:none";
  ambientContainer.style = "display:flex";
  musicContainer.style = "display:flex";
  context = canvas.getContext("2d");
  game = new Game(canvas, context);
  game.createHoles();
  game.createWalls();
  game.createPoolCue();
  game.insertWhiteBall();
  game.insertBalls();
  game.startGame();
  window.addEventListener("keydown", (event) => game.poolCue.move(event));
  window.addEventListener("keyup", (event) => game.poolCue.shot(event));
  musicButton.addEventListener("click", () => musicStatus());
  increaseVol.addEventListener("click", () => increaseMusic());
  decreaseVol.addEventListener("click", () => decreaseMusic());
  ambientButton.addEventListener("click", () => ambientStatus());
  increaseAmbientButton.addEventListener("click", () => increaseAmbient());
  decreaseAmbientButton.addEventListener("click", () => decreaseAmbient());
}

function musicStatus() {
  if (musicState) {
    music.pause();
    musicButton.innerHTML = "Play Music";
    musicState = false;
  } else {
    music.play();
    musicButton.innerHTML = "Mute Music";
    musicState = true;
  }
}

function increaseMusic() {
  if (music.volume < 0.95) {
    music.volume += 0.05;
  }
}

function decreaseMusic() {
  if (music.volume > 0.05) {
    music.volume -= 0.05;
  }
}

function ambientStatus() {
  if (ambientState) {
    poolCueHit.volume = 0;
    ballHit.volume = 0;
    ballSinking.volume = 0;
    wallHit.volume = 0;
    ambientButton.innerHTML = "Play Ambient";
    ambientState = false;
  } else {
    poolCueHit.volume = 0.5;
    ballHit.volume = 0.5;
    ballSinking.volume = 0.5;
    wallHit.volume = 0.5;
    ambientButton.innerHTML = "Mute Ambient";
    ambientState = true;
  }
}

function increaseAmbient() {
  if (poolCueHit.volume < 0.95) {
    poolCueHit.volume += 0.05;
    ballHit.volume += 0.05;
    ballSinking.volume += 0.05;
    wallHit.volume += 0.05;
  }
}

function decreaseAmbient() {
  if (poolCueHit.volume > 0.05) {
    poolCueHit.volume -= 0.05;
    ballHit.volume -= 0.05;
    ballSinking.volume -= 0.05;
    wallHit.volume -= 0.05;
  }
}
