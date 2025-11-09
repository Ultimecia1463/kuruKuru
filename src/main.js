import { Application, Sprite, Text, Assets } from "pixi.js";

(async () => {
  const app = new Application();
  await app.init({
    width: window.innerWidth,
    height: window.innerHeight,
    background: "#70c5ce",
  });
  document.body.appendChild(app.canvas);

  const [planeTex, crashTex, rockTex, groundTex] = await Promise.all([
    Assets.load("assets/plane.png"),
    Assets.load("assets/crash.png"),
    Assets.load("assets/rock.png"),
    Assets.load("assets/ground.png"),
  ]);

  const bgMusic = new Audio("assets/bg.mp3");
  const crashSound = new Audio("assets/gameover.mp3");
  bgMusic.loop = true;
  bgMusic.volume = 0.3;
  bgMusic.play().catch(() => {});

  const ground = new Sprite(groundTex);
  ground.width = app.screen.width;
  ground.height = 100;
  ground.y = app.screen.height - 100;
  app.stage.addChild(ground);

  const plane = new Sprite(planeTex);
  plane.anchor.set(0.5);
  plane.scale.set(0.15);
  plane.x = app.screen.width / 4;
  plane.y = app.screen.height / 2;
  app.stage.addChild(plane);

  let velocity = 0;
  const gravity = 0.5;
  const jump = -8;
  const gap = 220;
  const pipeSpeed = 3;
  const pipeWidth = 100;
  let pipes = [];
  let score = 0;
  let gameOver = false;

  const scoreText = new Text({
    text: "Score: 0",
    style: { fill: 0xffffff, fontSize: 36, fontFamily: "Arial" },
  });
  scoreText.anchor.set(0.5);
  scoreText.x = app.screen.width / 2;
  scoreText.y = 50;
  app.stage.addChild(scoreText);

  function spawnPipe(xPos = app.screen.width + pipeWidth) {
    const topHeight = Math.random() * (app.screen.height - gap - 300) + 100;
    const bottomY = topHeight + gap;

    const topPipe = new Sprite(rockTex);
    topPipe.anchor.set(0.5, 0);
    topPipe.rotation = Math.PI;
    topPipe.width = pipeWidth;
    topPipe.height = topHeight;
    topPipe.x = xPos;
    topPipe.y = topHeight-1;

    const bottomPipe = new Sprite(rockTex);
    bottomPipe.anchor.set(0.5, 0);
    bottomPipe.width = pipeWidth;
    bottomPipe.height = app.screen.height - bottomY - 100;
    bottomPipe.x = xPos;
    bottomPipe.y = bottomY;

    pipes.push({ top: topPipe, bottom: bottomPipe, passed: false });
    app.stage.addChild(topPipe);
    app.stage.addChild(bottomPipe);
  }

  for (let i = 0; i < 3; i++) spawnPipe(app.screen.width + i * 350);

  app.ticker.add(() => {
    if (gameOver) return;

    velocity += gravity;
    plane.y += velocity;

    for (const set of pipes) {
      set.top.x -= pipeSpeed;
      set.bottom.x -= pipeSpeed;

      if (set.top.x < -pipeWidth) {
        app.stage.removeChild(set.top);
        app.stage.removeChild(set.bottom);
        pipes.shift();
        spawnPipe();
      }

      if (!set.passed && set.top.x + pipeWidth / 2 < plane.x - 20) {
        set.passed = true;
        score++;
        scoreText.text = `Score: ${score}`;
      }

      const planeBounds = plane.getBounds();
      const topBounds = set.top.getBounds();
      const bottomBounds = set.bottom.getBounds();

      const hitTop =
        planeBounds.x + planeBounds.width > topBounds.x &&
        planeBounds.x < topBounds.x + topBounds.width &&
        planeBounds.y < topBounds.y + topBounds.height;

      const hitBottom =
        planeBounds.x + planeBounds.width > bottomBounds.x &&
        planeBounds.x < bottomBounds.x + bottomBounds.width &&
        planeBounds.y + planeBounds.height > bottomBounds.y;

      if (
        hitTop ||
        hitBottom ||
        plane.y > app.screen.height - 100 ||
        plane.y < 0
      ) {
        endGame();
      }
    }
  });

  window.addEventListener("keydown", (e) => {
    if (e.code === "Space") {
      if (gameOver) location.reload();
      else velocity = jump;
    }
  });

  function endGame() {
    gameOver = true;
    bgMusic.pause();
    crashSound.play();
    plane.texture = crashTex;

    const msg = new Text({
      text: "GAME OVER\nPress SPACE to Restart",
      style: { fill: 0xff0000, fontSize: 50, align: "center" },
    });
    msg.anchor.set(0.5);
    msg.x = app.screen.width / 2;
    msg.y = app.screen.height / 2;
    app.stage.addChild(msg);
  }

  window.addEventListener("resize", () => {
    app.renderer.resize(window.innerWidth, window.innerHeight);
    ground.width = app.screen.width;
    ground.y = app.screen.height - 100;
  });
})();