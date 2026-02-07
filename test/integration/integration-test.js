/**
 * MapleQuest RPG - Integration Test Suite
 *
 * This automated test suite validates all game systems working together.
 * Run this script in the browser console after the game loads.
 *
 * Usage:
 *   1. Open http://localhost:8000 in browser
 *   2. Open DevTools Console (F12)
 *   3. Copy-paste this entire file into console
 *   4. Call: await runIntegrationTests()
 */

class IntegrationTestRunner {
    constructor() {
        this.results = {
            passed: [],
            failed: [],
            warnings: [],
            startTime: Date.now(),
            phases: {}
        };
        this.originalState = null;
    }

    log(message, type = 'info') {
        const prefix = {
            'pass': '✅',
            'fail': '❌',
            'warn': '⚠️',
            'info': '📋',
            'phase': '🎮'
        }[type] || '📋';
        console.log(`${prefix} ${message}`);
    }

    assert(condition, testName, errorMsg = '') {
        if (condition) {
            this.results.passed.push(testName);
            this.log(`PASS: ${testName}`, 'pass');
            return true;
        } else {
            this.results.failed.push({ test: testName, error: errorMsg });
            this.log(`FAIL: ${testName} - ${errorMsg}`, 'fail');
            return false;
        }
    }

    warn(message) {
        this.results.warnings.push(message);
        this.log(`WARNING: ${message}`, 'warn');
    }

    async wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    // Simulate key press
    simulateKey(key, press = true) {
        const event = new KeyboardEvent(press ? 'keydown' : 'keyup', {
            key: key,
            code: key.length === 1 ? `Key${key.toUpperCase()}` : key,
            bubbles: true
        });
        document.dispatchEvent(event);
    }

    async simulateKeyPress(key, duration = 100) {
        this.simulateKey(key, true);
        await this.wait(duration);
        this.simulateKey(key, false);
    }

    // Get game state from global scope
    getGameState() {
        // The game exports these as ES modules, so we need to access them from window
        return {
            game: window.__game || {},
            player: window.__player || {},
            JOBS: window.__JOBS || {}
        };
    }

    // ==================== PHASE 1: INITIALIZATION ====================
    async testPhase1_Initialization() {
        this.log('PHASE 1: Game Initialization & Job Selection', 'phase');
        const phase = { tests: 0, passed: 0 };

        // 1.1 Check HTML elements
        const canvas = document.getElementById('gameCanvas');
        phase.tests++;
        if (this.assert(canvas !== null, 'Canvas element exists')) phase.passed++;

        phase.tests++;
        if (this.assert(canvas.width === 1000 && canvas.height === 600,
            'Canvas dimensions correct (1000x600)')) phase.passed++;

        const jobSelect = document.getElementById('jobSelect');
        phase.tests++;
        if (this.assert(jobSelect !== null, 'Job selection screen exists')) phase.passed++;

        // 1.2 Check job cards
        const jobCards = document.querySelectorAll('.job-card');
        phase.tests++;
        if (this.assert(jobCards.length === 3, 'Three job cards render')) phase.passed++;

        const jobs = ['warrior', 'thief', 'archer'];
        jobs.forEach(job => {
            const card = document.querySelector(`.job-card[data-job="${job}"]`);
            phase.tests++;
            if (this.assert(card !== null, `Job card for ${job} exists`)) phase.passed++;
        });

        this.results.phases['Phase 1'] = phase;
        return phase;
    }

    // ==================== PHASE 2: JOB SELECTION ====================
    async testPhase2_JobSelection(jobName = 'warrior') {
        this.log(`PHASE 2: Job Selection - Testing ${jobName}`, 'phase');
        const phase = { tests: 0, passed: 0 };

        // Click job card
        const jobCard = document.querySelector(`.job-card[data-job="${jobName}"]`);
        if (jobCard) {
            jobCard.click();
            await this.wait(100);
        }

        // Check if game started
        const jobSelect = document.getElementById('jobSelect');
        phase.tests++;
        if (this.assert(jobSelect.style.display === 'none',
            'Job select screen hides after selection')) phase.passed++;

        const gameUI = document.getElementById('gameUI');
        phase.tests++;
        if (this.assert(gameUI.style.display !== 'none',
            'Game UI becomes visible')) phase.passed++;

        const controlsUI = document.getElementById('controlsUI');
        phase.tests++;
        if (this.assert(controlsUI.style.display !== 'none',
            'Controls hint appears')) phase.passed++;

        // Check HUD elements
        const level = document.getElementById('level');
        phase.tests++;
        if (this.assert(level && level.textContent === '1',
            'Level displays as 1')) phase.passed++;

        const skillBar = document.getElementById('skillBar');
        phase.tests++;
        if (this.assert(skillBar && skillBar.children.length === 4,
            'Skill bar shows 4 slots')) phase.passed++;

        this.results.phases['Phase 2'] = phase;
        return phase;
    }

    // ==================== PHASE 3: MOVEMENT ====================
    async testPhase3_Movement() {
        this.log('PHASE 3: Movement & Physics', 'phase');
        const phase = { tests: 0, passed: 0 };

        // Access player state (need to be set by the game)
        const state = this.getGameState();
        const player = state.player;

        if (!player || !player.x) {
            this.warn('Cannot access player state - tests may be incomplete');
            this.results.phases['Phase 3'] = phase;
            return phase;
        }

        const startX = player.x;
        const startY = player.y;

        // Test right movement
        this.simulateKey('ArrowRight', true);
        await this.wait(500);
        this.simulateKey('ArrowRight', false);

        phase.tests++;
        if (this.assert(player.x > startX,
            'Player moves right when ArrowRight pressed')) phase.passed++;

        await this.wait(100);

        // Test left movement
        const midX = player.x;
        this.simulateKey('ArrowLeft', true);
        await this.wait(500);
        this.simulateKey('ArrowLeft', false);

        phase.tests++;
        if (this.assert(player.x < midX,
            'Player moves left when ArrowLeft pressed')) phase.passed++;

        await this.wait(100);

        // Test jump
        const groundY = player.y;
        this.simulateKey('ArrowUp', true);
        await this.wait(50);
        this.simulateKey('ArrowUp', false);
        await this.wait(200);

        phase.tests++;
        if (this.assert(player.y < groundY,
            'Player jumps when ArrowUp pressed')) phase.passed++;

        // Wait for landing
        await this.wait(800);

        phase.tests++;
        if (this.assert(Math.abs(player.y - groundY) < 5,
            'Player lands back on platform')) phase.passed++;

        this.results.phases['Phase 3'] = phase;
        return phase;
    }

    // ==================== PHASE 4: BASIC ATTACK ====================
    async testPhase4_BasicAttack() {
        this.log('PHASE 4: Basic Attack System', 'phase');
        const phase = { tests: 0, passed: 0 };

        const state = this.getGameState();
        const player = state.player;
        const game = state.game;

        if (!player || !game) {
            this.warn('Cannot access game state');
            this.results.phases['Phase 4'] = phase;
            return phase;
        }

        // Test basic attack
        const effectsCount = game.effects ? game.effects.length : 0;

        await this.simulateKeyPress('a', 100);
        await this.wait(100);

        phase.tests++;
        const newEffectsCount = game.effects ? game.effects.length : 0;
        if (this.assert(newEffectsCount > effectsCount,
            'Attack creates visual effect')) phase.passed++;

        // Test cooldown
        await this.simulateKeyPress('a', 50);
        await this.wait(50);

        phase.tests++;
        if (this.assert(player.attackCooldown >= 0,
            'Attack cooldown mechanism exists')) phase.passed++;

        this.results.phases['Phase 4'] = phase;
        return phase;
    }

    // ==================== PHASE 5: SKILLS ====================
    async testPhase5_Skills() {
        this.log('PHASE 5: Skills System', 'phase');
        const phase = { tests: 0, passed: 0 };

        const state = this.getGameState();
        const player = state.player;

        if (!player) {
            this.warn('Cannot access player state');
            this.results.phases['Phase 5'] = phase;
            return phase;
        }

        const startMP = player.mp;

        // Test Skill Z
        await this.simulateKeyPress('z', 100);
        await this.wait(100);

        phase.tests++;
        if (this.assert(player.mp < startMP || player.skillCooldowns[0] > 0,
            'Skill Z uses MP or triggers cooldown')) phase.passed++;

        await this.wait(500);

        // Test Skill X
        const midMP = player.mp;
        await this.simulateKeyPress('x', 100);
        await this.wait(100);

        phase.tests++;
        if (this.assert(player.mp < midMP || player.skillCooldowns[1] > 0,
            'Skill X uses MP or triggers cooldown')) phase.passed++;

        await this.wait(500);

        // Test Buff Skill C
        const beforeBuffMP = player.mp;
        await this.simulateKeyPress('c', 100);
        await this.wait(100);

        phase.tests++;
        if (this.assert(player.mp < beforeBuffMP || Object.keys(player.buffs || {}).length > 0,
            'Buff skill C activates')) phase.passed++;

        const buffBar = document.getElementById('buffBar');
        phase.tests++;
        if (this.assert(buffBar && buffBar.children.length > 0,
            'Buff icon appears in buff bar')) phase.passed++;

        this.results.phases['Phase 5'] = phase;
        return phase;
    }

    // ==================== PHASE 6: MONSTER COMBAT ====================
    async testPhase6_MonsterCombat() {
        this.log('PHASE 6: Monster Combat & Spawning', 'phase');
        const phase = { tests: 0, passed: 0 };

        const state = this.getGameState();
        const game = state.game;

        if (!game) {
            this.warn('Cannot access game state');
            this.results.phases['Phase 6'] = phase;
            return phase;
        }

        // Wait for monster spawn
        this.log('Waiting for monster spawn (3 seconds)...');
        await this.wait(3000);

        phase.tests++;
        const hasMonsters = game.monsters && game.monsters.length > 0;
        if (this.assert(hasMonsters, 'Monsters spawn after delay')) phase.passed++;

        if (hasMonsters) {
            const monster = game.monsters[0];
            phase.tests++;
            if (this.assert(monster.hp > 0, 'Monster has HP')) phase.passed++;

            phase.tests++;
            if (this.assert(monster.x !== undefined && monster.y !== undefined,
                'Monster has position')) phase.passed++;
        }

        this.results.phases['Phase 6'] = phase;
        return phase;
    }

    // ==================== PHASE 7: UI ELEMENTS ====================
    async testPhase7_UI() {
        this.log('PHASE 7: UI Elements', 'phase');
        const phase = { tests: 0, passed: 0 };

        // Check all HUD elements
        const elements = [
            'level', 'hpBar', 'hpText', 'mpBar', 'mpText',
            'expBar', 'expText', 'attack', 'crit', 'kills'
        ];

        elements.forEach(id => {
            const el = document.getElementById(id);
            phase.tests++;
            if (this.assert(el !== null, `HUD element '${id}' exists`)) phase.passed++;
        });

        // Check skill bar slots
        const skillSlots = document.querySelectorAll('.skill-slot');
        phase.tests++;
        if (this.assert(skillSlots.length === 4,
            'Skill bar has 4 slots (A, Z, X, C)')) phase.passed++;

        this.results.phases['Phase 7'] = phase;
        return phase;
    }

    // ==================== PHASE 8: PERFORMANCE ====================
    async testPhase8_Performance() {
        this.log('PHASE 8: Performance Check', 'phase');
        const phase = { tests: 0, passed: 0 };

        // Check for console errors
        const errors = window.__testErrors || [];
        phase.tests++;
        if (this.assert(errors.length === 0,
            `No console errors (found ${errors.length})`)) phase.passed++;

        // Check memory (basic)
        if (performance.memory) {
            const memMB = performance.memory.usedJSHeapSize / 1024 / 1024;
            phase.tests++;
            if (this.assert(memMB < 100,
                `Memory usage reasonable (${memMB.toFixed(1)} MB)`)) phase.passed++;
        }

        this.results.phases['Phase 8'] = phase;
        return phase;
    }

    // ==================== GENERATE REPORT ====================
    generateReport() {
        const duration = ((Date.now() - this.results.startTime) / 1000).toFixed(2);
        const totalTests = this.results.passed.length + this.results.failed.length;
        const passRate = totalTests > 0
            ? ((this.results.passed.length / totalTests) * 100).toFixed(1)
            : 0;

        console.log('\n\n' + '='.repeat(60));
        console.log('📊 INTEGRATION TEST REPORT - MapleQuest RPG');
        console.log('='.repeat(60));
        console.log(`\n⏱️  Duration: ${duration} seconds`);
        console.log(`\n✅ Passed: ${this.results.passed.length}`);
        console.log(`❌ Failed: ${this.results.failed.length}`);
        console.log(`⚠️  Warnings: ${this.results.warnings.length}`);
        console.log(`\n📈 Pass Rate: ${passRate}%`);

        console.log('\n' + '-'.repeat(60));
        console.log('PHASE SUMMARY:');
        console.log('-'.repeat(60));
        Object.entries(this.results.phases).forEach(([name, data]) => {
            const rate = data.tests > 0
                ? ((data.passed / data.tests) * 100).toFixed(0)
                : 0;
            console.log(`${name}: ${data.passed}/${data.tests} (${rate}%)`);
        });

        if (this.results.failed.length > 0) {
            console.log('\n' + '-'.repeat(60));
            console.log('❌ FAILED TESTS:');
            console.log('-'.repeat(60));
            this.results.failed.forEach(fail => {
                console.log(`  • ${fail.test}`);
                if (fail.error) console.log(`    ${fail.error}`);
            });
        }

        if (this.results.warnings.length > 0) {
            console.log('\n' + '-'.repeat(60));
            console.log('⚠️  WARNINGS:');
            console.log('-'.repeat(60));
            this.results.warnings.forEach(warn => {
                console.log(`  • ${warn}`);
            });
        }

        console.log('\n' + '='.repeat(60));

        const overall = this.results.failed.length === 0 ? '✅ PASS' : '❌ FAIL';
        const conclusion = this.results.failed.length === 0
            ? 'All core systems working! Game is ready for Phase 2.'
            : `${this.results.failed.length} critical issues found. Needs fixes.`;

        console.log(`\n${overall} - ${conclusion}`);
        console.log('\n' + '='.repeat(60) + '\n\n');

        return this.results;
    }

    // ==================== RUN ALL TESTS ====================
    async runAll(jobToTest = 'warrior') {
        this.log(`Starting Integration Test Suite for job: ${jobToTest}`, 'info');
        this.log('This will take approximately 20-30 seconds...', 'info');

        try {
            await this.testPhase1_Initialization();
            await this.wait(500);

            await this.testPhase2_JobSelection(jobToTest);
            await this.wait(1000);

            await this.testPhase3_Movement();
            await this.wait(500);

            await this.testPhase4_BasicAttack();
            await this.wait(500);

            await this.testPhase5_Skills();
            await this.wait(500);

            await this.testPhase6_MonsterCombat();
            await this.wait(500);

            await this.testPhase7_UI();
            await this.wait(500);

            await this.testPhase8_Performance();

            return this.generateReport();
        } catch (error) {
            console.error('❌ Test suite crashed:', error);
            this.results.failed.push({
                test: 'Test Suite Execution',
                error: error.message
            });
            return this.generateReport();
        }
    }
}

// Global function to run tests
window.runIntegrationTests = async function(job = 'warrior') {
    // Capture console errors
    window.__testErrors = [];
    const originalError = console.error;
    console.error = function(...args) {
        window.__testErrors.push(args.join(' '));
        originalError.apply(console, args);
    };

    const tester = new IntegrationTestRunner();
    const results = await tester.runAll(job);

    // Restore console.error
    console.error = originalError;

    return results;
};

// Also test all three jobs
window.runAllJobTests = async function() {
    console.log('🎮 Testing all 3 jobs...\n');

    const jobs = ['warrior', 'thief', 'archer'];
    const allResults = {};

    for (const job of jobs) {
        console.log(`\n${'='.repeat(60)}`);
        console.log(`Testing: ${job.toUpperCase()}`);
        console.log('='.repeat(60));

        // Reload page between tests
        if (jobs.indexOf(job) > 0) {
            console.log('Reloading page for next job test...');
            location.reload();
            await new Promise(resolve => setTimeout(resolve, 2000));
        }

        allResults[job] = await runIntegrationTests(job);

        if (jobs.indexOf(job) < jobs.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 2000));
        }
    }

    return allResults;
};

console.log('✅ Integration Test Suite Loaded!');
console.log('');
console.log('Run tests with:');
console.log('  await runIntegrationTests()           // Test warrior');
console.log('  await runIntegrationTests("thief")    // Test thief');
console.log('  await runIntegrationTests("archer")   // Test archer');
console.log('  await runAllJobTests()                // Test all jobs');
console.log('');
