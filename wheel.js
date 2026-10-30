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

  // Duplicates used to make Dust and nothing else, and Dust has one use. Shards
  // give a duplicate a second job: ten of one rarity forge *any* missing item
  // of that rarity, which turns the last hole in a set from a lottery ticket
  // into a plan. The rarer the duplicate, the more shards it is worth, so the
  // five counters fill at roughly the same rate the wheel pays them out.
  const SHARDS_PER_DUPE = {
    common: 1,
    rare: 2,
    epic: 3,
    legendary: 5,
    mythic: 8
  };
  const FORGE_COST = 10;
  // Every branch holds exactly two items per rarity, so the vault is really 40
  // pairs. Finishing one pays shards of its own rarity, which makes the pairs a
  // steady drip towards a forge rather than a separate currency.
  const PAIR_SHARD_BONUS = 3;
  // Mythic shards only ever come from mythic duplicates, which is a closed door:
  // you cannot forge a mythic until you already own one. Five legendary shards —
  // exactly one legendary duplicate — trade up into one mythic shard, so the
  // door always has a handle. The ladder stops there; epics do not trade up.
  const LEGEND_PER_MYTHIC = 5;

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
    spark: "nova-pachinko-spark-v1",
    shards: "nova-pachinko-shards-v1",
    vaultView: "nova-pachinko-vault-view-v1"
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
    vaultEmpty: document.getElementById("vaultEmpty"),
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
    vaultShards: document.getElementById("vaultShards"),
    vaultRarity: document.getElementById("vaultRarity"),
    forgeHint: document.getElementById("forgeHint"),
    vaultHint: document.querySelector(".vault-hint"),
    vaultSky: document.getElementById("vaultSky"),
    skyCanvas: document.getElementById("skyCanvas"),
    skyCaption: document.getElementById("skyCaption"),
    vaultPairs: document.getElementById("vaultPairs"),
    viewGrid: document.getElementById("viewGrid"),
    viewSky: document.getElementById("viewSky"),
    vaultGrid: document.getElementById("vaultGrid"),
    spinBtn: document.getElementById("spinBtn"),
    spinBtnLabel: document.getElementById("spinBtnLabel"),
    wheelHit: document.getElementById("wheelHit"),
    skipSpin: document.getElementById("skipSpin"),
    spinFiveBtn: document.getElementById("spinFiveBtn"),
    spinAllBtn: document.getElementById("spinAllBtn"),
    spinAllCost: document.getElementById("spinAllCost"),
    batchList: document.getElementById("batchList"),
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
  const shardChips = new Map();
  const rarityFilters = new Map();

  // The 40 pairs, worked out once from the catalogue: { branchId, rarityId, ids }.
  const PAIRS = [];
  for (const branch of BRANCHES) {
    for (const rarity of RARITIES) {
      const ids = CATALOG.filter(
        (item) => item.branchId === branch.id && item.rarityId === rarity.id
      ).map((item) => item.id);
      if (ids.length > 1) PAIRS.push({ branchId: branch.id, rarityId: rarity.id, ids });
    }
  }

  let tokens = loadNumber(STORAGE.tokens, 0);
  let collection = loadCollection();
  const itemById = new Map(CATALOG.map((item) => [item.id, item]));
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
    revealTimer: 0,
    // { total, left, results } while a x5 batch is running.
    batch: null,
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
    vaultView: loadBoolean(STORAGE.vaultView, false) ? "sky" : "grid",
    pity: clamp(loadNumber(STORAGE.pity, 0), 0, 9),
    spins: loadNumber(STORAGE.spins, 0),
    dust: loadNumber(STORAGE.dust, 0),
    spark: loadBoolean(STORAGE.spark, false),
    rarityFilter: null,
    shards: loadShards(),
    loadout,
    showcase,
    showcaseCustom: loadBoolean(STORAGE.showcaseCustom, false),
    lastFrame: 0,
    rafActive: false,
    lastFocus: null,
    scale: 0
  };

  // Declared up here because the init sequence below touches it: the sky's
  // layout functions live further down, but the state has to exist before the
  // first updateCollectionUi() runs.
  const sky = {
    active: false,
    canvasEl: el.skyCanvas,
    ctx: null,
    w: 0,
    h: 0,
    stars: [],
    groups: [],
    hover: null,
    caption: "",
    // { branchId, start } while a freshly completed constellation throws a ring.
    burst: null
  };

  buildRarityLadder();
  buildVault();
  buildVaultFilters();
  buildRarityFilters();
  buildShardStrip();
  buildRelics();
  sanitizeLoadout();
  sanitizeShowcase();
  bindEvents();
  fitWheelCanvas();
  updateWalletUi();
  updatePityUi();
  updateCollectionUi();
  applyVaultFilter();
  setVaultView(wheel.vaultView, true);
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
    shareRun: (data) => shareRun(data),
    getTokens: () => tokens,
    getCollection: () => ({ ...collection }),
    getVaultSummary,
    getBonuses,
    getProfile
  };

  // ---- Shards ---------------------------------------------------------------
  function emptyShards() {
    return { common: 0, rare: 0, epic: 0, legendary: 0, mythic: 0 };
  }

  // Shards arrived after some vaults were already deep, so a save with no shard
  // key is credited for every duplicate it ever pulled. Without that, a player
  // with 200 pulls would start at zero and a fresh save would out-earn them.
  function loadShards() {
    const shards = emptyShards();
    let raw = null;
    try {
      raw = window.localStorage.getItem(STORAGE.shards);
    } catch {
      raw = null;
    }

    if (raw === null) {
      for (const item of CATALOG) {
        const extra = (collection[item.id] || 0) - 1;
        if (extra > 0) shards[item.rarityId] += extra * (SHARDS_PER_DUPE[item.rarityId] || 0);
      }
      saveShardsRaw(shards);
      return shards;
    }

    try {
      const parsed = JSON.parse(raw) || {};
      for (const rarity of RARITIES) {
        const value = Number(parsed[rarity.id]);
        shards[rarity.id] = Number.isFinite(value) ? Math.max(0, Math.floor(value)) : 0;
      }
    } catch {
      // A corrupt value falls back to zero rather than breaking the vault.
    }
    return shards;
  }

  function saveShardsRaw(value) {
    try {
      window.localStorage.setItem(STORAGE.shards, JSON.stringify(value));
    } catch {
      // Storage can be unavailable in private or file contexts.
    }
  }

  function saveShards() {
    saveShardsRaw(wheel.shards);
  }

  function buildShardStrip() {
    if (!el.vaultShards) return;
    el.vaultShards.textContent = "";
    shardChips.clear();

    for (const rarity of RARITIES) {
      const chip = document.createElement("div");
      chip.className = "shard-chip";
      chip.dataset.rarity = rarity.id;
      chip.style.setProperty("--r-rgb", rarity.rgb);

      const count = document.createElement("strong");
      count.className = "shard-count";
      count.textContent = "0";

      const label = document.createElement("span");
      label.className = "shard-label";
      label.textContent = rarity.short;

      chip.append(count, label);

      if (rarity.id === "legendary") {
        chip.addEventListener("click", () => tradeUpShards());
        chip.addEventListener("keydown", (event) => {
          if (event.key !== "Enter" && event.key !== " " && event.key !== "Spacebar") return;
          event.preventDefault();
          tradeUpShards();
        });
      }

      el.vaultShards.appendChild(chip);
      shardChips.set(rarity.id, chip);
    }

    updateShardStrip();
  }

  function updateShardStrip() {
    for (const rarity of RARITIES) {
      const chip = shardChips.get(rarity.id);
      if (!chip) continue;
      const value = wheel.shards[rarity.id] || 0;
      const count = chip.querySelector(".shard-count");
      if (count) count.textContent = String(value);
      chip.classList.toggle("ready", value >= FORGE_COST);

      const canTrade = rarity.id === "legendary" && value >= LEGEND_PER_MYTHIC;
      chip.classList.toggle("tradeable", canTrade);
      if (rarity.id === "legendary") {
        if (canTrade) {
          chip.setAttribute("role", "button");
          chip.setAttribute("tabindex", "0");
          chip.setAttribute("title", `Trade ${LEGEND_PER_MYTHIC} legendary shards for 1 mythic shard`);
        } else {
          chip.removeAttribute("role");
          chip.removeAttribute("tabindex");
          chip.removeAttribute("title");
        }
      }

      chip.setAttribute(
        "aria-label",
        canTrade
          ? `Legendary: ${value} shards. Activate to trade ${LEGEND_PER_MYTHIC} for one mythic shard.`
          : `${rarity.name}: ${value} shard${value === 1 ? "" : "s"}${
              value >= FORGE_COST
                ? `, enough to forge any locked ${rarity.name}`
                : `, ${FORGE_COST - value} more to forge`
            }`
      );
    }

    // The shard rule is always spelled out, because the first duplicate is the
    // moment the counters start moving and the player deserves to know why.
    // Once a forge is actually affordable it switches from a rule to an action.
    if (el.forgeHint) {
      const anyReady = RARITIES.some((rarity) => (wheel.shards[rarity.id] || 0) >= FORGE_COST);
      const text = anyReady
        ? " · <b>FORGE ◆</b> spends 10 shards on any locked item"
        : " · 10 shards of one rarity forges any locked item";
      if (el.forgeHint.dataset.state !== String(anyReady)) {
        el.forgeHint.dataset.state = String(anyReady);
        el.forgeHint.innerHTML = text;
      }
      el.forgeHint.hidden = false;
    }
  }

  function isPairComplete(branchId, rarityId) {
    const pair = PAIRS.find((entry) => entry.branchId === branchId && entry.rarityId === rarityId);
    return Boolean(pair) && pair.ids.every((id) => (collection[id] || 0) > 0);
  }

  function countPairs() {
    let done = 0;
    for (const pair of PAIRS) {
      if (pair.ids.every((id) => (collection[id] || 0) > 0)) done += 1;
    }
    return done;
  }

  // Called *after* an item is granted, with the pair state captured before it:
  // a pair pays once, on the pull that completes it, and never again on reload.
  function celebratePair(branchId, rarityId, delay = 0, quiet = false) {
    const rarity = rarityById.get(rarityId);
    const branch = branchById.get(branchId);
    if (!rarity || !branch) return;

    wheel.shards[rarityId] = (wheel.shards[rarityId] || 0) + PAIR_SHARD_BONUS;
    saveShards();
    updateShardStrip();

    // A batch pays quietly and reports the pairs in its receipt instead.
    if (quiet) return;

    const announce = () => {
      showToast(
        `PAIR COMPLETE · ${branch.short} ${rarity.short} · +${PAIR_SHARD_BONUS} ◆`,
        "gold"
      );
      dispatchSfx("pair");
      pulseHaptic([0, 16, 22, 34]);
    };

    if (delay > 0) window.setTimeout(announce, delay);
    else announce();
  }

  // The tenth item in a branch is the constellation closing. The relic is the
  // reward, but the moment belongs to the sky, so it also fires a ring there.
  function celebrateBranch(branchId) {
    const relic = RELICS.find((entry) => entry.branchId === branchId);
    showToast(
      `RELIC UNLOCKED · ${(relic ? relic.name : "CONSTELLATION COMPLETE").toUpperCase()}`,
      "gold"
    );
    pulseHaptic([0, 35, 45, 80]);
    dispatchSfx("constellation");
    sky.burst = { branchId, start: performance.now() };
  }

  function tradeUpShards() {
    const legendary = wheel.shards.legendary || 0;
    if (legendary < LEGEND_PER_MYTHIC) return;

    wheel.shards.legendary = legendary - LEGEND_PER_MYTHIC;
    wheel.shards.mythic = (wheel.shards.mythic || 0) + 1;
    saveShards();
    updateShardStrip();

    const chip = shardChips.get("mythic");
    if (chip) {
      chip.classList.remove("chip-pop");
      void chip.offsetWidth;
      chip.classList.add("chip-pop");
    }

    showToast(`TRADE UP · ${LEGEND_PER_MYTHIC} LEGEND ◆ → 1 MYTHIC ◆`, "gold");
    dispatchSfx("pair");
  }

  function canForge(item) {
    return (
      (collection[item.id] || 0) === 0 &&
      (wheel.shards[item.rarityId] || 0) >= FORGE_COST
    );
  }

  // Spending shards is the one way to get a *specific* missing item, which is
  // what makes the last two holes in a set feel achievable instead of cursed.
  function forgeItem(itemId) {
    if (wheel.busy) return;
    const item = itemById.get(itemId);
    if (!item || !canForge(item)) return;

    const rarity = rarityById.get(item.rarityId);
    const branch = branchById.get(item.branchId);

    const branchFoundBefore = getBranchFound(item.branchId);
    const pairWasComplete = isPairComplete(item.branchId, item.rarityId);

    wheel.shards[rarity.id] = Math.max(0, (wheel.shards[rarity.id] || 0) - FORGE_COST);
    saveShards();

    collection[item.id] = 1;
    saveCollection(collection);
    if (!wheel.showcaseCustom && wheel.showcase.length < 3) {
      wheel.showcase.push(item.id);
      saveStringArray(STORAGE.showcase, wheel.showcase);
    }

    const result = {
      branch,
      rarity,
      item,
      count: 1,
      isNew: true,
      mastery: masteryLevel(1),
      previousMastery: 0,
      dustGain: 0,
      shardGain: 0,
      forged: true
    };

    wheel.lastResult = result;
    wheel.pending = null;
    wheel.flash = 1;
    wheel.flashRgb = rarity.rgb;

    renderResultCard(result, true);
    highlightRarity(rarity);
    updateCollectionUi();
    updateWalletUi();
    updatePityUi();
    applyVaultFilter();

    const card = vaultCards.get(item.id);
    if (card) {
      card.classList.remove("just-forged");
      void card.offsetWidth;
      card.classList.add("just-forged");
      card.scrollIntoView({ block: "nearest" });
    }

    dispatchSfx("forge");
    dispatchSfx("wheel-reveal", { rank: rarity.rank });
    pulseHaptic(rarity.rank >= 2 ? [0, 22, 26, 48] : 18);
    showToast(
      `FORGED · ${item.name.toUpperCase()}`,
      rarity.rank >= 3 ? "gold" : ""
    );

    const branchDone = branchFoundBefore === 9;
    if (!pairWasComplete && isPairComplete(item.branchId, item.rarityId)) {
      celebratePair(item.branchId, item.rarityId, branchDone ? 1700 : 0);
    }
    if (branchDone) celebrateBranch(item.branchId);

    window.dispatchEvent(
      new CustomEvent("nova:item", {
        detail: {
          id: item.id,
          name: item.name,
          branchId: item.branchId,
          rarityId: item.rarityId,
          isNew: true,
          forged: true
        }
      })
    );

    const found = countFoundItems();
    el.wheelStatus.textContent = `Forged from shards: ${item.name}. ${found} of ${TOTAL_ITEMS} collected.`;
    window.dispatchEvent(
      new CustomEvent("nova:collectionchange", { detail: getVaultSummary() })
    );
  }

  // ---- Nova sky -------------------------------------------------------------
  // Hand-drawn constellations, one per branch, ten stars each (two per rarity).
  // Points live in a [-1, 1] box that is scaled into the map; edges are drawn
  // as a chart, not connected nearest-neighbour, so each shape stays the shape
  // it was drawn as however the collection fills in. Shapes are never rotated —
  // a rotated fox is just a mess.
  const SKY_SHAPES = {
    // A crescent, horns up-right.
    lunar: {
      points: [[0.17, -0.98], [0.67, -0.74], [0.96, -0.28], [0.96, 0.28], [0.67, 0.74], [0.17, 0.98], [0.23, 0.50], [0.51, 0.21], [0.51, -0.21], [0.23, -0.50]],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 0]]
    },
    // A bolt: long diagonal, sharp step, long diagonal.
    neon: {
      points: [[0.55, -1.00], [0.27, -0.80], [-0.01, -0.60], [-0.30, -0.40], [-0.02, -0.40], [0.32, -0.40], [0.08, -0.04], [-0.20, 0.32], [-0.37, 0.66], [-0.55, 1.00]],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9]]
    },
    // Three ripples leaving a source star.
    echo: {
      points: [[-0.80, -0.10], [-0.38, -0.26], [-0.20, 0.00], [-0.38, 0.26], [0.05, -0.51], [0.15, 0.00], [0.05, 0.51], [0.45, -0.81], [0.62, 0.00], [0.45, 0.81]],
      edges: [[1, 2], [2, 3], [4, 5], [5, 6], [7, 8], [8, 9]]
    },
    // A ward: diamond, inner diamond, cross, keystone.
    sigil: {
      points: [[0, -1], [1, 0], [0, 1], [-1, 0], [0, -0.45], [0.45, 0], [0, 0.45], [-0.45, 0], [0, 0], [0, -0.72]],
      edges: [[0, 1], [1, 2], [2, 3], [3, 0], [4, 5], [5, 6], [6, 7], [7, 4], [8, 4], [8, 5], [8, 6], [8, 7], [0, 9], [9, 4]]
    },
    // The five-point star itself.
    star: {
      points: [[0, -1], [0.247, -0.34], [0.951, -0.309], [0.399, 0.13], [0.588, 0.809], [0, 0.42], [-0.588, 0.809], [-0.399, 0.13], [-0.951, -0.309], [-0.247, -0.34]],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 7], [7, 8], [8, 9], [9, 0]]
    },
    // A cut crystal with a cross facet.
    holo: {
      points: [[0, -1], [0.75, -0.5], [0.75, 0.4], [0, 1], [-0.75, 0.4], [-0.75, -0.5], [0, -0.30], [0, 0.35], [-0.45, 0.0], [0.45, 0.0]],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 0], [0, 6], [6, 7], [7, 3], [8, 9]]
    },
    // A pair of antlers.
    wild: {
      points: [[0.00, 1.00], [-0.22, 0.35], [-0.62, -0.05], [-0.55, -0.62], [-0.95, -0.30], [0.22, 0.35], [0.62, -0.05], [0.55, -0.62], [0.95, -0.30], [0.00, -0.45]],
      edges: [[0, 1], [1, 2], [2, 3], [2, 4], [0, 5], [5, 6], [6, 7], [6, 8], [0, 9]]
    },
    // A rocket with fins and a plume.
    boost: {
      points: [[0, -1.0], [-0.35, -0.55], [-0.35, 0.35], [-0.8, 0.55], [0.8, 0.55], [0.35, 0.35], [0.35, -0.55], [-0.20, 0.75], [0, 1.0], [0.20, 0.75]],
      edges: [[0, 1], [1, 2], [2, 3], [3, 4], [4, 5], [5, 6], [6, 0], [2, 7], [7, 8], [8, 9], [9, 5]]
    }
  };

  // Only used if a branch ever ships without a drawing: a plain ladder keeps the
  // map honest instead of throwing.
  function fallbackShape(count) {
    const points = [];
    for (let i = 0; i < count; i++) {
      const row = Math.floor(i / 2);
      points.push([(i % 2 === 0 ? -1 : 1) * 0.35, (row / 4 - 0.5) * 1.7]);
    }
    const edges = [];
    for (let i = 0; i < count - 1; i++) edges.push([i, i + 1]);
    return { points, edges };
  }

  // The vault as a star map: one constellation per branch, ten stars each, laid
  // out in rarity order from the tail (commons) to the head (mythics). Nothing
  // is simulated — the map is derived from the branch list and the collection,
  // so the sky and the grid can never disagree about what the player owns.
  function layoutSky() {
    if (!sky.ctx || sky.w < 60 || sky.h < 60) return;

    const cx = sky.w / 2;
    const cy = sky.h / 2;
    const radius = Math.min(sky.w * 0.33, sky.h * 0.32);
    const chord = 2 * radius * Math.sin(Math.PI / BRANCHES.length);
    // Each drawing spans two units across, so this is the half-width budget:
    // big enough to read, small enough to leave the ring a gap.
    const scale = chord * 0.44;
    const stars = [];
    const groups = [];

    BRANCHES.forEach((branch, b) => {
      const angle = -Math.PI / 2 + (b * TAU) / BRANCHES.length;
      const ox = cx + Math.cos(angle) * radius;
      const oy = cy + Math.sin(angle) * radius;
      const rot = angle + Math.PI / 2;

      const items = CATALOG.filter((item) => item.branchId === branch.id);
      const groupStars = [];
      const shape = SKY_SHAPES[branch.id];
      const drawing = shape && shape.points.length === items.length
        ? shape
        : fallbackShape(items.length);

      items.forEach((item, i) => {
        const point = drawing.points[i];
        const star = {
          x: ox + point[0] * scale,
          y: oy + point[1] * scale,
          b,
          angle,
          branch,
          item,
          rarity: rarityById.get(item.rarityId),
          found: (collection[item.id] || 0) > 0
        };
        stars.push(star);
        groupStars.push(star);
      });

      groups.push({
        branch,
        b,
        angle,
        ox,
        oy,
        stars: groupStars,
        edges: drawing.edges,
        scale,
        found: groupStars.filter((star) => star.found).length
      });
    });

    sky.stars = stars;
    sky.groups = groups;
  }

  let skyFitting = false;

  function fitSkyCanvas() {
    if (!sky.canvasEl) sky.canvasEl = el.skyCanvas;
    if (!sky.canvasEl || skyFitting) return;

    skyFitting = true;
    try {
      const rect = sky.canvasEl.getBoundingClientRect();
      if (!rect.width || !rect.height) return;

      const width = Math.round(rect.width);
      const height = Math.round(rect.height);
      if (width === sky.w && height === sky.h && sky.ctx) {
        layoutSky();
        return;
      }

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      sky.w = width;
      sky.h = height;
      sky.canvasEl.width = Math.round(width * dpr);
      sky.canvasEl.height = Math.round(height * dpr);
      sky.ctx = sky.canvasEl.getContext("2d");
      sky.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      layoutSky();
      buildSkyBackdrop();
    } finally {
      skyFitting = false;
    }
  }

  function skyCaptions() {
    if (!sky.hover) {
      const found = countFoundItems();
      const complete = sky.groups.filter((group) => group.found === group.stars.length).length;
      return `${found} of ${TOTAL_ITEMS} stars lit · ${complete} of ${BRANCHES.length} constellations complete`;
    }
    const owned = collection[sky.hover.item.id] || 0;
    const head = `${sky.hover.branch.name.toUpperCase()} · ${sky.hover.rarity.name.toUpperCase()}`;
    return owned > 0
      ? `${head} · ${sky.hover.item.name} · ×${owned}`
      : `${head} · ${sky.hover.item.name} · undiscovered`;
  }

  function setSkyCaption() {
    if (!el.skyCaption) return;
    const text = skyCaptions();
    if (text !== sky.caption) {
      sky.caption = text;
      el.skyCaption.textContent = text;
    }
  }

  function skyPick(event) {
    if (!sky.stars.length) return null;
    const rect = el.skyCanvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;
    let best = null;
    let bestDistance = 19 * 19;

    for (const star of sky.stars) {
      const dx = star.x - x;
      const dy = star.y - y;
      const distance = dx * dx + dy * dy;
      if (distance < bestDistance) {
        bestDistance = distance;
        best = star;
      }
    }
    return best;
  }

  // Gradients are expensive and canvas refuses to share them, so every glow is
  // baked into a sprite once per colour and blitted. This is what keeps the sky
  // cheap enough to animate on a phone.
  const skySprites = new Map();

  function skyGlowSprite(rgb) {
    const cached = skySprites.get(rgb);
    if (cached) return cached;

    const size = 64;
    const sprite = document.createElement("canvas");
    sprite.width = size;
    sprite.height = size;
    const paint = sprite.getContext("2d");
    const gradient = paint.createRadialGradient(size / 2, size / 2, 0, size / 2, size / 2, size / 2);
    gradient.addColorStop(0, `rgba(${rgb}, 0.55)`);
    gradient.addColorStop(0.42, `rgba(${rgb}, 0.16)`);
    gradient.addColorStop(1, `rgba(${rgb}, 0)`);
    paint.fillStyle = gradient;
    paint.fillRect(0, 0, size, size);

    skySprites.set(rgb, sprite);
    return sprite;
  }

  function buildSkyBackdrop() {
    const w = sky.w;
    const h = sky.h;
    if (!w || !h) return;

    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const backdrop = document.createElement("canvas");
    backdrop.width = Math.round(w * dpr);
    backdrop.height = Math.round(h * dpr);
    const paint = backdrop.getContext("2d");
    paint.setTransform(dpr, 0, 0, dpr, 0, 0);

    const cx = w / 2;
    const cy = h / 2;
    const nebula = paint.createRadialGradient(cx, cy, 6, cx, cy, Math.max(w, h) * 0.62);
    nebula.addColorStop(0, "rgba(96, 76, 190, 0.17)");
    nebula.addColorStop(0.55, "rgba(42, 50, 112, 0.07)");
    nebula.addColorStop(1, "rgba(0, 0, 0, 0)");
    paint.fillStyle = nebula;
    paint.fillRect(0, 0, w, h);

    paint.strokeStyle = "rgba(150, 168, 235, 0.07)";
    paint.setLineDash([2, 10]);
    paint.beginPath();
    paint.arc(cx, cy, Math.min(w * 0.3, h * 0.32), 0, TAU);
    paint.stroke();

    // A field of dust, seeded so it does not shimmer between frames.
    let seed = 0x1f123bb5;
    for (let i = 0; i < 90; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const x = (seed / 4294967296) * w;
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const y = (seed / 4294967296) * h;
      paint.fillStyle = `rgba(210, 224, 255, ${0.04 + (i % 5) * 0.012})`;
      paint.fillRect(x, y, 1, 1);
    }

    sky.backdrop = backdrop;
  }

  function renderSky(now) {
    const ctx = sky.ctx;
    if (!sky.active || !ctx || !sky.w) return;

    const w = sky.w;
    const h = sky.h;
    const t = now / 1000;
    const twinkle = REDUCED_MOTION ? 0 : t;
    const cx = w / 2;
    const cy = h / 2;
    const radius = Math.min(w * 0.33, h * 0.32);

    ctx.clearRect(0, 0, w, h);
    if (sky.backdrop) ctx.drawImage(sky.backdrop, 0, 0, w, h);

    for (const group of sky.groups) {
      const rgb = group.branch.rgb;
      const stars = group.stars;
      const complete = group.found === stars.length;

      if (complete) {
        ctx.globalAlpha = 0.5;
        ctx.drawImage(skyGlowSprite(rgb), group.ox - 62, group.oy - 62, 124, 124);
        ctx.globalAlpha = 1;
      }

      const link = (a, b, strength) => {
        // Unlit links stay visible: an empty constellation should read as a
        // chart of something, not as a hole in the sky.
        const alpha = a.found && b.found ? strength : a.found || b.found ? 0.22 : 0.11;
        ctx.strokeStyle = `rgba(${rgb}, ${alpha})`;
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.stroke();
      };

      ctx.save();
      ctx.lineWidth = 1;
      for (const [from, to] of group.edges) {
        const a = stars[from];
        const b = stars[to];
        if (a && b) link(a, b, 0.62);
      }
      ctx.restore();

      for (const star of stars) {
        if (star.found) {
          const pulse = REDUCED_MOTION ? 0.95 : 0.82 + Math.sin(twinkle * 1.5 + star.x * 0.04) * 0.16;
          ctx.globalAlpha = pulse;
          ctx.drawImage(skyGlowSprite(star.rarity.rgb), star.x - 13, star.y - 13, 26, 26);
          ctx.globalAlpha = 1;

          ctx.fillStyle = `rgba(255, 255, 255, ${0.8 * pulse})`;
          ctx.beginPath();
          ctx.arc(star.x, star.y, 2.5, 0, TAU);
          ctx.fill();

          ctx.strokeStyle = `rgba(${star.rarity.rgb}, ${0.8 * pulse})`;
          ctx.lineWidth = 1.2;
          ctx.beginPath();
          ctx.arc(star.x, star.y, 4.1, 0, TAU);
          ctx.stroke();
        } else {
          ctx.strokeStyle = `rgba(${rgb}, 0.3)`;
          ctx.lineWidth = 1;
          ctx.beginPath();
          ctx.arc(star.x, star.y, 2.4, 0, TAU);
          ctx.stroke();
        }
      }

      if (sky.hover && sky.hover.b === group.b) {
        const star = sky.hover;
        ctx.strokeStyle = "rgba(255, 244, 214, 0.85)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.arc(star.x, star.y, 7.5, 0, TAU);
        ctx.stroke();
      }

      // The name sits outside the constellation, like a label on a chart —
      // except on a narrow map, where the ring is close enough to the edge that
      // an outward label would be clipped. There it moves inside the ring, into
      // the empty band between the constellations and the centre.
      const narrow = w < 560;
      const labelGap = group.scale * 1.05 + 10;
      const dir = narrow ? -1 : 1;
      const lx = group.ox + Math.cos(group.angle) * labelGap * dir;
      const ly = group.oy + Math.sin(group.angle) * (labelGap - 2) * dir;
      const cos = Math.cos(group.angle) * dir;
      const align = Math.abs(cos) < 0.3 ? "center" : cos > 0 ? "left" : "right";
      const strength = 0.52 + (group.found / stars.length) * 0.48;

      // Labels scale with the map, so a phone gets the same chart at a size it
      // can still read instead of a shrunken desktop one.
      const labelSize = Math.max(7.5, Math.min(9.5, w * 0.011));
      ctx.save();
      ctx.textAlign = align;
      ctx.font = `800 ${labelSize}px Bahnschrift, "Trebuchet MS", sans-serif`;
      ctx.fillStyle = `rgba(${rgb}, ${strength})`;
      ctx.fillText(group.branch.short, lx, ly);
      ctx.font = `400 ${labelSize - 0.5}px "Cascadia Mono", monospace`;
      ctx.fillStyle = `rgba(${rgb}, ${strength * 0.75})`;
      ctx.fillText(`${group.found}/${stars.length}`, lx, ly + labelSize + 2.5);
      ctx.restore();
    }

    // A constellation that just closed sends one ring out from its centre.
    if (sky.burst) {
      const age = now - sky.burst.start;
      if (age > 1600) {
        sky.burst = null;
      } else {
        const group = sky.groups.find((entry) => entry.branch.id === sky.burst.branchId);
        if (group) {
          const k = age / 1600;
          ctx.save();
          ctx.strokeStyle = `rgba(${group.branch.rgb}, ${0.6 * (1 - k)})`;
          ctx.lineWidth = 2.4 * (1 - k) + 0.4;
          ctx.beginPath();
          ctx.arc(group.ox, group.oy, group.scale * 0.6 + k * 120, 0, TAU);
          ctx.stroke();
          ctx.restore();
        }
      }
    }

    drawSkyCenter(ctx, cx, cy, t, radius);
  }

  function drawSkyCenter(ctx, cx, cy, t, radius) {
    const found = countFoundItems();
    const ratio = found / TOTAL_ITEMS;
    const pulse = REDUCED_MOTION ? 0.86 : 0.78 + Math.sin(t * 1.3) * 0.1;
    const size = Math.max(9, Math.min(sky.w, sky.h) * 0.042);

    ctx.globalAlpha = (0.18 + ratio * 0.55) * pulse;
    const reach = size * 3.4;
    ctx.drawImage(skyGlowSprite("255, 208, 120"), cx - reach, cy - reach, reach * 2, reach * 2);
    ctx.globalAlpha = 1;

    ctx.save();
    ctx.translate(cx, cy);
    ctx.fillStyle = `rgba(255, 233, 184, ${0.28 + ratio * 0.68})`;
    ctx.beginPath();
    ctx.moveTo(0, -size);
    ctx.quadraticCurveTo(size * 0.14, -size * 0.14, size, 0);
    ctx.quadraticCurveTo(size * 0.14, size * 0.14, 0, size);
    ctx.quadraticCurveTo(-size * 0.14, size * 0.14, -size, 0);
    ctx.quadraticCurveTo(-size * 0.14, -size * 0.14, 0, -size);
    ctx.fill();
    ctx.restore();

    ctx.save();
    ctx.textAlign = "center";
    ctx.font = '400 9px "Cascadia Mono", monospace';
    ctx.fillStyle = `rgba(255, 226, 176, ${0.32 + ratio * 0.55})`;
    ctx.fillText(`${found} / ${TOTAL_ITEMS}`, cx, cy + size + 14);
    ctx.restore();
  }

  function updateSkyActive() {
    sky.active = Boolean(wheel.open && wheel.tab === "vault" && wheel.vaultView === "sky");
    if (sky.active) {
      fitSkyCanvas();
      setSkyCaption();
    }
  }

  function setVaultView(view, force) {
    if (wheel.busy && !force) return;
    const next = view === "sky" ? "sky" : "grid";
    if (wheel.vaultView === next && !force) return;

    wheel.vaultView = next;
    saveBoolean(STORAGE.vaultView, next === "sky");
    const isSky = next === "sky";

    if (el.vaultGrid) el.vaultGrid.hidden = isSky;
    if (el.vaultSky) el.vaultSky.hidden = !isSky;
    if (el.vaultFilters) el.vaultFilters.hidden = isSky;
    if (el.vaultShards) el.vaultShards.hidden = isSky;
    if (el.vaultHint) el.vaultHint.hidden = isSky;
    if (el.vaultEmpty) el.vaultEmpty.hidden = true;

    if (el.viewGrid) {
      el.viewGrid.classList.toggle("active", !isSky);
      el.viewGrid.setAttribute("aria-pressed", String(!isSky));
    }
    if (el.viewSky) {
      el.viewSky.classList.toggle("active", isSky);
      el.viewSky.setAttribute("aria-pressed", String(isSky));
    }

    if (isSky) {
      sky.hover = null;
      updateSkyActive();
    } else {
      sky.active = false;
      applyVaultFilter();
    }
    if (!force) dispatchSfx("vault-tab");
  }

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

      const showcaseBadge = document.createElement("span");
      showcaseBadge.className = "vc-showcase";
      showcaseBadge.hidden = true;

      bottom.append(branchLabel, showcaseBadge, count);
      card.append(top, name, bottom, mastery);
      el.vaultGrid.appendChild(card);
      vaultCards.set(item.id, card);
    }
  }

  function buildVaultFilters() {
    // First, because the question "which one did I pin again?" is worth one
    // click, not eighty cards of scrolling.
    const showcase = makeFilterButton("showcase", "\u2605 SHOWCASE", "255, 199, 95");
    showcase.classList.add("showcase-filter");
    showcase.title = "Only the three pieces on your passport";
    showcase.setAttribute("aria-pressed", "false");
    el.vaultFilters.appendChild(showcase);
    vaultFilters.set("showcase", showcase);

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

  // A second, independent filter: branch and rarity compose, so "mythics" or
  // "everything still missing in LUNAR" are one click each. This is the row
  // that answers "which ones am I missing" without scrolling eighty cards.
  function buildRarityFilters() {
    if (!el.vaultRarity) return;
    el.vaultRarity.textContent = "";
    rarityFilters.clear();

    const entries = [{ id: "all", label: "ALL TIERS", rgb: "170, 178, 205" }].concat(
      RARITIES.map((rarity) => ({ id: rarity.id, label: rarity.short, rgb: rarity.rgb }))
    );

    for (const entry of entries) {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "rarity-filter";
      button.dataset.rarity = entry.id;
      button.style.setProperty("--r-rgb", entry.rgb);
      button.textContent = entry.label;
      button.setAttribute("aria-pressed", "false");
      el.vaultRarity.appendChild(button);
      rarityFilters.set(entry.id, button);
    }
  }

  function setRarityFilter(rarityId) {
    if (wheel.busy) return;
    const next = rarityId === "all" || rarityId === wheel.rarityFilter ? null : rarityId;
    wheel.rarityFilter = next;
    applyVaultFilter();
    el.vaultGrid.scrollTop = 0;
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
      if (!card) continue;
      const index = wheel.showcase.indexOf(item.id);
      card.classList.toggle("showcased", index >= 0);
      // The slot number is the whole point: with eighty cards on the wall, a
      // gold border alone still leaves you hunting for which of your three
      // pieces this one is. "★ 2" answers it without opening the passport.
      const badge = card.querySelector(".vc-showcase");
      if (badge) {
        badge.hidden = index < 0;
        badge.textContent = index >= 0 ? `\u2605 ${index + 1}` : "";
      }
    }
    // Also refreshes the SHOWCASE pill's count and, when that filter is open,
    // drops a piece the moment it is un-pinned.
    applyVaultFilter();
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
      showToast("SHOWCASE FULL · CLICK \u2605 SHOWCASE TO SWAP", "");
      return;
    } else {
      wheel.showcase.push(itemId);
    }

    saveStringArray(STORAGE.showcase, wheel.showcase);
    updateShowcaseUi();
    showToast(
      `${index >= 0 ? "REMOVED" : "SHOWCASED"} \u00b7 ${item.name.toUpperCase()}`,
      index >= 0 ? "" : "gold"
    );
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
    // Each slot is a button: a filled one takes its piece off the passport,
    // an empty one walks you to the Vault. The showcase used to be writable
    // from exactly one place, which is a bad place to be stuck once you have
    // forgotten what you pinned.
    for (let i = 0; i < 3; i++) {
      const item = profile.showcaseItems[i];
      const slot = document.createElement("button");
      slot.type = "button";
      slot.className = "passport-showcase-slot";
      if (item) {
        const rarity = rarityById.get(item.rarityId);
        const branch = branchById.get(item.branchId);
        slot.style.setProperty("--r-rgb", rarity.rgb);
        slot.style.setProperty("--b-rgb", branch.rgb);
        slot.dataset.item = item.id;
        slot.setAttribute(
          "aria-label",
          `Remove ${item.name} from your showcase`
        );
        slot.title = "Remove from showcase";
        const symbol = document.createElement("span");
        symbol.className = "ps-symbol";
        symbol.textContent = branch.symbol;
        const copy = document.createElement("span");
        copy.className = "ps-copy";
        const name = document.createElement("strong");
        name.textContent = item.name;
        // Rarity and copies live in separate spans so a three-across phone
        // slot can drop the copy count instead of wrapping "LEGENDARY" in half.
        const meta = document.createElement("span");
        meta.className = "ps-meta";
        const rarityLabel = document.createElement("span");
        rarityLabel.textContent = rarity.name.toUpperCase();
        const copies = document.createElement("span");
        copies.className = "ps-copies";
        copies.textContent = `×${collection[item.id] || 0}`;
        meta.append(rarityLabel, copies);
        copy.append(name, meta);
        const remove = document.createElement("span");
        remove.className = "ps-remove";
        remove.setAttribute("aria-hidden", "true");
        remove.textContent = "✕";
        slot.append(symbol, copy, remove);
      } else {
        slot.classList.add("empty");
        slot.setAttribute("aria-label", "Choose a showcase piece in the Vault");
        slot.title = "Choose in Vault";
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

  // One download path for every card the game exports.
  function downloadCanvas(canvas, filename, message) {
    if (!canvas) {
      showToast("COULD NOT RENDER CARD", "");
      return;
    }

    const save = (url) => {
      const anchor = document.createElement("a");
      anchor.href = url;
      anchor.download = filename;
      document.body.appendChild(anchor);
      anchor.click();
      anchor.remove();
      showToast(message, "gold");
    };

    if (typeof canvas.toBlob === "function") {
      canvas.toBlob((blob) => {
        if (!blob) {
          save(canvas.toDataURL("image/png"));
          return;
        }
        const url = URL.createObjectURL(blob);
        save(url);
        window.setTimeout(() => URL.revokeObjectURL(url), 2000);
      }, "image/png");
    } else {
      save(canvas.toDataURL("image/png"));
    }
  }

  function downloadPassport() {
    downloadCanvas(drawPassportCanvas(), "nova-vault-passport.png", "PASSPORT PNG DOWNLOADED");
  }

  // ---- Run card ------------------------------------------------------------
  // A portrait card of one run: the score, what the cabinet paid out, and what
  // the wheel gave back. Every number is the run's own, so two friends holding
  // cards are comparing the same figures the board used.
  function drawRunCard(data) {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1350;
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;

    const W = canvas.width;
    const H = canvas.height;
    const gold = "#ffc75f";
    const loot = (data.loot || []).slice(0, 5);

    const bg = ctx.createLinearGradient(0, 0, W, H);
    bg.addColorStop(0, "#0a0e20");
    bg.addColorStop(0.55, "#050812");
    bg.addColorStop(1, "#090713");
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    const goldGlow = ctx.createRadialGradient(900, 140, 10, 900, 140, 560);
    goldGlow.addColorStop(0, "rgba(255, 192, 79, 0.18)");
    goldGlow.addColorStop(1, "rgba(255, 192, 79, 0)");
    ctx.fillStyle = goldGlow;
    ctx.fillRect(0, 0, W, H);

    const violetGlow = ctx.createRadialGradient(140, 1180, 10, 140, 1180, 480);
    violetGlow.addColorStop(0, "rgba(113, 76, 255, 0.16)");
    violetGlow.addColorStop(1, "rgba(113, 76, 255, 0)");
    ctx.fillStyle = violetGlow;
    ctx.fillRect(0, 0, W, H);

    // Star dust, seeded so the card is the same picture every time it renders.
    let seed = 0x2f9a1c7;
    for (let i = 0; i < 140; i++) {
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const x = (seed / 4294967296) * W;
      seed = (seed * 1664525 + 1013904223) >>> 0;
      const y = (seed / 4294967296) * H;
      ctx.fillStyle = `rgba(214, 226, 255, ${0.04 + (i % 6) * 0.018})`;
      ctx.fillRect(x, y, 2, 2);
    }

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
    ctx.fillText("RUN CARD", 82, 163);

    ctx.fillStyle = "rgba(255, 207, 119, 0.7)";
    ctx.font = '700 15px Bahnschrift, "Trebuchet MS", sans-serif';
    drawSpacedText(ctx, String(data.date || "").toUpperCase(), 86, 214, 3.6, true);

    ctx.textAlign = "right";
    ctx.fillStyle = gold;
    ctx.font = '700 26px Bahnschrift, "Trebuchet MS", sans-serif';
    ctx.fillText(`${data.found} / ${data.total} VAULT`, W - 86, 148);
    ctx.fillStyle = "#8d91ac";
    ctx.font = '700 15px Bahnschrift, "Trebuchet MS", sans-serif';
    ctx.fillText(`${data.pairs} / ${data.pairsTotal} PAIRS`, W - 86, 186);

    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.beginPath();
    ctx.moveTo(86, 250);
    ctx.lineTo(W - 86, 250);
    ctx.stroke();

    ctx.textAlign = "left";
    ctx.fillStyle = "#907d9a";
    ctx.font = '700 14px Bahnschrift, "Trebuchet MS", sans-serif';
    drawSpacedText(ctx, "FINAL SCORE", 86, 300, 3, true);

    ctx.fillStyle = gold;
    ctx.font = '400 112px "Cascadia Mono", "Lucida Console", monospace';
    ctx.fillText(Number(data.score || 0).toLocaleString("en-US"), 82, 396);

    ctx.textAlign = "right";
    ctx.fillStyle = "#807d9a";
    ctx.font = '700 13px Bahnschrift, "Trebuchet MS", sans-serif';
    ctx.fillText("PERSONAL BEST", W - 88, 356);
    ctx.fillStyle = "#d8d2e8";
    ctx.font = '400 40px "Cascadia Mono", "Lucida Console", monospace';
    ctx.fillText(Number(data.best || 0).toLocaleString("en-US"), W - 88, 398);

    const stats = [
      ["JACKPOTS", String(data.jackpots || 0)],
      ["NOVA TOKENS", String(data.tokens || 0)],
      ["BEST CHAIN", data.chain ? `×${data.chain}` : "×1"],
      ["VAULT PULLS", String((data.loot || []).length)]
    ];
    const statW = (W - 172 - 3 * 16) / 4;
    stats.forEach(([label, value], index) => {
      const x = 86 + index * (statW + 16);
      ctx.fillStyle = "rgba(5, 8, 18, 0.45)";
      ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
      ctx.lineWidth = 1;
      roundCanvasRect(ctx, x, 470, statW, 96, 12);
      ctx.fill();
      ctx.stroke();
      ctx.textAlign = "center";
      ctx.fillStyle = "#747b9a";
      ctx.font = '700 10px Bahnschrift, "Trebuchet MS", sans-serif';
      drawSpacedText(ctx, label, x + statW / 2, 500, 1.6);
      ctx.fillStyle = "#fff0d2";
      ctx.font = '400 40px "Cascadia Mono", "Lucida Console", monospace';
      ctx.fillText(value, x + statW / 2, 540);
    });

    ctx.textAlign = "left";
    ctx.fillStyle = "#907d9a";
    ctx.font = '700 14px Bahnschrift, "Trebuchet MS", sans-serif';
    drawSpacedText(ctx, "WHEEL GAVE BACK", 86, 640, 3, true);

    if (!loot.length) {
      ctx.fillStyle = "#6f7590";
      ctx.font = '700 16px Bahnschrift, "Trebuchet MS", sans-serif';
      drawSpacedText(ctx, "NO PULLS THIS RUN · THE BOARD PAID IN POINTS", 86, 712, 1.6, true);
    } else {
      loot.forEach((entry, index) => {
        const y = 676 + index * 66;
        const rarity = rarityById.get(entry.rarityId);
        const branch = branchById.get(entry.branchId);
        const rgb = rarity ? rarity.rgb : "146, 153, 183";

        ctx.fillStyle = "rgba(5, 8, 18, 0.5)";
        ctx.strokeStyle = `rgba(${rgb}, 0.28)`;
        ctx.lineWidth = 1;
        roundCanvasRect(ctx, 86, y, W - 172, 58, 10);
        ctx.fill();
        ctx.stroke();

        ctx.fillStyle = `rgb(${rgb})`;
        roundCanvasRect(ctx, 86, y, 5, 58, 2.5);
        ctx.fill();

        ctx.textAlign = "left";
        ctx.fillStyle = "#f4efdf";
        ctx.font = '700 22px Bahnschrift, "Trebuchet MS", sans-serif';
        ctx.fillText(entry.name, 112, y + 30);

        ctx.textAlign = "right";
        ctx.fillStyle = `rgba(${rgb}, 0.9)`;
        ctx.font = '700 13px Bahnschrift, "Trebuchet MS", sans-serif';
        ctx.fillText(
          `${rarity ? rarity.short : ""} · ${branch ? branch.short : ""}${entry.forged ? " · FORGED" : entry.isNew ? " · NEW" : ""}`,
          W - 108,
          y + 30
        );
      });
    }

    ctx.strokeStyle = "rgba(255, 255, 255, 0.08)";
    ctx.beginPath();
    ctx.moveTo(86, 1150);
    ctx.lineTo(W - 86, 1150);
    ctx.stroke();

    ctx.textAlign = "center";
    ctx.fillStyle = "#8d91ac";
    ctx.font = '700 13px Bahnschrift, "Trebuchet MS", sans-serif';
    drawSpacedText(ctx, "NOVA PACHINKO · EVERY JACKPOT MINTS A TOKEN · NO PURCHASE", W / 2, 1206, 2.2);

    ctx.fillStyle = "rgba(255, 199, 95, 0.7)";
    ctx.font = '400 22px Bahnschrift, "Trebuchet MS", sans-serif';
    ctx.fillText("✦", W / 2, 1256);

    return canvas;
  }

  function shareRun(data) {
    const summary = getVaultSummary();
    const payload = {
      date: new Date().toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric"
      }),
      found: summary.found,
      total: summary.total,
      pairs: summary.pairs,
      pairsTotal: summary.pairsTotal,
      ...(data || {})
    };
    downloadCanvas(
      drawRunCard(payload),
      `nova-run-${payload.score || 0}.png`,
      "RUN CARD DOWNLOADED"
    );
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
    // The wheel itself is the biggest, most obvious thing in the room, so it
    // behaves like the button. On a phone this is the difference between
    // spinning and scrolling to find out where the button went.
    if (el.wheelHit) {
      el.wheelHit.addEventListener("click", spinWheel);
    }
    el.skipSpin.addEventListener("click", skipSpin);
    el.spinFiveBtn.addEventListener("click", () => spinBatch(5));
    // Read the wallet at click time, not at bind time: the whole point of the
    // button is that it spends whatever is in there when you press it.
    el.spinAllBtn.addEventListener("click", () => spinBatch(tokens));
    el.sparkBtn.addEventListener("click", armSpark);

    if (el.viewGrid) el.viewGrid.addEventListener("click", () => setVaultView("grid"));
    if (el.viewSky) el.viewSky.addEventListener("click", () => setVaultView("sky"));

    if (el.skyCanvas) {
      el.skyCanvas.addEventListener("pointermove", (event) => {
        const star = skyPick(event);
        if (star !== sky.hover) {
          sky.hover = star;
          setSkyCaption();
        }
      });
      el.skyCanvas.addEventListener("pointerleave", () => {
        if (sky.hover) {
          sky.hover = null;
          setSkyCaption();
        }
      });
      // A tap on a phone has no hover, so a tap pins the caption.
      el.skyCanvas.addEventListener("pointerdown", (event) => {
        sky.hover = skyPick(event);
        setSkyCaption();
      });
    }

    if (window.ResizeObserver && el.vaultSky) {
      new ResizeObserver(() => {
        if (!sky.active) return;
        // Deferred by a frame: measuring inside the observer's own callback is
        // how a resize loop starts.
        requestAnimationFrame(() => {
          if (sky.active) fitSkyCanvas();
        });
      }).observe(el.vaultSky);
    }

    if (el.vaultRarity) {
      el.vaultRarity.addEventListener("click", (event) => {
        const button = event.target.closest(".rarity-filter");
        if (!button) return;
        setRarityFilter(button.dataset.rarity);
      });
    }

    el.vaultFilters.addEventListener("click", (event) => {
      const button = event.target.closest(".vault-filter");
      if (!button) return;
      setVaultFilter(button.dataset.branch);
    });

    el.vaultGrid.addEventListener("click", (event) => {
      const card = event.target.closest(".vault-card");
      if (!card) return;
      const item = itemById.get(card.dataset.id);
      // A forgeable card is a button: tapping it spends shards rather than
      // trying to showcase something that is not in the vault yet.
      if (item && canForge(item)) {
        forgeItem(item.id);
        return;
      }
      toggleShowcase(card.dataset.id);
    });

    el.vaultGrid.addEventListener("keydown", (event) => {
      if (event.key !== "Enter" && event.key !== " " && event.key !== "Spacebar") return;
      const card = event.target.closest(".vault-card[role='button']");
      if (!card) return;
      const item = itemById.get(card.dataset.id);
      if (!item || !canForge(item)) return;
      event.preventDefault();
      forgeItem(item.id);
    });

    el.relicGrid.addEventListener("click", (event) => {
      const card = event.target.closest(".relic-card");
      if (!card) return;
      toggleRelic(card.dataset.relic);
    });

    el.passportShowcase.addEventListener("click", (event) => {
      const slot = event.target.closest(".passport-showcase-slot");
      if (!slot) return;
      const itemId = slot.dataset.item;
      if (itemId) {
        // The rebuild below replaces the button we just clicked, so put focus
        // back on the same slot instead of dropping it on the body.
        const index = Array.prototype.indexOf.call(el.passportShowcase.children, slot);
        toggleShowcase(itemId);
        const next = el.passportShowcase.children[index];
        if (next) next.focus({ preventScroll: true });
        return;
      }
      // Empty slot: the label already says "choose in vault", so do that -
      // unfiltered, since the point is to pick something new.
      setTab("vault");
      setVaultFilter("all");
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
    updateSkyActive();

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

    // A batch waiting between spins must not fire into a closed vault.
    wheel.batch = null;
    wheel.open = false;
    el.wheelMode.classList.remove("open");
    el.wheelMode.setAttribute("aria-hidden", "true");
    if (el.main) el.main.inert = false;
    sky.active = false;

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
    updateSkyActive();

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
    el.spinFiveBtn.disabled = busy || tokens < 5;
    el.spinAllBtn.disabled = busy || tokens < 10;
    // The badge is the price, and the price is the whole wallet.
    el.spinAllCost.textContent = `✦ ${tokens}`;
    el.spinAllBtn.title =
      tokens >= 10
        ? `Spend all ${tokens} tokens on ${tokens} draws, one wheel spin`
        : `Needs ten tokens — now ${tokens}`;
    // Skip only exists while there is something to skip: a spin in flight, or
    // the rarity ladder flickering towards its result.
    el.skipSpin.hidden = !busy;
    el.skipSpin.textContent = wheel.spinning ? "SKIP SPIN ▶▶" : "REVEAL NOW ▶▶";
    el.wheelClose.disabled = busy;
    el.tabWheel.disabled = busy;
    el.tabVault.disabled = busy;
    el.tabRelics.disabled = busy;
    el.tabPassport.disabled = busy;

    if (busy) {
      el.spinBtnLabel.textContent = wheel.batch
        ? `${wheel.batch.draws.length} DRAWS…`
        : wheel.spinning
          ? "SPINNING…"
          : "READING FATE…";
    } else if (tokens > 0) {
      el.spinBtnLabel.textContent = wheel.lastResult ? "SPIN AGAIN" : "SPIN THE WHEEL";
    } else {
      el.spinBtnLabel.textContent = "NO TOKENS";
    }

    el.spinCost.textContent = tokens > 0 ? "✦ 1" : "JACKPOT ✦1";

    // Stays enabled when there is nothing to spend: tapping it is how you find
    // out you need a jackpot, and spinWheel() answers with the toast.
    if (el.wheelHit) {
      el.wheelHit.setAttribute(
        "aria-label",
        busy
          ? "Wheel is spinning"
          : tokens > 0
            ? `Spin the wheel \u2014 ${tokens} token${tokens === 1 ? "" : "s"} left`
            : "Spin the wheel \u2014 no tokens yet, land a pachinko jackpot"
      );
    }
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

      // A locked card the player can afford stops saying LOCKED and starts
      // offering the forge. The label lives in the slot the count already
      // owns, so nothing about the card's size or grid rhythm moves.
      const affordable = count === 0 && (wheel.shards[item.rarityId] || 0) >= FORGE_COST;
      if (countEl) {
        countEl.classList.toggle("can-forge", affordable);
        countEl.textContent = count > 0 ? `×${count}` : affordable ? "FORGE ◆" : "LOCKED";
      }
      card.classList.toggle("forgeable", affordable);
      if (affordable) {
        card.setAttribute("role", "button");
        card.setAttribute("tabindex", "0");
        card.setAttribute(
          "aria-label",
          `Forge ${item.name}, ${(rarityById.get(item.rarityId) || {}).name || ""}, for ${FORGE_COST} shards`
        );
      } else {
        card.removeAttribute("role");
        card.removeAttribute("tabindex");
        card.removeAttribute("aria-label");
      }

      const level = masteryLevel(count);
      const pips = card.querySelectorAll(".vc-mastery i");
      pips.forEach((pip, index) => pip.classList.toggle("on", index < level));

      card.title = count > 0
        ? `${item.name} — ${count} copies · Mastery ${level}`
        : `${item.name} — locked`;
    }

    updateShardStrip();
    if (el.vaultPairs) el.vaultPairs.textContent = String(countPairs());
    if (sky.ctx) layoutSky();

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
      pairs: countPairs(),
      pairsTotal: PAIRS.length,
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
    applyVaultFilter();
    el.vaultGrid.scrollTop = 0;
  }

  // Split out of setVaultFilter so the showcase state can re-run it without
  // yanking the grid back to the top while you are looking at it.
  function applyVaultFilter() {
    const filter = wheel.filter;

    for (const [id, button] of vaultFilters) {
      const active = id === filter;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
      if (id === "showcase") {
        button.textContent = `\u2605 SHOWCASE ${wheel.showcase.length}/3`;
      }
    }

    for (const [id, button] of rarityFilters) {
      const active = (wheel.rarityFilter || "all") === id;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", String(active));
    }

    let visible = 0;
    for (const item of CATALOG) {
      const card = vaultCards.get(item.id);
      if (!card) continue;
      let shown = filter === "showcase"
        ? wheel.showcase.includes(item.id)
        : (filter === "all" || item.branchId === filter);
      if (shown && wheel.rarityFilter && item.rarityId !== wheel.rarityFilter) shown = false;
      card.hidden = !shown;
      if (shown) visible += 1;
    }

    if (el.vaultEmpty) {
      el.vaultEmpty.hidden = visible > 0;
      el.vaultEmpty.textContent = filter === "showcase"
        ? "Nothing on your passport yet. Click a discovered item to pin it here, then it shows up for your friends."
        : wheel.rarityFilter
          ? `Nothing ${(rarityById.get(wheel.rarityFilter) || {}).name || ""} here yet.`
          : "Nothing discovered in this branch yet.";
    }
  }

  // Pays for one draw and rolls it. Tokens, the spin counter, pity and Spark
  // are all settled here, so a batch can buy several draws up front and know
  // which of them the wheel should point at before it starts moving.
  function drawPrize() {
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

    return { branch, rarity, item, targetIndex };
  }

  // Turns the disc toward a draw and hands the frame loop the job of landing it.
  // A single spin gets the full 4s of theatre; a batch gets one short spin that
  // aims at its best draw instead of replaying the ceremony per token.
  function startSpin(draw, duration) {
    wheel.pending = draw;
    wheel.targetIndex = draw.targetIndex;
    wheel.selectedIndex = -1;
    wheel.busy = true;
    wheel.spinning = true;
    wheel.spinStart = performance.now();
    wheel.spinDuration = duration;
    wheel.spinFrom = wheel.angle;
    wheel.lastTick = -1;
    wheel.lastTickAt = 0;
    wheel.tension = false;

    const segment = TAU / BRANCHES.length;
    const targetCenter = -(draw.targetIndex + 0.5) * segment;
    const jitter = (Math.random() - 0.5) * segment * 0.56;
    const finalAngle = targetCenter + jitter;
    let delta = normalizeAngle(finalAngle) - normalizeAngle(wheel.angle);
    if (delta < 0) delta += TAU;

    wheel.spinTo =
      wheel.angle +
      TAU * (6 + Math.floor(Math.random() * 3)) +
      delta;

    el.rewardCard.className = "reward-card rolling";
    el.rewardCard.style.setProperty("--branch-rgb", draw.branch.rgb);
    el.rewardCard.style.setProperty("--rarity-rgb", "146, 153, 183");
    el.rewardBranch.textContent = "NOVA WHEEL";
    el.rewardRarity.textContent = "SPINNING";
    el.rewardSymbol.textContent = "✦";
    el.rewardName.textContent = "READING THE FATES";
    el.rewardDesc.textContent = wheel.batch
      ? `${wheel.batch.draws.length} draws are in the air. The rarest one takes the card.`
      : "The wheel chooses the branch. The vault chooses the rarity.";
    // A batch has already been added to the collection by now, and showing the
    // new total on the badge before the reveal would give the result away.
    if (!wheel.batch) {
      el.rewardBadge.textContent = `${countFoundItems()} / ${TOTAL_ITEMS} COLLECTED`;
    }

    el.wheelStatus.textContent = wheel.batch
      ? `${wheel.batch.draws.length} draws riding on one spin.`
      : "The wheel is moving. Fate is listening.";
    highlightRarity(null);
    updateWalletUi();
    // Pity moved when the batch was bought; the meter catches up at the reveal.
    if (!wheel.batch) updatePityUi();
    dispatchSfx("wheel-start");
  }

  function spinWheel() {
    if (!wheel.open || wheel.busy) return;

    if (tokens < 1) {
      showToast("NO TOKENS · LAND A PACHINKO JACKPOT", "");
      return;
    }

    if (wheel.tab !== "wheel") setTab("wheel", true);

    startSpin(drawPrize(), REDUCED_MOTION ? 1250 : 4050 + Math.random() * 900);
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
    // The sky only exists inside the wheel, so it borrows this frame instead of
    // running a second animation loop of its own.
    if (sky.active) renderSky(now);
    requestAnimationFrame(wheelLoop);
  }

  // N tokens, N real draws, one wheel spin and one receipt. The batch buys
  // every draw up front (so pity, Spark and the wallet are settled before the
  // disc moves) and then spends a single short animation on the whole lot. It
  // skips waiting, never draws, and never information.
  function spinBatch(count) {
    if (!wheel.open || wheel.busy) return;
    if (tokens < count) {
      showToast(`NEED ${count} TOKENS · LAND A PACHINKO JACKPOT`, "");
      return;
    }
    if (wheel.tab !== "wheel") setTab("wheel", true);

    showBatchList(null);

    const draws = [];
    for (let i = 0; i < count; i += 1) draws.push(drawPrize());

    // The prizes are granted now rather than at the reveal: the tokens are
    // already spent, so a reload in the second the disc is moving must not
    // cost the player a batch they paid for. Nothing on screen reads the
    // collection until the receipt is drawn, so this stays invisible.
    const results = draws.map((draw) => applyDraw(draw));
    for (const result of results) {
      if (result.pairDone) {
        celebratePair(result.item.branchId, result.item.rarityId, 0, true);
      }
    }

    // The card shows the best of the batch, so the wheel lands on it too.
    let anchor = draws[0];
    for (const draw of draws) {
      if (draw.rarity.rank >= anchor.rarity.rank) anchor = draw;
    }

    wheel.batch = { draws, results };
    startSpin(anchor, REDUCED_MOTION ? 120 : 900);
  }

  // The receipt a batch leaves behind: everything it gave you, grouped per item.
  // Grouping is the point — "three Nova Bells" is what a player wants to know,
  // and the running collection count ticking ×4, ×5 down the list is noise.
  // Rarest first, matching the run card, and the list scrolls instead of
  // stopping short of what actually dropped.
  function showBatchList(results) {
    const list = el.batchList;
    if (!list) return;
    list.textContent = "";
    if (!results || !results.length) {
      list.hidden = true;
      return;
    }

    const groups = new Map();
    for (const result of results) {
      const seen = groups.get(result.item.id);
      if (seen) {
        seen.got += 1;
        seen.pairDone = seen.pairDone || result.pairDone;
      } else {
        groups.set(result.item.id, {
          branch: result.branch,
          rarity: result.rarity,
          item: result.item,
          isNew: result.isNew,
          pairDone: result.pairDone,
          got: 1
        });
      }
    }

    const rows = Array.from(groups.values()).sort(
      (a, b) => b.rarity.rank - a.rarity.rank
    );
    const newCount = results.filter((result) => result.isNew).length;
    const pairCount = results.filter((result) => result.pairDone).length;

    const head = document.createElement("p");
    head.className = "batch-head";
    head.setAttribute("role", "status");
    const bits = [`${results.length} DRAW${results.length === 1 ? "" : "S"}`];
    if (newCount) bits.push(`${newCount} NEW`);
    if (pairCount) bits.push(`${pairCount} PAIR${pairCount === 1 ? "" : "S"}`);
    head.textContent = bits.join(" · ");

    const body = document.createElement("div");
    body.className = "batch-rows";

    for (const group of rows) {
      const row = document.createElement("div");
      row.className = "batch-row";

      const rarity = document.createElement("span");
      rarity.className = "batch-rarity";
      rarity.style.color = `rgb(${group.rarity.rgb})`;
      rarity.textContent = group.rarity.short;

      const name = document.createElement("strong");
      name.textContent = group.item.name;

      const tag = document.createElement("em");
      const parts = [];
      // NEW and the quantity are alternatives for a single copy: "NEW ×1"
      // says nothing the word NEW did not already say.
      if (group.isNew) parts.push("NEW");
      if (group.got > 1) parts.push(`×${group.got}`);
      else if (!group.isNew) parts.push("×1");
      if (group.pairDone) parts.push("PAIR");
      tag.textContent = parts.join(" · ");
      tag.className = group.isNew ? "is-new" : "is-dup";
      if (group.pairDone) tag.classList.add("is-pair");

      row.append(rarity, name, tag);
      body.appendChild(row);
    }

    list.append(head, body);
    list.hidden = false;
    list.classList.remove("pop");
    void list.offsetWidth;
    list.classList.add("pop");
  }

  // One tap finishes the spin, a second tap skips the rarity flicker. Both
  // keep the real reward, the real odds and the real sounds: skipping only
  // removes waiting, never information.
  function skipSpin() {
    if (wheel.spinning) {
      wheel.spinning = false;
      wheel.angle = wheel.spinTo;
      finishSpin();
      return;
    }
    if (wheel.busy && wheel.pending) {
      if (wheel.revealTimer) {
        window.clearTimeout(wheel.revealTimer);
        wheel.revealTimer = 0;
      }
      revealReward();
    }
  }

  function finishSpin() {
    wheel.spinning = false;
    wheel.angle = normalizeAngle(wheel.spinTo);
    wheel.selectedIndex = wheel.targetIndex;
    wheel.flash = 0.75;
    wheel.flashRgb = wheel.pending.branch.rgb;

    el.wheelStatus.textContent = wheel.batch
      ? `${wheel.batch.draws.length} draws landed. Counting the take…`
      : `${wheel.pending.branch.name} branch locked. Reading the rarity…`;
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
    if (!REDUCED_MOTION && !wheel.batch) {
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

    wheel.revealTimer = window.setTimeout(() => {
      wheel.revealTimer = 0;
      if (wheel.pending) revealReward();
    }, REDUCED_MOTION ? 220 : wheel.batch ? 260 : 680);
  }

  // Everything a draw changes in the save — the collection, the Dust, the
  // shards, the showcase — and nothing that touches the screen. A watched spin
  // and a batch both come through here, so their payouts cannot drift apart.
  function applyDraw(pending) {
    const { branch, rarity, item } = pending;
    const branchFoundBefore = getBranchFound(item.branchId);
    const pairWasComplete = isPairComplete(item.branchId, item.rarityId);
    const existing = collection[item.id] || 0;
    const isNew = existing === 0;
    const count = existing + 1;
    const previousMastery = masteryLevel(existing);
    const mastery = masteryLevel(count);
    const dustGain = existing > 0 ? DUST_BY_RARITY[rarity.id] : 0;
    const shardGain = existing > 0 ? SHARDS_PER_DUPE[rarity.id] || 0 : 0;

    collection[item.id] = count;
    wheel.dust += dustGain;
    saveCollection(collection);
    saveNumber(STORAGE.dust, wheel.dust);

    if (shardGain > 0) {
      wheel.shards[rarity.id] = (wheel.shards[rarity.id] || 0) + shardGain;
      saveShards();
    }

    if (isNew && !wheel.showcaseCustom && wheel.showcase.length < 3) {
      wheel.showcase.push(item.id);
      saveStringArray(STORAGE.showcase, wheel.showcase);
    }

    return {
      branch,
      rarity,
      item,
      count,
      isNew,
      mastery,
      previousMastery,
      dustGain,
      shardGain,
      // Read now, not later: a batch has to know which pull closed the pair,
      // because by the time the receipt is drawn a dozen pulls may own both
      // halves of it and every one of them would look like the closer.
      pairDone: !pairWasComplete && isPairComplete(item.branchId, item.rarityId),
      branchDone: branchFoundBefore === 9
    };
  }

  // The card, the ladder and the counters: what a player reads after a pull.
  function presentResult(result, animate = true) {
    el.rewardRarity.style.color = "";
    wheel.flash = 1;
    wheel.flashRgb = result.rarity.rgb;

    renderResultCard(result, animate);
    highlightRarity(result.rarity);
    updateCollectionUi();
    updateWalletUi();
    updatePityUi();
  }

  // The run card and anything else listening for loot hears about every draw,
  // whether it arrived on its own or as one of a batch.
  function announceItem(result) {
    window.dispatchEvent(
      new CustomEvent("nova:item", {
        detail: {
          id: result.item.id,
          name: result.item.name,
          branchId: result.item.branchId,
          rarityId: result.item.rarityId,
          isNew: result.isNew,
          forged: false
        }
      })
    );
  }

  // One wheel animation, N draws. Every draw is applied for real — tokens,
  // pity, Dust, shards, pairs and relics all move — but the card only holds the
  // best pull and the receipt keeps the rest, so ten draws cost one spin's
  // worth of waiting instead of ten.
  function revealBatch() {
    const batch = wheel.batch;
    wheel.batch = null;
    wheel.pending = null;
    wheel.busy = false;

    const results = batch.results;

    let best = results[0];
    for (const result of results) {
      if (result.rarity.rank >= best.rarity.rank) best = result;
    }

    wheel.lastResult = best;
    presentResult(best, true);

    const found = countFoundItems();
    const newCount = results.filter((result) => result.isNew).length;
    const pairCount = results.filter((result) => result.pairDone).length;
    const relicCount = results.filter((result) => result.branchDone).length;

    el.wheelStatus.textContent =
      `${results.length} draws · ${newCount} new · ${pairCount} pair${
        pairCount === 1 ? "" : "s"
      } · best ${best.rarity.name} ${best.item.name}`;

    pulseHaptic(
      best.rarity.rank >= 4
        ? [0, 22, 26, 48, 34, 120]
        : best.rarity.rank >= 3
          ? [0, 26, 32, 58]
          : best.rarity.rank >= 2
            ? 26
            : 0
    );
    window.dispatchEvent(
      new CustomEvent("nova:collectionchange", { detail: getVaultSummary() })
    );

    // Pairs were paid when the batch was bought, quietly: ten pair toasts in a
    // row would leave the last one on screen and claim the other nine never
    // happened. The receipt tags them instead.
    for (const result of results) {
      if (result.branchDone) celebrateBranch(result.item.branchId);
      announceItem(result);
    }

    if (!relicCount) {
      if (best.rarity.rank >= 3) {
        showToast(
          `${best.rarity.name.toUpperCase()} · ${best.item.name}`,
          best.rarity.rank >= 4 ? "mythic" : "gold"
        );
      } else if (newCount > 0) {
        showToast(
          `${newCount} NEW DISCOVER${newCount === 1 ? "Y" : "IES"} · ${found} / ${TOTAL_ITEMS}`,
          "gold"
        );
      }
    }

    dispatchSfx("wheel-reveal", { rank: best.rarity.rank });
    if (best.rarity.rank >= 3) {
      if (!REDUCED_MOTION) spawnRevealBurst(best.rarity.rgb, best.rarity.rank);
      flashRarity(best.rarity);
    }

    showBatchList(results);
    // The receipt is the answer to "what did I get", and on a short window it
    // lands below the buttons, so nudge it into view rather than leaving the
    // player to discover a scrollbar.
    el.batchList.scrollIntoView({ block: "nearest" });

    window.setTimeout(() => {
      if (!wheel.open || wheel.busy || tokens === 0) return;
      // Leave the cursor on the batch button when there is another batch in the
      // wallet, so a stack of tokens is a few taps rather than a chore.
      const next = tokens >= 10 ? el.spinAllBtn : el.spinBtn;
      next.focus({ preventScroll: true });
    }, 100);
  }

  function revealReward() {
    const pending = wheel.pending;
    if (!pending) return;

    // A batch reveal starts from the same landing: the disc has stopped, and
    // the receipt takes over from the single card.
    if (wheel.batch) {
      revealBatch();
      return;
    }

    const result = applyDraw(pending);
    const {
      rarity,
      item,
      count,
      isNew,
      mastery,
      previousMastery,
      dustGain,
      shardGain,
      pairDone,
      branchDone
    } = result;

    window.clearInterval(wheel.rarityRollTimer);
    wheel.rarityRollTimer = 0;
    window.clearTimeout(wheel.revealTimer);
    wheel.revealTimer = 0;

    wheel.lastResult = result;
    wheel.pending = null;
    wheel.busy = false;

    presentResult(result, true);

    const found = countFoundItems();
    el.wheelStatus.textContent = isNew
      ? `New discovery: ${item.name}. Mastery I. ${found} of ${TOTAL_ITEMS} collected.`
      : `Duplicate secured: +${dustGain} Nova Dust, +${shardGain} ${rarity.name} shard${
          shardGain === 1 ? "" : "s"
        }.${mastery > previousMastery ? ` Mastery ${mastery} reached.` : ""} ${item.name} is now ×${count}.`;

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

    // A pull can finish a pair and a constellation at the same time. The relic
    // is the bigger news, so it takes the toast and the pair follows it a beat
    // later instead of being overwritten.
    if (pairDone) {
      celebratePair(item.branchId, item.rarityId, branchDone ? 1700 : 0);
    }

    if (branchDone) {
      celebrateBranch(item.branchId);
    } else if (rarity.rank >= 3) {
      showToast(
        `${rarity.name.toUpperCase()} · ${item.name}`,
        rarity.rank >= 4 ? "mythic" : "gold"
      );
    }

    announceItem(result);

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
    el.rewardBadge.textContent = result.forged
      ? `FORGED FROM SHARDS · ${found}/${TOTAL_ITEMS}`
      : isNew
        ? `NEW DISCOVERY · MASTERY I · ${found}/${TOTAL_ITEMS}`
        : `DUPLICATE +${dustGain} DUST · +${result.shardGain || 0} ◆ · M${mastery} · ×${count}`;

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

    // "banked" arrives when a pot is cashed out; it is worth naming, because
    // the player just chose to take the tokens instead of plunging for more.
    const sourceLabel =
      source === "jackpot" ? "JACKPOT" : source === "banked" ? "BANKED" : "TOKEN";
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
      const raw = window.localStorage.getItem(key);
      if (raw === null || raw === "") return fallback;
      const value = Number(raw);
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
