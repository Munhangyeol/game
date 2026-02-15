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
        basicAttack: { damage: 1.4, range: 75, type: 'sword', cooldown: 28, animDuration: 390 },
        tiers: [
            {
                name: '전사',
                icon: '⚔️',
                skills: [
                    { name: '파워 스트라이크', key: 'Z', mp: 5, cooldown: 30, damage: 2.8, type: 'powerStrike', knockback: true, icon: '💥' },
                    { name: '슬래시 블래스트', key: 'X', mp: 10, cooldown: 90, damage: 1.5, type: 'slashBlast', range: 150, icon: '🌀' },
                    { name: '레이지', key: 'C', mp: 15, cooldown: 600, duration: 600, buff: 'rage', attackBonus: 1.5, icon: '😤' }
                ]
            },
            {
                name: '기사',
                icon: '🛡️',
                skills: [
                    { name: '강타+', key: 'Z', mp: 7, cooldown: 35, damage: 3.5, type: 'powerStrikePlus', knockback: true, icon: '💢' },
                    { name: '실드 타격', key: 'X', mp: 12, cooldown: 100, damage: 2.0, type: 'shieldCounter', duration: 300, icon: '🛡️' },
                    { name: '성스러운 빛', key: 'C', mp: 18, cooldown: 600, duration: 600, buff: 'holyLight', healPerSec: 5, attackBonus: 1.2, icon: '✨' }
                ]
            },
            {
                name: '다크나이트',
                icon: '⚔️🌑',
                skills: [
                    { name: '다크 스트라이크', key: 'Z', mp: 10, cooldown: 40, damage: 4.5, type: 'darkStrike', pierce: true, icon: '⚫💥' },
                    { name: '혈의 날', key: 'X', mp: 18, cooldown: 110, damage: 2.0, type: 'bloodBlade', range: 200, enemies: 5, icon: '🩸🗡️' },
                    { name: '분노의 기사', key: 'C', mp: 25, cooldown: 620, duration: 700, buff: 'berserker', attackBonus: 1.8, icon: '😡⚔️' }
                ]
            },
            {
                name: '히어로',
                icon: '✨⚔️',
                skills: [
                    { name: '영웅의 강타', key: 'Z', mp: 15, cooldown: 45, damage: 6.0, type: 'heroStrike', knockback: true, shockwave: true, icon: '✨💥' },
                    { name: '거인의 난타', key: 'X', mp: 30, cooldown: 120, damage: 2.5, type: 'giantRampage', range: 250, enemies: 8, icon: '👊💢' },
                    { name: '영웅의 의지', key: 'C', mp: 35, cooldown: 650, duration: 800, buff: 'heroicWill', attackBonus: 2.0, defense: 0.5, icon: '⭐😤' }
                ]
            }
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
        basicAttack: { damage: 0.4, range: 50, type: 'dagger', hits: 2, cooldown: 10, animDuration: 185, comboFinisherMult: 2.5 },
        tiers: [
            {
                name: '도적',
                icon: '🗡️',
                basicAttack: { damage: 0.40, range: 50, hits: 2, cooldown: 10, comboFinisherMult: 2.5 },
                skills: [
                    { name: '어쌔시네이트', key: 'X', mp: 12, cooldown: 120, damage: 4.5, type: 'assassinate', backstab: true, icon: '💀' },
                    { name: '헤이스트', key: 'C', mp: 10, cooldown: 480, duration: 600, buff: 'haste', speedBonus: 1.5, icon: '💨' }
                ]
            },
            {
                name: '로그',
                icon: '🗡️✨',
                basicAttack: { damage: 0.52, range: 56, hits: 2, cooldown: 9, comboFinisherMult: 2.9 },
                skills: [
                    { name: '스텔스 백스탭', key: 'X', mp: 15, cooldown: 130, damage: 5.5, type: 'stealthBackstab', backstab: true, icon: '👤' },
                    { name: '신속', key: 'C', mp: 12, cooldown: 500, duration: 600, buff: 'swiftness', speedBonus: 1.8, evasion: 15, icon: '💨✨' }
                ]
            },
            {
                name: '어쌔신',
                icon: '💀',
                basicAttack: { damage: 0.65, range: 63, hits: 3, cooldown: 8, comboFinisherMult: 3.4 },
                skills: [
                    { name: '치명의 일격', key: 'X', mp: 20, cooldown: 140, damage: 7.0, type: 'deadlyBlow', critBoost: 30, backstabBoost: 3, icon: '💀💥' },
                    { name: '그림자 이동', key: 'C', mp: 15, cooldown: 520, duration: 600, buff: 'shadowShift', evasion: 50, speedBonus: 1.5, icon: '👤💨' }
                ]
            },
            {
                name: '나이트로드',
                icon: '🌟💀',
                basicAttack: { damage: 0.80, range: 72, hits: 4, cooldown: 7, comboFinisherMult: 4.2 },
                skills: [
                    { name: '영혼의 일격', key: 'X', mp: 30, cooldown: 150, damage: 10.0, type: 'soulStrike', guaranteedCrit: true, icon: '👻💥' },
                    { name: '어둠의 분신', key: 'C', mp: 40, cooldown: 550, duration: 600, buff: 'darkClone', cloneDamage: 0.5, icon: '👥💀' }
                ]
            }
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
        basicAttack: { damage: 1.0, type: 'arrow', cooldown: 18, animDuration: 280 },
        tiers: [
            {
                name: '궁수',
                icon: '🏹',
                skills: [
                    { name: '더블 샷', key: 'Z', mp: 3, cooldown: 20, damage: 1.8, arrows: 2, type: 'doubleShot', spread: true, icon: '➹' },
                    { name: '애로우 레인', key: 'X', mp: 15, cooldown: 150, damage: 1.0, type: 'arrowRain', icon: '🌧️' },
                    { name: '소울 애로우', key: 'C', mp: 8, cooldown: 420, duration: 600, buff: 'soul', piercing: true, icon: '✨' }
                ]
            },
            {
                name: '헌터',
                icon: '🏹🎯',
                skills: [
                    { name: '트리플 샷', key: 'Z', mp: 5, cooldown: 25, damage: 1.9, arrows: 3, type: 'tripleShot', spread: true, icon: '➹➹➹' },
                    { name: '폭발 화살', key: 'X', mp: 18, cooldown: 160, damage: 2.5, type: 'explosiveArrow', radius: 80, icon: '💥🏹' },
                    { name: '예리한 시선', key: 'C', mp: 10, cooldown: 440, duration: 600, buff: 'keenEyes', critBonus: 15, icon: '👁️✨' }
                ]
            },
            {
                name: '레인저',
                icon: '🏹🌟',
                skills: [
                    { name: '바람의 샷', key: 'Z', mp: 8, cooldown: 15, damage: 2.2, arrows: 5, type: 'windShot', rapid: true, icon: '💨🏹' },
                    { name: '강화 레인', key: 'X', mp: 25, cooldown: 170, damage: 1.5, type: 'enhancedRain', count: 30, icon: '🌧️✨' },
                    { name: '자연의 축복', key: 'C', mp: 20, cooldown: 460, duration: 600, buff: 'natureBless', healPerSec: 3, piercing: true, critBonus: 10, icon: '🍃✨' }
                ]
            },
            {
                name: '보우마스터',
                icon: '🏹👑',
                skills: [
                    { name: '무한의 샷', key: 'Z', mp: 12, cooldown: 20, damage: 2.5, arrows: 8, type: 'infiniteShot', pierce: true, rapid: true, icon: '♾️🏹' },
                    { name: '종일 화살비', key: 'X', mp: 40, cooldown: 180, damage: 2.0, type: 'allDayRain', count: 50, duration: 180, icon: '⛈️🏹' },
                    { name: '궁수의 영혼', key: 'C', mp: 50, cooldown: 500, duration: 700, buff: 'archerSoul', attackBonus: 2.2, piercing: true, critBonus: 20, icon: '👑✨' }
                ]
            }
        ]
    }
};
