// 직업 정의
export const JOBS = {
    warrior: {
        name: '전사',
        icon: '⚔️',
        color: '#ff6644',
        baseHp: 150,
        baseMp: 30,
        baseAttack: 15,
        speed: 4,
        jumpPower: -13,
        critChance: 10,
        hpPerLevel: 30,
        mpPerLevel: 5,
        attackPerLevel: 7,
        promotionBonus: [
            { level: 10, hp: 100, mp: 20 },  // 초변직 (기사)
            { level: 30, hp: 200, mp: 40 },  // 재변직 (다크나이트)
            { level: 70, hp: 400, mp: 80 }   // 최종변직 (히어로)
        ],
        basicAttack: { damage: 1.4, range: 75, type: 'sword', cooldown: 28, animDuration: 200 },
        skills: [
            { name: '파워 스트라이크', key: 'Z', mp: 5, cooldown: 30, damage: 2.8, type: 'powerStrike', knockback: true, icon: '💥' },
            { name: '슬래시 블래스트', key: 'X', mp: 10, cooldown: 90, damage: 1.5, type: 'slashBlast', range: 150, icon: '🌀' },
            { name: '레이지', key: 'C', mp: 15, cooldown: 600, duration: 600, buff: 'rage', attackBonus: 1.5, icon: '😤' }
        ]
    },
    thief: {
        name: '도적',
        icon: '🗡️',
        color: '#aa44ff',
        baseHp: 100,
        baseMp: 50,
        baseAttack: 12,
        speed: 7,
        jumpPower: -14,
        critChance: 25,
        hpPerLevel: 20,
        mpPerLevel: 8,
        attackPerLevel: 5,
        promotionBonus: [
            { level: 10, hp: 80, mp: 30 },   // 초변직 (로그)
            { level: 30, hp: 150, mp: 60 },  // 재변직 (어쌔신)
            { level: 70, hp: 300, mp: 120 }  // 최종변직 (나이트로드)
        ],
        basicAttack: { damage: 0.4, range: 50, type: 'dagger', hits: 2, cooldown: 10, animDuration: 60 },
        skills: [
            { name: '삼중 스탭', key: 'Z', mp: 5, cooldown: 35, damage: 1.4, hits: 3, type: 'doubleStab', icon: '⚡' },
            { name: '어쌔시네이트', key: 'X', mp: 12, cooldown: 120, damage: 4.5, type: 'assassinate', backstab: true, icon: '💀' },
            { name: '헤이스트', key: 'C', mp: 10, cooldown: 480, duration: 600, buff: 'haste', speedBonus: 1.5, icon: '💨' }
        ]
    },
    archer: {
        name: '궁수',
        icon: '🏹',
        color: '#44ff66',
        baseHp: 80,
        baseMp: 40,
        baseAttack: 18,
        speed: 5,
        jumpPower: -13,
        critChance: 20,
        hpPerLevel: 15,
        mpPerLevel: 7,
        attackPerLevel: 8,
        promotionBonus: [
            { level: 10, hp: 70, mp: 25 },   // 초변직 (헌터)
            { level: 30, hp: 130, mp: 50 },  // 재변직 (레인저)
            { level: 70, hp: 250, mp: 100 }  // 최종변직 (보우마스터)
        ],
        basicAttack: { damage: 1.0, type: 'arrow', cooldown: 18, animDuration: 100 },
        skills: [
            { name: '더블 샷', key: 'Z', mp: 3, cooldown: 20, damage: 1.8, arrows: 2, type: 'doubleShot', spread: true, icon: '➹' },
            { name: '애로우 레인', key: 'X', mp: 15, cooldown: 150, damage: 1.0, type: 'arrowRain', icon: '🌧️' },
            { name: '소울 애로우', key: 'C', mp: 8, cooldown: 420, duration: 600, buff: 'soul', piercing: true, icon: '✨' }
        ]
    }
};
