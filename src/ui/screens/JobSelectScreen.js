import { game, player } from '../../core/game/GameState.js';
import { JOBS } from '../../../data/jobs.js';
import { createSkillBar } from '../components/SkillBar.js';
import { updateUI } from '../components/HUD.js';

// 직업 선택
export function selectJob(jobId) {
    const job = JOBS[jobId];
    player.job = jobId;
    player.maxHp = job.baseHp;
    player.hp = job.baseHp;
    player.maxMp = job.baseMp;
    player.mp = job.baseMp;
    player.attack = job.baseAttack;
    player.speed = job.speed;
    player.jumpPower = job.jumpPower;
    player.critChance = job.critChance;

    const jobSelect = document.getElementById('jobSelect');
    const gameUI = document.getElementById('gameUI');
    const controlsUI = document.getElementById('controlsUI');
    const jobName = document.getElementById('jobName');
    const jobIcon = document.getElementById('jobIcon');

    if (jobSelect) jobSelect.style.display = 'none';
    if (gameUI) gameUI.style.display = 'block';
    if (controlsUI) controlsUI.style.display = 'block';
    if (jobName) jobName.textContent = job.name;
    if (jobIcon) jobIcon.textContent = job.icon;

    // 게임 시작 3초 후 컨트롤 설명 페이드아웃
    setTimeout(() => {
        const controls = document.getElementById('controlsUI');
        if (controls) controls.classList.add('fade-out');
    }, 3000);

    createSkillBar();
    updateUI();
    game.started = true;
}

// Setup event listeners for job cards
function setupJobSelectionListeners() {
    const jobCards = document.querySelectorAll('.job-card');
    jobCards.forEach(card => {
        card.addEventListener('click', () => {
            const jobId = card.getAttribute('data-job');
            if (jobId) {
                selectJob(jobId);
            }
        });
    });
}

// Handle both cases: DOM already loaded or still loading
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupJobSelectionListeners);
} else {
    setupJobSelectionListeners();
}
