import { game, player } from '../../core/game/GameState.js';
import { ITEMS, SHOP_ITEMS } from '../../../data/items.js';
import { createHealText } from '../../features/combat/CombatSystem.js';
import { logItemBuy } from '../components/ChatLog.js';

let shopElement = null;
let isShopOpen = false;

export function initShopScreen() {
    shopElement = document.getElementById('shopScreen');
    if (!shopElement) {
        shopElement = document.createElement('div');
        shopElement.id = 'shopScreen';
        shopElement.className = 'shop-screen';
        shopElement.style.display = 'none';
        document.querySelector('.game-container').appendChild(shopElement);
    }

    // 클릭 시 닫기
    shopElement.addEventListener('click', (e) => {
        if (e.target === shopElement) {
            closeShop();
        }
    });
}

export function toggleShop() {
    if (!shopElement) initShopScreen();

    if (isShopOpen) {
        closeShop();
    } else {
        openShop();
    }
}

export function openShop() {
    if (!shopElement) initShopScreen();
    if (!game.started) return;

    updateShopContent();
    shopElement.style.display = 'flex';
    isShopOpen = true;
}

export function closeShop() {
    if (shopElement) {
        shopElement.style.display = 'none';
    }
    isShopOpen = false;
}

export function isShopActive() {
    return isShopOpen;
}

function updateShopContent() {
    const currentMeso = game.meso || 0;

    const html = `
        <div class="shop-content">
            <div class="shop-header">
                <span class="shop-icon">🏪</span>
                <span class="shop-title">상점</span>
            </div>

            <div class="shop-meso">
                보유 메소: <span class="meso-amount">${currentMeso}</span> 💰
            </div>

            <div class="shop-divider"></div>

            <div class="shop-items">
                ${SHOP_ITEMS.map(itemId => {
                    const item = ITEMS[itemId];
                    const canAfford = currentMeso >= item.cost;
                    return `
                        <div class="shop-item ${!canAfford ? 'disabled' : ''}" data-item-id="${itemId}">
                            <div class="shop-item-icon">${item.icon}</div>
                            <div class="shop-item-info">
                                <div class="shop-item-name">${item.name}</div>
                                <div class="shop-item-desc">${item.description}</div>
                            </div>
                            <div class="shop-item-price">
                                <div class="price-amount">${item.cost} 메소</div>
                                <button class="shop-buy-btn ${!canAfford ? 'disabled' : ''}"
                                        ${!canAfford ? 'disabled' : ''}
                                        onclick="window.buyItem('${itemId}')">
                                    구매
                                </button>
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>

            <div class="shop-divider"></div>

            <div class="shop-footer">
                <div class="shop-hint">S키 또는 배경 클릭으로 닫기</div>
            </div>
        </div>
    `;

    shopElement.innerHTML = html;
}

// 전역 함수로 노출 (버튼 onclick에서 사용)
window.buyItem = function(itemId) {
    const item = ITEMS[itemId];
    if (!item) return;

    const currentMeso = game.meso || 0;
    if (currentMeso < item.cost) {
        console.log('메소가 부족합니다!');
        return;
    }

    // 메소 차감
    game.meso -= item.cost;

    // 아이템 효과 적용
    if (item.effect.type === 'heal') {
        const stat = item.effect.stat;
        const amount = item.effect.amount;

        if (stat === 'hp') {
            const healAmount = Math.floor(player.maxHp * amount);
            player.hp = Math.min(player.hp + healAmount, player.maxHp);
            createHealText(healAmount, 'hp');
        } else if (stat === 'mp') {
            const healAmount = Math.floor(player.maxMp * amount);
            player.mp = Math.min(player.mp + healAmount, player.maxMp);
            createHealText(healAmount, 'mp');
        }
    }

    // 로그 추가
    logItemBuy(item.name, item.cost);

    // 상점 UI 업데이트
    updateShopContent();

    console.log(`✅ Purchased: ${item.name} (-${item.cost} 메소)`);
};

export function buyItem(itemId) {
    window.buyItem(itemId);
}
