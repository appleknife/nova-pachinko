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
5. Restart the desktop app: `powershell -NoProfile -ExecutionPolicy Bypass -File C:\Users\kopik\.lmstudio\scratchpads\dx\restart-nova.ps1` — it sometimes needs running twice before a new PID appears.

**Rollback**: tag `stable-2026-10-28` is a known-good build; every update since is one commit, so `git revert <sha>` undoes a single feature.

## Testing harnesses (scratchpad `C:\Users\kopik\.lmstudio\scratchpads\dx\`)

**The `dx` scratchpad is gone** (only a stray `dx$p` Chrome profile survives), so
`inject.ps1`, `inline2.ps1`, `stress2.ps1`, `listen.ps1` and `restart-nova.ps1`
all need rebuilding. A minimal replacement used for the batch work: copy the
five source files into a folder, append `seed.js` (clears localStorage, writes a
token count, installs an error collector) and `probe.js` (drives the DOM, beacons
results to `http://127.0.0.1:8099/`), with a PowerShell `HttpListener` in front
of it and `--headless=new` Chrome. Use `--virtual-time-budget` only for logic
that a click can force through `skipSpin()`; it freezes the real animation loop,
so motion tests need the beacon and real time.

- `inject.ps1` copies the game into a folder and injects a harness. **Its `-Extra` parameter works** (a PowerShell case-insensitivity bug used to swallow it — fixed).
- `inline2.ps1` inlines both scripts into one page so uncaught errors are reported with real line numbers instead of `Script error.`
- `stress2.ps1` + `listen.ps1`: the only way to test the **real** animation loop. The page beacons its results to `http://127.0.0.1:8099/`; run `listen.ps1` first, then launch Chrome **without** `--virtual-time-budget`.
- `reportprobe.ps1`, `deckprobe.ps1`, `autopick.ps1`, `tradeprobe.ps1`: expose `window.__nova` / `window.__wt` and drive specific features.

### Harness limits (learned the hard way)

- **`--virtual-time-budget` throttles `requestAnimationFrame` to ~3 frames.** A dead rAF loop and a paused one look identical. Never use it to test motion, physics, or "did it freeze".
- CSS transitions do not advance under virtual time either; the SHOWCASE pill looks gold-on-gold. That is an artifact, not a bug.
- Headless Chrome on this machine intermittently kills the renderer at phone widths (390 px) even on known-good builds. When that happens, verify layout with a static mock page or a screenshot at desktop size instead of assuming a code regression.

## Traps that have already bitten

- **Temporal dead zone**: `const` tables (`BALL_TYPES`, `deckChips`, `sky`) must be declared **before** the init sequence that uses them. This has broken the build three times.
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
- Nova Rank (opt-in prestige), parlor cosmetics (Dust sink), daily seeded board, achievements.
- Mythic floor: a guaranteed mythic after N spins without one (the trade-up already removes the hard lockout).
- Animals as constellations would need more stars per branch (14-18), i.e. a change to how many items a branch holds.
