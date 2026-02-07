# MapleQuest RPG - Modular Structure

## Overview

The game has been successfully refactored from a monolithic 2,459-line `game.html` file into a clean, modular ESM (ES Modules) structure. This makes the codebase more maintainable, testable, and easier to extend.

## File Structure

```
game/
├── index.html              # Main HTML file (loads main.js as module)
├── css/
│   └── style.css          # All game styles
├── data/
│   └── jobs.js            # Job definitions (JOBS constant)
└── src/
    ├── main.js            # Entry point
    ├── state.js           # Shared game state (canvas, ctx, game, player)
    ├── entities/
    │   ├── effect.js      # Effect class (all visual effects)
    │   ├── projectile.js  # Projectile class (arrows)
    │   ├── monster.js     # Monster class (AI, combat, rendering)
    │   └── coin.js        # Coin class (meso drops)
    ├── systems/
    │   ├── combat.js      # Combat system (attacks, skills, particles, damage)
    │   ├── leveling.js    # Level up system
    │   ├── spawning.js    # Monster spawning
    │   ├── movement.js    # Player movement and collision
    │   ├── input.js       # Keyboard input handling
    │   └── gameloop.js    # Main game loop
    ├── rendering/
    │   ├── background.js  # Background and platforms
    │   ├── player.js      # Player character rendering
    │   └── minimap.js     # Minimap rendering
    └── ui/
        ├── hud.js         # HUD updates (HP, MP, EXP, stats)
        ├── skillbar.js    # Skill bar and buff bar UI
        └── jobselect.js   # Job selection screen

```

## Module Dependencies

### Entry Point Flow
```
index.html
  └─> main.js
       ├─> state.js (shared state)
       ├─> entities/effect.js
       ├─> systems/input.js
       ├─> systems/gameloop.js
       └─> ui/jobselect.js
```

### Key Imports
- **state.js**: Exports `canvas`, `ctx`, `game`, `player` - imported by nearly all modules
- **data/jobs.js**: Exports `JOBS` constant - used by combat, UI, and job selection
- **entities/**: Each entity class is self-contained
- **systems/**: Game logic systems with clear responsibilities
- **rendering/**: Drawing functions separated by concern
- **ui/**: UI management and updates

## Running the Game

### Development
```bash
# Windows
start "" "index.html"

# macOS
open index.html

# Linux
xdg-open index.html
```

### Browser Requirements
- Modern browser with ES6 module support
- No build step required - pure ESM

## Key Design Decisions

### 1. Circular Dependency Resolution
- **Problem**: Monster needs Effect class for crit burst, Effect might need game state
- **Solution**: Store Effect class reference in `game.effectClass` in main.js

### 2. Async/Await Removal
- **Original**: Used dynamic imports in Monster.takeDamage()
- **Solution**: Moved particle/damage text creation inline, Coin import uses Promise.then()

### 3. State Management
- **Single source of truth**: `state.js` exports shared state
- **No duplicates**: All modules import from state.js
- **Mutable by design**: Game state is intentionally mutable for performance

### 4. UI Updates
- **Central location**: Game loop handles UI updates after state changes
- **Event-driven**: Only update when necessary (exp changes, level ups)

## Module Responsibilities

### Entities (entities/)
- **Effect**: All visual effects (sword slashes, explosions, buffs, level ups)
- **Projectile**: Arrow projectiles with collision detection
- **Monster**: Enemy AI, movement, combat, rendering
- **Coin**: Meso (currency) drops with physics

### Systems (systems/)
- **combat.js**: Attack logic, skill execution, damage calculation
- **leveling.js**: Experience gain, level ups, stat increases
- **spawning.js**: Monster spawn timing and type selection
- **movement.js**: Player physics and platform collision
- **input.js**: Keyboard event handling
- **gameloop.js**: Main update/render loop

### Rendering (rendering/)
- **background.js**: Sky gradient, stars, platforms
- **player.js**: Character sprite, buffs, shadows
- **minimap.js**: Top-right minimap display

### UI (ui/)
- **hud.js**: Health, mana, exp bars and stats
- **skillbar.js**: Skill cooldown display and buff icons
- **jobselect.js**: Initial job selection screen

## Benefits of Modular Structure

### Maintainability
- Each file has a single, clear purpose
- Easy to locate and fix bugs
- Changes are isolated to specific modules

### Testability
- Individual modules can be tested in isolation
- Mock dependencies easily
- Unit test individual functions

### Extensibility
- New features can be added as new modules
- Existing modules rarely need changes
- Clear interfaces between systems

### Performance
- Browser can cache individual modules
- Only load what's needed
- Easier to identify performance bottlenecks

## Future Improvements

### Possible Enhancements
1. **TypeScript**: Add type safety
2. **Build Step**: Bundle for production with Vite/Rollup
3. **Asset Loading**: Separate sprite/sound loading module
4. **Configuration**: Move magic numbers to config files
5. **Event System**: Replace direct state mutations with events

### Next Development Phases
See `.claude/docs/plan.md` for planned features:
- Phase 1: Bug fixes (Power Strike direction)
- Phase 2: Character sprite animations
- Phase 3: Enhanced backgrounds with parallax
- Phase 4: Multi-map system with camera

## Migration Notes

### What Changed
- Single `game.html` → Multiple modules + `index.html`
- Inline `<style>` → `css/style.css`
- Inline `<script>` → `src/` modules
- Global functions → Module exports
- JOBS constant → `data/jobs.js`

### What Stayed the Same
- Game logic and mechanics unchanged
- Visual style identical
- Performance characteristics similar
- No new dependencies

## Troubleshooting

### Module Loading Errors
- **Issue**: `Uncaught SyntaxError: Cannot use import statement outside a module`
- **Fix**: Ensure `<script type="module" src="src/main.js">` has `type="module"`

### Missing Functions
- **Issue**: `selectJob is not defined`
- **Fix**: Job select onclick handlers use global `selectJob` exported in jobselect.js

### State Not Updating
- **Issue**: Changes not reflected in game
- **Fix**: Ensure all modules import from same `state.js` instance

## Contributing

When adding new features:
1. Determine the appropriate module (entity, system, rendering, or UI)
2. Import only what you need from `state.js`
3. Export functions/classes for use by other modules
4. Avoid circular dependencies
5. Document module purpose at the top of file

---

**Generated**: 2026-02-07
**Lines Reduced**: 2,459 → ~120 per module (average)
**Modules Created**: 18 files
