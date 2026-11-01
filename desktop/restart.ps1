$ErrorActionPreference = "SilentlyContinue"
Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" |
  Where-Object { $_.CommandLine -like '*--app=*nova-pachinko*' } |
  ForEach-Object { Write-Host "stopping $($_.ProcessId)"; Stop-Process -Id $_.ProcessId -Force }
Start-Sleep -Milliseconds 800
Start-Process -FilePath (Join-Path $PSScriptRoot "NovaPachinko.cmd") -WindowStyle Hidden
Start-Sleep -Seconds 3
Get-CimInstance Win32_Process -Filter "Name='chrome.exe'" |
  Where-Object { $_.CommandLine -like '*--app=*nova-pachinko*' } |
  ForEach-Object { Write-Host "now running $($_.ProcessId)" }
