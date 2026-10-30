# Nova Pachinko & the Nova Vault

**Play it:** <https://appleknife.github.io/nova-pachinko/> — no install, no build step, works on desktop and phone. Add it to your home screen and it opens full-screen like an app.

![Nova Pachinko](preview.png)

![The Nova Prize Wheel](preview-wheel.png)

![A generated Nova Passport](preview-passport.png)

A neon arcade pachinko game with a full collection layer underneath: jackpots mint tokens, tokens spin a prize wheel, every wheel branch contains a mini-gacha of collectible placeholder rewards, and duplicates build mastery, Dust, relic sets, and a shareable collection passport.

Open [`index.html`](index.html) in a modern browser. No build step, server, or dependencies required.

## How to play

**Pachinko**

- **Aim** by moving the pointer over the board.
- **Drop** with a click/tap on the board, the **Drop Ball** button, or **Space**.
- **Sweep** (the **SWEEP** button, or **A**) toggles auto drop: every remaining ball drops in a rapid stream, then the next run keeps going on its own. While it is on, the chute sweeps steadily across the board so the burst spreads over every slot instead of stacking in one lane, and the pointer stops steering the aim until you switch auto off.
- **R** restarts a run. **M** toggles sound.
- **Volume.** The slider next to the mute button is a master volume from **0 to 150**; **100 is the mix as tuned**, and everything above it is headroom for listening closer, not a better setting. It scales the whole cabinet — board, wheel, room tone and music stings all run through the same master bus — so nothing gets left behind when you turn it up or down. It is remembered between visits, ticks softly while you drag so you can set it by ear without dropping a ball, and **M** still mutes instantly without losing the level.
- **Render resolution** cycles **auto → high → low** with the gauge button next to restart (or **Q** on a keyboard). It is remembered between visits. Auto is the right choice for almost everyone; use **low** if a device still stutters, **high** if your GPU has headroom and you want maximum sharpness.
- Every run starts with 12 balls by default. The board has a guarded center jackpot, two bonus-ball slots, and chain multipliers for pin hits. Relics can alter the starting count, chain cadence, lucky-ball cadence, score, bonus slots, and jackpot token payout.
- **The ball deck.** Four one-shot balls sit in the panel, and you pick one before a drop (click a chip, or **1-4** on a keyboard): **HEAVY** barely answers a pin and drives straight down, **BOUNCY** answers with interest and ricochets, **TINY** slips through the gaps, and **ENCORE** comes back for one more drop if it does not find the jackpot. A pick is spent on that drop whatever it hits, and the deck reverts to standard afterwards, so you choose each time rather than setting a mode. **Under SWEEP the pick sticks**: whatever you arm keeps dropping until its charges run out, then the rest of the sweep falls back to standard — so you can load the deck *before* starting a sweep and watch it spend them. The line under the deck always says what the next drop will be (`SWEEP · BOUNCY BALLS`, `HEAVY NEXT`, `CHARGE IN 3 DROPS`, `NO DROPS LEFT`). Every fifth drop (relics can change the cadence) hands over a **charge**: one random ball added back to the deck, instead of the old silent ×2 gold ball.

**The pot, and the overflow**

- Jackpot tokens do not go straight into your wallet any more. They mint into the **POT**, a gold strip that appears next to the token card, and they sit there until you bank them.
- **Bank whenever you like** — the **BANK** button on the strip, or **B**. Banking is instant, free, and possible at any moment, including one ball into a run. The pot is never a thing you can lose by looking away.
- When a run ends with anything in the pot, the cabinet offers **NOVA OVERFLOW**: **PLUNGE** drops one extra ball, aimed by the machine. If it lands in the jackpot, the whole pot **doubles** and you are offered another. Anything else pays the pot out untouched, which is the whole point: the only thing riding on a plunge is how much bigger the pot gets.
- **The plunge is the most dramatic thing in the game.** It gets a deeper cinema than the last ball — the scene starts higher up the board, the camera pushes further, and time stretches to about eight times slower at the rail instead of five. It has its own three-beat score: a **tension** cue (a long sub swell, two heartbeats underneath, a fifth climbing and holding unresolved) as the ball drops, a **victory** riser that runs straight into the double-pot chord if it hits, and a soft two-note **fall** if it misses — plus a calm `POT SAFE · N` over the slot, because a miss pays out too and the sound shouldn't pretend otherwise.
- Three plunges per run, so the ceiling is two doubles.
- **Sweep** takes the plunge on its own after a short pause, so an auto run never stalls on a decision.

**Board heat**

- The filament under the marquee is the board's temperature. Every pin hit nudges it, and a **gold bumper is worth about twenty ordinary pins**, so a run that keeps finding the lucky studs heats up while a slow one never gets there.
- At full, the board runs **HOT for nine seconds**: the filament floods gold, every stud picks up a warm halo, the glass is lit from the top of the cabinet, and every jackpot mints **one extra token**. Gold bumpers also kick a little harder for the duration, so the payout rail is one bounce closer.
- It decays on its own, which is what makes a full bar feel earned rather than scheduled. Hits made while hot do not bank progress toward the next one.

**The Nova Vault**

- A ball landing in the center **2500 JACKPOT** slot mints **1 Nova Token into the pot**. Bank it whenever you like, or finish the run and plunge for a chance to double it — nothing in the pot can be lost.
- New players receive one welcome token on their first visit.
- Open the gold **Nova Token** card in the side panel to enter the prize wheel.
- Spend **1 token** to spin. The wheel chooses 1 of 8 reward branches.
- The selected branch then rolls a rarity and one of its 10 placeholder rewards.
- **Vault** shows all 80 rewards across 8 branches and 5 rarities, with discovery state, duplicate counts, and five-step mastery bars.
- **Two ways to look at the same collection.** **GRID** is the shelf; **SKY** draws the vault as a star map — one constellation per branch, ten stars each, ordered from the tail (commons) to the head (mythics). Each branch is drawn as the thing it is named after — Lunar is a crescent, Neon a bolt, Echo three ripples, Sigil a warded diamond, Star a five-point star, Holo a cut crystal, Wild a pair of antlers, Boost a rocket — and the drawing is the same every run, so a constellation is something you learn to recognise rather than a random cluster. Discovered stars burn, missing ones are hollow sockets, and the lines between them only light when both ends are yours. A finished constellation gets a halo and its relic credit, and the nova at the centre brightens with the total. Hover a star for its name, or tap it on a phone to pin the caption. The choice is remembered between visits.
- **Two filters that compose.** The branch row says *where*, the rarity row says *how rare* — so `ALL + MYTHIC` is all sixteen mythics (and therefore exactly what is missing), and `LUNAR + MYTHIC` is the two in that branch. The active rarity chip fills with its own colour, and the filters stack with the shard counters sitting underneath.
- **Pairs.** Each branch holds exactly two items of each rarity, so the eighty items are really **forty pairs**. Completing one pays **3 shards of its rarity**, plays its own two-note chime, and ticks the `PAIRS` counter in the vault header. It is the shortest finish line in the game — you are usually one pull away from one.
- **Duplicates** grant Nova Dust, grant **shards** of that rarity, and raise that item's mastery, which increases Vault Power.
- **Shards** are the answer to the last hole in a set. Every duplicate pays shards of its own rarity — Common 1, Rare 2, Epic 3, Legendary 5, Mythic 8 — and **10 of any one rarity forges any locked item of that rarity**. Reach ten and every locked card of that rarity stops saying LOCKED and starts offering FORGE; tap the card and the item is yours, with its mastery, its set progress and its relic credit. Five counters sit under the Vault filters, and they pulse when one is ready.
- Saving a vault from before shards existed **credits every duplicate you ever pulled**, so an old save is not behind a new one.
- **Trading up.** Mythic shards can only come from mythic duplicates, which is a closed door for anyone who has not pulled a mythic yet — so the **LEGEND** counter trades up: **5 legendary shards → 1 mythic shard**, one click each time, with the default `⇡` on the counter when it is possible. One legendary duplicate is worth one mythic shard; the ladder stops there, and epics do not trade up.
- **Epic+ Spark** lets you spend 75 Dust to force the next rarity roll into the Epic+ pool.
- **Relics** unlock when a full 10-item branch set is complete. Equip up to three to modify your runs.
- **Passport** turns your collection into a downloadable share card, a copyable collection code, and a friend-comparison readout.
- **Run report** ends every run with a **SHARE RUN** button: a 1080×1350 portrait card of that run — score, personal best, jackpots, tokens, best chain, and the five best things the wheel gave back (rarest first, marked NEW or FORGED), plus your vault and pair progress. It downloads as a PNG, so it can go straight into a message.
- **Constellations close with a sound.** The tenth item in a branch already unlocked its relic; it now also fires a ring across the sky and plays a held fifth, so a finished figure feels like a finished figure.
- Spinning a lot of tokens? The **SKIP SPIN** pill turns each spin into two taps, and **SPIN ×5** spends five tokens on five draws, each with a shortened wheel and a receipt listing what landed.

## Gacha odds

Every rate below is shown in-game too, under **FULL ODDS** in the wheel: the same percentages, with a `%` sign, split into the plain **BASE** roll and the long-run **AVG** once pity is mixed in.

| Roll | Rate |
| --- | --- |
| Wheel branch | 8 branches, **12.5%** each |
| Rarity — Common | **58%** base · **56%** long run |
| Rarity — Rare | **25%** base · **24%** long run |
| Rarity — Epic | **11%** base · **14%** long run |
| Rarity — Legendary | **5%** base · **5%** long run |
| Rarity — Mythic | **1%** base · **1%** long run |
| Item inside the chosen branch + rarity | 2 items, **50% / 50%** |
| One specific Common item | 12.5% × 58% × 50% = **3.625%** |
| One specific Rare item | 12.5% × 25% × 50% = **1.5625%** |
| One specific Epic item | 12.5% × 11% × 50% = **0.6875%** |
| One specific Legendary item | 12.5% × 5% × 50% = **0.3125%** |
| One specific Mythic item | 12.5% × 1% × 50% = **0.0625%** |

**Pity:** if a streak reaches 9 spins without an Epic or better, the 10th spin's normal rarity roll is replaced with a guaranteed Epic+ roll. The guarantee pool is **Epic 82%, Legendary 15%, Mythic 3%**. After any Epic+ result, the streak resets. An armed **Epic+ Spark** uses the same guarantee pool.

**Where the long-run column comes from:** the pity streak reaches a steady state where pity rolls are **3.8%** of all spins, which pushes Epic+ from **17%** per spin to **20.1%** (one Epic+ every ~5 spins) and shaves the top off Common and Rare. Carrying the half-streaks around gives Common 55.8%, Rare 24.1%, Epic 13.7%, Legendary 5.4%, Mythic 1.1% — the `AVG` column rounds those. Chance of one *named* item, branch and coin flip included: **1 in 29** spins for a Common, **1 in 67** Rare, **1 in 117** Epic, **1 in 298** Legendary, **1 in 1,488** Mythic.

**Token drops are not a fixed RNG rate.** A token is earned whenever a ball lands in the center jackpot; that frequency emerges from the board geometry, aiming, and physics. The **Encore** relic can add +1 token to each jackpot.

## Collection depth

- **Mastery:** an item gains mastery at 1, 2, 3, 5, and 8 copies. Each level adds to Vault Power.
- **Dust:** duplicate rewards grant Dust based on rarity: 4 / 10 / 25 / 60 / 150 for Common through Mythic.
- **Showcase:** click discovered Vault cards to choose up to three favorites for the passport. A showcased card is marked where you can see it — gold edge, gold wash, and a `★ 1/2/3` chip telling you which passport slot it sits in — and the `★ SHOWCASE` filter at the head of the branch row shows just those three, so you never have to hunt an eighty-card wall for the thing you pinned last week. The passport's slots work in both directions: click a filled one to take that piece off, click an empty one to jump to the Vault.
- **Titles:** collection progress unlocks titles from Rookie Curator to Vault Sovereign.

## Relic loadout

Completing every item in a branch unlocks its set relic:

| Branch | Relic | Effect |
| --- | --- | --- |
| Lunar | Tidecaller | +1 starting ball each run |
| Neon | Overcharge | Chain tiers every 4 hits instead of 5 |
| Circuit | Goldwire | Gold pins add +3 chain hits |
| Star | Lucky Orbit | A deck charge every 4th drop |
| Holo | Prism Finish | +15% score from every slot |
| Boost | Overflow | Bonus slots add +1 extra ball |
| Wild | Double or Nothing | Bonus-slot points are doubled |
| Echo | Encore | Jackpots mint +1 extra Nova Token |

Equip up to three relics. Changes apply to the next run.

## Nova Passport

The passport tab includes:

- A generated PNG collection card suitable for sharing
- Favorite showcase items, rarest relic, Vault Power, best run, title, branch progress, and equipped relics
- A compact collection code that a friend can paste into their own cabinet to compare discovered counts, Vault Power, and unique relics

All sharing works locally; there is no account or server.

## On a phone

- The layout is sized for a thumb, and double-tapping no longer zooms the page (pinch-zoom is still there when you want it).
- The vault's small print is set from one type scale instead of per component: labels 9-9.5px, counters 10px, sentences 11.5px, card names 12-13.5px, all a step smaller below 860px. The dim greys moved up two notches (sentences sit at `#c9cfe4` rather than a 40% slate), the sentences carry a little more weight because Bahnschrift goes thin below 12px, and the tracked capitals keep their tracking, slightly tightened — tracking a 9px capital too far is what made it dissolve. Locked relic cards are no longer dimmed to half opacity: that is exactly the card you read to decide whether to chase a set, so the state line and the progress bar carry "locked" instead.
- The cabinet HUD gets the same treatment at both widths, and the phone layout no longer needs its own separate ramp: one section at the end of `wheel.css` and one at the end of `style.css` own the reading type, so a change lands everywhere at once.
- **Board type is drawn in board units, so it has to be scaled to be the same size on screen.** At 390px wide the cabinet bitmap is about 0.49 CSS px per board unit, which means an unscaled 12-unit label renders at 6 CSS px — that is why the marquee, `DROP ZONE` and the slot labels used to be legible on a monitor and mush on a phone. Every canvas label now multiplies by `boardTypeScale`, and the old `min(boardTypeScale, 1.45)` clamp is gone: capping the scale below the board's own scale made phone type *smaller* than desktop type, which is the opposite of the intent. Slot labels are then fitted to the slot width by `fitLabel`, so raising the size fills a wide slot instead of colliding with its neighbours.
- Slot ink is **tinted toward white instead of faded with alpha**. The old labels were the raw hue at 82% (numbers) and 52% (the `PTS` / `BALL` / `JACKPOT` line), which composites to about 2.7–5:1 against the glass — acceptable for a 20px number, unreadable for a 6px one. Numbers are now the hue lifted 16% toward white at full opacity, sub-labels 42%, which puts the smallest line past 7:1 without turning the slots white. Everything also sits on one vertical grid: value at `SLOT_TOP + 42`, sub-label at `+77`, clear of the rail above and the hairline below.
- Render resolution defaults to a capped 1.75× backing store on touch devices, with the **RES** button available if a device still stutters.
- **The wheel is the spin button, and on a phone it comes first.** The stage carries a transparent, focusable button labelled with the live token count, so tapping the wheel spins it — on any screen size. Below 860px the wheel tab is also reordered: intro, then `SPIN THE WHEEL`, then the reveal card, then `SPIN ×5`, and only then the ladder, odds, pity and spark blocks. The primary button used to sit at the bottom of that stack, behind roughly 400px of small print, which meant scrolling to play; on a 375×667 phone it is now fully inside the first screen.

## Other rules

- **Gold pins are bumpers.** They count as two bounce-chain hits, light up when struck, and any ball that touches one leaves at **launch speed** — around 820 to 1360 px/s, roughly three times a normal fall — instead of dribbling away at whatever speed it arrived with. The launch is aimed down-field, never back up the board, so a hit reads as the pin punching the ball towards the payout rail. A ball that lands on top of one is smacked down and out rather than straight back up, so nothing can hover on a bumper.
- The two guards directly above the jackpot are deliberately never lucky: they are the funnel, and a bumper there would fire balls away from the token slot.
- **The board reshapes every run.** The four large deflectors are always mirrored about the centre line — two lucky studs facing each other, plus the pair of guards above the jackpot — but which row the mirrored pair sits on, and how wide it is spread, is rolled per run. The four lucky pins each run are the mirrored pair plus two regular pins from the field. Large deflectors that did not roll lucky are cool satin studs, so a plain big pin still reads as part of the board.
- **Every fifth drop** adds a ball to the deck instead of being a special ball of its own. The lucky-ball mechanic and the deck are one system now: a charge is the reward for the interval, and the choice of what to drop with it is the deck's.
- **Bonus slots** add a ball back to the run.
- **Auto drop** is always available from the first run — it is a pace control, not a collection unlock.
- The 80 individual rewards are intentionally placeholder loot; their mastery and Dust feed the meta systems, while full branch sets unlock real relic effects.

## Feel & feedback

- Pin notes climb a pentatonic scale as a ball's chain grows, so long bounces turn into a little melody.
- Each ball sings in its own register (root, fifth, octave) and pans by its position on the board, so twelve balls in flight read as a chord spread across the stereo field instead of one unison pitch.
- Hit brightness follows impact: soft taps are dull and quiet, hard hits are bright and short. A shared master bus with glue compression and a short plate tail keeps a burst of pin hits from clipping or turning to hiss.
- There is **no screen shake**. At the new, larger type the offset read as a camera fault rather than impact, so the cabinet stays perfectly still and the punch comes from the flash, the sparks and the sound instead.
- A lucky pin firing a ball away plays a **recorded sample** (`audio/bump.js`): a supplied hit trimmed to 322 ms, faded out, peak-normalised to −6 dBFS, with a little pitch variation per hit so repeats don't machine-gun. The synthesised felt-mallet version stays as the fallback for the instant before the buffer decodes, or if the file is missing.
- New chain tiers get an on-board callout and a brighter HUD pulse.
- The payout popups are sized against the screen, not the board. On a phone the board is drawn at about half size, so a label that is right on a desktop board lands at half the height there — the type now scales with the playfield so "×2 CHAIN" reads the same on a 6-inch screen as on a 27-inch one. The chain and bonus lines also share one row ("×2 CHAIN · +1 BALL") instead of stacking two lines of small print under every payout, and the label is kept inside the glass so an edge slot cannot push it off the board.
- The board is lit like a parlor cabinet: every pocket glows in its own slot color, the center jackpot tower breathes gold, and a chase of 34 bulbs runs above the payout rail — slow at rest, brisk while balls are dropping, and sprinting when a jackpot is being decided.
- Each ball carries a halo that brightens with its speed, pin hits bloom where they land, and the inner glass walls catch the marquee light while a slow reflection drifts across the cover, so the playfield reads as a lit box instead of a flat plane.
- The wheel bezel's 32 bulbs are two comets that idle, race while the wheel spins, and bloom around the pointer when a result lands.
- The wheel table is lit by a warm lamp: light pools around the bezel, falls across the top of the disc, and catches a few slow motes of dust drifting through it.
- Opening the vault brings up its own room tone: a filtered low pad that breathes, plus an occasional soft chime from the shelves, so the wheel never sits in silence. There is deliberately **no noise layer** — the old whisper of air read as a buzz under everything and is gone. It is mixed low and ducks out of the way the moment a spin starts.
- Spinning starts with the lever catching, a short breath of felt, and a quick four-note rising run — a wheel being pushed by someone who is looking forward to it. Under it, each rim tick has a wooden body under the click, every sixth tick rings a soft bell that climbs as the wheel slows, and the wheel settles with a low thud and an airy tail. The reward card gets a paper hush as it is set down.
- **Skip.** While a spin is resolving, a floating **SKIP SPIN** pill appears. One tap jumps the wheel to its result, a second tap skips the rarity flicker and drops the card immediately. Skipping removes waiting, never information: the reward, the odds and the sounds are exactly the same.
- **Every rarity has its own voice, at both sizes.** The rarity ladder on the reward card flickers past at the real odds, and each stop plays that tier's own preview: a dull wooden tap for Common, a brighter pair for Rare, a shimmering triad for Epic, a bell for Legendary, and a glass ping for Mythic that only appears when a real 1% flash goes past. The landing then plays the same ladder at full size — a token set down for Common, a blooming chord for Epic, and the full choir production for Mythic.
- **The last ball of every run gets its own scene, once per run.** Once it is through the pin field, time stretches to under a fifth of normal speed, the camera pushes in through the glass towards the ball, a second vignette closes in, a **FINAL BALL** plate fades in, and the room drops to a low swell with two heartbeats. It latches for the run, so a bonus ball that extends the round cannot replay it — but the latch only stops a *second* scene from starting, it never cuts the current one short, which is what made the slowdown feel like a flicker. The scene holds from the moment the ball crosses into the last stretch until it lands.
- **The landing is tiered by slot.** Instead of the same small pocket chime, the last ball gets a deep settling thud plus a phrase scaled to what it hit: a two-note answer for the 100 slots, a four-note lift for the 500s, a bright five-note run for a bonus ball, and a full gold fanfare with sub and shimmer for the jackpot.
- Rare pulls escalate instead of just showing a different label. **Legendary** adds a sub thud under the chord, a run of sparkles, a breath of air, a gold flash across the screen, a single sweep of light over the reward card, and a haptic double-tap.
- **Mythic** gets its own production: a pink screen flash that pulses twice, two spark bursts plus a widening shockwave across the disc, a detuned choir holding under the arpeggio, a shimmer sweep, a cascade of high notes falling like sparks, an encore chord a beat later, a double sweep of light over the card, a pulsing card glow, a pink toast, and a longer haptic pattern. It is 1% for a reason, and the room is already quiet when it lands.
- In the last second of a spin the room tone ducks away and a held **G** blooms underneath — the dominant of the C-major reveal — so the landing chord and the rarity roll resolve out of a pocket of quiet instead of over a busy room. The lamp dims with it, so the landing flash has somewhere to bloom from.
- Switching vault tabs gives a soft two-note page-turn instead of a UI beep.
- Lighting eases down to half brightness when a run is over, so the cabinet still glows while the run report waits.
- A ball entering the real center-jackpot lane triggers a short slow-motion tension beat with a filtered noise riser underneath. There is no scripted or fake near-miss — it only happens when the physics takes the ball there.
- Jackpots launch a gold token across the screen into the Nova Token card, over a sub thump and a blooming chord.
- The wheel's rim ticks drop in pitch and gain weight as it slows, the way a real wheel does, then flicker through rarity colors before locking the result.
- The light chase slows or freezes under `prefers-reduced-motion`, and the glass reflection and drifting dust are skipped entirely.
- Muting suspends the audio graph, so reverb tails and ringing chords stop instantly instead of decaying.
- Motion-heavy extras respect `prefers-reduced-motion`.

## Run report

The run-complete card now shows:

- Jackpots hit
- Nova Tokens earned during the run
- Best chain multiplier
- Overall vault progress
- The nearest unfinished set and how many items it still needs
- A **Spend N Tokens** shortcut into the wheel when your wallet has tokens, or **View Vault** when it does not

## Persistence

The browser saves:

- best pachinko score
- sound preference
- master volume (0-150, default 100)
- Nova Token wallet
- pity counter
- spin count
- collection counts and mastery for all 80 rewards
- Nova Dust
- equipped relic loadout
- showcase picks
- armed Epic+ Spark state
- the one-time welcome token flag
- whether auto drop is on

No server or account is involved.

## Under the hood

Lucky pins add a launch impulse on top of the normal collision response, scaled by impact speed and skipped when a ball drops straight onto the top of the pin. Six-run headless samples (72 balls each) put the jackpot rate at 4-7 per sample with and without the kick, so the token economy is unchanged by it.

The pachinko simulation runs at a fixed 240 Hz step, independent of display refresh rate:

- circle-vs-circle collisions for pins and ball-to-ball contact
- capsule collisions for slot dividers and outer rails
- impulse responses with restitution, tangential friction, and tiny collision noise to avoid symmetric dead paths
- boundary constraints and an anti-stuck nudge
- guard pins above the center slot to keep the jackpot rare

Lighting is a single additive pass (`globalCompositeOperation = "lighter"`) over the board: pocket wells, the jackpot tower, the rail chase, ball halos, pin blooms, and the glass reflection all draw cached radial-gradient and band sprites instead of building gradients every frame, so roughly ninety light blits per frame stay cheap.

Performance is budgeted per device. The canvas backing store is capped (1.75× on touch devices, 2× on desktop) and an adaptive controller measures frame times: if frames run long it steps the render scale down, and once there is headroom it creeps back up. The **RES** button (or **Q**) overrides that guess (auto → high → low, remembered between sessions) for machines where the automatic choice is wrong. The cabinet, glass glare, trim, and the scanline texture are baked once and blitted, and every static gradient is cached, so a frame is just the playfield, the balls, and the additive light pass.

Whatever the render scale, the scene is drawn offscreen and blitted once into a canvas whose bitmap is exactly its CSS box at device resolution, so the compositor never resamples it. That last step is not cosmetic: a canvas smaller than its CSS box gets stretched by the compositor, and on iOS that can leave a bright one-pixel seam down the board, which is what **LOW** used to do on a phone. Scaling is now done once, uniformly, in code.

Just as important, nothing expensive is left in CSS on an animating layer: the cabinet shadow is a `box-shadow` rather than a `drop-shadow` filter, the background orbs are soft gradients rather than a blurred container, and the vault overlay is fully opaque instead of using `backdrop-filter`. Those three were the main cause of frame drops in Safari and on phones, because each one forces a full-screen blur or filter pass every frame. Per-ball and per-pin canvas shadows are gone too; the cached glow sprites do that work.

The wheel's room tone is a small set of long-lived oscillators (a detuned low pad through a low-pass, one slow LFO, and a filtered noise loop) started when the vault opens and faded out when it closes, so it costs nothing while the board is being played.

The prize wheel is drawn to a device-pixel-ratio-aware canvas, with a decelerating spin computed from the target wedge and eased over time. The vault and gacha data are plain JavaScript objects; all sound is synthesized with the Web Audio API.

The game pauses its physics while the wheel overlay is open, then resumes the exact board state when it closes.

## Files

- `index.html` — cabinet UI, prize wheel, and vault shell
- `style.css` — pachinko cabinet and HUD layout
- `game.js` — board physics, scoring, particles, audio, and rendering
- `wheel.css` — prize wheel, vault, relic, and passport presentation
- `wheel.js` — token wallet, Dust, mastery, relics, rarity rolls, pity, passport, and collection
- `preview.png` — pachinko gameplay preview
- `preview-wheel.png` — prize wheel preview
- `preview-passport.png` — exported collection passport example
- `audio/bump.js` — the gold bumper hit, trimmed and embedded as a data URI (works from `file://` in the desktop window, where fetching local files is blocked)
- `desktop/NovaPachinko.cmd` — opens the game in a dedicated app window (no browser chrome, no throttling; `smooth` argument renders at 1× pixel scale)
- `desktop/PackForSharing.cmd` — builds `NovaPachinko-Windows.zip` (about 225 KB) with just the files a friend needs, the launcher at the top level, and a `START HERE` page
- `desktop/README.md` — what the launcher changes, how to hand the desktop build to someone else, and an honest note on frame rate
