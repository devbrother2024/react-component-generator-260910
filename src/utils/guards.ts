// localStorage에서 읽어온 값의 원시 타입을 검증하는 순수 함수. 부수효과가 없어 단위 테스트가 가능하다.

export function isString(value: unknown): value is string {
  return typeof value === 'string';
}
