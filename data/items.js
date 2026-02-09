// 아이템 정의
export const ITEMS = {
    hpPotion: {
        id: 'hpPotion',
        name: 'HP 포션',
        description: 'HP 50% 회복',
        icon: '🧪',
        cost: 50,
        type: 'consumable',
        effect: {
            type: 'heal',
            stat: 'hp',
            amount: 0.5 // 50% 회복
        }
    },
    mpPotion: {
        id: 'mpPotion',
        name: 'MP 포션',
        description: 'MP 50% 회복',
        icon: '💙',
        cost: 30,
        type: 'consumable',
        effect: {
            type: 'heal',
            stat: 'mp',
            amount: 0.5 // 50% 회복
        }
    },
    superHpPotion: {
        id: 'superHpPotion',
        name: '고급 HP 포션',
        description: 'HP 100% 회복',
        icon: '🧪✨',
        cost: 150,
        type: 'consumable',
        effect: {
            type: 'heal',
            stat: 'hp',
            amount: 1.0 // 100% 회복
        }
    },
    superMpPotion: {
        id: 'superMpPotion',
        name: '고급 MP 포션',
        description: 'MP 100% 회복',
        icon: '💙✨',
        cost: 100,
        type: 'consumable',
        effect: {
            type: 'heal',
            stat: 'mp',
            amount: 1.0 // 100% 회복
        }
    }
};

export const SHOP_ITEMS = ['hpPotion', 'mpPotion', 'superHpPotion', 'superMpPotion'];
