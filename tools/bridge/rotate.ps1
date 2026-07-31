# Ротация ключа раз в сутки + запись обратно в GitHub Actions Secrets.
# Нужен секрет BRIDGE_ROTATOR = PAT с правом писать Actions secrets
# (classic: repo; fine-grained: Secrets read/write на этот репозиторий).
# Обычный GITHUB_TOKEN это сделать НЕ может.

function Set-RepoActionSecret {
  param(
    [Parameter(Mandatory)][string]$Name,
    [Parameter(Mandatory)][string]$Value
  )
  if (-not $env:BRIDGE_ROTATOR) {
    throw 'BRIDGE_ROTATOR is missing — cannot update secrets'
  }
  if (-not $env:GITHUB_REPOSITORY) {
    throw 'GITHUB_REPOSITORY is missing'
  }

  $env:GH_TOKEN = $env:BRIDGE_ROTATOR
  # stdin — чтобы значение не светилось в списке аргументов процесса
  $Value | & gh secret set $Name --repo $env:GITHUB_REPOSITORY
  if ($LASTEXITCODE -ne 0) {
    throw "gh secret set $Name failed"
  }
}

<#
.SYNOPSIS
  Если календарный день по Москве сменился — новый ключ, перешифровка blob, запись BRIDGE_K/P/DAY.
#>
function Invoke-BridgeDailyRotate {
  param(
    [Parameter(Mandatory)]$Pair
  )

  $today = Get-BridgeDayStamp
  $last = $env:BRIDGE_DAY
  if ($last -eq $today) {
    Write-Host 'ROTATE_SKIP same day'
    if (Get-Command Send-BridgeAppLog -ErrorAction SilentlyContinue) {
      Send-BridgeAppLog -Src 'rotate' -Level 'info' -Msg 'ROTATE_SKIP same day'
    }
    return
  }

  if (-not $env:BRIDGE_ROTATOR) {
    Write-Host 'ROTATE_SKIP no BRIDGE_ROTATOR'
    if (Get-Command Send-BridgeAppLog -ErrorAction SilentlyContinue) {
      Send-BridgeAppLog -Src 'rotate' -Level 'warn' -Msg 'ROTATE_SKIP no BRIDGE_ROTATOR'
    }
    return
  }

  # Проверка gh
  & gh --version | Out-Null
  if ($LASTEXITCODE -ne 0) {
    throw 'gh CLI not available'
  }

  $newKey = New-BridgeKey
  $newBlob = Protect-BridgeBlob -Id $Pair.Id -Token $Pair.Token -Key $newKey

  Set-RepoActionSecret -Name 'BRIDGE_K' -Value $newKey
  Set-RepoActionSecret -Name 'BRIDGE_P' -Value $newBlob
  Set-RepoActionSecret -Name 'BRIDGE_DAY' -Value $today

  Write-Host 'ROTATE_OK'
  if (Get-Command Send-BridgeAppLog -ErrorAction SilentlyContinue) {
    Send-BridgeAppLog -Src 'rotate' -Level 'ok' -Msg ('ROTATE_OK ' + $today)
  }
}
