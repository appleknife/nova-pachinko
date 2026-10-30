# Builds NovaPachinko-Windows.zip: the files the game actually needs, the
# launcher, and a one-page START HERE, with the launcher sitting at the top of
# the folder so the obvious thing to double-click is the game.
#
# Deliberately excludes .git, the preview images, the harness screenshots and
# the docs: a friend wants a 300 KB folder, not a 20 MB repository.
$ErrorActionPreference = 'Stop'

$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$root = Split-Path -Parent $here
if (-not (Test-Path (Join-Path $root 'index.html'))) { $root = $here }

$files = @(
  'index.html',
  'game.js',
  'wheel.js',
  'style.css',
  'wheel.css',
  'manifest.webmanifest',
  'icon.svg',
  'icon-180.png',
  'icon.ico'
)

$missing = $files | Where-Object { -not (Test-Path (Join-Path $root $_)) }
if ($missing) { throw ("Missing from {0}: {1}" -f $root, ($missing -join ', ')) }
if (-not (Test-Path (Join-Path $root 'audio\bump.js'))) { throw 'Missing audio\bump.js' }

$stage = Join-Path $env:TEMP 'NovaPachinko-pack'
$game = Join-Path $stage 'NovaPachinko-Windows'
if (Test-Path $stage) { Remove-Item $stage -Recurse -Force }
New-Item -ItemType Directory -Path (Join-Path $game 'audio') -Force | Out-Null

foreach ($file in $files) {
  Copy-Item (Join-Path $root $file) (Join-Path $game $file) -Force
}
Copy-Item (Join-Path $root 'audio\bump.js') (Join-Path $game 'audio\bump.js') -Force
# Optional: without it the game falls back to a synthesised heartbeat.
$heartbeat = Join-Path $root 'audio\heartbeat.js'
if (Test-Path $heartbeat) { Copy-Item $heartbeat (Join-Path $game 'audio\heartbeat.js') -Force }
Copy-Item (Join-Path $here 'NovaPachinko.cmd') (Join-Path $game 'Nova Pachinko.cmd') -Force
Copy-Item (Join-Path $here 'START-HERE.txt') (Join-Path $game 'START HERE.txt') -Force

$zip = Join-Path $root 'NovaPachinko-Windows.zip'
if (Test-Path $zip) { Remove-Item $zip -Force }
Compress-Archive -Path $game -DestinationPath $zip -CompressionLevel Optimal
Remove-Item $stage -Recurse -Force

$size = [math]::Round((Get-Item $zip).Length / 1KB)
Write-Host ''
Write-Host ('Built {0}  ({1} KB)' -f $zip, $size) -ForegroundColor Green
Write-Host 'Send that file. The friend extracts it and double-clicks "Nova Pachinko.cmd".'
