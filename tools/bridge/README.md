# Мост данных (CI). Секреты не коммитить.

## Секреты (Settings → Secrets and variables → Actions)

| Secret | Назначение |
|---|---|
| `BRIDGE_K` | текущий ключ AES (меняется раз в сутки) |
| `BRIDGE_P` | blob логин+пароль, зашифрованный текущим ключом |
| `BRIDGE_DAY` | дата последней ротации по **Москве** `yyyy-MM-dd` |
| `BRIDGE_ROTATOR` | GitHub PAT с правом **писать** Actions secrets |
| `BRIDGE_HOOK` | URL веб-приложения Apps Script (для логов в CalenBot) |
| `BRIDGE_LOG_TOKEN` | тот же токен, что `APP_LOG_TOKEN` в Script Properties |
| `BRIDGE_ID` / `BRIDGE_TOKEN` | только отладка без шифр-слоя |

Имена нарочно нейтральные.

### Как получить BRIDGE_ROTATOR
1. GitHub → Settings → Developer settings → Personal access tokens  
2. Classic `repo` **или** fine-grained: этот репозиторий → Secrets: Read and write  
3. Положите токен в Secret `BRIDGE_ROTATOR`  
4. Обычный `GITHUB_TOKEN` workflow **не умеет** обновлять Secrets — нужен именно PAT

## Первичная упаковка (локально)

```powershell
cd путь\к\Sheduler
. .\tools\bridge\codec.ps1
$key = New-BridgeKey
$key   # скопировать → Secret BRIDGE_K
Protect-BridgeBlob -Id "mirrico\dindarov_e_i" -Token "ПАРОЛЬ" -Key $key
# base64 → Secret BRIDGE_P
```

`BRIDGE_DAY` можно не задавать — при первом успешном прогоне ротация сама проставит.

## Что делает workflow каждый час
1. Расшифровывает `BRIDGE_P` ключом `BRIDGE_K`
2. Зонд EWS → `PROBE_OK` (+ строка в журнал Apps Script, если заданы `BRIDGE_HOOK` / `BRIDGE_LOG_TOKEN`)
3. Если день по **Москве** новый — новый ключ, перешифровка, запись `BRIDGE_K` / `BRIDGE_P` / `BRIDGE_DAY` через `gh secret set`  
   В логе: `ROTATE_OK` или `ROTATE_SKIP same day` (и в Настройки → Логи в приложении)

### Логи в CalenBot
1. В Apps Script → Project settings → Script properties: `APP_LOG_TOKEN` = случайная строка  
2. Задеплойте новую версию веб-приложения (`Code.gs` / `CalenBot.gs` с `?applog=1`)  
3. Secrets Actions: `BRIDGE_HOOK` = URL веб-приложения, `BRIDGE_LOG_TOKEN` = тот же токен  
4. В приложении: Настройки → Логи (свёрнуто) → Обновить

Смена суток: **00:00 MSK** (21:00 UTC предыдущего дня). Часовой cron `0 * * * *` (UTC) после полуночи MSK на ближайшем часовом запуске сделает ротацию.

## Проверка
Actions → maintain-data → Run workflow → ищите `PROBE_OK` и при смене дня `ROTATE_OK`.

## Дальше
Выгрузка встреч в Sheets / CalenBot.
