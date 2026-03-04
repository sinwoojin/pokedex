# Pokemon Card Dex

포켓몬 카드 도감 프로젝트입니다.
솔직히 말하면, 이 프로젝트는 **내가 만들고 싶어서 만들었습니다**.
좋아하는 주제로 UI/상태관리/테스트/개발 워크플로우를 한 번에 정리해보고 싶어서 시작했습니다.

## Overview

- PokeAPI 기반 포켓몬 카드 도감
- 헤더 검색바로 이름/번호 검색
- 카드 클릭 시 상세 모달(타입, 능력, 스탯)
- 페이지 이동 시 스켈레톤 UI로 로딩 전환

## Tech Stack

- Next.js (App Router)
- React
- TypeScript
- Zustand
- Jest + Testing Library
- Husky

## 기술스택 채택 이유

- **Next.js (App Router)**: 페이지 구조와 라우팅이 명확해서 작은 프로젝트도 빠르게 정리할 수 있고, 추후 API 라우트나 배포까지 확장하기 쉽습니다.
- **TypeScript**: PokeAPI 응답 타입을 명시해 데이터 매핑 실수를 줄이고, 리팩터링 시 안정성을 확보하기 좋습니다.
- **Zustand**: 검색어/페이지 상태처럼 전역으로 공유해야 하는 UI 상태를 보일러플레이트 없이 단순하게 관리할 수 있습니다.
- **Jest + Testing Library**: 스토어 동작, 컴포넌트 상호작용, 로딩/모달 같은 사용자 관점 동작을 빠르게 검증할 수 있습니다.
- **Husky**: 커밋 전에 lint/test를 자동 실행해 기본 품질선을 강제하고, 실수로 깨진 코드를 올리는 상황을 줄입니다.

## Local Development

```bash
npm install
npm run dev
```

브라우저에서 `http://localhost:3000`으로 확인할 수 있습니다.

## Quality Checks

```bash
npm run lint
npm run test:ci
npm run build
```
