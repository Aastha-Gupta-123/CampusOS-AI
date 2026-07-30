Set-Location $PSScriptRoot
.\.venv\Scripts\Activate.ps1
Start-Process powershell -ArgumentList '-NoExit','-Command','Set-Location "' + $PSScriptRoot + '"; .\.venv\Scripts\Activate.ps1; python -m uvicorn backend.app:app --host 127.0.0.1 --port 8001' -WindowStyle Hidden
Start-Process powershell -ArgumentList '-NoExit','-Command','Set-Location "' + $PSScriptRoot + '\frontend"; npm run dev' -WindowStyle Hidden
