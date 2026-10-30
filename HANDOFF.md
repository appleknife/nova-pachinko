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

## What is implemented (do not rebuild)

- **Board**: physics pins, lucky bumpers that launch, chain multipliers, heat filament on the bezel (gold pins feed it, hot board pays +1 token), final-ball cinema.
- **Pot / Nova Overflow**: jackpots mint into a pot; BANK anytime (button or `B`); run end offers PLUNGE (one machine-aimed ball, pot doubles on jackpot, pays out safe on a miss, 3 per run) with a deeper cinema and a 3-beat score.
- **Ball deck**: heavy / bouncy / tiny / encore, one-shot per manual drop, sticks under SWEEP, `AUTO PICK` toggle lets a sweep spend the deck, charge every 5th drop (relic-modifiable). `1-4` arm.
- **Wheel**: 8 branches x 5 rarities x 2 items, pity on the 10th non-Epic+ spin, shards from duplicates, forge any locked item for 10 shards of its rarity, legendary trades up 5:1 into mythic shards, 40 pairs paying 3 shards each.
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
