# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

MapleQuest RPG - 메이플스토리 스타일의 2D 횡스크롤 RPG 브라우저 게임.

## Running the Game

브라우저에서 `game.html` 파일을 직접 열어 실행:
```bash
start "" "game.html"   # Windows
open game.html         # macOS
xdg-open game.html     # Linux
```

빌드 과정이나 의존성 설치 불필요 (순수 HTML5 + JavaScript).

## Architecture

단일 파일 구조 (`game.html`):

- **CSS (스타일)**: 게임 UI, 직업 선택 화면, 스킬바, 버프 아이콘
- **HTML (구조)**: Canvas, UI 오버레이, 직업 선택 카드
- **JavaScript (로직)**:
  - `JOBS` 객체: 직업별 스탯/스킬 정의 (warrior, thief, archer)
  - `game` 객체: 게임 상태 (플랫폼, 몬스터, 파티클 등)
  - `player` 객체: 플레이어 상태 (HP, MP, 스킬 쿨다운, 버프)
  - `Monster` 클래스: 몬스터 AI 및 렌더링
  - `Projectile` 클래스: 원거리 투사체 처리
  - `gameLoop()`: 메인 게임 루프 (requestAnimationFrame)

## Key Game Systems

| 시스템 | 관련 함수 |
|--------|-----------|
| 직업 선택 | `selectJob()` |
| 스킬 사용 | `useSkill()`, `performMeleeAttack()`, `performAoeAttack()`, `performRangedAttack()`, `performRainAttack()` |
| 버프 관리 | `player.buffs` 객체, `updateBuffBar()` |
| 레벨업 | `checkLevelUp()` |
| 몬스터 스폰 | `spawnMonster()` |
| 충돌 처리 | `Monster.checkCollision()` |

## Adding New Content

**새 직업 추가**: `JOBS` 객체에 새 직업 정의 추가, `drawPlayer()` 함수에 외형 추가

**새 몬스터 추가**: `Monster` 클래스 내 `monsterTypes` 객체에 정의 추가, `draw()` 메서드에 렌더링 추가

**새 스킬 타입 추가**: `useSkill()` 함수의 switch문에 새 타입 추가, 해당 `perform*Attack()` 함수 구현
