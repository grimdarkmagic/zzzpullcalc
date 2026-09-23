# Export Zenless Zone Zero Signal Search records directly from HoYoverse.
# Open Signal Search > Details > Search History in the PC game first, then run:
# powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\export-signal-history.ps1
# Optional: -GameDataPath 'D:\Games\ZenlessZoneZero Game\ZenlessZoneZero_Data'
# Optional: -HistoryUrl '<temporary URL copied from the game>'

param(
    [string]$GameDataPath,
    [string]$HistoryUrl,
    [string]$OutputPath
)

$ErrorActionPreference = 'Stop'
Add-Type -AssemblyName System.Web

function Find-GameDataPath {
    $logPaths = @(
        (Join-Path $env:USERPROFILE 'AppData\LocalLow\miHoYo\ZenlessZoneZero\Player.log'),
        (Join-Path $env:USERPROFILE 'AppData\LocalLow\miHoYo\绝区零\Player.log'),
        (Join-Path $env:USERPROFILE 'AppData\LocalLow\Cognosphere\Zenless Zone Zero\Player.log'),
        (Join-Path $env:USERPROFILE 'AppData\LocalLow\Cognosphere\ZenlessZoneZero\Player.log')
    )
    foreach ($logPath in $logPaths) {
        if (-not (Test-Path -LiteralPath $logPath -PathType Leaf)) { continue }
        $logText = [System.IO.File]::ReadAllText($logPath)
        $matches = [regex]::Matches($logText, '(?i)[A-Z]:[\\/][^\r\n"<>]*?[\\/]ZenlessZoneZero_Data')
        for ($i = $matches.Count - 1; $i -ge 0; $i--) {
            $path = $matches[$i].Value -replace '/', '\'
            if (Test-Path -LiteralPath $path -PathType Container) { return $path }
        }
    }
    throw 'Game installation not found. Pass -GameDataPath with the full ZenlessZoneZero_Data folder path.'
}

function Find-HistoryUrl([string]$dataPath) {
    $cacheRoot = Join-Path $dataPath 'webCaches'
    if (-not (Test-Path -LiteralPath $cacheRoot -PathType Container)) {
        throw 'Game web cache not found. Open Search History in the PC game and try again.'
    }
    $folders = @($cacheRoot) + @(Get-ChildItem -LiteralPath $cacheRoot -Directory | ForEach-Object { $_.FullName })
    $files = @($folders | ForEach-Object {
        $candidate = Join-Path $_ 'Cache\Cache_Data\data_2'
        if (Test-Path -LiteralPath $candidate -PathType Leaf) { Get-Item -LiteralPath $candidate }
    } | Sort-Object LastWriteTimeUtc -Descending)
    foreach ($file in $files) {
        $cacheText = [System.Text.Encoding]::UTF8.GetString([System.IO.File]::ReadAllBytes($file.FullName))
        $links = [regex]::Matches($cacheText, 'https?://[^\x00-\x20"''<>]+?authkey=[^\x00-\x20"''<>]+?end_id=')
        for ($i = $links.Count - 1; $i -ge 0; $i--) {
            $candidate = $links[$i].Value + '0'
            try {
                $uri = [uri]$candidate
                if ($uri.Query -match 'authkey=' -and $uri.Host -match '(?i)(^|\.)(hoyoverse|mihoyo)\.com$') {
                    return $candidate
                }
            } catch { continue }
        }
    }
    throw 'No Signal Search history link found. Open Search History in the PC game, then try again.'
}

function Get-ApiBase([string]$url) {
    try { $uri = [uri]$url } catch { throw 'Invalid history URL.' }
    if ($uri.Scheme -ne 'https' -or $uri.Host -notmatch '(?i)(^|\.)(hoyoverse|mihoyo)\.com$') {
        throw 'History URL must use an official HoYoverse HTTPS domain.'
    }
    $query = [System.Web.HttpUtility]::ParseQueryString($uri.Query)
    if ([string]::IsNullOrWhiteSpace($query['authkey'])) { throw 'History URL has no authkey. Reopen Search History in the game.' }
    foreach ($key in @('page', 'size', 'gacha_type', 'real_gacha_type', 'end_id')) { $query.Remove($key) }
    $hostName = if ($uri.Host -match '(?i)hoyoverse\.com$') {
        'public-operation-nap-sg.hoyoverse.com'
    } else {
        'public-operation-nap.mihoyo.com'
    }
    return "https://$hostName/common/gacha_record/api/getGachaLog?$($query.ToString())"
}

function Get-Page([string]$baseUrl, [string]$type, [int]$page, [string]$endId) {
    $requestUrl = "$baseUrl&real_gacha_type=$type&page=$page&size=20&end_id=$endId"
    for ($attempt = 1; $attempt -le 3; $attempt++) {
        try {
            $result = Invoke-RestMethod -Uri $requestUrl -Method Get -TimeoutSec 30
            if ($result.retcode -ne 0) {
                if ($result.message -match '(?i)authkey|timeout|expired') {
                    throw 'History link expired. Reopen Search History in the game and rerun the exporter.'
                }
                throw "HoYoverse rejected the request (code $($result.retcode))."
            }
            if ($null -eq $result.data) {
                throw 'HoYoverse returned an unexpected history response.'
            }
            return $result.data.list
        } catch {
            if ($_.Exception.Message -match 'History link expired|HoYoverse rejected|unexpected history') { throw }
            if ($attempt -eq 3) { throw "Could not retrieve channel $type, page $page after three attempts." }
            Start-Sleep -Seconds (2 * $attempt)
        }
    }
}

$channelNames = [ordered]@{
    '1' = 'Stable Channel'
    '2' = 'Exclusive Channel'
    '3' = 'W-Engine Channel'
    '5' = 'Bangboo Channel'
    '102' = 'Exclusive Rescreening'
    '103' = 'W-Engine Reverberation'
}

if ([string]::IsNullOrWhiteSpace($HistoryUrl)) {
    if ([string]::IsNullOrWhiteSpace($GameDataPath)) { $GameDataPath = Find-GameDataPath }
    if (-not (Test-Path -LiteralPath $GameDataPath -PathType Container)) { throw 'GameDataPath does not exist.' }
    $HistoryUrl = Find-HistoryUrl $GameDataPath
}
$baseUrl = Get-ApiBase $HistoryUrl
$channels = @()
$accountUid = $null
foreach ($type in $channelNames.Keys) {
    $records = [System.Collections.Generic.List[object]]::new()
    $seen = [System.Collections.Generic.HashSet[string]]::new()
    $cursor = '0'
    for ($page = 1; $page -le 2000; $page++) {
        $batch = @(Get-Page $baseUrl $type $page $cursor)
        if ($batch.Count -eq 0) { break }
        foreach ($record in $batch) {
            if ([string]::IsNullOrWhiteSpace([string]$record.id)) { throw "Channel $type returned a record without an ID." }
            $uid = [string]$record.uid
            if ($uid) {
                if ($accountUid -and $uid -ne $accountUid) { throw 'History contains records from different accounts.' }
                $accountUid = $uid
            }
            if (-not $seen.Add([string]$record.id)) { throw "Channel $type repeated a record on page $page." }
            $records.Add($record)
        }
        $nextCursor = [string]$batch[-1].id
        if ($nextCursor -eq $cursor) { throw "Channel $type did not advance its page cursor." }
        $cursor = $nextCursor
        if ($page -eq 2000) { throw "Channel $type exceeded the page limit; refusing to save a partial export." }
        Start-Sleep -Milliseconds 300
    }
    Write-Host "$($channelNames[$type]): $($records.Count) records"
    $channels += [ordered]@{ type = $type; name = $channelNames[$type]; records = @($records.ToArray()) }
}

if (-not $OutputPath) {
    $folder = [Environment]::GetFolderPath('MyDocuments')
    $OutputPath = Join-Path $folder ("zzz-signal-search-{0}.json" -f (Get-Date -Format 'yyyy-MM-dd-HHmmss'))
}
$fullOutputPath = [System.IO.Path]::GetFullPath($OutputPath)
if (Test-Path -LiteralPath $fullOutputPath) { throw 'Output file already exists; choose a new -OutputPath.' }
$outputFolder = Split-Path -Parent $fullOutputPath
if (-not (Test-Path -LiteralPath $outputFolder -PathType Container)) { throw 'Output folder does not exist.' }
$payload = [ordered]@{
    format = 'zzz-signal-search-records'
    version = 1
    exportedAt = (Get-Date).ToUniversalTime().ToString('o')
    source = 'HoYoverse Signal Search history'
    uid = $accountUid
    channels = $channels
}
$json = ConvertTo-Json -InputObject $payload -Depth 20
[System.IO.File]::WriteAllText($fullOutputPath, $json, [System.Text.UTF8Encoding]::new($false))
Write-Host "Saved Signal Search history to $fullOutputPath"
