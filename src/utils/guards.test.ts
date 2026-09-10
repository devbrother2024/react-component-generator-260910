import { describe, it, expect } from 'vitest';
import { isString } from './guards';

describe('isString', () => {
  it('문자열이면 true를 반환한다', () => {
    expect(isString('hello')).toBe(true);
    expect(isString('')).toBe(true);
  });

  it('문자열이 아니면 false를 반환한다', () => {
    expect(isString(123)).toBe(false);
    expect(isString(null)).toBe(false);
    expect(isString(undefined)).toBe(false);
    expect(isString({})).toBe(false);
    expect(isString(['a'])).toBe(false);
  });
});
