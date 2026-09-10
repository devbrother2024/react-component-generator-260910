import { describe, it, expect } from 'vitest';
import { validatePromptLength, MAX_PROMPT_LENGTH } from './validatePrompt';

describe('validatePromptLength', () => {
  it('빈 문자열은 유효하다', () => {
    expect(validatePromptLength('')).toEqual({ valid: true });
  });

  it(`${MAX_PROMPT_LENGTH}자 이하이면 유효하다`, () => {
    const prompt = 'a'.repeat(MAX_PROMPT_LENGTH);
    expect(validatePromptLength(prompt)).toEqual({ valid: true });
  });

  it(`${MAX_PROMPT_LENGTH}자를 초과하면 유효하지 않다`, () => {
    const prompt = 'a'.repeat(MAX_PROMPT_LENGTH + 1);
    expect(validatePromptLength(prompt).valid).toBe(false);
  });

  it('초과 시 에러 메시지에 현재 길이와 최대 길이를 포함한다', () => {
    const prompt = 'a'.repeat(MAX_PROMPT_LENGTH + 10);
    const result = validatePromptLength(prompt);
    expect(result.error).toContain(String(MAX_PROMPT_LENGTH));
    expect(result.error).toContain(String(prompt.length));
  });
});
