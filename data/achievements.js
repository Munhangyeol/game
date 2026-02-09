// 업적 정의
export const ACHIEVEMENTS = {
    firstKill: {
        id: 'firstKill',
        name: '첫 몬스터 처치',
        description: '몬스터를 1마리 처치하세요',
        icon: '⚔️',
        type: 'kills',
        required: 1
    },
    slayer: {
        id: 'slayer',
        name: '학살자',
        description: '몬스터를 100마리 처치하세요',
        icon: '💀',
        type: 'kills',
        required: 100
    },
    massacre: {
        id: 'massacre',
        name: '대학살',
        description: '몬스터를 500마리 처치하세요',
        icon: '☠️',
        type: 'kills',
        required: 500
    },
    levelTen: {
        id: 'levelTen',
        name: '레벨 10 달성',
        description: '레벨 10에 도달하세요',
        icon: '⭐',
        type: 'level',
        required: 10
    },
    levelThirty: {
        id: 'levelThirty',
        name: '레벨 30 달성',
        description: '레벨 30에 도달하세요',
        icon: '🌟',
        type: 'level',
        required: 30
    },
    critMaster: {
        id: 'critMaster',
        name: '크리티컬 마스터',
        description: '크리티컬 공격을 100회 성공시키세요',
        icon: '💥',
        type: 'crits',
        required: 100
    },
    richMan: {
        id: 'richMan',
        name: '부자',
        description: '메소 10,000개를 모으세요',
        icon: '💰',
        type: 'meso',
        required: 10000
    },
    comboGod: {
        id: 'comboGod',
        name: '콤보의 신',
        description: '50 콤보를 달성하세요',
        icon: '⚡',
        type: 'combo',
        required: 50
    }
};

export const ACHIEVEMENT_ORDER = [
    'firstKill',
    'levelTen',
    'critMaster',
    'slayer',
    'levelThirty',
    'comboGod',
    'richMan',
    'massacre'
];
