# Pokemon Community Hub

포챔스 분위기의 포켓몬 정보 공유 커뮤니티 프로젝트입니다.
솔직히 말하면, 이 프로젝트는 **내가 만들고 싶어서 만들었습니다**.
좋아하는 주제로 UI/상태관리/테스트/개발 워크플로우를 한 번에 정리해보고 싶어서 시작했습니다.

## Overview

- PokeAPI 기반 포켓몬 정보 공유 커뮤니티 홈
- 헤더 검색바로 이름/번호/메타 키워드 검색
- 게시글 작성, 댓글 등록, 추천(좋아요)까지 가능한 로컬 저장형 커뮤니티 피드
- 포켓몬 카드 클릭 시 상세 모달(타입, 약점, 특성, 스탯, 진화)
- 랜덤 추천으로 화제 포켓몬 흐름 확인
- 검색 결과 로딩 시 스켈레톤 UI 제공

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
- **Zustand**: 검색/랜덤 추천 상태뿐 아니라 게시글·댓글·추천 같은 로컬 커뮤니티 상태까지 함께 관리하기 좋습니다.
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
