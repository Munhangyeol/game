import { game } from '../../core/game/GameState.js';

let pauseElement = null;

export function initPauseScreen() {
    pauseElement = document.getElementById('pauseScreen');
    if (!pauseElement) {
        pauseElement = document.createElement('div');
        pauseElement.id = 'pauseScreen';
        pauseElement.className = 'pause-screen';
        pauseElement.style.display = 'none';
        document.querySelector('.game-container').appendChild(pauseElement);
    }

    createPauseContent();
}

function createPauseContent() {
    const html = `
        <div class="pause-content">
            <div class="pause-icon">⏸️</div>
            <div class="pause-title">일시정지</div>

            <div class="pause-divider"></div>

            <div class="pause-buttons">
                <button class="pause-btn resume-btn" id="resumeBtn">
                    ▶️ 계속하기 (P)
                </button>
                <button class="pause-btn main-btn" id="mainMenuBtn">
                    🏠 메인으로 (M)
                </button>
            </div>

            <div class="pause-hint">ESC 또는 P키로 닫기</div>
        </div>
    `;

    pauseElement.innerHTML = html;

    // 버튼 이벤트 리스너
    document.getElementById('resumeBtn').addEventListener('click', resumeGame);
    document.getElementById('mainMenuBtn').addEventListener('click', goToMainMenu);
}

export function togglePause() {
    if (!pauseElement) initPauseScreen();

    if (game.paused) {
        resumeGame();
    } else {
        pauseGame();
    }
}

export function pauseGame() {
    if (!game.started) return;
    if (game.paused) return;

    game.paused = true;
    pauseElement.style.display = 'flex';
    console.log('⏸️ Game paused');
}

export function resumeGame() {
    if (!game.paused) return;

    game.paused = false;
    pauseElement.style.display = 'none';
    console.log('▶️ Game resumed');
}

function goToMainMenu() {
    if (!confirm('메인 메뉴로 돌아가시겠습니까? 현재 진행 상황이 초기화됩니다.')) {
        return;
    }

    // 게임 완전 초기화
    resumeGame(); // 먼저 일시정지 해제
    game.started = false;
    game.paused = false;

    // 직업 선택 화면으로
    document.getElementById('jobSelect').style.display = 'flex';
    document.getElementById('gameUI').style.display = 'none';

    console.log('🏠 Returned to main menu');
}

export function isPaused() {
    return game.paused;
}
