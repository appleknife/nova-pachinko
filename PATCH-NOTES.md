# Nova Pachinko — patch notes

**2026-10-30**

Two releases today. The batch-spin work went live earlier; everything under
"Nudging, skillshots and the slow-motion score" is the new build.

---

## Nudging, skillshots and the slow-motion score

### New: nudge the cabinet

You can now hit the machine.

- **Click or tap either rail**, use the **NUDGE ◀ / ▶** buttons under the drop
  controls, or press **← / →**.
- Everything in the air takes a **lateral knock** at once. The cabinet answers
  with a short, sharp **shake** — about a fifth of a second — that gets deeper
  the faster you mash it.
- **It is free and unlimited.** No meter, no cooldown you can feel, no resource.
  Two things keep it a knock rather than a steering wheel: one impulse per thump
  (220 ms apart), and a cap on how far sideways a ball can be shoved (820 u/s,
  half of the board's speed limit). A ball already moving faster than that is
  left alone, so a bumper launch can't be cancelled by a mistimed knock.
- **Weight matters.** A heavy ball takes 55% of the knock, a tiny one 85%,
  standard 100%, a bouncy one 115%. The deck you picked changes how the machine
  answers you.
- The **glass still aims and drops** — only the rails nudge. Taps out there
  already clamped to the same wall spot, so nothing was taken away.
- Works **mid-sweep, on the last ball, and during a plunge**, because the machine
  is yours to argue with.

### New: SKILLSHOT

When a knock is what puts a ball in the jackpot, the cabinet says so — a huge
gold **SKILLSHOT** across the glass, a bright sparkle over the jackpot chord, and
a haptic.

It is not a participation trophy. The ball's own path is re-simulated through the
real motion code **before and after** the knock, and credit only lands when the
bump flipped the prediction from somewhere else into the 2500. If the ball was
already heading for the jackpot, no credit.

In testing, about **1 in 20 nudged balls** earned one.

Plunge balls count too — a nudged plunge into the jackpot is a SKILLSHOT *and* a
doubled pot.

### New: the slow-motion scenes have a score

- **The final ball** is now scored by a recorded **lub-dub heartbeat** on its
  own, with the interval stretching as the picture slows.
- **The plunge** puts the same heartbeat under a held G drone and a fifth that
  glides upward as the ball nears the rail.
- The heartbeat is your supplied recording, trimmed to one clean cycle and
  embedded in `audio/heartbeat.js`, so it loads from `file://` like the bumper
  sample. A synthesised thump covers the moment before the buffer decodes.
- The bed is **cut the instant the ball lands**, which leaves the landing chord
  alone in the room.
- **Nothing sits below 100 Hz any more.** The old low swells were inaudible on a
  laptop and read as a rattle on the speakers that could reproduce them. That was
  the buzz.

### Fixed: automatic drops into the 100-point lane

The sweep used to reach 86% of the half-width, which parked the chute directly
over a 100-point lane at each end of the swing. A ball dropped there hugs the rail
and falls straight in — an automatic ball landing in the worst slot read worse
than no ball at all.

The sweep now runs between the two `+1 BALL` lanes, so it can never be over a
losing lane. All five paying lanes still sit inside it.

### Hidden: tap the wheel to skip

Tapping the wheel while it is spinning **skips the spin** — the same tap spins
it, or stops it. It works during the spin and the rarity flicker, and on a batch
spin (one tap and the receipt appears).

The SKIP pill is still there. Nobody reaches for a pill when the thing they are
watching is under their finger.

---

## Batch spins and the receipt (live earlier today)

### New: SPIN ×5 and SPIN ALL

A batch buys every draw up front and spends **one** wheel animation on the whole
lot: the disc lands on the rarest pull, the card holds it, and a receipt accounts
for the rest.

- **SPIN ALL** spends the whole wallet. It unlocks at ten tokens and its price
  badge is the live wallet, so the button always states what it will cost.
- The draws are granted at purchase time, so a reload during the animation can't
  eat tokens you paid for.
- Pity, the Spark, Dust, shards, pairs and relics all move exactly as they would
  across separate spins. A batch only removes the waiting.

### New: the receipt

- **Grouped by item** — three Nova Bells is one row with a ×3. (The old tag was
  your collection count, which turned one Bell into two rows reading ×4 and ×5.)
- **Rarest first**, and it scrolls, so every draw in the batch is listed instead
  of stopping at twelve behind a `+31 more draws` line.
- A header carries the totals: `60 DRAWS · 34 NEW · 12 PAIRS`.
- Scrolls itself into view when a batch lands.

---

## Under the hood (for the next session)

- Ball motion and board collisions are now one function, `integrateMotion()`,
  shared by the real simulation and by the nudge counterfactual.
- The counterfactual runs on a `ball.ghost` copy: `resolvePin` skips its flash,
  bumper sound and sparks, `registerPinHit` returns immediately, and the pin
  jitter is zeroed so the prediction is stable. 0.33 ms a sim.
- The skillshot headline is sized from a measurement (`offsetWidth`, **not**
  `getBoundingClientRect()` — the rect includes the pop animation's scale) to 94%
  of the cabinet, and re-measured when shown because the display font can swap in
  after first layout.
- The nudge shake is a `translate`, never a rotation: a rotated element reports
  the bounding box of the rotated shape, which breaks every pointer mapping and
  backing-store measurement taken from it.
- Cinema audio reuses the wheel's tension drone rather than duplicating it, and
  cuts the whole bed from `captureBall()` before the landing chord fires.
