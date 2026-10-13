# Regenerates the downloadable program PDF from program/index.html (half-letter, 5.5 x 8.5 in).
# Run from the repo root in PowerShell:   powershell -ExecutionPolicy Bypass -File program\make-pdf.ps1
# Uses Microsoft Edge (already on Windows). Needs an internet connection for the Google Fonts.
$ErrorActionPreference = 'Stop'
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
$edge = "${env:ProgramFiles(x86)}\Microsoft\Edge\Application\msedge.exe"
if (-not (Test-Path $edge)) { $edge = "$env:ProgramFiles\Microsoft\Edge\Application\msedge.exe" }
$page = (Join-Path $here 'index.html') -replace '\\', '/'
$out = Join-Path $here 'patrick-cabrera-funeral-mass-program.pdf'
$profile = Join-Path $env:TEMP 'cabrera-pdf-edge-profile'
$tmp = "$out.tmp"
if (Test-Path $tmp) { Remove-Item $tmp -Confirm:$false }
Start-Process -FilePath $edge -Wait -WindowStyle Hidden -ArgumentList @(
  '--headless=new', '--disable-gpu', '--no-first-run', "--user-data-dir=$profile",
  '--no-pdf-header-footer', '--virtual-time-budget=15000', "--print-to-pdf=$tmp", "file:///$page")
if (-not (Test-Path $tmp) -or (Get-Item $tmp).Length -lt 10KB) { throw 'Edge did not produce the PDF.' }
Move-Item -Force $tmp $out
"Wrote $out ($([math]::Round((Get-Item $out).Length / 1KB)) KB)"

# Stamp the PDF link in index.html with a short hash of the new file (...pdf?v=1a2b3c4d), so phones that
# saved or cached an earlier PDF fetch the new one instead of reopening their old copy.
$sha = [System.Security.Cryptography.SHA1]::Create()
$bytes = [System.IO.File]::ReadAllBytes($out)
$hash = (($sha.ComputeHash($bytes) | ForEach-Object { $_.ToString('x2') }) -join '').Substring(0, 8)
$indexPath = Join-Path $here 'index.html'
$html = [System.IO.File]::ReadAllText($indexPath)
$html = [regex]::Replace($html, 'href="patrick-cabrera-funeral-mass-program\.pdf(\?v=[0-9a-f]+)?"', "href=""patrick-cabrera-funeral-mass-program.pdf?v=$hash""")
[System.IO.File]::WriteAllText($indexPath, $html, (New-Object System.Text.UTF8Encoding($false)))
"Linked as patrick-cabrera-funeral-mass-program.pdf?v=$hash"
