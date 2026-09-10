// localStorage I/O 래퍼. 프라이빗 브라우징, 저장 공간 초과 등으로 접근이 실패할 수 있어
// 항상 실패를 흡수하고 폴백 값을 반환한다. 부수효과(브라우저 저장소 접근)를 가지므로
// AGENTS.md의 Test Boundary 규칙에 따라 이 자체는 테스트하지 않고, 파싱/복원 로직은
// componentStorage.ts 등 순수 함수로 분리해 테스트한다.

export function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) {
      return fallback;
    }
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveToStorage<T>(key: string, value: T): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // 저장 실패는 조용히 무시한다 (프라이빗 모드, 용량 초과 등).
  }
}
