const startButton = document.querySelector("#button");

class Game {
  constructor(canvas, startButton, context) {
    this.startButton = startButton;
    this.canvas = canvas;
    this.context = context;
    this.holes = [];
    this.holesRadius = 25;
    this.ballsRadius = 20;
    this.walls = [];
    this.poolCueWidth = 600;
    this.poolCueHeight = 10;
    this.poolCue = undefined;
    this.balls = [];
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
      (2 * this.canvas.width) / 3,
      this.canvas.height / 2,
      this.poolCueHeight,
      this.poolCueWidth,
      0
    );
  }
  insertBalls() {
    let color1 = "white";
    this.balls.push(
      new Balls(
        this.context,
        this.canvas.width / 2,
        this.canvas.height / 2,
        this.ballsRadius,
        color1
      )
    );
  }
  renderBalls() {
    this.balls.forEach((ball) => ball.draw());
  }
  checkColisionBallPoolCue() {
    if (this.poolCue.colisible) {
      this.balls.forEach((ball) => {
        let distanceX = ball.posX - this.poolCue.posX;
        let distanceY = ball.posY - this.poolCue.posY;
        let distance = Math.sqrt(distanceX ** 2 + distanceY ** 2);
        if (distance <= ball.radius) {
          ball.colision(this.poolCue.Vx, this.poolCue.Vy);
        }
      });
    }
  }
  moveBalls() {
    this.balls.forEach((ball) => ball.move());
  }
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
          case 0: //up walls
            if (ballY - r < y + h && ballX >= x + h && ballX <= x + w - h) {
              // straight walls
              ball.Vy *= -1;
            } else if (ballX < x + h && ballX > x) {
              // inclined walls
              if (ballY - radProj < y + h - (x + h - (ballX + radProj))) {
                // directs to left
                [ball.Vx, ball.Vy] = [ball.Vy, ball.Vx];
              }
            } else if (ballX > x + w - h && ballX < x + w) {
              // inclined walls
              if (ballY - radProj < y + h - (ballX - radProj - (x + w - h))) {
                // directs to right
                [ball.Vx, ball.Vy] = [-ball.Vy, -ball.Vx];
              }
            }
            break;
          case 90: // right wall
            if (ballX + r > x - h && ballY >= y + h && ballY <= y + w - h) {
              // straight walls
              ball.Vx *= -1;
            } else if (ballY < y + h && ballY > y) {
              if (ballX + radProj > x - h + (y + h - (ballY + radProj))) {
                //directs to up
                [ball.Vx, ball.Vy] = [-ball.Vy, -ball.Vx];
              }
            } else if (ballY > y + w - h && ballY < y + w) {
              if (ballX + radProj > x - h + (ballY - radProj - (y + w - h))) {
                //directs to down
                [ball.Vx, ball.Vy] = [ball.Vy, ball.Vx];
              }
            }
            break;
          case 180: //down walls
            if (ballY + r > y - h && ballX >= x - w + h && ballX <= x - h) {
              // straight walls
              ball.Vy *= -1;
            } else if (ballX < x && ballX > x - h) {
              // inclined walls
              if (ballY + radProj > y - h + (ballX - radProj - (x - h))) {
                //directs to right
                [ball.Vx, ball.Vy] = [ball.Vy, ball.Vx];
              }
            } else if (ballX > x - w && ballX < x - w + h) {
              if (ballY + radProj > y - h + (x - w + h - (ballX + radProj))) {
                //directs to left
                [ball.Vx, ball.Vy] = [-ball.Vy, -ball.Vx];
              }
            }
            break;
          case -90: // left wall
            if (ballX - r < x + h && ballY >= y - w + h && ballY <= y - h) {
              // straight walls
              ball.Vx *= -1;
            } else if (ballY > y - w && ballY < y - w + h) {
              if (ballX - radProj < x + h - (y - w + h - (ballY + radProj))) {
                //directs to up
                [ball.Vx, ball.Vy] = [ball.Vy, ball.Vx];
              }
            } else if (ballY > y - h && ballY < y) {
              if (ballX - radProj < x + h - (ballY - radProj - (y - h))) {
                //directs down
                [ball.Vx, ball.Vy] = [-ball.Vy, -ball.Vx];
              }
            }
            break;
        }
      });
    });
  }
  startGame() {
    context.clearRect(0, 0, this.canvas.width, this.canvas.height);
    this.createSnookerTable();
    this.poolCue.draw();
    this.renderBalls();
    this.checkColisionBallPoolCue();
    this.checkWallColision();
    this.moveBalls();
    this.animationID = requestAnimationFrame(() => this.startGame());
  }
}
// W I N D O W . O N L O A D ========================
window.onload = () => {
  startButton.style = "display:block";
  startButton.onclick = () => {
    startButton.style = "display:hidden";
    canvas = document.querySelector("#canvas");
    canvas.style = "display:block";
    context = canvas.getContext("2d");
    game = new Game(canvas, startButton, context);
    game.createHoles();
    game.createWalls();
    game.createPoolCue();
    game.insertBalls();
    game.startGame();
    window.addEventListener("keydown", (event) => game.poolCue.move(event));
    window.addEventListener("keyup", (event) => game.poolCue.shot(event));
  };
};
// W I N D O W . O N L O A D ========================
