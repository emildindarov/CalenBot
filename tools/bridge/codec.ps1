# Неявный слой упаковки/распаковки полезной нагрузки.
# Не вызывайте из UI приложения напрямую — только из CI / локальных утилит.

function Protect-BridgeBlob {
  param(
    [Parameter(Mandatory)][string]$Id,
    [Parameter(Mandatory)][string]$Token,
    [Parameter(Mandatory)][string]$Key
  )
  $plain = ($Id + "`n" + $Token)
  $keyBytes = [System.Security.Cryptography.SHA256]::Create().ComputeHash(
    [System.Text.Encoding]::UTF8.GetBytes($Key)
  )
  $aes = [System.Security.Cryptography.Aes]::Create()
  $aes.Key = $keyBytes
  $aes.GenerateIV()
  $enc = $aes.CreateEncryptor()
  $plainBytes = [System.Text.Encoding]::UTF8.GetBytes($plain)
  $cipher = $enc.TransformFinalBlock($plainBytes, 0, $plainBytes.Length)
  $blob = New-Object byte[] ($aes.IV.Length + $cipher.Length)
  [Array]::Copy($aes.IV, 0, $blob, 0, $aes.IV.Length)
  [Array]::Copy($cipher, 0, $blob, $aes.IV.Length, $cipher.Length)
  return [Convert]::ToBase64String($blob)
}

function Unprotect-BridgeBlob {
  param(
    [Parameter(Mandatory)][string]$Blob,
    [Parameter(Mandatory)][string]$Key
  )
  $all = [Convert]::FromBase64String($Blob)
  if ($all.Length -lt 17) { throw 'payload too short' }
  $iv = $all[0..15]
  $cipher = $all[16..($all.Length - 1)]
  $keyBytes = [System.Security.Cryptography.SHA256]::Create().ComputeHash(
    [System.Text.Encoding]::UTF8.GetBytes($Key)
  )
  $aes = [System.Security.Cryptography.Aes]::Create()
  $aes.Key = $keyBytes
  $aes.IV = $iv
  $dec = $aes.CreateDecryptor()
  $plainBytes = $dec.TransformFinalBlock($cipher, 0, $cipher.Length)
  $plain = [System.Text.Encoding]::UTF8.GetString($plainBytes)
  $parts = $plain -split "`n", 2
  if ($parts.Count -lt 2) { throw 'bad payload' }
  return [pscustomobject]@{ Id = $parts[0]; Token = $parts[1] }
}

<#
.SYNOPSIS
  Собирает пару Id/Token из ENV.
  Приоритет: зашифрованный BRIDGE_P + ключ BRIDGE_K;
  иначе открытые BRIDGE_ID + BRIDGE_TOKEN (только для отладки).
#>
function New-BridgeKey {
  $bytes = New-Object byte[] 32
  # Windows PowerShell 5.1 (.NET Framework): нет RandomNumberGenerator.Fill
  $rng = [System.Security.Cryptography.RandomNumberGenerator]::Create()
  try {
    $rng.GetBytes($bytes)
  } finally {
    $rng.Dispose()
  }
  return [Convert]::ToBase64String($bytes)
}

function Resolve-BridgePair {
  $k = $env:BRIDGE_K
  $p = $env:BRIDGE_P
  if ($k -and $p) {
    return Unprotect-BridgeBlob -Blob $p -Key $k
  }
  $id = $env:BRIDGE_ID
  $token = $env:BRIDGE_TOKEN
  if (-not $id -or -not $token) {
    throw 'Missing bridge material (BRIDGE_P/BRIDGE_K or BRIDGE_ID/BRIDGE_TOKEN)'
  }
  return [pscustomobject]@{ Id = $id; Token = $token }
}

function Get-BridgeDayStamp {
  # Сутки по Москве (MSK = UTC+3, без DST)
  $msk = [DateTime]::UtcNow.AddHours(3)
  return $msk.ToString('yyyy-MM-dd')
}
