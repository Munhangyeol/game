// 퀘스트 정의
export const QUESTS = {
    slimeHunter: {
        id: 'slimeHunter',
        name: '슬라임 사냥꾼',
        description: '슬라임을 처치하세요',
        type: 'kill',
        target: 'slime',
        required: 10,
        rewards: {
            exp: 200,
            meso: 500
        },
        icon: '🟢'
    },
    monsterSlayer: {
        id: 'monsterSlayer',
        name: '몬스터 학살자',
        description: '아무 몬스터나 처치하세요',
        type: 'killAny',
        required: 50,
        rewards: {
            exp: 500,
            meso: 1000
        },
        icon: '💀'
    },
    noviceAdventurer: {
        id: 'noviceAdventurer',
        name: '초보 모험가',
        description: '레벨 5에 도달하세요',
        type: 'level',
        required: 5,
        rewards: {
            exp: 300,
            meso: 800
        },
        icon: '⭐'
    },
    criticalMaster: {
        id: 'criticalMaster',
        name: '크리티컬 마스터',
        description: '크리티컬 공격을 성공시키세요',
        type: 'critical',
        required: 20,
        rewards: {
            exp: 400,
            meso: 1200
        },
        icon: '💥'
    },
    firstPromotion: {
        id: 'firstPromotion',
        name: '전직의 길',
        description: '첫 번째 전직을 완료하세요',
        type: 'promotion',
        required: 1,
        rewards: {
            exp: 1000,
            meso: 3000
        },
        icon: '🌟'
    },
    comboKing: {
        id: 'comboKing',
        name: '콤보의 제왕',
        description: '30 콤보를 달성하세요',
        type: 'combo',
        required: 30,
        rewards: {
            exp: 600,
            meso: 1500
        },
        icon: '⚡'
    }
};

// 퀘스트 순서 (자동 수령)
export const QUEST_ORDER = [
    'slimeHunter',
    'noviceAdventurer',
    'criticalMaster',
    'monsterSlayer',
    'firstPromotion',
    'comboKing'
];
