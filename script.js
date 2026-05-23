const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");

const levelValue = document.getElementById("levelValue");
const lifeValue = document.getElementById("lifeValue");
const scoreValue = document.getElementById("scoreValue");
const statusBadge = document.getElementById("statusBadge");
const effectList = document.getElementById("effectList");

const GAME_WIDTH = canvas.width;
const GAME_HEIGHT = canvas.height;
const HUD_HEIGHT = 44;
const TOP_OFFSET = 90;
const BLOCK_COLUMNS = 10;
const BLOCK_WIDTH = 80;
const BLOCK_HEIGHT = 24;
const BLOCK_GAP = 8;
const BALL_RADIUS = 8;
const MAX_BALLS = 5;
const SCORE_VALUES = {
  normal: 100,
  durable: 200,
};
const ITEM_WEIGHTS = [
  { type: "multiball", weight: 0.3 },
  { type: "expand", weight: 0.3 },
  { type: "slow", weight: 0.2 },
  { type: "score", weight: 0.2 },
];

const keys = {
  left: false,
  right: false,
};

const levelConfigs = [
  {
    rows: 4,
    speed: 280,
    itemRate: 0.24,
    layout: [
      [1, 1, 1, 1, 1, 1, 1, 1, 1, 1],
      [1, 1, 1, 0, 1, 1, 0, 1, 1, 1],
      [1, 0, 1, 1, 1, 1, 1, 1, 0, 1],
      [1, 1, 1, 1, 0, 0, 1, 1, 1, 1],
    ],
  },
  {
    rows: 5,
    speed: 340,
    itemRate: 0.2,
    layout: [
      [2, 1, 1, 2, 1, 1, 2, 1, 1, 2],
      [1, 1, 2, 1, 1, 1, 1, 2, 1, 1],
      [1, 2, 1, 1, 0, 0, 1, 1, 2, 1],
      [1, 1, 1, 2, 1, 1, 2, 1, 1, 1],
      [0, 1, 1, 1, 2, 2, 1, 1, 1, 0],
    ],
  },
  {
    rows: 6,
    speed: 410,
    itemRate: 0.16,
    layout: [
      [2, 2, 1, 2, 2, 2, 2, 1, 2, 2],
      [2, 1, 2, 1, 2, 2, 1, 2, 1, 2],
      [1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
      [2, 1, 2, 1, 0, 0, 1, 2, 1, 2],
      [1, 2, 1, 2, 1, 1, 2, 1, 2, 1],
      [2, 2, 1, 1, 2, 2, 1, 1, 2, 2],
    ],
  },
];

const state = {
  mode: "title",
  level: 1,
  score: 0,
  lives: 3,
  levelMessageTimer: 0,
  paddle: null,
  balls: [],
  blocks: [],
  items: [],
  effects: {
    expand: 0,
    slow: 0,
  },
};

function createPaddle() {
  return {
    x: GAME_WIDTH / 2 - 70,
    y: GAME_HEIGHT - 54,
    width: 140,
    height: 16,
    speed: 560,
    baseWidth: 140,
    expandedWidth: 210,
  };
}

function makeBall(x, y, angleDeg, baseSpeed) {
  const radians = (angleDeg * Math.PI) / 180;
  const speed = getEffectiveBallSpeed(baseSpeed);
  return {
    x,
    y,
    vx: Math.cos(radians) * speed,
    vy: Math.sin(radians) * speed,
    radius: BALL_RADIUS,
    baseSpeed,
  };
}

function resetBalls() {
  const paddle = state.paddle;
  const speed = levelConfigs[state.level - 1].speed;
  state.balls = [
    makeBall(
      paddle.x + paddle.width / 2,
      paddle.y - 18,
      -65,
      speed
    ),
  ];
}

function setupLevel(level) {
  state.level = level;
  state.levelMessageTimer = 1.2;
  state.effects.expand = 0;
  state.effects.slow = 0;
  state.items = [];
  state.paddle = createPaddle();
  state.blocks = buildBlocks(levelConfigs[level - 1]);
  resetBalls();
  updateHud();
}

function buildBlocks(config) {
  const totalWidth = BLOCK_COLUMNS * BLOCK_WIDTH + (BLOCK_COLUMNS - 1) * BLOCK_GAP;
  const startX = (GAME_WIDTH - totalWidth) / 2;
  const rows = [];

  for (let row = 0; row < config.layout.length; row += 1) {
    for (let col = 0; col < config.layout[row].length; col += 1) {
      const hitPoints = config.layout[row][col];
      if (!hitPoints) {
        continue;
      }
      rows.push({
        x: startX + col * (BLOCK_WIDTH + BLOCK_GAP),
        y: TOP_OFFSET + row * (BLOCK_HEIGHT + BLOCK_GAP),
        width: BLOCK_WIDTH,
        height: BLOCK_HEIGHT,
        hitPoints,
        maxHitPoints: hitPoints,
        itemType: Math.random() < config.itemRate ? pickRandomItem() : null,
      });
    }
  }
  return rows;
}

function pickRandomItem() {
  const roll = Math.random();
  let cursor = 0;
  for (const entry of ITEM_WEIGHTS) {
    cursor += entry.weight;
    if (roll <= cursor) {
      return entry.type;
    }
  }
  return "score";
}

function getEffectiveBallSpeed(baseSpeed) {
  return state.effects.slow > 0 ? baseSpeed * 0.72 : baseSpeed;
}

function setBallSpeed(ball, desiredSpeed) {
  const current = Math.hypot(ball.vx, ball.vy) || 1;
  const scale = desiredSpeed / current;
  ball.vx *= scale;
  ball.vy *= scale;
}

function applySpeedToAllBalls() {
  for (const ball of state.balls) {
    setBallSpeed(ball, getEffectiveBallSpeed(ball.baseSpeed));
  }
}

function startNewGame() {
  state.score = 0;
  state.lives = 3;
  setupLevel(1);
  state.mode = "playing";
}

function advanceLevel() {
  if (state.level >= 3) {
    state.mode = "clear";
    updateHud();
    return;
  }
  setupLevel(state.level + 1);
  state.mode = "level-clear";
  updateHud();
}

function loseLife() {
  state.lives -= 1;
  if (state.lives <= 0) {
    state.mode = "game-over";
    updateHud();
    return;
  }
  state.items = [];
  state.effects.expand = 0;
  state.effects.slow = 0;
  state.paddle = createPaddle();
  resetBalls();
  state.mode = "playing";
  updateHud();
}

function updateHud() {
  levelValue.textContent = state.level;
  lifeValue.textContent = state.lives;
  scoreValue.textContent = state.score.toLocaleString("ja-JP");

  const labels = {
    title: "TITLE",
    playing: "PLAYING",
    paused: "PAUSED",
    "level-clear": `LEVEL ${state.level} CLEAR`,
    "game-over": "GAME OVER",
    clear: "GAME CLEAR",
  };
  statusBadge.textContent = labels[state.mode] || "PLAYING";

  const activeEffects = [];
  if (state.effects.expand > 0) {
    activeEffects.push(`Paddle Expand ${state.effects.expand.toFixed(1)}s`);
  }
  if (state.effects.slow > 0) {
    activeEffects.push(`Ball Slow ${state.effects.slow.toFixed(1)}s`);
  }

  effectList.innerHTML = activeEffects.length
    ? activeEffects
        .map((effect) => `<div class="effect-pill">${effect}</div>`)
        .join("")
    : "";
}

function update(dt) {
  if (state.mode === "playing") {
    updateEffects(dt);
    updatePaddle(dt);
    updateBalls(dt);
    updateItems(dt);
    if (!state.blocks.length) {
      advanceLevel();
    }
  } else if (state.mode === "level-clear") {
    state.levelMessageTimer -= dt;
    if (state.levelMessageTimer <= 0) {
      state.mode = "playing";
    }
  }
  updateHud();
}

function updateEffects(dt) {
  if (state.effects.expand > 0) {
    state.effects.expand = Math.max(0, state.effects.expand - dt);
    state.paddle.width =
      state.effects.expand > 0 ? state.paddle.expandedWidth : state.paddle.baseWidth;
    state.paddle.x = Math.min(
      state.paddle.x,
      GAME_WIDTH - state.paddle.width
    );
  }

  if (state.effects.slow > 0) {
    const wasActive = state.effects.slow > 0;
    state.effects.slow = Math.max(0, state.effects.slow - dt);
    if (wasActive && state.effects.slow === 0) {
      applySpeedToAllBalls();
    }
  }
}

function updatePaddle(dt) {
  const direction = (keys.right ? 1 : 0) - (keys.left ? 1 : 0);
  state.paddle.x += direction * state.paddle.speed * dt;
  state.paddle.x = Math.max(0, Math.min(GAME_WIDTH - state.paddle.width, state.paddle.x));
}

function updateBalls(dt) {
  for (const ball of state.balls) {
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    if (ball.x - ball.radius <= 0) {
      ball.x = ball.radius;
      ball.vx = Math.abs(ball.vx);
    } else if (ball.x + ball.radius >= GAME_WIDTH) {
      ball.x = GAME_WIDTH - ball.radius;
      ball.vx = -Math.abs(ball.vx);
    }

    if (ball.y - ball.radius <= HUD_HEIGHT) {
      ball.y = HUD_HEIGHT + ball.radius;
      ball.vy = Math.abs(ball.vy);
    }

    handlePaddleCollision(ball);
    handleBlockCollision(ball);
  }

  state.balls = state.balls.filter((ball) => ball.y - ball.radius <= GAME_HEIGHT);
  if (!state.balls.length) {
    loseLife();
  }
}

function handlePaddleCollision(ball) {
  const paddle = state.paddle;
  const intersects =
    ball.x + ball.radius >= paddle.x &&
    ball.x - ball.radius <= paddle.x + paddle.width &&
    ball.y + ball.radius >= paddle.y &&
    ball.y - ball.radius <= paddle.y + paddle.height;

  if (!intersects || (ball.vy >= 0 && ball.y - ball.radius > paddle.y + paddle.height / 2)) {
    return;
  }

  ball.y = paddle.y - ball.radius;
  const hitOffset = (ball.x - (paddle.x + paddle.width / 2)) / (paddle.width / 2);
  const currentSpeed = getEffectiveBallSpeed(ball.baseSpeed);
  const bounceAngle = -Math.PI / 2 + hitOffset * (Math.PI / 3);
  ball.vx = Math.cos(bounceAngle) * currentSpeed;
  ball.vy = Math.sin(bounceAngle) * currentSpeed;
}

function handleBlockCollision(ball) {
  for (let index = 0; index < state.blocks.length; index += 1) {
    const block = state.blocks[index];
    if (
      ball.x + ball.radius < block.x ||
      ball.x - ball.radius > block.x + block.width ||
      ball.y + ball.radius < block.y ||
      ball.y - ball.radius > block.y + block.height
    ) {
      continue;
    }

    const overlapLeft = ball.x + ball.radius - block.x;
    const overlapRight = block.x + block.width - (ball.x - ball.radius);
    const overlapTop = ball.y + ball.radius - block.y;
    const overlapBottom = block.y + block.height - (ball.y - ball.radius);
    const minOverlap = Math.min(overlapLeft, overlapRight, overlapTop, overlapBottom);

    if (minOverlap === overlapLeft) {
      ball.x = block.x - ball.radius;
      ball.vx = -Math.abs(ball.vx);
    } else if (minOverlap === overlapRight) {
      ball.x = block.x + block.width + ball.radius;
      ball.vx = Math.abs(ball.vx);
    } else if (minOverlap === overlapTop) {
      ball.y = block.y - ball.radius;
      ball.vy = -Math.abs(ball.vy);
    } else {
      ball.y = block.y + block.height + ball.radius;
      ball.vy = Math.abs(ball.vy);
    }

    block.hitPoints -= 1;
    if (block.hitPoints <= 0) {
      state.score += block.maxHitPoints > 1 ? SCORE_VALUES.durable : SCORE_VALUES.normal;
      if (block.itemType) {
        spawnItem(block);
      }
      state.blocks.splice(index, 1);
    }
    break;
  }
}

function spawnItem(block) {
  state.items.push({
    x: block.x + block.width / 2,
    y: block.y + block.height / 2,
    width: 24,
    height: 24,
    speed: 170,
    type: block.itemType,
  });
}

function updateItems(dt) {
  for (const item of state.items) {
    item.y += item.speed * dt;
  }

  const paddle = state.paddle;
  const remaining = [];
  for (const item of state.items) {
    const caught =
      item.x + item.width / 2 >= paddle.x &&
      item.x - item.width / 2 <= paddle.x + paddle.width &&
      item.y + item.height / 2 >= paddle.y &&
      item.y - item.height / 2 <= paddle.y + paddle.height;

    if (caught) {
      applyItem(item.type);
      continue;
    }

    if (item.y - item.height / 2 <= GAME_HEIGHT) {
      remaining.push(item);
    }
  }
  state.items = remaining;
}

function applyItem(type) {
  if (type === "multiball") {
    const sourceBall = state.balls[0];
    if (!sourceBall) {
      return;
    }

    const totalAfterPickup = Math.min(MAX_BALLS, Math.max(3, state.balls.length + 2));
    const additionsNeeded = totalAfterPickup - state.balls.length;
    const sourceAngle = Math.atan2(sourceBall.vy, sourceBall.vx);
    const spreadOffsets = [-0.45, 0.45, -0.8, 0.8];

    const additions = [];
    for (let index = 0; index < additionsNeeded; index += 1) {
      const nextAngle = sourceAngle + spreadOffsets[index % spreadOffsets.length];
      additions.push(
        makeBall(
          sourceBall.x,
          sourceBall.y,
          (nextAngle * 180) / Math.PI,
          sourceBall.baseSpeed
        )
      );
    }
    state.balls.push(...additions);
  } else if (type === "expand") {
    state.effects.expand += 10;
    state.paddle.width = state.paddle.expandedWidth;
    state.paddle.x = Math.min(state.paddle.x, GAME_WIDTH - state.paddle.width);
  } else if (type === "slow") {
    const wasInactive = state.effects.slow <= 0;
    state.effects.slow += 8;
    if (wasInactive) {
      applySpeedToAllBalls();
    }
  } else if (type === "score") {
    state.score += 500;
  }
}

function draw() {
  ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT);
  drawBackground();
  drawBlocks();
  drawPaddle();
  drawBalls();
  drawItems();
  drawOverlay();
}

function drawBackground() {
  const gradient = ctx.createLinearGradient(0, 0, 0, GAME_HEIGHT);
  gradient.addColorStop(0, "#102443");
  gradient.addColorStop(1, "#050b17");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT);

  ctx.fillStyle = "rgba(110, 231, 249, 0.08)";
  for (let i = 0; i < 40; i += 1) {
    ctx.fillRect(i * 24, 0, 1, GAME_HEIGHT);
  }
}

function drawBlocks() {
  for (const block of state.blocks) {
    const durable = block.maxHitPoints > 1;
    const color = durable
      ? block.hitPoints === 2
        ? "#f59e0b"
        : "#fcd34d"
      : "#38bdf8";
    ctx.fillStyle = color;
    ctx.fillRect(block.x, block.y, block.width, block.height);
    ctx.strokeStyle = "rgba(255,255,255,0.25)";
    ctx.strokeRect(block.x, block.y, block.width, block.height);
  }
}

function drawPaddle() {
  const paddle = state.paddle;
  if (!paddle) {
    return;
  }
  const gradient = ctx.createLinearGradient(paddle.x, paddle.y, paddle.x + paddle.width, paddle.y);
  gradient.addColorStop(0, "#6ee7f9");
  gradient.addColorStop(1, "#2563eb");
  ctx.fillStyle = gradient;
  ctx.fillRect(paddle.x, paddle.y, paddle.width, paddle.height);
}

function drawBalls() {
  for (const ball of state.balls) {
    ctx.beginPath();
    ctx.fillStyle = "#f8fafc";
    ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
    ctx.fill();
  }
}

function drawItems() {
  const colors = {
    multiball: "#f472b6",
    expand: "#34d399",
    slow: "#a78bfa",
    score: "#f59e0b",
  };
  const labels = {
    multiball: "M",
    expand: "W",
    slow: "S",
    score: "+",
  };

  for (const item of state.items) {
    ctx.fillStyle = colors[item.type];
    ctx.fillRect(item.x - item.width / 2, item.y - item.height / 2, item.width, item.height);
    ctx.fillStyle = "#08111f";
    ctx.font = "bold 16px Segoe UI";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(labels[item.type], item.x, item.y + 1);
  }
}

function drawOverlay() {
  ctx.fillStyle = "rgba(255,255,255,0.08)";
  ctx.fillRect(0, 0, GAME_WIDTH, HUD_HEIGHT);

  if (state.mode === "title") {
    drawMessagePanel(
      "BLOCK BREAKER",
      [
        "Space でスタート",
        "← → または A / D でパドル移動",
        "P で一時停止、R でリスタート",
      ]
    );
  } else if (state.mode === "paused") {
    drawMessagePanel("PAUSED", ["Space で再開"]);
  } else if (state.mode === "game-over") {
    drawMessagePanel("GAME OVER", [`Final Score ${state.score}`, "R で再スタート"]);
  } else if (state.mode === "clear") {
    drawMessagePanel("GAME CLEAR", [`Final Score ${state.score}`, "R で再スタート"]);
  } else if (state.mode === "level-clear") {
    drawMessagePanel(`LEVEL ${state.level} START`, ["次のレベルへ進みます"]);
  }
}

function drawMessagePanel(title, lines) {
  const width = 430;
  const height = 190;
  const x = (GAME_WIDTH - width) / 2;
  const y = (GAME_HEIGHT - height) / 2;

  ctx.fillStyle = "rgba(4, 8, 20, 0.82)";
  ctx.fillRect(x, y, width, height);
  ctx.strokeStyle = "rgba(110, 231, 249, 0.32)";
  ctx.strokeRect(x, y, width, height);

  ctx.fillStyle = "#ebf4ff";
  ctx.font = "700 34px Segoe UI";
  ctx.textAlign = "center";
  ctx.fillText(title, GAME_WIDTH / 2, y + 56);

  ctx.font = "18px Segoe UI";
  lines.forEach((line, index) => {
    ctx.fillText(line, GAME_WIDTH / 2, y + 104 + index * 30);
  });
}

function loop(timestamp) {
  if (!loop.lastTime) {
    loop.lastTime = timestamp;
  }
  const dt = Math.min((timestamp - loop.lastTime) / 1000, 0.02);
  loop.lastTime = timestamp;

  update(dt);
  draw();
  requestAnimationFrame(loop);
}

function restartToTitle() {
  state.mode = "title";
  state.score = 0;
  state.lives = 3;
  state.level = 1;
  state.effects.expand = 0;
  state.effects.slow = 0;
  state.items = [];
  state.paddle = createPaddle();
  state.blocks = buildBlocks(levelConfigs[0]);
  resetBalls();
  updateHud();
}

window.addEventListener("keydown", (event) => {
  if (event.code === "ArrowLeft" || event.code === "KeyA") {
    keys.left = true;
    event.preventDefault();
  }
  if (event.code === "ArrowRight" || event.code === "KeyD") {
    keys.right = true;
    event.preventDefault();
  }
  if (event.code === "Space") {
    if (state.mode === "title") {
      startNewGame();
    } else if (state.mode === "paused") {
      state.mode = "playing";
    }
    event.preventDefault();
  }
  if (event.code === "KeyP" && state.mode === "playing") {
    state.mode = "paused";
  } else if (event.code === "KeyP" && state.mode === "paused") {
    state.mode = "playing";
  }
  if (event.code === "KeyR") {
    restartToTitle();
  }
});

window.addEventListener("keyup", (event) => {
  if (event.code === "ArrowLeft" || event.code === "KeyA") {
    keys.left = false;
  }
  if (event.code === "ArrowRight" || event.code === "KeyD") {
    keys.right = false;
  }
});

restartToTitle();
requestAnimationFrame(loop);
