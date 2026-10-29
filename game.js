(() => {
  "use strict";

  const canvas = document.getElementById("gameCanvas");
  // The board is drawn into this offscreen scene at whatever resolution the
  // quality setting asks for, then blitted once into the visible canvas at its
  // exact device resolution. Letting CSS stretch a smaller canvas instead is
  // what puts a bright one-pixel seam down the middle of the board on iOS: the
  // compositor resamples a bitmap whose size is not a whole multiple of the
  // screen's pixels, and a column comes out doubled. One texture copy per frame
  // removes the whole class of artifact.
  const scene = document.createElement("canvas");
  let ctx = scene.getContext("2d");
  const present = canvas.getContext("2d");
  if (!ctx || !present) return;

  const ui = {
    score: document.getElementById("score"),
    best: document.getElementById("best"),
    balls: document.getElementById("balls"),
    dropNumber: document.getElementById("dropNumber"),
    chainMult: document.getElementById("chainMult"),
    chainFill: document.getElementById("chainFill"),
    chainHits: document.getElementById("chainHits"),
    chainRule: document.getElementById("chainRule"),
    runBallRule: document.getElementById("runBallRule"),
    luckyCard: document.getElementById("luckyCard"),
    luckyText: document.getElementById("luckyText"),
    dropBtn: document.getElementById("dropBtn"),
    autoBtn: document.getElementById("autoBtn"),
    aimHint: document.getElementById("aimHint"),
    resetBtn: document.getElementById("resetBtn"),
    soundBtn: document.getElementById("soundBtn"),
    volumeSlider: document.getElementById("volumeSlider"),
    gameOver: document.getElementById("gameOver"),
    finalChip: document.getElementById("finalBallChip"),
    finalTitle: document.getElementById("finalTitle"),
    finalScore: document.getElementById("finalScore"),
    finalBest: document.getElementById("finalBest"),
    newBest: document.getElementById("newBest"),
    againBtn: document.getElementById("againBtn"),
    overlayVaultBtn: document.getElementById("overlayVaultBtn"),
    runJackpots: document.getElementById("runJackpots"),
    runTokens: document.getElementById("runTokens"),
    runChain: document.getElementById("runChain"),
    shareRunBtn: document.getElementById("shareRunBtn"),
    reportVault: document.getElementById("reportVault"),
    reportVaultFill: document.getElementById("reportVaultFill"),
    reportNext: document.getElementById("reportNext"),
    announcer: document.getElementById("announcer"),
    gameToast: document.getElementById("gameToast"),
    qualityBtn: document.getElementById("qualityBtn"),
    qualityLabel: document.getElementById("qualityLabel"),
    overlayKicker: document.getElementById("overlayKicker"),
    potStrip: document.getElementById("potStrip"),
    potCount: document.getElementById("potCount"),
    bankBtn: document.getElementById("bankBtn"),
    plungeBtn: document.getElementById("plungeBtn"),
    bankOverlayBtn: document.getElementById("bankOverlayBtn"),
    overflowNote: document.getElementById("overflowNote"),
    overflowMeta: document.getElementById("overflowMeta"),
    plungeCount: document.getElementById("plungeCount"),
    overflowUnit: document.getElementById("overflowUnit")
  };

  const W = 760;
  const H = 1060;
  const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const FRAME = { x: 10, y: 10, w: 740, h: 1040, r: 38 };
  const GLASS = { x: 32, y: 76, w: 696, h: 950, r: 27 };
  const PLAY = { left: 58, right: 702, top: 136, bottom: 1014 };
  // The pin grid is built on this centre line, so mirrored pieces stay mirrored.
  const CENTER_X = 380;
  const SLOT_TOP = 900;
  const SLOT_BOTTOM = 1014;
  const GRAVITY = 1850;
  const STEP = 1 / 240;
  const BALL_R = 8.6;
  const MAX_SPEED = 1680;
  const DIVIDER_R = 4.2;
  const STARTING_BALLS = 12;
  const AUTO_DROP_KEY = "nova-pachinko-auto-v1";
  const AUTO_DROP_MS = 190;
  const AUTO_SWEEP_SECONDS = 2.3;

  // Board heat. A lucky bumper is worth 11 heat and a plain pin about half a
  // point, so a run that keeps finding the gold studs heats up every couple of
  // balls while a slow one never gets there. Heat bleeds off on its own, which
  // is what makes the full bar feel like something the player did.
  const HEAT_MAX = 100;
  const HEAT_PER_BUMPER = 11;
  const HEAT_PER_PIN = 0.45;
  const HEAT_DECAY = 3.6;
  const HOT_SECONDS = 9;
  // Three plunges is enough to double a pot twice at best. Any more and a good
  // run turns into a payout machine instead of a moment.
  const PLUNGE_BALLS = 3;

  // The wheel owns the real rarity list; the board only needs the ordering, to
  // put the best thing a run pulled at the top of its card.
  const RARITY_RANK = { common: 0, rare: 1, epic: 2, legendary: 3, mythic: 4 };
  const DEFAULT_BONUSES = {
    startingBalls: 0,
    chainStep: 5,
    goldPinChain: 2,
    luckyEvery: 5,
    scoreMult: 1,
    bonusBallExtra: 0,
    bonusSlotScoreMult: 1,
    tokenBonus: 0
  };
  let loadoutBonuses = { ...DEFAULT_BONUSES };
  let bonuses = { ...DEFAULT_BONUSES };

  const C = {
    ink: "#fff3dc",
    cream: "#dcd1e7",
    muted: "#777fa8",
    cyan: "#4df5dd",
    coral: "#ff6677",
    gold: "#ffc75f",
    violet: "#ad86ff",
    glassA: "#080d1b",
    glassB: "#101934",
    frameA: "#20213d",
    frameB: "#080b17"
  };

  const SLOT_DEFS = [
    { w: 98, value: 100, label: "100", sub: "PTS", color: "#56d9ff" },
    { w: 96, value: 150, label: "+1", sub: "BALL", color: "#ad86ff", bonus: 1 },
    { w: 94, value: 500, label: "500", sub: "PTS", color: "#ff7180" },
    { w: 68, value: 2500, label: "2500", sub: "JACKPOT", color: "#ffc75f", jackpot: true },
    { w: 94, value: 500, label: "500", sub: "PTS", color: "#ff7180" },
    { w: 96, value: 150, label: "+1", sub: "BALL", color: "#ad86ff", bonus: 1 },
    { w: 98, value: 100, label: "100", sub: "PTS", color: "#56d9ff" }
  ];

  const slots = [];
  {
    let x = PLAY.left;
    for (let i = 0; i < SLOT_DEFS.length; i++) {
      const def = SLOT_DEFS[i];
      slots.push({
        ...def,
        x,
        index: i,
        center: x + def.w / 2,
        flash: 0
      });
      x += def.w;
    }
  }

  const slotDividers = slots.slice(1).map((slot) => ({
    x: slot.x,
    y1: SLOT_TOP - 6,
    y2: SLOT_BOTTOM
  }));
  const JACKPOT_SLOT = slots.find((slot) => slot.jackpot);

  const pins = buildPins();
  const stars = buildStars();
  shuffleGoldPins();

  const state = {
    status: "ready",
    started: false,
    runStats: { jackpots: 0, tokensEarned: 0, bestChain: 0 },
    score: 0,
    best: loadNumber("nova-pachinko-best-v1", 0),
    runBestStart: 0,
    ballsLeft: STARTING_BALLS,
    dropCount: 0,
    activeBalls: [],
    particles: [],
    floats: [],
    aimX: W / 2,
    lastDropAt: -9999,
    lastPinSound: 0,
    lastBumperSound: 0,
    time: 0,
    slowMo: 0,
    // 0..1 cinematic slow-motion for the last ball of a run.
    cinema: 0,
    cinemaFocus: null,
    cinemaFired: false,
    // The scene plays once per run, even if a bonus ball extends the run.
    finalBallDone: false,
    // The ball this run's scene belongs to, so it keeps playing to the landing.
    sceneBall: null,
    tensionBall: null,
    flash: 0,
    flashColor: C.gold,
    overTimer: 0,
    auto: loadBoolean(AUTO_DROP_KEY, false),
    autoTimer: 0,
    autoPhase: 0,
    muted: loadBoolean("nova-pachinko-muted-v1", false),
    // Jackpot tokens collect here instead of the wallet. Banking is allowed at
    // any moment, so the pot is never at risk; a plunge only ever decides how
    // much bigger it gets.
    pot: 0,
    // Everything the wheel handed over during this run, for the run card.
    runLoot: [],
    overflow: { active: false, resolved: false, hit: false, plunges: PLUNGE_BALLS },
    heat: 0,
    hot: false,
    hotTimer: 0,
    // True while the ball in play is the overflow plunge, which gets a deeper
    // cinema and its own tension cue.
    plungeScene: false
  };
  state.runBestStart = state.best;

  let audioCtx = null;
  let audioBus = null;
  let noiseBuffer = null;
  let roomBed = null;
  let roomChimeTimer = 0;
  let tensionVoice = null;
  let tensionTimer = 0;
  // The vault's room tone sits at this level whenever nothing is ducking it.
  const ROOM_BED_LEVEL = 0.0105;
  let spinTickCount = 0;
  let backingScale = 0;
  let scaleCap = 0;
  // Canvas text is measured in board units, and the board is drawn about half
  // size on a phone, so the same 10px label lands at 5 CSS pixels there. This
  // factor keeps the labels at a readable on-screen size instead: 1 on a
  // desktop-sized board, up to 2 on a phone.
  let boardTypeScale = 1;
  // 0 = auto (adapts), 1 = high (always full scale), 2 = low (always reduced).
  const QUALITY_KEY = "nova-pachinko-quality-v1";
  let qualityMode = clamp(loadNumber(QUALITY_KEY, 0), 0, 2);
  // 1 = the tuned mix. The slider goes to 1.5 so the layers can be inspected
  // by ear, and down to 0 to silence without flipping mute state.
  const VOLUME_KEY = "nova-pachinko-volume-v1";
  let masterVolume = clamp(loadNumber(VOLUME_KEY, 1), 0, 1.5);
  let quality = qualityMode === 2 ? 0.62 : 1;
  let slowFrames = 0;
  let fastFrames = 0;
  let layerScale = 0;
  let cabinetLayer = null;
  let glassOverlayLayer = null;
  let glassBgGradient = null;
  let glassGlowGradient = null;
  let vignetteGradient = null;
  let scanlinePattern = null;
  let lastFrame = performance.now();
  let accumulator = 0;
  let chainFillWidth = "";
  let scoreBumpTimer = 0;

  bindEvents();
  fitBacking();
  // The visible canvas tracks its own CSS box, not just window resizes: the
  // cabinet's size comes from a clamp() against the viewport and from whether
  // the side panel sits beside or above the board.
  if (window.ResizeObserver) {
    new ResizeObserver(() => fitPresent()).observe(canvas);
  }
  updateSoundButton();
  updateVolumeUi();
  updateQualityUi();
  updateAutoButton();
  updateHud(true);
  requestAnimationFrame(frame);

  function buildPins() {
    const base = [];
    for (let row = 0; row < 10; row++) {
      const y = 232 + row * 57;
      const count = row % 2 === 0 ? 10 : 9;
      const startX = row % 2 === 0 ? 119 : 148;
      for (let i = 0; i < count; i++) {
        base.push({ x: startX + i * 58, y, r: 5.4, gold: false });
      }
    }

    // The large deflectors are always mirrored about the centre line, so the
    // mid-board reads as deliberate instead of lopsided. Which row the pair
    // sits on, and how wide it is spread, is rolled per run: the shape of the
    // board changes between runs while the bottom funnel that guards the
    // jackpot stays put.
    const pairInset = [87, 145][Math.floor(Math.random() * 2)];
    const pairY = [346, 460, 574][Math.floor(Math.random() * 3)];

    const specials = [
      { x: CENTER_X - pairInset, y: pairY, r: 12.5, gold: false, big: true },
      { x: CENTER_X + pairInset, y: pairY, r: 12.5, gold: false, big: true },
      { x: CENTER_X, y: 686, r: 13, gold: false, big: true },
      { x: CENTER_X, y: 835, r: 11.5, gold: false, big: true },
      { x: CENTER_X - 132, y: 790, r: 8.5, gold: false },
      { x: CENTER_X + 132, y: 790, r: 8.5, gold: false }
    ];

    const filtered = base.filter((pin) => {
      return specials.every((special) => {
        const dx = pin.x - special.x;
        const dy = pin.y - special.y;
        return Math.hypot(dx, dy) > special.r + pin.r + 12;
      });
    });

    return filtered.concat(specials).map((pin, id) => ({
      ...pin,
      id,
      flash: 0
    }));
  }

  // Rebuilds the whole board for a fresh run: the big deflectors move into a
  // new mirrored arrangement and the lucky pins are rolled again.
  function rebuildPins() {
    const next = buildPins();
    pins.length = 0;
    for (const pin of next) pins.push(pin);
    shuffleGoldPins();
  }

  // The lucky pins are worth extra chain and they launch balls, so where they
  // sit matters. Rather than stamping the same four spots every run, each run
  // rolls the mirrored pair plus two regular pins from the field.
  function shuffleGoldPins() {
    const pair = [];
    const small = [];
    for (const pin of pins) {
      pin.gold = false;
      if (!pin.big) small.push(pin);
      else if (pin.y < 600) pair.push(pin);
    }

    // The mirrored pair always matches: two lucky studs facing each other read
    // as a design choice, while one gold and one plain looks like an error.
    //
    // The two guards above the jackpot are deliberately never lucky. They are
    // the funnel, and a bumper there would fire balls away from the token slot.
    for (const pin of pair) pin.gold = true;
    for (let i = 0; i < 2 && small.length; i++) {
      const index = Math.floor(Math.random() * small.length);
      small[index].gold = true;
      small.splice(index, 1);
    }
  }

  function buildStars() {
    const result = [];
    let seed = 0x4e4f5641;
    const random = () => {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      return seed / 4294967296;
    };
    for (let i = 0; i < 64; i++) {
      result.push({
        x: 48 + random() * 664,
        y: 86 + random() * 922,
        r: 0.35 + random() * 1.1,
        a: 0.06 + random() * 0.18,
        twinkle: random() * Math.PI * 2,
        speed: 0.4 + random() * 1.3
      });
    }
    return result;
  }

  function bindEvents() {
    window.addEventListener("resize", fitBacking);

    window.addEventListener("keydown", (event) => {
      if (window.NovaWheel && window.NovaWheel.isOpen()) {
        if (!event.repeat && event.key.toLowerCase() === "m") {
          event.preventDefault();
          toggleSound();
        }
        return;
      }

      if (event.repeat || event.ctrlKey || event.metaKey || event.altKey) return;
      const key = event.key.toLowerCase();
      if (event.code === "Space") {
        const target = event.target;
        if (target instanceof Element && target.closest("button")) return;
        event.preventDefault();
        dropBall();
      } else if (key === "r") {
        event.preventDefault();
        resetGame();
      } else if (key === "m") {
        event.preventDefault();
        toggleSound();
      } else if (key === "a") {
        event.preventDefault();
        setAuto(!state.auto);
      } else if (key === "q") {
        event.preventDefault();
        setQualityMode((qualityMode + 1) % 3);
      } else if (key === "b") {
        // B banks. It is the only key that can spend nothing and save something.
        event.preventDefault();
        if (state.pot > 0) {
          const amount = bankPot("banked");
          ui.announcer.textContent = `Banked ${amount} token${amount === 1 ? "" : "s"}.`;
        }
      }
    });

    canvas.addEventListener("pointermove", (event) => {
      // Auto drop owns the aim while it sweeps; the pointer would fight it.
      if (state.auto) return;
      const point = boardPoint(event);
      setAimFromPoint(point);
    });

    canvas.addEventListener("pointerdown", (event) => {
      if (event.pointerType === "mouse" && event.button !== 0) return;
      event.preventDefault();
      const point = boardPoint(event);
      setAimFromPoint(point);
      ensureAudio();
      dropBall();
    });

    canvas.addEventListener("contextmenu", (event) => event.preventDefault());

    ui.dropBtn.addEventListener("click", () => {
      ensureAudio();
      dropBall();
      ui.dropBtn.blur();
    });

    ui.autoBtn.addEventListener("click", () => {
      setAuto(!state.auto);
      ui.autoBtn.blur();
    });

    ui.resetBtn.addEventListener("click", () => {
      resetGame();
      ui.resetBtn.blur();
    });

    if (ui.qualityBtn) {
      ui.qualityBtn.addEventListener("click", () => {
        setQualityMode((qualityMode + 1) % 3);
        ui.qualityBtn.blur();
      });
    }

    ui.againBtn.addEventListener("click", () => {
      resetGame();
      ui.againBtn.blur();
    });

    ui.overlayVaultBtn.addEventListener("click", () => {
      if (window.NovaWheel) window.NovaWheel.open();
    });

    if (ui.shareRunBtn) {
      ui.shareRunBtn.addEventListener("click", () => {
        if (!window.NovaWheel || typeof window.NovaWheel.shareRun !== "function") return;
        const chainStep = Math.max(2, Math.floor(bonuses.chainStep) || 5);
        window.NovaWheel.shareRun({
          score: state.score,
          best: state.best,
          jackpots: state.runStats.jackpots,
          tokens: state.runStats.tokensEarned,
          chain: Math.min(5, 1 + Math.floor(state.runStats.bestChain / chainStep)),
          // Rarest first: a card with a mythic on it should lead with it.
          loot: [...state.runLoot].sort(
            (a, b) => (RARITY_RANK[b.rarityId] || 0) - (RARITY_RANK[a.rarityId] || 0)
          )
        });
        ui.shareRunBtn.blur();
      });
    }

    if (ui.bankBtn) {
      ui.bankBtn.addEventListener("click", () => {
        const amount = bankPot("banked");
        if (amount > 0) {
          ui.announcer.textContent = `Banked ${amount} token${amount === 1 ? "" : "s"}.`;
        }
        ui.bankBtn.blur();
      });
    }

    if (ui.plungeBtn) {
      ui.plungeBtn.addEventListener("click", () => {
        plunge();
        ui.plungeBtn.blur();
      });
    }

    if (ui.bankOverlayBtn) {
      ui.bankOverlayBtn.addEventListener("click", () => {
        const amount = bankPot("banked");
        if (amount > 0) {
          ui.announcer.textContent = `Banked ${amount} token${amount === 1 ? "" : "s"}.`;
        }
        showRunReport();
        ui.bankOverlayBtn.blur();
      });
    }

    ui.soundBtn.addEventListener("click", () => {
      toggleSound();
      ui.soundBtn.blur();
    });

    if (ui.volumeSlider) {
      ui.volumeSlider.addEventListener("input", () => {
        masterVolume = clamp(Number(ui.volumeSlider.value) / 100, 0, 1.5);
        applyMasterVolume();
        // Touching the slider is a gesture, so it also wakes the audio context
        // and gives feedback straight away instead of on the next drop.
        ensureAudio();
        sfxVolumeBlip();
      });
      ui.volumeSlider.addEventListener("change", () => {
        saveNumber(VOLUME_KEY, masterVolume);
      });
    }

    window.addEventListener("nova:sfx", (event) => {
      handleNovaSfx(event.detail);
    });

    // The wheel announces every prize it grants, so the run can carry its own
    // loot into the share card without either module reaching into the other.
    window.addEventListener("nova:item", (event) => {
      const detail = event.detail;
      if (!detail || !detail.id) return;
      state.runLoot.push(detail);
      if (state.runLoot.length > 12) state.runLoot.shift();
    });

    window.addEventListener("nova:collectionchange", (event) => {
      if (ui.gameOver.classList.contains("show")) {
        updateVaultReport(event.detail);
      }
    });

    window.addEventListener("nova:loadoutchange", (event) => {
      applyLoadoutBonuses(event.detail);
    });

    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        lastFrame = performance.now();
        accumulator = 0;
      }
    });
  }

  function boardPoint(event) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: ((event.clientX - rect.left) / rect.width) * W,
      y: ((event.clientY - rect.top) / rect.height) * H
    };
  }

  function setAimFromPoint(point) {
    if (state.status === "over") return;
    const margin = BALL_R + 10;
    state.aimX = clamp(point.x, PLAY.left + margin, PLAY.right - margin);
  }

  // Phones report DPR 3. Drawing a 3x backing store means four times the pixels
  // for detail nobody can see on a 6-inch screen, which is exactly where mobile
  // GPUs start dropping frames. The cap is the visual budget; `quality` is the
  // runtime escape hatch that drops resolution further if frames stay slow.
  function deviceScaleCap() {
    const dpr = window.devicePixelRatio || 1;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    return clamp(coarse ? Math.min(dpr, 1.75) : Math.min(dpr, 2), 1, 2);
  }

  function fitBacking() {
    scaleCap = deviceScaleCap();
    const next = clamp(scaleCap * quality, 0.55, scaleCap);
    if (Math.abs(next - backingScale) > 0.002) {
      backingScale = next;
      scene.width = Math.round(W * next);
      scene.height = Math.round(H * next);
      // Cached layers and gradients are baked at the old scale.
      layerScale = 0;
      glassOverlayLayer = null;
      glassBgGradient = null;
      glassGlowGradient = null;
      vignetteGradient = null;
      scanlinePattern = null;
    }
    ctx.setTransform(backingScale, 0, 0, backingScale, 0, 0);
    fitPresent();
  }

  // The visible canvas is always exactly its CSS box at device resolution, so
  // the browser has nothing to resample: the only scaling left is the one blit
  // below, which we control.
  function fitPresent() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const width = Math.round((rect.width > 4 ? rect.width : W) * dpr);
    const height = Math.round((rect.height > 4 ? rect.height : H) * dpr);
    if (canvas.width !== width || canvas.height !== height) {
      canvas.width = width;
      canvas.height = height;
    }
    // 0.92 CSS px per board unit is the desktop board these sizes were drawn
    // for, so a smaller board scales the type up to keep the same read.
    boardTypeScale = clamp(0.92 / ((rect.width > 4 ? rect.width : W) / W), 1, 2);
  }

  function updateQualityUi() {
    if (!ui.qualityBtn || !ui.qualityLabel) return;
    const names = ["AUTO", "HIGH", "LOW"];
    ui.qualityLabel.textContent = names[qualityMode];
    ui.qualityBtn.classList.toggle("low", qualityMode === 2);
    ui.qualityBtn.setAttribute(
      "aria-label",
      `Render resolution: ${names[qualityMode].toLowerCase()}. Activate to change.`
    );
  }

  // Rolling frame budget: drop resolution when frames run long, creep back up
  // when there is headroom again. This is what keeps a slow phone smooth rather
  // than pretty-but-janky.
  function trackQuality(rawMs) {
    if (qualityMode !== 0) return;
    if (!(rawMs > 0) || rawMs > 300) return;

    if (rawMs > 21) {
      slowFrames += 1;
      fastFrames = 0;
    } else if (rawMs < 12.6) {
      fastFrames += 1;
      if (slowFrames > 0) slowFrames -= 1;
    } else {
      slowFrames = Math.max(0, slowFrames - 1);
      fastFrames = 0;
    }

    if (slowFrames >= 30 && quality > 0.64) {
      quality = Math.max(0.64, quality - 0.16);
      slowFrames = 0;
      fitBacking();
    } else if (fastFrames >= 240 && quality < 1) {
      quality = Math.min(1, quality + 0.1);
      fastFrames = 0;
      fitBacking();
    }
  }

  // Manual override for machines where the automatic guess is wrong. Q cycles
  // AUTO -> HIGH -> LOW and the choice is remembered.
  function setQualityMode(mode) {
    qualityMode = clamp(mode, 0, 2);
    saveNumber(QUALITY_KEY, qualityMode);
    quality = qualityMode === 2 ? 0.62 : 1;
    slowFrames = 0;
    fastFrames = 0;
    fitBacking();
    updateQualityUi();
    showGameToast(`RESOLUTION · ${["AUTO", "HIGH", "LOW"][qualityMode]}`);
  }

  let toastTimer = 0;

  function showGameToast(message) {
    if (!ui.gameToast) return;
    ui.gameToast.textContent = message;
    ui.gameToast.classList.remove("gold", "mythic");
    ui.gameToast.classList.add("show");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      ui.gameToast.classList.remove("show");
    }, 1600);
  }

  // The cabinet, the glass glare and the trim never change between frames, so
  // they are baked once into two layers: one behind the playfield, one on top.
  function buildCabinetLayers() {
    if (cabinetLayer && layerScale === backingScale) return;
    layerScale = backingScale;

    cabinetLayer = renderToLayer(W, H, () => {
      drawCabinetBase();
      drawGlassBackdrop();
      drawGlassOverlay();
      drawCabinetDetails();
    });
  }

  // Scanlines and the vignette are static too: pre-composite them into one
  // glass-sized sprite so they cost a single blit instead of four full fills.
  function buildGlassOverlayLayer() {
    glassOverlayLayer = renderToLayer(GLASS.w, GLASS.h, () => {
      ctx.translate(-GLASS.x, -GLASS.y);
      ctx.save();
      roundPath(GLASS.x, GLASS.y, GLASS.w, GLASS.h, GLASS.r);
      ctx.clip();
      scanlinePattern = null;
      drawScanlines();
      drawVignette();
      ctx.restore();
    });
  }

  function renderToLayer(width, height, paint) {
    const layer = document.createElement("canvas");
    layer.width = Math.max(1, Math.round(width * backingScale));
    layer.height = Math.max(1, Math.round(height * backingScale));
    const target = layer.getContext("2d");
    const previous = ctx;
    ctx = target;
    ctx.setTransform(backingScale, 0, 0, backingScale, 0, 0);
    paint();
    ctx = previous;
    return layer;
  }

  function frame(now) {
    if (window.NovaWheel && window.NovaWheel.isOpen()) {
      lastFrame = now;
      accumulator = 0;
      requestAnimationFrame(frame);
      return;
    }

    trackQuality(now - lastFrame);
    const dt = clamp((now - lastFrame) / 1000, 0, 0.05);
    updateCinema(dt);
    const slowMotion = state.slowMo > 0;
    // The last ball of a run gets a much deeper slow motion than a jackpot
    // tease, and the two never stack into a freeze.
    let timeScale = slowMotion ? 0.34 : 1;
    if (state.cinema > 0.01) {
      // The plunge goes deeper than a last ball: eight times slower at the rail
      // rather than five, which is what makes the wait feel like a slot machine.
      const depth = state.plungeScene ? 0.88 : 0.82;
      timeScale = Math.min(timeScale, 1 - depth * state.cinema);
    }

    lastFrame = now;
    accumulator += dt * timeScale;

    let steps = 0;
    while (accumulator >= STEP && steps < 14) {
      stepPhysics(STEP);
      accumulator -= STEP;
      steps++;
    }
    if (steps === 14) accumulator = 0;

    updateEffects(dt * (slowMotion ? 0.55 : 1) * (1 - 0.45 * state.cinema));
    updateHeat(dt);
    updateAutoAim(dt);
    if (slowMotion) state.slowMo = Math.max(0, state.slowMo - dt);
    updateHud(false);
    render(dt);
    requestAnimationFrame(frame);
  }

  // The last ball of a run is the payoff moment, so the game leans in: the
  // camera pushes towards the ball, time stretches out, the HUD calls it, and
  // the room gets a low swell. It only starts once the ball is through the pin
  // field, so a normal drop is untouched.
  function updateCinema(dt) {
    const balls = state.activeBalls;
    let target = 0;
    // A plunge is the same scene with the volume turned up: it starts higher up
    // the board, so the machine leans in for longer before the ball lands.
    const sceneTop = state.plungeScene ? 560 : 630;
    const sceneSpan = state.plungeScene ? 260 : 230;

    // A scene already in progress keeps running until its ball lands. Latching
    // the run must never cut the scene short — that was the bug that made the
    // last ball barely slow down.
    if (state.sceneBall) {
      const ball = state.sceneBall;
      if (
        state.status === "playing" &&
        !ball.captured &&
        balls.indexOf(ball) >= 0
      ) {
        target = clamp((ball.y - sceneTop) / sceneSpan, 0, 1);
        if (target > 0) state.cinemaFocus = { x: ball.x, y: ball.y - 26 };
      } else {
        state.sceneBall = null;
      }
    }

    // One scene per run: a bonus ball that extends the round must not start a
    // second one for a later "last ball".
    if (
      target === 0 &&
      !state.sceneBall &&
      !state.finalBallDone &&
      state.status === "playing" &&
      state.ballsLeft === 0 &&
      balls.length === 1 &&
      !balls[0].captured
    ) {
      const ball = balls[0];
      const ramp = clamp((ball.y - sceneTop) / sceneSpan, 0, 1);
      if (ramp > 0) {
        state.sceneBall = ball;
        state.finalBallDone = true;
        state.cinemaFocus = { x: ball.x, y: ball.y - 26 };
        target = ramp;
      }
    }

    if (REDUCED_MOTION) target = 0;

    state.cinema += (target - state.cinema) * clamp(dt * 2.8, 0, 1);
    if (state.cinema < 0.004) {
      state.cinema = 0;
      state.cinemaFocus = null;
    }

    if (state.cinema > 0.32 && !state.cinemaFired) {
      state.cinemaFired = true;
      if (state.plungeScene) sfxPlungeTension();
      else sfxFinalBall();
      haptic(18);
    }

    if (ui.finalChip) {
      const on = state.cinema > 0.22;
      if (ui.finalChip.dataset.on !== String(on)) {
        ui.finalChip.dataset.on = String(on);
        ui.finalChip.classList.toggle("on", on);
      }
    }
  }

  function stepPhysics(dt) {
    const balls = state.activeBalls;

    for (let i = 0; i < balls.length; i++) {
      const ball = balls[i];
      ball.age += dt;

      if (ball.captured) {
        ball.captureAge += dt;
        ball.vy += GRAVITY * 0.8 * dt;
        ball.x += ball.vx * dt;
        ball.y += ball.vy * dt;
        ball.alpha = clamp(1 - Math.max(0, ball.captureAge - 0.16) * 1.8, 0, 1);
        continue;
      }

      ball.vy += GRAVITY * dt;
      ball.vx *= 1 - 0.045 * dt;
      ball.vy *= 1 - 0.018 * dt;

      ball.x += ball.vx * dt;
      ball.y += ball.vy * dt;

      // Sample the trail every third step: the solver runs at 240 Hz, which is
      // far more detail than a display can show, and this cuts the per-second
      // allocations (and the number of trail circles drawn) by two thirds.
      ball.trailPhase = (ball.trailPhase || 0) + 1;
      if (ball.trailPhase % 3 === 0) {
        ball.trail.push({ x: ball.x, y: ball.y });
        if (ball.trail.length > 12) ball.trail.shift();
      }

      const speed = Math.hypot(ball.vx, ball.vy);
      if (speed > MAX_SPEED) {
        const scale = MAX_SPEED / speed;
        ball.vx *= scale;
        ball.vy *= scale;
      }

      if (ball.x - ball.r < PLAY.left) {
        ball.x = PLAY.left + ball.r;
        if (ball.vx < 0) ball.vx = -ball.vx * 0.5;
      } else if (ball.x + ball.r > PLAY.right) {
        ball.x = PLAY.right - ball.r;
        if (ball.vx > 0) ball.vx = -ball.vx * 0.5;
      }

      if (ball.y - ball.r < PLAY.top) {
        ball.y = PLAY.top + ball.r;
        if (ball.vy < 0) ball.vy = -ball.vy * 0.22;
      }

      for (let p = 0; p < pins.length; p++) {
        resolvePin(ball, pins[p]);
      }

      for (let d = 0; d < slotDividers.length; d++) {
        const divider = slotDividers[d];
        resolveCapsule(
          ball,
          divider.x,
          divider.y1,
          divider.x,
          divider.y2,
          DIVIDER_R,
          0.42
        );
      }

      if (
        !ball.captured &&
        !ball.jackpotTension &&
        ball.vy > 35 &&
        ball.y > SLOT_TOP - 44 &&
        ball.y < SLOT_TOP + 24 &&
        ball.x > JACKPOT_SLOT.x + 8 &&
        ball.x < JACKPOT_SLOT.x + JACKPOT_SLOT.w - 8
      ) {
        ball.jackpotTension = true;
        if (!REDUCED_MOTION) {
          state.slowMo = Math.max(state.slowMo, 0.95);
          state.tensionBall = ball;
        }
        sfxTension();
        haptic(14);
      }

      if (ball.y > SLOT_TOP + 51) {
        const slot = slotAt(ball.x);
        if (slot) captureBall(ball, slot);
      } else if (ball.y + ball.r > PLAY.bottom) {
        ball.y = PLAY.bottom - ball.r;
        if (ball.vy > 0) ball.vy = -ball.vy * 0.2;
      }

      const currentSpeed = Math.hypot(ball.vx, ball.vy);
      if (ball.y < SLOT_TOP - 20 && currentSpeed < 24) {
        ball.slowTime += dt;
        if (ball.slowTime > 1.05) {
          ball.vx += (Math.random() < 0.5 ? -1 : 1) * (58 + Math.random() * 72);
          ball.vy -= 52 + Math.random() * 48;
          ball.slowTime = 0;
        }
      } else {
        ball.slowTime = Math.max(0, ball.slowTime - dt * 2);
      }

      if (ball.age > 32 && !ball.captured) {
        ball.vy += 180 * dt;
      }
    }

    resolveBallPairs();

    state.activeBalls = balls.filter((ball) => {
      if (!ball.captured) return true;
      return ball.alpha > 0.02 && ball.captureAge < 1.25 && ball.y < PLAY.bottom + 30;
    });

    if (
      state.started &&
      state.status === "playing" &&
      state.ballsLeft <= 0 &&
      state.activeBalls.length === 0
    ) {
      endRun();
    }
  }

  function resolvePin(ball, pin) {
    const dx = ball.x - pin.x;
    const dy = ball.y - pin.y;
    const minDist = ball.r + pin.r;
    const distSq = dx * dx + dy * dy;

    if (distSq >= minDist * minDist) return;

    const dist = Math.sqrt(distSq) || 0.0001;
    const nx = dx / dist;
    const ny = dy / dist;
    const overlap = minDist - dist + 0.02;

    ball.x += nx * overlap;
    ball.y += ny * overlap;

    const normalSpeed = ball.vx * nx + ball.vy * ny;
    if (normalSpeed >= 0) return;

    const impact = -normalSpeed;
    const restitution = pin.gold ? 0.7 : 0.59;
    const impulse = -(1 + restitution) * normalSpeed;

    ball.vx += nx * impulse;
    ball.vy += ny * impulse;

    const tx = -ny;
    const ty = nx;
    const tangentSpeed = ball.vx * tx + ball.vy * ty;
    const tangentLoss = pin.gold ? 0.07 : 0.045;
    ball.vx -= tx * tangentSpeed * tangentLoss;
    ball.vy -= ty * tangentSpeed * tangentLoss;

    ball.vx += (Math.random() - 0.5) * 14;
    ball.vy += (Math.random() - 0.5) * 4;

    if (pin.gold) {
      // A lucky pin is a bumper, not a bouncier pin. However fast the ball was
      // travelling, it leaves fast: the launch speed is set outright instead of
      // added to the bounce, which is the difference between "that felt like a
      // nudge" and "that pin just fired my ball across the board".
      const speedIn = Math.hypot(ball.vx, ball.vy);
      // A hot board kicks harder, which pairs with the extra token: the payout
      // rail is one bounce closer for the whole hot window.
      const kick = state.hot ? 1.14 : 1;
      const launch = clamp((820 + impact * 0.85) * kick, 820, 1560);
      const target = Math.max(launch, speedIn * 0.92);

      // Launch it down-field, never back up: a ball fired upward spends its
      // energy flying against gravity, and the board reads better when a lucky
      // pin punches the ball towards the payout rail.
      let dirX = nx;
      let dirY = Math.max(ny, 0.18);
      if (ny < -0.35) {
        // The ball is sitting on top of the pin. Firing it straight back up
        // would let it hover there, so it is smacked down and out instead —
        // towards the side it is already leaning to, or a coin flip.
        const side = Math.abs(nx) > 0.08 ? Math.sign(nx) : Math.random() < 0.5 ? -1 : 1;
        dirX = side;
        dirY = 0.5;
      }

      const len = Math.hypot(dirX, dirY) || 1;
      ball.vx = (dirX / len) * target;
      ball.vy = (dirY / len) * target;
      pin.flash = 1;

      const kickedAt = performance.now();
      if (impact > 60 && kickedAt - state.lastBumperSound > 55) {
        state.lastBumperSound = kickedAt;
        sfxBumper(impact, target);
        spawnSparks(pin.x, pin.y, C.gold, 9, 1.5);
      }
    }

    ball.slowTime = 0;

    if (impact > 26) {
      pin.flash = Math.max(pin.flash, clamp(impact / 430, 0.18, 1));
      registerPinHit(ball, pin, impact);
    }
  }

  function resolveCapsule(ball, x1, y1, x2, y2, capsuleRadius, restitution) {
    const abx = x2 - x1;
    const aby = y2 - y1;
    const lengthSq = abx * abx + aby * aby;
    let nearestX = x1;
    let nearestY = y1;

    if (lengthSq > 0) {
      const t = clamp(((ball.x - x1) * abx + (ball.y - y1) * aby) / lengthSq, 0, 1);
      nearestX = x1 + abx * t;
      nearestY = y1 + aby * t;
    }

    const dx = ball.x - nearestX;
    const dy = ball.y - nearestY;
    const minDist = ball.r + capsuleRadius;
    const distSq = dx * dx + dy * dy;

    if (distSq >= minDist * minDist) return;

    const dist = Math.sqrt(distSq) || 0.0001;
    const nx = dx / dist;
    const ny = dy / dist;
    const overlap = minDist - dist + 0.03;

    ball.x += nx * overlap;
    ball.y += ny * overlap;

    const normalSpeed = ball.vx * nx + ball.vy * ny;
    if (normalSpeed >= 0) return;

    const impulse = -(1 + restitution) * normalSpeed;
    ball.vx += nx * impulse;
    ball.vy += ny * impulse;
    ball.vx += (Math.random() - 0.5) * 3;
    ball.slowTime = 0;
  }

  function resolveBallPairs() {
    const balls = state.activeBalls;
    for (let i = 0; i < balls.length; i++) {
      const a = balls[i];
      if (a.captured) continue;
      for (let j = i + 1; j < balls.length; j++) {
        const b = balls[j];
        if (b.captured) continue;

        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const minDist = a.r + b.r;
        const distSq = dx * dx + dy * dy;
        if (distSq >= minDist * minDist) continue;

        const dist = Math.sqrt(distSq) || 0.0001;
        const nx = dx / dist;
        const ny = dy / dist;
        const overlap = minDist - dist;
        const correction = overlap * 0.5;

        a.x -= nx * correction;
        a.y -= ny * correction;
        b.x += nx * correction;
        b.y += ny * correction;

        const relativeNormal =
          (b.vx - a.vx) * nx +
          (b.vy - a.vy) * ny;

        if (relativeNormal >= 0) continue;

        const impulse = (-(1 + 0.66) * relativeNormal) / 2;
        a.vx -= impulse * nx;
        a.vy -= impulse * ny;
        b.vx += impulse * nx;
        b.vy += impulse * ny;
      }
    }
  }

  function registerPinHit(ball, pin, impact) {
    const now = performance.now();

    if (!ball.hitPegs.has(pin.id)) {
      const previousHits = ball.chainHits;
      ball.hitPegs.add(pin.id);
      ball.chainHits += pin.gold ? bonuses.goldPinChain : 1;
      state.runStats.bestChain = Math.max(state.runStats.bestChain, ball.chainHits);

      const chainStep = Math.max(2, Math.floor(bonuses.chainStep) || 5);
      const previousMultiplier = Math.min(5, 1 + Math.floor(previousHits / chainStep));
      const nextMultiplier = Math.min(5, 1 + Math.floor(ball.chainHits / chainStep));
      if (nextMultiplier > previousMultiplier) {
        addFloatingText(
          ball.x,
          ball.y - 20,
          `CHAIN ×${nextMultiplier}`,
          nextMultiplier >= 4 ? C.gold : C.violet,
          11,
          0.8
        );
        sfxChainUp(nextMultiplier);
        pulseChainHud();
        haptic(8);
      }

      if (pin.gold) {
        spawnSparks(pin.x, pin.y, C.gold, 5, 1.25);
        sfxGoldPin();
        addHeat(HEAT_PER_BUMPER);
      } else {
        addHeat(HEAT_PER_PIN);
      }
    }

    if (impact > 52 && now - state.lastPinSound > 34) {
      state.lastPinSound = now;
      sfxPin(pin.x, impact, ball.chainHits, ball);
    }

    if (impact > 95 && Math.random() < 0.38 && state.particles.length < 260) {
      spawnSparks(
        ball.x,
        ball.y,
        pin.gold ? C.gold : C.cyan,
        2,
        clamp(impact / 500, 0.45, 1)
      );
    }
  }

  function pulseChainHud() {
    const panel = ui.chainMult.closest(".chain-panel");
    if (!panel) return;
    panel.classList.remove("chain-pulse");
    void panel.offsetWidth;
    panel.classList.add("chain-pulse");
    window.setTimeout(() => panel.classList.remove("chain-pulse"), 420);
  }

  function slotAt(x) {
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i];
      if (x >= slot.x && x < slot.x + slot.w) return slot;
    }
    return null;
  }

  function captureBall(ball, slot) {
    if (ball.captured) return;

    ball.captured = true;
    ball.captureAge = 0;
    // The plunge is resolved by the ball that was dropped for it, and by that
    // ball only: a bonus ball that extends the run afterwards must not keep
    // doubling a pot the player already collected.
    const plunging = state.overflow.active;
    if (plunging) {
      state.overflow.active = false;
      state.overflow.resolved = true;
    }
    ball.vx *= 0.22;
    ball.vy = Math.max(ball.vy, 190);
    slot.flash = 1;
    state.slowMo = 0;
    state.tensionBall = null;

    const chainStep = Math.max(2, Math.floor(bonuses.chainStep) || 5);
    const chainMultiplier = Math.min(5, 1 + Math.floor(ball.chainHits / chainStep));
    const luckyMultiplier = ball.gold ? 2 : 1;
    const multiplier = chainMultiplier * luckyMultiplier;
    let points = slot.value * multiplier * bonuses.scoreMult;
    if (slot.bonus) points *= bonuses.bonusSlotScoreMult;
    points = Math.max(1, Math.round(points));

    addScore(points);

    if (slot.bonus) {
      const ballsWon = slot.bonus + bonuses.bonusBallExtra;
      state.ballsLeft += ballsWon;
      bumpElement(ui.balls.parentElement, "bump", 340);
      spawnSparks(slot.center, SLOT_TOP + 20, slot.color, 12, 0.9);
      // Bonus balls are new ammo: keep an auto-drop run honest instead of stalling.
      if (state.auto) scheduleAutoDrop(600);
    }

    addFloatingText(
      slot.center,
      SLOT_TOP - 48 - Math.random() * 5,
      `+${formatScore(points)}`,
      ball.gold ? C.gold : slot.color,
      slot.jackpot ? 30 : 23,
      1.45
    );

    // The chain and the bonus ball share one line. Two separate lines of small
    // print under every payout turned the slot row into a wall of text once the
    // type scaled with the board on a phone.
    const notes = [];
    if (multiplier > 1) {
      notes.push(`×${multiplier}${ball.gold ? " LUCKY" : " CHAIN"}`);
    }
    if (slot.bonus) {
      const extra = slot.bonus + bonuses.bonusBallExtra;
      notes.push(`+${extra} BALL${extra === 1 ? "" : "S"}`);
    }
    if (notes.length) {
      addFloatingText(
        slot.center,
        SLOT_TOP - 22,
        notes.join(" · "),
        multiplier >= 6 || ball.gold ? C.gold : C.violet,
        notes.length > 1 ? 13 : 14,
        1.3
      );
    }

    // The last ball of a run lands in front of the whole room, so it gets its
    // own landing, scaled by what the slot is worth.
    if (state.cinema > 0.2) sfxFinalLanding(slot);

    let minted = 0;
    if (slot.jackpot) {
      state.flash = REDUCED_MOTION ? 0.12 : 0.34;
      state.flashColor = C.gold;
      // A hot board is worth exactly one extra token per jackpot. That is the
      // whole payoff, which keeps the mechanic one sentence long.
      minted = 1 + bonuses.tokenBonus + (state.hot ? 1 : 0);
      state.runStats.jackpots += 1;
      state.runStats.tokensEarned += minted;
      spawnConfetti(slot.center, SLOT_TOP + 8);
      sfxJackpot();
      addToPot(minted, slot);

      if (plunging) {
        // The plunge ball found the jackpot: the whole pot doubles, including
        // the token it just minted.
        state.overflow.hit = true;
        state.pot *= 2;
        updatePotUi();
        state.flash = REDUCED_MOTION ? 0.16 : 0.5;
        addFloatingText(
          slot.center,
          SLOT_TOP - 92,
          `POT ×2 · ${state.pot}`,
          C.gold,
          27,
          1.9
        );
        spawnConfetti(slot.center, SLOT_TOP - 10);
        sfxDoublePot();
      }

      haptic([0, 28, 36, 70]);
    } else if (slot.bonus) {
      state.flash = 0.08;
      state.flashColor = C.violet;
      sfxBonus();
    } else {
      state.flash = Math.max(state.flash, 0.06);
      state.flashColor = slot.color;
      sfxPocket(slot.value);
    }

    if (plunging) {
      state.plungeScene = false;
      if (slot.jackpot) {
        sfxPlungeWin();
      } else {
        // A miss is not a loss, and the sound should say so: the pot pays out
        // either way, so this is a disappointed shrug, not a failure sting.
        sfxPlungeMiss();
        addFloatingText(
          slot.center,
          SLOT_TOP - 74,
          `POT SAFE · ${state.pot}`,
          "#bfe6d8",
          19,
          1.7
        );
      }
    }

    spawnSparks(
      slot.center,
      SLOT_TOP + 24,
      slot.jackpot ? C.gold : slot.color,
      slot.jackpot ? 34 : 12,
      slot.jackpot ? 1.8 : 0.9
    );

    const announcement = `${
      slot.jackpot
        ? `Jackpot! ${minted} Nova Token${minted === 1 ? "" : "s"} into the pot. `
        : ""
    }Ball landed in ${slot.label} for ${formatScore(points)} points. ${state.ballsLeft} ball${
      state.ballsLeft === 1 ? "" : "s"
    } left.`;
    ui.announcer.textContent = announcement;

    updateHud(true);
  }

  function addScore(points) {
    if (points <= 0) return;
    state.score += points;
    if (state.score > state.best) {
      state.best = state.score;
      saveNumber("nova-pachinko-best-v1", state.best);
    }
    bumpElement(ui.score, "bump", 180);
  }

  function bumpElement(element, className, duration) {
    if (!element) return;
    element.classList.remove(className);
    void element.offsetWidth;
    element.classList.add(className);
    window.clearTimeout(className === "bump" && element === ui.score ? scoreBumpTimer : 0);
    const timeout = window.setTimeout(() => element.classList.remove(className), duration);
    if (element === ui.score) scoreBumpTimer = timeout;
  }

  // ---- The pot -------------------------------------------------------------
  // Jackpot tokens are minted into a pot instead of straight into the wallet.
  // Banking is always available and always free, so the pot is a question about
  // greed and never about risk: the worst case is that you keep what you have.
  function addToPot(amount, slot) {
    if (amount <= 0) return;

    state.pot += amount;
    updatePotUi();

    if (ui.potStrip) {
      ui.potStrip.classList.remove("pot-pop");
      void ui.potStrip.offsetWidth;
      ui.potStrip.classList.add("pot-pop");
    }
    if (slot) flyTokenToHud(slot);
    showGameToast(`POT · ${state.pot} TOKEN${state.pot === 1 ? "" : "S"}`);
  }

  function updatePotUi() {
    const has = state.pot > 0;
    if (ui.potStrip) {
      if (ui.potStrip.hidden === has) ui.potStrip.hidden = !has;
      ui.potStrip.setAttribute(
        "aria-label",
        has ? `${state.pot} token${state.pot === 1 ? "" : "s"} in the pot` : "Pot empty"
      );
    }
    if (ui.potCount) setText(ui.potCount, String(state.pot), false);
    if (ui.bankBtn) {
      ui.bankBtn.disabled = !has;
      ui.bankBtn.textContent = has ? `BANK ${state.pot}` : "BANK";
    }
  }

  function bankPot(source) {
    const amount = state.pot;
    if (amount <= 0) return 0;

    state.pot = 0;
    updatePotUi();
    if (window.NovaWheel && typeof window.NovaWheel.awardToken === "function") {
      window.NovaWheel.awardToken(amount, source || "banked");
    }
    return amount;
  }

  // ---- Nova overflow -------------------------------------------------------
  // A run that minted anything ends on a decision instead of a receipt.
  function offerOverflow() {
    state.status = "overflow";
    state.overflow.active = false;
    state.overflow.hit = false;

    ui.gameOver.dataset.mode = "overflow";
    if (ui.overlayKicker) ui.overlayKicker.textContent = "NOVA OVERFLOW";
    if (ui.finalTitle) ui.finalTitle.textContent = "DOUBLE THE POT";
    if (ui.finalScore) ui.finalScore.textContent = String(state.pot);
    if (ui.overflowNote) ui.overflowNote.hidden = false;
    if (ui.overflowMeta) ui.overflowMeta.hidden = false;
    if (ui.plungeCount) {
      ui.plungeCount.textContent = `${state.overflow.plunges} PLUNGE${
        state.overflow.plunges === 1 ? "" : "S"
      } LEFT · A JACKPOT MAKES IT ${state.pot * 2}`;
    }
    if (ui.overflowUnit) ui.overflowUnit.hidden = false;
    if (ui.plungeBtn) {
      ui.plungeBtn.hidden = false;
      ui.plungeBtn.textContent = "PLUNGE";
    }
    if (ui.bankOverlayBtn) {
      ui.bankOverlayBtn.hidden = false;
      ui.bankOverlayBtn.textContent = `BANK ${state.pot}`;
    }
    if (ui.againBtn) ui.againBtn.hidden = true;
    if (ui.overlayVaultBtn) ui.overlayVaultBtn.hidden = true;
    if (ui.shareRunBtn) ui.shareRunBtn.hidden = true;
    if (ui.newBest) ui.newBest.classList.remove("show");

    ui.gameOver.classList.add("show");
    ui.gameOver.setAttribute("aria-hidden", "false");
    updateHud(true);
    sfxOverflowOffer();
    haptic([0, 18, 44, 26]);
    ui.announcer.textContent = `Overflow. ${state.pot} tokens in the pot. Plunge for one more ball, or bank it.`;

    window.clearTimeout(state.overflowFocusTimer);
    state.overflowFocusTimer = window.setTimeout(() => {
      if (state.status === "overflow" && ui.plungeBtn) {
        ui.plungeBtn.focus({ preventScroll: true });
      }
    }, 440);

    // A sweeper is not here to deliberate, but it should still be possible to
    // see what the machine decided, so the auto plunge is slow on purpose.
    if (state.auto) {
      window.clearTimeout(state.overflowAutoTimer);
      state.overflowAutoTimer = window.setTimeout(() => {
        if (state.status === "overflow") plunge();
      }, 1500);
    }
  }

  function plunge() {
    if (state.status !== "overflow") return;

    window.clearTimeout(state.overflowAutoTimer);
    state.overflow.plunges -= 1;
    state.overflow.active = true;
    state.overflow.resolved = false;
    state.overflow.hit = false;
    state.plungeScene = true;
    state.status = "playing";

    ui.gameOver.classList.remove("show");
    ui.gameOver.setAttribute("aria-hidden", "true");

    // The plunge ball is a last ball in every way that matters, so the cinema
    // gets re-armed for it: the slow-motion close-up is the whole point.
    state.finalBallDone = false;
    state.cinemaFired = false;
    state.sceneBall = null;
    state.ballsLeft = 1;
    state.aimX = CENTER_X + (Math.random() - 0.5) * 120;
    if (ui.finalChip) {
      ui.finalChip.classList.remove("on");
      ui.finalChip.dataset.on = "false";
    }

    sfxPlunge();
    ui.announcer.textContent = "Plunge. One ball, aimed by the machine.";
    updateHud(true);

    window.clearTimeout(state.overflowDropTimer);
    state.overflowDropTimer = window.setTimeout(() => {
      if (state.status === "playing" && state.ballsLeft > 0) dropBall();
    }, 520);
  }

  // ---- Board heat ----------------------------------------------------------
  function addHeat(amount) {
    if (state.hot || amount <= 0) return;
    state.heat = Math.min(HEAT_MAX, state.heat + amount);
    if (state.heat >= HEAT_MAX) igniteBoard();
  }

  function igniteBoard() {
    state.hot = true;
    state.hotTimer = HOT_SECONDS;
    state.heat = HEAT_MAX;
    state.flash = Math.max(state.flash, REDUCED_MOTION ? 0.1 : 0.22);
    state.flashColor = C.gold;
    addFloatingText(CENTER_X, 292, "BOARD HOT", C.gold, 25, 1.6);
    addFloatingText(CENTER_X, 318, "+1 TOKEN PER JACKPOT", "#ffe6b8", 11, 1.6);
    spawnSparks(CENTER_X, 320, C.gold, 26, 1.6);
    sfxBoardHot();
    haptic([0, 26, 40, 60]);
    ui.announcer.textContent = `Board hot for ${HOT_SECONDS} seconds. Every jackpot mints one extra token.`;
  }

  function updateHeat(dt) {
    if (state.hot) {
      state.hotTimer = Math.max(0, state.hotTimer - dt);
      if (state.hotTimer <= 0) {
        state.hot = false;
        state.heat = 0;
      }
      return;
    }
    if (state.heat > 0) state.heat = Math.max(0, state.heat - HEAT_DECAY * dt);
    if (state.heat >= HEAT_MAX) igniteBoard();
  }

  function dropBall() {
    if (window.NovaWheel && window.NovaWheel.isOpen()) return;
    if (state.status === "over" || state.status === "ending" || state.status === "overflow") return;
    if (state.ballsLeft <= 0) return;

    const now = performance.now();
    if (now - state.lastDropAt < 105) return;
    state.lastDropAt = now;

    const nextDropNumber = state.dropCount + 1;
    const luckyEvery = Math.max(2, Math.floor(bonuses.luckyEvery) || 5);
    const gold = nextDropNumber % luckyEvery === 0;
    const margin = BALL_R + 12;
    const spawnX = clamp(state.aimX, PLAY.left + margin, PLAY.right - margin);
    const spawnY = PLAY.top + 27;

    const ball = {
      x: spawnX,
      y: spawnY,
      vx: (Math.random() - 0.5) * 28,
      vy: 26,
      r: BALL_R,
      gold,
      voice: Math.floor(Math.random() * 3),
      age: 0,
      slowTime: 0,
      captured: false,
      captureAge: 0,
      alpha: 1,
      jackpotTension: false,
      chainHits: 0,
      hitPegs: new Set(),
      trail: []
    };

    state.ballsLeft--;
    state.dropCount++;
    state.activeBalls.push(ball);
    state.status = "playing";
    state.started = true;

    bumpElement(ui.balls.parentElement, "bump", 300);
    ensureAudio();
    sfxDrop(gold);

    if (gold) {
      spawnSparks(spawnX, spawnY, C.gold, 12, 1.15);
    }

    updateHud(true);
    if (state.auto) scheduleAutoDrop();
  }

  function updateAutoButton() {
    if (!ui.autoBtn) return;
    const label = ui.autoBtn.querySelector("span");
    ui.autoBtn.classList.toggle("active", state.auto);
    ui.autoBtn.setAttribute("aria-pressed", String(state.auto));
    if (label) label.textContent = state.auto ? "ON" : "SWEEP";
    if (ui.aimHint) {
      ui.aimHint.innerHTML = state.auto
        ? "Auto drop <span>·</span> sweeping the board"
        : "Move to aim <span>·</span> click the board to drop";
    }
    ui.autoBtn.title = state.auto
      ? "Auto drop is on — click to stop (A)"
      : "Auto drop every ball (A)";
    ui.autoBtn.setAttribute(
      "aria-label",
      state.auto
        ? "Auto drop is on. Stop dropping balls automatically."
        : "Auto drop every ball."
    );
  }

  function clearAutoTimer() {
    window.clearTimeout(state.autoTimer);
    state.autoTimer = 0;
  }

  // Auto drop aims for you: the chute glides across the board so a burst of
  // balls spreads over every slot instead of stacking in one lane.
  function updateAutoAim(dt) {
    if (!state.auto || state.ballsLeft <= 0) return;
    if (state.status === "over") return;

    state.autoPhase = (state.autoPhase + dt * ((Math.PI * 2) / AUTO_SWEEP_SECONDS)) % (Math.PI * 2);
    // A triangle wave instead of a sine: constant speed, no lingering at the
    // edges, so lanes get an even share of the burst.
    const progress = state.autoPhase / (Math.PI * 2);
    const triangle = 4 * Math.abs(progress - 0.5) - 1;
    const margin = BALL_R + 18;
    const center = (PLAY.left + PLAY.right) / 2;
    const half = Math.max(0, (PLAY.right - margin - (PLAY.left + margin)) / 2);
    state.aimX = center + triangle * half * 0.86;
  }

  function scheduleAutoDrop(delay = AUTO_DROP_MS) {
    clearAutoTimer();
    if (!state.auto || state.ballsLeft <= 0) return;
    state.autoTimer = window.setTimeout(autoDropTick, delay);
  }

  function autoDropTick() {
    state.autoTimer = 0;
    if (!state.auto || state.ballsLeft <= 0) return;

    // The wheel overlay pauses the board; wait it out instead of losing the queue.
    if (window.NovaWheel && window.NovaWheel.isOpen()) {
      scheduleAutoDrop(300);
      return;
    }

    if (state.status === "over" || state.status === "ending") return;
    // The overflow offer owns the next move; the sweeper waits for it instead
    // of queueing a drop the board would refuse.
    if (state.status === "overflow") return;

    dropBall();
    scheduleAutoDrop();
  }

  function setAuto(on) {
    state.auto = Boolean(on);
    saveBoolean(AUTO_DROP_KEY, state.auto);
    updateAutoButton();
    ui.announcer.textContent = state.auto
      ? "Auto drop on. Every ball will drop automatically."
      : "Auto drop off.";

    if (!state.auto) {
      clearAutoTimer();
      return;
    }

    ensureAudio();
    // Begin the sweep from the middle of the board so the first ball cannot
    // inherit wherever the pointer happened to be sitting.
    state.autoPhase = Math.PI / 2;
    updateAutoAim(0);
    if (state.status === "over" || state.status === "ending") {
      resetGame();
      return;
    }
    if (state.status === "ready" || (state.status === "playing" && state.ballsLeft > 0)) {
      dropBall();
      scheduleAutoDrop();
    }
  }

  function endRun() {
    if (state.status !== "playing") return;
    state.status = "ending";
    updateHud(true);

    window.clearTimeout(state.overTimer);
    state.overTimer = window.setTimeout(() => {
      if (state.ballsLeft > 0 || state.activeBalls.length > 0) {
        if (state.status !== "over") state.status = "playing";
        updateHud(true);
        return;
      }

      const wasPlunge = state.overflow.resolved;
      const plungeHit = state.overflow.hit;
      state.overflow.resolved = false;
      state.overflow.active = false;

      // A plunge that misses is not a punishment: the pot banks untouched and
      // the run simply ends. Nothing that was already earned can be lost.
      if (wasPlunge && !plungeHit) {
        bankPot("banked");
        showRunReport();
        return;
      }

      if (state.pot > 0 && state.overflow.plunges > 0) {
        offerOverflow();
        return;
      }

      if (state.pot > 0) bankPot("banked");
      showRunReport();
    }, 720);
  }

  function showRunReport() {
    state.status = "over";
    const isNewBest = state.score > state.runBestStart;

    ui.gameOver.dataset.mode = "report";
    if (ui.overlayKicker) ui.overlayKicker.textContent = "RUN COMPLETE";
    if (ui.overflowNote) ui.overflowNote.hidden = true;
    if (ui.overflowMeta) ui.overflowMeta.hidden = true;
    if (ui.overflowUnit) ui.overflowUnit.hidden = true;
    if (ui.plungeBtn) ui.plungeBtn.hidden = true;
    if (ui.bankOverlayBtn) ui.bankOverlayBtn.hidden = true;
    if (ui.againBtn) ui.againBtn.hidden = false;
    if (ui.overlayVaultBtn) ui.overlayVaultBtn.hidden = false;
    if (ui.shareRunBtn) ui.shareRunBtn.hidden = false;

    ui.finalTitle.textContent = isNewBest
      ? "NEW HIGH SCORE"
      : state.score >= 10000
        ? "JACKPOT HUNTER"
        : "NICE DROP";
    ui.finalScore.textContent = formatScore(state.score);
    ui.finalBest.textContent = formatScore(state.best);
    ui.newBest.classList.toggle("show", isNewBest);
    updateVaultReport();
    ui.gameOver.classList.add("show");
    ui.gameOver.setAttribute("aria-hidden", "false");
    updateHud(true);
    sfxRunOver();

    window.setTimeout(() => {
      if (state.status === "over") ui.againBtn.focus({ preventScroll: true });
    }, 420);
  }

  function updateVaultReport(summary) {
    if (ui.runJackpots) {
      ui.runJackpots.textContent = String(state.runStats.jackpots);
      ui.runTokens.textContent = String(state.runStats.tokensEarned);
      const chainStep = Math.max(2, Math.floor(bonuses.chainStep) || 5);
      const bestMultiplier = Math.min(
        5,
        1 + Math.floor(state.runStats.bestChain / chainStep)
      );
      ui.runChain.textContent = `×${bestMultiplier}`;
      ui.runChain.title = `${state.runStats.bestChain} pin hits`;
    }

    const vault = summary || window.NovaWheel?.getVaultSummary?.();
    if (!vault) {
      if (ui.reportVault) ui.reportVault.textContent = "—";
      if (ui.reportVaultFill) ui.reportVaultFill.style.width = "0%";
      if (ui.reportNext) ui.reportNext.textContent = "VAULT OFFLINE";
      if (ui.overlayVaultBtn) ui.overlayVaultBtn.textContent = "OPEN VAULT";
      return;
    }

    if (ui.overlayVaultBtn) {
      ui.overlayVaultBtn.textContent =
        vault.tokens > 0
          ? `SPEND ${vault.tokens} TOKEN${vault.tokens === 1 ? "" : "S"}`
          : "VIEW VAULT";
    }

    if (ui.reportVault) {
      ui.reportVault.textContent = `${vault.found}/${vault.total}`;
    }
    if (ui.reportVaultFill) {
      ui.reportVaultFill.style.width = `${(vault.found / vault.total) * 100}%`;
    }
    if (ui.reportNext) {
      if (vault.found === 0) {
        ui.reportNext.textContent = "OPEN THE VAULT · YOUR FIRST RELIC AWAITS";
      } else if (vault.nextBranch) {
        const remaining = vault.nextBranch.total - vault.nextBranch.found;
        ui.reportNext.textContent = `NEXT UNLOCK · ${remaining} MORE FOR ${vault.nextBranch.name.toUpperCase()}`;
      } else {
        ui.reportNext.textContent = `ALL ${vault.total} RELICS DISCOVERED`;
      }
    }
  }

  function applyLoadoutBonuses(next) {
    loadoutBonuses = { ...DEFAULT_BONUSES, ...(next || {}) };
    if (!state.started) {
      bonuses = { ...loadoutBonuses };
      state.ballsLeft = STARTING_BALLS + bonuses.startingBalls;
      updateHud(true);
    }
  }

  function syncBonusesFromWheel() {
    const next = window.NovaWheel?.getBonuses?.();
    if (next) loadoutBonuses = { ...DEFAULT_BONUSES, ...next };
  }

  function resetGame() {
    window.clearTimeout(state.overTimer);
    window.clearTimeout(state.overflowAutoTimer);
    window.clearTimeout(state.overflowDropTimer);
    window.clearTimeout(state.overflowFocusTimer);
    clearAutoTimer();

    // Restarting mid-run keeps the pot: it is money the player already won, so
    // it goes to the wallet instead of evaporating.
    if (state.pot > 0) bankPot("banked");
    state.overflow.active = false;
    state.overflow.resolved = false;
    state.overflow.hit = false;
    state.overflow.plunges = PLUNGE_BALLS;
    state.heat = 0;
    state.hot = false;
    state.hotTimer = 0;
    state.plungeScene = false;
    updatePotUi();

    state.status = "ready";
    state.started = false;
    state.runStats = { jackpots: 0, tokensEarned: 0, bestChain: 0 };
    state.runLoot = [];
    state.score = 0;
    state.runBestStart = state.best;
    syncBonusesFromWheel();
    bonuses = { ...loadoutBonuses };
    state.ballsLeft = STARTING_BALLS + bonuses.startingBalls;
    state.dropCount = 0;
    state.activeBalls = [];
    state.particles = [];
    state.floats = [];
    state.aimX = W / 2;
    state.autoPhase = Math.PI / 2;
    state.lastDropAt = -9999;
    state.slowMo = 0;
    state.tensionBall = null;
    state.cinema = 0;
    state.cinemaFocus = null;
    state.cinemaFired = false;
    state.finalBallDone = false;
    state.sceneBall = null;
    if (ui.finalChip) {
      ui.finalChip.classList.remove("on");
      ui.finalChip.dataset.on = "false";
    }
    state.flash = 0;
    state.overTimer = 0;

    for (const slot of slots) slot.flash = 0;
    // A new run gets a new board: mirrored deflectors in a new arrangement and
    // freshly rolled lucky pins.
    rebuildPins();

    ui.gameOver.classList.remove("show");
    ui.gameOver.setAttribute("aria-hidden", "true");
    ui.gameOver.dataset.mode = "report";
    if (ui.overlayKicker) ui.overlayKicker.textContent = "RUN COMPLETE";
    if (ui.overflowNote) ui.overflowNote.hidden = true;
    if (ui.overflowMeta) ui.overflowMeta.hidden = true;
    if (ui.overflowUnit) ui.overflowUnit.hidden = true;
    if (ui.plungeBtn) ui.plungeBtn.hidden = true;
    if (ui.bankOverlayBtn) ui.bankOverlayBtn.hidden = true;
    if (ui.againBtn) ui.againBtn.hidden = false;
    if (ui.overlayVaultBtn) ui.overlayVaultBtn.hidden = false;
    if (ui.shareRunBtn) ui.shareRunBtn.hidden = false;
    ui.newBest.classList.remove("show");
    ui.score.classList.remove("bump");
    ui.balls.parentElement.classList.remove("bump");
    updateHud(true);
    ensureAudio();
    sfxReset();

    // If auto drop is armed, roll straight into the next run.
    if (state.auto) scheduleAutoDrop(520);
  }

  function updateHud(force) {
    setText(ui.score, formatScore(state.score), force);
    setText(ui.best, formatScore(state.best), force);
    setText(ui.balls, String(state.ballsLeft), force);
    setText(
      ui.dropNumber,
      state.ballsLeft > 0
        ? String(Math.min(99, state.dropCount + 1)).padStart(2, "0")
        : "—",
      force
    );

    const liveBalls = state.activeBalls.filter((ball) => !ball.captured);
    let topBall = null;
    for (const ball of liveBalls) {
      if (!topBall || ball.chainHits > topBall.chainHits) topBall = ball;
    }

    const hits = topBall ? topBall.chainHits : 0;
    const chainStep = Math.max(2, Math.floor(bonuses.chainStep) || 5);
    const multiplier = Math.min(5, 1 + Math.floor(hits / chainStep));
    setText(ui.chainMult, `×${multiplier}`, force);
    setText(ui.chainRule, `${chainStep} HITS = ×2`, force);

    const fill = topBall
      ? `${clamp((hits / (chainStep * 4)) * 100, 0, 100)}%`
      : "0%";
    if (force || fill !== chainFillWidth) {
      ui.chainFill.style.width = fill;
      chainFillWidth = fill;
    }

    const chainText = topBall
      ? hits > 0
        ? `${hits} HIT${hits === 1 ? "" : "S"}`
        : "IN FLIGHT"
      : state.status === "over"
        ? "RUN OVER"
        : "READY";
    setText(ui.chainHits, chainText, force);

    const luckyEvery = Math.max(2, Math.floor(bonuses.luckyEvery) || 5);
    const untilLucky =
      (luckyEvery - 1 - (state.dropCount % luckyEvery) + luckyEvery) % luckyEvery;
    const hasDrops = state.ballsLeft > 0;
    const resolving = !hasDrops && state.activeBalls.length > 0;
    setText(
      ui.luckyText,
      resolving
        ? "IN FLIGHT"
        : !hasDrops
        ? "NO DROPS LEFT"
        : untilLucky === 0
          ? "NEXT DROP · ×2"
          : `IN ${untilLucky} DROP${untilLucky === 1 ? "" : "S"}`,
      force
    );
    ui.luckyCard.classList.toggle("is-next", hasDrops && untilLucky === 0);
    setText(
      ui.runBallRule,
      `${STARTING_BALLS + bonuses.startingBalls} BALLS / RUN`,
      force
    );

    const canDrop =
      state.ballsLeft > 0 &&
      state.status !== "ending" &&
      state.status !== "over" &&
      state.status !== "overflow";
    if (ui.dropBtn.disabled === canDrop) ui.dropBtn.disabled = !canDrop;
    setText(
      ui.dropBtn.querySelector("span"),
      canDrop ? "DROP BALL" : resolving ? "IN PLAY" : "NO BALLS",
      force
    );
  }

  function setText(element, value, force) {
    if (!element) return;
    if (force || element.textContent !== value) element.textContent = value;
  }

  function updateEffects(dt) {
    state.time += dt;
    state.flash *= Math.exp(-7 * dt);
    if (state.flash < 0.003) state.flash = 0;

    const pinDecay = REDUCED_MOTION ? 6.5 : 3.3;
    for (const pin of pins) {
      if (pin.flash > 0) {
        pin.flash = Math.max(0, pin.flash - dt * pinDecay);
      }
    }

    for (const slot of slots) {
      if (slot.flash > 0) {
        slot.flash = Math.max(0, slot.flash - dt * 2.5);
      }
    }

    for (let i = state.particles.length - 1; i >= 0; i--) {
      const particle = state.particles[i];
      particle.life -= dt;
      if (particle.life <= 0) {
        state.particles.splice(i, 1);
        continue;
      }
      particle.vy += (particle.gravity || 0) * dt;
      particle.vx *= 1 - (particle.drag || 0) * dt;
      particle.vy *= 1 - (particle.drag || 0) * dt;
      particle.x += particle.vx * dt;
      particle.y += particle.vy * dt;
      particle.rotation += particle.spin * dt;
    }

    for (let i = state.floats.length - 1; i >= 0; i--) {
      const float = state.floats[i];
      float.life -= dt;
      float.y -= float.rise * dt;
      if (float.life <= 0) state.floats.splice(i, 1);
    }
  }

  function spawnSparks(x, y, color, count, power) {
    if (state.particles.length > 280) return;
    const actualCount = REDUCED_MOTION ? Math.ceil(count * 0.4) : count;
    for (let i = 0; i < actualCount; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = (28 + Math.random() * 175) * power;
      const life = 0.24 + Math.random() * 0.55;
      state.particles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 45 * power,
        life,
        maxLife: life,
        size: 1.2 + Math.random() * 2.5,
        color,
        gravity: 580,
        drag: 1.4,
        shape: "circle",
        rotation: 0,
        spin: 0
      });
    }
  }

  function spawnConfetti(x, y) {
    if (REDUCED_MOTION) return;
    const colors = [C.gold, C.coral, C.cyan, C.violet, "#fff2d0"];
    for (let i = 0; i < 72; i++) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * Math.PI * 1.1;
      const speed = 120 + Math.random() * 480;
      const life = 1.2 + Math.random() * 1.4;
      state.particles.push({
        x: x + (Math.random() - 0.5) * 38,
        y: y + (Math.random() - 0.5) * 18,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life,
        maxLife: life,
        size: 2 + Math.random() * 4,
        color: colors[(Math.random() * colors.length) | 0],
        gravity: 480,
        drag: 0.55,
        shape: "rect",
        rotation: Math.random() * Math.PI,
        spin: (Math.random() - 0.5) * 14
      });
    }
  }

  function addFloatingText(x, y, text, color, size, life) {
    state.floats.push({
      x,
      y,
      text,
      color,
      size,
      life,
      maxLife: life,
      rise: 29 + Math.random() * 15
    });
  }

  function formatScore(value) {
    return Math.max(0, Math.round(value)).toLocaleString("en-US");
  }

  function render(dt) {
    ctx.setTransform(backingScale, 0, 0, backingScale, 0, 0);
    ctx.clearRect(0, 0, W, H);

    ctx.save();

    buildCabinetLayers();
    ctx.drawImage(cabinetLayer, 0, 0, W, H);
    drawHeatBezel();

    // The cabinet stays put and the camera looks closer through the glass.
    if (state.cinema > 0.004 && state.cinemaFocus) {
      const zoom = 1 + (state.plungeScene ? 0.48 : 0.38) * state.cinema;
      const fx = state.cinemaFocus.x;
      const fy = state.cinemaFocus.y;
      ctx.save();
      roundPath(GLASS.x, GLASS.y, GLASS.w, GLASS.h, GLASS.r);
      ctx.clip();
      ctx.translate(fx, fy);
      ctx.scale(zoom, zoom);
      ctx.translate(-fx, -fy);
      drawGlassContents(dt, true);
      ctx.restore();
    } else {
      drawGlassContents(dt);
    }

    // The camera pushing in also pushes everything else back: a second
    // vignette, stronger than the baked one, closes in while the scene runs.
    if (state.cinema > 0.004) {
      if (!vignetteGradient) {
        vignetteGradient = ctx.createRadialGradient(W / 2, 455, 170, W / 2, 500, 590);
        vignetteGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
        vignetteGradient.addColorStop(0.66, "rgba(1, 3, 10, 0.08)");
        vignetteGradient.addColorStop(1, "rgba(1, 3, 10, 0.62)");
      }
      ctx.save();
      ctx.globalAlpha = state.cinema * 0.85;
      ctx.fillStyle = vignetteGradient;
      ctx.fillRect(GLASS.x, GLASS.y, GLASS.w, GLASS.h);
      ctx.restore();
    }

    ctx.restore();

    if (state.flash > 0.004) {
      ctx.save();
      ctx.globalCompositeOperation = "screen";
      ctx.fillStyle = hexToRgba(state.flashColor, state.flash * 0.24);
      ctx.fillRect(0, 0, W, H);
      ctx.restore();
    }

    // One blit from the scene to the screen. The canvas element is already at
    // device resolution, so this is the only scaling that happens, and it is
    // uniform — no seam, no doubled column, at any quality setting.
    present.imageSmoothingEnabled = true;
    present.drawImage(scene, 0, 0, canvas.width, canvas.height);
  }

  function drawCabinetBase() {
    ctx.save();

    roundPath(FRAME.x, FRAME.y, FRAME.w, FRAME.h, FRAME.r);
    const frameGradient = ctx.createLinearGradient(20, 20, 740, 1040);
    frameGradient.addColorStop(0, "#292a4b");
    frameGradient.addColorStop(0.28, "#15182c");
    frameGradient.addColorStop(0.6, "#0b0e1b");
    frameGradient.addColorStop(1, "#24213b");
    ctx.fillStyle = frameGradient;
    ctx.fill();

    ctx.lineWidth = 1.2;
    ctx.strokeStyle = "rgba(255, 239, 208, 0.17)";
    ctx.stroke();

    roundPath(16, 16, 728, 1028, 33);
    ctx.lineWidth = 1;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.055)";
    ctx.stroke();

    // Marquee plaque.
    roundPath(42, 17, 676, 49, 15);
    const marquee = ctx.createLinearGradient(0, 18, 0, 66);
    marquee.addColorStop(0, "#1b1a34");
    marquee.addColorStop(1, "#0a0d1c");
    ctx.fillStyle = marquee;
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 218, 157, 0.16)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textBaseline = "middle";
    // Plaque type scales with the cabinet too: on a phone the bitmap is ~0.49
    // CSS px per board unit, so an unscaled 12px drew the marquee at 6 CSS px.
    const plaqueScale = boardTypeScale;
    ctx.font = `800 ${12 * plaqueScale}px Bahnschrift, "Trebuchet MS", sans-serif`;
    ctx.fillStyle = "#f7dfb1";
    drawSpacedText("NOVA  PACHINKO", W / 2, 42, 5.2 * plaqueScale);

    ctx.fillStyle = "rgba(255, 199, 95, 0.62)";
    drawDiamond(56, 41.5, 3.3);
    drawDiamond(704, 41.5, 3.3);

    ctx.font = '700 6px Bahnschrift, "Trebuchet MS", sans-serif';
    ctx.fillStyle = "rgba(255, 242, 213, 0.42)";
    drawSpacedText("DROP  ·  BOUNCE  ·  BANK", W / 2, 1042, 2.2);

    // Bottom plate.
    roundPath(248, 1032, 264, 14, 7);
    ctx.fillStyle = "rgba(6, 9, 18, 0.85)";
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 255, 255, 0.06)";
    ctx.stroke();

    ctx.restore();
  }

  // The dark playfield backdrop never changes, so it is part of the baked
  // cabinet layer instead of two full-glass fills every frame.
  function drawGlassBackdrop() {
    ctx.save();
    roundPath(GLASS.x, GLASS.y, GLASS.w, GLASS.h, GLASS.r);
    ctx.clip();

    if (!glassBgGradient) {
      glassBgGradient = ctx.createLinearGradient(0, GLASS.y, 0, GLASS.y + GLASS.h);
      glassBgGradient.addColorStop(0, "#0b1226");
      glassBgGradient.addColorStop(0.45, "#070c1a");
      glassBgGradient.addColorStop(1, "#090b17");
    }
    ctx.fillStyle = glassBgGradient;
    ctx.fillRect(GLASS.x, GLASS.y, GLASS.w, GLASS.h);

    if (!glassGlowGradient) {
      glassGlowGradient = ctx.createRadialGradient(380, 470, 20, 380, 500, 470);
      glassGlowGradient.addColorStop(0, "rgba(100, 74, 255, 0.14)");
      glassGlowGradient.addColorStop(0.45, "rgba(60, 48, 160, 0.045)");
      glassGlowGradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    }
    ctx.fillStyle = glassGlowGradient;
    ctx.fillRect(GLASS.x, GLASS.y, GLASS.w, GLASS.h);
    ctx.restore();
  }

  function drawGlassContents(dt, skipClip) {
    ctx.save();
    if (!skipClip) {
      roundPath(GLASS.x, GLASS.y, GLASS.w, GLASS.h, GLASS.r);
      ctx.clip();
    }

    drawStarField();
    drawGrid();
    drawFieldRings();
    drawTopChute();
    drawAimGuide();
    drawSlots();
    drawSideRails();
    drawPins();
    drawBalls();
    drawSlotDividers();
    drawParticles();
    drawLights();
    drawFloatingTexts();

    // Scanlines + vignette are static, so they are pre-composited into one
    // glass-sized sprite and blitted instead of four full-glass passes.
    if (!glassOverlayLayer) buildGlassOverlayLayer();
    if (glassOverlayLayer) {
      ctx.drawImage(glassOverlayLayer, GLASS.x, GLASS.y, GLASS.w, GLASS.h);
    }

    drawTensionOverlay();

    ctx.restore();
  }

  function drawStarField() {
    ctx.save();
    for (const star of stars) {
      const twinkle = 0.72 + Math.sin(state.time * star.speed + star.twinkle) * 0.28;
      ctx.globalAlpha = star.a * twinkle;
      ctx.fillStyle = "#dffcf8";
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawGrid() {
    ctx.save();
    ctx.strokeStyle = "rgba(145, 159, 230, 0.032)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    for (let x = 74; x < 700; x += 48) {
      ctx.moveTo(x, GLASS.y + 1);
      ctx.lineTo(x, SLOT_TOP);
    }
    for (let y = 92; y < SLOT_TOP; y += 48) {
      ctx.moveTo(PLAY.left, y);
      ctx.lineTo(PLAY.right, y);
    }
    ctx.stroke();
    ctx.restore();
  }

  function drawFieldRings() {
    ctx.save();
    ctx.translate(380, 472);
    ctx.strokeStyle = "rgba(94, 239, 220, 0.035)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(0, 0, 245, 0, Math.PI * 2);
    ctx.stroke();
    ctx.strokeStyle = "rgba(176, 135, 255, 0.04)";
    ctx.beginPath();
    ctx.arc(0, 0, 332, 0, Math.PI * 2);
    ctx.stroke();

    ctx.setLineDash([2, 12]);
    ctx.strokeStyle = "rgba(255, 213, 143, 0.055)";
    ctx.beginPath();
    ctx.arc(0, 0, 284, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function drawTopChute() {
    ctx.save();
    const topGradient = cachedGradient("chute", () => {
      const paint = ctx.createLinearGradient(0, GLASS.y, 0, PLAY.top + 40);
      paint.addColorStop(0, "rgba(23, 31, 62, 0.9)");
      paint.addColorStop(1, "rgba(8, 12, 25, 0)");
      return paint;
    });
    ctx.fillStyle = topGradient;
    ctx.fillRect(GLASS.x, GLASS.y, GLASS.w, 92);

    // No cap on the scale here: capping it below boardTypeScale is what made
    // this label *smaller* on a phone than it is on a desktop monitor.
    const zoneSize = 9.2 * boardTypeScale;
    ctx.font = `700 ${zoneSize}px Bahnschrift, "Trebuchet MS", sans-serif`;
    ctx.fillStyle = "rgba(230, 214, 186, 0.62)";
    ctx.textAlign = "center";
    drawSpacedText("DROP ZONE", W / 2, 102, 2.4 * boardTypeScale);

    ctx.strokeStyle = "rgba(77, 245, 221, 0.13)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(PLAY.left + 18, 124);
    ctx.lineTo(330, 124);
    ctx.moveTo(430, 124);
    ctx.lineTo(PLAY.right - 18, 124);
    ctx.stroke();
    ctx.restore();
  }

  function drawAimGuide() {
    if (state.status === "over" || state.ballsLeft <= 0) return;

    const x = clamp(state.aimX, PLAY.left + BALL_R + 10, PLAY.right - BALL_R - 10);
    const pulse = 0.72 + Math.sin(state.time * 2.4) * 0.12;
    const gap = Math.abs(x - W / 2) / 320;

    ctx.save();

    const beam = cachedGradient("aim", () => {
      const paint = ctx.createLinearGradient(0, 138, 0, 234);
      paint.addColorStop(0, hexToRgba(C.cyan, 0.12));
      paint.addColorStop(1, hexToRgba(C.cyan, 0));
      return paint;
    });
    ctx.fillStyle = beam;
    ctx.fillRect(x - 18, 138, 36, 96);

    ctx.setLineDash([3, 7]);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = hexToRgba(C.cyan, 0.4 * pulse);
    ctx.beginPath();
    ctx.moveTo(x, 164);
    ctx.lineTo(x, 224);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = hexToRgba(C.cyan, 0.24 * pulse);
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - 18, 136);
    ctx.lineTo(x - 18, 150);
    ctx.quadraticCurveTo(x - 18, 158, x - 10, 158);
    ctx.moveTo(x + 18, 136);
    ctx.lineTo(x + 18, 150);
    ctx.quadraticCurveTo(x + 18, 158, x + 10, 158);
    ctx.stroke();

    for (let i = 0; i < 2; i++) {
      const y = 196 + i * 13;
      ctx.strokeStyle = hexToRgba(C.cyan, (0.2 - i * 0.055) * pulse);
      ctx.beginPath();
      ctx.moveTo(x - 6, y);
      ctx.lineTo(x, y + 5);
      ctx.lineTo(x + 6, y);
      ctx.stroke();
    }

    const ghost = ctx.createRadialGradient(
      x - 2.5,
      163.5,
      0.5,
      x,
      166,
      10
    );
    ghost.addColorStop(0, "rgba(255, 255, 255, 0.9)");
    ghost.addColorStop(0.35, hexToRgba(C.cyan, 0.42));
    ghost.addColorStop(1, hexToRgba(C.cyan, 0));
    ctx.fillStyle = ghost;
    ctx.beginPath();
    ctx.arc(x, 166, 10, 0, Math.PI * 2);
    ctx.fill();

    ctx.strokeStyle = hexToRgba(C.cyan, 0.45 * pulse);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(x, 166, 10 + pulse * 2.5, 0, Math.PI * 2);
    ctx.stroke();

    if (gap > 0.45) {
      ctx.fillStyle = hexToRgba(C.coral, 0.28);
      ctx.beginPath();
      ctx.arc(x, 166, 2.2, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }

  // Gradients are immutable once built, so anything that does not depend on
  // frame state is built once and reused instead of allocated 60 times a second.
  const gradientCache = new Map();

  function cachedGradient(key, make) {
    let gradient = gradientCache.get(key);
    if (!gradient) {
      gradient = make();
      gradientCache.set(key, gradient);
    }
    return gradient;
  }

  // Shrinks the current font until the label (plus its letter spacing) fits the
  // slot. The numbers now scale with the board, and "2500" in the narrow
  // jackpot slot is the one label that would otherwise run into its neighbours.
  function fitLabel(text, size, family, spacing, maxWidth) {
    let current = size;
    let gap = spacing;
    for (let pass = 0; pass < 4; pass++) {
      ctx.font = `700 ${current}px ${family}`;
      const chars = Array.from(text).length;
      const width = ctx.measureText(text).width + (chars > 1 ? gap * (chars - 1) : 0);
      if (width <= maxWidth) break;
      const ratio = maxWidth / width;
      current *= ratio;
      gap *= ratio;
    }
    return gap;
  }

  function drawSlots() {
    ctx.save();
    // Numbers scale with the board so they stay the same size on screen. The
    // sub-labels (PTS, BALL, JACKPOT) scale with it too, then fitLabel trims
    // them to the slot, which is what keeps a narrow jackpot slot honest.
    const big = boardTypeScale;
    const small = boardTypeScale;
    const mono = '"Cascadia Mono", "Lucida Console", monospace';
    const ui = 'Bahnschrift, "Trebuchet MS", sans-serif';
    for (const slot of slots) {
      const gradient = cachedGradient(`slot:${slot.x}`, () => {
        const paint = ctx.createLinearGradient(0, SLOT_TOP, 0, SLOT_BOTTOM);
        paint.addColorStop(0, hexToRgba(slot.color, 0.14));
        paint.addColorStop(0.5, hexToRgba(slot.color, 0.045));
        paint.addColorStop(1, hexToRgba(slot.color, 0.01));
        return paint;
      });
      ctx.fillStyle = gradient;
      ctx.fillRect(slot.x + 1, SLOT_TOP, slot.w - 2, SLOT_BOTTOM - SLOT_TOP);

      if (slot.flash > 0) {
        ctx.fillStyle = hexToRgba(slot.color, slot.flash * 0.18);
        ctx.fillRect(slot.x + 1, SLOT_TOP, slot.w - 2, SLOT_BOTTOM - SLOT_TOP);
        ctx.strokeStyle = hexToRgba(slot.color, slot.flash * 0.65);
        ctx.lineWidth = 1;
        ctx.strokeRect(slot.x + 2.5, SLOT_TOP + 1.5, slot.w - 5, SLOT_BOTTOM - SLOT_TOP - 3);
      }

      ctx.textAlign = "center";
      ctx.textBaseline = "middle";

      if (slot.jackpot) {
        ctx.save();
        ctx.shadowColor = hexToRgba(C.gold, 0.7);
        ctx.shadowBlur = 12 + slot.flash * 20;
        fitLabel(slot.label, 19 * big, mono, 0, slot.w - 14);
        ctx.fillStyle = "#ffeab9";
        ctx.fillText(slot.label, slot.center, SLOT_TOP + 42);
        ctx.restore();

        // Seven letters in the narrowest slot: keep the tracking tight so the
        // word sits inside the dividers instead of touching them.
        const gap = fitLabel(slot.sub, 10.2 * small, ui, 0.5, slot.w - 10);
        ctx.fillStyle = "#ffe0a6";
        drawSpacedText(slot.sub, slot.center, SLOT_TOP + 77, gap);
      } else {
        fitLabel(slot.label, (slot.bonus ? 24 : 21) * big, mono, 0, slot.w - 14);
        ctx.fillStyle = tintHex(slot.color, 0.16);
        ctx.fillText(slot.label, slot.center, SLOT_TOP + 42);

        const gap = fitLabel(slot.sub, 10.8 * small, ui, 0.9, slot.w - 12);
        ctx.fillStyle = tintHex(slot.color, 0.42);
        drawSpacedText(slot.sub, slot.center, SLOT_TOP + 77, gap);
      }

      ctx.strokeStyle = hexToRgba(slot.color, 0.48);
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(slot.x + 12, SLOT_TOP + 0.5);
      ctx.lineTo(slot.x + slot.w - 12, SLOT_TOP + 0.5);
      ctx.stroke();

      ctx.strokeStyle = hexToRgba(slot.color, 0.18);
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(slot.x + 16, SLOT_BOTTOM - 18);
      ctx.lineTo(slot.x + slot.w - 16, SLOT_BOTTOM - 18);
      ctx.stroke();

      if (slot.jackpot) {
        const jackpotGlow = 0.5 + Math.sin(state.time * 1.9) * 0.14;
        ctx.fillStyle = hexToRgba(C.gold, 0.1 * jackpotGlow);
        ctx.fillRect(slot.x + 1, SLOT_TOP, slot.w - 2, SLOT_BOTTOM - SLOT_TOP);
      }
    }
    ctx.restore();
  }

  function drawSideRails() {
    ctx.save();
    const left = cachedGradient("rails", () => {
      const paint = ctx.createLinearGradient(0, 136, 0, SLOT_TOP);
      paint.addColorStop(0, "rgba(255, 238, 204, 0.45)");
      paint.addColorStop(0.45, "rgba(77, 245, 221, 0.18)");
      paint.addColorStop(1, "rgba(77, 245, 221, 0.04)");
      return paint;
    });
    ctx.strokeStyle = left;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(PLAY.left + 1, 142);
    ctx.lineTo(PLAY.left + 1, SLOT_TOP);
    ctx.moveTo(PLAY.right - 1, 142);
    ctx.lineTo(PLAY.right - 1, SLOT_TOP);
    ctx.stroke();

    ctx.strokeStyle = "rgba(255, 255, 255, 0.04)";
    ctx.lineWidth = 7;
    ctx.beginPath();
    ctx.moveTo(PLAY.left - 5, 150);
    ctx.lineTo(PLAY.left - 5, SLOT_TOP);
    ctx.moveTo(PLAY.right + 5, 150);
    ctx.lineTo(PLAY.right + 5, SLOT_TOP);
    ctx.stroke();
    ctx.restore();
  }

  // Board heat lives on the cabinet's own bezel, not inside the glass: a
  // filament under the marquee that fills as the field warms up and then floods
  // gold for the hot window. It sits outside the camera clip, so it holds still
  // while the last ball gets its close-up.
  function drawHeatBezel() {
    const left = 128;
    const right = W - 128;
    const width = right - left;
    const y = 64;
    const height = 4;
    const ratio = clamp(state.heat / HEAT_MAX, 0, 1);
    const hot = state.hot;
    const pulse = hot ? 0.62 + Math.sin(state.time * 6.2) * 0.3 : 1;

    ctx.save();

    roundPath(left, y, width, height, height / 2);
    ctx.fillStyle = "rgba(5, 9, 20, 0.92)";
    ctx.fill();

    if (ratio > 0.002) {
      const paint = ctx.createLinearGradient(left, 0, right, 0);
      paint.addColorStop(0, hexToRgba(C.cyan, 0.9));
      paint.addColorStop(0.58, hexToRgba(C.violet, 0.92));
      paint.addColorStop(1, hexToRgba(C.gold, 0.98));

      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.globalAlpha = hot ? Math.min(1, pulse + 0.12) : 0.92;
      ctx.fillStyle = paint;
      roundPath(left, y, Math.max(height, width * ratio), height, height / 2);
      ctx.fill();
      ctx.restore();
    }

    // The lit head of the filament, so the bar reads as a charge travelling
    // along the bezel instead of a progress bar pasted on top of it.
    if (ratio > 0.02) {
      const headX = left + width * ratio;
      const reach = hot ? 34 : 18;
      const glow = ctx.createRadialGradient(headX, y + height / 2, 0, headX, y + height / 2, reach);
      glow.addColorStop(0, hexToRgba(hot ? "#fff0c6" : C.cyan, hot ? 0.62 * pulse : 0.3));
      glow.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = glow;
      ctx.fillRect(headX - reach, y - reach, reach * 2, reach * 2);
      ctx.restore();
    }

    const labelScale = boardTypeScale;
    ctx.font = `800 ${7 * labelScale}px Bahnschrift, "Trebuchet MS", sans-serif`;
    ctx.textAlign = "right";
    ctx.fillStyle = hot
      ? hexToRgba("#ffe3a8", Math.min(1, pulse + 0.2))
      : "rgba(198, 207, 236, 0.72)";
    ctx.fillText(hot ? "HOT" : "HEAT", left - 9, y + height + 1.5);

    ctx.textAlign = "left";
    ctx.fillStyle = hot
      ? hexToRgba("#ffe3a8", Math.min(1, pulse + 0.2))
      : "rgba(198, 207, 236, 0.55)";
    ctx.fillText(hot ? "+1 TOKEN" : "GOLD PINS", right + 9, y + height + 1.5);

    // While the board is hot, the glass is lit from the top of the cabinet.
    if (hot) {
      const wash = ctx.createLinearGradient(0, GLASS.y - 10, 0, GLASS.y + 300);
      wash.addColorStop(0, hexToRgba(C.gold, 0.13 * pulse));
      wash.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.save();
      roundPath(GLASS.x, GLASS.y, GLASS.w, GLASS.h, GLASS.r);
      ctx.clip();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = wash;
      ctx.fillRect(GLASS.x, GLASS.y - 10, GLASS.w, 310);
      ctx.restore();
    }

    ctx.restore();
  }

  function drawPins() {
    // A hot board is not a different board, it is the same one under a warm
    // lamp: every stud picks up a gold halo so the state is visible from the
    // far side of the room.
    if (state.hot) {
      const pulse = 0.42 + Math.sin(state.time * 5.4) * 0.16;
      ctx.save();
      ctx.globalCompositeOperation = "lighter";
      ctx.fillStyle = hexToRgba(C.gold, pulse * 0.24);
      ctx.beginPath();
      for (const pin of pins) {
        ctx.moveTo(pin.x + pin.r + 6, pin.y);
        ctx.arc(pin.x, pin.y, pin.r + 6, 0, Math.PI * 2);
      }
      ctx.fill();
      ctx.restore();
    }

    for (const pin of pins) {
      const glow = pin.flash;

      if (glow > 0.01) {
        ctx.save();
        ctx.globalAlpha = glow * 0.3;
        ctx.fillStyle = pin.gold ? C.gold : C.cyan;
        ctx.beginPath();
        ctx.arc(pin.x, pin.y, pin.r + 10 + glow * 8, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      if (pin.gold) {
        const pulse = 0.55 + Math.sin(state.time * 2.2 + pin.id) * 0.12;
        ctx.save();
        const body = ctx.createRadialGradient(
          pin.x - pin.r * 0.34,
          pin.y - pin.r * 0.4,
          0.4,
          pin.x,
          pin.y,
          pin.r * 1.2
        );
        body.addColorStop(0, "#fff9dd");
        body.addColorStop(0.32, "#ffd77c");
        body.addColorStop(0.74, "#c98329");
        body.addColorStop(1, "#6d3b15");
        ctx.fillStyle = body;
        ctx.beginPath();
        ctx.arc(pin.x, pin.y, pin.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 237, 180, 0.75)";
        ctx.lineWidth = 1;
        ctx.stroke();

        ctx.shadowBlur = 0;
        ctx.strokeStyle = hexToRgba("#fff2c8", 0.42 + glow * 0.35);
        ctx.beginPath();
        ctx.moveTo(pin.x - pin.r * 0.48, pin.y);
        ctx.lineTo(pin.x + pin.r * 0.48, pin.y);
        ctx.moveTo(pin.x, pin.y - pin.r * 0.48);
        ctx.lineTo(pin.x, pin.y + pin.r * 0.48);
        ctx.stroke();
        ctx.restore();
      } else if (pin.big) {
        // A big deflector that did not roll lucky this run. Flat colour at
        // this size washed out into a white blob, so the large studs get a
        // dark bezel and a satin cap: cool next to the gold ones, and clearly
        // a deliberate piece of the board rather than a stray ball.
        ctx.fillStyle = "rgba(5, 7, 16, 0.5)";
        ctx.beginPath();
        ctx.arc(pin.x + 1.4, pin.y + 1.9, pin.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#332e4f";
        ctx.beginPath();
        ctx.arc(pin.x, pin.y, pin.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#a9a2c8";
        ctx.beginPath();
        ctx.arc(pin.x, pin.y, pin.r - 1.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "rgba(18, 16, 34, 0.55)";
        ctx.beginPath();
        ctx.arc(pin.x, pin.y, pin.r - 1.6, Math.PI * 0.15, Math.PI * 0.85);
        ctx.fill();

        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.beginPath();
        ctx.arc(pin.x - pin.r * 0.24, pin.y - pin.r * 0.28, pin.r * 0.3, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(214, 226, 255, 0.22)";
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(pin.x, pin.y, pin.r - 1.6, Math.PI * 1.06, Math.PI * 1.74);
        ctx.stroke();
      } else {
        ctx.fillStyle = "rgba(5, 7, 16, 0.46)";
        ctx.beginPath();
        ctx.arc(pin.x + 1.2, pin.y + 1.8, pin.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = "#cbc4df";
        ctx.beginPath();
        ctx.arc(pin.x, pin.y, pin.r, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(27, 25, 44, 0.85)";
        ctx.lineWidth = 0.8;
        ctx.stroke();

        ctx.fillStyle = "rgba(255, 255, 255, 0.38)";
        ctx.beginPath();
        ctx.arc(pin.x - 1.25, pin.y - 1.45, pin.r * 0.46, 0, Math.PI * 2);
        ctx.fill();

        ctx.strokeStyle = "rgba(255, 255, 255, 0.48)";
        ctx.lineWidth = 0.7;
        ctx.beginPath();
        ctx.arc(pin.x, pin.y, pin.r - 1, Math.PI * 1.03, Math.PI * 1.67);
        ctx.stroke();
      }

      if (glow > 0.02) {
        ctx.save();
        ctx.globalAlpha = glow * 0.9;
        ctx.strokeStyle = pin.gold ? C.gold : C.cyan;
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(pin.x, pin.y, pin.r + 3.5 + glow * 5, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  function drawBalls() {
    for (const ball of state.activeBalls) {
      const alpha = ball.alpha;
      if (ball.captured) {
        drawBall(ball, alpha, true);
        continue;
      }

      const trail = ball.trail;
      if (trail.length > 1) {
        ctx.save();
        for (let i = 0; i < trail.length; i++) {
          const t = i / trail.length;
          const alphaTrail = t * t * 0.16 * alpha;
          ctx.globalAlpha = alphaTrail;
          ctx.fillStyle = ball.gold ? C.gold : C.cyan;
          ctx.beginPath();
          ctx.arc(trail[i].x, trail[i].y, ball.r * (0.3 + t * 0.68), 0, Math.PI * 2);
          ctx.fill();
        }
        ctx.restore();
      }

      drawBall(ball, alpha, false);
    }
  }

  function drawBall(ball, alpha, captured) {
    ctx.save();
    ctx.globalAlpha = alpha;

    if (ball.gold) {
      const aura = ctx.createRadialGradient(
        ball.x,
        ball.y,
        ball.r * 0.4,
        ball.x,
        ball.y,
        ball.r * 2.8
      );
      aura.addColorStop(0, "rgba(255, 204, 104, 0.24)");
      aura.addColorStop(1, "rgba(255, 183, 65, 0)");
      ctx.fillStyle = aura;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.r * 2.8, 0, Math.PI * 2);
      ctx.fill();
    }

    // No canvas shadow here: a per-ball shadowBlur is a blur pass per ball per
    // frame. The additive halo in drawLights does the same job with one blit.
    const body = ctx.createRadialGradient(
      ball.x - ball.r * 0.34,
      ball.y - ball.r * 0.42,
      0.5,
      ball.x,
      ball.y,
      ball.r * 1.15
    );

    if (ball.gold) {
      body.addColorStop(0, "#fffef1");
      body.addColorStop(0.3, "#ffe3a0");
      body.addColorStop(0.7, "#d99128");
      body.addColorStop(1, "#7b4111");
    } else {
      body.addColorStop(0, "#ffffff");
      body.addColorStop(0.3, "#e6fffb");
      body.addColorStop(0.7, "#a3f5e8");
      body.addColorStop(1, "#398e91");
    }

    ctx.fillStyle = body;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r, 0, Math.PI * 2);
    ctx.fill();

    ctx.shadowBlur = 0;
    ctx.strokeStyle = ball.gold
      ? "rgba(255, 242, 194, 0.72)"
      : "rgba(217, 255, 250, 0.64)";
    ctx.lineWidth = 0.9;
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 255, 255, 0.92)";
    ctx.beginPath();
    ctx.arc(ball.x - 2.8, ball.y - 3.1, 1.55, 0, Math.PI * 2);
    ctx.fill();

    if (!captured) {
      const chainStep = Math.max(2, Math.floor(bonuses.chainStep) || 5);
      const mult = Math.min(5, 1 + Math.floor(ball.chainHits / chainStep));
      if (mult > 1) {
        ctx.globalAlpha = alpha * 0.28;
        ctx.strokeStyle = ball.gold ? C.gold : C.cyan;
        ctx.lineWidth = 1;
        ctx.beginPath();
        ctx.arc(ball.x, ball.y, ball.r + 3 + (mult - 1) * 1.2, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  function drawSlotDividers() {
    ctx.save();
    for (const divider of slotDividers) {
      ctx.lineCap = "round";

      ctx.strokeStyle = "rgba(3, 5, 12, 0.9)";
      ctx.lineWidth = 9;
      ctx.beginPath();
      ctx.moveTo(divider.x, divider.y1 + 2);
      ctx.lineTo(divider.x, divider.y2);
      ctx.stroke();

      const metal = cachedGradient(`divider:${divider.y1}:${divider.y2}`, () => {
        const paint = ctx.createLinearGradient(0, divider.y1, 0, divider.y2);
        paint.addColorStop(0, "#f5e4c4");
        paint.addColorStop(0.15, "#a49bb5");
        paint.addColorStop(0.65, "#4a4563");
        paint.addColorStop(1, "#24233c");
        return paint;
      });
      ctx.strokeStyle = metal;
      ctx.lineWidth = 5;
      ctx.beginPath();
      ctx.moveTo(divider.x, divider.y1 + 2);
      ctx.lineTo(divider.x, divider.y2);
      ctx.stroke();

      ctx.fillStyle = "rgba(255, 243, 214, 0.86)";
      ctx.beginPath();
      ctx.arc(divider.x, divider.y1 + 2, 2.9, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawParticles() {
    ctx.save();
    for (const particle of state.particles) {
      const alpha = clamp(particle.life / (particle.maxLife * 0.55), 0, 1);
      ctx.globalAlpha = alpha * 0.85;
      ctx.fillStyle = particle.color;

      if (particle.shape === "rect") {
        ctx.save();
        ctx.translate(particle.x, particle.y);
        ctx.rotate(particle.rotation);
        ctx.fillRect(
          -particle.size * 0.5,
          -particle.size * 0.28,
          particle.size,
          particle.size * 0.56
        );
        ctx.restore();
      } else {
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size * alpha, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.restore();
  }

  const glowCache = new Map();

  // Cached radial-gradient sprite: one drawImage per light instead of building
  // a gradient object inside the render loop.
  function glowSprite(color) {
    let sprite = glowCache.get(color);
    if (sprite) return sprite;

    const size = 128;
    sprite = document.createElement("canvas");
    sprite.width = size;
    sprite.height = size;
    const paint = sprite.getContext("2d");
    const gradient = paint.createRadialGradient(
      size / 2,
      size / 2,
      0,
      size / 2,
      size / 2,
      size / 2
    );
    gradient.addColorStop(0, hexToRgba(color, 0.95));
    gradient.addColorStop(0.34, hexToRgba(color, 0.42));
    gradient.addColorStop(0.64, hexToRgba(color, 0.12));
    gradient.addColorStop(1, hexToRgba(color, 0));
    paint.fillStyle = gradient;
    paint.fillRect(0, 0, size, size);

    glowCache.set(color, sprite);
    return sprite;
  }

  function lightGlow(x, y, width, height, color, alpha) {
    if (alpha <= 0.006) return;
    ctx.globalAlpha = Math.min(1, alpha);
    ctx.drawImage(glowSprite(color), x - width / 2, y - height / 2, width, height);
  }

  // A one-sided warm strip for light spilling onto the inner glass walls.
  let wallStrip = null;
  function wallSprite() {
    if (wallStrip) return wallStrip;
    wallStrip = document.createElement("canvas");
    wallStrip.width = 128;
    wallStrip.height = 8;
    const paint = wallStrip.getContext("2d");
    const gradient = paint.createLinearGradient(0, 0, 128, 0);
    gradient.addColorStop(0, "rgba(255, 208, 138, 0.72)");
    gradient.addColorStop(0.35, "rgba(255, 194, 122, 0.18)");
    gradient.addColorStop(1, "rgba(255, 190, 120, 0)");
    paint.fillStyle = gradient;
    paint.fillRect(0, 0, 128, 8);
    return wallStrip;
  }

  // A soft diagonal band that drifts across the glass cover like a room
  // reflection. Kept faint so it lifts the board without reading as a wipe.
  let sheenBand = null;
  function sheenSprite() {
    if (sheenBand) return sheenBand;
    sheenBand = document.createElement("canvas");
    sheenBand.width = 256;
    sheenBand.height = 8;
    const paint = sheenBand.getContext("2d");
    const gradient = paint.createLinearGradient(0, 0, 256, 0);
    gradient.addColorStop(0, "rgba(210, 228, 255, 0)");
    gradient.addColorStop(0.34, "rgba(210, 228, 255, 0.16)");
    gradient.addColorStop(0.5, "rgba(226, 240, 255, 0.42)");
    gradient.addColorStop(0.66, "rgba(210, 228, 255, 0.16)");
    gradient.addColorStop(1, "rgba(210, 228, 255, 0)");
    paint.fillStyle = gradient;
    paint.fillRect(0, 0, 256, 8);
    return sheenBand;
  }

  // The parlor lighting pass: pockets glow, the jackpot tower breathes, a chase
  // of bulbs runs along the payout rail, and every ball carries its own light.
  function drawLights() {
    const t = REDUCED_MOTION ? 0 : state.time;
    const dim = state.status === "over" ? 0.5 : 1;
    const tension = state.slowMo > 0 ? 1 : 0;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    // The inner glass walls catch the marquee light, so the playfield reads as
    // the inside of a lit cabinet rather than a floating plane.
    const wall = (0.05 + (state.status === "playing" ? 0.02 : 0)) * dim;
    ctx.globalAlpha = wall;
    const wallWidth = 170;
    ctx.drawImage(wallSprite(), GLASS.x, GLASS.y, wallWidth, GLASS.h);
    ctx.save();
    ctx.translate(GLASS.x + GLASS.w, 0);
    ctx.scale(-1, 1);
    ctx.drawImage(wallSprite(), 0, GLASS.y, wallWidth, GLASS.h);
    ctx.restore();

    // A slow reflection travels across the glass cover.
    if (!REDUCED_MOTION) {
      const sweep = (t * 0.075) % 1;
      const sweepX = GLASS.x - 220 + sweep * (GLASS.w + 440);
      ctx.globalAlpha = 0.12 * dim;
      ctx.save();
      ctx.translate(sweepX, GLASS.y + GLASS.h * 0.5);
      ctx.rotate(-0.26);
      ctx.drawImage(sheenSprite(), -210, -820, 420, 1640);
      ctx.restore();
    }

    for (const slot of slots) {
      const breathe = 0.74 + Math.sin(t * 1.6 + slot.x * 0.013) * 0.2;
      const power =
        (slot.jackpot ? 0.16 : 0.11) * breathe * dim + slot.flash * 0.7;
      lightGlow(slot.center, SLOT_TOP + 22, slot.w * 1.1, 180, slot.color, power);
      lightGlow(slot.center, SLOT_TOP - 30, slot.w * 1.6, 220, slot.color, power * 0.55);
    }

    const towerPulse = 0.5 + Math.sin(t * 2.1) * 0.18;
    lightGlow(
      JACKPOT_SLOT.center,
      SLOT_TOP - 118,
      220,
      430,
      C.gold,
      (0.06 + towerPulse * 0.04 + tension * 0.16) * dim
    );

    // Chase bulbs on the rail above the pockets. They idle slow, run while the
    // board is live, and sprint while a jackpot is being decided.
    const bulbCount = 34;
    const bulbSpeed = tension ? 26 : state.status === "playing" ? 15 : 6;
    const head = (t * bulbSpeed) % (bulbCount + 10);
    const railY = SLOT_TOP - 13;
    for (let i = 0; i < bulbCount; i++) {
      const x = PLAY.left + 12 + (i / (bulbCount - 1)) * (PLAY.right - PLAY.left - 24);
      const distance = Math.abs(i - head);
      const wave = distance < 9 ? Math.pow(1 - distance / 9, 2.2) : 0;
      const shimmer = 0.5 + Math.sin(t * 5.5 + i * 1.7) * 0.14;
      const bulb = (0.1 * shimmer + wave * 0.72) * dim;

      lightGlow(x, railY, wave > 0.2 ? 54 : 26, wave > 0.2 ? 54 : 26, C.gold, bulb);
      if (wave > 0.04) {
        ctx.globalAlpha = Math.min(1, wave * 1.15);
        ctx.fillStyle = "#fff5dc";
        ctx.beginPath();
        ctx.arc(x, railY, 1.3 + wave * 1.3, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    for (const ball of state.activeBalls) {
      const speed = Math.hypot(ball.vx, ball.vy);
      const halo = clamp(0.16 + speed / 2300, 0.16, 0.52) * ball.alpha;
      lightGlow(ball.x, ball.y, 58, 58, ball.gold ? C.gold : C.cyan, halo);
    }

    for (const pin of pins) {
      if (pin.flash > 0.02) {
        lightGlow(pin.x, pin.y, 46, 46, pin.gold ? C.gold : C.cyan, pin.flash * 0.4);
      }
      if (pin.gold) {
        // Gold pins used to glow with a canvas shadow on every pin, every frame.
        // A cached sprite is the same halo for one cheap blit.
        const shimmer = 0.6 + Math.sin(t * 2.2 + pin.id) * 0.18;
        lightGlow(pin.x, pin.y, 32, 32, C.gold, 0.16 * shimmer * dim);
      }
    }

    ctx.restore();
  }

  function drawFloatingTexts() {
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const float of state.floats) {
      const progress = 1 - float.life / float.maxLife;
      const alpha = Math.min(1, progress * 9, float.life / (float.maxLife * 0.3));

      ctx.globalAlpha = clamp(alpha, 0, 1);
      const size = float.size * boardTypeScale;
      ctx.font = `700 ${size}px Bahnschrift, "Trebuchet MS", sans-serif`;
      // Bigger type on a small board would run off the sides of the glass on the
      // edge slots, so the label is kept inside the playfield.
      const half = ctx.measureText(float.text).width / 2 + 18;
      const x = clamp(float.x, GLASS.x + half, GLASS.x + GLASS.w - half);
      ctx.lineWidth = 3 * boardTypeScale;
      ctx.strokeStyle = "rgba(3, 5, 12, 0.78)";
      ctx.strokeText(float.text, x, float.y);
      ctx.fillStyle = float.color;
      ctx.fillText(float.text, x, float.y);
    }
    ctx.restore();
  }

  // One tiled pattern instead of ~215 separate fillRect calls per frame.
  function drawScanlines() {
    if (!scanlinePattern) {
      const strip = document.createElement("canvas");
      strip.width = 4;
      strip.height = 4;
      const paint = strip.getContext("2d");
      paint.fillStyle = "rgba(189, 238, 232, 0.035)";
      paint.fillRect(0, 1, 4, 1);
      scanlinePattern = ctx.createPattern(strip, "repeat");
    }
    if (!scanlinePattern) return;
    ctx.save();
    ctx.fillStyle = scanlinePattern;
    ctx.fillRect(GLASS.x, GLASS.y, GLASS.w, SLOT_BOTTOM - GLASS.y);
    ctx.restore();
  }

  function drawVignette() {
    if (!vignetteGradient) {
      vignetteGradient = ctx.createRadialGradient(W / 2, 455, 170, W / 2, 500, 590);
      vignetteGradient.addColorStop(0, "rgba(0, 0, 0, 0)");
      vignetteGradient.addColorStop(0.66, "rgba(1, 3, 10, 0.08)");
      vignetteGradient.addColorStop(1, "rgba(1, 3, 10, 0.62)");
    }
    ctx.fillStyle = vignetteGradient;
    ctx.fillRect(GLASS.x, GLASS.y, GLASS.w, GLASS.h);
  }

  function drawTensionOverlay() {
    if (state.slowMo <= 0.001 || !state.tensionBall) return;

    const ball = state.tensionBall;
    const strength = clamp(state.slowMo / 0.95, 0, 1);
    const pulse = 0.74 + Math.sin(state.time * 16) * 0.26;

    ctx.save();
    const focus = ctx.createRadialGradient(ball.x, ball.y, 24, ball.x, ball.y, 560);
    focus.addColorStop(0, "rgba(255, 202, 99, 0)");
    focus.addColorStop(0.32, `rgba(4, 7, 16, ${0.04 * strength})`);
    focus.addColorStop(1, `rgba(1, 3, 9, ${0.66 * strength})`);
    ctx.fillStyle = focus;
    ctx.fillRect(GLASS.x, GLASS.y, GLASS.w, GLASS.h);

    ctx.strokeStyle = `rgba(255, 203, 102, ${0.62 * strength * pulse})`;
    ctx.lineWidth = 1.2;
    ctx.shadowColor = `rgba(255, 194, 82, ${0.55 * strength})`;
    ctx.shadowBlur = 15;
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r + 13 + pulse * 5, 0, Math.PI * 2);
    ctx.stroke();

    ctx.globalAlpha = 0.3 * strength;
    ctx.strokeStyle = "rgba(255, 239, 202, 0.7)";
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.r + 25 + pulse * 7, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  function flyTokenToHud(slot) {
    if (REDUCED_MOTION || !slot || !ui.tokenBtn) return;

    const board = canvas.getBoundingClientRect();
    const target = ui.tokenBtn.getBoundingClientRect();
    if (!board.width || !target.width) return;

    const fromX = board.left + (slot.center / W) * board.width;
    const fromY = board.top + ((SLOT_TOP + 26) / H) * board.height;
    const toX = target.left + target.width / 2;
    const toY = target.top + target.height / 2;
    const dx = toX - fromX;
    const dy = toY - fromY;

    const token = document.createElement("div");
    token.className = "token-fly";
    token.textContent = "✦";
    token.setAttribute("aria-hidden", "true");
    token.style.left = `${fromX}px`;
    token.style.top = `${fromY}px`;
    document.body.appendChild(token);

    if (typeof token.animate !== "function") {
      token.remove();
      return;
    }

    const animation = token.animate(
      [
        {
          transform: "translate(-50%, -50%) scale(0.35) rotate(0deg)",
          opacity: 0
        },
        {
          transform: `translate(calc(-50% + ${dx * 0.28}px), calc(-50% + ${dy * 0.26 - 96}px)) scale(1.18) rotate(150deg)`,
          opacity: 1,
          offset: 0.38
        },
        {
          transform: `translate(calc(-50% + ${dx * 0.72}px), calc(-50% + ${dy * 0.7 - 52}px)) scale(0.95) rotate(300deg)`,
          opacity: 1,
          offset: 0.72
        },
        {
          transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) scale(0.35) rotate(420deg)`,
          opacity: 0
        }
      ],
      {
        duration: 960,
        easing: "cubic-bezier(0.2, 0.72, 0.18, 1)"
      }
    );

    const cleanup = () => token.remove();
    animation.onfinish = cleanup;
    animation.oncancel = cleanup;
    window.setTimeout(cleanup, 1300);
  }

  function haptic(pattern) {
    if (REDUCED_MOTION) return;
    try {
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch {
      // Haptics are a progressive enhancement.
    }
  }

  function drawGlassOverlay() {
    ctx.save();
    roundPath(GLASS.x, GLASS.y, GLASS.w, GLASS.h, GLASS.r);
    ctx.clip();

    const glare = ctx.createLinearGradient(40, 80, 470, 890);
    glare.addColorStop(0, "rgba(255, 255, 255, 0.06)");
    glare.addColorStop(0.2, "rgba(255, 255, 255, 0.012)");
    glare.addColorStop(0.5, "rgba(255, 255, 255, 0)");
    glare.addColorStop(1, "rgba(255, 255, 255, 0.018)");
    ctx.fillStyle = glare;
    ctx.fillRect(GLASS.x, GLASS.y, GLASS.w, GLASS.h);

    ctx.globalAlpha = 0.2;
    ctx.strokeStyle = "rgba(255, 255, 255, 0.14)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(GLASS.x + 26, GLASS.y + 8);
    ctx.lineTo(GLASS.x + 340, GLASS.y + 8);
    ctx.stroke();
    ctx.restore();

    ctx.save();
    roundPath(GLASS.x, GLASS.y, GLASS.w, GLASS.h, GLASS.r);
    ctx.strokeStyle = "rgba(255, 240, 211, 0.2)";
    ctx.lineWidth = 1.3;
    ctx.stroke();

    roundPath(GLASS.x + 4, GLASS.y + 4, GLASS.w - 8, GLASS.h - 8, GLASS.r - 4);
    ctx.strokeStyle = "rgba(0, 0, 0, 0.35)";
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();
  }

  function drawCabinetDetails() {
    ctx.save();

    // Side accent strips.
    const strip = ctx.createLinearGradient(0, 90, 0, 1010);
    strip.addColorStop(0, "rgba(255, 201, 103, 0)");
    strip.addColorStop(0.16, "rgba(255, 201, 103, 0.24)");
    strip.addColorStop(0.5, "rgba(255, 201, 103, 0.08)");
    strip.addColorStop(0.84, "rgba(255, 201, 103, 0.18)");
    strip.addColorStop(1, "rgba(255, 201, 103, 0)");
    ctx.fillStyle = strip;
    ctx.fillRect(20, 98, 2, 916);
    ctx.fillRect(738, 98, 2, 916);

    // Screws.
    const screws = [
      [25, 25],
      [735, 25],
      [25, 1035],
      [735, 1035]
    ];
    for (const [x, y] of screws) {
      ctx.fillStyle = "#0a0c17";
      ctx.beginPath();
      ctx.arc(x, y, 5.2, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = "rgba(255, 242, 218, 0.15)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(x, y, 3.4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.strokeStyle = "rgba(255, 242, 218, 0.28)";
      ctx.beginPath();
      ctx.moveTo(x - 2, y);
      ctx.lineTo(x + 2, y);
      ctx.stroke();
    }

    // Lower cabinet lip.
    ctx.strokeStyle = "rgba(255, 240, 211, 0.08)";
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(54, 1029);
    ctx.lineTo(706, 1029);
    ctx.stroke();

    ctx.restore();
  }

  function drawDiamond(x, y, size) {
    ctx.beginPath();
    ctx.moveTo(x, y - size);
    ctx.lineTo(x + size, y);
    ctx.lineTo(x, y + size);
    ctx.lineTo(x - size, y);
    ctx.closePath();
    ctx.fill();
  }

  function drawSpacedText(text, centerX, y, spacing) {
    const chars = Array.from(text);
    let totalWidth = 0;
    for (const char of chars) totalWidth += ctx.measureText(char).width + spacing;
    totalWidth -= spacing;

    let x = centerX - totalWidth / 2;
    const previousAlign = ctx.textAlign;
    ctx.textAlign = "left";
    for (const char of chars) {
      ctx.fillText(char, x, y);
      x += ctx.measureText(char).width + spacing;
    }
    ctx.textAlign = previousAlign;
  }

  function roundPath(x, y, w, h, r) {
    const radius = Math.min(r, Math.abs(w) / 2, Math.abs(h) / 2);
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.arcTo(x + w, y, x + w, y + h, radius);
    ctx.arcTo(x + w, y + h, x, y + h, radius);
    ctx.arcTo(x, y + h, x, y, radius);
    ctx.arcTo(x, y, x + w, y, radius);
    ctx.closePath();
  }

  function ensureAudio() {
    if (state.muted) return null;
    try {
      if (!audioCtx) {
        const AudioContextCtor = window.AudioContext || window.webkitAudioContext;
        if (!AudioContextCtor) return null;
        audioCtx = new AudioContextCtor();
      }
      if (!audioBus) audioBus = buildAudioBus(audioCtx);
      loadBumperSample(audioCtx);
      if (audioCtx.state === "suspended") {
        audioCtx.resume().catch(() => {});
      }
      return audioCtx;
    } catch {
      return null;
    }
  }

  // One master chain for everything: gentle glue compression so a burst of
  // twelve balls never clips, plus a short plate tail for depth.
  function buildAudioBus(ac) {
    const master = ac.createGain();
    master.gain.value = 0.9 * masterVolume;

    const comp = ac.createDynamicsCompressor();
    comp.threshold.value = -13;
    comp.knee.value = 24;
    comp.ratio.value = 2.6;
    comp.attack.value = 0.005;
    comp.release.value = 0.2;

    master.connect(comp).connect(ac.destination);

    let reverb = null;
    try {
      reverb = ac.createConvolver();
      reverb.buffer = makeImpulse(ac, 0.6, 3.2);
      const returnGain = ac.createGain();
      returnGain.gain.value = 0.7;
      reverb.connect(returnGain).connect(master);
    } catch {
      reverb = null;
    }

    return { master, reverb };
  }

  function makeImpulse(ac, seconds, decay) {
    const length = Math.max(1, Math.floor(ac.sampleRate * seconds));
    const buffer = ac.createBuffer(2, length, ac.sampleRate);
    for (let channel = 0; channel < buffer.numberOfChannels; channel++) {
      const data = buffer.getChannelData(channel);
      for (let i = 0; i < length; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
      }
    }
    return buffer;
  }

  function getNoiseBuffer(ac) {
    if (noiseBuffer && noiseBuffer.sampleRate === ac.sampleRate) return noiseBuffer;
    const length = Math.floor(ac.sampleRate * 0.7);
    noiseBuffer = ac.createBuffer(1, length, ac.sampleRate);
    const data = noiseBuffer.getChannelData(0);
    for (let i = 0; i < length; i++) data[i] = Math.random() * 2 - 1;
    return noiseBuffer;
  }

  // A short band-passed noise sweep. Used for the wheel's air: spinning up,
  // settling down, and the little paper hush when a reward card lands.
  function noiseSweep(from, to, duration, volume, q, pan, wet) {
    const ac = ensureAudio();
    if (!ac) return;
    const start = ac.currentTime;
    const noise = ac.createBufferSource();
    noise.buffer = getNoiseBuffer(ac);
    noise.loop = true;

    const band = ac.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = q || 1;
    band.frequency.setValueAtTime(Math.max(40, from), start);
    band.frequency.exponentialRampToValueAtTime(Math.max(40, to), start + duration);

    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + duration * 0.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    noise.connect(band).connect(gain);
    routeToBus(ac, gain, pan || 0, Number.isFinite(wet) ? wet : 0.14);

    noise.start(start);
    noise.stop(start + duration + 0.05);
  }

  // Moves the room tone to a new level. Used to get out of the way of the
  // spin, the landing and the reveal instead of fighting them.
  function duckRoomBed(level, seconds) {
    const ac = audioCtx;
    if (!ac || !roomBed) return;
    const now = ac.currentTime;
    try {
      roomBed.gain.gain.cancelScheduledValues(now);
      roomBed.gain.gain.setValueAtTime(Math.max(0.0002, roomBed.gain.gain.value), now);
      roomBed.gain.gain.exponentialRampToValueAtTime(
        Math.max(0.0002, level),
        now + Math.max(0.06, seconds || 0.2)
      );
    } catch {
      // Suspended context; nothing to duck.
    }
  }

  // The vault has its own room tone while it is open: a filtered low pad and a
  // whisper of air, plus an occasional soft chime from the shelves. It fills the
  // silence between the board and the wheel without becoming a soundtrack.
  function startRoomAmbience() {
    const ac = ensureAudio();
    if (!ac || roomBed) return;

    const start = ac.currentTime + 0.03;
    const bed = {
      gain: ac.createGain(),
      voices: [],
      sum: ac.createGain()
    };

    const padFilter = ac.createBiquadFilter();
    padFilter.type = "lowpass";
    padFilter.frequency.value = 680;
    padFilter.Q.value = 0.5;

    const padGain = ac.createGain();
    padGain.gain.value = 1;
    padFilter.connect(padGain).connect(bed.sum);

    const chord = [
      { hz: 110, vol: 0.3, type: "sine" },
      { hz: 110.4, vol: 0.16, type: "sine" },
      { hz: 164.81, vol: 0.19, type: "sine" },
      { hz: 220, vol: 0.13, type: "triangle" },
      { hz: 329.63, vol: 0.055, type: "sine" },
      { hz: 440, vol: 0.02, type: "sine" }
    ];

    for (const note of chord) {
      const osc = ac.createOscillator();
      osc.type = note.type;
      osc.frequency.value = note.hz;
      const voice = ac.createGain();
      voice.gain.value = note.vol;
      osc.connect(voice).connect(padFilter);
      osc.start(start);
      bed.voices.push(osc);
    }

    // Slow breathing so the room never sits perfectly still.
    const lfo = ac.createOscillator();
    lfo.frequency.value = 0.055;
    const lfoDepth = ac.createGain();
    lfoDepth.gain.value = 0.3;
    lfo.connect(lfoDepth).connect(padGain.gain);
    lfo.start(start);
    bed.voices.push(lfo);

    bed.gain.gain.setValueAtTime(0.0001, start);
    // Room tone is a bed, not a soundtrack: it has to sit clearly under the
    // ticks, the landing and the reveal.
    bed.gain.gain.exponentialRampToValueAtTime(ROOM_BED_LEVEL, start + 1.3);
    bed.sum.connect(bed.gain);
    routeToBus(ac, bed.gain, 0, 0.5);

    roomBed = bed;
    scheduleRoomChime();
  }

  function scheduleRoomChime() {
    window.clearTimeout(roomChimeTimer);
    if (!roomBed) return;
    const wait = 7000 + Math.random() * 6500;
    roomChimeTimer = window.setTimeout(() => {
      if (!roomBed || state.muted) return;
      const scale = [523.25, 587.33, 698.46, 783.99, 880];
      const note = scale[Math.floor(Math.random() * scale.length)];
      tone(note, 1.35, "sine", 0.0065, note * 1.001, 0, 0, 0.85);
      if (Math.random() < 0.45) {
        tone(note * 1.5, 1.6, "sine", 0.004, note * 1.5, 0, 0.34, 0.9);
      }
      scheduleRoomChime();
    }, wait);
  }

  // The last second of a spin dips the room away and blooms a held G under it,
  // so the landing chord lands in a pocket of quiet. G is the dominant of the
  // C-major reveal, so the whole thing resolves instead of just stopping.
  function startWheelTension() {
    const ac = ensureAudio();
    if (!ac || tensionVoice) return;

    const start = ac.currentTime;
    const voice = { gain: ac.createGain(), oscs: [] };

    const filter = ac.createBiquadFilter();
    filter.type = "lowpass";
    filter.Q.value = 0.9;
    filter.frequency.setValueAtTime(560, start);
    filter.frequency.linearRampToValueAtTime(1500, start + 1.5);

    const notes = [
      { hz: 49, vol: 0.16, type: "sine" },
      { hz: 98, vol: 0.34, type: "sine" },
      { hz: 196, vol: 0.5, type: "sine" },
      { hz: 293.66, vol: 0.24, type: "sine" },
      { hz: 392, vol: 0.1, type: "triangle" }
    ];

    for (const note of notes) {
      const osc = ac.createOscillator();
      osc.type = note.type;
      osc.frequency.setValueAtTime(note.hz, start);
      // Barely rising: enough to tighten the chest, not enough to sound out of tune.
      osc.frequency.linearRampToValueAtTime(note.hz * 1.014, start + 1.6);
      const voiceGain = ac.createGain();
      voiceGain.gain.value = note.vol;
      osc.connect(voiceGain).connect(filter);
      osc.start(start);
      voice.oscs.push(osc);
    }

    filter.connect(voice.gain);
    voice.gain.gain.setValueAtTime(0.0001, start);
    voice.gain.gain.exponentialRampToValueAtTime(0.018, start + 1.2);
    voice.gain.gain.setValueAtTime(0.018, start + 1.8);
    routeToBus(ac, voice.gain, 0, 0.42);

    tensionVoice = voice;

    // Take the room down so the drone has somewhere to sit.
    duckRoomBed(0.0055, 0.6);

    // Safety net: if the landing event is ever missed (muting mid-spin, a tab
    // losing focus), the drone still releases instead of hanging forever.
    window.clearTimeout(tensionTimer);
    tensionTimer = window.setTimeout(endWheelTension, 6500);
  }

  function endWheelTension() {
    window.clearTimeout(tensionTimer);
    tensionTimer = 0;

    const ac = audioCtx;
    if (!ac) return;
    const now = ac.currentTime;

    if (tensionVoice) {
      const voice = tensionVoice;
      tensionVoice = null;
      try {
        voice.gain.gain.cancelScheduledValues(now);
        voice.gain.gain.setValueAtTime(Math.max(0.0002, voice.gain.gain.value), now);
        voice.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.16);
      } catch {
        // Already silent.
      }
      for (const osc of voice.oscs) {
        try {
          osc.stop(now + 0.22);
        } catch {
          // Already stopped.
        }
      }
      window.setTimeout(() => {
        try {
          voice.gain.disconnect();
        } catch {
          // Already torn down.
        }
      }, 600);
    }

    // The room breathes back in behind the landing chord and the reveal.
    if (roomBed) {
      try {
        roomBed.gain.gain.cancelScheduledValues(now);
        roomBed.gain.gain.setValueAtTime(Math.max(0.0002, roomBed.gain.gain.value), now);
        // Sink a little further into the quiet, then breathe back in as the
        // reward card appears.
        roomBed.gain.gain.exponentialRampToValueAtTime(0.0014, now + 0.7);
        roomBed.gain.gain.exponentialRampToValueAtTime(ROOM_BED_LEVEL, now + 2.1);
      } catch {
        // Suspended context; nothing to restore.
      }
    }
  }

  function stopRoomAmbience() {
    endWheelTension();
    window.clearTimeout(roomChimeTimer);
    if (!roomBed) return;
    const bed = roomBed;
    roomBed = null;
    const ac = audioCtx;
    if (!ac) return;

    const now = ac.currentTime;
    try {
      bed.gain.gain.cancelScheduledValues(now);
      bed.gain.gain.setValueAtTime(Math.max(0.0002, bed.gain.gain.value), now);
      bed.gain.gain.exponentialRampToValueAtTime(0.0001, now + 0.55);
    } catch {
      // A suspended context cannot be scheduled; the nodes will just idle.
    }

    for (const voice of bed.voices) {
      try {
        voice.stop(now + 0.6);
      } catch {
        // Already stopped.
      }
    }

    window.setTimeout(() => {
      try {
        bed.gain.disconnect();
        bed.sum.disconnect();
      } catch {
        // Already torn down.
      }
    }, 900);
  }

  // The gold bumper hit is a real recorded sample (trimmed from the supplied
  // wav and embedded in audio/bump.js so it also loads from file://). The
  // synthesised mallet stays as the fallback for the moment before the buffer
  // is decoded, or if the file is missing.
  let bumperSample = null;
  let bumperLoading = false;

  function loadBumperSample(ac) {
    if (bumperSample || bumperLoading || !window.NOVA_BUMP_SAMPLE) return;
    bumperLoading = true;
    try {
      const base64 = window.NOVA_BUMP_SAMPLE.split(",")[1] || "";
      const binary = atob(base64);
      const bytes = new Uint8Array(binary.length);
      for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
      ac.decodeAudioData(
        bytes.buffer,
        (decoded) => {
          bumperSample = decoded;
          bumperLoading = false;
        },
        () => {
          bumperLoading = false;
        }
      );
    } catch {
      bumperLoading = false;
    }
  }

  function playBumperSample(power, pan, wet) {
    const ac = audioCtx;
    if (!ac || !bumperSample) return false;
    const src = ac.createBufferSource();
    src.buffer = bumperSample;
    // A touch of pitch/rate variation per hit so repeats do not machine-gun,
    // and the size of the hit is audible as well as visible.
    src.playbackRate.value = 0.93 + power * 0.17 + (Math.random() - 0.5) * 0.04;

    const gain = ac.createGain();
    // The sample is peak-normalised to -6 dBFS, which is hot next to the
    // synthesised pin voices (~-26 dBFS), so it sits well back: audible over
    // the field, never the loudest thing on the board.
    gain.gain.value = 0.2 + power * 0.15;
    src.connect(gain);
    routeToBus(ac, gain, pan, wet);
    src.start(ac.currentTime);
    return true;
  }

  function routeToBus(ac, node, pan, wet) {
    let tail = node;
    const amount = Number.isFinite(pan) ? pan : 0;
    if (ac.createStereoPanner && Math.abs(amount) > 0.004) {
      const panner = ac.createStereoPanner();
      panner.pan.value = clamp(amount, -1, 1);
      node.connect(panner);
      tail = panner;
    }

    if (!audioBus) {
      tail.connect(ac.destination);
      return;
    }

    tail.connect(audioBus.master);
    const send = Number.isFinite(wet) ? clamp(wet, 0, 1) : 0.1;
    if (audioBus.reverb && send > 0) {
      const sendGain = ac.createGain();
      sendGain.gain.value = send;
      tail.connect(sendGain).connect(audioBus.reverb);
    }
  }

  function tone(frequency, duration, type, volume, slideTo, pan, delay, wet) {
    const ac = ensureAudio();
    if (!ac) return null;
    const start = ac.currentTime + (delay || 0);
    const oscillator = ac.createOscillator();
    const gain = ac.createGain();

    oscillator.type = type || "sine";
    oscillator.frequency.setValueAtTime(frequency, start);
    if (slideTo) {
      oscillator.frequency.exponentialRampToValueAtTime(
        Math.max(24, slideTo),
        start + duration
      );
    }

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(gain);
    routeToBus(ac, gain, pan, wet);

    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
    return oscillator;
  }

  // Pin hits are the bulk of the mix, so each one gets a little body:
  // per-ball register, impact-driven brightness, and almost no reverb.
  function pinVoice(ac, frequency, duration, volume, pan, cutoff) {
    const start = ac.currentTime;
    const oscillator = ac.createOscillator();
    const filter = ac.createBiquadFilter();
    const gain = ac.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(frequency, start);
    oscillator.frequency.exponentialRampToValueAtTime(
      Math.max(40, frequency * 0.93),
      start + duration
    );

    filter.type = "lowpass";
    filter.Q.value = 0.8;
    filter.frequency.setValueAtTime(cutoff, start);
    filter.frequency.exponentialRampToValueAtTime(
      Math.max(420, cutoff * 0.4),
      start + duration
    );

    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(Math.max(0.0002, volume), start + 0.004);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + duration);

    oscillator.connect(filter).connect(gain);
    routeToBus(ac, gain, pan, 0.045);

    oscillator.start(start);
    oscillator.stop(start + duration + 0.02);
  }

  function sfxPin(x, impact, chainHits, ball) {
    const ac = ensureAudio();
    if (!ac) return;

    const pan = clamp((x / W) * 1.5 - 0.75, -0.86, 0.86);
    const scale = [0, 2, 4, 7, 9, 12, 14, 16, 19, 21, 24, 26, 28, 31];
    const note = scale[Math.min(scale.length - 1, Math.floor(chainHits / 2))];
    // Each ball sings in its own register (root / fifth / octave) so a burst of
    // twelve does not collapse into one unison pitch.
    const register = ball ? [0, 7, 12][ball.voice % 3] : 0;
    const base = 220 * Math.pow(2, (note + register) / 12);
    const frequency = base + Math.random() * 6 + clamp(impact, 0, 400) * 0.02;

    const soft = 1 - Math.min(0.3, chainHits * 0.006);
    const volume = (0.011 + Math.min(0.016, impact * 0.000055)) * soft;
    const cutoff = 900 + Math.min(5600, impact * 15);
    const duration = 0.045 + Math.min(0.03, impact * 0.00009) + Math.random() * 0.015;

    pinVoice(ac, frequency, duration, volume, pan, cutoff);
    if (impact > 250) {
      pinVoice(ac, frequency * 2, duration * 0.8, volume * 0.3, pan, cutoff * 1.5);
    }
  }

  function sfxGoldPin() {
    tone(1060, 0.14, "sine", 0.026, 1420, 0);
    tone(1590, 0.11, "triangle", 0.012, 1760, 0, 0.03);
  }

  // A felt mallet on a marimba bar. The old version was a spring, a click and a
  // burst of noise, which is exciting once and tiring after fifty: bright,
  // hissy and all attack. This is round, stays on the board's pentatonic
  // ladder, and gets out of the way in a fifth of a second, so a long session
  // still sounds like a room and not a warning.
  function sfxBumper(impact, launchSpeed) {
    const power = clamp((launchSpeed || impact) / 1300, 0.4, 1);
    const pan = (Math.random() - 0.5) * 0.3;

    // A wider reverb send than the pins get, so the hit has a little room
    // around it instead of stopping dead.
    if (playBumperSample(power, pan, 0.3)) return;

    const base = 392 + power * 132; // G4 up towards B4 as the hit gets harder
    tone(base, 0.2, "sine", 0.03, base * 1.004, pan, 0, 0.18);
    tone(base * 2, 0.1, "sine", 0.011, base * 2, pan, 0.004, 0.12);
    tone(base * 3, 0.06, "sine", 0.004, base * 3, pan, 0.008, 0.1);
    // The pin taking the hit: a soft wooden tick with no air under it.
    tone(150, 0.085, "triangle", 0.013, 118, pan, 0, 0.04);
  }

  // Heat ignites: a warm rise, not an alarm. Three notes climbing the same
  // pentatonic ladder the pins use, with the top one ringing out.
  function sfxBoardHot() {
    tone(392, 0.5, "sine", 0.03, 415, 0, 0, 0.34);
    tone(587, 0.55, "sine", 0.024, 622, 0, 0.09, 0.34);
    tone(880, 0.8, "triangle", 0.018, 932, 0, 0.18, 0.38);
    tone(1175, 0.5, "sine", 0.009, 1245, 0, 0.22, 0.3);
  }

  // The overflow offer is a question, so it is two notes that do not resolve:
  // a fourth that leans upward and stops.
  function sfxOverflowOffer() {
    tone(349, 0.34, "sine", 0.03, 349, 0, 0, 0.3);
    tone(466, 0.6, "sine", 0.022, 470, 0, 0.18, 0.36);
  }

  // The machine takes the decision out of your hands and fires the ball.
  function sfxPlunge() {
    tone(110, 0.42, "triangle", 0.034, 220, 0, 0, 0.16);
    tone(330, 0.3, "sine", 0.016, 494, 0, 0.06, 0.2);
  }

  // The plunge: the room leans in further than it does for a final ball. A long
  // sub swell, two heartbeats underneath, and a fifth that climbs and holds,
  // unresolved, until the ball actually lands.
  function sfxPlungeTension() {
    tone(48, 1.6, "sine", 0.05, 41, 0, 0, 0.22);
    tone(98, 1.3, "sine", 0.024, 104, 0, 0.06, 0.26);
    [0, 0.44].forEach((offset) => {
      tone(58, 0.18, "sine", 0.042, 46, 0, 0.34 + offset, 0.1);
      tone(58, 0.13, "sine", 0.026, 44, 0, 0.51 + offset, 0.1);
    });
    tone(392, 1.6, "triangle", 0.011, 587, 0.1, 1.05, 0.32);
  }

  // The plunge found the jackpot: a riser running straight into the double-pot
  // chord, so the win has an approach instead of just a hit.
  function sfxPlungeWin() {
    [392, 523, 659, 784].forEach((frequency, index) => {
      tone(frequency, 0.16, "triangle", 0.019, frequency, 0, index * 0.055, 0.2);
    });
    tone(1568, 0.85, "sine", 0.01, 1580, 0, 0.26, 0.42);
    tone(2093, 0.4, "sine", 0.006, 2100, 0, 0.34, 0.3);
  }

  // The plunge missed: two soft notes falling a step, and a low breath under
  // them. Nothing sharp — the pot is safe, so this is a shrug, not a sting.
  function sfxPlungeMiss() {
    tone(330, 0.32, "sine", 0.026, 318, 0, 0, 0.24);
    tone(262, 0.62, "sine", 0.022, 250, 0, 0.15, 0.32);
    tone(131, 0.5, "triangle", 0.014, 120, 0, 0.15, 0.12);
  }

  // A plunge that lands: the pot doubles and the room says so.
  function sfxDoublePot() {
    const notes = [784, 1046, 1318, 1568];
    notes.forEach((frequency, index) => {
      tone(frequency, 0.3, "sine", 0.03, frequency * 1.02, 0, index * 0.07, 0.34);
    });
    tone(392, 0.7, "sine", 0.03, 392, 0, 0.06, 0.22);
  }

  // The last ball of a run: the room notices. A low swell, two heartbeats and
  // a held fifth, gone quiet enough that the landing chord still has room.
  // A landing worth watching. The last ball already has four times the screen
  // time, so the sound has to carry four times the weight: a deep "it's down"
  // thud for every slot, then a phrase that scales with what the slot pays.
  function sfxFinalLanding(slot) {
    const jackpot = !!slot.jackpot;
    const bonus = !!slot.bonus;
    const value = Number(slot.value) || 0;

    // The ball settling into the pocket.
    tone(74, 0.55, "sine", 0.055, 52, 0, 0, 0.28);
    tone(112, 0.3, "sine", 0.03, 86, 0, 0.02, 0.2);

    if (jackpot) {
      // A small fanfare: the gold chord from the jackpot, stretched out.
      [261.63, 329.63, 392, 523.25, 659.25].forEach((hz, index) => {
        tone(hz, 1.3, "sine", 0.03, hz, 0, 0.08 + index * 0.07, 0.62);
      });
      tone(65.4, 1.7, "sine", 0.036, 49, 0, 0, 0.4);
      tone(1046.5, 0.9, "sine", 0.014, 1046.5, 0, 0.34, 0.6);
      noiseSweep(900, 5400, 1, 0.0045, 2.3, 0, 0.55);
      haptic([0, 34, 40, 90]);
    } else if (bonus) {
      // Bonus ball: bright, forward, promising more.
      [523.25, 659.25, 783.99, 1046.5, 1318.5].forEach((hz, index) => {
        tone(hz, 0.5, "triangle", 0.026, hz, 0, 0.05 + index * 0.075, 0.4);
      });
      haptic([0, 18, 24, 36]);
    } else if (value >= 500) {
      [392, 523.25, 659.25, 784].forEach((hz, index) => {
        tone(hz, 0.6, "sine", 0.028, hz, 0, 0.04 + index * 0.08, 0.42);
      });
      tone(98, 0.7, "sine", 0.02, 82, 0, 0, 0.3);
      haptic(22);
    } else {
      // The small slots still get a settled two-note answer, not a boop.
      tone(293.66, 0.45, "sine", 0.026, 293.66, 0, 0.06, 0.34);
      tone(440, 0.6, "sine", 0.02, 440, 0, 0.16, 0.4);
      tone(146.83, 0.5, "sine", 0.018, 130, 0, 0, 0.25);
      haptic(14);
    }
  }

  function sfxFinalBall() {
    tone(65.4, 1.7, "sine", 0.03, 61.7, 0, 0, 0.45);
    tone(98, 1.5, "sine", 0.017, 92.5, 0, 0.05, 0.45);
    tone(196, 1.1, "sine", 0.011, 196, 0, 0.1, 0.4);
    tone(72, 0.22, "sine", 0.02, 58, 0, 0, 0.18);
    tone(72, 0.22, "sine", 0.013, 58, 0, 0.28, 0.18);
  }

  function sfxChainUp(multiplier) {
    const base = 440 * Math.pow(2, ((multiplier - 2) * 2) / 12);
    tone(base, 0.12, "triangle", 0.024, base * 1.05);
    tone(base * 1.5, 0.18, "sine", 0.017, base * 1.9, 0, 0.055);
  }

  function sfxTension() {
    tone(92, 0.5, "sine", 0.023, 68);
    tone(138, 0.36, "sine", 0.011, 102, 0, 0.11);
    tone(660, 0.5, "triangle", 0.008, 880, 0, 0.05);

    // A real riser: band-passed noise sweeping up under the slow motion, so the
    // jackpot beat feels like it is being drawn out instead of just quieter.
    const ac = ensureAudio();
    if (!ac) return;
    const start = ac.currentTime;
    const noise = ac.createBufferSource();
    noise.buffer = getNoiseBuffer(ac);

    const band = ac.createBiquadFilter();
    band.type = "bandpass";
    band.Q.value = 1.3;
    band.frequency.setValueAtTime(420, start);
    band.frequency.exponentialRampToValueAtTime(3400, start + 0.6);

    const gain = ac.createGain();
    gain.gain.setValueAtTime(0.0001, start);
    gain.gain.exponentialRampToValueAtTime(0.03, start + 0.5);
    gain.gain.exponentialRampToValueAtTime(0.0001, start + 0.68);

    noise.connect(band).connect(gain);
    routeToBus(ac, gain, 0, 0.22);

    noise.start(start);
    noise.stop(start + 0.72);
  }

  function sfxDrop(gold) {
    if (gold) {
      tone(530, 0.11, "sine", 0.028, 900);
      tone(930, 0.15, "triangle", 0.018, 1320, 0, 0.08);
    } else {
      tone(180, 0.08, "sine", 0.025, 260);
    }
  }

  function sfxPocket(value) {
    const base = value >= 500 ? 392 : 330;
    tone(base, 0.1, "triangle", 0.035, base * 1.3);
    tone(base * 1.5, 0.17, "sine", 0.025, base * 2, 0, 0.07);
  }

  function sfxBonus() {
    [523, 659, 784, 1046].forEach((frequency, index) => {
      tone(frequency, 0.16, "triangle", 0.026, frequency * 1.03, 0, index * 0.075);
    });
  }

  function sfxJackpot() {
    const notes = [523, 659, 784, 1046, 1318, 1568, 2093];
    notes.forEach((frequency, index) => {
      tone(
        frequency,
        0.26,
        index > 3 ? "sine" : "triangle",
        0.033,
        frequency * 1.015,
        0,
        index * 0.085,
        0.3
      );
    });
    tone(261, 0.7, "sine", 0.035, 262, 0, 0.1, 0.16);
    tone(392, 0.8, "sine", 0.025, 394, 0, 0.12, 0.16);
    tone(523, 0.9, "sine", 0.022, 526, 0, 0.14, 0.16);
    // Sub thump under the chord: felt more than heard on small speakers.
    tone(64, 0.42, "sine", 0.05, 42, 0, 0.01, 0);
  }

  function handleNovaSfx(detail) {
    if (!detail || state.muted) return;

    switch (detail.name) {
      case "wheel-open":
        tone(392, 0.11, "triangle", 0.03, 659);
        tone(784, 0.2, "sine", 0.018, 1174, 0, 0.08);
        startRoomAmbience();
        break;
      case "wheel-close":
        tone(659, 0.08, "sine", 0.02, 392);
        stopRoomAmbience();
        break;
      case "wheel-start":
        // The lever engaging, then felt against the rim, then a short rising
        // run that says "here we go". The room tone ducks underneath it so the
        // spin has the stage instead of the room hum.
        duckRoomBed(0.0042, 0.3);
        tone(126, 0.1, "triangle", 0.034, 82, 0, 0, 0.03);
        noiseSweep(1700, 320, 0.32, 0.009, 0.85, 0, 0.2);
        tone(196, 0.46, "sine", 0.022, 294, 0, 0.03, 0.12);
        tone(294, 0.5, "triangle", 0.012, 392, 0, 0.05, 0.2);
        [523.25, 659.25, 783.99, 1046.5].forEach((hz, index) => {
          tone(hz, 0.16, "triangle", 0.016, hz, 0, 0.16 + index * 0.075, 0.18);
        });
        spinTickCount = 0;
        break;
      case "pair":
        // Two stars finding each other: a small tick, then a soft fifth above.
        tone(440, 0.1, "sine", 0.02, 494, 0, 0, 0.12);
        tone(659, 0.34, "sine", 0.016, 660, 0, 0.06, 0.26);
        break;
      case "constellation":
        // A whole figure closing: a held open fifth with a ripple above it.
        tone(261, 0.9, "sine", 0.032, 262, 0, 0, 0.24);
        tone(392, 1.0, "sine", 0.024, 394, 0, 0.04, 0.28);
        tone(784, 0.7, "triangle", 0.012, 790, 0, 0.1, 0.36);
        tone(1046, 0.5, "sine", 0.008, 1048, 0, 0.18, 0.32);
        break;
      case "forge":
        // A piece being set into its socket: a struck tick, then the shelf
        // accepting it. Warmer and lower than the wheel's reveal stings, so
        // forging has its own voice.
        tone(196, 0.18, "triangle", 0.03, 164, 0, 0, 0.1);
        tone(784, 0.1, "sine", 0.013, 1175, 0, 0.02, 0.18);
        tone(523, 0.5, "sine", 0.019, 529, 0, 0.09, 0.3);
        tone(659, 0.55, "sine", 0.013, 666, 0, 0.13, 0.3);
        break;
      case "vault-tab":
        // A page turning somewhere in the vault, not a UI beep.
        tone(587, 0.07, "sine", 0.011, 784, 0, 0, 0.1);
        tone(880, 0.12, "sine", 0.007, 1046, 0, 0.035, 0.18);
        break;
      case "wheel-tick": {
        const progress = clamp(Number(detail.progress) || 0, 0, 1);
        const pan = (Math.random() - 0.5) * 0.36;
        // Fast rim ticks are high and quiet; as the wheel slows they drop in
        // pitch and get louder, the way a real wheel's clicks do.
        tone(
          880 - progress * 360 + Math.random() * 24,
          0.014 + progress * 0.01,
          "sine",
          0.006 + progress * 0.0082,
          470,
          pan,
          0,
          0.06
        );

        // Every sixth tick gets a soft bell that climbs as the wheel slows, so
        // the reel has a little melody instead of being pure clicks.
        spinTickCount += 1;
        if (spinTickCount % 6 === 0) {
          const melody = [784, 880, 988, 1046, 1174, 1318];
          const note = melody[clamp(Math.floor(progress * melody.length), 0, melody.length - 1)];
          tone(note, 0.24, "sine", 0.019, note, pan * 0.4, 0, 0.3);
        }
        // A wooden body under the click so the pegs feel like they have weight.
        tone(
          196 - progress * 46 + Math.random() * 13,
          0.02 + progress * 0.014,
          "triangle",
          0.0026 + progress * 0.0042,
          130,
          pan * 0.6,
          0,
          0.02
        );
        break;
      }
      case "wheel-tension":
        startWheelTension();
        break;
      case "wheel-land":
        // Cut the drone first so the landing chord arrives in the quiet it made.
        endWheelTension();
        tone(392, 0.16, "triangle", 0.052, 523);
        tone(659, 0.26, "sine", 0.04, 988, 0, 0.08);
        // The wheel settling into its pocket.
        tone(96, 0.24, "sine", 0.026, 74, 0, 0, 0.08);
        noiseSweep(1900, 420, 0.5, 0.009, 1.5, 0, 0.22);
        break;
      case "rarity-tick":
        // The ladder flickering past. Each tier previews its own reveal in
        // miniature, so a good roll can be heard coming before it lands.
        sfxRarityTick(Number(detail.rank) || 0);
        break;
      case "wheel-reveal":
        duckRoomBed(ROOM_BED_LEVEL, 1.1);
        sfxWheelReveal(Number(detail.rank) || 0);
        // The reward card being set down on the table.
        tone(150, 0.14, "sine", 0.016, 104, 0, 0.02, 0.06);
        noiseSweep(900, 240, 0.26, 0.0055, 1.7, 0, 0.18);
        break;
      case "token-earned":
        sfxTokenEarned();
        break;
      case "relic-equip":
        tone(392, 0.1, "triangle", 0.025, 523);
        tone(587, 0.16, "sine", 0.017, 784, 0, 0.06);
        break;
      case "spark-armed":
        tone(523, 0.12, "triangle", 0.027, 784);
        tone(784, 0.19, "sine", 0.02, 1046, 0, 0.07);
        tone(1046, 0.26, "sine", 0.013, 1318, 0, 0.13);
        break;
      default:
        break;
    }
  }

  // Each tier has its own voice rather than just more notes than the last:
  // a dry wooden knock, a bright partner, a blooming triad, then the weighted
  // chords below. The same ladder is used twice — quietly as each tier flicks
  // past on the reward card, loudly when it finally lands — so the flicker
  // itself tells you how good the roll is about to be.
  function sfxRarityTick(rank) {
    const r = clamp(Math.floor(rank), 0, 4);
    const pan = (Math.random() - 0.5) * 0.28;

    if (r === 0) {
      tone(300, 0.075, "sine", 0.027, 268, pan, 0, 0.02);
    } else if (r === 1) {
      tone(440, 0.085, "sine", 0.027, 440, pan, 0, 0.04);
      tone(660, 0.07, "sine", 0.01, 660, pan, 0.006, 0.07);
    } else if (r === 2) {
      tone(587, 0.1, "triangle", 0.026, 587, pan, 0, 0.06);
      tone(880, 0.08, "sine", 0.013, 880, pan * 0.7, 0.007, 0.09);
      tone(1174, 0.07, "sine", 0.008, 1174, pan, 0.014, 0.12);
    } else if (r === 3) {
      tone(784, 0.12, "sine", 0.027, 784, pan, 0, 0.1);
      tone(1174, 0.1, "sine", 0.013, 1174, pan * 0.6, 0.008, 0.13);
      tone(1568, 0.08, "sine", 0.008, 1568, pan, 0.016, 0.16);
    } else {
      tone(1046, 0.15, "sine", 0.027, 1046, pan, 0, 0.16);
      tone(1568, 0.13, "sine", 0.015, 1568, pan * 0.6, 0.01, 0.18);
      tone(2093, 0.11, "sine", 0.009, 2093, pan, 0.02, 0.22);
      tone(2637, 0.09, "sine", 0.0055, 2637, -pan, 0.03, 0.26);
    }
  }

  function sfxWheelReveal(rank) {
    const r = clamp(Math.floor(rank), 0, 4);

    if (r === 0) {
      // Common: a token set down on the felt. No fanfare, no scolding.
      tone(294, 0.14, "sine", 0.027, 262, 0, 0.02, 0.04);
      tone(147, 0.2, "sine", 0.019, 128, 0, 0, 0.06);
      return;
    }

    if (r === 1) {
      tone(392, 0.17, "triangle", 0.029, 392, 0, 0, 0.08);
      tone(523, 0.22, "sine", 0.026, 523, 0, 0.06, 0.1);
      tone(784, 0.18, "sine", 0.009, 784, 0, 0.11, 0.14);
      return;
    }

    if (r === 2) {
      // Epic blooms into a chord with a shimmer opening behind it.
      [523, 659, 784].forEach((hz, index) => {
        tone(hz, 0.22, "triangle", 0.028, hz, 0, index * 0.06, 0.1);
      });
      tone(1046, 0.28, "sine", 0.017, 1046, 0, 0.18, 0.22);
      tone(98, 0.32, "sine", 0.019, 88, 0, 0, 0.08);
      noiseSweep(1500, 5200, 0.55, 0.003, 2.2, 0, 0.3);
      return;
    }

    const notes =
      r >= 4
        ? [523, 659, 784, 1046, 1318, 1568, 2093]
        : [523, 659, 784, 1046, 1318];
    const air = r >= 4 ? 0.34 : 0.2;
    notes.forEach((frequency, index) => {
      tone(frequency, 0.28, "sine", 0.046, frequency * 1.02, 0, index * 0.068, air);
    });

    if (rank >= 3) {
      tone(261, 0.55, "sine", 0.024, 262, 0, 0.08, air);
      tone(392, 0.62, "sine", 0.018, 394, 0, 0.1, air);
      // Weight underneath, so a rare pull feels like it has mass.
      tone(65.4, 0.9, "sine", 0.032, 49, 0, 0.02, 0.12);
      tone(196, 0.7, "sine", 0.014, 196, 0, 0.04, 0.2);
    }

    if (rank >= 4) {
      tone(2637, 0.42, "sine", 0.012, 2637, 0, 0.22, air);
      tone(1046, 0.9, "sine", 0.016, 1046, 0, 0.1, 0.4);

      // A detuned choir that blooms under the arpeggio and keeps holding after
      // it, so the moment has a floor instead of falling silent.
      [261.63, 329.63, 392, 523.25].forEach((hz, index) => {
        const delay = 0.04 + index * 0.03;
        tone(hz, 2.1, "sine", 0.013, hz, 0, delay, 0.62);
        tone(hz * 1.004, 1.9, "sine", 0.008, hz * 1.004, 0, delay + 0.02, 0.62);
      });

      // Shimmer sweeping up under the screen flash.
      noiseSweep(1600, 7200, 1.1, 0.0065, 2.4, 0, 0.55);

      // A cascade of tiny high notes falling like sparks.
      for (let i = 0; i < 9; i++) {
        const hz = 1568 * Math.pow(2, Math.random() * 1.5);
        tone(
          hz,
          0.22 + Math.random() * 0.25,
          "sine",
          0.0035,
          hz * 1.01,
          (Math.random() - 0.5) * 0.7,
          0.28 + i * 0.085,
          0.6
        );
      }

      // One more hit a beat later: the celebration keeps going instead of
      // ending the instant the card appears.
      window.setTimeout(() => {
        tone(523.25, 0.5, "sine", 0.016, 523.25, 0, 0, 0.5);
        tone(783.99, 0.55, "triangle", 0.011, 783.99, 0, 0.02, 0.5);
        tone(1046.5, 0.7, "sine", 0.008, 1046.5, 0, 0.05, 0.55);
      }, 380);
    } else if (rank >= 3) {
      // Legendary gets a short sparkle run and a breath of air, no encore.
      for (let i = 0; i < 4; i++) {
        const hz = 1318 * Math.pow(2, Math.random() * 0.9);
        tone(
          hz,
          0.2,
          "sine",
          0.003,
          hz * 1.01,
          (Math.random() - 0.5) * 0.6,
          0.12 + i * 0.07,
          0.5
        );
      }
      noiseSweep(1200, 4200, 0.7, 0.0045, 2, 0, 0.4);
    }
  }

  function sfxTokenEarned() {
    tone(1046, 0.09, "sine", 0.028, 1318);
    tone(1318, 0.14, "triangle", 0.018, 1568, 0, 0.07);
    tone(2093, 0.2, "sine", 0.01, 2093, 0, 0.14);
  }

  function sfxRunOver() {
    tone(392, 0.2, "triangle", 0.025, 330);
    tone(294, 0.28, "sine", 0.025, 247, 0, 0.16);
    tone(196, 0.5, "sine", 0.022, 196, 0, 0.34);
  }

  // A small tick while dragging the volume, so the level can be set by ear
  // without waiting for a drop. The pitch tracks the slider.
  let lastVolumeBlipAt = -Infinity;
  function sfxVolumeBlip() {
    // A drag fires `input` many times a second; one tick every 45 ms keeps it
    // a detent feel instead of a buzz.
    const now = performance.now();
    if (now - lastVolumeBlipAt < 45) return;
    lastVolumeBlipAt = now;
    const pitch = 420 + masterVolume * 200;
    tone(pitch, 0.05, "sine", 0.02, pitch * 1.03, 0, 0, 0.05);
  }

  function sfxReset() {
    tone(392, 0.09, "triangle", 0.018, 523);
    tone(523, 0.13, "sine", 0.018, 784, 0, 0.06);
  }

  function applyMasterVolume() {
    if (audioBus) {
      try {
        audioBus.master.gain.value = 0.9 * masterVolume;
      } catch {
        // Suspended context; the value is applied again on resume.
      }
    }
    updateVolumeUi();
  }

  function updateVolumeUi() {
    if (!ui.volumeSlider) return;
    const percent = Math.round(masterVolume * 100);
    ui.volumeSlider.value = String(percent);
    // The filled part of the track runs to 150, the slider's own maximum.
    ui.volumeSlider.style.setProperty("--vol", `${(percent / 150) * 100}%`);
    ui.volumeSlider.title = `Master volume ${percent}%`;
  }

  function toggleSound() {
    state.muted = !state.muted;
    saveBoolean("nova-pachinko-muted-v1", state.muted);
    updateSoundButton();

    if (state.muted) {
      // Suspend instead of just skipping new voices: reverb tails and any
      // ringing chord stop immediately.
      if (audioCtx && audioCtx.state === "running") {
        audioCtx.suspend().catch(() => {});
      }
      return;
    }

    ensureAudio();
    tone(620, 0.09, "sine", 0.025, 880);

    // Muting suspends the whole graph, so the vault room tone has to be rebuilt
    // if the sound comes back while the wheel is still open.
    if (window.NovaWheel && window.NovaWheel.isOpen()) startRoomAmbience();
  }

  function updateSoundButton() {
    ui.soundBtn.classList.toggle("muted", state.muted);
    const label = state.muted ? "Unmute sound" : "Mute sound";
    ui.soundBtn.setAttribute("aria-label", label);
    ui.soundBtn.setAttribute("aria-pressed", String(state.muted));
    ui.soundBtn.title = `${label} (M)`;
  }

  // Mixes a palette colour toward white. The slot labels used to be the raw hue
  // at 52-82% alpha, which lands around 2.7-5:1 against the glass - fine for a
  // 20px number, mush for a 6px one. Lifting the ink instead of the alpha keeps
  // the slot's colour identity while the text clears the background.
  function tintHex(hex, amount) {
    const normalized = hex.replace("#", "");
    const full = normalized.length === 3
      ? normalized.split("").map((char) => char + char).join("")
      : normalized;
    const value = Number.parseInt(full, 16);
    const mix = (channel) => Math.round(channel + (255 - channel) * amount);
    const r = mix((value >> 16) & 255);
    const g = mix((value >> 8) & 255);
    const b = mix(value & 255);
    return `rgb(${r}, ${g}, ${b})`;
  }

  function hexToRgba(hex, alpha) {
    const normalized = hex.replace("#", "");
    const full = normalized.length === 3
      ? normalized.split("").map((char) => char + char).join("")
      : normalized;
    const value = Number.parseInt(full, 16);
    const r = (value >> 16) & 255;
    const g = (value >> 8) & 255;
    const b = value & 255;
    return `rgba(${r}, ${g}, ${b}, ${clamp(alpha, 0, 1)})`;
  }

  function clamp(value, min, max) {
    return value < min ? min : value > max ? max : value;
  }

  function loadNumber(key, fallback) {
    try {
      const raw = window.localStorage.getItem(key);
      // No key at all is not the number zero: `Number(null)` is 0, which would
      // read an unset save as "muted to zero" for anything with a non-zero
      // default (the master volume, for instance).
      if (raw === null || raw === "") return fallback;
      const value = Number(raw);
      return Number.isFinite(value) && value >= 0 ? value : fallback;
    } catch {
      return fallback;
    }
  }

  function saveNumber(key, value) {
    try {
      window.localStorage.setItem(key, String(Math.round(value)));
    } catch {
      // Storage can be unavailable in private or file contexts.
    }
  }

  function loadBoolean(key, fallback) {
    try {
      const value = window.localStorage.getItem(key);
      if (value === "1") return true;
      if (value === "0") return false;
      return fallback;
    } catch {
      return fallback;
    }
  }

  function saveBoolean(key, value) {
    try {
      window.localStorage.setItem(key, value ? "1" : "0");
    } catch {
      // Storage can be unavailable in private or file contexts.
    }
  }
})();
