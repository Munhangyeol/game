# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MapleQuest RPG — 메이플스토리 스타일의 2D 횡스크롤 RPG 브라우저 게임.
빌드·의존성 없음. 순수 HTML5 Canvas + Vanilla JavaScript.

## Running the Game

```bash
start "" "game.html"   # Windows
open game.html         # macOS
xdg-open game.html     # Linux
```

## 현재 파일 구조

```
game/
├── game.html           # 전체 게임 소스 (단일 파일, ~1770 lines)
├── CLAUDE.md           # 이 파일
├── README.md           # 플레이어 가이드
└── .claude/
    └── docs/
        └── plan.md     # 전직 시스템·파일 분리 등 개발 로드맵
```

## Architecture (game.html 내부 구조)

### 데이터 정의 (상단)
- **`JOBS`** 객체: 직업별 스탯·기본공격·스킬 정의 (warrior / thief / archer)
  - `basicAttack`: `{ damage, range, type, cooldown, animDuration, hits? }`
  - `skills[]`: `{ name, key, mp, cooldown, damage, type, icon, … }`
  - 레벨당 스탯 증가: `hpPerLevel / mpPerLevel / attackPerLevel`

### 핵심 객체
| 객체 | 역할 |
|------|------|
| `game` | 글로벌 상태 (플랫폼, 몬스터·파티클·투사체·이펚트 배열, 키 상태, 스폰 타이머) |
| `player` | 플레이어 상태 (좌표, HP/MP, 레벨, 직업, 스킬 쿨다운, 버프) |

### 클래스
| 클래스 | 파일 내 위치 | 핵심 역할 |
|--------|-------------|-----------|
| `Effect` | ~line 367 | 모든 공격·버프 시각 이펚트. `draw()` 내 switch로 타입별 렌더링 |
| `Projectile` | ~line 823 | 궁수 화살. `vy` 속성으로 각도 발사 지원. `piercing` 시 관통 |
| `Monster` | ~line 931 | AI(플레이어 추적), 충돌, 렌더링. HP·Damage는 `player.level`로 스케일링 |

### 주요 함수 목록
| 함수 | 역할 |
|------|------|
| `selectJob(jobId)` | 직업 선택 → player 초기화 → 게임 시작 |
| `basicAttack()` | A키 기본공격. `basic.cooldown`·`animDuration` 사용. 전사는 밀치기 포함 |
| `useSkill(index)` | Z/X/C 스킬 실행. 버프 스킬은 switch 이후 별도 처리 + 활성화 이펚트 |
| `perform*()` | 각 스킬별 실제 판정·이펚트 생성 (PowerStrike, SlashBlast, DoubleStab, Assassinate, DoubleShot, ArrowRain) |
| `checkLevelUp()` | EXP 충족 시 레벨++, 스탯 증가, 레벨업 이펚트 |
| `spawnMonster()` | 레벨 기준 몬스터 타입·스폰 간격 결정 |
| `gameLoop()` | requestAnimationFrame 루프. 업데이트→렌더링 순서 |
| `createSkillBar()` | 직업별 아이콘·스킬 슬롯 생성 |
| `updateUI()` | HUD (HP/MP/EXP/공격력/크리/처치수) 갱신 |

### 키 바인딩
| 키 | 역할 |
|----|------|
| ← → | 이동 (ArrowLeft / ArrowRight·D) |
| ↑ / Space / W | 점프 |
| A | 기본공격 (이동과 중복 없음) |
| Z / X / C | 스킬 1 / 2 / 3 |

## 직업별 기본공격 차이점 (중요)

각 직업의 기본공격은 **쿨다운·피해·특수효과가 모두 다름**:
- **전사**: 쿨다운 28프레임, 피해 1.4x, 밀치기(knockback) 포함
- **도적**: 쿨다운 10프레임, 피해 0.4x × 2회 연속 (초고속)
- **궁수**: 쿨다운 18프레임, 피해 1.0x, 원거리 투사체

## 버프 스킬 (C키) 구조

버프 스킬은 `skill.type`이 없어 switch를 통과한 후, `skill.buff` 존재 여부로 처리:
- 버프 객체를 `player.buffs[name]`에 저장
- 활성화 시 시각 이펚트 (rageActivate / hasteActivate / soulActivate) 생성
- 버프 효과는 gameLoop에서 매프레임 duration-- → 만료 시 삭제

## 개발 로드맵

세부 계획은 `.claude/docs/plan.md`에 기술됨. 핵심 항목:

1. **전직 시스템**: Lv10·30·70에서 전직. 직업당 단일 경로, 각 단계에서 스킬 3개 교체.
   → `JOBS[job].tiers[]` 구조로 확장. `player.tier` 속성 추가. `checkLevelUp()` 내 전직 트리거.

2. **몬스터 강화**: 새 타입 추가 (Lv15+ 불타는 버그, Lv35+ 바위 고래, Lv60+ 고대 드래곤). 특수 공격 패턴.

3. **파일 분리**: `<script type="module">` ESM으로 단계적 분리.
   → `state.js`(공유 상태) → `data/`(정적 데이터) → `entities/`(클래스) → `systems/`(로직) → `ui/`

## 새 기능 추가 패턴

- **새 스킬**: `JOBS.*.skills[]`에 정의 → `useSkill()` switch에 케이스 추가 → `perform*()` 함수 구현 → `Effect` 클래스에 draw 메서드 추가
- **새 몬스터**: `Monster` 생성자 내 `monsterTypes` 객체에 정의 → `draw()` 메서드에 렌더링 추가 → `spawnMonster()`에 출현 조건 추가
- **새 버프**: `skills[]`에 `buff` 속성 추가 → `player.buffs` 체크 포인트에 효과 적용 → 활성화 이펚트 타입 추가
