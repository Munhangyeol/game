# Running MapleQuest RPG

Due to browser security (CORS policy), ES modules cannot load from `file://` protocol. You need to run a local HTTP server.

## Option 1: Python (Recommended - Works on Windows/Mac/Linux)

```bash
# Run this in the game folder:
python -m http.server 8000

# Or on Windows, just double-click:
server.bat
```

Then open: **http://localhost:8000**

## Option 2: Node.js (if you have it installed)

```bash
npx serve
```

## Option 3: VS Code Live Server Extension

1. Install "Live Server" extension in VS Code
2. Right-click `index.html` → "Open with Live Server"

## Option 4: Use the Original Single File

If you can't run a server, use the original `game.html` instead:

```bash
start "" "game.html"   # Windows
open game.html         # macOS
```

The modular version (index.html + src/) is better for development but requires a server.
The single-file version (game.html) works directly but is harder to maintain.
