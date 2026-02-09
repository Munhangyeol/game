import { player } from '../../core/game/GameState.js';
import { JOBS } from '../../../data/jobs.js';

let tooltipElement = null;

export function initSkillTooltip() {
    tooltipElement = document.getElementById('skillTooltip');
    if (!tooltipElement) {
        tooltipElement = document.createElement('div');
        tooltipElement.id = 'skillTooltip';
        tooltipElement.className = 'skill-tooltip';
        tooltipElement.style.display = 'none';
        document.body.appendChild(tooltipElement);
    }
}

export function showSkillTooltip(skillIndex, mouseX, mouseY) {
    if (!tooltipElement) initSkillTooltip();

    const job = JOBS[player.job];
    const currentTier = job.tiers[player.tier];

    let skill;
    let isBasicAttack = false;

    if (skillIndex === -1) {
        // 기본 공격
        skill = job.basicAttack;
        isBasicAttack = true;
    } else {
        skill = currentTier.skills[skillIndex];
    }

    if (!skill) return;

    // 툴팁 내용 생성
    const tooltipHTML = generateTooltipHTML(skill, isBasicAttack);
    tooltipElement.innerHTML = tooltipHTML;
    tooltipElement.style.display = 'block';

    // 위치 조정 (화면 밖으로 나가지 않게)
    const tooltipRect = tooltipElement.getBoundingClientRect();
    let left = mouseX + 15;
    let top = mouseY + 15;

    if (left + tooltipRect.width > window.innerWidth) {
        left = mouseX - tooltipRect.width - 15;
    }
    if (top + tooltipRect.height > window.innerHeight) {
        top = mouseY - tooltipRect.height - 15;
    }

    tooltipElement.style.left = left + 'px';
    tooltipElement.style.top = top + 'px';
}

export function hideSkillTooltip() {
    if (tooltipElement) {
        tooltipElement.style.display = 'none';
    }
}

function generateTooltipHTML(skill, isBasicAttack) {
    const job = JOBS[player.job];
    const jobColor = job.color;

    let html = '<div class="tooltip-header" style="color: ' + jobColor + '">';

    if (isBasicAttack) {
        html += `<span class="tooltip-icon">${job.icon}</span>`;
        html += `<span class="tooltip-name">기본 공격</span>`;
    } else {
        html += `<span class="tooltip-icon">${skill.icon}</span>`;
        html += `<span class="tooltip-name">${skill.name}</span>`;
    }

    html += '</div>';
    html += '<div class="tooltip-divider"></div>';
    html += '<div class="tooltip-stats">';

    // 데미지
    if (skill.damage !== undefined) {
        const damagePercent = Math.floor(skill.damage * 100);
        html += `<div class="tooltip-stat">💥 데미지: <span class="stat-value">${damagePercent}%</span></div>`;
    }

    // 히트 수
    if (skill.hits && skill.hits > 1) {
        html += `<div class="tooltip-stat">⚡ 히트 수: <span class="stat-value">${skill.hits}회</span></div>`;
    }

    // 화살 수
    if (skill.arrows && skill.arrows > 1) {
        html += `<div class="tooltip-stat">🏹 화살 수: <span class="stat-value">${skill.arrows}발</span></div>`;
    }

    // 쿨타임
    const cooldownSec = (skill.cooldown / 60).toFixed(1);
    html += `<div class="tooltip-stat">⏱️ 쿨타임: <span class="stat-value">${cooldownSec}초</span></div>`;

    // MP
    if (skill.mp) {
        html += `<div class="tooltip-stat">💧 MP: <span class="stat-value">${skill.mp}</span></div>`;
    }

    html += '</div>';

    // 추가 효과
    const effects = getSkillEffects(skill, isBasicAttack);
    if (effects.length > 0) {
        html += '<div class="tooltip-divider"></div>';
        html += '<div class="tooltip-description">';
        effects.forEach(effect => {
            html += `<div class="tooltip-effect">${effect}</div>`;
        });
        html += '</div>';
    }

    return html;
}

function getSkillEffects(skill, isBasicAttack) {
    const effects = [];

    if (isBasicAttack) {
        if (skill.type === 'sword') {
            effects.push('⚔️ 근접 무기로 적을 공격합니다');
        } else if (skill.type === 'dagger') {
            effects.push('🗡️ 빠른 단검 공격을 가합니다');
        } else if (skill.type === 'arrow') {
            effects.push('🏹 화살을 발사합니다');
        }
        return effects;
    }

    // 버프 스킬
    if (skill.buff) {
        if (skill.duration) {
            const durationSec = (skill.duration / 60).toFixed(0);
            effects.push(`⏰ ${durationSec}초간 지속되는 버프`);
        }
        if (skill.attackBonus) {
            const bonusPercent = Math.floor((skill.attackBonus - 1) * 100);
            effects.push(`⚔️ 공격력 +${bonusPercent}%`);
        }
        if (skill.speedBonus) {
            const bonusPercent = Math.floor((skill.speedBonus - 1) * 100);
            effects.push(`💨 이동속도 +${bonusPercent}%`);
        }
        if (skill.critBonus) {
            effects.push(`💥 크리티컬 확률 +${skill.critBonus}%`);
        }
        if (skill.healPerSec) {
            effects.push(`💚 초당 HP ${skill.healPerSec} 회복`);
        }
        if (skill.piercing) {
            effects.push(`✨ 화살이 적을 관통합니다`);
        }
        if (skill.evasion) {
            effects.push(`🌀 회피율 +${skill.evasion}%`);
        }
    }

    // 공격 스킬 효과
    if (skill.knockback) {
        effects.push('💢 적을 밀쳐냅니다');
    }
    if (skill.backstab) {
        effects.push('💀 뒤에서 공격 시 피해 2배');
    }
    if (skill.range) {
        effects.push(`📏 범위: ${skill.range}px`);
    }
    if (skill.radius) {
        effects.push(`💥 폭발 범위: ${skill.radius}px`);
    }
    if (skill.spread) {
        effects.push('📐 화살이 퍼져서 날아갑니다');
    }
    if (skill.type === 'arrowRain') {
        effects.push('🌧️ 하늘에서 화살비가 쏟아집니다');
    }
    if (skill.type === 'shieldCounter') {
        const durationSec = (skill.duration / 60).toFixed(1);
        effects.push(`🛡️ ${durationSec}초간 피해 50% 감소`);
        effects.push('⚔️ 피격 시 반격 데미지');
    }
    if (skill.type === 'stealthBackstab') {
        effects.push('👤 무형화 후 적 뒤로 순간이동');
        effects.push('💀 강력한 백스탭 공격');
    }

    return effects;
}
