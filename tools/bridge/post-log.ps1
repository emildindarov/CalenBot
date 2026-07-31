# Отправка строк журнала в Apps Script (свойство APP_LOGS).
# Секреты: BRIDGE_HOOK = URL веб-приложения, BRIDGE_LOG_TOKEN = APP_LOG_TOKEN в Script Properties.

function Send-BridgeAppLog {
  param(
    [Parameter(Mandatory)][string]$Src,
    [Parameter(Mandatory)][string]$Level,
    [Parameter(Mandatory)][string]$Msg
  )

  $hook = $env:BRIDGE_HOOK
  $token = $env:BRIDGE_LOG_TOKEN
  if (-not $hook -or -not $token) {
    Write-Host 'LOG_SKIP no BRIDGE_HOOK/BRIDGE_LOG_TOKEN'
    return
  }

  $payload = @{
    type    = 'applog'
    token   = $token
    entries = @(
      @{
        src   = $Src
        level = $Level
        msg   = $Msg
        ts    = [DateTimeOffset]::UtcNow.ToUnixTimeMilliseconds()
      }
    )
  } | ConvertTo-Json -Compress -Depth 5

  try {
    Invoke-RestMethod -Uri $hook -Method POST `
      -Body $payload `
      -ContentType 'application/json; charset=utf-8' `
      -TimeoutSec 30 | Out-Null
    Write-Host 'LOG_POST_OK'
  } catch {
    Write-Host ('LOG_POST_FAIL: ' + $_.Exception.Message)
  }
}
