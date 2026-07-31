# Зонд удалённой службы (проверка доступа). Без записи в Sheets — следующий этап.

function Invoke-BridgeProbe {
  if (-not $env:BRIDGE_ID -or -not $env:BRIDGE_TOKEN) {
    throw 'BRIDGE_ID / BRIDGE_TOKEN not set in env'
  }

  $user = $env:BRIDGE_ID
  $pass = $env:BRIDGE_TOKEN
  $pair = '{0}:{1}' -f $user, $pass
  $basic = [Convert]::ToBase64String([Text.Encoding]::UTF8.GetBytes($pair))

  $url = 'https://ex.mirrico.com:444/EWS/Exchange.asmx'
  $body = @'
<?xml version="1.0"?>
<soap:Envelope xmlns:soap="http://schemas.xmlsoap.org/soap/envelope/" xmlns:t="http://schemas.microsoft.com/exchange/services/2006/types" xmlns:m="http://schemas.microsoft.com/exchange/services/2006/messages">
  <soap:Header><t:RequestServerVersion Version="Exchange2010_SP2"/></soap:Header>
  <soap:Body>
    <m:GetFolder>
      <m:FolderShape><t:BaseShape>IdOnly</t:BaseShape></m:FolderShape>
      <m:FolderIds><t:DistinguishedFolderId Id="calendar"/></m:FolderIds>
    </m:GetFolder>
  </soap:Body>
</soap:Envelope>
'@

  try {
    $r = Invoke-WebRequest -Uri $url -Method POST `
      -Headers @{
        Authorization = "Basic $basic"
        SOAPAction = 'http://schemas.microsoft.com/exchange/services/2006/messages/GetFolder'
      } `
      -ContentType 'text/xml; charset=utf-8' `
      -Body $body `
      -TimeoutSec 45 `
      -UseBasicParsing

    if ($r.StatusCode -eq 200 -and $r.Content -match 'FolderId') {
      Write-Host 'PROBE_OK'
      if (Get-Command Send-BridgeAppLog -ErrorAction SilentlyContinue) {
        Send-BridgeAppLog -Src 'bridge' -Level 'ok' -Msg 'PROBE_OK'
      }
    } else {
      Write-Host ('PROBE_HTTP_' + $r.StatusCode)
      if (Get-Command Send-BridgeAppLog -ErrorAction SilentlyContinue) {
        Send-BridgeAppLog -Src 'bridge' -Level 'err' -Msg ('PROBE_HTTP_' + $r.StatusCode)
      }
      throw 'unexpected response'
    }
  } catch {
    # Не печатаем тело/креды
    Write-Host ('PROBE_FAIL: ' + $_.Exception.Message)
    if (Get-Command Send-BridgeAppLog -ErrorAction SilentlyContinue) {
      Send-BridgeAppLog -Src 'bridge' -Level 'err' -Msg ('PROBE_FAIL: ' + $_.Exception.Message)
    }
    throw
  }
}
