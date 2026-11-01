# Nova Pachinko — working notes for a fresh session

Read this first. It is the distilled state of the project so a new conversation
does not need the old transcript. The README is the player-facing document; this
file is the maintainer's one.

## What it is

A single-page, no-build pachinko game with a token-gated gacha wheel and an
80-item collection. Plain HTML/CSS/JS, runs from `file://`, also served from
GitHub Pages. No backend, no dependencies, no bundler. Everything is saved in
`localStorage`.

Four canvases of work live in it: the board physics (`game.js`), the wheel /
vault / passport (`wheel.js`), and two stylesheets (`style.css` for the cabinet
and HUD, `wheel.css` for the vault UI).

## Where things are

| File | Owns |
| --- | --- |
| `game.js` | board physics, balls, slots, pot/overflow, heat, run lifecycle, audio engine, all in-game HUD text |
| `wheel.js` | token wallet, wheel spin, rarity rolls, pity, collection, vault, sky map, shards, relics, passport, run card export |
| `index.html` | both shells (game + wheel overlay), all overlay markup |
| `style.css` | cabinet, HUD, deck, overflow/report overlay |
| `wheel.css` | wheel, vault, sky, passport, shards |
| `desktop/` | launcher + `pack.ps1` that builds the shareable zip |
| `audio/bump.js` | recorded gold-bumper sample (base64) |
| `audio/heartbeat.js` | recorded lub-dub for the slow-motion bed (base64, one 0.64 s cycle) |

## What is implemented (do not rebuild)

- **Board**: physics pins, lucky bumpers that launch, chain multipliers, heat filament on the bezel (gold pins feed it, hot board pays +1 token), final-ball cinema.
- **Pot / Nova Overflow**: jackpots mint into a pot; BANK anytime (button or `B`); run end offers PLUNGE (one machine-aimed ball, pot doubles on jackpot, pays out safe on a miss, 3 per run) with a deeper cinema and a 3-beat score.
- **Ball deck**: heavy / bouncy / tiny / encore, one-shot per manual drop, sticks under SWEEP, `AUTO PICK` toggle lets a sweep spend the deck, charge every 5th drop (relic-modifiable). `1-4` arm.
- **Wheel**: 8 branches x 5 rarities x 2 items, pity on the 10th non-Epic+ spin, shards from duplicates, forge any locked item for 10 shards of its rarity, legendary trades up 5:1 into mythic shards, 40 pairs paying 3 shards each.
- **Batch spins**: `SPIN ×5` and `SPIN ALL` (the latter disabled below ten tokens; its badge is the live wallet, so the button always states its price). A batch buys every draw up front, spends one ~900 ms wheel animation on the whole lot, lands on the rarest pull of the batch, and leaves a receipt tagging `NEW` / `×count` / `PAIR`. The receipt groups by item (so the tag is the batch quantity, not the collection count that used to tick `×4`, `×5` down the list), sorts rarest first, and scrolls inside a 216 px frame so every draw is listed. The count line sits in its own `.batch-head` above the scroll area, so the totals stay put while the rows move. The pipeline is split so the two paths cannot diverge: `drawPrize()` pays and rolls, `applyDraw()` mutates the save and returns the result, `presentResult()` owns the card and counters. `spinBatch()` applies its draws at purchase time (a reload mid-animation must not eat paid tokens) and `revealBatch()` only presents.
- **Wheel tap**: `#wheelHit` is both the spin button and the skip button — `wheel.busy ? skipSpin() : spinWheel()`. The SKIP pill still exists; this is the natural surface while you are watching the disc.
- **Skillshot**: `predictLanding(ball)` runs a throwaway copy through `integrateMotion` — the same motion and collision code the real ball uses — for up to four seconds of flight, and returns the slot it would reach. `nudgeBoard` calls it **before and after** the impulse and sets `ball.skillshotAt` only when the knock flipped a non-jackpot prediction into the jackpot; anything else clears the claim. `captureBall` calls `showSkillshot()` from the jackpot branch if that ball still carries the flag. The ghost sets `ball.ghost`, which makes `resolvePin` skip its pin flash, bumper sound and sparks, and makes `registerPinHit` return immediately — without that, a prediction would play the game (it threw on `hitPegs` the first time). It also zeroes the pin jitter so the prediction is stable rather than noise. Measured 0.33 ms a sim, 1.4 ms worst. The headline is sized by `fitSkillshot()`: measure the word at 100 px, scale it to 94% of the cabinet, correct once, and do it again when the element is shown (a font swap after first layout otherwise leaves a stale size).
- **Phone layout**: `.game-shell` is a two-row grid (`auto minmax(0,1fr)`) at `100dvh` below 861px, and `.stage` is **height-driven inside that row** — `height: min(100%, calc(100vw * 1.3947368))` with `aspect-ratio` supplying the width. That is what keeps the slot row on screen; the old rule sized the board from a hardcoded 330px HUD and overflowed once the HUD passed it.
- **Relic detail**: a locked relic card used to be `disabled`, which made the one thing a player wants to know unclickable. It is now enabled with `.locked` styling and opens `#relicDetail`: all ten branch items, `✓` for owned, and either a `FORGE · 10 ◆` button or an `n/10 ◆` shard count for the missing ones. `forgeItem()` does the rest (shards, pair bonus, relic unlock); the panel re-renders after and closes itself when the set completes.
- **Parlor cosmetics**: four skins for the room and the cabinet, bought with Dust — the second sink for it. `PARLOR` in `wheel.js` is the table (`nova` free, `dusk` 60 ◆, `mint` 120 ◆, `ember` 200 ◆); each entry carries `room` / `base` / `orbs` / `frame` / `marquee` palettes plus a three-colour `swatch` for its card. Ownership is `nova-pachinko-parlor-v1`, the active id `nova-pachinko-theme-v1` — both come along in the save file for free, because it exports every `nova-pachinko-*` key. `applyParlor(id)` dispatches `nova:theme` with the resolved palette and `game.js` answers with `applyParlorPalette()` (the board owns the room and the cabinet): it writes `--room-a/b/c`, `--room-top/mid/low` and `--orb-a/b/c` on `:root`, keeps `parlorPalette` for the canvas, and sets `layerScale = 0` — **the cabinet is baked into an offscreen layer, so a palette change that does not force that layer to rebuild leaves the frame in its old colours**. `drawCabinetBase()` reads `parlorPalette.frame` / `.marquee`, falling back to the shipped colours when none is set. The UI is the 2×2 card grid in the passport side column (`buildParlor` / `updateParlorUi` / `chooseParlor`); a card reads `ACTIVE` / `OWNED` / `N ◆`, and an owned one swaps back for free. The palettes deliberately exclude rarity and slot colours — a cosmetic that changes what a pull looks like is a readability bug, not a feature. **The init (`buildParlor()` + `applyParlor(activeParlor, false)`) is the last thing in `wheel.js`**, because the table and its saved state are declared below the main init block and calling it from there hits their TDZ. Reload persistence was verified end to end: with `theme=mint` seeded, a fresh load lands on `--room-a: rgba(60, 210, 190, 0.18)`, a `COLD STORAGE` ACTIVE card, and no console errors.
- **Run contracts**: `contractOffers()` builds four goals from live state (jackpots, chain, a score target at 75% of your best floored to 25k, and one skillshot) and `refreshContract()` picks one by `state.contractRoll % 4`. The ↻ cycles only while `!state.started`. `checkContract()` runs from `updateHud` (met guard, so the toast and sting fire once) and `bankPot()` doubles the payout when `state.contract.met` — the doubling is on the whole pot, not the minted base, because that is the promise the strip makes. Nothing is charged for skipping it.
- **Save file**: `collectSave()` exports every `localStorage` key under the `nova-pachinko-` prefix (so a setting added later is saved without touching the code) plus `app`/`version`/`savedAt`/`found`/`tokens` for the confirmation. `loadSaveFile()` refuses anything whose `app` is not `nova-pachinko-save`, clears the old nova keys first (a key that only existed in the old save must not survive), then writes only prefixed keys — a file cannot inject arbitrary storage into the origin — and reloads so both modules re-init. UI lives in the passport side column.
- **Theme music**: `audio/theme.mp3`, 37.92 s @ 128 kbps (608 KB). Cut from the supplied Suno track at 9.576 s → 47.496 s: 76 BPM, bar 3.16 s, and that 12-bar window had the best phrase recurrence of any candidate (normalised envelope correlation 0.81 between the material at the start and at the cut). The wrap is clean — last sample ≈ first sample (jump 0.0002) after a 6 ms tail taper, plus a 40 Hz high-pass so small speakers do not rattle. It is a real `<audio loop>` element rather than base64: a minute of music is ~1 MB of base64 parsed at startup, which only works for the tiny bumper/heartbeat samples. Volume is `music × duck` — the music slider is **independent** of the SFX slider (they used to multiply, so pulling the effects down dragged the music down too) — ramped in `updateTheme(dt)` because a media element cannot ramp itself; `startCinemaBed` ducks to 0.3 and `stopCinemaBed` restores 1. Playback starts on the first pointerdown/keydown because autoplay needs a gesture.
- **Rail nudge**: below 861px `.nudge-row` is hidden and `#railNudgeLeft` / `#railNudgeRight` sit on the cabinet's rails (`top: 34%`, `height: 30%`, `width: 13%`) — the same band the canvas already treats as a nudge, so no aim tap is lost, and the HUD row it frees is what the board grows into.
- **Full screen play**: `setPlayMode(on)` toggles `body.play` and shows `#playBar` (DROP / SWEEP / NUDGE / ✕). It is phone-only (`window.innerWidth > 860` returns early, and the FULL button is `display: none` above that) because on a wide screen the HUD is a sidebar and a bottom bar would only shrink the board. The stage is sized **height-first** — `height: min(100dvh - 96px, 100vw * 1.3947368)` with `aspect-ratio` doing the width — because the cabinet is taller than a phone is wide, and a width-driven box collapses on a short viewport. The canvas needs a re-fit after the layout change, hence the double `requestAnimationFrame(fitBacking)`.
- **Auto sweep range**: `updateAutoAim` is a triangle wave bounded by the centres of `slots[1]` and `slots[slots.length - 2]` — the two `+1 BALL` lanes — instead of a fraction of the half-width. The old `* 0.86` reached x=117 and x=643, both of which sit over a 100-point lane, so a swept ball dropped against the rail and fell straight into the worst slot.
- **Nudge**: the rails are the machine and the glass is the game — a tap outside `PLAY.left/right ± (BALL_R + 10)` calls `nudgeBoard(dir)` instead of aiming, because those taps were clamped to the same wall spot anyway. Also the NUDGE pair under the drop controls and `←`/`→`. Free and unlimited: a 220 ms cooldown plus a per-ball lateral cap (`NUDGE_LATERAL_MAX`) are what stop it becoming a joystick. Impulse is weighted per ball type, and the feedback is a damped two-axis shake (`state.shake` / `state.shakeDir` / `state.shakeT`) written to the canvas element's `style.transform`, ~200 ms and stacking while you mash. `state.nudges` counts knocks for later stats. All the knobs sit in one block at the top of `game.js`: `NUDGE_SHAKE_PX`, `SHAKE_FREQ`, `SHAKE_DECAY`.
- **Cinema audio**: `startCinemaBed(plunge)` fires from `updateCinema` at the same 0.32 threshold as the old cue. The final ball gets the recorded heartbeat **alone** — no drone, no glide, no `sfxFinalBall()` (deleted) — because the 65–98 Hz swell it used to open with was either inaudible or a rattle depending on the speaker. The plunge keeps the drone and glide. It does **not** own a pad of its own — it calls the engine's existing `startWheelTension({ attack: 0.12, level: 0.022 })` drone (held G, midrange, ducks the room, has its own safety timer; the wheel keeps the 1.2 s attack default), then adds only what the wheel does not need: two detuned sines gliding 392→587 Hz and a heartbeat whose interval multiplies by 1.26 per beat. The heartbeat is the supplied recording, trimmed to one 0.64 s lub-dub and embedded as `audio/heartbeat.js`; `playCinemaBeat()` falls back to a pair of sines if the buffer has not decoded or the file is missing. The beat interval starts at 0.62 s (the sample is 0.64 s, so anything much shorter stacks the pairs), and the first beat fires at 0.02 s — a scene can be over inside a second, and a heartbeat that arrives after the landing is not a heartbeat. Keep it tonal: the first pass used a band-passed noise riser plus triangle knocks and it read as a buzz. `stopCinemaBed()` runs from `captureBall()` *before* `sfxFinalLanding`, so the landing chord lands in silence; it only calls `endWheelTension()` if it was the one that started the drone.
- **Vault**: grid + sky (eight hand-drawn constellations), branch filter + rarity filter (composing), shard strip, showcase pinning.
- **Sharing**: passport PNG (collection), run card PNG from the report (`SHARE RUN`).
- **Meta**: relics (one per completed branch), mastery, Dust, Epic+ Spark, volume slider, quality cycling, SWEEP, desktop app.

## Shipping a change

1. `git add -A && git -c user.name="Nova" -c user.email="nova@local" commit -m "..."`
2. Push (the remote needs a credential — ask the user for it, or use their cached
git credential helper). Never write a token into a tracked file: GitHub's push
protection rejects the push, which is exactly what happened the first time this
note was written.
3. Wait ~50 s, then verify Pages by comparing `git show HEAD:$f | tr -d '\r' | md5sum` with `curl -s https://appleknife.github.io/nova-pachinko/$f | tr -d '\r' | md5sum`.
4. `cd desktop && powershell -NoProfile -ExecutionPolicy Bypass -File pack.ps1`
5. Restart the desktop app: `cd desktop && powershell -NoProfile -ExecutionPolicy Bypass -File restart.ps1` — it stops the `--app=*nova-pachinko*` chrome process, relaunches `NovaPachinko.cmd` hidden, and prints the old and new PID so you can see it worked. (This replaced the lost `restart-nova.ps1`.)

**Rollback**: tag `stable-2026-10-28` is a known-good build; every update since is one commit, so `git revert <sha>` undoes a single feature.

## Testing harnesses (scratchpad `C:\Users\kopik\.lmstudio\scratchpads\vo\probe\`)

**The `dx` scratchpad is gone** with everything that lived in it. The current
harness is `scratchpads\vo\probe`: copies of the five source files plus
`seed.js` (clears localStorage, writes the state a test needs, installs an error
collector) and `probe.js` (drives the DOM, beacons JSON to
`http://127.0.0.1:8099/`), with a PowerShell `HttpListener` in front of it and
`--headless=new` Chrome. `run.ps1` is desktop, `run-phone.ps1` is 390×844,
`run-wide.ps1` is 1600×1000. **Order matters: `seed.js` must be injected before
`game.js`/`wheel.js`**, or it writes the state the modules have already read.
Use `--virtual-time-budget` only for logic that a click can force through
`skipSpin()`; it freezes the real animation loop, so motion tests need the
beacon and real time. Per-feature probes get their own folder under
`scratchpads\vo\` (e.g. `vo\parlor2` for the reload-persistence check).

- If `run.ps1` finishes with no `result.txt` at all, it threw before the beacon wait — run the equivalent script with `Write-Host` lines before assuming the page is broken. (The first `vo\parlor2` run did exactly that and passed on a plain re-run.)
- Expose `window.__nova` (game) / `window.__wt` (wheel) from the probe when a check needs internals rather than DOM text.

### Harness limits (learned the hard way)

- **`--virtual-time-budget` throttles `requestAnimationFrame` to ~3 frames.** A dead rAF loop and a paused one look identical. Never use it to test motion, physics, or "did it freeze".
- CSS transitions do not advance under virtual time either; the SHOWCASE pill looks gold-on-gold. That is an artifact, not a bug.
- Headless Chrome on this machine intermittently kills the renderer at phone widths (390 px) even on known-good builds. When that happens, verify layout with a static mock page or a screenshot at desktop size instead of assuming a code regression.

## Traps that have already bitten

- **Temporal dead zone**: `const` tables (`BALL_TYPES`, `deckChips`, `sky`) must be declared **before** the init sequence that uses them. This has broken the build three times.
- **`ResizeObserver` callbacks must defer their work a frame.** `observe(canvas) → fitPresent()` resized the canvas inside the callback, which re-triggered the observer and threw "ResizeObserver loop completed with undelivered notifications". Every observer in this codebase now does its work in a `requestAnimationFrame`.
- **A later plain rule beats an earlier media query.** `@media (min-width: 861px) { .play-btn { display: none } }` lost to a plain `.play-btn { display: flex }` further down the same file — same specificity, later wins — leaving a FULL button on desktop that did nothing, because `setPlayMode` refuses above 860px. Visibility lives on the base rule now, with a `max-width` query opting in.
- **Canvas paint order is the text order.** The nameplate's tagline was drawn and then the plate's fill was painted over it, so it never appeared. Anything near `y` 1028–1048 has to be drawn after `roundPath(248, 1028, ...)`.
- **Measure text with `offsetWidth`, never `getBoundingClientRect()`.** The rect includes transforms, so a headline inside the `scale(0.82)` skillshot container measured 22% narrow and got sized to 115% of the cabinet — it looked fine in code and ran off the glass on screen. `offsetWidth` is layout only.
- **Move the cabinet with a translate, never a rotation or a scale.** A rotated element reports the bounding box of the rotated shape, so every `getBoundingClientRect()` measurement of it is wrong — `boardPoint()` drifts and `fitPresent()` sizes the backing store off the inflated box. A translate moves the rect with the element and keeps both correct, which is why the nudge shake is `translate(x, y)` and the first version's tilt had to undo the angle by hand.
- **The phone wheel layout is ordered by CSS `order:`, not by DOM order.** Wrapping `#spinFiveBtn` in a `.batch-buttons` div put the row above the intro and reversed the two buttons, because the wrapper had no `order` and the children kept theirs. Any new wrapper needs its own order value plus `order: 0` on the children that already had one.
- **`TAU` only exists in `wheel.js`.** In `game.js` use `Math.PI * 2`.
- **A canvas is a replaced element**: `left/right/bottom` will not stretch it. Set explicit `width`/`height`.
- **Never resize a canvas inside its own ResizeObserver callback** — defer a frame.
- **One exception used to kill the whole game**: the rAF loop is now re-armed at the top of `frame()` inside a `try/catch`. If the board goes blank but the HUD still works, assume a throw in `render`, and check `frame` errors.
- Removing a variable that a later conditional reads is silent until that branch runs (the `resolving` freeze). Grep for every removed identifier before shipping.

## Open ideas (not built)

- Ball deck: queue one ball per sweep slot (first drop bouncy, second heavy).
- Nova Rank (opt-in prestige), daily seeded board, achievements.
- Mythic floor: a guaranteed mythic after N spins without one (the trade-up already removes the hard lockout).
- Animals as constellations would need more stars per branch (14-18), i.e. a change to how many items a branch holds.
