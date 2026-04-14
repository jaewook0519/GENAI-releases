# NovelAI 이미지 생성기 (NAIS2 확장판)

이 프로젝트는 [NAIS2](https://github.com/sunanakgo/NAIS2)를 모델로 한 NovelAI API 기반의 Tauri 2.0 데스크탑 애플리케이션입니다. 기존 NAIS2 기능에 더해 전용 **LLM RP 프롬프트 개발 탭**이 추가되었으며, [FastWrtn](https://github.com/sickwrtn/FastWrtn)의 JSON 생성 및 적용 기능이 포함되어 있습니다.

> **참고:** Python 기반의 YOLO/자동 검열 기능이나 로컬 Stable Diffusion 엔진(PeroPix 참조 기능)은 포함되어 있지 않습니다.

## 🛠 기술 스택

| 계층 | 기술 |
|-------|-----------|
| 데스크탑 프레임워크 | Tauri 2.0 (Rust 백엔드) |
| 프론트엔드 | React 18 + TypeScript |
| 스타일링 | TailwindCSS |
| 상태 관리 | Zustand 5 |
| 라우팅 | React Router 7 |
| 다국어 지원 (i18n) | i18next (한국어 / 영어 / 일본어) |
| 빌드 도구 | Vite + `tsc` |

## 🚀 주요 명령어

```bash
npm install              # 의존성 설치
npm run tauri:dev        # 개발 모드 (핫 리로드, Tauri 윈도우 실행)
npm run tauri:build      # 프로덕션 빌드 (설치 파일 생성)
npm run build            # TypeScript 체크 + Vite 번들링만 수행
npm run lint             # ESLint 실행 (경고 미허용 정책 — --max-warnings 0)
npm run dev              # Vite 전용 개발 서버 (Tauri 윈도우 없음)
```

## 🏗 애플리케이션 구조

### 라우팅 (`src/App.tsx`)

모든 경로는 `ThreeColumnLayout`을 공유하며, 전역적으로 `useSceneGeneration`, `useUpdateChecker`, `useShortcuts` 훅이 실행됩니다.

| 경로 | 페이지 | 용도 |
|-------|------|---------|
| `/` | `MainMode` | 단일 이미지 생성 (Text-to-Image) |
| `/scenes` | `SceneMode` | 슬롯/큐 시스템을 이용한 일괄 생성 |
| `/scenes/:id` | `SceneDetail` | 개별 씬(Scene) 설정 상세 |
| `/tools` | `ToolsMode` | img2img, 인페인트, 업스케일, 배경 제거 등 |
| `/web` | `WebView` | 내장 NovelAI 브라우저 |
| `/library` | `Library` | 이미지 라이브러리 및 메타데이터 뷰어 |
| `/settings` | `Settings` | 앱 설정 |
| `/llm-rp` | `LLMRPMode` | **LLM RP 프롬프트 개발** (신규 탭) |

### 상태 관리 (`src/stores/`)

각 Zustand 스토어는 특정 도메인을 담당합니다.
- `auth-store.ts`: NovelAI 토큰 관리 (로컬 저장, 외부 전송 안됨)
- `generation-store.ts`: 활성 생성 상태, 큐, 스트리밍 미리보기
- `scene-store.ts`: 씬 카드 목록, 파라미터, 일괄 생성 큐
- `character-store.ts` / `character-prompt-store.ts`: 캐릭터 참조 및 Vibe Transfer
- `fragment-store.ts`: 재사용 가능한 프롬프트 조각 기능
- `preset-store.ts`: 파라미터 프리셋 저장 및 JSON 내보내기/가져오기
- `llm-rp-store.ts`: LLM RP 전용 스토어

### LLM RP 프롬프트 탭 (`/llm-rp`)

FastWrtn의 제작 도구에서 영감을 받은 신규 기능입니다.
- **캐릭터 JSON 내보내기/가져오기**: 전체 캐릭터 및 RP 프롬프트 설정을 JSON으로 직렬화
- **프롬프트 라이브러리**: RP 프롬프트 템플릿 저장 및 관리, 단축키 슬롯(Ctrl+1–9) 지원
- **페르소나 관리**: 프롬프트 에디터 내에서 빠른 페르소나 전환

## 🎨 개발 컨벤션

- **컴포넌트 구성**: 컴포넌트 타입이 아닌 도메인별로 `src/components/{domain}/`에 조직화합니다.
- **UI 기본 요소**: Radix UI 래퍼 컴포넌트들은 `src/components/ui/`에 위치합니다.
- **백엔드 (Tauri)**: 커스텀 타이틀바 사용, 전역 우클릭 메뉴 차단 (필요한 경우 `data-allow-context-menu` 속성 사용).
- **다국어**: `src/i18n/locales/` 내의 `en, ko, ja` JSON 파일에 동시에 키를 추가해야 합니다.
- **애니메이션**: Framer Motion을 사용하여 부드러운 UI 경험을 제공합니다.
