class Objects {
  constructor(context, posX, posY) {
    this.context = context;
    this.posX = posX;
    this.posY = posY;
  }
}

class Holes extends Objects {
  constructor(context, posX, posY, radius, color) {
    super(context, posX, posY);
    this.radius = radius;
    this.color = color;
  }
  draw() {
    this.context.save();
    this.context.fillStyle = this.color;
    this.context.moveTo(this.posX, this.posY);
    this.context.beginPath();
    this.context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2);
    this.context.stroke();
    this.context.fill();
    this.context.restore();
  }
}

class Walls extends Objects {
  constructor(context, posX, posY, height, width, rotationAngle) {
    super(context, posX, posY);
    this.bodyPointsCoord = [];
    this.height = height;
    this.width = width;
    this.rotationAngle = rotationAngle;
  }
  drawWall() {
    this.context.save();
    this.context.fillStyle = "#1b592b";
    this.context.strokeStyle = "#1b592b";
    this.context.translate(this.posX, this.posY);
    this.context.rotate((Math.PI / 180) * this.rotationAngle);
    this.context.beginPath();
    this.context.moveTo(0, 0);
    this.context.lineTo(this.height, this.height);
    this.context.lineTo(this.width - this.height, this.height);
    this.context.lineTo(this.width, 0);
    this.context.closePath();
    this.context.stroke();
    this.context.fill();
    this.context.restore();
  }
}

class PoolCue extends Objects {
  constructor(context, posX, posY, height, width, rotationAngle) {
    super(context, posX, posY);
    this.height = height;
    this.width = width;
    this.rotationAngle = rotationAngle;
    this.walkVelocity = 5;
    this.colisable = false;
    this.Vx = 0;
    this.Vy = 0;
    this.power = 0;
    this.limitPosition = undefined;
  }
  draw() {
    this.context.save();
    this.context.fillStyle = "#8a2500";
    this.context.translate(this.posX, this.posY);
    this.context.rotate((Math.PI / 180) * this.rotationAngle);
    this.context.fillRect(0, -this.height / 2, this.width / 60, this.height);
    this.context.fillStyle = "#ffffff";
    this.context.fillRect(
      this.width / 60,
      -this.height / 2,
      this.width / 20,
      this.height
    );
    this.context.fillStyle = "#f2cf96";
    this.context.fillRect(
      this.width / 20,
      -this.height / 2,
      this.width - this.width / 2.5,
      this.height
    );
    this.context.fillStyle = "#1b0d42";
    this.context.fillRect(
      this.width - this.width / 2.5,
      -this.height / 2,
      this.width / 3,
      this.height
    );
    this.context.restore();
  }
  loadShot() {
    if (this.power < 40) {
      let cossin = Math.cos((Math.PI / 180) * this.rotationAngle);
      let sin = Math.sin((Math.PI / 180) * this.rotationAngle);
      if (this.power === 0) {
        this.limitPosition = [this.posX - 10 * cossin, this.posY - 10 * sin];
      }
      this.posX += cossin;
      this.posY += sin;
      this.power += 1;
    }
  }
  shot(event) {
    if (event.key === " ") {
      this.colisable = true;
      this.Vx = this.power * -Math.cos((Math.PI / 180) * this.rotationAngle);
      this.Vy = this.power * -Math.sin((Math.PI / 180) * this.rotationAngle);
      this.power = 0;
      this.posX = this.limitPosition[0];
      this.posY = this.limitPosition[1];
      setTimeout(() => (this.colisable = false), 500);
    }
  }
  move(event) {
    switch (event.key) {
      case "ArrowLeft":
        event.preventDefault(); // prevents scrolling
        this.posX -= this.walkVelocity;
        break;
      case "ArrowRight":
        event.preventDefault();
        this.posX += this.walkVelocity;
        break;
      case "ArrowUp":
        event.preventDefault();
        this.posY -= this.walkVelocity;
        break;
      case "ArrowDown":
        event.preventDefault();
        this.posY += this.walkVelocity;
        break;
      case "+":
      case "=":
        if (this.walkVelocity < 11) {
          this.walkVelocity++;
        }
        break;
      case "-":
      case "_":
        if (this.walkVelocity > 1) {
          this.walkVelocity--;
        }
        break;
      case "d":
      case "D":
        this.rotationAngle += this.walkVelocity;
        break;
      case "a":
      case "A":
        this.rotationAngle -= this.walkVelocity;
        break;
      case " ":
        event.preventDefault();
        this.loadShot();
        break;
    }
  }
}

class Balls extends Holes {
  constructor(context, posX, posY, radius, color) {
    super(context, posX, posY, radius, color);
    this.Vx = 0;
    this.Vy = 0;
    this.movingFriction = 0.97;
    this.colisable = true;
  }
  move() {
    this.posX += this.Vx;
    this.posY += this.Vy;
    this.Vx *= this.movingFriction;
    this.Vy *= this.movingFriction;
    if (Math.abs(this.Vx) < 0.1) {
      this.Vx = 0;
    }
    if (Math.abs(this.Vy) < 0.1) {
      this.Vy = 0;
    }
  }
  poolCueCollision(velocityX, velocityY) {
    this.Vx += velocityX;
    this.Vy += velocityY;
  }
}

if (typeof module !== "undefined") {
  module.exports = { Holes, Walls, PoolCue, Balls };
}
