# server/AGENTS.md

## Module Context

Bun으로 구동되는 단일 파일 HTTP API 서버. 프론트엔드의 AI 프록시 역할만 한다 — Anthropic/Google API 키를 감추고, 두 프로바이더의 응답 형식 차이를 흡수해 프론트엔드에는 `{ code }` 하나의 형태로만 돌려준다.

## Tech Stack & Constraints

- Node.js가 아니라 **Bun 런타임**이다. `Bun.serve()`, `bun --watch`를 사용하며 별도 프레임워크(Express 등) 없이 raw fetch handler로 라우팅한다 (`index.ts:138-220`).
- 이 디렉토리는 어떤 tsconfig의 `include`에도 들어있지 않다 — `bun run build`(`tsc -b`)가 여기 코드를 타입체크하지 않는다. 타입 오류는 `bun run server` 실행 시점이나 vitest에서만 드러난다.
- 새 외부 프로바이더를 추가할 때는 `callAnthropic`/`callGoogleModel`처럼 응답을 파싱해 `string`(생성된 코드)만 반환하는 함수로 만들고, `index.ts`의 `provider` 분기에 연결한다.

## Implementation Patterns

- 부수효과 없는 로직(텍스트 정규화 등)은 `generator.ts`처럼 별도 파일의 순수 함수로 분리한다 — `index.ts`에 직접 넣지 않는다. 이래야 테스트가 가능하다 (Testing Strategy 참고).
- 여러 후보를 순서대로 시도하는 로직은 `fallback.ts`의 `withModelFallback`을 재사용한다. 비슷한 재시도 로직을 새로 만들지 마라.
- CORS는 `CORS_HEADERS` 상수(`index.ts:51-55`)로 모든 응답에 일괄 적용한다. 새 라우트를 추가하면 이 헤더를 빠뜨리지 않는다.

## Testing Strategy

- `bun run test` (vitest) 또는 `bun run test:watch`.
- 대상은 `generator.ts`, `fallback.ts` 같은 순수 함수뿐이다. `Bun.serve` 핸들러(`index.ts`)는 테스트하지 않는 것이 이 코드베이스의 기존 패턴이다 — 새 라우트 로직도 파싱/변환 부분만 순수 함수로 뽑아 테스트하라.
- 테스트 설명(`describe`/`it`)은 한국어로 작성한다 (`generator.test.ts`, `fallback.test.ts` 참고).

## Local Golden Rules

- **[Security Boundary]** 클라이언트가 보낸 `apiKey`(`index.ts:161-167`)를 로그에 찍거나 파일/DB에 저장하지 마라. 요청 처리 동안만 메모리에 존재해야 한다.
- **[Hard Constraint]** `Bun.serve({ port: 3002, ... })`(`index.ts:139`)를 바꾸면 반드시 `../vite.config.ts`의 프록시 target도 같이 바꿔라 — 두 값이 어긋나면 프론트엔드의 모든 `/api/*` 요청이 실패한다.
- **[Double Defense]** `SYSTEM_PROMPT`(`index.ts:7-49`)에서 "render() 호출로 끝내라"는 지시를 지우거나 완화하면, `generator.ts`의 `ensureRenderCall()`이 잘못된 컴포넌트명을 추측해 주입할 위험이 커진다. 둘 중 하나만 고치지 말고 항상 같이 검토하라.
