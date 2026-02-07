# Integration Test Skill

실제 게임 플레이를 시뮬레이션하여 모든 시스템이 통합적으로 잘 작동하는지 종합 테스트합니다.

## Instructions

When the user invokes this skill (via `/integration-test` command), perform comprehensive end-to-end testing of the entire game:

---

## 🎮 Phase 0: Module Import Path Verification

### 0.1 Automated Import Path Check
```javascript
// Before testing gameplay, verify all ES module imports are correct:
- [ ] Run automated import path verification
- [ ] Check all .js files in src/ directory
- [ ] Verify each import statement points to actual file location
- [ ] Ensure relative paths are calculated correctly (../../ etc.)
- [ ] No 404 errors in browser Network tab
- [ ] All modules load successfully

// Test procedure:
1. Glob all .js files in src/**/*.js
2. Read each file and extract import statements
3. For each import, calculate expected file path
4. Verify the imported file actually exists at that location
5. Report any mismatches or broken imports
```

**Expected Result:**
```
✅ All import paths verified correct
✅ No broken module references found
✅ All files load without 404 errors
✅ Module dependency graph is valid
```

### 0.2 Key Import Paths to Verify
```javascript
// Critical imports that must be correct:

// Main entry point (src/main.js)
- GameState from './core/game/GameState.js'
- Effect from './features/visual/Effect.js'
- setupInputHandlers from './infrastructure/input/InputHandler.js'
- gameLoop from './core/game/GameLoop.js'
- JobSelectScreen from './ui/screens/JobSelectScreen.js'

// GameLoop.js imports
- GameState, MovementSystem, MonsterSpawner, LevelingSystem
- HUD, SkillBar, BackgroundRenderer, PlayerRenderer, MinimapRenderer

// Combat system imports
- JOBS from '../../../data/jobs.js' (note: 3 levels up!)
- Effect from '../visual/Effect.js'
- Projectile from '../visual/Projectile.js'

// Common pitfalls:
- data/jobs.js requires going outside src/ (use ../../../data/)
- features/ modules importing from each other
- Old paths from before restructure (systems/, entities/, rendering/)
```

---

## 🎮 Phase 1: Game Initialization & Job Selection

### 1.1 Initial Load
```javascript
// Test checklist:
- [ ] HTTP server is running on localhost:8000
- [ ] index.html loads without errors (200 OK)
- [ ] All ES modules load successfully (check Network tab)
- [ ] No CORS errors in console
- [ ] Canvas element renders (1000x600)
- [ ] Job selection screen is visible
```

### 1.2 Job Selection Screen
```javascript
// Visual test:
- [ ] Title "직업을 선택하세요" displays
- [ ] 3 job cards render (Warrior, Thief, Archer)
- [ ] Each card shows: icon, name, stats, skills
- [ ] Hover effects work (card lifts, border glows)
- [ ] Card colors match job theme (red/purple/green)

// Interaction test:
- [ ] Click Warrior card → game starts
- [ ] Click Thief card → game starts
- [ ] Click Archer card → game starts
- [ ] Job select screen hides after selection
- [ ] HUD appears with correct job name/icon
```

**Expected Result:**
```
✅ Job selected: [Warrior/Thief/Archer]
✅ HUD visible: HP bar, MP bar, EXP bar, Level 1
✅ Skill bar shows 4 slots (A, Z, X, C)
✅ Controls hint appears: "[←→] 이동 | [↑/Space] 점프..."
✅ Game starts with player at (100, 400)
```

---

## 🎮 Phase 2: Basic Movement & Physics

### 2.1 Horizontal Movement
```javascript
// Test left/right movement:
- [ ] Press → (ArrowRight) → player moves right
- [ ] Press ← (ArrowLeft) → player moves left
- [ ] Player direction flips (sprite should flip)
- [ ] Player speed matches job.speed value
- [ ] Movement is smooth (60 FPS)
- [ ] Player stops when key released

// Expected behavior per job:
- Warrior: speed 4 (slower)
- Thief: speed 7 (fastest)
- Archer: speed 5 (medium)
```

### 2.2 Jumping & Gravity
```javascript
// Test jump mechanics:
- [ ] Press ↑/Space/W → player jumps
- [ ] Jump height matches job.jumpPower
- [ ] Gravity pulls player down (0.6 per frame)
- [ ] Player lands on platform
- [ ] Can't double jump (isJumping prevents)
- [ ] Can move left/right while airborne

// Expected behavior per job:
- Warrior: jumpPower -13 (medium)
- Thief: jumpPower -14 (highest)
- Archer: jumpPower -13 (medium)
```

### 2.3 Platform Collision
```javascript
// Test all 7 platforms:
- [ ] Player lands on ground platform (y=500)
- [ ] Player lands on elevated platforms
- [ ] Player doesn't fall through platforms
- [ ] Player can jump between platforms
- [ ] Edge detection works (doesn't stick to edges)

// Platforms to test:
Platform 1: { x: 0, y: 500, width: 1000, height: 100 }    // Ground
Platform 2: { x: 150, y: 400, width: 150, height: 20 }     // Left mid
Platform 3: { x: 420, y: 350, width: 160, height: 20 }     // Center mid
Platform 4: { x: 700, y: 400, width: 150, height: 20 }     // Right mid
Platform 5: { x: 50, y: 280, width: 120, height: 20 }      // Top left
Platform 6: { x: 550, y: 250, width: 120, height: 20 }     // Top center
Platform 7: { x: 820, y: 280, width: 120, height: 20 }     // Top right
```

**Expected Result:**
```
✅ Player can move left/right smoothly
✅ Player can jump and land on all platforms
✅ No clipping through platforms
✅ Physics feel responsive and accurate
```

---

## 🎮 Phase 3: Combat System - Basic Attack

### 3.1 Warrior Basic Attack (A key)
```javascript
// Test warrior sword slash:
- [ ] Press A → sword slash animation plays
- [ ] Attack cooldown: 28 frames (~0.47 seconds)
- [ ] Damage: 1.4x base attack
- [ ] Range: 75 pixels
- [ ] Knockback effect on monsters
- [ ] Can attack left and right
- [ ] Can't attack during cooldown

// Visual effects:
- [ ] 'swordSlash' effect appears at attack position
- [ ] Effect faces correct direction
- [ ] Effect lasts ~200ms (animDuration)
```

### 3.2 Thief Basic Attack (A key)
```javascript
// Test thief dagger strikes:
- [ ] Press A → double dagger slash (2 hits)
- [ ] Attack cooldown: 10 frames (~0.17 seconds) - very fast!
- [ ] Damage: 0.4x base attack per hit (total 0.8x)
- [ ] Range: 50 pixels (shorter than warrior)
- [ ] Can spam attack quickly
- [ ] Both hits register damage

// Visual effects:
- [ ] 'daggerSlash' effect appears twice
- [ ] Purple/pink color theme
```

### 3.3 Archer Basic Attack (A key)
```javascript
// Test archer arrow shot:
- [ ] Press A → arrow projectile fires
- [ ] Attack cooldown: 18 frames (~0.3 seconds)
- [ ] Damage: 1.0x base attack
- [ ] Arrow flies in direction player faces
- [ ] Arrow has gravity (vy increases)
- [ ] Arrow disappears on hit or off-screen

// Projectile behavior:
- [ ] Arrow spawns at player position
- [ ] Flies at constant horizontal speed
- [ ] Falls due to gravity (realistic arc)
- [ ] Hits monsters in path
- [ ] Disappears after hitting 1 monster (unless Soul buff)
```

**Expected Result:**
```
✅ All 3 jobs can attack with A key
✅ Attack animations/effects display correctly
✅ Cooldowns work properly (can't spam beyond limit)
✅ Damage is dealt to monsters in range
```

---

## 🎮 Phase 4: Skills System

### 4.1 Warrior Skills
```javascript
// Z - Power Strike (파워 스트라이크)
- [ ] Costs 5 MP → MP bar decreases
- [ ] Cooldown: 30 frames (~0.5 seconds)
- [ ] Damage: 2.8x base attack (high burst)
- [ ] Knockback: true (monsters pushed back)
- [ ] Visual: Large impact explosion
- [ ] Can't use if MP < 5

// X - Slash Blast (슬래시 블래스트)
- [ ] Costs 10 MP
- [ ] Cooldown: 90 frames (~1.5 seconds)
- [ ] Damage: 1.5x base attack
- [ ] Range: 150 pixels (wide AOE)
- [ ] Visual: Wave projectile effect
- [ ] Hits multiple monsters

// C - Rage (레이지) - BUFF
- [ ] Costs 15 MP
- [ ] Cooldown: 600 frames (~10 seconds)
- [ ] Duration: 600 frames (~10 seconds)
- [ ] Effect: Attack x1.5 bonus
- [ ] Buff icon appears in buff bar
- [ ] Red aura surrounds player
- [ ] Timer counts down in buff icon
```

### 4.2 Thief Skills
```javascript
// Z - Triple Stab (삼중 스탭)
- [ ] Costs 5 MP
- [ ] Cooldown: 35 frames (~0.58 seconds)
- [ ] Damage: 1.4x per hit x3 hits = 4.2x total
- [ ] Visual: 3 rapid slash effects
- [ ] Fast animation

// X - Assassinate (어쌔시네이트)
- [ ] Costs 12 MP
- [ ] Cooldown: 120 frames (~2 seconds)
- [ ] Damage: 4.5x base attack (massive single hit)
- [ ] Backstab: true (bonus from behind?)
- [ ] Visual: Dark purple explosion
- [ ] High crit chance

// C - Haste (헤이스트) - BUFF
- [ ] Costs 10 MP
- [ ] Cooldown: 480 frames (~8 seconds)
- [ ] Duration: 600 frames (~10 seconds)
- [ ] Effect: Speed x1.5 bonus
- [ ] Buff icon appears in buff bar
- [ ] Blue speed lines around player
- [ ] Player moves noticeably faster
```

### 4.3 Archer Skills
```javascript
// Z - Double Shot (더블 샷)
- [ ] Costs 3 MP
- [ ] Cooldown: 20 frames (~0.33 seconds)
- [ ] Damage: 1.8x per arrow x2 arrows = 3.6x total
- [ ] Spread: true (arrows go slightly different angles)
- [ ] 2 arrow projectiles fire simultaneously
- [ ] Each arrow can hit different targets

// X - Arrow Rain (애로우 레인)
- [ ] Costs 15 MP
- [ ] Cooldown: 150 frames (~2.5 seconds)
- [ ] Damage: 1.0x per arrow (multiple arrows)
- [ ] Visual: Arrows fall from sky in area
- [ ] AOE effect (hits all monsters in area)
- [ ] Spectacular visual effect

// C - Soul Arrow (소울 애로우) - BUFF
- [ ] Costs 8 MP
- [ ] Cooldown: 420 frames (~7 seconds)
- [ ] Duration: 600 frames (~10 seconds)
- [ ] Effect: Piercing = true (arrows go through enemies)
- [ ] Buff icon appears in buff bar
- [ ] Golden glow around player
- [ ] Basic attack arrows pierce multiple enemies
```

### 4.4 Skill Bar UI Test
```javascript
// Visual feedback:
- [ ] Skill icons display in skill bar
- [ ] Cooldown overlay appears when skill used
- [ ] Cooldown timer counts down visually
- [ ] "Ready" animation when cooldown ends
- [ ] Skill slot shakes if not enough MP
- [ ] Can see which skills are ready at a glance
```

**Expected Result:**
```
✅ All 9 skills work correctly (3 per job x 3 jobs)
✅ MP costs deduct properly
✅ Cooldowns prevent spam
✅ Buffs activate and show in buff bar
✅ Damage/effects match specifications
✅ Skill bar UI provides clear feedback
```

---

## 🎮 Phase 5: Monster Combat & Leveling

### 5.1 Monster Spawning
```javascript
// Test monster spawn system:
- [ ] Monsters spawn every 2.5 seconds initially
- [ ] Spawn rate increases with player level
- [ ] Different monster types appear:
  - Level 1-5: Slimes (green)
  - Level 6-15: Mushrooms (red)
  - Level 16-30: Stumps (brown)
  - Level 31+: Mix of all types

// Monster behavior:
- [ ] Monsters move toward player (AI)
- [ ] Monsters can jump to reach player
- [ ] Monsters deal damage on contact
- [ ] Player becomes invincible for 1 second after hit
- [ ] Player HP decreases when hit
```

### 5.2 Damage System
```javascript
// Test damage calculation:
- [ ] Player attack + job.baseAttack = total damage
- [ ] Critical hits deal 1.5x damage
- [ ] Crit chance = player.critChance% (10-25% by job)
- [ ] Damage numbers appear above monsters
- [ ] Crit damage shows in yellow/gold
- [ ] Normal damage shows in white

// Kill mechanics:
- [ ] Monster HP reaches 0 → dies
- [ ] Death particle effect plays
- [ ] Meso (coin) drops from monster
- [ ] EXP awarded to player
- [ ] Kill count increases
```

### 5.3 Experience & Leveling
```javascript
// Test EXP system:
- [ ] Killing monster grants EXP
- [ ] EXP bar fills up
- [ ] Level up when EXP >= expToLevel
- [ ] "LEVEL UP!" text appears (center screen)
- [ ] Stat gain text shows below (+HP, +MP, +ATK)
- [ ] Player stats increase:
  - HP: +job.hpPerLevel
  - MP: +job.mpPerLevel
  - Attack: +job.attackPerLevel
- [ ] HP and MP refill to max
- [ ] EXP bar resets
- [ ] Next level requires more EXP

// Leveling progression:
- [ ] Level 1→2: 100 EXP needed
- [ ] Each level increases EXP requirement
- [ ] Test levels 1-10 progression
```

### 5.4 Meso Collection
```javascript
// Test coin drops:
- [ ] Coins drop from killed monsters
- [ ] Coins bounce with physics
- [ ] Player collects coins by touching them
- [ ] Collection particle effect plays
- [ ] Meso count increases
- [ ] Coins disappear after collection
```

**Expected Result:**
```
✅ Monsters spawn and approach player
✅ Combat deals correct damage
✅ Monsters die and drop rewards
✅ EXP system works and triggers level ups
✅ Stats increase properly on level up
✅ Meso collection functions
```

---

## 🎮 Phase 6: Advanced Combat Scenarios

### 6.1 Combo System
```javascript
// Test combo mechanics:
- [ ] Multiple hits within 2 seconds = combo
- [ ] Combo counter appears and increments
- [ ] Combo counter position shifts per hit
- [ ] Combo resets after 2 seconds no hit
- [ ] High combos feel satisfying
```

### 6.2 Hit Effects
```javascript
// Test visual feedback:
- [ ] Screen shake on strong hits
- [ ] Hit-stop (frame freeze) on critical
- [ ] Particle effects on impact
- [ ] Monster knockback animation
- [ ] Sound would play here (future)
```

### 6.3 Multiple Monster Combat
```javascript
// Test fighting 3+ monsters:
- [ ] AOE skills hit multiple targets
- [ ] Individual damage numbers for each
- [ ] Can kite monsters around platforms
- [ ] Invincibility prevents multi-hit death
- [ ] Crowd control feels manageable
```

**Expected Result:**
```
✅ Combo system tracks consecutive hits
✅ Visual effects enhance combat feel
✅ Can handle multiple monsters simultaneously
✅ Game feel is satisfying and responsive
```

---

## 🎮 Phase 7: Buff System Integration

### 7.1 Buff Activation
```javascript
// Test buff lifecycle:
- [ ] Press C key → buff activates
- [ ] MP cost deducted
- [ ] Buff icon appears in buff bar
- [ ] Activation particle effect plays
- [ ] Buff timer starts counting down
- [ ] Multiple buffs don't stack (same type)
```

### 7.2 Buff Effects
```javascript
// Test each buff:
- [ ] Rage: Attack damage visibly higher
- [ ] Haste: Movement speed noticeably faster
- [ ] Soul Arrow: Arrows pierce multiple enemies

// Buff UI:
- [ ] Timer displays remaining seconds
- [ ] Timer color: white → yellow (warning) → red (critical)
- [ ] Red timer blinks when <5 seconds
- [ ] Buff icon disappears when expired
```

**Expected Result:**
```
✅ All buffs activate and function correctly
✅ Buff durations are accurate
✅ Buff UI provides clear feedback
✅ Buffs expire properly
```

---

## 🎮 Phase 8: Performance & Stability

### 8.1 Performance Test
```javascript
// Measure game performance:
- [ ] Open DevTools Performance tab
- [ ] Play for 2 minutes
- [ ] Check FPS (should be ~60 FPS)
- [ ] Check frame drops (should be minimal)
- [ ] Memory usage stable (no leaks)
- [ ] CPU usage reasonable (<50%)

// Stress test:
- [ ] Spawn 10+ monsters
- [ ] Use all skills rapidly
- [ ] Check game remains smooth
```

### 8.2 Long Session Test
```javascript
// Test 5+ minute session:
- [ ] Play from Level 1 to Level 10+
- [ ] No memory leaks
- [ ] No performance degradation
- [ ] Arrays don't grow unbounded
- [ ] Game remains stable
```

### 8.3 Error Handling
```javascript
// Test edge cases:
- [ ] MP reaches 0 → can't use skills
- [ ] HP reaches 0 → (currently no death, test behavior)
- [ ] Player falls off screen → (teleport back?)
- [ ] Browser tab switch → game pauses or continues?
- [ ] Console has no errors during gameplay
```

### 8.4 Import Path Regression Test
```javascript
// Verify module imports remain correct after changes:
- [ ] Run automated import path verification script
- [ ] Check all src/**/*.js files for import statements
- [ ] Validate each import resolves to actual file
- [ ] Test that no 404 errors appear in Network tab
- [ ] Verify no circular dependencies
- [ ] Check barrel files (if used) export correctly

// Common import issues to detect:
- Wrong relative path depth (../../ vs ../../../)
- Importing from old locations (systems/, entities/, rendering/)
- Missing file extensions (.js)
- Case sensitivity mismatches (Effect.js vs effect.js)
- Importing non-existent exports

// Automated verification command:
Use the general-purpose Task agent with prompt:
"Verify all import paths in src/ are correct and point to existing files"
```

**Expected Result:**
```
✅ Solid 60 FPS throughout
✅ No memory leaks in 5+ minute session
✅ No console errors
✅ Edge cases handled gracefully
✅ All import paths verified correct
✅ No module loading errors
```

---

## 🎮 Phase 9: Cross-Job Comparison

### 9.1 Play Each Job for 2 Minutes
```javascript
// Warrior session:
- [ ] Feels tanky (high HP)
- [ ] Slower movement
- [ ] Melee range limits mobility
- [ ] Rage buff noticeable
- [ ] Knockback useful for control

// Thief session:
- [ ] Very fast movement
- [ ] Rapid attacks feel satisfying
- [ ] Low HP means careful play
- [ ] Haste makes even faster
- [ ] Assassinate huge burst damage

// Archer session:
- [ ] Ranged safety advantage
- [ ] Arrow trajectory feels good
- [ ] Double Shot useful
- [ ] Arrow Rain impressive AOE
- [ ] Soul Arrow piercing is powerful
```

**Expected Result:**
```
✅ Each job feels distinct
✅ Balance seems reasonable
✅ All jobs are playable and fun
✅ No job is obviously broken/useless
```

---

## 🎮 Phase 10: Final Integration Check

### 10.1 Complete Playthrough
```
1. Start game
2. Select job (any)
3. Move around all platforms
4. Kill 10 monsters
5. Level up at least once
6. Use all 4 skills (A, Z, X, C)
7. Activate buff and maintain it
8. Collect meso drops
9. Reach level 5+
10. Verify no bugs occurred
```

### 10.2 Save Game State (Future)
```javascript
// Not implemented yet, but test readiness:
- [ ] player object has all saveable data
- [ ] Level, HP, MP, EXP, kills, meso tracked
- [ ] Could serialize to JSON
- [ ] Could restore from save
```

---

## 📊 Test Report Format

After completing all phases, provide this summary:

```markdown
# Integration Test Report - MapleQuest RPG

**Date:** [timestamp]
**Test Duration:** [X minutes]
**Jobs Tested:** [Warrior/Thief/Archer]

## ✅ Passed (Green)
- Job selection: ✅ All 3 jobs work
- Movement: ✅ Smooth and responsive
- Combat: ✅ All attacks and skills functional
- Leveling: ✅ EXP and level up working
- Buffs: ✅ All buffs activate correctly
- Performance: ✅ Stable 60 FPS
- UI: ✅ All elements render properly

## ⚠️ Warnings (Yellow)
- [List any minor issues found]
- Example: "HP bar flickers at exactly 0 HP"

## ❌ Failures (Red)
- [List any broken features]
- Example: "Archer Soul Arrow doesn't pierce"

## 📊 Performance Metrics
- Average FPS: [XX.X]
- Memory usage: [XX MB]
- Console errors: [X count]
- Crash count: [0]

## 🎮 Gameplay Feel
- Controls: [Responsive/Laggy/Buggy]
- Combat: [Satisfying/Dull/Broken]
- Progression: [Rewarding/Grindy/Too fast]
- Balance: [Good/Needs work]

## 🐛 Bugs Found
1. [Bug description + steps to reproduce]
2. [Bug description + steps to reproduce]

## ✨ Recommendations
1. [Improvement suggestion]
2. [Feature request]
3. [Balance suggestion]

## Conclusion
[Overall assessment: Ready for Phase 2? Needs fixes? Critical issues?]
```

---

## Testing Commands

```bash
# Start server
cd C:\claude-code\game
python -m http.server 8000

# Open browser
start "" "http://localhost:8000"

# Check console
F12 → Console tab

# Monitor performance
F12 → Performance tab → Record
```

---

## Success Criteria

The game passes integration testing if:

✅ **All 3 jobs are fully playable**
✅ **No game-breaking bugs**
✅ **60 FPS maintained**
✅ **All core systems work together** (movement + combat + leveling + UI)
✅ **Can play from Level 1 to Level 10 without issues**
✅ **Player experience is smooth and enjoyable**

If any critical system fails, report it immediately and suggest fixes.
