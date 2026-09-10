import { describe, it, expect } from 'vitest';
import { addPromptToHistory, isPromptHistory, MAX_PROMPT_HISTORY } from './promptHistory';

describe('addPromptToHistory', () => {
  it('새 프롬프트를 맨 앞에 추가한다', () => {
    expect(addPromptToHistory([], '프로필 카드')).toEqual(['프로필 카드']);
  });

  it('기존 히스토리 앞에 새 프롬프트를 추가한다', () => {
    expect(addPromptToHistory(['이전 프롬프트'], '새 프롬프트')).toEqual([
      '새 프롬프트',
      '이전 프롬프트',
    ]);
  });

  it('이미 존재하는 프롬프트를 추가하면 중복을 제거하고 맨 앞으로 옮긴다', () => {
    const history = ['A', 'B', 'C'];
    expect(addPromptToHistory(history, 'B')).toEqual(['B', 'A', 'C']);
  });

  it(`최대 개수(${MAX_PROMPT_HISTORY}개)를 초과하면 가장 오래된 항목부터 제거한다`, () => {
    const history = Array.from({ length: MAX_PROMPT_HISTORY }, (_, i) => `prompt-${i}`);
    const result = addPromptToHistory(history, 'new-prompt');

    expect(result).toHaveLength(MAX_PROMPT_HISTORY);
    expect(result[0]).toBe('new-prompt');
    expect(result).not.toContain(`prompt-${MAX_PROMPT_HISTORY - 1}`);
  });

  it('공백만 있는 프롬프트는 추가하지 않는다', () => {
    expect(addPromptToHistory(['A'], '   ')).toEqual(['A']);
  });

  it('앞뒤 공백은 제거하고 저장한다', () => {
    expect(addPromptToHistory([], '  프로필 카드  ')).toEqual(['프로필 카드']);
  });
});

describe('isPromptHistory', () => {
  it('문자열 배열이면 true를 반환한다', () => {
    expect(isPromptHistory(['A', 'B'])).toBe(true);
    expect(isPromptHistory([])).toBe(true);
  });

  it('배열이 아니면 false를 반환한다', () => {
    expect(isPromptHistory('old')).toBe(false);
    expect(isPromptHistory(null)).toBe(false);
    expect(isPromptHistory(undefined)).toBe(false);
    expect(isPromptHistory({})).toBe(false);
  });

  it('배열 원소가 문자열이 아니면 false를 반환한다', () => {
    expect(isPromptHistory([1, 2, 3])).toBe(false);
    expect(isPromptHistory(['A', 1])).toBe(false);
  });
});
