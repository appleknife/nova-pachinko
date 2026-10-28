(() => {
  "use strict";

  const TAU = Math.PI * 2;
  const REDUCED_MOTION = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  const RARITIES = [
    {
      id: "common",
      name: "Common",
      short: "COMMON",
      rank: 0,
      rgb: "154, 164, 199",
      weight: 58,
      flavor: "A common curio from the overflow tray."
    },
    {
      id: "rare",
      name: "Rare",
      short: "RARE",
      rank: 1,
      rgb: "88, 199, 255",
      weight: 25,
      flavor: "A rare glint caught between the gears."
    },
    {
      id: "epic",
      name: "Epic",
      short: "EPIC",
      rank: 2,
      rgb: "183, 140, 255",
      weight: 11,
      flavor: "An epic artifact the cabinet refuses to explain."
    },
    {
      id: "legendary",
      name: "Legendary",
      short: "LEGEND",
      rank: 3,
      rgb: "255, 199, 95",
      weight: 5,
      flavor: "A legendary piece that bends the odds just by existing."
    },
    {
      id: "mythic",
      name: "Mythic",
      short: "MYTHIC",
      rank: 4,
      rgb: "255, 111, 159",
      weight: 1,
      flavor: "A mythic relic pulled from beyond the payout glass."
    }
  ];

  const BRANCHES = [
    {
      id: "lunar",
      name: "Lunar Relics",
      short: "LUNAR",
      symbol: "☾",
      rgb: "131, 184, 255",
      lore: "Pulled from the cabinet's quiet, moonlit underside.",
      loot: {
        common: ["Moon Chip", "Dust Vial"],
        rare: ["Crescent Lens", "Tide Marble"],
        epic: ["Eclipse Core", "Selene Fragment"],
        legendary: ["Lunar Crown", "Blue Moon Prism"],
        mythic: ["The Quiet Moon", "Apollo's Last Token"]
      }
    },
    {
      id: "neon",
      name: "Neon Charms",
      short: "NEON",
      symbol: "⚡",
      rgb: "77, 245, 221",
      lore: "Live current from the arcade's glowing backbone.",
      loot: {
        common: ["Flicker Bulb", "Chrome Ticket"],
        rare: ["Neon Feather", "Glow Thread"],
        epic: ["Plasma Ribbon", "Afterglow Pin"],
        legendary: ["Neon Halo", "Midnight Marquee"],
        mythic: ["The Last Arcade", "Infinity Sign"]
      }
    },
    {
      id: "sigil",
      name: "Circuit Sigils",
      short: "SIGIL",
      symbol: "⌁",
      rgb: "173, 134, 255",
      lore: "Encrypted marks left by the cabinet's first engineer.",
      loot: {
        common: ["Copper Fuse", "Logic Bead"],
        rare: ["Pulse Coil", "Silicon Sigil"],
        epic: ["Quantum Relay", "Recursive Key"],
        legendary: ["Zero-Day Crown", "Machine Dream"],
        mythic: ["The Infinite Board", "Boot Sector Zero"]
      }
    },
    {
      id: "star",
      name: "Star Seeds",
      short: "STAR",
      symbol: "✦",
      rgb: "255, 199, 95",
      lore: "Tiny lights that fell into the payout tray and took root.",
      loot: {
        common: ["Star Husk", "Meteor Grain"],
        rare: ["Comet Seed", "Nebula Bud"],
        epic: ["Supernova Pod", "Orbit Bloom"],
        legendary: ["Galaxy Heart", "Constellation Egg"],
        mythic: ["A Pocket Universe", "The North Star"]
      }
    },
    {
      id: "holo",
      name: "Holo Skins",
      short: "HOLO",
      symbol: "◇",
      rgb: "255, 127, 159",
      lore: "Cosmetic echoes with impossible reflections.",
      loot: {
        common: ["Matte Wrap", "Sticker Sheet"],
        rare: ["Iridescent Film", "Chrome Polish"],
        epic: ["Prism Coat", "Spectrum Shell"],
        legendary: ["Aurora Armor", "Hologram Crown"],
        mythic: ["The Skin That Isn't", "Mirrorworld"]
      }
    },
    {
      id: "boost",
      name: "Arcade Boosts",
      short: "BOOST",
      symbol: "»",
      rgb: "255, 158, 94",
      lore: "House rules, bent into collectible little machines.",
      loot: {
        common: ["Extra Life Tin", "Turbo Stub"],
        rare: ["Magnet Charm", "Double Dip"],
        epic: ["Overclock Chip", "Lucky Compass"],
        legendary: ["Golden Paddle", "Time Bank"],
        mythic: ["The House Always Loses", "Infinite Continue"]
      }
    },
    {
      id: "wild",
      name: "Wild Cards",
      short: "WILD",
      symbol: "?",
      rgb: "244, 234, 210",
      lore: "Cards that don't exist until someone needs them.",
      loot: {
        common: ["Blank Card", "Joker Stub"],
        rare: ["Mirror Card", "Shift Ticket"],
        epic: ["Wild Ace", "Fate Splitter"],
        legendary: ["The Unwritten", "Dealer's Choice"],
        mythic: ["Rule Zero", "The Perfect Hand"]
      }
    },
    {
      id: "echo",
      name: "Jackpot Echoes",
      short: "ECHO",
      symbol: "◎",
      rgb: "209, 107, 255",
      lore: "The ringing after a jackpot, caught and bottled.",
      loot: {
        common: ["Token Echo", "Lucky Ping"],
        rare: ["Ripple Token", "Silver Chorus"],
        epic: ["Golden Reverberation", "Jackpot Spark"],
        legendary: ["Echo of the Vault", "Nova Bell"],
        mythic: ["The First Jackpot", "Echo Eternal"]
      }
    }
  ];

  const RELICS = [
    {
      id: "lunar",
      branchId: "lunar",
      name: "Tidecaller",
      effect: "+1 starting ball each run.",
      bonuses: { startingBalls: 1 }
    },
    {
      id: "neon",
      branchId: "neon",
      name: "Overcharge",
      effect: "Chain tiers every 4 hits instead of 5.",
      bonuses: { chainStep: 4 }
    },
    {
      id: "sigil",
      branchId: "sigil",
      name: "Goldwire",
      effect: "Gold pins add +3 chain hits.",
      bonuses: { goldPinChain: 3 }
    },
    {
      id: "star",
      branchId: "star",
      name: "Lucky Orbit",
      effect: "A lucky gold ball every 4th drop.",
      bonuses: { luckyEvery: 4 }
    },
    {
      id: "holo",
      branchId: "holo",
      name: "Prism Finish",
      effect: "+15% score from every slot.",
      bonuses: { scoreMult: 1.15 }
    },
    {
      id: "boost",
      branchId: "boost",
      name: "Overflow",
      effect: "Bonus slots add +1 extra ball.",
      bonuses: { bonusBallExtra: 1 }
    },
    {
      id: "wild",
      branchId: "wild",
      name: "Double or Nothing",
      effect: "Bonus-slot points are doubled.",
      bonuses: { bonusSlotScoreMult: 2 }
    },
    {
      id: "echo",
      branchId: "echo",
      name: "Encore",
      effect: "Jackpots mint +1 extra Nova Token.",
      bonuses: { tokenBonus: 1 }
    }
  ];

  const DUST_BY_RARITY = {
    common: 4,
    rare: 10,
    epic: 25,
    legendary: 60,
    mythic: 150
  };

  const POWER_BY_RARITY = {
    common: 1,
    rare: 3,
    epic: 7,
    legendary: 15,
    mythic: 30
  };

  const MASTERY_THRESHOLDS = [1, 2, 3, 5, 8];
  const SPARK_COST = 75;

  const rarityById = new Map(RARITIES.map((rarity) => [rarity.id, rarity]));
  const branchById = new Map(BRANCHES.map((branch) => [branch.id, branch]));
  const relicById = new Map(RELICS.map((relic) => [relic.id, relic]));
  const CATALOG = [];

  for (const branch of BRANCHES) {
    branch.items = {};
    for (const rarity of RARITIES) {
      branch.items[rarity.id] = branch.loot[rarity.id].map((name, index) => {
        const item = {
          id: `${branch.id}-${rarity.id}-${index}`,
          name,
          branchId: branch.id,
          rarityId: rarity.id,
          index,
          description: `${rarity.flavor} ${branch.lore}`
        };
        CATALOG.push(item);
        return item;
      });
    }
  }

  const ITEM_BY_ID = new Map(CATALOG.map((item) => [item.id, item]));
  const TOTAL_ITEMS = CATALOG.length;
  const WHEEL_SIZE = 760;
  const WHEEL_RADIUS = 318;

  let rimGlow = null;

  function rimGlowSprite() {
    if (rimGlow) return rimGlow;
    const size = 64;
    rimGlow = document.createElement("canvas");
    rimGlow.width = size;
    rimGlow.height = size;
    const paint = rimGlow.getContext("2d");
    const gradient = paint.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255, 231, 176, 0.9)");
    gradient.addColorStop(0.42, "rgba(255, 205, 120, 0.34)");
    gradient.addColorStop(1, "rgba(255, 190, 90, 0)");
    paint.fillStyle = gradient;
    paint.fillRect(0, 0, size, size);
    return rimGlow;
  }

  // A warm lamp hangs over the wheel table: one cached sprite does the pool of
  // light, the rim highlight, and (below) the glow on top of the disc.
  let lampSpriteCache = null;

  function lampSprite() {
    if (lampSpriteCache) return lampSpriteCache;
    const size = 256;
    lampSpriteCache = document.createElement("canvas");
    lampSpriteCache.width = size;
    lampSpriteCache.height = size;
    const paint = lampSpriteCache.getContext("2d");
    const gradient = paint.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, "rgba(255, 216, 154, 0.5)");
    gradient.addColorStop(0.38, "rgba(255, 194, 124, 0.2)");
    gradient.addColorStop(0.7, "rgba(190, 140, 255, 0.07)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    paint.fillStyle = gradient;
    paint.fillRect(0, 0, size, size);
    return lampSpriteCache;
  }

  let discLampCache = null;

  function discLampSprite() {
    if (discLampCache) return discLampCache;
    discLampCache = document.createElement("canvas");
    discLampCache.width = WHEEL_SIZE;
    discLampCache.height = WHEEL_SIZE;
    const paint = discLampCache.getContext("2d");
    const cx = WHEEL_SIZE / 2;
    const cy = WHEEL_SIZE / 2;
    const gradient = paint.createRadialGradient(cx, cy - 230, 30, cx, cy - 40, 400);
    gradient.addColorStop(0, "rgba(255, 222, 166, 0.17)");
    gradient.addColorStop(0.55, "rgba(255, 198, 138, 0.05)");
    gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
    paint.fillStyle = gradient;
    paint.beginPath();
    paint.arc(cx, cy, WHEEL_RADIUS, 0, TAU);
    paint.fill();
    return discLampCache;
  }

  // Sparks and shockwaves for high-rarity reveals. Plain 2D particles, drawn
  // additively over the disc; they exist only for about a second.
  const sparks = [];
  const shockwaves = [];

  function spawnRevealBurst(rgb, rank) {
    const cx = WHEEL_SIZE / 2;
    const cy = WHEEL_SIZE / 2;
    const huge = rank >= 4;
    const count = huge ? 58 : 30;

    for (let i = 0; i < count; i++) {
      const angle = (i / count) * TAU + (Math.random() - 0.5) * 0.22;
      const speed = (huge ? 150 : 110) + Math.random() * (huge ? 400 : 250);
      sparks.push({
        x: cx + Math.cos(angle) * 54,
        y: cy + Math.sin(angle) * 54,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        life: 1,
        decay: 0.7 + Math.random() * 0.55,
        size: 1.2 + Math.random() * (huge ? 2.8 : 1.8),
        rgb: Math.random() < (huge ? 0.34 : 0.18) ? "255, 247, 222" : rgb,
        drag: 1.5 + Math.random() * 1.3
      });
    }

    shockwaves.push({ life: 1, decay: huge ? 1.05 : 1.7, radius: 70, rgb });
    if (huge) shockwaves.push({ life: 1, decay: 0.75, radius: 16, rgb: "255, 244, 208" });
  }

  function updateBursts(dt) {
    for (let i = sparks.length - 1; i >= 0; i--) {
      const spark = sparks[i];
      spark.life -= spark.decay * dt;
      if (spark.life <= 0) {
        sparks.splice(i, 1);
        continue;
      }
      spark.x += spark.vx * dt;
      spark.y += spark.vy * dt;
      spark.vx -= spark.vx * spark.drag * dt;
      spark.vy -= spark.vy * spark.drag * dt;
    }

    for (let i = shockwaves.length - 1; i >= 0; i--) {
      const wave = shockwaves[i];
      wave.life -= wave.decay * dt;
      wave.radius += 430 * dt;
      if (wave.life <= 0) shockwaves.splice(i, 1);
    }
  }

  function drawBursts(ctx) {
    if (!sparks.length && !shockwaves.length) return;
    const cx = WHEEL_SIZE / 2;
    const cy = WHEEL_SIZE / 2;

    ctx.save();
    ctx.globalCompositeOperation = "lighter";

    for (const wave of shockwaves) {
      const alpha = Math.max(0, wave.life);
      // A wide, soft wave instead of a hairline circle.
      ctx.globalAlpha = alpha * 0.28;
      ctx.strokeStyle = `rgba(${wave.rgb}, 1)`;
      ctx.lineWidth = 7 + (1 - alpha) * 34;
      ctx.beginPath();
      ctx.arc(cx, cy, wave.radius, 0, TAU);
      ctx.stroke();
    }

    ctx.lineCap = "round";
    for (const spark of sparks) {
      const alpha = Math.max(0, spark.life);
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = `rgba(${spark.rgb}, 1)`;
      ctx.lineWidth = spark.size;
      ctx.beginPath();
      ctx.moveTo(spark.x, spark.y);
      ctx.lineTo(spark.x - spark.vx * 0.036, spark.y - spark.vy * 0.036);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Dust drifting through the lamp light, kept behind the disc so it only shows
  // around the rim. Slow enough to read as atmosphere, not particles.
  const motes = [];
  for (let i = 0; i < 26; i++) {
    motes.push({
      x: Math.random(),
      y: Math.random(),
      r: 0.7 + Math.random() * 1.4,
      drift: 0.005 + Math.random() * 0.011,
      sway: 6 + Math.random() * 20,
      phase: Math.random() * TAU,
      alpha: 0.05 + Math.random() * 0.085
    });
  }

  const STORAGE = {
    tokens: "nova-pachinko-tokens-v1",
    collection: "nova-pachinko-collection-v1",
    pity: "nova-pachinko-pity-v1",
    spins: "nova-pachinko-spins-v1",
    welcome: "nova-pachinko-wheel-welcome-v1",
    dust: "nova-pachinko-dust-v1",
    loadout: "nova-pachinko-loadout-v1",
    showcase: "nova-pachinko-showcase-v1",
    showcaseCustom: "nova-pachinko-showcase-custom-v1",
    spark: "nova-pachinko-spark-v1"
  };

  const el = {
    tokenBtn: document.getElementById("tokenBtn"),
    tokenCount: document.getElementById("tokenCount"),
    tokenWord: document.getElementById("tokenWord"),
    tokenCta: document.getElementById("tokenCta"),
    wheelMode: document.getElementById("wheelMode"),
    wheelCanvas: document.getElementById("wheelCanvas"),
    rarityFlash: document.getElementById("rarityFlash"),
    wheelClose: document.getElementById("wheelClose"),
    wheelTokenCount: document.getElementById("wheelTokenCount"),
    wheelTokenWord: document.getElementById("wheelTokenWord"),
    wheelDust: document.getElementById("wheelDust"),
    tabWheel: document.getElementById("tabWheel"),
    tabVault: document.getElementById("tabVault"),
    tabRelics: document.getElementById("tabRelics"),
    tabPassport: document.getElementById("tabPassport"),
    wheelPanel: document.getElementById("wheelPanel"),
    vaultPanel: document.getElementById("vaultPanel"),
    relicPanel: document.getElementById("relicPanel"),
    passportPanel: document.getElementById("passportPanel"),
    relicProgress: document.getElementById("relicProgress"),
    relicUnlockedCount: document.getElementById("relicUnlockedCount"),
    loadoutCount: document.getElementById("loadoutCount"),
    loadoutSlots: document.getElementById("loadoutSlots"),
    relicGrid: document.getElementById("relicGrid"),
    showcaseCount: document.getElementById("showcaseCount"),
    sparkBtn: document.getElementById("sparkBtn"),
    sparkBlock: document.querySelector(".spark-block"),
    passportCompletion: document.getElementById("passportCompletion"),
    passportSymbol: document.getElementById("passportSymbol"),
    passportTitle: document.getElementById("passportTitle"),
    passportPower: document.getElementById("passportPower"),
    passportFound: document.getElementById("passportFound"),
    passportRarest: document.getElementById("passportRarest"),
    passportBest: document.getElementById("passportBest"),
    passportShowcaseCount: document.getElementById("passportShowcaseCount"),
    passportShowcase: document.getElementById("passportShowcase"),
    passportRelics: document.getElementById("passportRelics"),
    passportBranches: document.getElementById("passportBranches"),
    passportCodeHint: document.getElementById("passportCodeHint"),
    sharePngBtn: document.getElementById("sharePngBtn"),
    copyCodeBtn: document.getElementById("copyCodeBtn"),
    copyCodeBtn2: document.getElementById("copyCodeBtn2"),
    friendCode: document.getElementById("friendCode"),
    compareBtn: document.getElementById("compareBtn"),
    compareResult: document.getElementById("compareResult"),
    vaultProgress: document.getElementById("vaultProgress"),
    vaultFound: document.getElementById("vaultFound"),
    vaultTotal: document.getElementById("vaultTotal"),
    vaultFilters: document.getElementById("vaultFilters"),
    vaultGrid: document.getElementById("vaultGrid"),
    spinBtn: document.getElementById("spinBtn"),
    spinBtnLabel: document.getElementById("spinBtnLabel"),
    spinCost: document.getElementById("spinCost"),
    wheelStatus: document.getElementById("wheelStatus"),
    rewardCard: document.getElementById("rewardCard"),
    rewardBranch: document.getElementById("rewardBranch"),
    rewardRarity: document.getElementById("rewardRarity"),
    rewardSymbol: document.getElementById("rewardSymbol"),
    rewardName: document.getElementById("rewardName"),
    rewardDesc: document.getElementById("rewardDesc"),
    rewardBadge: document.getElementById("rewardBadge"),
    rarityLadder: document.getElementById("rarityLadder"),
    pityText: document.getElementById("pityText"),
    pityFill: document.getElementById("pityFill"),
    pityBlock: document.querySelector(".pity-block"),
    gameToast: document.getElementById("gameToast"),
    main: document.querySelector(".game-shell")
  };

  const wheelCtx = el.wheelCanvas.getContext("2d");
  if (!wheelCtx) return;

  // The disc's gradients never change, so they are built once instead of twelve
  // times per frame. They are defined in the disc's local space, which is why
  // the wedge gradients start at 0,0.
  let wheelGradients = null;

  function ensureWheelGradients(ctx) {
    if (wheelGradients) return wheelGradients;

    const cx = WHEEL_SIZE / 2;
    const cy = WHEEL_SIZE / 2;

    const outer = ctx.createRadialGradient(cx, cy, 110, cx, cy, 382);
    outer.addColorStop(0, "rgba(93, 61, 210, 0.12)");
    outer.addColorStop(0.64, "rgba(82, 53, 180, 0.06)");
    outer.addColorStop(1, "rgba(0, 0, 0, 0)");

    const rim = ctx.createLinearGradient(cx - 300, cy - 340, cx + 300, cy + 340);
    rim.addColorStop(0, "#3b3555");
    rim.addColorStop(0.22, "#171a2f");
    rim.addColorStop(0.55, "#080b17");
    rim.addColorStop(0.82, "#28223c");
    rim.addColorStop(1, "#51415a");

    const wedges = BRANCHES.map((branch) => {
      const fill = ctx.createRadialGradient(0, 0, 65, 0, 0, WHEEL_RADIUS);
      fill.addColorStop(0, `rgba(${branch.rgb}, 0.15)`);
      fill.addColorStop(0.58, `rgba(${branch.rgb}, 0.58)`);
      fill.addColorStop(0.9, `rgba(${branch.rgb}, 0.9)`);
      fill.addColorStop(1, `rgba(${branch.rgb}, 0.66)`);
      return fill;
    });

    const hubGlow = ctx.createRadialGradient(cx, cy, 10, cx, cy, 115);
    hubGlow.addColorStop(0, "rgba(118, 78, 255, 0.2)");
    hubGlow.addColorStop(1, "rgba(118, 78, 255, 0)");

    const hub = ctx.createRadialGradient(cx - 28, cy - 34, 8, cx, cy, 100);
    hub.addColorStop(0, "#242349");
    hub.addColorStop(0.54, "#11152b");
    hub.addColorStop(1, "#070a15");

    const pointer = ctx.createLinearGradient(cx, 28, cx, 82);
    pointer.addColorStop(0, "#fff0bc");
    pointer.addColorStop(0.45, "#ffc85e");
    pointer.addColorStop(1, "#d58334");

    wheelGradients = { outer, rim, wedges, hubGlow, hub, pointer };
    return wheelGradients;
  }

  const vaultCards = new Map();
  const vaultFilters = new Map();

  let tokens = loadNumber(STORAGE.tokens, 0);
  let collection = loadCollection();
  let loadout = loadStringArray(STORAGE.loadout).slice(0, 3);
  let showcase = loadStringArray(STORAGE.showcase).slice(0, 3);
  let welcomeGranted = false;

  const hadWelcome = loadBoolean(STORAGE.welcome, false);
  if (!hadWelcome) {
    tokens += 1;
    welcomeGranted = true;
    saveNumber(STORAGE.tokens, tokens);
    saveBoolean(STORAGE.welcome, true);
  }

  const wheel = {
    open: false,
    tab: "wheel",
    angle: -Math.PI / BRANCHES.length,
    spinning: false,
    busy: false,
    pending: null,
    lastResult: null,
    selectedIndex: -1,
    spinStart: 0,
    spinFrom: 0,
    spinTo: 0,
    spinDuration: 0,
    targetIndex: -1,
    rarityRollTimer: 0,
    lastTick: -1,
    lastTickAt: 0,
    tension: false,
    flash: 0,
    flashRgb: "255, 199, 95",
    filter: "all",
    pity: clamp(loadNumber(STORAGE.pity, 0), 0, 9),
    spins: loadNumber(STORAGE.spins, 0),
    dust: loadNumber(STORAGE.dust, 0),
    spark: loadBoolean(STORAGE.spark, false),
    loadout,
    showcase,
    showcaseCustom: loadBoolean(STORAGE.showcaseCustom, false),
    lastFrame: 0,
    rafActive: false,
    lastFocus: null,
    scale: 0
  };

  buildRarityLadder();
  buildVault();
  buildVaultFilters();
  buildRelics();
  sanitizeLoadout();
  sanitizeShowcase();
  bindEvents();
  fitWheelCanvas();
  updateWalletUi();
  updatePityUi();
  updateCollectionUi();
  setTab("wheel", true);
  notifyLoadoutChange();

  if (welcomeGranted) {
    window.setTimeout(() => {
      showToast("WELCOME GIFT · 1 NOVA TOKEN GRANTED", "gold");
    }, 900);
  }

  window.NovaWheel = {
    isOpen: () => wheel.open,
    open: openWheel,
    close: closeWheel,
    awardToken: (amount = 1, source = "jackpot") => awardToken(amount, source),
    getTokens: () => tokens,
    getCollection: () => ({ ...collection }),
    getVaultSummary,
    getBonuses,
    getProfile
  };

  function buildRarityLadder() {
    for (const rarity of RARITIES) {
      const step = document.createElement("span");
      step.className = "rarity-step";
      step.dataset.rank = String(rarity.rank);
      step.style.setProperty("--r-rgb", rarity.rgb);
      step.textContent = rarity.short;
      el.rarityLadder.appendChild(step);
    }
  }

  function buildVault() {
    el.vaultTotal.textContent = String(TOTAL_ITEMS);

    for (const item of CATALOG) {
      const branch = branchById.get(item.branchId);
      const rarity = rarityById.get(item.rarityId);

      const card = document.createElement("article");
      card.className = "vault-card locked";
      card.dataset.id = item.id;
      card.dataset.branch = branch.id;
      card.style.setProperty("--r-rgb", rarity.rgb);
      card.style.setProperty("--b-rgb", branch.rgb);
      card.title = `${item.name} — ${rarity.name} ${branch.name}`;

      const top = document.createElement("div");
      top.className = "vc-top";

      const symbol = document.createElement("span");
      symbol.className = "vc-symbol";
      symbol.textContent = branch.symbol;

      const rarityLabel = document.createElement("span");
      rarityLabel.className = "vc-rarity";
      rarityLabel.textContent = rarity.name.toUpperCase();

      top.append(symbol, rarityLabel);

      const name = document.createElement("h4");
      name.className = "vc-name";
      name.textContent = item.name;

      const bottom = document.createElement("div");
      bottom.className = "vc-bottom";

      const branchLabel = document.createElement("span");
      branchLabel.textContent = branch.short;

      const count = document.createElement("span");
      count.className = "vc-count";
      count.textContent = "LOCKED";

      const mastery = document.createElement("div");
      mastery.className = "vc-mastery";
      for (let i = 0; i < MASTERY_THRESHOLDS.length; i++) {
        mastery.appendChild(document.createElement("i"));
      }

      bottom.append(branchLabel, count);
      card.append(top, name, bottom, mastery);
      el.vaultGrid.appendChild(card);
      vaultCards.set(item.id, card);
    }
  }

  function buildVaultFilters() {
    const all = makeFilterButton("all", "ALL", "255, 199, 95");
    all.classList.add("active");
    all.setAttribute("aria-pressed", "true");
    el.vaultFilters.appendChild(all);
    vaultFilters.set("all", all);

    for (const branch of BRANCHES) {
      const filter = makeFilterButton(branch.id, branch.short, branch.rgb);
      filter.title = branch.name;
      filter.setAttribute("aria-pressed", "false");
      el.vaultFilters.appendChild(filter);
      vaultFilters.set(branch.id, filter);
    }
  }

  function makeFilterButton(id, label, rgb) {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "vault-filter";
    button.dataset.branch = id;
    button.style.setProperty("--branch-rgb", rgb);
    button.textContent = label;
    return button;
  }

  function masteryLevel(count) {
    if (count <= 0) return 0;
    let level = 0;
    for (const threshold of MASTERY_THRESHOLDS) {
      if (count >= threshold) level += 1;
    }
    return level;
  }

  function getBranchFound(branchId) {
    const branch = branchById.get(branchId);
    if (!branch) return 0;
    let found = 0;
    for (const rarity of RARITIES) {
      for (const item of branch.items[rarity.id]) {
        if (collection[item.id] > 0) found += 1;
      }
    }
    return found;
  }

  function isRelicUnlocked(relic) {
    return Boolean(relic && getBranchFound(relic.branchId) >= 10);
  }

  function getBonuses() {
    const bonuses = {
      startingBalls: 0,
      chainStep: 5,
      goldPinChain: 2,
      luckyEvery: 5,
      scoreMult: 1,
      bonusBallExtra: 0,
      bonusSlotScoreMult: 1,
      tokenBonus: 0
    };

    for (const id of wheel.loadout) {
      const relic = relicById.get(id);
      if (!relic || !isRelicUnlocked(relic)) continue;
      const b = relic.bonuses;
      if (b.startingBalls) bonuses.startingBalls += b.startingBalls;
      if (b.chainStep) bonuses.chainStep = Math.min(bonuses.chainStep, b.chainStep);
      if (b.goldPinChain) bonuses.goldPinChain = Math.max(bonuses.goldPinChain, b.goldPinChain);
      if (b.luckyEvery) bonuses.luckyEvery = Math.min(bonuses.luckyEvery, b.luckyEvery);
      if (b.scoreMult) bonuses.scoreMult *= b.scoreMult;
      if (b.bonusBallExtra) bonuses.bonusBallExtra += b.bonusBallExtra;
      if (b.bonusSlotScoreMult) bonuses.bonusSlotScoreMult *= b.bonusSlotScoreMult;
      if (b.tokenBonus) bonuses.tokenBonus += b.tokenBonus;
    }

    return bonuses;
  }

  function notifyLoadoutChange() {
    window.dispatchEvent(
      new CustomEvent("nova:loadoutchange", { detail: getBonuses() })
    );
  }

  function sanitizeLoadout() {
    wheel.loadout = wheel.loadout
      .filter((id) => {
        const relic = relicById.get(id);
        return relic && isRelicUnlocked(relic);
      })
      .slice(0, 3);
    saveStringArray(STORAGE.loadout, wheel.loadout);
  }

  function sanitizeShowcase() {
    const valid = [];
    const seen = new Set();
    for (const id of wheel.showcase) {
      const item = ITEM_BY_ID.get(id);
      if (!item || collection[item.id] <= 0 || seen.has(id)) continue;
      valid.push(id);
      seen.add(id);
      if (valid.length >= 3) break;
    }

    if (!wheel.showcaseCustom && valid.length < 3) {
      const candidates = CATALOG
        .filter((item) => collection[item.id] > 0 && !seen.has(item.id))
        .sort((a, b) => {
          const aRarity = rarityById.get(a.rarityId).rank;
          const bRarity = rarityById.get(b.rarityId).rank;
          return bRarity - aRarity || (collection[b.id] || 0) - (collection[a.id] || 0);
        });

      for (const item of candidates) {
        valid.push(item.id);
        if (valid.length >= 3) break;
      }
    }

    wheel.showcase = valid;
    saveStringArray(STORAGE.showcase, wheel.showcase);
  }

  function getTitle(found) {
    if (found >= 80) return "VAULT SOVEREIGN";
    if (found >= 70) return "NOVA ARCHIVIST";
    if (found >= 50) return "CABINET CURATOR";
    if (found >= 30) return "RELIC HUNTER";
    if (found >= 10) return "VAULT RUNNER";
    return "ROOKIE CURATOR";
  }

  function getProfile() {
    const branchProgress = BRANCHES.map((branch) => ({
      id: branch.id,
      name: branch.name,
      short: branch.short,
      symbol: branch.symbol,
      rgb: branch.rgb,
      found: getBranchFound(branch.id),
      total: 10
    }));

    let found = 0;
    let power = 0;
    let rarest = null;

    for (const item of CATALOG) {
      const count = collection[item.id] || 0;
      if (count <= 0) continue;
      found += 1;
      power += POWER_BY_RARITY[item.rarityId] * masteryLevel(count);
      if (!rarest || rarityById.get(item.rarityId).rank > rarityById.get(rarest.rarityId).rank) {
        rarest = item;
      }
    }

    const showcaseItems = wheel.showcase
      .map((id) => ITEM_BY_ID.get(id))
      .filter((item) => item && collection[item.id] > 0);

    return {
      found,
      total: TOTAL_ITEMS,
      percent: Math.round((found / TOTAL_ITEMS) * 100),
      power,
      title: getTitle(found),
      rarest,
      best: loadNumber("nova-pachinko-best-v1", 0),
      spins: wheel.spins,
      dust: wheel.dust,
      tokens,
      branchProgress,
      showcaseItems,
      unlockedRelics: RELICS.filter(isRelicUnlocked).length,
      equippedRelics: wheel.loadout.map((id) => relicById.get(id)).filter(Boolean)
    };
  }

  function buildRelics() {
    for (const relic of RELICS) {
      const branch = branchById.get(relic.branchId);
      const card = document.createElement("button");
      card.type = "button";
      card.className = "relic-card";
      card.dataset.relic = relic.id;
      card.style.setProperty("--b-rgb", branch.rgb);

      const top = document.createElement("div");
      top.className = "relic-card-top";
      const symbol = document.createElement("span");
      symbol.className = "relic-symbol";
      symbol.textContent = branch.symbol;
      const state = document.createElement("span");
      state.className = "relic-state";
      state.textContent = "LOCKED";
      top.append(symbol, state);

      const name = document.createElement("h4");
      name.className = "relic-name";
      name.textContent = relic.name;

      const effect = document.createElement("p");
      effect.className = "relic-effect";
      effect.textContent = relic.effect;

      const track = document.createElement("div");
      track.className = "relic-progress-track";
      const fill = document.createElement("i");
      track.appendChild(fill);

      const progress = document.createElement("div");
      progress.className = "relic-progress-text";

      card.append(top, name, effect, track, progress);
      el.relicGrid.appendChild(card);
    }
  }

  function updateRelicsUi() {
    const unlocked = RELICS.filter(isRelicUnlocked).length;
    el.relicProgress.textContent = `${unlocked}/8`;
    el.relicUnlockedCount.textContent = String(unlocked);
    el.loadoutCount.textContent = String(wheel.loadout.length);

    const cards = el.relicGrid.querySelectorAll(".relic-card");
    for (const card of cards) {
      const relic = relicById.get(card.dataset.relic);
      if (!relic) continue;
      const branch = branchById.get(relic.branchId);
      const found = getBranchFound(relic.branchId);
      const isUnlocked = found >= 10;
      const equipped = wheel.loadout.includes(relic.id);

      card.disabled = !isUnlocked;
      card.classList.toggle("equipped", equipped);
      card.setAttribute("aria-pressed", String(equipped));
      card.title = `${relic.name} — ${branch.name}`;

      const state = card.querySelector(".relic-state");
      if (state) state.textContent = equipped ? "EQUIPPED" : isUnlocked ? "READY" : "LOCKED";
      const fill = card.querySelector(".relic-progress-track i");
      if (fill) fill.style.width = `${(found / 10) * 100}%`;
      const progress = card.querySelector(".relic-progress-text");
      if (progress) progress.textContent = isUnlocked ? "SET COMPLETE" : `${found}/10 · ${remainingLabel(10 - found)}`;
    }

    el.loadoutSlots.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      const relic = relicById.get(wheel.loadout[i]);
      const slot = document.createElement("div");
      slot.className = "loadout-slot";

      if (relic) {
        const branch = branchById.get(relic.branchId);
        slot.classList.add("filled");
        slot.style.setProperty("--b-rgb", branch.rgb);
        const icon = document.createElement("span");
        icon.className = "loadout-slot-icon";
        icon.textContent = branch.symbol;
        const copy = document.createElement("span");
        copy.className = "loadout-slot-copy";
        const label = document.createElement("span");
        label.textContent = `SLOT ${i + 1}`;
        const name = document.createElement("strong");
        name.textContent = relic.name;
        copy.append(label, name);
        slot.append(icon, copy);
      } else {
        const icon = document.createElement("span");
        icon.className = "loadout-slot-icon";
        icon.textContent = "+";
        const copy = document.createElement("span");
        copy.className = "loadout-slot-copy";
        const label = document.createElement("span");
        label.textContent = `SLOT ${i + 1}`;
        const name = document.createElement("strong");
        name.textContent = "EMPTY";
        copy.append(label, name);
        slot.append(icon, copy);
      }

      el.loadoutSlots.appendChild(slot);
    }
  }

  function remainingLabel(remaining) {
    return `${remaining} TO GO`;
  }

  function toggleRelic(id) {
    const relic = relicById.get(id);
    if (!relic || !isRelicUnlocked(relic)) return;

    const index = wheel.loadout.indexOf(id);
    if (index >= 0) {
      wheel.loadout.splice(index, 1);
    } else if (wheel.loadout.length >= 3) {
      showToast("LOADOUT FULL · UNEQUIP A RELIC FIRST", "");
      return;
    } else {
      wheel.loadout.push(id);
    }

    saveStringArray(STORAGE.loadout, wheel.loadout);
    notifyLoadoutChange();
    updateRelicsUi();
    updatePassportUi();
    dispatchSfx("relic-equip");
    pulseHaptic(12);
    showToast(
      `${index >= 0 ? "UNEQUIPPED" : "EQUIPPED"} · ${relic.name.toUpperCase()}`,
      index >= 0 ? "" : "gold"
    );
  }

  function updateShowcaseUi() {
    if (el.showcaseCount) el.showcaseCount.textContent = `${wheel.showcase.length}/3`;
    for (const item of CATALOG) {
      const card = vaultCards.get(item.id);
      if (card) card.classList.toggle("showcased", wheel.showcase.includes(item.id));
    }
    updatePassportUi();
  }

  function toggleShowcase(itemId) {
    const item = ITEM_BY_ID.get(itemId);
    if (!item || collection[item.id] <= 0) return;

    wheel.showcaseCustom = true;
    saveBoolean(STORAGE.showcaseCustom, true);

    const index = wheel.showcase.indexOf(itemId);
    if (index >= 0) {
      wheel.showcase.splice(index, 1);
    } else if (wheel.showcase.length >= 3) {
      showToast("SHOWCASE FULL · REMOVE ONE FIRST", "");
      return;
    } else {
      wheel.showcase.push(itemId);
    }

    saveStringArray(STORAGE.showcase, wheel.showcase);
    updateShowcaseUi();
    showToast(index >= 0 ? "REMOVED FROM SHOWCASE" : "ADDED TO SHOWCASE", "");
  }

  function updatePassportUi() {
    if (!el.passportTitle) return;
    const profile = getProfile();
    const rarestRarity = profile.rarest ? rarityById.get(profile.rarest.rarityId) : null;
    const rarestBranch = profile.rarest ? branchById.get(profile.rarest.branchId) : null;

    el.passportCompletion.textContent = `${profile.percent}% COMPLETE`;
    el.passportSymbol.textContent = rarestBranch ? rarestBranch.symbol : "✦";
    el.passportTitle.textContent = profile.title;
    el.passportPower.textContent = profile.power.toLocaleString("en-US");
    el.passportFound.textContent = `${profile.found}/${profile.total}`;
    el.passportRarest.textContent = profile.rarest ? profile.rarest.name : "—";
    el.passportRarest.title = profile.rarest && rarestRarity
      ? `${rarestRarity.name} · ${rarestBranch.name}`
      : "No relics discovered yet";
    el.passportBest.textContent = profile.best.toLocaleString("en-US");
    el.passportShowcaseCount.textContent = `${profile.showcaseItems.length}/3`;
    el.passportRelics.textContent = `${profile.unlockedRelics}/8 RELICS · ${profile.equippedRelics.length}/3 EQUIPPED`;
    el.passportCodeHint.textContent = `NOVA1 · ${profile.dust} DUST`;

    el.passportShowcase.innerHTML = "";
    for (let i = 0; i < 3; i++) {
      const item = profile.showcaseItems[i];
      const slot = document.createElement("div");
      slot.className = "passport-showcase-slot";
      if (item) {
        const rarity = rarityById.get(item.rarityId);
        const branch = branchById.get(item.branchId);
        slot.style.setProperty("--r-rgb", rarity.rgb);
        slot.style.setProperty("--b-rgb", branch.rgb);
        const symbol = document.createElement("span");
        symbol.className = "ps-symbol";
        symbol.textContent = branch.symbol;
        const copy = document.createElement("span");
        copy.className = "ps-copy";
        const name = document.createElement("strong");
        name.textContent = item.name;
        const rarityLabel = document.createElement("span");
        rarityLabel.textContent = `${rarity.name.toUpperCase()} · ×${collection[item.id] || 0}`;
        copy.append(name, rarityLabel);
        slot.append(symbol, copy);
      } else {
        slot.classList.add("empty");
        const symbol = document.createElement("span");
        symbol.className = "ps-symbol";
        symbol.textContent = "+";
        const copy = document.createElement("span");
        copy.className = "ps-copy";
        const name = document.createElement("strong");
        name.textContent = "CHOOSE IN VAULT";
        copy.append(name);
        slot.append(symbol, copy);
      }
      el.passportShowcase.appendChild(slot);
    }

    el.passportBranches.innerHTML = "";
    for (const branch of profile.branchProgress) {
      const row = document.createElement("div");
      row.className = "passport-branch";
      row.style.setProperty("--b-rgb", branch.rgb);
      const label = document.createElement("span");
      label.textContent = branch.short;
      const track = document.createElement("span");
      track.className = "passport-branch-bar";
      const fill = document.createElement("i");
      fill.style.width = `${(branch.found / branch.total) * 100}%`;
      track.appendChild(fill);
      const count = document.createElement("span");
      count.textContent = `${branch.found}/10`;
      row.append(label, track, count);
      el.passportBranches.appendChild(row);
    }
  }

  function encodeCollectionCode() {
    const counts = CATALOG.map((item) => Math.min(255, collection[item.id] || 0));
    const showcaseIndices = wheel.showcase
      .map((id) => CATALOG.findIndex((item) => item.id === id))
      .filter((index) => index >= 0);
    const relicIndices = wheel.loadout
      .map((id) => RELICS.findIndex((relic) => relic.id === id))
      .filter((index) => index >= 0);

    const payload = {
      v: 1,
      c: counts,
      s: showcaseIndices,
      r: relicIndices,
      b: loadNumber("nova-pachinko-best-v1", 0),
      sp: wheel.spins
    };

    return `NOVA1.${btoa(JSON.stringify(payload))
      .replace(/\+/g, "-")
      .replace(/\//g, "_")
      .replace(/=+$/g, "")}`;
  }

  function decodeCollectionCode(value) {
    const input = String(value || "").trim().replace(/\s+/g, "");
    if (input.length > 5000) throw new Error("Nova code is too long");
    if (!input.startsWith("NOVA1.")) throw new Error("Missing Nova code prefix");

    const raw = input.slice(6).replace(/-/g, "+").replace(/_/g, "/");
    const padded = raw + "=".repeat((4 - (raw.length % 4)) % 4);
    const data = JSON.parse(atob(padded));

    if (
      !data ||
      data.v !== 1 ||
      !Array.isArray(data.c) ||
      data.c.length !== CATALOG.length
    ) {
      throw new Error("Invalid Nova code");
    }

    const counts = data.c.map((count) => clamp(Math.floor(Number(count) || 0), 0, 255));
    let found = 0;
    let power = 0;
    let rarest = null;
    const branchCounts = new Map(BRANCHES.map((branch) => [branch.id, 0]));

    CATALOG.forEach((item, index) => {
      const count = counts[index];
      if (count <= 0) return;
      found += 1;
      power += POWER_BY_RARITY[item.rarityId] * masteryLevel(count);
      branchCounts.set(item.branchId, (branchCounts.get(item.branchId) || 0) + 1);
      if (!rarest || rarityById.get(item.rarityId).rank > rarityById.get(rarest.rarityId).rank) {
        rarest = item;
      }
    });

    return {
      found,
      total: TOTAL_ITEMS,
      percent: Math.round((found / TOTAL_ITEMS) * 100),
      power,
      title: getTitle(found),
      rarest,
      counts,
      best: clamp(Math.floor(Number(data.b) || 0), 0, Number.MAX_SAFE_INTEGER),
      spins: clamp(Math.floor(Number(data.sp) || 0), 0, Number.MAX_SAFE_INTEGER),
      branchProgress: BRANCHES.map((branch) => ({
        id: branch.id,
        name: branch.name,
        short: branch.short,
        rgb: branch.rgb,
        found: branchCounts.get(branch.id) || 0,
        total: 10
      }))
    };
  }

  function fallbackCopy(text) {
    const input = document.createElement("textarea");
    input.value = text;
    input.setAttribute("readonly", "");
    input.style.position = "fixed";
    input.style.left = "-9999px";
    input.style.top = "0";
    document.body.appendChild(input);
    input.select();
    const copied = document.execCommand("copy");
    input.remove();
    if (!copied) throw new Error("Copy command failed");
  }

  async function copyCollectionCode() {
    const code = encodeCollectionCode();
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code);
      } else {
        fallbackCopy(code);
      }
      showToast("COLLECTION CODE COPIED · SHARE IT WITH A FRIEND", "gold");
    } catch {
      try {
        fallbackCopy(code);
        showToast("COLLECTION CODE COPIED", "gold");
      } catch {
        window.prompt("Copy your Nova collection code:", code);
      }
    }
  }

  function compareFriendVault() {
    let friend;
    try {
      friend = decodeCollectionCode(el.friendCode.value);
    } catch {
      el.compareResult.hidden = false;
      el.compareResult.innerHTML = "";
      const title = document.createElement("div");
      title.className = "compare-title";
      title.textContent = "INVALID CODE";
      const note = document.createElement("p");
      note.className = "compare-diff";
      note.textContent = "Check the code and paste the full NOVA1 value again.";
      el.compareResult.append(title, note);
      return;
    }

    const mine = getProfile();
    const mineCounts = CATALOG.map((item) => collection[item.id] || 0);
    let youOnly = 0;
    let friendOnly = 0;
    for (let i = 0; i < CATALOG.length; i++) {
      if (mineCounts[i] > 0 && friend.counts[i] === 0) youOnly += 1;
      if (mineCounts[i] === 0 && friend.counts[i] > 0) friendOnly += 1;
    }

    el.compareResult.hidden = false;
    el.compareResult.innerHTML = "";
    const title = document.createElement("div");
    title.className = "compare-title";
    title.textContent = `RIVAL · ${friend.title}`;

    const grid = document.createElement("div");
    grid.className = "compare-grid";
    const stats = [
      ["YOUR RELICS", `${mine.found}/80`],
      ["THEIR RELICS", `${friend.found}/80`],
      ["YOUR POWER", mine.power.toLocaleString("en-US")],
      ["THEIR POWER", friend.power.toLocaleString("en-US")]
    ];
    for (const [label, value] of stats) {
      const box = document.createElement("div");
      box.className = "compare-stat";
      box.textContent = label;
      const strong = document.createElement("strong");
      strong.textContent = value;
      box.appendChild(strong);
      grid.appendChild(box);
    }

    const diff = document.createElement("p");
    diff.className = "compare-diff";
    diff.textContent = `You have ${youOnly} they don't. They have ${friendOnly} you don't. Their rarest is ${friend.rarest ? friend.rarest.name : "nothing yet"}.`;
    el.compareResult.append(title, grid, diff);
    pulseHaptic(12);
  }

  function roundCanvasRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }

  function fitCanvasText(ctx, text, maxWidth) {
    if (ctx.measureText(text).width <= maxWidth) return text;
    let result = text;
    while (result.length > 1 && ctx.measureText(`${result}…`).width > maxWidth) {
      result = result.slice(0, -1);
    }
    return `${result}…`;
  }

  function drawPassportCanvas() {
    const profile = getProfile();
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const W = canvas.width;
    const H = canvas.height;
    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#0a0e20");
    bg.addColorStop(0.55, "#050812");
    bg.addColorStop(1, "#090713");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const goldGlow = ctx.createRadialGradient(930, 100, 10, 930, 100, 520);
    goldGlow.addColorStop(0, "rgba(255, 192, 79, 0.2)");
    goldGlow.addColorStop(1, "rgba(255, 192, 79, 0)");
    ctx.fillStyle = goldGlow;
    ctx.fillRect(0, 0, W, H);

    const violetGlow = ctx.createRadialGradient(80, 1120, 10, 80, 1120, 460);
    violetGlow.addColorStop(0, "rgba(113, 76, 255, 0.16)");
    violetGlow.addColorStop(1, "rgba(113, 76, 255, 0)");
    ctx.fillStyle = violetGlow;
    ctx.fillRect(0, 0, W, H);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.028)";
    ctx.lineWidth = 1;
    for (let x = 36; x < W; x += 36) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, H);
      ctx.stroke();
    }
    for (let y = 36; y < H; y += 36) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(W, y);
      ctx.stroke();
    }

    ctx.strokeStyle = "rgba(255, 226, 173, 0.24)";
    ctx.lineWidth = 2;
    roundCanvasRect(ctx, 34, 34, W - 68, H - 68, 36);
    ctx.stroke();

    ctx.textBaseline = "middle";
    ctx.textAlign = "left";
    ctx.fillStyle = "#8d91ac";
    ctx.font = '700 17px Bahnschrift, "Trebuchet MS", sans-serif';
    drawSpacedText(ctx, "NOVA ARCADE · CABINET 001", 86, 93, 3.2, true);

    ctx.fillStyle = "#ffefd1";
    ctx.font = '400 78px Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif';
    ctx.fillText("NOVA VAULT", 82, 163);
    ctx.fillStyle = "rgba(255, 207, 119, 0.7)";
    ctx.font = '700 15px Bahnschrift, "Trebuchet MS", sans-serif';
    drawSpacedText(ctx, "COLLECTION PASSPORT", 86, 214, 3.8, true);

    ctx.textAlign = "right";
    ctx.fillStyle = "#ffc75f";
    ctx.font = '700 26px Bahnschrift, "Trebuchet MS", sans-serif';
    ctx.fillText(`${profile.percent}% COMPLETE`, W - 86, 154);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.beginPath();
    ctx.moveTo(86, 250);
    ctx.lineTo(W - 86, 250);
    ctx.stroke();

    ctx.fillStyle = "rgba(255, 197, 92, 0.12)";
    ctx.strokeStyle = "rgba(255, 215, 145, 0.5)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(136, 327, 51, 0, TAU);
    ctx.fill();
    ctx.stroke();
    const rareBranch = profile.rarest ? branchById.get(profile.rarest.branchId) : null;
    ctx.textAlign = "center";
    ctx.fillStyle = "#ffc75f";
    ctx.font = '600 42px Bahnschrift, "Trebuchet MS", sans-serif';
    ctx.fillText(rareBranch ? rareBranch.symbol : "✦", 136, 329);

    ctx.textAlign = "left";
    ctx.fillStyle = "#907d9a";
    ctx.font = '700 14px Bahnschrift, "Trebuchet MS", sans-serif';
    drawSpacedText(ctx, "VAULT KEEPER", 216, 292, 3, true);
    ctx.fillStyle = "#fff0d2";
    ctx.font = '400 47px Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif';
    ctx.fillText(profile.title, 214, 337);

    ctx.textAlign = "right";
    ctx.fillStyle = "#8b7992";
    ctx.font = '700 13px Bahnschrift, "Trebuchet MS", sans-serif';
    ctx.fillText("VAULT POWER", W - 88, 301);
    ctx.fillStyle = "#ffc75f";
    ctx.font = '400 54px "Cascadia Mono", "Lucida Console", monospace';
    ctx.fillText(profile.power.toLocaleString("en-US"), W - 88, 348);

    const statY = 410;
    const statW = (W - 172 - 32) / 3;
    const stats = [
      ["RELICS", `${profile.found}/${profile.total}`],
      ["RAREST", profile.rarest ? profile.rarest.name : "—"],
      ["BEST RUN", profile.best.toLocaleString("en-US")]
    ];
    stats.forEach(([label, value], index) => {
      const x = 86 + index * (statW + 16);
      ctx.fillStyle = "rgba(5, 8, 18, 0.45)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      roundCanvasRect(ctx, x, statY, statW, 80, 12);
      ctx.fill();
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.fillStyle = "#747b9a";
      ctx.font = '700 10px Bahnschrift, "Trebuchet MS", sans-serif';
      drawSpacedText(ctx, label, x + statW / 2, statY + 22, 1.7);
      ctx.fillStyle = label === "RELICS" ? "#ffc75f" : "#e6dfd0";
      ctx.font = '400 18px "Cascadia Mono", "Lucida Console", monospace';
      ctx.fillText(fitCanvasText(ctx, value, statW - 22), x + statW / 2, statY + 53);
    });

    ctx.textAlign = "left";
    ctx.fillStyle = "#8a90ab";
    ctx.font = '700 12px Bahnschrift, "Trebuchet MS", sans-serif';
    drawSpacedText(ctx, "SHOWCASE", 86, 526, 2.5, true);

    const showcaseW = (W - 172 - 32) / 3;
    for (let i = 0; i < 3; i++) {
      const item = profile.showcaseItems[i];
      const x = 86 + i * (showcaseW + 16);
      const y = 548;
      const rarity = item ? rarityById.get(item.rarityId) : null;
      const branch = item ? branchById.get(item.branchId) : null;
      ctx.fillStyle = item ? `rgba(${branch.rgb}, 0.08)` : "rgba(255, 255, 255, 0.025)";
      ctx.strokeStyle = item ? `rgba(${rarity.rgb}, 0.34)` : "rgba(255, 255, 255, 0.09)";
      roundCanvasRect(ctx, x, y, showcaseW, 142, 14);
      ctx.fill();
      ctx.stroke();

      if (item) {
        ctx.fillStyle = `rgb(${branch.rgb})`;
        ctx.font = '600 30px Bahnschrift, "Trebuchet MS", sans-serif';
        ctx.fillText(branch.symbol, x + 18, y + 44);
        ctx.fillStyle = "#eee7d8";
        ctx.font = '700 16px Bahnschrift, "Trebuchet MS", sans-serif';
        ctx.fillText(fitCanvasText(ctx, item.name, showcaseW - 36), x + 18, y + 82);
        ctx.fillStyle = `rgb(${rarity.rgb})`;
        ctx.font = '700 10px Bahnschrift, "Trebuchet MS", sans-serif';
        ctx.fillText(`${rarity.name.toUpperCase()} · ×${collection[item.id] || 0}`, x + 18, y + 108);
      } else {
        ctx.fillStyle = "#56607e";
        ctx.font = '700 12px Bahnschrift, "Trebuchet MS", sans-serif';
        ctx.fillText("SHOWCASE SLOT", x + 18, y + 62);
      }
    }

    ctx.fillStyle = "#8a90ab";
    ctx.font = '700 12px Bahnschrift, "Trebuchet MS", sans-serif';
    drawSpacedText(ctx, "BRANCH PROGRESS", 86, 730, 2.5, true);

    profile.branchProgress.forEach((branch, index) => {
      const col = index < 4 ? 0 : 1;
      const row = index % 4;
      const x = 86 + col * 470;
      const y = 762 + row * 43;
      ctx.fillStyle = `rgb(${branch.rgb})`;
      ctx.font = '700 11px Bahnschrift, "Trebuchet MS", sans-serif';
      ctx.fillText(branch.short, x, y);
      ctx.fillStyle = "rgba(255, 255, 255, 0.07)";
      roundCanvasRect(ctx, x + 88, y - 4, 260, 7, 4);
      ctx.fill();
      if (branch.found > 0) {
        ctx.fillStyle = `rgb(${branch.rgb})`;
        roundCanvasRect(ctx, x + 88, y - 4, 260 * (branch.found / branch.total), 7, 4);
        ctx.fill();
      }
      ctx.fillStyle = "#9a8b70";
      ctx.font = '400 10px "Cascadia Mono", "Lucida Console", monospace';
      ctx.textAlign = "right";
      ctx.fillText(`${branch.found}/10`, x + 424, y);
      ctx.textAlign = "left";
    });

    ctx.fillStyle = "#8a90ab";
    ctx.font = '700 12px Bahnschrift, "Trebuchet MS", sans-serif';
    drawSpacedText(ctx, "EQUIPPED RELICS", 86, 962, 2.5, true);
    ctx.textAlign = "right";
    ctx.fillStyle = "#7e7194";
    ctx.font = '700 11px Bahnschrift, "Trebuchet MS", sans-serif';
    ctx.fillText(`${profile.unlockedRelics}/8 RELICS UNLOCKED · ${profile.dust} DUST`, W - 86, 962);
    ctx.textAlign = "left";

    const relicW = (W - 172 - 32) / 3;
    for (let i = 0; i < 3; i++) {
      const relic = profile.equippedRelics[i];
      const x = 86 + i * (relicW + 16);
      const y = 986;
      ctx.fillStyle = relic ? "rgba(255, 255, 255, 0.035)" : "rgba(255, 255, 255, 0.018)";
      ctx.strokeStyle = relic ? "rgba(255, 211, 132, 0.22)" : "rgba(255, 255, 255, 0.07)";
      roundCanvasRect(ctx, x, y, relicW, 68, 12);
      ctx.fill();
      ctx.stroke();
      if (relic) {
        const branch = branchById.get(relic.branchId);
        ctx.fillStyle = `rgb(${branch.rgb})`;
        ctx.font = '600 21px Bahnschrift, "Trebuchet MS", sans-serif';
        ctx.fillText(branch.symbol, x + 18, y + 34);
        ctx.fillStyle = "#e7dfd0";
        ctx.font = '700 14px Bahnschrift, "Trebuchet MS", sans-serif';
        ctx.fillText(fitCanvasText(ctx, relic.name, relicW - 60), x + 52, y + 27);
        ctx.fillStyle = "#766f8c";
        ctx.font = '700 8px Bahnschrift, "Trebuchet MS", sans-serif';
        ctx.fillText("EQUIPPED", x + 52, y + 47);
      } else {
        ctx.fillStyle = "#4e5674";
        ctx.font = '700 11px Bahnschrift, "Trebuchet MS", sans-serif';
        ctx.fillText("EMPTY RELIC SLOT", x + 18, y + 35);
      }
    }

    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.beginPath();
    ctx.moveTo(86, 1110);
    ctx.lineTo(W - 86, 1110);
    ctx.stroke();

    ctx.fillStyle = "#5e657f";
    ctx.font = '700 10px Bahnschrift, "Trebuchet MS", sans-serif';
    drawSpacedText(ctx, "NOVA ARCADE · COLLECTION PASSPORT", 86, 1170, 2.4, true);
    ctx.textAlign = "right";
    ctx.fillStyle = "#9b896b";
    ctx.font = '400 10px "Cascadia Mono", "Lucida Console", monospace';
    ctx.fillText("NOVA1 · CABINET 001", W - 86, 1170);

    const assets = ["✦", "✧", "◇", "⚡", "◎"];
    assets.forEach((symbol, index) => {
      ctx.fillStyle = index % 2 === 0 ? "rgba(255, 199, 95, 0.32)" : "rgba(173, 134, 255, 0.28)";
      ctx.font = '600 24px Bahnschrift, "Trebuchet MS", sans-serif';
      ctx.textAlign = "center";
      ctx.fillText(symbol, 320 + index * 110, 1230);
    });

    return canvas;
  }

  function downloadPassport() {
    const canvas = drawPassportCanvas();
    if (!canvas) {
      showToast("COULD NOT RENDER PASSPORT", "");
      return;
    }

    const download = (url) => {
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = "nova-vault-passport.png";
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      showToast("PASSPORT PNG DOWNLOADED", "gold");
    };

    if (typeof canvas.toBlob === "function") {
      canvas.toBlob((blob) => {
        if (!blob) {
          download(canvas.toDataURL("image/png"));
          return;
        }
        const url = URL.createObjectURL(blob);
        download(url);
        window.setTimeout(() => URL.revokeObjectURL(url), 2000);
      }, "image/png");
    } else {
      download(canvas.toDataURL("image/png"));
    }
  }

  function bindEvents() {
    el.tokenBtn.addEventListener("click", () => {
      openWheel();
    });

    el.wheelClose.addEventListener("click", closeWheel);

    el.tabWheel.addEventListener("click", () => setTab("wheel"));
    el.tabVault.addEventListener("click", () => setTab("vault"));
    el.tabRelics.addEventListener("click", () => setTab("relics"));
    el.tabPassport.addEventListener("click", () => setTab("passport"));

    el.spinBtn.addEventListener("click", spinWheel);
    el.sparkBtn.addEventListener("click", armSpark);

    el.vaultFilters.addEventListener("click", (event) => {
      const button = event.target.closest(".vault-filter");
      if (!button) return;
      setVaultFilter(button.dataset.branch);
    });

    el.vaultGrid.addEventListener("click", (event) => {
      const card = event.target.closest(".vault-card");
      if (!card) return;
      toggleShowcase(card.dataset.id);
    });

    el.relicGrid.addEventListener("click", (event) => {
      const card = event.target.closest(".relic-card");
      if (!card) return;
      toggleRelic(card.dataset.relic);
    });

    el.sharePngBtn.addEventListener("click", downloadPassport);
    el.copyCodeBtn.addEventListener("click", copyCollectionCode);
    el.copyCodeBtn2.addEventListener("click", copyCollectionCode);
    el.compareBtn.addEventListener("click", compareFriendVault);

    el.wheelMode.addEventListener("click", (event) => {
      if (event.target === el.wheelMode) closeWheel();
    });

    window.addEventListener("keydown", handleKeydown);
    window.addEventListener("resize", fitWheelCanvas);
  }

  function handleKeydown(event) {
    if (!wheel.open) return;

    if (event.key === "Escape") {
      event.preventDefault();
      closeWheel();
      return;
    }

    if (event.key === "Tab") {
      trapFocus(event);
      return;
    }

    if (event.code === "Space") {
      const target = event.target;
      if (target instanceof Element && target.closest("button, textarea, input")) return;
      if (wheel.tab !== "wheel" || wheel.busy) return;
      event.preventDefault();
      spinWheel();
    }
  }

  function trapFocus(event) {
    const focusables = Array.from(
      el.wheelMode.querySelectorAll(
        'button:not([disabled]), [href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )
    ).filter((element) => element.offsetParent !== null && !element.hidden);

    if (focusables.length === 0) return;
    const first = focusables[0];
    const last = focusables[focusables.length - 1];
    const active = document.activeElement;

    if (event.shiftKey) {
      if (active === first || !el.wheelMode.contains(active)) {
        event.preventDefault();
        last.focus();
      }
    } else if (active === last || !el.wheelMode.contains(active)) {
      event.preventDefault();
      first.focus();
    }
  }

  function openWheel() {
    if (wheel.open) return;

    wheel.open = true;
    wheel.lastFocus = document.activeElement;
    wheel.lastFrame = performance.now();
    el.wheelMode.classList.add("open");
    el.wheelMode.setAttribute("aria-hidden", "false");
    if (el.main) el.main.inert = true;

    updateWalletUi();
    updatePityUi();
    updateCollectionUi();

    if (tokens === 0 && !wheel.lastResult) {
      setTab("vault", true);
    } else {
      setTab("wheel", true);
      if (wheel.lastResult) {
        renderResultCard(wheel.lastResult, false);
      } else {
        resetRewardCard();
      }
    }

    // Never show sparks left over from a previous visit.
    sparks.length = 0;
    shockwaves.length = 0;

    fitWheelCanvas();
    if (!wheel.rafActive) {
      wheel.rafActive = true;
      requestAnimationFrame(wheelLoop);
    }

    dispatchSfx("wheel-open");

    window.setTimeout(() => {
      if (!wheel.open) return;
      if (tokens > 0 && wheel.tab === "wheel" && !wheel.busy) {
        el.spinBtn.focus({ preventScroll: true });
      } else {
        el.wheelClose.focus({ preventScroll: true });
      }
    }, 80);
  }

  function closeWheel() {
    if (!wheel.open || wheel.busy) return;

    wheel.open = false;
    el.wheelMode.classList.remove("open");
    el.wheelMode.setAttribute("aria-hidden", "true");
    if (el.main) el.main.inert = false;

    dispatchSfx("wheel-close");

    const restoreTarget = wheel.lastFocus;
    wheel.lastFocus = null;
    if (restoreTarget && typeof restoreTarget.focus === "function") {
      window.setTimeout(() => {
        try {
          restoreTarget.focus({ preventScroll: true });
        } catch {
          restoreTarget.focus();
        }
      }, 30);
    }
  }

  function setTab(tab, force) {
    if (wheel.busy && !force) return;
    const changed = wheel.tab !== tab;
    wheel.tab = tab;

    const panels = {
      wheel: el.wheelPanel,
      vault: el.vaultPanel,
      relics: el.relicPanel,
      passport: el.passportPanel
    };
    const tabs = {
      wheel: el.tabWheel,
      vault: el.tabVault,
      relics: el.tabRelics,
      passport: el.tabPassport
    };

    for (const key of Object.keys(panels)) {
      const active = key === tab;
      panels[key].hidden = !active;
      tabs[key].classList.toggle("active", active);
      tabs[key].setAttribute("aria-selected", String(active));
    }

    if (tab === "vault") updateCollectionUi();
    if (tab === "relics") updateRelicsUi();
    if (tab === "passport") updatePassportUi();

    if (changed && !force) dispatchSfx("vault-tab");

    el.wheelMode.scrollTop = 0;
  }

  function updateWalletUi() {
    el.tokenCount.textContent = String(tokens);
    el.tokenWord.textContent = tokens === 1 ? "TOKEN" : "TOKENS";
    el.wheelTokenCount.textContent = String(tokens);
    el.wheelTokenWord.textContent = tokens === 1 ? "TOKEN" : "TOKENS";
    el.tokenBtn.classList.toggle("ready", tokens > 0);
    el.tokenBtn.classList.toggle("empty", tokens === 0);
    el.tokenCta.textContent = tokens > 0 ? "SPIN →" : "VIEW →";
    el.tokenBtn.title = "Nova Prize Wheel — jackpots mint tokens";
    el.tokenBtn.setAttribute(
      "aria-label",
      `Open the Nova Prize Wheel. ${tokens} token${tokens === 1 ? "" : "s"} available.`
    );
    el.wheelDust.textContent = wheel.dust.toLocaleString("en-US");

    updateSpinButton();
    updateSparkUi();
  }

  function updateSparkUi() {
    if (!el.sparkBtn) return;
    const armed = wheel.spark;
    el.sparkBlock.classList.toggle("armed", armed);
    el.sparkBtn.disabled = wheel.busy || armed || wheel.dust < SPARK_COST;
    if (armed) {
      el.sparkBtn.textContent = "SPARK ARMED";
    } else if (wheel.dust < SPARK_COST) {
      el.sparkBtn.textContent = `NEED ${SPARK_COST} DUST`;
    } else {
      el.sparkBtn.textContent = `ARM · ${SPARK_COST} DUST`;
    }
  }

  function armSpark() {
    if (wheel.busy || wheel.spark || wheel.dust < SPARK_COST) return;
    wheel.dust -= SPARK_COST;
    wheel.spark = true;
    saveNumber(STORAGE.dust, wheel.dust);
    saveBoolean(STORAGE.spark, true);
    updateWalletUi();
    updatePassportUi();
    showToast("EPIC+ SPARK ARMED FOR THE NEXT SPIN", "gold");
    dispatchSfx("spark-armed");
    pulseHaptic(18);
  }

  function updateSpinButton() {
    const busy = wheel.busy;
    const canSpin = tokens > 0 && !busy;

    el.spinBtn.disabled = !canSpin;
    el.wheelClose.disabled = busy;
    el.tabWheel.disabled = busy;
    el.tabVault.disabled = busy;
    el.tabRelics.disabled = busy;
    el.tabPassport.disabled = busy;

    if (busy) {
      el.spinBtnLabel.textContent = wheel.spinning ? "SPINNING…" : "READING FATE…";
    } else if (tokens > 0) {
      el.spinBtnLabel.textContent = wheel.lastResult ? "SPIN AGAIN" : "SPIN THE WHEEL";
    } else {
      el.spinBtnLabel.textContent = "NO TOKENS";
    }

    el.spinCost.textContent = tokens > 0 ? "✦ 1" : "JACKPOT ✦1";
  }

  function updatePityUi() {
    const remaining = 10 - wheel.pity;
    const guaranteedNext = wheel.pity >= 9;

    el.pityText.textContent = guaranteedNext
      ? "NEXT SPIN GUARANTEED"
      : `IN ${remaining} SPIN${remaining === 1 ? "" : "S"}`;
    el.pityFill.style.width = `${(wheel.pity / 10) * 100}%`;
    el.pityBlock.classList.toggle("ready", guaranteedNext);
  }

  function updateCollectionUi() {
    const found = countFoundItems();
    const collectedLabel = `${found}/${TOTAL_ITEMS}`;

    el.vaultFound.textContent = String(found);
    el.vaultProgress.textContent = collectedLabel;

    for (const item of CATALOG) {
      const count = collection[item.id] || 0;
      const card = vaultCards.get(item.id);
      if (!card) continue;
      card.classList.toggle("locked", count === 0);
      card.classList.toggle("discovered", count > 0);
      const countEl = card.querySelector(".vc-count");
      if (countEl) countEl.textContent = count > 0 ? `×${count}` : "LOCKED";

      const level = masteryLevel(count);
      const pips = card.querySelectorAll(".vc-mastery i");
      pips.forEach((pip, index) => pip.classList.toggle("on", index < level));
      card.title = count > 0
        ? `${item.name} — ${count} copies · Mastery ${level}`
        : `${item.name} — locked`;
    }

    if (!wheel.lastResult && !wheel.busy) {
      el.rewardBadge.textContent = `${found} / ${TOTAL_ITEMS} COLLECTED`;
    }

    updateShowcaseUi();
    updateRelicsUi();
  }

  function countFoundItems() {
    let found = 0;
    for (const item of CATALOG) {
      if (collection[item.id] > 0) found++;
    }
    return found;
  }

  function getVaultSummary() {
    let found = 0;
    let nextBranch = null;

    for (const branch of BRANCHES) {
      let branchFound = 0;
      for (const rarity of RARITIES) {
        for (const item of branch.items[rarity.id]) {
          if (collection[item.id] > 0) branchFound += 1;
        }
      }

      found += branchFound;
      if (
        branchFound < 10 &&
        (!nextBranch || branchFound > nextBranch.found)
      ) {
        nextBranch = {
          id: branch.id,
          name: branch.name,
          short: branch.short,
          rgb: branch.rgb,
          found: branchFound,
          total: 10
        };
      }
    }

    return {
      found,
      total: TOTAL_ITEMS,
      tokens,
      dust: wheel.dust,
      nextBranch
    };
  }

  function pulseHaptic(pattern) {
    if (!pattern) return;
    try {
      if (navigator.vibrate) navigator.vibrate(pattern);
    } catch {
      // Haptics are a progressive enhancement.
    }
  }

  function setVaultFilter(branchId) {
    if (wheel.busy) return;
    wheel.filter = branchId;

    for (const [id, button] of vaultFilters) {
      const active = id === branchId;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    }

    for (const item of CATALOG) {
      const card = vaultCards.get(item.id);
      if (!card) continue;
      card.hidden = branchId !== "all" && item.branchId !== branchId;
    }

    el.vaultGrid.scrollTop = 0;
  }

  function spinWheel() {
    if (!wheel.open || wheel.busy) return;

    if (tokens < 1) {
      showToast("NO TOKENS · LAND A PACHINKO JACKPOT", "");
      return;
    }

    if (wheel.tab !== "wheel") setTab("wheel", true);

    tokens -= 1;
    saveNumber(STORAGE.tokens, tokens);
    wheel.spins += 1;
    saveNumber(STORAGE.spins, wheel.spins);

    const sparkUsed = wheel.spark;
    if (sparkUsed) {
      wheel.spark = false;
      saveBoolean(STORAGE.spark, false);
    }

    const targetIndex = Math.floor(Math.random() * BRANCHES.length);
    const branch = BRANCHES[targetIndex];
    const rarity = rollRarity(sparkUsed);
    const pool = branch.items[rarity.id];
    const item = pool[Math.floor(Math.random() * pool.length)];

    wheel.pending = { branch, rarity, item };
    wheel.targetIndex = targetIndex;
    wheel.selectedIndex = -1;
    wheel.busy = true;
    wheel.spinning = true;
    wheel.spinStart = performance.now();
    wheel.spinDuration = REDUCED_MOTION ? 1250 : 4050 + Math.random() * 900;
    wheel.spinFrom = wheel.angle;
    wheel.lastTick = -1;
    wheel.lastTickAt = 0;
    wheel.tension = false;

    const segment = TAU / BRANCHES.length;
    const targetCenter = -(targetIndex + 0.5) * segment;
    const jitter = (Math.random() - 0.5) * segment * 0.56;
    const finalAngle = targetCenter + jitter;
    let delta = normalizeAngle(finalAngle) - normalizeAngle(wheel.angle);
    if (delta < 0) delta += TAU;

    wheel.spinTo =
      wheel.angle +
      TAU * (6 + Math.floor(Math.random() * 3)) +
      delta;

    el.rewardCard.className = "reward-card rolling";
    el.rewardCard.style.setProperty("--branch-rgb", branch.rgb);
    el.rewardCard.style.setProperty("--rarity-rgb", "146, 153, 183");
    el.rewardBranch.textContent = "NOVA WHEEL";
    el.rewardRarity.textContent = "SPINNING";
    el.rewardSymbol.textContent = "✦";
    el.rewardName.textContent = "READING THE FATES";
    el.rewardDesc.textContent =
      "The wheel chooses the branch. The vault chooses the rarity.";
    el.rewardBadge.textContent = `${countFoundItems()} / ${TOTAL_ITEMS} COLLECTED`;

    el.wheelStatus.textContent = "The wheel is moving. Fate is listening.";
    highlightRarity(null);
    updateWalletUi();
    updatePityUi();
    dispatchSfx("wheel-start");
  }

  function rollRarity(forceGuaranteed) {
    const guaranteed = forceGuaranteed || wheel.pity >= 9;
    let rarity;

    if (guaranteed) {
      rarity = weightedRarity([
        [rarityById.get("epic"), 82],
        [rarityById.get("legendary"), 15],
        [rarityById.get("mythic"), 3]
      ]);
    } else {
      rarity = weightedRarity(RARITIES.map((entry) => [entry, entry.weight]));
    }

    if (rarity.rank >= 2) {
      wheel.pity = 0;
    } else {
      wheel.pity = Math.min(9, wheel.pity + 1);
    }

    saveNumber(STORAGE.pity, wheel.pity);
    return rarity;
  }

  function weightedRarity(entries) {
    const total = entries.reduce((sum, entry) => sum + entry[1], 0);
    let roll = Math.random() * total;

    for (const [rarity, weight] of entries) {
      roll -= weight;
      if (roll <= 0) return rarity;
    }

    return entries[entries.length - 1][0];
  }

  function wheelLoop(now) {
    if (!wheel.open) {
      wheel.rafActive = false;
      return;
    }

    const dt = clamp((now - wheel.lastFrame) / 1000, 0, 0.05);
    wheel.lastFrame = now;

    if (wheel.spinning) {
      const progress = clamp((now - wheel.spinStart) / wheel.spinDuration, 0, 1);
      const eased = 1 - Math.pow(1 - progress, 4.15);
      wheel.angle =
        wheel.spinFrom + (wheel.spinTo - wheel.spinFrom) * eased;

      const segment = TAU / BRANCHES.length;
      const tickSegment = Math.floor(normalizeAngle(wheel.angle) / segment);
      if (tickSegment !== wheel.lastTick && now - wheel.lastTickAt > 30) {
        wheel.lastTick = tickSegment;
        wheel.lastTickAt = now;
        dispatchSfx("wheel-tick", { progress });
      }

      // Arm the tension swell for the final slow-down, once per spin.
      if (!wheel.tension && progress >= 0.62) {
        wheel.tension = true;
        dispatchSfx("wheel-tension", { progress });
      }

      if (progress >= 1) finishSpin();
    }

    wheel.flash = Math.max(0, wheel.flash - dt * 2.1);
    updateBursts(dt);
    renderWheel(now);
    requestAnimationFrame(wheelLoop);
  }

  function finishSpin() {
    wheel.spinning = false;
    wheel.angle = normalizeAngle(wheel.spinTo);
    wheel.selectedIndex = wheel.targetIndex;
    wheel.flash = 0.75;
    wheel.flashRgb = wheel.pending.branch.rgb;

    el.wheelStatus.textContent = `${wheel.pending.branch.name} branch locked. Reading the rarity…`;
    el.rewardCard.className = "reward-card rolling";
    el.rewardCard.style.setProperty("--branch-rgb", wheel.pending.branch.rgb);
    el.rewardBranch.textContent = wheel.pending.branch.name.toUpperCase();
    el.rewardRarity.textContent = "BRANCH LOCKED";
    el.rewardSymbol.textContent = wheel.pending.branch.symbol;
    el.rewardName.textContent = "READING RARITY";
    el.rewardDesc.textContent = "The vault is deciding how rare this should be.";

    updateWalletUi();
    dispatchSfx("wheel-land", { index: wheel.targetIndex });

    window.clearInterval(wheel.rarityRollTimer);
    if (!REDUCED_MOTION) {
      // The ladder flickers at the real odds rather than one fifth each, so a
      // mythic flash past stays a genuine event instead of manufactured
      // tension. Each stop also plays that tier's own preview sound.
      const ladder = RARITIES.map((entry) => [entry, entry.weight]);
      wheel.rarityRollTimer = window.setInterval(() => {
        const flicker = weightedRarity(ladder);
        el.rewardCard.style.setProperty("--rarity-rgb", flicker.rgb);
        el.rewardRarity.textContent = flicker.name.toUpperCase();
        el.rewardRarity.style.color = `rgb(${flicker.rgb})`;
        dispatchSfx("rarity-tick", { rank: flicker.rank });
      }, 85);
    }

    window.setTimeout(() => {
      if (wheel.pending) revealReward();
    }, REDUCED_MOTION ? 220 : 680);
  }

  function revealReward() {
    const pending = wheel.pending;
    if (!pending) return;

    const { branch, rarity, item } = pending;
    const branchFoundBefore = getBranchFound(item.branchId);
    const existing = collection[item.id] || 0;
    const isNew = existing === 0;
    const count = existing + 1;
    const previousMastery = masteryLevel(existing);
    const mastery = masteryLevel(count);
    const dustGain = existing > 0 ? DUST_BY_RARITY[rarity.id] : 0;

    collection[item.id] = count;
    wheel.dust += dustGain;
    saveCollection(collection);
    saveNumber(STORAGE.dust, wheel.dust);

    if (isNew && !wheel.showcaseCustom && wheel.showcase.length < 3) {
      wheel.showcase.push(item.id);
      saveStringArray(STORAGE.showcase, wheel.showcase);
    }

    const result = {
      branch,
      rarity,
      item,
      count,
      isNew,
      mastery,
      previousMastery,
      dustGain
    };

    window.clearInterval(wheel.rarityRollTimer);
    wheel.rarityRollTimer = 0;
    el.rewardRarity.style.color = "";

    wheel.lastResult = result;
    wheel.pending = null;
    wheel.busy = false;
    wheel.flash = 1;
    wheel.flashRgb = rarity.rgb;

    renderResultCard(result, true);
    highlightRarity(rarity);
    updateCollectionUi();
    updateWalletUi();
    updatePityUi();

    const found = countFoundItems();
    el.wheelStatus.textContent = isNew
      ? `New discovery: ${item.name}. Mastery I. ${found} of ${TOTAL_ITEMS} collected.`
      : `Duplicate secured: +${dustGain} Nova Dust.${mastery > previousMastery ? ` Mastery ${mastery} reached.` : ""} ${item.name} is now ×${count}.`;

    pulseHaptic(
      rarity.rank >= 4
        ? [0, 22, 26, 48, 34, 120]
        : rarity.rank >= 3
          ? [0, 26, 32, 58]
          : rarity.rank >= 2
            ? 26
            : 0
    );
    window.dispatchEvent(
      new CustomEvent("nova:collectionchange", { detail: getVaultSummary() })
    );

    const vaultCard = vaultCards.get(item.id);
    if (vaultCard && isNew) {
      vaultCard.classList.remove("new-hit");
      void vaultCard.offsetWidth;
      vaultCard.classList.add("new-hit");
      window.setTimeout(() => vaultCard.classList.remove("new-hit"), 1100);
    }

    dispatchSfx("wheel-reveal", { rank: rarity.rank });

    if (rarity.rank >= 3) {
      if (!REDUCED_MOTION) spawnRevealBurst(rarity.rgb, rarity.rank);
      flashRarity(rarity);
      if (rarity.rank >= 4 && !REDUCED_MOTION) {
        // A second, wider burst a beat later keeps the moment going.
        window.setTimeout(() => {
          if (wheel.open) spawnRevealBurst(rarity.rgb, rarity.rank);
        }, 260);
      }
    }

    if (branchFoundBefore === 9) {
      const unlockedRelic = RELICS.find((relic) => relic.branchId === item.branchId);
      if (unlockedRelic) {
        showToast(`RELIC UNLOCKED · ${unlockedRelic.name.toUpperCase()}`, "gold");
        pulseHaptic([0, 35, 45, 80]);
      }
    } else if (rarity.rank >= 3) {
      showToast(
        `${rarity.name.toUpperCase()} · ${item.name}`,
        rarity.rank >= 4 ? "mythic" : "gold"
      );
    }

    window.setTimeout(() => {
      if (wheel.open && !wheel.busy && tokens > 0) {
        el.spinBtn.focus({ preventScroll: true });
      }
    }, 100);
  }

  function renderResultCard(result, animate) {
    const { branch, rarity, item, count, isNew, mastery, dustGain } = result;
    const found = countFoundItems();

    el.rewardCard.className = "reward-card";
    el.rewardCard.style.setProperty("--branch-rgb", branch.rgb);
    el.rewardCard.style.setProperty("--rarity-rgb", rarity.rgb);
    el.rewardBranch.textContent = branch.name.toUpperCase();
    el.rewardRarity.textContent = rarity.name.toUpperCase();
    el.rewardSymbol.textContent = branch.symbol;
    el.rewardName.textContent = item.name;
    el.rewardDesc.textContent = item.description;
    el.rewardBadge.textContent = isNew
      ? `NEW DISCOVERY · MASTERY I · ${found}/${TOTAL_ITEMS}`
      : `DUPLICATE +${dustGain} DUST · M${mastery} · ×${count}`;

    if (animate) {
      void el.rewardCard.offsetWidth;
      el.rewardCard.classList.add("revealed", rarity.id);
    } else {
      el.rewardCard.classList.add(rarity.id);
    }

    highlightRarity(rarity);
  }

  function resetRewardCard() {
    const found = countFoundItems();
    el.rewardCard.className = "reward-card empty";
    el.rewardCard.style.setProperty("--branch-rgb", "146, 153, 183");
    el.rewardCard.style.setProperty("--rarity-rgb", "146, 153, 183");
    el.rewardBranch.textContent = "NOVA WHEEL";
    el.rewardRarity.textContent = "READY";
    el.rewardSymbol.textContent = "?";
    el.rewardName.textContent = "SPIN TO REVEAL";
    el.rewardDesc.textContent =
      "Each branch holds ten placeholder prizes spread across the full rarity ladder.";
    el.rewardBadge.textContent = `${found} / ${TOTAL_ITEMS} COLLECTED`;
    highlightRarity(null);
  }

  function flashRarity(rarity) {
    const node = el.rarityFlash;
    if (!node || REDUCED_MOTION) return;

    node.style.setProperty("--flash-rgb", rarity.rgb);
    node.classList.remove("flash", "strong");
    void node.offsetWidth;
    node.classList.add("flash");
    if (rarity.rank >= 4) node.classList.add("strong");

    window.clearTimeout(flashRarity.timer);
    flashRarity.timer = window.setTimeout(() => {
      node.classList.remove("flash", "strong");
    }, rarity.rank >= 4 ? 1300 : 800);
  }

  function highlightRarity(rarity) {
    const steps = el.rarityLadder.querySelectorAll(".rarity-step");
    for (const step of steps) {
      const rank = Number(step.dataset.rank);
      const lit = rarity ? rank <= rarity.rank : false;
      step.classList.toggle("lit", lit);
      step.classList.toggle("hit", rarity ? rank === rarity.rank : false);
    }
  }

  function awardToken(amount, source) {
    const quantity = Math.max(0, Math.floor(amount));
    if (quantity <= 0) return;

    tokens += quantity;
    saveNumber(STORAGE.tokens, tokens);
    updateWalletUi();

    el.tokenBtn.classList.remove("token-pop");
    void el.tokenBtn.offsetWidth;
    el.tokenBtn.classList.add("token-pop");
    window.setTimeout(() => el.tokenBtn.classList.remove("token-pop"), 520);

    const sourceLabel = source === "jackpot" ? "JACKPOT" : "TOKEN";
    showToast(
      `${sourceLabel} · +${quantity} NOVA TOKEN${quantity === 1 ? "" : "S"}`,
      "gold"
    );
    dispatchSfx("token-earned");
    pulseHaptic([0, 20, 30, 45]);
  }

  function showToast(message, tone) {
    el.gameToast.textContent = message;
    el.gameToast.classList.toggle("gold", tone === "gold" || tone === "mythic");
    el.gameToast.classList.toggle("mythic", tone === "mythic");
    el.gameToast.classList.remove("show");
    void el.gameToast.offsetWidth;
    el.gameToast.classList.add("show");

    window.clearTimeout(showToast.timer);
    showToast.timer = window.setTimeout(() => {
      el.gameToast.classList.remove("show");
    }, 2800);
  }

  function dispatchSfx(name, extra) {
    try {
      window.dispatchEvent(
        new CustomEvent("nova:sfx", {
          detail: { name, ...(extra || {}) }
        })
      );
    } catch {
      // The game's audio bridge is optional.
    }
  }

  function fitWheelCanvas() {
    const deviceDpr = window.devicePixelRatio || 1;
    const coarse = window.matchMedia("(pointer: coarse)").matches;
    // The disc is mostly large colour fields and big labels, so it holds up at a
    // lower backing scale than the board, and it fills the screen with several
    // full-canvas passes per frame.
    const dpr = clamp(coarse ? Math.min(deviceDpr, 1.6) : Math.min(deviceDpr, 2), 1, 2);
    if (Math.abs(dpr - wheel.scale) > 0.001) {
      wheel.scale = dpr;
      el.wheelCanvas.width = Math.round(WHEEL_SIZE * dpr);
      el.wheelCanvas.height = Math.round(WHEEL_SIZE * dpr);
      wheelGradients = null;
    }
    wheelCtx.setTransform(wheel.scale, 0, 0, wheel.scale, 0, 0);
  }

  function renderWheel(now) {
    const ctx = wheelCtx;
    const dpr = wheel.scale || 1;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, WHEEL_SIZE, WHEEL_SIZE);

    const cx = WHEEL_SIZE / 2;
    const cy = WHEEL_SIZE / 2;
    const segment = TAU / BRANCHES.length;
    const angle = wheel.angle;

    const grads = ensureWheelGradients(ctx);
    ctx.fillStyle = grads.outer;
    ctx.fillRect(0, 0, WHEEL_SIZE, WHEEL_SIZE);

    const seconds = REDUCED_MOTION ? 0 : now * 0.001;
    // The room dims with the music during the final slow-down, so the landing
    // flash has somewhere to bloom out of.
    const quiet = wheel.spinning && wheel.tension ? 0.78 : 1;

    // Pool of lamp light around the disc, plus dust drifting through it.
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha =
      (0.2 + Math.sin(seconds * 0.5) * 0.025 + (wheel.spinning ? 0.045 : 0)) * quiet;
    ctx.drawImage(lampSprite(), cx - 460, cy - 460, 920, 920);

    ctx.fillStyle = "#ffe9c4";
    for (const mote of motes) {
      const moteY = (((mote.y - seconds * mote.drift) % 1) + 1) % 1;
      const moteX =
        mote.x + Math.sin(seconds * 0.22 + mote.phase) * (mote.sway / WHEEL_SIZE);
      const twinkle = 0.55 + Math.sin(seconds * 0.85 + mote.phase) * 0.45;
      ctx.globalAlpha = mote.alpha * twinkle;
      ctx.beginPath();
      ctx.arc(moteX * WHEEL_SIZE, moteY * WHEEL_SIZE, mote.r, 0, TAU);
      ctx.fill();
    }
    ctx.restore();

    ctx.beginPath();
    ctx.arc(cx, cy, 352, 0, TAU);
    ctx.fillStyle = grads.rim;
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 232, 191, 0.28)";
    ctx.lineWidth = 1.2;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 334, 0, TAU);
    ctx.strokeStyle = "rgba(255, 205, 111, 0.18)";
    ctx.lineWidth = 2;
    ctx.stroke();

    // Rim bulbs: two comets chase the bezel. They idle slow, race while the
    // wheel spins, and bloom around the pointer when a result lands.
    const bulbCount = 32;
    const clock = REDUCED_MOTION ? 0 : now;
    const travel = clock * 0.001 * (wheel.spinning ? 6.4 : 0.85);
    const flash = clamp(wheel.flash || 0, 0, 1);

    for (let i = 0; i < bulbCount; i++) {
      const theta = (i / bulbCount) * TAU;
      const x = cx + Math.cos(theta) * 344;
      const y = cy + Math.sin(theta) * 344;

      const primary = Math.pow(0.5 + 0.5 * Math.cos(theta * 2 - travel * 2), 8);
      const secondary = Math.pow(
        0.5 + 0.5 * Math.cos(theta * 2 - travel * 2 + Math.PI),
        8
      );
      const pointerAngle = Math.abs(normalizeAngle(theta + Math.PI / 2));
      const pointerDistance = Math.min(pointerAngle, TAU - pointerAngle);
      const flare = clamp(flash * (1 - pointerDistance / 0.7), 0, 1) * 0.9;

      const alpha = clamp(
        (0.16 + primary * 0.66 + secondary * 0.22 + flare) * quiet,
        0,
        1
      );
      const radius = 2 + primary * 1.5 + flare * 1.6;

      ctx.beginPath();
      ctx.arc(x, y, radius, 0, TAU);
      ctx.fillStyle = `rgba(255, 228, 170, ${alpha})`;
      ctx.fill();

      if (alpha > 0.52) {
        ctx.save();
        ctx.globalCompositeOperation = "lighter";
        ctx.globalAlpha = (alpha - 0.52) * 1.7;
        ctx.drawImage(rimGlowSprite(), x - 30, y - 30, 60, 60);
        ctx.restore();
      }
    }

    ctx.save();
    ctx.translate(cx, cy);
    ctx.rotate(angle);

    for (let i = 0; i < BRANCHES.length; i++) {
      const branch = BRANCHES[i];
      const start = -Math.PI / 2 + i * segment;
      const end = start + segment;
      const mid = start + segment / 2;
      const selected = wheel.selectedIndex === i && !wheel.spinning;

      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, WHEEL_RADIUS, start, end);
      ctx.closePath();

      ctx.fillStyle = grads.wedges[i];
      ctx.fill();

      if (i % 2 === 0) {
        ctx.fillStyle = "rgba(3, 5, 12, 0.08)";
        ctx.fill();
      }

      if (selected) {
        ctx.fillStyle = "rgba(255, 245, 223, 0.1)";
        ctx.fill();
        ctx.strokeStyle = "rgba(255, 231, 178, 0.95)";
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, WHEEL_RADIUS - 3, start + 0.018, end - 0.018);
        ctx.stroke();
      }

      ctx.strokeStyle = "rgba(4, 7, 15, 0.8)";
      ctx.lineWidth = 2.4;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(
        Math.cos(start) * WHEEL_RADIUS,
        Math.sin(start) * WHEEL_RADIUS
      );
      ctx.stroke();

      const labelRadius = 224;
      const labelX = Math.cos(mid) * labelRadius;
      const labelY = Math.sin(mid) * labelRadius;

      ctx.save();
      ctx.translate(labelX, labelY);
      ctx.rotate(mid + Math.PI / 2);
      const lightLabel = branch.id === "wild";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = '800 15px Bahnschrift, "Trebuchet MS", sans-serif';
      ctx.fillStyle = lightLabel
        ? selected
          ? "#241e30"
          : "rgba(34, 28, 46, 0.8)"
        : selected
          ? "#fff8e6"
          : "rgba(255, 248, 232, 0.88)";
      ctx.shadowColor = lightLabel
        ? "rgba(255, 255, 255, 0.2)"
        : "rgba(2, 5, 12, 0.9)";
      ctx.shadowBlur = lightLabel ? 2 : 7;
      ctx.fillText(branch.short, 0, 0);
      ctx.restore();

      const iconRadius = 160;
      const iconX = Math.cos(mid) * iconRadius;
      const iconY = Math.sin(mid) * iconRadius;

      ctx.beginPath();
      ctx.arc(iconX, iconY, 25, 0, TAU);
      ctx.fillStyle = "rgba(5, 9, 20, 0.42)";
      ctx.fill();
      ctx.strokeStyle = `rgba(${branch.rgb}, ${selected ? 0.8 : 0.36})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      ctx.save();
      ctx.translate(iconX, iconY);
      ctx.rotate(mid + Math.PI / 2);
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.font = '600 22px Bahnschrift, "Trebuchet MS", sans-serif';
      ctx.fillStyle = lightLabel
        ? selected
          ? "rgba(34, 28, 46, 0.95)"
          : "rgba(34, 28, 46, 0.68)"
        : selected
          ? "rgba(255, 249, 234, 0.98)"
          : "rgba(255, 249, 234, 0.68)";
      ctx.fillText(branch.symbol, 0, 1);
      ctx.restore();
    }

    ctx.restore();

    // The lamp sits above and behind the viewer, so the top of the disc catches
    // more of it than the bottom.
    ctx.save();
    ctx.globalCompositeOperation = "lighter";
    ctx.globalAlpha = quiet;
    ctx.drawImage(discLampSprite(), 0, 0, WHEEL_SIZE, WHEEL_SIZE);
    ctx.restore();

    ctx.fillStyle = grads.hubGlow;
    ctx.beginPath();
    ctx.arc(cx, cy, 115, 0, TAU);
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, 96, 0, TAU);
    ctx.fillStyle = grads.hub;
    ctx.fill();
    ctx.strokeStyle = "rgba(255, 220, 153, 0.55)";
    ctx.lineWidth = 1.6;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, 78, 0, TAU);
    ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
    ctx.lineWidth = 1;
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = "rgba(255, 205, 108, 0.9)";
    ctx.font = '600 20px Bahnschrift, "Trebuchet MS", sans-serif';
    ctx.shadowColor = "rgba(255, 194, 87, 0.5)";
    ctx.shadowBlur = 13;
    ctx.fillText("✦", cx, cy - 29);

    ctx.shadowBlur = 0;
    ctx.fillStyle = "#fff0d2";
    ctx.font = '400 24px Impact, Haettenschweiler, "Arial Narrow Bold", sans-serif';
    ctx.fillText("NOVA", cx, cy + 4);

    ctx.font = '700 6.5px Bahnschrift, "Trebuchet MS", sans-serif';
    ctx.fillStyle = "rgba(226, 204, 174, 0.55)";
    drawSpacedText(ctx, "TOKEN WHEEL", cx, cy + 27, 1.7);

    ctx.fillStyle = grads.pointer;
    ctx.shadowColor = "rgba(255, 189, 71, 0.72)";
    ctx.shadowBlur = 18;
    ctx.beginPath();
    ctx.moveTo(cx, 83);
    ctx.lineTo(cx - 18, 40);
    ctx.quadraticCurveTo(cx - 20, 30, cx - 10, 30);
    ctx.lineTo(cx + 10, 30);
    ctx.quadraticCurveTo(cx + 20, 30, cx + 18, 40);
    ctx.closePath();
    ctx.fill();
    ctx.shadowBlur = 0;
    ctx.strokeStyle = "rgba(93, 48, 8, 0.45)";
    ctx.lineWidth = 1;
    ctx.stroke();

    if (wheel.flash > 0.01) {
      ctx.save();
      ctx.strokeStyle = `rgba(${wheel.flashRgb}, ${wheel.flash * 0.55})`;
      ctx.lineWidth = 5;
      ctx.shadowColor = `rgba(${wheel.flashRgb}, ${wheel.flash * 0.65})`;
      ctx.shadowBlur = 22;
      ctx.beginPath();
      ctx.arc(cx, cy, 326, 0, TAU);
      ctx.stroke();
      ctx.restore();
    }

    drawBursts(ctx);
  }

  function drawSpacedText(ctx, text, centerX, y, spacing, leftAligned) {
    const chars = Array.from(text);
    let total = 0;
    for (const char of chars) total += ctx.measureText(char).width + spacing;
    total -= spacing;

    let x = leftAligned ? centerX : centerX - total / 2;
    const previousAlign = ctx.textAlign;
    ctx.textAlign = "left";
    for (const char of chars) {
      ctx.fillText(char, x, y);
      x += ctx.measureText(char).width + spacing;
    }
    ctx.textAlign = previousAlign;
  }

  function normalizeAngle(value) {
    return ((value % TAU) + TAU) % TAU;
  }

  function loadStringArray(key) {
    try {
      const raw = JSON.parse(window.localStorage.getItem(key) || "[]");
      return Array.isArray(raw)
        ? raw.filter((value) => typeof value === "string")
        : [];
    } catch {
      return [];
    }
  }

  function saveStringArray(key, value) {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch {
      // Storage can be unavailable in private or file contexts.
    }
  }

  function loadCollection() {
    try {
      const raw = JSON.parse(window.localStorage.getItem(STORAGE.collection) || "{}");
      if (!raw || typeof raw !== "object" || Array.isArray(raw)) return {};
      const clean = {};
      for (const [key, value] of Object.entries(raw)) {
        const count = Number(value);
        if (Number.isFinite(count) && count > 0) {
          clean[key] = Math.floor(count);
        }
      }
      return clean;
    } catch {
      return {};
    }
  }

  function saveCollection(value) {
    try {
      window.localStorage.setItem(STORAGE.collection, JSON.stringify(value));
    } catch {
      // Storage can be unavailable in private or file contexts.
    }
  }

  function loadNumber(key, fallback) {
    try {
      const value = Number(window.localStorage.getItem(key));
      return Number.isFinite(value) && value >= 0
        ? Math.floor(value)
        : fallback;
    } catch {
      return fallback;
    }
  }

  function saveNumber(key, value) {
    try {
      window.localStorage.setItem(key, String(Math.max(0, Math.floor(value))));
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

  function clamp(value, min, max) {
    return value < min ? min : value > max ? max : value;
  }
})();
