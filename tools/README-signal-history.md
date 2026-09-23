# Local Signal Search history export (Windows)

This helper reads the temporary history link from the installed PC game and downloads records directly from HoYoverse to a JSON file on your computer. It does not use rng.moe or another intermediary service. The planner website itself remains offline-capable.

1. In Zenless Zone Zero on PC, open **Signal Search → Details → Search History**.
2. Double-click `tools\export-signal-history.cmd`. The window shows each channel's count and waits for a key press so you can read any error.

You can also run the script from PowerShell in the project folder:

   ```powershell
   powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\export-signal-history.ps1
   ```

The script prints a record count for each channel and saves a timestamped `zzz-signal-search-*.json` file in your Documents folder. It includes Stable, Exclusive, W-Engine, Bangboo, Exclusive Rescreening, and W-Engine Reverberation records. Keep the file private: it contains your game UID and individual Signal Search results. Do not commit it to the repository.

If the game installation cannot be located from `Player.log`, pass its data folder explicitly:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\export-signal-history.ps1 -GameDataPath 'D:\Games\ZenlessZoneZero Game\ZenlessZoneZero_Data'
```

If the link has expired, reopen Search History in the game and rerun the command. The game currently exposes roughly the last six months of records; save exports periodically if you want to retain older records. The history endpoint is not a published developer API, so a game update could require changing this helper.

This file is separate from the planner's **Pull income tracker → Export history** button, which backs up wallet snapshots rather than in-game search results.
