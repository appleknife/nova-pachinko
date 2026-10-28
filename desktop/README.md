# Nova Pachinko — desktop launcher

**Double-click `NovaPachinko.cmd`.** The game opens in its own window, with no
browser tab strip, no extensions, and its own profile.

`NovaPachinko.cmd smooth` does the same but renders at 1× pixel scale, which is
the fastest option on a high-DPI monitor (slightly softer, much cheaper).

## What it actually changes

The game is the same `index.html` — this launcher only changes how the browser
runs it:

| Flag | Effect |
| --- | --- |
| `--app=…` | A plain app window instead of a tab, so there is no browser UI or other tabs competing for the compositor |
| `--user-data-dir=…` | A clean profile in `%LOCALAPPDATA%\NovaPachinko`, so no extensions run and settings can't be polluted |
| `--disable-backgrounding-occluded-windows`, `--disable-renderer-backgrounding`, `--disable-features=CalculateNativeWinOcclusion` | Stops Chromium from deciding the window is "not really visible" and throttling it |
| `--enable-gpu-rasterization --enable-zero-copy --ignore-gpu-blocklist` | Lets the compositor keep the cabinet on the GPU |
| `--force-device-scale-factor=1` (smooth mode) | Draws fewer pixels: on a 4K monitor at 150% scaling this is roughly half the work per frame |

## An honest note on frame rate

The smoothness you feel in Bionic is mostly **pixel count and compositor path**,
not "native vs browser". A dedicated Chromium window renders at the same CSS size
with fewer pixels (no DPI scaling) and without a browser UI layer on top, and it
never gets backgrounded — which is where most of the difference comes from.

A true native port (C++/SDL) would render the same 2D canvas scene faster still, but
it would mean reimplementing the whole game; if the launcher still isn't smooth
enough, the next honest lever is the in-game **RES** button (auto → high → low)
or smooth mode above, not a rewrite.

## Making it feel like an installed app

1. Right-click `NovaPachinko.cmd` → **Send to → Desktop (create shortcut)**.
2. Right-click the shortcut → **Properties → Change Icon** and pick `icon.ico`
   from the project folder (a multi-size icon built from the app artwork).
3. Optional: **Properties → Run → Minimized** hides the console flash.
4. To get the smooth mode as a second icon, copy the shortcut and add a space
   plus `smooth` at the end of its **Target** field.

The launcher finds `index.html` whether it sits beside it or one folder up, so a
copy in the project root works the same way.

## Saves

The launcher uses its own Chrome profile in `%LOCALAPPDATA%\NovaPachinko`, which
means the desktop app keeps **its own** tokens and collection — separate from the
hosted page in your normal browser. Progress is stored with `localStorage`, which
Chrome does keep for `file://` pages when the profile persists.

The same game is also installable from the hosted build
(<https://appleknife.github.io/nova-pachinko/>) via the browser's **Install app**
option, which gives a real PWA window — slower than this launcher only because of
the network and the default pixel scale.
