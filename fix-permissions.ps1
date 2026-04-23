# Run this script as Administrator to fix file permissions
# Right-click PowerShell -> "Run as administrator" -> paste this

$basePath = "E:\Guidewire\TriggrPay\server"

$folders = @("services", "routes", "utils")

foreach ($folder in $folders) {
    $fullPath = Join-Path $basePath $folder
    Write-Host "Fixing: $fullPath"
    takeown /F $fullPath /R /D Y
    icacls $fullPath /grant "Users:(OI)(CI)F" /T
}

# Also fix package-lock.json
takeown /F "$basePath\package-lock.json" /D Y
icacls "$basePath\package-lock.json" /grant "Users:F"

Write-Host ""
Write-Host "DONE - All server files are now writable." -ForegroundColor Green
