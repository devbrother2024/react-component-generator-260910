// localStorage에서 읽어온 값이 유효한 Provider인지 검증하는 순수 함수. 부수효과가 없어 단위 테스트가 가능하다.

import { PROVIDERS, type Provider } from '../types';

export function isProvider(value: unknown): value is Provider {
  return typeof value === 'string' && PROVIDERS.includes(value as Provider);
}
