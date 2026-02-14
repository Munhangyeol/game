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

## 🎯 Comprehensive Test Cases (450+ Tests)

### Phase 2.5 UI Tests (100 tests)

#### Skill Tooltip System (15 tests)
```javascript
- [ ] 1. Tooltip appears on skill hover
- [ ] 2. Tooltip shows skill name
- [ ] 3. Tooltip shows skill icon
- [ ] 4. Tooltip shows damage multiplier
- [ ] 5. Tooltip shows cooldown time
- [ ] 6. Tooltip shows MP cost
- [ ] 7. Tooltip shows skill description
- [ ] 8. Tooltip shows special effects
- [ ] 9. Tooltip position adjusts near edges
- [ ] 10. Tooltip disappears on mouse leave
- [ ] 11. Tooltip works for all skill slots
- [ ] 12. Tooltip works for basic attack
- [ ] 13. Tooltip styling matches theme
- [ ] 14. Tooltip text is readable
- [ ] 15. Tooltip updates when skills change (promotion)
```

#### Character Stat Screen (20 tests)
```javascript
- [ ] 16. I key opens stat screen
- [ ] 17. Stat screen displays center
- [ ] 18. Background overlay darkens game
- [ ] 19. Job icon displays correctly
- [ ] 20. Job name displays
- [ ] 21. Current level displays
- [ ] 22. HP shows current/max
- [ ] 23. MP shows current/max
- [ ] 24. Attack shows with buffs
- [ ] 25. Attack shows base in parentheses
- [ ] 26. Crit chance displays
- [ ] 27. Speed shows with buffs
- [ ] 28. Jump power displays
- [ ] 29. Kill count displays
- [ ] 30. Meso count displays
- [ ] 31. EXP progress displays
- [ ] 32. Play time displays (MM:SS)
- [ ] 33. Close button works
- [ ] 34. I key toggles screen
- [ ] 35. Click background closes screen
```

#### Game Over Screen (15 tests)
```javascript
- [ ] 36. HP 0 triggers game over
- [ ] 37. Game over screen displays
- [ ] 38. Final level shows
- [ ] 39. Total kills show
- [ ] 40. Total meso shows
- [ ] 41. Play time shows
- [ ] 42. Restart button visible
- [ ] 43. Job change button visible
- [ ] 44. R key restarts game
- [ ] 45. J key returns to job select
- [ ] 46. Restart keeps same job
- [ ] 47. Job change resets progress
- [ ] 48. Game state resets properly
- [ ] 49. Skull animation plays
- [ ] 50. Background darkens
```

#### Pause Menu (10 tests)
```javascript
- [ ] 51. ESC key pauses game
- [ ] 52. P key pauses game
- [ ] 53. Pause overlay displays
- [ ] 54. Game loop stops
- [ ] 55. Rendering continues (static)
- [ ] 56. Resume button works
- [ ] 57. Main menu button works
- [ ] 58. ESC toggles pause
- [ ] 59. P toggles pause
- [ ] 60. Confirmation on main menu
```

#### Quest Tracker (15 tests)
```javascript
- [ ] 61. Quest tracker displays top-right
- [ ] 62. Active quest shows
- [ ] 63. Quest icon displays
- [ ] 64. Quest name displays
- [ ] 65. Quest description shows
- [ ] 66. Progress bar renders
- [ ] 67. Progress text shows (X/Y)
- [ ] 68. Progress bar fills correctly
- [ ] 69. Rewards display
- [ ] 70. EXP reward shown
- [ ] 71. Meso reward shown
- [ ] 72. Tracker updates real-time
- [ ] 73. Completion notification
- [ ] 74. Next quest appears
- [ ] 75. No quest hides tracker
```

#### Chat Log (10 tests)
```javascript
- [ ] 76. Chat log displays bottom-left
- [ ] 77. Last 5 messages show
- [ ] 78. Timestamps display
- [ ] 79. Icons display per type
- [ ] 80. Kill messages log
- [ ] 81. Level up messages log
- [ ] 82. Quest messages log
- [ ] 83. Purchase messages log
- [ ] 84. Messages fade after 5s
- [ ] 85. Opacity transitions smooth
```

#### Shop UI (10 tests)
```javascript
- [ ] 86. S key opens shop
- [ ] 87. Shop displays centered
- [ ] 88. Current meso shows
- [ ] 89. 4 items display
- [ ] 90. HP potion (50 meso)
- [ ] 91. MP potion (30 meso)
- [ ] 92. Super HP (150 meso)
- [ ] 93. Super MP (100 meso)
- [ ] 94. Buy buttons work
- [ ] 95. Insufficient meso disables button
```

#### Achievement Notifications (5 tests)
```javascript
- [ ] 96. Achievement unlocks show
- [ ] 97. Notification center-top
- [ ] 98. Trophy icon displays
- [ ] 99. Achievement name shows
- [ ] 100. Notification fades out
```

---

### Phase 4-5 Tests (50 tests)

#### Tier 2 Warrior Skills (10 tests)
```javascript
- [ ] 101. Dark Strike (다크 스트라이크) works
- [ ] 102. Dark Strike costs 10 MP
- [ ] 103. Dark Strike damage 4.5x
- [ ] 104. Pierce effect works
- [ ] 105. Blood Blade (혈의 날) works
- [ ] 106. Blood Blade costs 18 MP
- [ ] 107. Blood Blade range 200px
- [ ] 108. Hits 5 enemies
- [ ] 109. Berserker buff (분노의 기사) activates
- [ ] 110. Berserker attack x1.8
```

#### Tier 3 Warrior Skills (10 tests)
```javascript
- [ ] 111. Hero Strike (영웅의 강타) works
- [ ] 112. Hero Strike costs 15 MP
- [ ] 113. Hero Strike damage 6.0x
- [ ] 114. Knockback + shockwave
- [ ] 115. Giant Rampage (거인의 난타) works
- [ ] 116. Giant Rampage range 250px
- [ ] 117. Hits 8 enemies
- [ ] 118. Heroic Will buff activates
- [ ] 119. Heroic Will attack x2.0
- [ ] 120. Defense 50% buff applies
```

#### Tier 2-3 Thief Skills (10 tests)
```javascript
- [ ] 121. Poison Stab (독의 스탭) works
- [ ] 122. Poison damage over time
- [ ] 123. Deadly Blow (치명의 일격) works
- [ ] 124. Deadly Blow damage 7.0x
- [ ] 125. Crit boost +30%
- [ ] 126. Backstab boost x3
- [ ] 127. Hundred Daggers (백개 단검) works
- [ ] 128. 10 rapid hits
- [ ] 129. Soul Strike (영혼의 일격) works
- [ ] 130. Guaranteed critical hit
```

#### Tier 2-3 Archer Skills (10 tests)
```javascript
- [ ] 131. Wind Shot (바람의 샷) works
- [ ] 132. 5 arrows fire rapidly
- [ ] 133. Enhanced Rain (강화 레인) works
- [ ] 134. 30 arrows fall
- [ ] 135. Damage increase 1.5x
- [ ] 136. Infinite Shot (무한의 샷) works
- [ ] 137. 8 piercing arrows
- [ ] 138. All Day Rain (종일 화살비) works
- [ ] 139. 50 arrows over 3 seconds
- [ ] 140. Archer Soul buff x2.2 attack
```

#### New Monster Types (10 tests)
```javascript
- [ ] 141. Fire Bug spawns at Lv15+
- [ ] 142. Fire Bug emoji renders (🔥🐛)
- [ ] 143. Fire Bug has high HP
- [ ] 144. Fire Bug fire damage
- [ ] 145. Rock Whale spawns at Lv35+
- [ ] 146. Rock Whale emoji renders (🐳🪨)
- [ ] 147. Rock Whale very tanky
- [ ] 148. Ancient Dragon spawns at Lv60+
- [ ] 149. Ancient Dragon emoji renders (🐉)
- [ ] 150. Ancient Dragon boss-tier stats
```

---

### Combat System Tests (50 tests)

#### Damage Calculation (10 tests)
```javascript
- [ ] 151. Base damage = attack × multiplier
- [ ] 152. Critical hit x1.5 damage
- [ ] 153. Backstab x2.0 damage
- [ ] 154. Rage buff increases damage
- [ ] 155. Holy Light buff increases damage
- [ ] 156. Berserker buff x1.8 damage
- [ ] 157. Multiple buffs stack
- [ ] 158. Damage numbers display
- [ ] 159. Crit numbers larger
- [ ] 160. Backstab purple color
```

#### Combo System (10 tests)
```javascript
- [ ] 161. Combo starts on first hit
- [ ] 162. Combo increments per hit
- [ ] 163. Combo display top-right
- [ ] 164. 1-9 combo white
- [ ] 165. 10-29 combo orange
- [ ] 166. 30+ combo red
- [ ] 167. Combo resets after 1s
- [ ] 168. Pulse animation
- [ ] 169. EXCELLENT at 50 combo
- [ ] 170. Combo tracked for quests
```

#### Screen Effects (10 tests)
```javascript
- [ ] 171. Screen shake on crit
- [ ] 172. Shake intensity varies
- [ ] 173. Hit-stop on crit (3 frames)
- [ ] 174. Crit burst effect
- [ ] 175. Star particles
- [ ] 176. Lightning effect
- [ ] 177. HP bar pulse at ≤30%
- [ ] 178. Invincibility blink
- [ ] 179. Trail effect on Haste
- [ ] 180. Shadow effect under player
```

#### Projectile System (10 tests)
```javascript
- [ ] 181. Arrows fire correctly
- [ ] 182. Arrow gravity applies
- [ ] 183. Arrow arc realistic
- [ ] 184. Arrows hit monsters
- [ ] 185. Arrows cleanup on hit
- [ ] 186. Arrows cleanup off-screen
- [ ] 187. Multiple arrows tracked
- [ ] 188. Piercing arrows work
- [ ] 189. Explosive arrows blast
- [ ] 190. Arrow rain spawns correctly
```

#### Knockback & Control (10 tests)
```javascript
- [ ] 191. Power Strike knockback
- [ ] 192. Knockback distance varies
- [ ] 193. Knockback direction correct
- [ ] 194. Monsters pushed back
- [ ] 195. Hero Strike shockwave
- [ ] 196. Giant Rampage AOE
- [ ] 197. Slash Blast wave
- [ ] 198. Blood Blade range
- [ ] 199. Multiple enemies hit
- [ ] 200. Crowd control feels good
```

---

### Leveling & Progression Tests (50 tests)

#### EXP System (10 tests)
```javascript
- [ ] 201. EXP awarded on kill
- [ ] 202. EXP scales with level diff
- [ ] 203. Lower level = less EXP
- [ ] 204. Higher level = more EXP
- [ ] 205. EXP multiplier 0.3-2.0x
- [ ] 206. EXP bar fills
- [ ] 207. EXP text displays
- [ ] 208. Quest EXP adds
- [ ] 209. EXP requirement increases x1.5
- [ ] 210. Level 1→2 needs 100 EXP
```

#### Level Up (10 tests)
```javascript
- [ ] 211. Level up at EXP threshold
- [ ] 212. "LEVEL UP! Lv.X" text
- [ ] 213. Level number updates
- [ ] 214. Stat gain text shows
- [ ] 215. HP increases correctly
- [ ] 216. MP increases correctly
- [ ] 217. Attack increases correctly
- [ ] 218. Crit +0.5% per level
- [ ] 219. HP refills to max
- [ ] 220. MP refills to max
```

#### Promotion System (15 tests)
```javascript
- [ ] 221. Level 10 triggers tier 1
- [ ] 222. Level 30 triggers tier 2
- [ ] 223. Level 70 triggers tier 3
- [ ] 224. Promotion popup displays
- [ ] 225. Golden pillar effect
- [ ] 226. 100 golden particles
- [ ] 227. New job name shows
- [ ] 228. New job icon shows
- [ ] 229. Stat bonus displays
- [ ] 230. New skills list shows
- [ ] 231. Skill bar updates
- [ ] 232. HUD updates
- [ ] 233. Chat log message
- [ ] 234. Quest progress updates
- [ ] 235. Popup auto-closes
```

#### Stat Growth (15 tests)
```javascript
- [ ] 236. Warrior HP +30/level
- [ ] 237. Warrior MP +5/level
- [ ] 238. Warrior ATK +7/level
- [ ] 239. Thief HP +20/level
- [ ] 240. Thief MP +8/level
- [ ] 241. Thief ATK +5/level
- [ ] 242. Archer HP +15/level
- [ ] 243. Archer MP +7/level
- [ ] 244. Archer ATK +8/level
- [ ] 245. Tier 1 bonus applies
- [ ] 246. Tier 2 bonus applies
- [ ] 247. Tier 3 bonus applies
- [ ] 248. Stats display correctly
- [ ] 249. Stat screen accurate
- [ ] 250. Can reach level 100+
```

---

### Quest System Tests (30 tests)

#### Quest Types (10 tests)
```javascript
- [ ] 251. Slime Hunter quest
- [ ] 252. Kill 10 slimes
- [ ] 253. Monster Slayer quest
- [ ] 254. Kill 50 any monsters
- [ ] 255. Novice Adventurer quest
- [ ] 256. Reach level 5
- [ ] 257. Critical Master quest
- [ ] 258. 20 critical hits
- [ ] 259. First Promotion quest
- [ ] 260. Complete first promotion
```

#### Quest Flow (10 tests)
```javascript
- [ ] 261. First quest auto-accepts
- [ ] 262. Progress tracks real-time
- [ ] 263. Completion at 100%
- [ ] 264. Rewards granted
- [ ] 265. EXP reward adds
- [ ] 266. Meso reward adds
- [ ] 267. Next quest auto-accepts
- [ ] 268. Quest order correct
- [ ] 269. All 6 quests completable
- [ ] 270. Quest log messages
```

#### Quest UI (10 tests)
```javascript
- [ ] 271. Tracker always visible
- [ ] 272. Icon displays
- [ ] 273. Name truncates if long
- [ ] 274. Description clear
- [ ] 275. Progress bar smooth
- [ ] 276. Percentage accurate
- [ ] 277. Rewards formatted nicely
- [ ] 278. Completion animation
- [ ] 279. New quest notification
- [ ] 280. Quest complete notification
```

---

### Shop System Tests (25 tests)

#### Shop Access (5 tests)
```javascript
- [ ] 281. S key opens shop
- [ ] 282. ESC closes shop
- [ ] 283. S key toggles shop
- [ ] 284. Background click closes
- [ ] 285. Can't use during combat
```

#### Shop Items (10 tests)
```javascript
- [ ] 286. HP Potion 50 meso
- [ ] 287. HP Potion heals 50% HP
- [ ] 288. MP Potion 30 meso
- [ ] 289. MP Potion heals 50% MP
- [ ] 290. Super HP 150 meso
- [ ] 291. Super HP heals 100% HP
- [ ] 292. Super MP 100 meso
- [ ] 293. Super MP heals 100% MP
- [ ] 294. All items display
- [ ] 295. Icons render correctly
```

#### Shop Purchase (10 tests)
```javascript
- [ ] 296. Buy button enabled if affordable
- [ ] 297. Buy button disabled if not
- [ ] 298. Click deducts meso
- [ ] 299. Healing applies immediately
- [ ] 300. Heal text displays
- [ ] 301. Chat log shows purchase
- [ ] 302. Shop UI updates
- [ ] 303. Can't buy with 0 meso
- [ ] 304. Can spam buy if rich
- [ ] 305. HP can't exceed max
```

---

### Achievement System Tests (25 tests)

#### Achievement Types (10 tests)
```javascript
- [ ] 306. First Kill unlocks
- [ ] 307. Slayer (100 kills)
- [ ] 308. Massacre (500 kills)
- [ ] 309. Level 10 achievement
- [ ] 310. Level 30 achievement
- [ ] 311. Crit Master (100 crits)
- [ ] 312. Rich Man (10k meso)
- [ ] 313. Combo God (50 combo)
- [ ] 314. All 8 achievable
- [ ] 315. No duplicates
```

#### Achievement Tracking (10 tests)
```javascript
- [ ] 316. Kills tracked
- [ ] 317. Level checked
- [ ] 318. Crits counted
- [ ] 319. Meso tracked
- [ ] 320. Combo checked
- [ ] 321. Progress persists
- [ ] 322. Unlocked list correct
- [ ] 323. Check every frame
- [ ] 324. No race conditions
- [ ] 325. Multiple unlocks queue
```

#### Achievement UI (5 tests)
```javascript
- [ ] 326. Notification center-top
- [ ] 327. Trophy icon shows
- [ ] 328. Name displays
- [ ] 329. Achievement icon
- [ ] 330. Fades out after 3s
```

---

### Performance Tests (40 tests)

#### Frame Rate (10 tests)
```javascript
- [ ] 331. Maintains 60 FPS
- [ ] 332. No drops idle
- [ ] 333. No drops moving
- [ ] 334. No drops attacking
- [ ] 335. No drops with 10 monsters
- [ ] 336. No drops with effects
- [ ] 337. No drops with particles
- [ ] 338. Stable over 10 minutes
- [ ] 339. DevTools shows 60 FPS
- [ ] 340. Frame time ~16.67ms
```

#### Memory Management (10 tests)
```javascript
- [ ] 341. No memory leaks
- [ ] 342. Arrays cleaned up
- [ ] 343. Projectiles removed
- [ ] 344. Effects removed
- [ ] 345. Particles removed
- [ ] 346. Damage texts removed
- [ ] 347. Dead monsters removed
- [ ] 348. Coins cleanup
- [ ] 349. Memory stable 10+ min
- [ ] 350. No unbounded growth
```

#### CPU Usage (10 tests)
```javascript
- [ ] 351. CPU usage reasonable
- [ ] 352. <50% single core
- [ ] 353. Game loop efficient
- [ ] 354. Render loop optimized
- [ ] 355. No excessive redraws
- [ ] 356. Collision detection fast
- [ ] 357. AI updates efficient
- [ ] 358. No blocking operations
- [ ] 359. Event handlers efficient
- [ ] 360. No infinite loops
```

#### Asset Loading (10 tests)
```javascript
- [ ] 361. All JS modules load
- [ ] 362. CSS loads correctly
- [ ] 363. No 404 errors
- [ ] 364. Load time <2 seconds
- [ ] 365. Module execution order
- [ ] 366. No circular dependencies
- [ ] 367. Import paths correct
- [ ] 368. Data files load
- [ ] 369. No CORS errors
- [ ] 370. Cache works (if enabled)
```

---

### Edge Cases & Stability (50 tests)

#### Boundary Conditions (10 tests)
```javascript
- [ ] 371. HP can't go negative
- [ ] 372. MP can't go negative
- [ ] 373. HP can't exceed max
- [ ] 374. MP can't exceed max
- [ ] 375. EXP overflow handled
- [ ] 376. Level 100+ works
- [ ] 377. Meso 1M+ works
- [ ] 378. Skill spam prevented
- [ ] 379. Buff stack prevented
- [ ] 380. Division by zero protected
```

#### Error Handling (10 tests)
```javascript
- [ ] 381. No console errors idle
- [ ] 382. No errors on attack
- [ ] 383. No errors on skill use
- [ ] 384. No errors on level up
- [ ] 385. No errors on promotion
- [ ] 386. No errors on death
- [ ] 387. No errors on quest
- [ ] 388. No errors on purchase
- [ ] 389. No errors on achievement
- [ ] 390. Graceful degradation
```

#### Stress Tests (10 tests)
```javascript
- [ ] 391. 10 monsters + spam skills
- [ ] 392. Rapid level ups
- [ ] 393. Many projectiles
- [ ] 394. Many particles
- [ ] 395. Many damage texts
- [ ] 396. All buffs active
- [ ] 397. Open all UIs
- [ ] 398. Rapid key presses
- [ ] 399. Tab switch recovery
- [ ] 400. Browser minimize recovery
```

#### Compatibility (10 tests)
```javascript
- [ ] 401. Works in Chrome
- [ ] 402. Works in Firefox
- [ ] 403. Works in Edge
- [ ] 404. ES6 modules supported
- [ ] 405. Canvas 2D supported
- [ ] 406. LocalStorage (if used)
- [ ] 407. Keyboard events work
- [ ] 408. Mouse events work
- [ ] 409. Window resize handled
- [ ] 410. High DPI displays
```

#### Gameplay Polish (10 tests)
```javascript
- [ ] 411. Controls responsive
- [ ] 412. Combat feels satisfying
- [ ] 413. Visual feedback clear
- [ ] 414. Audio cues (if added)
- [ ] 415. UI is intuitive
- [ ] 416. Tooltips helpful
- [ ] 417. Progression rewarding
- [ ] 418. Balance reasonable
- [ ] 419. No tedious grinding
- [ ] 420. Fun to play!
```

---

### Cross-Job Balance Tests (30 tests)

#### Warrior Balance (10 tests)
```javascript
- [ ] 421. Warrior playable 1-70
- [ ] 422. Tanky enough
- [ ] 423. Damage adequate
- [ ] 424. Skills useful
- [ ] 425. Tier progression smooth
- [ ] 426. Not too slow
- [ ] 427. Rage buff impactful
- [ ] 428. Knockback useful
- [ ] 429. Hero tier feels powerful
- [ ] 430. Melee range manageable
```

#### Thief Balance (10 tests)
```javascript
- [ ] 431. Thief playable 1-70
- [ ] 432. Speed advantage clear
- [ ] 433. DPS competitive
- [ ] 434. Fragile but survivable
- [ ] 435. Skills synergize
- [ ] 436. Haste makes faster
- [ ] 437. Backstab rewarding
- [ ] 438. Crit chance high
- [ ] 439. Night Lord powerful
- [ ] 440. Playstyle distinct
```

#### Archer Balance (10 tests)
```javascript
- [ ] 441. Archer playable 1-70
- [ ] 442. Range advantage clear
- [ ] 443. Damage consistent
- [ ] 444. Arrow mechanics fun
- [ ] 445. Skills varied
- [ ] 446. Arrow Rain powerful
- [ ] 447. Piercing useful
- [ ] 448. Bow Master strong
- [ ] 449. Safe playstyle
- [ ] 450. Not boring
```

---

## Success Criteria

The game passes integration testing if:

✅ **450+ tests pass (≥95% success rate)**
✅ **All 3 jobs are fully playable**
✅ **No game-breaking bugs**
✅ **60 FPS maintained**
✅ **All core systems work together** (movement + combat + leveling + UI)
✅ **Can play from Level 1 to Level 70+ without issues**
✅ **Player experience is smooth and enjoyable**
✅ **All Phase 2.5-5 features functional**

## Test Execution

Run tests in this order:
1. Phase 0: Module imports (validate first)
2. Phase 1-3: Core gameplay (movement, combat)
3. Phase 4-5: Advanced features (skills, monsters)
4. Phase 2.5: UI systems (all 9 systems)
5. Performance & edge cases
6. Cross-job balance

If any critical system fails, report it immediately and suggest fixes.


## Save Report 
Save or Update Result of Integration-test at /game/test/통합테스트_보고서.md
