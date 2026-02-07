# UI Test Skill

Test the MapleQuest RPG UI components and user interactions.

## Instructions

When the user invokes this skill (via `/ui-test` command), perform comprehensive UI testing:

### 1. Visual Components Test

**Job Selection Screen:**
- [ ] Verify all 3 job cards (Warrior, Thief, Archer) are rendered
- [ ] Check hover effects work (translateY animation, border color change)
- [ ] Verify job icons and stats are displayed correctly
- [ ] Test click handlers work (job selection triggers game start)

**HUD (Heads-Up Display):**
- [ ] HP bar renders and fills correctly (gradient red)
- [ ] MP bar renders and fills correctly (gradient blue)
- [ ] EXP bar renders and fills correctly (gradient green)
- [ ] Level, job name, and job icon display
- [ ] Attack, crit chance, and kill count update
- [ ] HP bar pulses when below 30% (danger animation)

**Skill Bar:**
- [ ] 4 skill slots render (A, Z, X, C keys)
- [ ] Skill icons display correctly for each job
- [ ] Cooldown overlay appears when skill is used
- [ ] Cooldown timer counts down visually
- [ ] "Ready" animation plays when cooldown finishes
- [ ] Skill slots shake when not enough MP

**Buff Bar:**
- [ ] Buff icons appear when buffs are active
- [ ] Buff timers count down correctly
- [ ] Timer color changes: white → warning (yellow) → critical (red)
- [ ] Buff icons disappear when duration ends

**Canvas Rendering:**
- [ ] Player character renders (current: basic shapes)
- [ ] Monsters render with correct colors per type
- [ ] Platforms render with grass texture
- [ ] Background gradient and stars render
- [ ] Minimap renders in top-right corner
- [ ] Effects and particles render correctly

### 2. Interaction Test

**Keyboard Input:**
- [ ] Arrow keys (←→) move player left/right
- [ ] Up arrow / Space / W makes player jump
- [ ] A key triggers basic attack
- [ ] Z/X/C keys trigger skills (if MP available)
- [ ] Multiple keys work simultaneously (move + jump)

**Game State Transitions:**
- [ ] Job selection → Game start transition
- [ ] Controls fade out after 3 seconds
- [ ] Level up screen appears with animation
- [ ] Stat gain text displays on level up

**Visual Effects:**
- [ ] Damage numbers appear above monsters
- [ ] EXP text appears when monster dies
- [ ] Coins drop and animate
- [ ] Attack effects match job type
- [ ] Screen shake on critical hits
- [ ] Combo counter updates and fades

### 3. Responsive Behavior

**Performance:**
- [ ] Game runs at ~60 FPS
- [ ] No visual glitches or flickering
- [ ] Animations are smooth
- [ ] No lag when many entities on screen

**Edge Cases:**
- [ ] UI doesn't break at low HP/MP
- [ ] Buffs don't overlap incorrectly
- [ ] Skill bar handles cooldowns properly
- [ ] Level up animation doesn't block gameplay

## Testing Steps

1. **Open the game** via `http://localhost:8000` or `game.html`
2. **Inspect job selection screen** - verify all cards render
3. **Select each job** (Warrior, Thief, Archer) and verify HUD updates
4. **Test all keyboard inputs** - move, jump, attack, skills
5. **Monitor skill bar** - use skills and verify cooldown UI
6. **Check buff system** - activate buffs (C key) and verify icons
7. **Observe combat effects** - attack monsters, check visual feedback
8. **Test level progression** - kill monsters, trigger level up, verify animation
9. **Check performance** - open DevTools, verify FPS and no errors

## Reporting

After testing, provide a summary:
- ✅ **Working correctly**: [list components]
- ⚠️ **Minor issues**: [list with details]
- ❌ **Broken**: [list with error messages]
- 📊 **Performance**: FPS, console errors, memory usage

## Files to Check

- `index.html` - HTML structure
- `css/style.css` - All UI styles
- `src/ui/hud.js` - HUD update logic
- `src/ui/skillbar.js` - Skill bar rendering
- `src/ui/jobselect.js` - Job selection
- `src/rendering/player.js` - Player visual rendering
- `src/rendering/background.js` - Background rendering
- `src/systems/input.js` - Keyboard input handling
