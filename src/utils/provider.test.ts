import { describe, it, expect } from 'vitest';
import { isProvider } from './provider';

describe('isProvider', () => {
  it('"anthropic"이면 true를 반환한다', () => {
    expect(isProvider('anthropic')).toBe(true);
  });

  it('"google"이면 true를 반환한다', () => {
    expect(isProvider('google')).toBe(true);
  });

  it('허용되지 않은 문자열이면 false를 반환한다', () => {
    expect(isProvider('openai')).toBe(false);
  });

  it('문자열이 아닌 값이면 false를 반환한다', () => {
    expect(isProvider(null)).toBe(false);
    expect(isProvider(undefined)).toBe(false);
    expect(isProvider(123)).toBe(false);
  });
});
