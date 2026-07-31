# Локально: упаковать Id/Token в blob для секрета BRIDGE_P
# Usage (в PowerShell из корня репо):
#   . .\tools\bridge\codec.ps1
#   $key = "длинная-случайная-фраза"
#   Protect-BridgeBlob -Id "mirrico\dindarov_e_i" -Token "ВАШ_ПАРОЛЬ" -Key $key
# Результат (base64) → GitHub Secret BRIDGE_P
# Ключ $key → GitHub Secret BRIDGE_K
# Пароль в репозиторий не коммитить.

. "$PSScriptRoot\codec.ps1"

if (-not $args[0] -or -not $args[1] -or -not $args[2]) {
  Write-Host 'Usage: pack.ps1 <Id> <Token> <Key>'
  exit 1
}

Protect-BridgeBlob -Id $args[0] -Token $args[1] -Key $args[2]
