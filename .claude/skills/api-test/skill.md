# API Test Skill

Test the MapleQuest RPG server and API functionality.

## Instructions

When the user invokes this skill (via `/api-test` command), perform comprehensive server and API testing:

### 1. HTTP Server Test

**Server Availability:**
- [ ] Verify Python HTTP server is running on port 8000
- [ ] Check `http://localhost:8000` responds with 200 OK
- [ ] Verify `index.html` loads correctly
- [ ] Check static files serve properly (CSS, JS modules)

**Module Loading:**
- [ ] Verify all ES modules load without CORS errors
- [ ] Check `src/main.js` loads successfully
- [ ] Verify all entity modules load (effect, monster, projectile, coin)
- [ ] Check all system modules load (combat, leveling, movement, etc.)
- [ ] Verify data modules load (jobs.js)
- [ ] Check rendering modules load (background, player, minimap)
- [ ] Verify UI modules load (hud, skillbar, jobselect)

**Network Inspection:**
- [ ] Open DevTools Network tab
- [ ] Verify all `.js` files return `200 OK`
- [ ] Check MIME types are correct (`application/javascript`)
- [ ] Verify no 404 errors
- [ ] Check file sizes are reasonable (no bloat)

### 2. Future API Endpoints (Preparation)

**Save/Load System (Future):**
```javascript
// Test endpoints to implement:
GET  /api/save/:playerId     - Load player data
POST /api/save               - Save player data
GET  /api/leaderboard        - Get top players
POST /api/score              - Submit score
```

**Test Plan:**
- [ ] Design API structure for save/load
- [ ] Plan authentication (if multiplayer)
- [ ] Design leaderboard API
- [ ] Plan achievement system API

**Data Validation:**
```javascript
// Player save data structure:
{
  playerId: "uuid",
  job: "warrior|thief|archer",
  level: 1-99,
  hp: number,
  mp: number,
  exp: number,
  kills: number,
  meso: number,
  skills: [...],
  buffs: {...},
  timestamp: "ISO-8601"
}
```

### 3. WebSocket Test (Future Multiplayer)

**Real-time Features:**
- [ ] Test WebSocket connection (when implemented)
- [ ] Verify player position sync
- [ ] Check monster spawn synchronization
- [ ] Test damage events broadcast
- [ ] Verify chat messages (if added)

**Connection Stability:**
- [ ] Test reconnection on disconnect
- [ ] Verify state recovery after reconnect
- [ ] Check latency and lag compensation

### 4. Asset Loading Test

**Current Assets:**
- [ ] Verify CSS loads from `/css/style.css`
- [ ] Check job data loads from `/data/jobs.js`

**Future Assets (Sprite System):**
```
GET /assets/sprites/warrior_idle.png
GET /assets/sprites/warrior_walk.png
GET /assets/sprites/warrior_attack.png
GET /assets/backgrounds/sky.png
GET /assets/backgrounds/mountains_far.png
GET /assets/textures/platform_dirt.png
```

**Test Checklist:**
- [ ] Verify image MIME types (`image/png`)
- [ ] Check images load without corruption
- [ ] Test caching headers (for performance)
- [ ] Verify 404 handling for missing assets

### 5. Performance & Load Test

**Server Performance:**
- [ ] Measure response time for `index.html` (should be <50ms)
- [ ] Test concurrent connections (simulate multiple players)
- [ ] Check memory usage over time
- [ ] Verify no memory leaks in long sessions

**Client Performance:**
- [ ] Test module load time (all imports)
- [ ] Measure time to interactive (TTI)
- [ ] Check bundle size (if bundled in future)
- [ ] Verify service worker caching (if implemented)

### 6. Error Handling Test

**Server Errors:**
- [ ] Test 404 response for missing files
- [ ] Verify CORS headers are correct
- [ ] Check error pages render properly
- [ ] Test server restart recovery

**Client Errors:**
- [ ] Test module import failures
- [ ] Verify error messages in console
- [ ] Check fallback to game.html works
- [ ] Test localStorage errors (quota exceeded)

## Testing Commands

### Check Server Status
```bash
# Check if server is running
netstat -ano | findstr :8000

# Test HTTP response
curl -I http://localhost:8000

# Check module loading
curl http://localhost:8000/src/main.js
```

### Start Server
```bash
cd C:\claude-code\game
python -m http.server 8000
```

### Stop Server
```bash
# Find PID
netstat -ano | findstr :8000

# Kill process (replace PID)
taskkill /PID <PID> /F
```

### Test Module Imports
```javascript
// In browser console:
import('./src/state.js').then(m => console.log('State loaded:', m));
import('./data/jobs.js').then(m => console.log('Jobs loaded:', m.JOBS));
```

## Testing Steps

1. **Verify server is running**
   ```bash
   curl -I http://localhost:8000
   ```

2. **Open browser DevTools** (F12)
   - Go to Network tab
   - Enable "Disable cache"
   - Reload page (Ctrl+F5)

3. **Check all modules load**
   - Look for green 200 status codes
   - Verify no red errors
   - Check MIME types are correct

4. **Inspect Console tab**
   - Verify no import errors
   - Check "Game initialized!" message appears
   - Look for any warnings

5. **Test API structure** (for future implementation)
   - Document current limitations
   - Plan API endpoints
   - Design data structures

## Reporting

After testing, provide a summary:

### ✅ Working Correctly
- HTTP server status
- Module loading
- Static file serving
- CORS configuration

### ⚠️ Issues Found
- Missing files
- CORS errors
- Slow response times
- Import failures

### 📋 Future API Recommendations
- Save/load endpoints needed
- Leaderboard API design
- WebSocket for multiplayer
- Asset management strategy

### 📊 Performance Metrics
- Server response time: __ms
- Module load time: __ms
- Time to interactive: __ms
- Console errors: __count

## Files to Check

- `index.html` - Entry point
- `server.bat` - Server startup script
- `src/main.js` - Module imports
- Network tab - All HTTP requests
- Console - Import errors and logs

## Common Issues & Solutions

**Issue:** CORS error on module load
**Solution:** Use HTTP server, not `file://`

**Issue:** Module not found (404)
**Solution:** Check file path is correct, case-sensitive

**Issue:** Server won't start
**Solution:** Port 8000 might be in use, try `python -m http.server 8001`

**Issue:** Modules load but game doesn't start
**Solution:** Check browser console for JavaScript errors
