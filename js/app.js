/* ============================================================
   NEON ARCADE — app.js
   2026 Production Build
   ============================================================ */

"use strict";

/* ============================================================
   STATE
   ============================================================ */

const STATE = {
  theme: "neon",
  accentOverride: null,
  panelOpen: false,
  scanlines: true,
  particles: true,
  sounds: false,
  totalPlays: 0,
  bestScores: {
    snake: 0,
    tetris: 0,
    breakout: 0,
    pong: 0,
    flappy: 0,
    asteroids: 0,
    fruit: 0,
  },
  currentGame: null,
  currentDifficulty: "normal",
  pongRoomCode: null,
  pongPlayer: null,
  pongOnline: false,
  pongRoomUnsubscribe: null,
  coins: Number(localStorage.getItem("arcade-coins") || 0),
  upgrades: JSON.parse(localStorage.getItem("arcade-upgrades") || "{}"),
  gameRunning: false,
  gameLoop: null,
  rafId: null,
};

/* ============================================================
   GAME DEFINITIONS
   ============================================================ */

const GAMES = [
  {
    id: "snake",
    title: "SNAKE",
    desc: "Eat, grow, dominate. Classic reflexes re-imagined.",
    category: "arcade",
    icon: "🐍",
    color: "#00FF88",
    glow: "rgba(0,255,136,0.45)",
    bg: "#071A0F",
    badge: "Classic",
    difficulty: 2,
    controls: "↑ ↓ ← → or WASD — steer your snake",
  },
  {
    id: "tetris",
    title: "TETRIS",
    desc: "Stack blocks, clear lines. Stack the odds in your favour.",
    category: "puzzle",
    icon: "🟪",
    color: "#A855F7",
    glow: "rgba(168,85,247,0.45)",
    bg: "#0D0718",
    badge: "Puzzle",
    difficulty: 3,
    controls: "← → move · ↑ rotate · ↓ soft drop · Space = hard drop",
  },
  {
    id: "breakout",
    title: "BREAKOUT",
    desc: "Smash every brick. Don't let the ball hit the floor.",
    category: "arcade",
    icon: "🧱",
    color: "#FF8C00",
    glow: "rgba(255,140,0,0.4)",
    bg: "#1A0D00",
    badge: "Arcade",
    difficulty: 2,
    controls: "← → or A/D — move the paddle",
  },
  {
    id: "pong",
    title: "PONG",
    desc: "1 vs AI. First to 7 points wins. The AI learns.",
    category: "arcade",
    icon: "🏓",
    color: "#00F5FF",
    glow: "rgba(0,245,255,0.4)",
    bg: "#000D0F",
    badge: "VS AI",
    difficulty: 2,
    controls: "W / S or ↑ / ↓ — move your paddle",
  },
  {
    id: "flappy",
    title: "FLAPPY",
    desc: "One tap. Infinite pipes. How far can you go?",
    category: "arcade",
    icon: "🐦",
    color: "#FFD000",
    glow: "rgba(255,208,0,0.4)",
    bg: "#0D0D00",
    badge: "Tap",
    difficulty: 3,
    controls: "Space or Click — flap",
  },
  {
    id: "asteroids",
    title: "ASTEROIDS",
    desc: "Navigate the debris field. Shoot everything that moves.",
    category: "shooter",
    icon: "🚀",
    color: "#FF006E",
    glow: "rgba(255,0,110,0.45)",
    bg: "#0A0008",
    badge: "Shooter",
    difficulty: 3,
    controls: "← → rotate · ↑ thrust · Space shoot",
  },
  {
    id: "fruit",
    title: "FRUIT SLASH",
    desc: "Slice falling fruit. Avoid bombs. Fast reflexes only.",
    category: "arcade",
    icon: "🍉",
    color: "#22C55E",
    glow: "rgba(34,197,94,0.45)",
    bg: "#07140A",
    badge: "Slash",
    difficulty: 2,
    controls: "Move mouse or finger across fruit — avoid bombs",
  },
];

/* ============================================================
   THEME SYSTEM
   ============================================================ */

const THEMES = [
  { id: "neon", label: "Neon", colors: ["#07070F", "#7C3AED", "#00F5FF"] },
  {
    id: "synthwave",
    label: "Synth",
    colors: ["#0D0520", "#FF00E6", "#FFD000"],
  },
  { id: "matrix", label: "Matrix", colors: ["#000800", "#00FF41", "#004400"] },
  { id: "light", label: "Light", colors: ["#F5F5FA", "#7C3AED", "#0284C7"] },
  {
    id: "minimal",
    label: "Minimal",
    colors: ["#0A0A0A", "#FFFFFF", "#888888"],
  },
];

const ACCENT_COLORS = [
  "#00F5FF",
  "#7C3AED",
  "#FF006E",
  "#00FF88",
  "#FF8C00",
  "#FFD000",
  "#FF00E6",
  "#39FF14",
];

const DIFFICULTIES = {
  easy: {
    label: "Easy",
    speed: 0.82,
    enemy: 0.7,
    lives: 4,
    gap: 175,
    ai: 0.72,
    asteroids: 3,
    score: 0.8,
  },
  normal: {
    label: "Normal",
    speed: 1.0,
    enemy: 1.0,
    lives: 3,
    gap: 145,
    ai: 1.0,
    asteroids: 4,
    score: 1.0,
  },
  hard: {
    label: "Hard",
    speed: 1.24,
    enemy: 1.35,
    lives: 2,
    gap: 118,
    ai: 1.28,
    asteroids: 6,
    score: 1.35,
  },
};

function getDifficulty() {
  return DIFFICULTIES[STATE.currentDifficulty] || DIFFICULTIES.normal;
}

const SHOP_CATALOG = {
  snake: [
    {
      id: "slow_enemy",
      name: "Slow Enemy",
      price: 35,
      desc: "Enemy chases 30% slower.",
    },
    {
      id: "double_points",
      name: "Double Points",
      price: 55,
      desc: "Food gives double score.",
    },
    { id: "shield", name: "Shield", price: 75, desc: "Survive one crash." },
  ],
  breakout: [
    {
      id: "wide_paddle",
      name: "Wide Paddle",
      price: 35,
      desc: "Paddle is wider.",
    },
    {
      id: "slow_ball",
      name: "Slow Ball",
      price: 45,
      desc: "Ball moves slower.",
    },
    {
      id: "extra_life",
      name: "Extra Life",
      price: 65,
      desc: "Start with one extra life.",
    },
  ],
  pong: [
    {
      id: "fast_paddle",
      name: "Fast Paddle",
      price: 35,
      desc: "Your paddle moves faster.",
    },
    {
      id: "ai_slowdown",
      name: "AI Slowdown",
      price: 50,
      desc: "Enemy AI reacts slower.",
    },
    {
      id: "power_shot",
      name: "Power Shot",
      price: 60,
      desc: "Ball gets stronger after your hit.",
    },
  ],
  flappy: [
    {
      id: "slow_pipes",
      name: "Slow Pipes",
      price: 40,
      desc: "Pipes move slower.",
    },
    {
      id: "extra_jump",
      name: "Extra Jump",
      price: 50,
      desc: "Jump feels stronger.",
    },
    { id: "shield", name: "Shield", price: 70, desc: "Survive one hit." },
  ],
  asteroids: [
    { id: "rapid_fire", name: "Rapid Fire", price: 45, desc: "Shoot faster." },
    { id: "shield", name: "Shield", price: 70, desc: "Survive one crash." },
    {
      id: "double_score",
      name: "Double Score",
      price: 80,
      desc: "Asteroids give double points.",
    },
  ],
  tetris: [
    {
      id: "slow_fall",
      name: "Slow Fall",
      price: 45,
      desc: "Pieces fall slower.",
    },
    {
      id: "bonus_lines",
      name: "Bonus Lines",
      price: 70,
      desc: "Line clears give more score.",
    },
    {
      id: "soft_start",
      name: "Soft Start",
      price: 60,
      desc: "Level 1 starts calmer.",
    },
  ],
  fruit: [
    {
      id: "slow_fruit",
      name: "Slow Fruit",
      price: 35,
      desc: "Fruit moves slower.",
    },
    {
      id: "extra_life",
      name: "Extra Life",
      price: 45,
      desc: "Start with one extra life.",
    },
    {
      id: "less_bombs",
      name: "Less Bombs",
      price: 60,
      desc: "Bombs spawn less often.",
    },
  ],
};

function saveShop() {
  localStorage.setItem("arcade-coins", String(STATE.coins));
  localStorage.setItem("arcade-upgrades", JSON.stringify(STATE.upgrades));
}

function hasUpgrade(gameId, upgradeId) {
  return Boolean(STATE.upgrades?.[gameId]?.[upgradeId]);
}

function buyUpgrade(gameId, upgradeId) {
  const item = SHOP_CATALOG[gameId]?.find((i) => i.id === upgradeId);
  if (!item || hasUpgrade(gameId, upgradeId) || STATE.coins < item.price)
    return;
  STATE.coins -= item.price;
  STATE.upgrades[gameId] ||= {};
  STATE.upgrades[gameId][upgradeId] = true;
  saveShop();
  renderShop(gameId);
}

function awardCoins(score) {
  const earned = Math.max(3, Math.floor(score / 20) + 3);
  STATE.coins += earned;
  saveShop();
  return earned;
}

function renderShop(gameId = STATE.currentGame) {
  const coinEl = document.getElementById("coin-count");
  const shopItems = document.getElementById("shop-items");
  if (!coinEl || !shopItems || !gameId) return;

  coinEl.textContent = STATE.coins;
  const items = SHOP_CATALOG[gameId] || [];

  if (!items.length) {
    shopItems.innerHTML = `<div class="shop-empty">No upgrades for this game yet.</div>`;
    return;
  }

  shopItems.innerHTML = items
    .map((item) => {
      const owned = hasUpgrade(gameId, item.id);
      const locked = STATE.coins < item.price && !owned;
      return `
      <div class="shop-item ${owned ? "owned" : ""}">
        <div>
          <strong>${item.name}</strong>
          <span>${item.desc}</span>
        </div>
        <button type="button" data-upgrade="${item.id}" ${owned || locked ? "disabled" : ""}>
          ${owned ? "Owned" : item.price + " coins"}
        </button>
      </div>
    `;
    })
    .join("");
}

function setupShop() {
  const shopItems = document.getElementById("shop-items");
  if (!shopItems) return;
  shopItems.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-upgrade]");
    if (!btn) return;
    buyUpgrade(STATE.currentGame, btn.dataset.upgrade);
  });
  renderShop();
}

function buildDifficultyPicker() {
  const ss = document.getElementById("start-screen");
  if (!ss || ss.querySelector(".difficulty-picker")) return;

  const picker = document.createElement("div");
  picker.className = "difficulty-picker";
  picker.setAttribute("aria-label", "Choose difficulty");
  picker.innerHTML = `
    <button type="button" class="difficulty-btn" data-difficulty="easy">Easy</button>
    <button type="button" class="difficulty-btn active" data-difficulty="normal">Normal</button>
    <button type="button" class="difficulty-btn" data-difficulty="hard">Hard</button>
  `;

  picker.addEventListener("click", (e) => {
    const btn = e.target.closest(".difficulty-btn");
    if (!btn) return;
    e.stopPropagation();
    STATE.currentDifficulty = btn.dataset.difficulty;
    picker
      .querySelectorAll(".difficulty-btn")
      .forEach((b) => b.classList.toggle("active", b === btn));
    const game = GAMES.find((g) => g.id === STATE.currentGame);
    if (game) drawIdleCanvas(game);
  });

  const press = document.getElementById("start-press");
  ss.insertBefore(picker, press);
}

function syncDifficultyPicker() {
  const active = STATE.currentDifficulty || "normal";
  document.querySelectorAll(".difficulty-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.difficulty === active);
  });
}

function applyTheme(id) {
  STATE.theme = id;
  document.documentElement.setAttribute("data-theme", id);
  // update active swatch
  document.querySelectorAll(".swatch").forEach((s) => {
    s.classList.toggle("active", s.dataset.theme === id);
  });
  localStorage.setItem("arcade-theme", id);
}

function applyAccentOverride(hex) {
  STATE.accentOverride = hex;
  document.documentElement.style.setProperty("--accent-1", hex);
  document.documentElement.style.setProperty("--glow-1", hex + "66");
  document.querySelectorAll(".accent-dot").forEach((d) => {
    d.classList.toggle("active", d.dataset.color === hex);
  });
  localStorage.setItem("arcade-accent", hex);
}

function clearAccentOverride() {
  STATE.accentOverride = null;
  document.documentElement.style.removeProperty("--accent-1");
  document.documentElement.style.removeProperty("--glow-1");
  document
    .querySelectorAll(".accent-dot")
    .forEach((d) => d.classList.remove("active"));
  localStorage.removeItem("arcade-accent");
}

/* ============================================================
   BUILD THEME PANEL
   ============================================================ */

function buildThemePanel() {
  const panel = document.getElementById("theme-panel");

  // swatches
  const swatchGrid = panel.querySelector(".theme-swatches");
  THEMES.forEach((t) => {
    const wrap = document.createElement("div");
    const swatch = document.createElement("div");
    swatch.className = "swatch" + (t.id === STATE.theme ? " active" : "");
    swatch.dataset.theme = t.id;
    swatch.style.background = `linear-gradient(135deg, ${t.colors[0]} 0%, ${t.colors[1]} 50%, ${t.colors[2]} 100%)`;
    swatch.title = t.label;
    swatch.addEventListener("click", () => applyTheme(t.id));
    const label = document.createElement("div");
    label.className = "swatch-label";
    label.textContent = t.label;
    wrap.appendChild(swatch);
    wrap.appendChild(label);
    swatchGrid.appendChild(wrap);
  });

  // accent dots
  const accentGrid = panel.querySelector(".accent-grid");
  ACCENT_COLORS.forEach((hex) => {
    const dot = document.createElement("div");
    dot.className = "accent-dot";
    dot.dataset.color = hex;
    dot.style.background = hex;
    dot.style.boxShadow = `0 0 10px ${hex}88`;
    dot.title = hex;
    dot.addEventListener("click", () => applyAccentOverride(hex));
    accentGrid.appendChild(dot);
  });

  // restore from localStorage
  const savedTheme = localStorage.getItem("arcade-theme");
  if (savedTheme) applyTheme(savedTheme);
  const savedAccent = localStorage.getItem("arcade-accent");
  if (savedAccent) applyAccentOverride(savedAccent);
}

/* ============================================================
   BUILD GAME GRID
   ============================================================ */

function buildGrid(filter = "all") {
  const grid = document.getElementById("game-grid");
  grid.innerHTML = "";

  const visible = GAMES.filter(
    (g) => filter === "all" || g.category === filter,
  );
  document.getElementById("filter-count").textContent =
    `${visible.length} game${visible.length !== 1 ? "s" : ""}`;

  visible.forEach((game) => {
    const card = document.createElement("article");
    card.className = "game-card";
    card.style.setProperty("--card-accent", game.color);
    card.style.setProperty("--card-accent-glow", game.glow);
    card.style.setProperty("--card-accent-border", game.color + "66");

    const dots = [1, 2, 3]
      .map(
        (i) =>
          `<div class="diff-dot${i <= game.difficulty ? " filled" : ""}"></div>`,
      )
      .join("");

    card.innerHTML = `
      <div class="card-preview" style="background:${game.bg}">
        <canvas class="preview-canvas" data-id="${game.id}"></canvas>
        <div class="card-icon">${game.icon}</div>
        <div class="card-badge" style="color:${game.color};border-color:${game.color}44;background:${game.color}11">${game.badge}</div>
      </div>
      <div class="card-body">
        <div class="card-title">${game.title}</div>
        <div class="card-desc">${game.desc}</div>
        <div class="card-footer">
          <div class="card-difficulty">
            ${dots}
            <span class="diff-label">${["", "", "Easy", "Medium", "Hard"][game.difficulty]}</span>
          </div>
          <button class="play-btn" aria-label="Play ${game.title}">▶ PLAY</button>
        </div>
      </div>
    `;

    card.querySelector(".play-btn").addEventListener("click", (e) => {
      e.stopPropagation();
      openGame(game.id);
    });
    card.addEventListener("click", () => openGame(game.id));
    grid.appendChild(card);
  });

  // Start idle animations on preview canvases
  requestAnimationFrame(() => startPreviewAnimations());
}

/* ============================================================
   PREVIEW CANVAS IDLE ANIMATIONS
   ============================================================ */

const previewAnimations = new Map();

function startPreviewAnimations() {
  document.querySelectorAll(".preview-canvas").forEach((canvas) => {
    const id = canvas.dataset.id;
    const game = GAMES.find((g) => g.id === id);
    if (!game) return;

    const rect = canvas.parentElement.getBoundingClientRect();
    canvas.width = rect.width || 280;
    canvas.height = 160;
    const ctx = canvas.getContext("2d");

    let frame = 0;
    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = game.color;

      if (id === "snake") {
        // animated snake preview
        const t = frame * 0.05;
        for (let i = 0; i < 8; i++) {
          const x = canvas.width / 2 + Math.sin(t + i * 0.7) * 60;
          const y = canvas.height / 2 + Math.cos(t * 0.7 + i * 0.5) * 30;
          ctx.globalAlpha = 1 - i / 8;
          ctx.fillRect(x, y, 8, 8);
        }
      } else if (id === "tetris") {
        // falling blocks preview
        const blocks = [
          [0, 0],
          [1, 0],
          [0, 1],
          [1, 1],
        ];
        ctx.globalAlpha = 0.6;
        blocks.forEach(([bx, by]) => {
          const x = canvas.width / 2 - 20 + bx * 20;
          const y =
            (canvas.height / 2 - 20 + by * 20 + frame * 0.4) % canvas.height;
          ctx.fillRect(x, y, 18, 18);
        });
      } else if (id === "breakout") {
        // bouncing ball
        const bx =
          canvas.width / 2 + Math.sin(frame * 0.04) * canvas.width * 0.3;
        const by =
          canvas.height / 2 + Math.sin(frame * 0.06) * canvas.height * 0.3;
        ctx.globalAlpha = 0.8;
        ctx.beginPath();
        ctx.arc(bx, by, 6, 0, Math.PI * 2);
        ctx.fill();
      } else if (id === "pong") {
        // two paddles + ball
        ctx.globalAlpha = 0.5;
        ctx.fillRect(
          10,
          canvas.height / 2 + Math.sin(frame * 0.05) * 20,
          8,
          40,
        );
        ctx.fillRect(
          canvas.width - 18,
          canvas.height / 2 + Math.cos(frame * 0.05) * 20,
          8,
          40,
        );
        ctx.beginPath();
        ctx.arc(
          canvas.width / 2 + Math.sin(frame * 0.07) * 50,
          canvas.height / 2 + Math.cos(frame * 0.09) * 30,
          5,
          0,
          Math.PI * 2,
        );
        ctx.fill();
      } else if (id === "flappy") {
        // bird
        ctx.globalAlpha = 0.7;
        const by = canvas.height / 2 + Math.sin(frame * 0.06) * 30;
        ctx.beginPath();
        ctx.arc(canvas.width / 2, by, 10, 0, Math.PI * 2);
        ctx.fill();
      } else if (id === "asteroids") {
        // spinning asteroid shape
        ctx.globalAlpha = 0.6;
        ctx.save();
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate(frame * 0.02);
        ctx.beginPath();
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          const r = 25 + Math.sin(i * 1.3) * 8;
          i === 0
            ? ctx.moveTo(Math.cos(a) * r, Math.sin(a) * r)
            : ctx.lineTo(Math.cos(a) * r, Math.sin(a) * r);
        }
        ctx.closePath();
        ctx.strokeStyle = game.color;
        ctx.lineWidth = 2;
        ctx.stroke();
        ctx.restore();
      }

      ctx.globalAlpha = 1;
      frame++;
      previewAnimations.set(id, requestAnimationFrame(draw));
    }

    if (previewAnimations.has(id))
      cancelAnimationFrame(previewAnimations.get(id));
    draw();
  });
}

/* ============================================================
   OPEN / CLOSE GAME MODAL
   ============================================================ */

function openGame(id) {
  const game = GAMES.find((g) => g.id === id);
  if (!game) return;

  STATE.currentGame = id;

  const pongUI = document.getElementById("pong-multiplayer");
  if (pongUI) {
    pongUI.style.display = id === "pong" ? "block" : "none";
  }

  STATE.gameRunning = false;
  STATE.totalPlays++;
  document.getElementById("total-plays").textContent = STATE.totalPlays;

  const modal = document.getElementById("modal-overlay");
  const canvas = document.getElementById("game-canvas");

  document.getElementById("modal-game-title").textContent = game.title;
  document.getElementById("modal-game-title").style.color = game.color;
  document.getElementById("modal-controls").textContent = "🎮 " + game.controls;

  canvas.style.border = `2px solid ${game.color}`;
  canvas.style.boxShadow = `0 0 40px ${game.glow}, 0 0 80px ${game.glow}40`;

  // Reset HUD
  setHUD(0, 0, 1);
  renderShop(id);
  hideGameOverLeaderboard();

  // Setup start screen
  buildDifficultyPicker();
  syncDifficultyPicker();
  showStartScreen(game.title, "Click or press any key to start");

  // Configure canvas size
  if (id === "tetris") {
    canvas.width = 420;
    canvas.height = 560;
  } else {
    canvas.width = 640;
    canvas.height = 640;
  }

  // Draw idle frame
  drawIdleCanvas(game);

  modal.classList.add("open");
  document.body.style.overflow = "hidden";

  // keyboard to start
  const startListener = (e) => {
    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)
    )
      e.preventDefault();
    if (document.getElementById("start-screen").classList.contains("hidden"))
      return;
    hideStartScreen();
    startGame();
    document.removeEventListener("keydown", startListener);
  };
  document.addEventListener("keydown", startListener);
  document.getElementById("start-screen").onclick = (e) => {
    if (e.target.closest(".difficulty-picker")) return;
    hideStartScreen();
    startGame();
    document.removeEventListener("keydown", startListener);
  };
}

function closeGame() {
  stopGame();
  document.getElementById("modal-overlay").classList.remove("open");
  document.body.style.overflow = "";
  STATE.currentGame = null;
}

function showStartScreen(title, sub) {
  const ss = document.getElementById("start-screen");
  document.getElementById("start-title").textContent = title;
  document.getElementById("start-sub").textContent = sub;
  ss.classList.remove("hidden");
}

function hideStartScreen() {
  document.getElementById("start-screen").classList.add("hidden");
}

function stopGame() {
  if (STATE.gameLoop) {
    clearInterval(STATE.gameLoop);
    STATE.gameLoop = null;
  }
  if (STATE.rafId) {
    cancelAnimationFrame(STATE.rafId);
    STATE.rafId = null;
  }
  STATE.gameRunning = false;
  // clean up game-specific key listeners
  GAME_KEY_CLEANUP.forEach((fn) => fn());
  GAME_KEY_CLEANUP.length = 0;
}

const GAME_KEY_CLEANUP = [];

function addKey(fn) {
  document.addEventListener("keydown", fn);
  document.addEventListener("keyup", fn);
  GAME_KEY_CLEANUP.push(() => {
    document.removeEventListener("keydown", fn);
    document.removeEventListener("keyup", fn);
  });
}

function drawIdleCanvas(game) {
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = game.bg || "#07070F";
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  // subtle grid
  ctx.strokeStyle = game.color + "18";
  ctx.lineWidth = 0.5;
  for (let x = 0; x < canvas.width; x += 20) {
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, canvas.height);
    ctx.stroke();
  }
  for (let y = 0; y < canvas.height; y += 20) {
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
}

function setHUD(score, best, level) {
  document.getElementById("hud-score").textContent = score;
  document.getElementById("hud-best").textContent = best;
  document.getElementById("hud-level").textContent = level;
}

function onGameOver(score, level = 1) {
  stopGame();

  if (score > STATE.bestScores[STATE.currentGame]) {
    STATE.bestScores[STATE.currentGame] = score;
    updateScoreboard();
  }

  const earned = awardCoins(score);

  setHUD(score, STATE.bestScores[STATE.currentGame], level);

  showStartScreen(
    "GAME OVER",
    `Score: ${score} · Level: ${level} · +${earned} coins`,
  );

  renderShop();
  updateBestStat();

  const gameId = STATE.currentGame;

  const refreshLeaderboards = () => {
    if (!gameId) return;

    showGameOverLeaderboard(gameId);

    if (typeof loadLeaderboard === "function") {
      loadLeaderboard(gameId);

      document.querySelectorAll(".leaderboard-tab").forEach((btn) => {
        btn.classList.toggle("active", btn.dataset.game === gameId);
      });
    }
  };

  if (window.saveLeaderboardScore && gameId) {
    window
      .saveLeaderboardScore(gameId, score)
      .then(refreshLeaderboards)
      .catch((error) => {
        console.error("Leaderboard save failed:", error);
        refreshLeaderboards();
      });
  } else {
    refreshLeaderboards();
  }
}

function updateBestStat() {
  const best = Math.max(...Object.values(STATE.bestScores));
  document.getElementById("best-score-stat").textContent =
    best > 0 ? best : "—";
}

function updateScoreboard() {
  GAMES.forEach((g) => {
    const el = document.getElementById(`best-${g.id}`);
    if (el) el.textContent = STATE.bestScores[g.id] || 0;
  });
  updateBestStat();
}

/* ============================================================
   GAME DISPATCHER
   ============================================================ */

function startGame() {
  stopGame();
  STATE.gameRunning = true;
  const id = STATE.currentGame;
  if (id === "snake") startSnake();
  else if (id === "tetris") startTetris();
  else if (id === "breakout") startBreakout();
  else if (id === "pong") {
    if (STATE.pongOnline && STATE.pongRoomCode && STATE.pongPlayer) {
      startOnlinePong();
    } else {
      startPong();
    }
  }
  else if (id === "flappy") startFlappy();
  else if (id === "asteroids") startAsteroids();
  else if (id === "fruit") startFruitSlash();
}

/* ============================================================
   GAME: SNAKE
   ============================================================ */

function startSnake() {
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  const diff = getDifficulty();
  const slowEnemy = hasUpgrade("snake", "slow_enemy");
  const doublePoints = hasUpgrade("snake", "double_points");
  let shield = hasUpgrade("snake", "shield");
  const SZ = 20;
  const COLS = Math.floor(canvas.width / SZ);
  const ROWS = Math.floor(canvas.height / SZ);

  let snake = [
    { x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) },
    { x: Math.floor(COLS / 2) - 1, y: Math.floor(ROWS / 2) },
    { x: Math.floor(COLS / 2) - 2, y: Math.floor(ROWS / 2) },
  ];
  let dir = { x: 1, y: 0 },
    nextDir = { x: 1, y: 0 };
  let enemy = { x: Math.floor(COLS * 0.15), y: Math.floor(ROWS * 0.15) };
  let enemyTrail = [];
  let score = 0,
    level = 1;
  let stepMs = 132 / diff.speed;
  let acc = 0,
    enemyAcc = 0,
    lastTime = 0;
  let food = spawnFood();

  function isBlocked(p) {
    return (
      snake.some((s) => s.x === p.x && s.y === p.y) ||
      (enemy.x === p.x && enemy.y === p.y)
    );
  }

  function spawnFood() {
    let p;
    do {
      p = {
        x: Math.floor(Math.random() * COLS),
        y: Math.floor(Math.random() * ROWS),
      };
    } while (isBlocked(p));
    return p;
  }

  function onKey(e) {
    const map = {
      ArrowUp: { x: 0, y: -1 },
      ArrowDown: { x: 0, y: 1 },
      ArrowLeft: { x: -1, y: 0 },
      ArrowRight: { x: 1, y: 0 },
      w: { x: 0, y: -1 },
      s: { x: 0, y: 1 },
      a: { x: -1, y: 0 },
      d: { x: 1, y: 0 },
      W: { x: 0, y: -1 },
      S: { x: 0, y: 1 },
      A: { x: -1, y: 0 },
      D: { x: 1, y: 0 },
    };
    const nd = map[e.key];
    if (nd && !(nd.x === -dir.x && nd.y === -dir.y)) nextDir = nd;
    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)
    )
      e.preventDefault();
  }
  document.addEventListener("keydown", onKey);
  GAME_KEY_CLEANUP.push(() => document.removeEventListener("keydown", onKey));

  function moveEnemy() {
    const head = snake[0];
    const choices = [
      { x: enemy.x + 1, y: enemy.y },
      { x: enemy.x - 1, y: enemy.y },
      { x: enemy.x, y: enemy.y + 1 },
      { x: enemy.x, y: enemy.y - 1 },
    ].filter((p) => p.x >= 0 && p.x < COLS && p.y >= 0 && p.y < ROWS);

    choices.sort((a, b) => {
      const da = Math.abs(a.x - head.x) + Math.abs(a.y - head.y);
      const db = Math.abs(b.x - head.x) + Math.abs(b.y - head.y);
      return da - db;
    });

    enemyTrail.unshift({ ...enemy });
    enemyTrail = enemyTrail.slice(0, 6);
    enemy = choices[0] || enemy;
  }

  function drawGrid() {
    ctx.strokeStyle = "#0D2B0D";
    ctx.lineWidth = 0.4;
    for (let x = 0; x <= COLS; x++) {
      ctx.beginPath();
      ctx.moveTo(x * SZ, 0);
      ctx.lineTo(x * SZ, ROWS * SZ);
      ctx.stroke();
    }
    for (let y = 0; y <= ROWS; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * SZ);
      ctx.lineTo(COLS * SZ, y * SZ);
      ctx.stroke();
    }
  }

  function drawBlock(p, color, glow, alpha = 1, radius = 4) {
    ctx.globalAlpha = alpha;
    ctx.shadowColor = glow || color;
    ctx.shadowBlur = glow ? 14 : 0;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.roundRect(p.x * SZ + 1, p.y * SZ + 1, SZ - 2, SZ - 2, radius);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.globalAlpha = 1;
  }

  function draw() {
    ctx.fillStyle = "#071A0F";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    drawGrid();

    ctx.shadowColor = "#FF4444";
    ctx.shadowBlur = 12;
    ctx.fillStyle = "#FF4444";
    ctx.beginPath();
    ctx.arc(
      food.x * SZ + SZ / 2,
      food.y * SZ + SZ / 2,
      SZ / 2 - 2,
      0,
      Math.PI * 2,
    );
    ctx.fill();
    ctx.shadowBlur = 0;

    enemyTrail.forEach((p, i) =>
      drawBlock(p, "#FF006E", "#FF006E", 0.18 - i * 0.02, 5),
    );
    drawBlock(enemy, "#FF006E", "#FF006E", 1, 5);

    snake.forEach((seg, i) => {
      const t = 1 - i / snake.length;
      drawBlock(
        seg,
        i === 0
          ? "#00FF88"
          : `rgba(0,${Math.floor(140 + t * 115)},${Math.floor(80 * t)},${0.55 + t * 0.45})`,
        i === 0 ? "#00FF88" : null,
        1,
        i === 0 ? 5 : 3,
      );
    });
  }

  function step() {
    dir = nextDir;
    const head = { x: snake[0].x + dir.x, y: snake[0].y + dir.y };
    const hitWall =
      head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS;
    const hitSelf = snake
      .slice(1)
      .some((s) => s.x === head.x && s.y === head.y);
    const hitEnemy = head.x === enemy.x && head.y === enemy.y;
    if (hitWall || hitSelf || hitEnemy) {
      if (shield) {
        shield = false;
        STATE.upgrades.snake.shield = false;
        saveShop();
        snake = [
          { x: Math.floor(COLS / 2), y: Math.floor(ROWS / 2) },
          { x: Math.floor(COLS / 2) - 1, y: Math.floor(ROWS / 2) },
          { x: Math.floor(COLS / 2) - 2, y: Math.floor(ROWS / 2) },
        ];
        enemy = { x: Math.floor(COLS * 0.15), y: Math.floor(ROWS * 0.15) };
        dir = { x: 1, y: 0 };
        nextDir = { x: 1, y: 0 };
        renderShop("snake");
        return true;
      }
      onGameOver(score, level);
      return false;
    }

    snake.unshift(head);
    if (head.x === food.x && head.y === food.y) {
      score += Math.round(10 * level * diff.score * (doublePoints ? 2 : 1));
      food = spawnFood();
      if (score > 0 && score % Math.round(80 * diff.score) === 0) {
        level++;
        stepMs = Math.max(46, stepMs - 8);
      }
      setHUD(score, STATE.bestScores.snake, level);
    } else {
      snake.pop();
    }

    if (enemy.x === snake[0].x && enemy.y === snake[0].y) {
      onGameOver(score, level);
      return false;
    }
    draw();
    return true;
  }

  function loop(ts) {
    if (!STATE.gameRunning) return;
    if (!lastTime) lastTime = ts;
    const dt = Math.min(ts - lastTime, 80);
    lastTime = ts;
    acc += dt;
    enemyAcc += dt;

    const enemyStep = Math.max(
      70,
      stepMs / (diff.enemy * (slowEnemy ? 0.7 : 1)),
    );
    while (enemyAcc >= enemyStep) {
      enemyAcc -= enemyStep;
      moveEnemy();
    }
    while (acc >= stepMs) {
      acc -= stepMs;
      if (!step()) return;
    }

    draw();
    STATE.rafId = requestAnimationFrame(loop);
  }

  setHUD(score, STATE.bestScores.snake, level);
  draw();
  STATE.rafId = requestAnimationFrame(loop);
}

/* ============================================================
   GAME: TETRIS
   ============================================================ */

function startTetris() {
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const W = 10,
    H = 20,
    S = Math.floor(canvas.width / W);
  canvas.height = H * S;

  const PIECES = [
    { shape: [[1, 1, 1, 1]], color: "#00F5FF" },
    {
      shape: [
        [1, 1],
        [1, 1],
      ],
      color: "#FFD700",
    },
    {
      shape: [
        [1, 1, 1],
        [0, 1, 0],
      ],
      color: "#A855F7",
    },
    {
      shape: [
        [1, 1, 1],
        [1, 0, 0],
      ],
      color: "#FF8C00",
    },
    {
      shape: [
        [1, 1, 1],
        [0, 0, 1],
      ],
      color: "#3B82F6",
    },
    {
      shape: [
        [1, 1, 0],
        [0, 1, 1],
      ],
      color: "#22C55E",
    },
    {
      shape: [
        [0, 1, 1],
        [1, 1, 0],
      ],
      color: "#EF4444",
    },
  ];

  let board = Array.from({ length: H }, () => Array(W).fill(0));
  let cur = null,
    curX = 0,
    curY = 0;
  const diff = getDifficulty();
  let score = 0,
    level = 1,
    lines = 0,
    speed = 500 / diff.speed;
  let lockTimer = null;

  function newPiece() {
    const p = PIECES[Math.floor(Math.random() * PIECES.length)];
    cur = { shape: p.shape.map((r) => [...r]), color: p.color };
    curX = Math.floor((W - cur.shape[0].length) / 2);
    curY = 0;
    if (collide()) onGameOver(score, level);
  }

  function rotate(m) {
    return m[0].map((_, i) => m.map((r) => r[i]).reverse());
  }

  function collide(ox = 0, oy = 0, shape = cur.shape) {
    return shape.some((row, r) =>
      row.some((v, c) => {
        if (!v) return false;
        const nx = curX + c + ox,
          ny = curY + r + oy;
        return nx < 0 || nx >= W || ny >= H || (ny >= 0 && board[ny][nx]);
      }),
    );
  }

  function place() {
    cur.shape.forEach((row, r) =>
      row.forEach((v, c) => {
        if (v && curY + r >= 0) board[curY + r][curX + c] = cur.color;
      }),
    );
    clearLines();
    newPiece();
  }

  function clearLines() {
    let cleared = 0;
    for (let r = H - 1; r >= 0; r--) {
      if (board[r].every((c) => c)) {
        board.splice(r, 1);
        board.unshift(Array(W).fill(0));
        cleared++;
        r++;
      }
    }
    if (cleared) {
      const pts = [0, 100, 300, 500, 800];
      score += (pts[cleared] || 800) * level;
      lines += cleared;
      if (Math.floor(lines / 10) >= level) {
        level++;
        speed = Math.max(80, speed - 45);
        clearInterval(STATE.gameLoop);
        STATE.gameLoop = setInterval(tick, speed);
      }
      setHUD(score, STATE.bestScores.tetris, level);
    }
  }

  function getGhost() {
    let gy = curY;
    while (!collide(0, gy - curY + 1)) gy++;
    return gy;
  }

  function draw() {
    ctx.fillStyle = "#0D0718";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // grid
    ctx.strokeStyle = "#1A0F2E";
    ctx.lineWidth = 0.4;
    for (let x = 0; x <= W; x++) {
      ctx.beginPath();
      ctx.moveTo(x * S, 0);
      ctx.lineTo(x * S, H * S);
      ctx.stroke();
    }
    for (let y = 0; y <= H; y++) {
      ctx.beginPath();
      ctx.moveTo(0, y * S);
      ctx.lineTo(W * S, y * S);
      ctx.stroke();
    }

    // board
    board.forEach((row, r) =>
      row.forEach((v, c) => {
        if (!v) return;
        drawBlock(ctx, c * S, r * S, S, v);
      }),
    );

    // ghost
    if (cur) {
      const gy = getGhost();
      cur.shape.forEach((row, r) =>
        row.forEach((v, c) => {
          if (v) {
            ctx.fillStyle = cur.color + "22";
            ctx.strokeStyle = cur.color + "55";
            ctx.lineWidth = 1;
            ctx.fillRect((curX + c) * S + 1, (gy + r) * S + 1, S - 2, S - 2);
            ctx.strokeRect((curX + c) * S + 1, (gy + r) * S + 1, S - 2, S - 2);
          }
        }),
      );

      // active piece
      cur.shape.forEach((row, r) =>
        row.forEach((v, c) => {
          if (v) drawBlock(ctx, (curX + c) * S, (curY + r) * S, S, cur.color);
        }),
      );
    }
  }

  function drawBlock(ctx, x, y, s, color) {
    ctx.fillStyle = color;
    ctx.fillRect(x + 1, y + 1, s - 2, s - 2);
    ctx.fillStyle = "rgba(255,255,255,0.22)";
    ctx.fillRect(x + 1, y + 1, s - 2, 3);
    ctx.fillRect(x + 1, y + 1, 3, s - 2);
    ctx.fillStyle = "rgba(0,0,0,0.25)";
    ctx.fillRect(x + 1, y + s - 3, s - 2, 2);
    ctx.fillRect(x + s - 3, y + 1, 2, s - 2);
  }

  const keys = {};
  let dasTimer = null,
    dasActive = false;

  function onKey(e) {
    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)
    )
      e.preventDefault();
    if (e.type === "keydown") {
      if (e.key === "ArrowLeft") {
        if (!collide(-1)) curX--;
        draw();
      }
      if (e.key === "ArrowRight") {
        if (!collide(1)) curX++;
        draw();
      }
      if (e.key === "ArrowDown") {
        if (!collide(0, 1)) curY++;
        else place();
        draw();
      }
      if (e.key === "ArrowUp") {
        const rotated = rotate(cur.shape);
        const old = cur.shape;
        cur.shape = rotated;
        if (collide()) {
          // wall kick
          if (!collide(-1)) curX--;
          else if (!collide(1)) curX++;
          else cur.shape = old;
        }
        draw();
      }
      if (e.key === " ") {
        curY = getGhost();
        place();
        draw();
      }
    }
  }

  document.addEventListener("keydown", onKey);
  GAME_KEY_CLEANUP.push(() => document.removeEventListener("keydown", onKey));

  function tick() {
    if (!collide(0, 1)) {
      curY++;
    } else {
      place();
    }
    draw();
  }

  newPiece();
  draw();
  STATE.gameLoop = setInterval(tick, speed);
}

/* ============================================================
   GAME: BREAKOUT
   ============================================================ */

function startBreakout() {
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width,
    H = canvas.height;
  const basePW = hasUpgrade("breakout", "wide_paddle") ? 110 : 75;
  const PW = basePW,
    PH = 10,
    BALL_R = 7;
  const ROWS = 8,
    COLS = 10;
  const BPAD = 4,
    BH = 14;
  const BW = Math.floor((W - BPAD * (COLS + 1)) / COLS);

  const COLORS = [
    "#FF006E",
    "#FF4500",
    "#FF8C00",
    "#FFD700",
    "#00FF88",
    "#00F5FF",
    "#A855F7",
    "#FF69B4",
  ];

  let px = W / 2 - PW / 2,
    py = H - 30;
  let bx = W / 2,
    by = H / 2;
  const diff = getDifficulty();
  const ballUpgrade = hasUpgrade("breakout", "slow_ball") ? 0.82 : 1;
  let vx = 3.5 * diff.speed * ballUpgrade,
    vy = -4 * diff.speed * ballUpgrade;
  let score = 0,
    level = 1,
    lives = diff.lives + (hasUpgrade("breakout", "extra_life") ? 1 : 0);
  let bricks = [];
  let blocker = {
    x: W / 2 - 60,
    y: H * 0.58,
    w: 120,
    h: 10,
    speed: 2.2 * diff.speed,
    dir: 1,
  };

  function makeBricks() {
    bricks = [];
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        bricks.push({
          x: BPAD + c * (BW + BPAD),
          y: 50 + r * (BH + BPAD),
          w: BW,
          h: BH,
          color: COLORS[r % COLORS.length],
          hp: r < 2 ? 2 : 1,
          alive: true,
        });
      }
    }
  }

  makeBricks();
  const keys = {};

  function onKey(e) {
    keys[e.key] = e.type === "keydown";
    if (["ArrowLeft", "ArrowRight", "a", "d"].includes(e.key))
      e.preventDefault();
  }

  document.addEventListener("keydown", onKey);
  document.addEventListener("keyup", onKey);
  GAME_KEY_CLEANUP.push(() => {
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("keyup", onKey);
  });

  // Touch support
  canvas.addEventListener(
    "touchmove",
    (e) => {
      e.preventDefault();
      const rect = canvas.getBoundingClientRect();
      px = (e.touches[0].clientX - rect.left) * (W / rect.width) - PW / 2;
      px = Math.max(0, Math.min(W - PW, px));
    },
    { passive: false },
  );

  function draw() {
    ctx.fillStyle = "#1A0D00";
    ctx.fillRect(0, 0, W, H);

    // bricks
    bricks.forEach((b) => {
      if (!b.alive) return;
      ctx.fillStyle = b.hp > 1 ? "#FFFFFF" : b.color;
      ctx.beginPath();
      ctx.roundRect(b.x, b.y, b.w, b.h, 2);
      ctx.fill();
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.roundRect(b.x + 1, b.y + 1, b.w - 2, b.h - 2, 2);
      ctx.fill();
      ctx.fillStyle = "rgba(255,255,255,0.2)";
      ctx.fillRect(b.x + 2, b.y + 2, b.w - 4, 2);
    });

    // paddle with gradient
    const pg = ctx.createLinearGradient(px, py, px + PW, py + PH);
    pg.addColorStop(0, "#FF8C00");
    pg.addColorStop(1, "#FFD700");
    ctx.fillStyle = pg;
    ctx.beginPath();
    ctx.roundRect(px, py, PW, PH, 5);
    ctx.fill();
    ctx.fillStyle = "rgba(255,255,255,0.3)";
    ctx.fillRect(px + 4, py + 2, PW - 8, 2);

    // moving blocker
    ctx.shadowColor = "#00F5FF";
    ctx.shadowBlur = 18;
    ctx.fillStyle = "#00F5FF";
    ctx.beginPath();
    ctx.roundRect(blocker.x, blocker.y, blocker.w, blocker.h, 5);
    ctx.fill();
    ctx.shadowBlur = 0;

    // ball
    ctx.shadowColor = "#FF8C00";
    ctx.shadowBlur = 14;
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(bx, by, BALL_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // lives
    for (let i = 0; i < lives; i++) {
      ctx.fillStyle = "#FF006E";
      ctx.shadowColor = "#FF006E";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(12 + i * 22, 18, 6, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.shadowBlur = 0;
  }

  let lastTime = 0;
  function tick(ts) {
    if (!STATE.gameRunning) return;
    const dt = Math.min((ts - lastTime) / 16.67, 2); // cap delta
    lastTime = ts;

    if (keys["ArrowLeft"] || keys["a"]) px = Math.max(0, px - 6 * dt);
    if (keys["ArrowRight"] || keys["d"]) px = Math.min(W - PW, px + 6 * dt);

    bx += vx * dt;
    by += vy * dt;

    if (bx - BALL_R < 0) {
      bx = BALL_R;
      vx = Math.abs(vx);
    }
    if (bx + BALL_R > W) {
      bx = W - BALL_R;
      vx = -Math.abs(vx);
    }
    if (by - BALL_R < 0) {
      by = BALL_R;
      vy = Math.abs(vy);
    }

    blocker.x += blocker.speed * blocker.dir * dt;
    if (blocker.x <= 0 || blocker.x + blocker.w >= W) {
      blocker.x = Math.max(0, Math.min(W - blocker.w, blocker.x));
      blocker.dir *= -1;
    }

    if (
      bx + BALL_R > blocker.x &&
      bx - BALL_R < blocker.x + blocker.w &&
      by + BALL_R > blocker.y &&
      by - BALL_R < blocker.y + blocker.h
    ) {
      const fromTop = Math.abs(by + BALL_R - blocker.y);
      const fromBottom = Math.abs(by - BALL_R - (blocker.y + blocker.h));
      if (fromTop < fromBottom) {
        by = blocker.y - BALL_R;
        vy = -Math.abs(vy);
      } else {
        by = blocker.y + blocker.h + BALL_R;
        vy = Math.abs(vy);
      }
      vx += blocker.dir * 0.25;
    }

    // paddle collision
    if (
      by + BALL_R > py &&
      by - BALL_R < py + PH &&
      bx > px - BALL_R &&
      bx < px + PW + BALL_R
    ) {
      vy = -Math.abs(vy);
      vx = ((bx - (px + PW / 2)) / (PW / 2)) * 5;
      by = py - BALL_R;
    }

    // brick collision
    for (const b of bricks) {
      if (!b.alive) continue;
      if (
        bx + BALL_R > b.x &&
        bx - BALL_R < b.x + b.w &&
        by + BALL_R > b.y &&
        by - BALL_R < b.y + b.h
      ) {
        b.hp--;
        if (b.hp <= 0) b.alive = false;
        const fromLeft = Math.abs(bx + BALL_R - b.x);
        const fromRight = Math.abs(bx - BALL_R - (b.x + b.w));
        const fromTop = Math.abs(by + BALL_R - b.y);
        const fromBottom = Math.abs(by - BALL_R - (b.y + b.h));
        const minD = Math.min(fromLeft, fromRight, fromTop, fromBottom);
        if (minD === fromTop || minD === fromBottom) vy = -vy;
        else vx = -vx;
        score += Math.round((b.hp <= 0 ? 10 * level : 5 * level) * diff.score);
        setHUD(score, STATE.bestScores.breakout, level);
        break;
      }
    }

    // ball out
    if (by + BALL_R > H) {
      lives--;
      if (lives <= 0) {
        onGameOver(score, level);
        return;
      }
      bx = W / 2;
      by = H / 2;
      vx = 3.5 * diff.speed * ballUpgrade;
      vy = -4 * diff.speed * ballUpgrade;
    }

    // all cleared
    if (bricks.every((b) => !b.alive)) {
      level++;
      makeBricks();
      bx = W / 2;
      by = H / 2;
      const speed = 3.5 + level * 0.4;
      vx = (Math.random() > 0.5 ? 1 : -1) * speed;
      vy = -speed;
    }

    // cap speed
    const spd = Math.hypot(vx, vy);
    if (spd > 10) {
      vx = (vx / spd) * 10;
      vy = (vy / spd) * 10;
    }

    draw();
    STATE.rafId = requestAnimationFrame(tick);
  }

  draw();
  STATE.rafId = requestAnimationFrame((ts) => {
    lastTime = ts;
    STATE.rafId = requestAnimationFrame(tick);
  });
}

/* ============================================================
   GAME: PONG
   ============================================================ */

function startPong() {
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width,
    H = canvas.height;
  const diff = getDifficulty();
  const PW = 10,
    PH = 65,
    BALL_R = 7;

  let py = H / 2 - PH / 2,
    ay = H / 2 - PH / 2;
  let bx = W / 2,
    by = H / 2,
    vx = 4.5 * diff.speed,
    vy = 3 * diff.speed;
  let ps = 0,
    as = 0,
    rally = 0;
  const WIN = 7;
  const keys = {};

  function onKey(e) {
    keys[e.key] = e.type === "keydown";
    if (["ArrowUp", "ArrowDown", "w", "s"].includes(e.key)) e.preventDefault();
  }

  document.addEventListener("keydown", onKey);
  document.addEventListener("keyup", onKey);
  GAME_KEY_CLEANUP.push(() => {
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("keyup", onKey);
  });

  function draw() {
    ctx.fillStyle = "#000D0F";
    ctx.fillRect(0, 0, W, H);

    // center line
    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = "rgba(0,245,255,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.setLineDash([]);

    // paddles
    const drawPaddle = (x, y, color) => {
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, y, PW, PH, 4);
      ctx.fill();
      ctx.shadowBlur = 0;
    };
    drawPaddle(15, py, "#00F5FF");
    drawPaddle(W - 15 - PW, ay, "#FF006E");

    // ball
    ctx.shadowColor = "#FFFFFF";
    ctx.shadowBlur = 16;
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(bx, by, BALL_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // scores
    ctx.font = `700 36px 'Orbitron', monospace`;
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(0,245,255,0.7)";
    ctx.fillText(ps, W / 2 - 60, 45);
    ctx.fillStyle = "rgba(255,0,110,0.7)";
    ctx.fillText(as, W / 2 + 60, 45);

    ctx.font = `500 10px 'Orbitron', monospace`;
    ctx.fillStyle = "rgba(255,255,255,0.2)";
    ctx.fillText("YOU", W / 4, H - 10);
    ctx.fillText("AI", (3 * W) / 4, H - 10);
  }

  let lastTime = 0;
  function tick(ts) {
    if (!STATE.gameRunning) return;
    const dt = Math.min((ts - lastTime) / 16.67, 2);
    lastTime = ts;

    if (keys["w"] || keys["ArrowUp"]) py = Math.max(0, py - 6 * dt);
    if (keys["s"] || keys["ArrowDown"]) py = Math.min(H - PH, py + 6 * dt);

    // AI — speed scales with rally
    const aiSpeed = (2.8 * diff.ai + rally * 0.1) * dt;
    const aiCenter = ay + PH / 2;
    if (aiCenter < by - 3) ay = Math.min(H - PH, ay + aiSpeed);
    else if (aiCenter > by + 3) ay = Math.max(0, ay - aiSpeed);

    bx += vx * dt;
    by += vy * dt;

    if (by - BALL_R < 0) {
      by = BALL_R;
      vy = Math.abs(vy);
    }
    if (by + BALL_R > H) {
      by = H - BALL_R;
      vy = -Math.abs(vy);
    }

    // player paddle
    if (bx - BALL_R < 25 + PW && bx - BALL_R > 15 && by > py && by < py + PH) {
      vx = Math.abs(vx) * 1.04;
      vy = ((by - (py + PH / 2)) / (PH / 2)) * 5;
      bx = 25 + PW;
      rally++;
    }
    // ai paddle
    if (
      bx + BALL_R > W - 15 - PW &&
      bx + BALL_R < W - 15 &&
      by > ay &&
      by < ay + PH
    ) {
      vx = -Math.abs(vx) * 1.04;
      vy = ((by - (ay + PH / 2)) / (PH / 2)) * 5;
      bx = W - 15 - PW - BALL_R;
      rally++;
    }

    // cap speed
    const spd = Math.hypot(vx, vy);
    if (spd > 12) {
      vx = (vx / spd) * 12;
      vy = (vy / spd) * 12;
    }

    // scoring
    if (bx < 0) {
      as++;
      rally = 0;
      setHUD(ps, STATE.bestScores.pong, as);
      if (as >= WIN) {
        onGameOver(ps, as);
        return;
      }
      bx = W / 2;
      by = H / 2;
      vx = 4.5 * diff.speed;
      vy = 3 * diff.speed;
    }
    if (bx > W) {
      ps++;
      rally = 0;
      setHUD(ps, STATE.bestScores.pong, as);
      if (ps >= WIN) {
        onGameOver(ps, as);
        return;
      }
      bx = W / 2;
      by = H / 2;
      vx = -4.5 * diff.speed;
      vy = 3 * diff.speed;
    }

    draw();
    STATE.rafId = requestAnimationFrame(tick);
  }

  draw();
  STATE.rafId = requestAnimationFrame((ts) => {
    lastTime = ts;
    STATE.rafId = requestAnimationFrame(tick);
  });
}

/* ============================================================
   GAME: FLAPPY
   ============================================================ */

function startFlappy() {
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width,
    H = canvas.height;
  const diff = getDifficulty();
  const GRAVITY = 0.45 * diff.speed,
    FLAP = -7,
    PIPE_W = 52,
    GAP = diff.gap,
    PIPE_SPEED = 2.8 * diff.speed;

  let bird = { x: 80, y: H / 2, vy: 0, r: 13 };
  let pipes = [];
  let score = 0,
    frame = 0,
    pipeTimer = 0;

  function spawnPipe() {
    const top = 60 + Math.random() * (H - GAP - 100);
    pipes.push({ x: W, top, scored: false });
  }

  function flap() {
    bird.vy = FLAP;
  }

  function onKey(e) {
    if (e.key === " " || e.key === "ArrowUp") {
      e.preventDefault();
      flap();
    }
  }
  document.addEventListener("keydown", onKey);
  canvas.addEventListener("click", flap);
  canvas.addEventListener(
    "touchstart",
    (e) => {
      e.preventDefault();
      flap();
    },
    { passive: false },
  );
  GAME_KEY_CLEANUP.push(() => {
    document.removeEventListener("keydown", onKey);
    canvas.removeEventListener("click", flap);
  });

  function draw() {
    // sky gradient
    const sky = ctx.createLinearGradient(0, 0, 0, H);
    sky.addColorStop(0, "#0D0D00");
    sky.addColorStop(1, "#1A1A00");
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, W, H);

    // pipes
    pipes.forEach((p) => {
      // top pipe
      ctx.fillStyle = "#3D8B00";
      ctx.fillRect(p.x, 0, PIPE_W, p.top);
      ctx.fillStyle = "#5CB800";
      ctx.fillRect(p.x - 3, p.top - 18, PIPE_W + 6, 18);
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(p.x + 4, 0, 6, p.top);

      // bottom pipe
      const bt = p.top + GAP;
      ctx.fillStyle = "#3D8B00";
      ctx.fillRect(p.x, bt, PIPE_W, H - bt);
      ctx.fillStyle = "#5CB800";
      ctx.fillRect(p.x - 3, bt, PIPE_W + 6, 18);
      ctx.fillStyle = "rgba(255,255,255,0.12)";
      ctx.fillRect(p.x + 4, bt, 6, H - bt);
    });

    // bird
    const tilt = Math.max(-0.5, Math.min(1.2, bird.vy * 0.06));
    ctx.save();
    ctx.translate(bird.x, bird.y);
    ctx.rotate(tilt);
    ctx.shadowColor = "#FFD000";
    ctx.shadowBlur = 15;
    ctx.fillStyle = "#FFD000";
    ctx.beginPath();
    ctx.ellipse(0, 0, bird.r, bird.r * 0.85, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#FF8800";
    ctx.beginPath();
    ctx.ellipse(-4, -3, bird.r * 0.5, bird.r * 0.4, -0.3, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#000";
    ctx.beginPath();
    ctx.arc(5, -4, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = "#fff";
    ctx.beginPath();
    ctx.arc(6, -5, 1.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.restore();

    // score
    ctx.font = `700 28px 'Orbitron', monospace`;
    ctx.textAlign = "center";
    ctx.shadowColor = "#FFD000";
    ctx.shadowBlur = 10;
    ctx.fillStyle = "#FFD000";
    ctx.fillText(score, W / 2, 45);
    ctx.shadowBlur = 0;
  }

  let lastTime = 0;
  function tick(ts) {
    if (!STATE.gameRunning) return;
    const dt = Math.min((ts - lastTime) / 16.67, 2);
    lastTime = ts;
    frame++;

    bird.vy += GRAVITY * dt;
    bird.y += bird.vy * dt;

    pipeTimer += dt;
    if (pipeTimer > 80) {
      spawnPipe();
      pipeTimer = 0;
    }

    pipes.forEach((p) => (p.x -= PIPE_SPEED * dt));
    pipes = pipes.filter((p) => p.x > -PIPE_W - 10);

    // score
    pipes.forEach((p) => {
      if (!p.scored && p.x + PIPE_W < bird.x) {
        p.scored = true;
        score++;
        setHUD(score, STATE.bestScores.flappy, 1);
      }
    });

    // collision
    if (bird.y - bird.r < 0 || bird.y + bird.r > H) {
      onGameOver(score);
      return;
    }
    for (const p of pipes) {
      if (bird.x + bird.r > p.x && bird.x - bird.r < p.x + PIPE_W) {
        if (bird.y - bird.r < p.top || bird.y + bird.r > p.top + GAP) {
          onGameOver(score);
          return;
        }
      }
    }

    draw();
    STATE.rafId = requestAnimationFrame(tick);
  }

  draw();
  STATE.rafId = requestAnimationFrame((ts) => {
    lastTime = ts;
    STATE.rafId = requestAnimationFrame(tick);
  });
}

/* ============================================================
   GAME: ASTEROIDS
   ============================================================ */

function startAsteroids() {
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width,
    H = canvas.height;

  let ship = { x: W / 2, y: H / 2, angle: -Math.PI / 2, vx: 0, vy: 0, r: 12 };
  let bullets = [],
    asteroids = [],
    particles = [];
  const diff = getDifficulty();
  let score = 0,
    level = 1,
    lives = diff.lives;
  let invincible = 0;

  function spawnAsteroids(n) {
    for (let i = 0; i < n; i++) {
      let x, y;
      do {
        x = Math.random() * W;
        y = Math.random() * H;
      } while (Math.hypot(x - ship.x, y - ship.y) < 120);
      const angle = Math.random() * Math.PI * 2;
      const speed = (1 + Math.random() * 1.5 + level * 0.2) * diff.speed;
      asteroids.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        r: 36 + Math.random() * 14,
        angle: 0,
        rot: (Math.random() - 0.5) * 0.04,
        pts: [],
      });
    }
  }

  function buildPoints(a) {
    a.pts = Array.from({ length: 9 }, (_, i) => {
      const ang = (i / 9) * Math.PI * 2;
      const r = a.r * (0.75 + Math.random() * 0.5);
      return { x: Math.cos(ang) * r, y: Math.sin(ang) * r };
    });
  }

  spawnAsteroids(diff.asteroids);
  asteroids.forEach(buildPoints);

  const keys = {};
  function onKey(e) {
    keys[e.key] = e.type === "keydown";
    if (
      ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "].includes(e.key)
    )
      e.preventDefault();
    if (e.type === "keydown" && e.key === " ") {
      bullets.push({
        x: ship.x + Math.cos(ship.angle) * ship.r,
        y: ship.y + Math.sin(ship.angle) * ship.r,
        vx: Math.cos(ship.angle) * 9,
        vy: Math.sin(ship.angle) * 9,
        life: 55,
      });
    }
  }
  document.addEventListener("keydown", onKey);
  document.addEventListener("keyup", onKey);
  GAME_KEY_CLEANUP.push(() => {
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("keyup", onKey);
  });

  function wrap(obj) {
    if (obj.x < -obj.r) obj.x = W + obj.r;
    if (obj.x > W + obj.r) obj.x = -obj.r;
    if (obj.y < -obj.r) obj.y = H + obj.r;
    if (obj.y > H + obj.r) obj.y = -obj.r;
  }

  function explode(x, y, color) {
    for (let i = 0; i < 12; i++) {
      const a = Math.random() * Math.PI * 2,
        s = 1 + Math.random() * 3;
      particles.push({
        x,
        y,
        vx: Math.cos(a) * s,
        vy: Math.sin(a) * s,
        life: 35,
        color,
      });
    }
  }

  function draw() {
    ctx.fillStyle = "#0A0008";
    ctx.fillRect(0, 0, W, H);

    // stars
    ctx.fillStyle = "rgba(255,255,255,0.6)";
    for (let i = 0; i < 60; i++) {
      const sx = (i * 137 + 43) % W;
      const sy = (i * 211 + 97) % H;
      ctx.fillRect(sx, sy, 1, 1);
    }

    // asteroids
    asteroids.forEach((a) => {
      ctx.save();
      ctx.translate(a.x, a.y);
      ctx.rotate(a.angle);
      ctx.strokeStyle = "#FF006E";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#FF006E";
      ctx.shadowBlur = 8;
      ctx.beginPath();
      a.pts.forEach((p, i) =>
        i === 0 ? ctx.moveTo(p.x, p.y) : ctx.lineTo(p.x, p.y),
      );
      ctx.closePath();
      ctx.stroke();
      ctx.shadowBlur = 0;
      ctx.restore();
    });

    // bullets
    bullets.forEach((b) => {
      ctx.shadowColor = "#FF006E";
      ctx.shadowBlur = 8;
      ctx.fillStyle = "#FF006E";
      ctx.beginPath();
      ctx.arc(b.x, b.y, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.shadowBlur = 0;
    });

    // particles
    particles.forEach((p) => {
      ctx.globalAlpha = p.life / 35;
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, 2, 2);
    });
    ctx.globalAlpha = 1;

    // ship
    if (invincible <= 0 || Math.floor(invincible / 4) % 2 === 0) {
      ctx.save();
      ctx.translate(ship.x, ship.y);
      ctx.rotate(ship.angle + Math.PI / 2);
      ctx.strokeStyle = "#00F5FF";
      ctx.lineWidth = 2;
      ctx.shadowColor = "#00F5FF";
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(0, -ship.r);
      ctx.lineTo(-ship.r * 0.6, ship.r * 0.7);
      ctx.lineTo(0, ship.r * 0.3);
      ctx.lineTo(ship.r * 0.6, ship.r * 0.7);
      ctx.closePath();
      ctx.stroke();
      if (keys["ArrowUp"] || keys["w"]) {
        ctx.strokeStyle = "#FF8C00";
        ctx.beginPath();
        ctx.moveTo(-5, ship.r * 0.3);
        ctx.lineTo(0, ship.r + 8 + Math.random() * 6);
        ctx.lineTo(5, ship.r * 0.3);
        ctx.stroke();
      }
      ctx.shadowBlur = 0;
      ctx.restore();
    }

    // lives
    for (let i = 0; i < lives; i++) {
      ctx.save();
      ctx.translate(15 + i * 22, 20);
      ctx.rotate(-Math.PI / 2);
      ctx.strokeStyle = "#00F5FF";
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(0, -8);
      ctx.lineTo(-5, 5);
      ctx.lineTo(0, 2);
      ctx.lineTo(5, 5);
      ctx.closePath();
      ctx.stroke();
      ctx.restore();
    }

    // score
    ctx.font = `600 14px 'Orbitron', monospace`;
    ctx.textAlign = "right";
    ctx.fillStyle = "#00F5FF";
    ctx.fillText(score, W - 10, 22);
  }

  let lastTime = 0;
  function tick(ts) {
    if (!STATE.gameRunning) return;
    const dt = Math.min((ts - lastTime) / 16.67, 2);
    lastTime = ts;

    if (invincible > 0) invincible -= dt;
    if (keys["ArrowLeft"]) ship.angle -= 0.065 * dt;
    if (keys["ArrowRight"]) ship.angle += 0.065 * dt;
    if (keys["ArrowUp"] || keys["w"]) {
      ship.vx += Math.cos(ship.angle) * 0.28 * dt;
      ship.vy += Math.sin(ship.angle) * 0.28 * dt;
    }
    ship.vx *= 0.988;
    ship.vy *= 0.988;
    ship.x += ship.vx * dt;
    ship.y += ship.vy * dt;
    wrap(ship);

    asteroids.forEach((a) => {
      a.x += a.vx * dt;
      a.y += a.vy * dt;
      a.angle += a.rot * dt;
      wrap(a);
    });
    bullets.forEach((b) => {
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
    });
    bullets = bullets.filter((b) => b.life > 0);
    particles.forEach((p) => {
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.life -= dt;
    });
    particles = particles.filter((p) => p.life > 0);

    // bullet–asteroid
    for (let bi = bullets.length - 1; bi >= 0; bi--) {
      for (let ai = asteroids.length - 1; ai >= 0; ai--) {
        const a = asteroids[ai],
          b = bullets[bi];
        if (Math.hypot(b.x - a.x, b.y - a.y) < a.r) {
          bullets.splice(bi, 1);
          explode(a.x, a.y, "#FF006E");
          score += a.r > 30 ? 20 : a.r > 18 ? 50 : 100;
          setHUD(score, STATE.bestScores.asteroids, level);
          if (a.r > 22) {
            for (let k = 0; k < 2; k++) {
              const newA = {
                x: a.x,
                y: a.y,
                vx: (Math.random() - 0.5) * 4,
                vy: (Math.random() - 0.5) * 4,
                r: a.r * 0.55,
                angle: 0,
                rot: (Math.random() - 0.5) * 0.06,
                pts: [],
              };
              buildPoints(newA);
              asteroids.push(newA);
            }
          }
          asteroids.splice(ai, 1);
          break;
        }
      }
    }

    // ship–asteroid
    if (invincible <= 0) {
      for (const a of asteroids) {
        if (Math.hypot(ship.x - a.x, ship.y - a.y) < a.r + ship.r - 4) {
          lives--;
          explode(ship.x, ship.y, "#00F5FF");
          invincible = 120;
          ship.vx = 0;
          ship.vy = 0;
          if (lives <= 0) {
            onGameOver(score, level);
            return;
          }
          break;
        }
      }
    }

    // level up
    if (asteroids.length === 0) {
      level++;
      spawnAsteroids(3 + level);
      asteroids.forEach(buildPoints);
    }

    draw();
    STATE.rafId = requestAnimationFrame(tick);
  }

  draw();
  STATE.rafId = requestAnimationFrame((ts) => {
    lastTime = ts;
    STATE.rafId = requestAnimationFrame(tick);
  });
}

/* ============================================================
   HERO CANVAS — animated grid
   ============================================================ */

function startHeroCanvas() {
  const canvas = document.getElementById("hero-canvas");
  if (!canvas) return;
  const ctx = canvas.getContext("2d");

  function resize() {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
  }

  resize();
  window.addEventListener("resize", resize);

  let t = 0;
  function draw() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.strokeStyle = "rgba(0,245,255,1)";
    ctx.lineWidth = 0.5;
    const S = 44;
    for (let x = 0; x < canvas.width + S; x += S) {
      const ox = x + Math.sin(t * 0.25 + x * 0.008) * 4;
      ctx.beginPath();
      ctx.moveTo(ox, 0);
      ctx.lineTo(ox, canvas.height);
      ctx.stroke();
    }
    for (let y = 0; y < canvas.height + S; y += S) {
      const oy = y + Math.cos(t * 0.2 + y * 0.009) * 4;
      ctx.beginPath();
      ctx.moveTo(0, oy);
      ctx.lineTo(canvas.width, oy);
      ctx.stroke();
    }
    t += 0.04;
    requestAnimationFrame(draw);
  }
  draw();
}

/* ============================================================
   FILTER NAV
   ============================================================ */

function setupFilterNav() {
  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".filter-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      buildGrid(btn.dataset.filter);
    });
  });
}

/* ============================================================
   NAVBAR SCROLL EFFECT
   ============================================================ */

function setupNavbar() {
  const nav = document.getElementById("navbar");
  window.addEventListener(
    "scroll",
    () => {
      nav.classList.toggle("scrolled", window.scrollY > 20);
    },
    { passive: true },
  );
}

/* ============================================================
   THEME PANEL TOGGLE
   ============================================================ */

function setupThemePanel() {
  const btn = document.getElementById("theme-toggle-btn");
  const panel = document.getElementById("theme-panel");

  btn.addEventListener("click", (e) => {
    e.stopPropagation();
    STATE.panelOpen = !STATE.panelOpen;
    panel.classList.toggle("open", STATE.panelOpen);
  });

  document.addEventListener("click", (e) => {
    if (!panel.contains(e.target) && e.target !== btn) {
      STATE.panelOpen = false;
      panel.classList.remove("open");
    }
  });

  // Toggles
  document
    .getElementById("toggle-scanlines")
    .addEventListener("click", function () {
      STATE.scanlines = !STATE.scanlines;
      this.classList.toggle("on", STATE.scanlines);
      document.querySelectorAll(".hero-scanline").forEach((el) => {
        el.style.opacity = STATE.scanlines ? "var(--scanline-opacity)" : "0";
      });
    });

  // Speed slider
  const speedSlider = document.getElementById("anim-speed");
  const speedVal = document.getElementById("speed-val");
  speedSlider.addEventListener("input", function () {
    speedVal.textContent = this.value + "x";
  });

  // Reset accent
  document.getElementById("reset-accent").addEventListener("click", () => {
    clearAccentOverride();
  });
}

/* ============================================================
   SCOREBOARD
   ============================================================ */

function setupScoreboard() {
  updateScoreboard();
}

/* ============================================================
   MODAL CLOSE SHORTCUT
   ============================================================ */

function setupModal() {
  document.getElementById("modal-close").addEventListener("click", closeGame);
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") closeGame();
  });
}

/* ============================================================
   INIT
   ============================================================ */

document.addEventListener("DOMContentLoaded", () => {
  buildThemePanel();
  buildGrid("all");
  setupFilterNav();
  setupNavbar();
  setupThemePanel();
  setupScoreboard();
  setupModal();
  setupShop();
  startHeroCanvas();
});

function startFruitSlash() {
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d", { alpha: false });
  const diff = getDifficulty();

  const slowFruit = hasUpgrade("fruit", "slow_fruit");
  const extraLife = hasUpgrade("fruit", "extra_life");
  const lessBombs = hasUpgrade("fruit", "less_bombs");

  canvas.width = 640;
  canvas.height = 640;

  let score = 0;
  let level = 1;
  let lives = extraLife ? 6 : 5;
  let fruits = [];
  let slash = [];
  let lastTime = 0;
  let spawnTimer = 0;
  let gameOver = false;

  const fruitTypes = ["🍉", "🍊", "🍎", "🍌", "🍓", "🥝"];

  function endFruitGame() {
    if (gameOver) return;
    gameOver = true;
    onGameOver(score, level);
  }

  function spawnFruit() {
    const speedBoost = diff.speed * (slowFruit ? 0.72 : 1);
    const isBomb = Math.random() < (lessBombs ? 0.06 : 0.12);

    fruits.push({
      x: 80 + Math.random() * (canvas.width - 160),

      // Starts inside the lower part of the field, not below it.
      // This makes the fruit appear higher and gives the player more time.
      y: canvas.height - 85,

      vx: -0.9 + Math.random() * 1.8,
      vy: -(4.4 + Math.random() * 1.6) * speedBoost,
      gravity: 0.055 * speedBoost,

      r: isBomb ? 24 : 30,
      sliced: false,
      countedMiss: false,
      bomb: isBomb,
      icon: isBomb
        ? "💣"
        : fruitTypes[Math.floor(Math.random() * fruitTypes.length)],
      rot: Math.random() * Math.PI,
      spin: -0.035 + Math.random() * 0.07,
    });
  }

  function getPos(e) {
    const rect = canvas.getBoundingClientRect();
    const point = e.touches ? e.touches[0] : e;

    return {
      x: (point.clientX - rect.left) * (canvas.width / rect.width),
      y: (point.clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  function slashAt(e) {
    if (gameOver || !STATE.gameRunning) return;
    e.preventDefault();

    const p = getPos(e);
    slash.push({ x: p.x, y: p.y, life: 16 });
    if (slash.length > 20) slash.shift();

    fruits.forEach((fruit) => {
      if (fruit.sliced) return;

      const dx = fruit.x - p.x;
      const dy = fruit.y - p.y;
      const distance = Math.hypot(dx, dy);

      if (distance < fruit.r + 18) {
        fruit.sliced = true;

        if (fruit.bomb) {
          lives--;
          if (lives <= 0) endFruitGame();
          return;
        }

        score += Math.round(10 * level * diff.score);

        if (score > 0 && score % 150 === 0) {
          level++;
        }

        setHUD(score, STATE.bestScores.fruit, level);
      }
    });
  }

  function pointerDown(e) {
    slashAt(e);
  }

  function pointerMove(e) {
    slashAt(e);
  }

  canvas.addEventListener("mousedown", pointerDown);
  canvas.addEventListener("mousemove", pointerMove);
  canvas.addEventListener("touchstart", pointerDown, { passive: false });
  canvas.addEventListener("touchmove", pointerMove, { passive: false });

  GAME_KEY_CLEANUP.push(() => {
    canvas.removeEventListener("mousedown", pointerDown);
    canvas.removeEventListener("mousemove", pointerMove);
    canvas.removeEventListener("touchstart", pointerDown);
    canvas.removeEventListener("touchmove", pointerMove);
  });

  function drawBackground() {
    ctx.fillStyle = "#07140A";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = "rgba(34,197,94,0.12)";
    ctx.lineWidth = 1;

    for (let x = 0; x < canvas.width; x += 32) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    for (let y = 0; y < canvas.height; y += 32) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(canvas.width, y);
      ctx.stroke();
    }
  }

  function drawFruit(fruit) {
    if (fruit.sliced) return;

    ctx.save();
    ctx.translate(fruit.x, fruit.y);
    ctx.rotate(fruit.rot);
    ctx.shadowColor = fruit.bomb ? "#ef4444" : "#22c55e";
    ctx.shadowBlur = 18;
    ctx.font = "46px Arial";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(fruit.icon, 0, 0);
    ctx.restore();

    ctx.shadowBlur = 0;
  }

  function drawSlash() {
    if (slash.length < 2) return;

    ctx.lineWidth = 5;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#00f5ff";
    ctx.shadowColor = "#00f5ff";
    ctx.shadowBlur = 18;

    ctx.beginPath();
    ctx.moveTo(slash[0].x, slash[0].y);

    for (let i = 1; i < slash.length; i++) {
      ctx.lineTo(slash[i].x, slash[i].y);
    }

    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function drawLives() {
    ctx.font = "16px Orbitron, monospace";
    ctx.textAlign = "left";
    ctx.textBaseline = "top";
    ctx.fillStyle = "#e8e8ff";
    ctx.shadowColor = "#22c55e";
    ctx.shadowBlur = 10;
    ctx.fillText(`Lives: ${"❤".repeat(Math.max(0, lives))}`, 22, 22);
    ctx.shadowBlur = 0;
  }

  function loop(ts) {
    if (!STATE.gameRunning || gameOver) return;

    if (!lastTime) lastTime = ts;
    const dt = Math.min(ts - lastTime, 40);
    lastTime = ts;

    spawnTimer += dt;

    const spawnSpeed = (slowFruit ? 2200 : 1900) / diff.speed;

    if (spawnTimer > spawnSpeed) {
      spawnTimer = 0;
      spawnFruit();

      if (level > 3 && Math.random() < 0.18) {
        spawnFruit();
      }
    }

    fruits.forEach((fruit) => {
      fruit.x += fruit.vx;
      fruit.y += fruit.vy;
      fruit.vy += fruit.gravity;
      fruit.rot += fruit.spin;

      if (
        !fruit.sliced &&
        !fruit.bomb &&
        !fruit.countedMiss &&
        fruit.y > canvas.height + 50
      ) {
        fruit.countedMiss = true;
        lives--;
        if (lives <= 0) endFruitGame();
      }
    });

    fruits = fruits.filter((fruit) => {
      if (fruit.sliced) return false;
      return fruit.y < canvas.height + 90;
    });

    slash.forEach((p) => p.life--);
    slash = slash.filter((p) => p.life > 0);

    drawBackground();
    fruits.forEach(drawFruit);
    drawSlash();
    drawLives();

    setHUD(score, STATE.bestScores.fruit, level);
    STATE.rafId = requestAnimationFrame(loop);
  }

  setHUD(score, STATE.bestScores.fruit, level);
  drawBackground();
  drawLives();
  STATE.rafId = requestAnimationFrame(loop);
}


/* ============================================================
   PONG ONLINE MULTIPLAYER UI + GAME
   ============================================================ */

function setRoomStatus(message, type = "info") {
  const el = document.getElementById("room-status");
  if (!el) return;
  el.textContent = message;
  el.dataset.type = type;
}

function resetPongRoomState() {
  if (typeof STATE.pongRoomUnsubscribe === "function") {
    STATE.pongRoomUnsubscribe();
  }
  STATE.pongRoomCode = null;
  STATE.pongPlayer = null;
  STATE.pongOnline = false;
  STATE.pongRoomUnsubscribe = null;
}

function setupPongMultiplayerUI() {
  const createBtn = document.getElementById("create-pong-room");
  const joinBtn = document.getElementById("join-pong-room");
  const input = document.getElementById("pong-room-code");

  if (!createBtn || !joinBtn || !input) return;

  createBtn.addEventListener("click", async (e) => {
    e.stopPropagation();

    try {
      if (!window.createPongRoom) {
        setRoomStatus("Realtime Database functions are not loaded.", "error");
        return;
      }

      const roomCode = await window.createPongRoom();
      STATE.pongRoomCode = roomCode;
      STATE.pongPlayer = "p1";
      STATE.pongOnline = true;
      input.value = roomCode;
      setRoomStatus(`Room ${roomCode} created. Send this code to player 2.`, "success");
    } catch (error) {
      console.error(error);
      setRoomStatus(error.message || "Could not create room.", "error");
    }
  });

  joinBtn.addEventListener("click", async (e) => {
    e.stopPropagation();

    const code = input.value.trim().toUpperCase();
    if (!code) {
      setRoomStatus("Fill in a room code first.", "error");
      return;
    }

    try {
      if (!window.joinPongRoom) {
        setRoomStatus("Realtime Database functions are not loaded.", "error");
        return;
      }

      const roomCode = await window.joinPongRoom(code);
      STATE.pongRoomCode = roomCode;
      STATE.pongPlayer = "p2";
      STATE.pongOnline = true;
      input.value = roomCode;
      setRoomStatus(`Joined room ${roomCode}. Start Pong when player 1 is ready.`, "success");
    } catch (error) {
      console.error(error);
      setRoomStatus(error.message || "Could not join room.", "error");
    }
  });
}

function startOnlinePong() {
  const canvas = document.getElementById("game-canvas");
  const ctx = canvas.getContext("2d");
  const W = canvas.width;
  const H = canvas.height;

  const PW = 10;
  const PH = 65;
  const BALL_R = 7;
  const WIN = 7;
  const roomCode = STATE.pongRoomCode;
  const player = STATE.pongPlayer;
  const isHost = player === "p1";
  const keys = {};

  let room = null;
  let localPaddle = H / 2 - PH / 2;
  let lastWrite = 0;
  let lastBallWrite = 0;
  let lastTime = 0;

  function onKey(e) {
    keys[e.key] = e.type === "keydown";
    if (["ArrowUp", "ArrowDown", "w", "s"].includes(e.key)) e.preventDefault();
  }

  document.addEventListener("keydown", onKey);
  document.addEventListener("keyup", onKey);
  GAME_KEY_CLEANUP.push(() => {
    document.removeEventListener("keydown", onKey);
    document.removeEventListener("keyup", onKey);
  });

  if (typeof STATE.pongRoomUnsubscribe === "function") {
    STATE.pongRoomUnsubscribe();
  }

  if (window.listenPongRoom) {
    STATE.pongRoomUnsubscribe = window.listenPongRoom(roomCode, (data) => {
      room = data;
    });
    GAME_KEY_CLEANUP.push(() => {
      if (typeof STATE.pongRoomUnsubscribe === "function") STATE.pongRoomUnsubscribe();
      STATE.pongRoomUnsubscribe = null;
    });
  }

  function draw() {
    const paddles = room?.paddles || { p1: H / 2 - PH / 2, p2: H / 2 - PH / 2 };
    const ball = room?.ball || { x: W / 2, y: H / 2, vx: 4, vy: 3 };
    const score = room?.score || { p1: 0, p2: 0 };

    ctx.fillStyle = "#000D0F";
    ctx.fillRect(0, 0, W, H);

    ctx.setLineDash([8, 8]);
    ctx.strokeStyle = "rgba(0,245,255,0.15)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(W / 2, 0);
    ctx.lineTo(W / 2, H);
    ctx.stroke();
    ctx.setLineDash([]);

    const drawPaddle = (x, y, color) => {
      ctx.shadowColor = color;
      ctx.shadowBlur = 12;
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.roundRect(x, y, PW, PH, 4);
      ctx.fill();
      ctx.shadowBlur = 0;
    };

    drawPaddle(15, paddles.p1 || 0, player === "p1" ? "#00F5FF" : "#64748B");
    drawPaddle(W - 15 - PW, paddles.p2 || 0, player === "p2" ? "#FF006E" : "#64748B");

    ctx.shadowColor = "#FFFFFF";
    ctx.shadowBlur = 16;
    ctx.fillStyle = "#FFFFFF";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, BALL_R, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    ctx.font = `700 36px 'Orbitron', monospace`;
    ctx.textAlign = "center";
    ctx.fillStyle = "rgba(0,245,255,0.7)";
    ctx.fillText(score.p1 || 0, W / 2 - 60, 45);
    ctx.fillStyle = "rgba(255,0,110,0.7)";
    ctx.fillText(score.p2 || 0, W / 2 + 60, 45);

    ctx.font = `500 10px 'Orbitron', monospace`;
    ctx.fillStyle = "rgba(255,255,255,0.35)";
    ctx.fillText(player === "p1" ? "YOU" : "PLAYER 1", W / 4, H - 10);
    ctx.fillText(player === "p2" ? "YOU" : "PLAYER 2", (3 * W) / 4, H - 10);
  }

  async function hostUpdate(dt, ts) {
    if (!isHost || !room || !window.updatePongBall) return;

    const paddles = room.paddles || { p1: H / 2 - PH / 2, p2: H / 2 - PH / 2 };
    const score = room.score || { p1: 0, p2: 0 };
    let ball = room.ball || { x: W / 2, y: H / 2, vx: 4, vy: 3 };

    ball = { ...ball };
    ball.x += ball.vx * dt;
    ball.y += ball.vy * dt;

    if (ball.y - BALL_R < 0) {
      ball.y = BALL_R;
      ball.vy = Math.abs(ball.vy);
    }

    if (ball.y + BALL_R > H) {
      ball.y = H - BALL_R;
      ball.vy = -Math.abs(ball.vy);
    }

    if (ball.x - BALL_R < 25 + PW && ball.x - BALL_R > 15 && ball.y > paddles.p1 && ball.y < paddles.p1 + PH) {
      ball.vx = Math.abs(ball.vx) * 1.03;
      ball.vy = ((ball.y - (paddles.p1 + PH / 2)) / (PH / 2)) * 5;
      ball.x = 25 + PW;
    }

    if (ball.x + BALL_R > W - 25 - PW && ball.x + BALL_R < W - 15 && ball.y > paddles.p2 && ball.y < paddles.p2 + PH) {
      ball.vx = -Math.abs(ball.vx) * 1.03;
      ball.vy = ((ball.y - (paddles.p2 + PH / 2)) / (PH / 2)) * 5;
      ball.x = W - 25 - PW;
    }

    if (ball.x < -30) {
      score.p2 = (score.p2 || 0) + 1;
      ball = { x: W / 2, y: H / 2, vx: -4, vy: 3 };
    }

    if (ball.x > W + 30) {
      score.p1 = (score.p1 || 0) + 1;
      ball = { x: W / 2, y: H / 2, vx: 4, vy: -3 };
    }

    if ((score.p1 || 0) >= WIN || (score.p2 || 0) >= WIN) {
      const myScore = player === "p1" ? score.p1 : score.p2;
      onGameOver(myScore || 0, 1);
      return;
    }

    if (ts - lastBallWrite > 55) {
      lastBallWrite = ts;
      await window.updatePongBall(roomCode, ball, score);
    }
  }

  async function tick(ts) {
    if (!STATE.gameRunning) return;
    if (!lastTime) lastTime = ts;
    const dt = Math.min((ts - lastTime) / 16.67, 2);
    lastTime = ts;

    if (keys["w"] || keys["ArrowUp"]) localPaddle = Math.max(0, localPaddle - 7 * dt);
    if (keys["s"] || keys["ArrowDown"]) localPaddle = Math.min(H - PH, localPaddle + 7 * dt);

    if (window.updatePongPaddle && ts - lastWrite > 45) {
      lastWrite = ts;
      await window.updatePongPaddle(roomCode, player, localPaddle);
    }

    await hostUpdate(dt, ts);
    draw();
    STATE.rafId = requestAnimationFrame(tick);
  }

  setRoomStatus(`Online Pong started as ${player.toUpperCase()} in room ${roomCode}.`, "success");
  setHUD(0, STATE.bestScores.pong, 1);
  draw();
  STATE.rafId = requestAnimationFrame(tick);
}

const LEADERBOARD_GAMES = [
  "snake",
  "tetris",
  "breakout",
  "pong",
  "flappy",
  "asteroids",
  "fruit",
];

function buildLeaderboardTabs() {
  const tabs = document.getElementById("leaderboard-tabs");
  if (!tabs) return;

  tabs.innerHTML = LEADERBOARD_GAMES.map((gameId, index) => {
    const game = GAMES.find((g) => g.id === gameId);

    return `
      <button 
        class="leaderboard-tab ${index === 0 ? "active" : ""}" 
        data-game="${gameId}"
      >
        ${game ? game.title : gameId}
      </button>
    `;
  }).join("");

  tabs.addEventListener("click", (e) => {
    const btn = e.target.closest(".leaderboard-tab");
    if (!btn) return;

    document
      .querySelectorAll(".leaderboard-tab")
      .forEach((b) => b.classList.remove("active"));

    btn.classList.add("active");

    loadLeaderboard(btn.dataset.game);
  });

  loadLeaderboard("snake");
}

async function loadLeaderboard(gameId) {
  const list = document.getElementById("leaderboard-list");
  if (!list) return;

  list.innerHTML = `<div class="leaderboard-empty">Loading...</div>`;

  if (!window.getLeaderboard) {
    list.innerHTML = `<div class="leaderboard-empty">Firebase leaderboard is not loaded.</div>`;
    return;
  }

  const scores = await window.getLeaderboard(gameId);

  if (!scores.length) {
    list.innerHTML = `<div class="leaderboard-empty">No scores yet.</div>`;
    return;
  }

  list.innerHTML = scores
    .map(
      (row, index) => `
  <div class="leaderboard-row ${index === 0 ? "leaderboard-first" : ""}">
    <span class="leaderboard-rank">${index === 0 ? "🏆 #1" : "#" + (index + 1)}</span>
    <span class="leaderboard-email">${row.email}</span>
    <span class="leaderboard-score">${row.score}</span>
  </div>
`,
    )
    .join("");
}

document.addEventListener("DOMContentLoaded", () => {
  buildLeaderboardTabs();
  setupPongMultiplayerUI();
});

async function showGameOverLeaderboard(gameId) {
  const box = document.getElementById("game-over-leaderboard");
  const list = document.getElementById("game-over-lb-list");

  if (!box || !list || !gameId) return;

  box.classList.add("show");
  list.innerHTML = `<div class="leaderboard-empty">Loading leaderboard...</div>`;

  if (!window.getLeaderboard) {
    list.innerHTML = `<div class="leaderboard-empty">Leaderboard not loaded.</div>`;
    return;
  }

  try {
    const scores = await window.getLeaderboard(gameId);

    if (!scores.length) {
      list.innerHTML = `<div class="leaderboard-empty">No scores yet.</div>`;
      return;
    }

    list.innerHTML = scores
      .map((row, index) => {
        const isCurrentUser = window.currentUser && row.uid === window.currentUser.uid;
        return `
          <div class="game-over-lb-row ${index === 0 ? "first" : ""} ${isCurrentUser ? "me" : ""}">
            <span>${index === 0 ? "🏆 #1" : "#" + (index + 1)}</span>
            <span class="game-over-lb-email">${row.email || "Unknown player"}</span>
            <span>${row.score}</span>
          </div>
        `;
      })
      .join("");
  } catch (error) {
    console.error("Leaderboard load failed:", error);
    list.innerHTML = `<div class="leaderboard-empty">Could not load leaderboard.</div>`;
  }
}

function hideGameOverLeaderboard() {
  const box = document.getElementById("game-over-leaderboard");
  if (box) box.classList.remove("show");
}
