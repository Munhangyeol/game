import { game, player } from '../../core/game/GameState.js';

export function updateUI() {
    if (!game.started) return;
    console.log(`[UI] updateUI called - EXP: ${player.exp}/${player.expToLevel}, Level: ${player.level}, Kills: ${player.kills}`);
    document.getElementById('level').textContent = player.level;

    // HP 바 업데이트 및 위험 구간(≤30%) 깜빡 효과
    const hpBar = document.getElementById('hpBar');
    const hpPercent = player.hp / player.maxHp * 100;
    hpBar.style.width = hpPercent + '%';
    if (hpPercent <= 30) {
        hpBar.classList.add('hp-fill-danger');
    } else {
        hpBar.classList.remove('hp-fill-danger');
    }

    document.getElementById('hpText').textContent = `${Math.max(0, Math.floor(player.hp))}/${player.maxHp}`;
    document.getElementById('mpBar').style.width = (player.mp / player.maxMp * 100) + '%';
    document.getElementById('mpText').textContent = `${Math.max(0, Math.floor(player.mp))}/${player.maxMp}`;
    document.getElementById('expBar').style.width = (player.exp / player.expToLevel * 100) + '%';
    document.getElementById('expText').textContent = `${player.exp}/${player.expToLevel}`;
    document.getElementById('attack').textContent = Math.floor(player.attack * (player.buffs.rage ? player.buffs.rage.attackBonus : 1));
    document.getElementById('crit').textContent = player.critChance;
    document.getElementById('kills').textContent = player.kills;
}
