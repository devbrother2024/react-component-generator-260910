# AGENTS.md

## Operational Commands

- 패키지 매니저: `bun` 고정 (`bun.lock` 존재) — npm/yarn/pnpm 사용 금지.
- 의존성 설치: `bun install`
- 개발 서버 (API + 프론트엔드 동시 실행): `bun run dev`
- API 서버만 실행: `bun run server` (포트 3002, `--watch`)
- 빌드: `bun run build` (`tsc -b && vite build`) — **`server/`는 이 타입체크 대상에 포함되지 않는다** (아래 Golden Rules 참고)
- 린트: `bun run lint`
- 테스트: `bun run test` (1회 실행) / `bun run test:watch` (watch 모드)

## Golden Rules

### Immutable

- 클라이언트가 요청 본문으로 보낸 API 키(`apiKey` 필드)를 로그에 출력하거나 어떤 저장소에도 영속화하지 않는다. 요청 처리 중에만 사용하고 버린다. (근거: `server/index.ts:64-66,161-186` — `resolveApiKey`가 매 요청마다 즉시 사용될 뿐 별도 저장 로직이 없음)
- `.env`의 `ANTHROPIC_API_KEY`/`GOOGLE_API_KEY` 원문을 클라이언트로 내려보내지 않는다. `/api/config`는 키 존재 여부(boolean)만 반환한다. (근거: `server/index.ts:147-157`)

### Do's & Don'ts (팀 고유 규칙)

- **[Hard Constraint] `server/**/*.ts`는 `tsc -b` 타입체크 대상이 아니다.** `tsconfig.app.json`은 `src`만, `tsconfig.node.json`은 `vite.config.ts`만 `include`하며 `server/`를 포함하는 tsconfig가 없다 (`tsconfig.app.json:27`, `tsconfig.node.json:25`). `bun run build`가 통과해도 `server/`의 타입 오류는 잡히지 않는다 — `server/` 변경 후에는 `bun run server`로 직접 기동하거나 관련 vitest를 돌려 확인하라.
- **[Hard Constraint] API 서버 포트(3002)가 두 곳에 하드코딩돼 있다.** `server/index.ts:139`의 `Bun.serve({ port: 3002, ... })`와 `vite.config.ts:11`의 프록시 target이 반드시 일치해야 한다. 한쪽만 바꾸면 `/api/*` 요청이 전부 깨진다.
- **[Double Defense] react-live 미리보기가 그려지려면 생성된 코드에 `render(<Component />)` 호출이 있어야 한다** (`noInline` 모드, `src/components/LivePreview.tsx:14`). 두 겹으로 방어 중이다: (1) `server/index.ts`의 `SYSTEM_PROMPT`가 LLM에게 항상 `render()` 호출로 끝내라고 지시하고, (2) `server/generator.ts`의 `ensureRenderCall()`이 응답에 `render(...)`가 없으면 첫 컴포넌트 선언을 찾아 자동 주입한다. 리팩터링 시 이 중 하나만 남기지 마라 — LLM이 지시를 무시하면 나머지 하나가 유일한 방어선이 된다.
- **[Asymmetry] Google 모델만 다중 폴백이 있고 Anthropic은 단일 모델이다.** `server/index.ts:5,134-136`의 `callGoogle`은 `GOOGLE_MODELS` 배열을 `withModelFallback`으로 순차 시도하지만, `callAnthropic`(`server/index.ts:68-96`)은 폴백 없이 단일 모델 호출이다. 의도적 차이이므로 "일관성을 맞춘다"며 임의로 통일하지 말고, 필요하면 먼저 사용자에게 확인하라.
- **[Test Boundary] 부수효과가 없는 순수 함수만 유닛 테스트가 있다.** `server/generator.ts`, `server/fallback.ts`는 순수 함수라 각각 `generator.test.ts`/`fallback.test.ts`로 테스트되지만, 네트워크 I/O를 가진 `server/index.ts`(Bun.serve 핸들러, `callAnthropic`, `callGoogleModel`)와 `src/hooks/useComponentGenerator.ts`는 테스트가 없다. 새 로직을 추가할 때는 부수효과가 있는 코드에서 로직을 순수 함수로 분리해 그 함수를 테스트하라 — side-effect가 있는 핸들러 자체를 목킹해 테스트하려 하지 마라.
- 생성된 컴포넌트 코드(react-live로 실행되는 문자열)는 `import` 문과 TypeScript 문법을 쓸 수 없다 — `React`는 전역으로 주입되어 있다고 가정한다 (`server/index.ts:7-20` SYSTEM_PROMPT). 이 시스템 프롬프트를 수정할 때 이 제약을 깨지 마라.

## Project Context

React 프롬프트 기반 UI 컴포넌트 생성기. 사용자가 자연어로 요청하면 Anthropic Claude 또는 Google Gemini로 React 컴포넌트 코드를 생성하고, react-live로 즉시 미리보기한다.

**Tech Stack:** React 19, TypeScript, Vite, Bun(API 프록시 서버), react-live, Vitest + Testing Library, ESLint(flat config)

## Standards & References

- 커밋 메시지 컨벤션: `.claude/skills/commit/SKILL.md` 참고 (한국어, `type: 요약` 형식)
- 테스트: `describe`/`it` 설명을 한국어로 작성하는 기존 관행을 따른다 (`server/generator.test.ts` 참고)
- **Maintenance Policy:** 이 문서의 규칙과 실제 코드가 어긋나는 것을 발견하면 조용히 무시하지 말고, 이 파일의 업데이트를 제안하라.
