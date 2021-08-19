/**
 * @jest-environment jsdom
 */

const Game = require("../js/index");
const { Holes, Walls, PoolCue, Balls } = require("../js/objects");
const canvas = document.createElement("canvas");
canvas.height = 696;
canvas.width = 1300;
context = canvas.getContext("2d");
HTMLMediaElement.prototype.play = () => {
  return;
};
let game;
let overLappedOcurrences = [];

describe("BALLS OVERLAPPING", () => {
  const velocitiesAndPositions = [
    { posX: 1040, posY: 348, Vx: -20, Vy: 0 },
    { posX: 1040, posY: 348, Vx: -30, Vy: 0 },
    { posX: 1040, posY: 348, Vx: -40, Vy: 0 },
    { posX: 446, posY: 220, Vx: -28, Vy: -28 },
    { posX: 446, posY: 460, Vx: -28, Vy: 28 },
    { posX: 165, posY: 348, Vx: 40, Vy: 0 },
    { posX: 446, posY: 220, Vx: -20, Vy: -20 },
    { posX: 446, posY: 460, Vx: -20, Vy: 20 },
    { posX: 165, posY: 348, Vx: 30, Vy: 0 },
    { posX: 446, posY: 220, Vx: -10, Vy: -10 },
    { posX: 446, posY: 460, Vx: -10, Vy: 10 },
    { posX: 165, posY: 348, Vx: 10, Vy: 0 },
    { posX: 495, posY: 348, Vx: -40, Vy: 0 },
    { posX: 495, posY: 348, Vx: -10, Vy: 0 },
    { posX: 495, posY: 348, Vx: -5, Vy: 0 },
  ];

  velocitiesAndPositions.map((position) => {
    beforeEach(() => {
      game = new Game(canvas, context, Balls, Walls, Holes, PoolCue);
      game.createHoles();
      game.createWalls();
      game.createPoolCue();
      game.insertWhiteBall();
      game.insertBalls();
    });

    describe("Throw white ball to the others balls and verify if occurs OVERLAPPING", () => {
      beforeEach(() => {
        overLappedOcurrences = [];
        game.balls[0].posX = position.posX;
        game.balls[0].posY = position.posY;
        game.balls[0].Vx = position.Vx;
        game.balls[0].Vy = position.Vy;
        while (!game.balls.every((ball) => ball.Vx === 0 && ball.Vy === 0)) {
          game.context.clearRect(0, 0, game.canvas.width, game.canvas.height);
          game.createSnookerTable();
          game.checkColisionBallPoolCue();
          game.checkBallsColision();
          game.checkWallColision();
          game.checkIfBallSinked();
          game.moveBalls();
          game.fixOverLapping();
          game.balls.forEach((ball1, index) => {
            game.balls.forEach((ball2, index2) => {
              if (index !== index2) {
                let distance = Math.sqrt(
                  (ball1.posX - ball2.posX) ** 2 +
                    (ball1.posY - ball2.posY) ** 2
                );
                if (distance < 2 * (ball1.radius - 0.1)) {
                  overLappedOcurrences.push(index);
                }
              }
            });
          });
        }
      });
      it(`Using White Ball setup: {posX:${position.posX},posY:${position.posY},Vx:${position.Vx},Vy:${position.Vy}}`, () => {
        expect(overLappedOcurrences.length).toEqual(0);
      });
    });
  });
});

describe("WALLS TRANSPASSING", () => {
  beforeEach(() => {
    game = new Game(canvas, context, Balls, Walls, Holes, PoolCue);
    game.createHoles();
    game.createWalls();
    game.createPoolCue();
    game.insertWhiteBall();
    game.insertBalls();
  });

  describe("Throw all balls randomly and checks if occurs TRANSPASSING", () => {
    beforeEach(() => {
      transpassingOcurrences = [];
      let occurrence;
      throws = 1; // CHANGE THIS IF YOU GONNA TEST ONLY TRANSPASSING, IT CONSUMES A LOT OF PROCESSING AND TIME
      randomVx = Math.floor(Math.random() * 80) - 40;
      randomVy = Math.floor(Math.random() * 80) - 40;
      for (let i = 0; i < throws; i++) {
        game.balls.forEach((ball) => {
          ball.Vx = randomVx;
          ball.Vy = randomVy;
        });
        while (!game.balls.every((ball) => ball.Vx === 0 && ball.Vy === 0)) {
          game.context.clearRect(0, 0, game.canvas.width, game.canvas.height);
          game.createSnookerTable();
          game.checkColisionBallPoolCue();
          game.checkBallsColision();
          game.checkWallColision();
          game.checkIfBallSinked();
          game.moveBalls();
          game.fixOverLapping();
        }
        occurrence = game.balls.some((ball1) => {
          //side walls
          return (
            (ball1.posY >
              game.walls[2].posY - game.walls[2].width + game.walls[2].height &&
              ball1.posY < game.walls[2].posY - game.walls[2].height &&
              (ball1.posX - ball1.radius <
                game.walls[2].posX + game.walls[2].height ||
                ball1.posX + ball1.radius >
                  game.walls[3].posX - game.walls[3].height)) ||
            //up and down walls -- left
            (ball1.posX > game.walls[0].posX + game.walls[0].height &&
              ball1.posX <
                game.walls[0].posX +
                  game.walls[0].width -
                  game.walls[0].height &&
              (ball1.posY - ball1.radius <
                game.walls[0].posY + game.walls[0].height ||
                ball1.posY + ball1.radius >
                  game.walls[4].posY - game.walls[4].height)) ||
            //up and down walls -- right
            (ball1.posX > game.walls[1].posX + game.walls[1].height &&
              ball1.posX <
                game.walls[1].posX +
                  game.walls[1].width -
                  game.walls[1].height &&
              (ball1.posY - ball1.radius <
                game.walls[1].posY + game.walls[1].height ||
                ball1.posY + ball1.radius >
                  game.walls[5].posY - game.walls[5].height))
          );
        });
        if (occurrence) {
          transpassingOcurrences.push(i);
        }
      }
    });
    it(`Testing...`, () => {
      expect(transpassingOcurrences.length).toEqual(0);
    });
  });
});
