// 프롬프트 길이를 검증하는 순수 함수. 부수효과가 없어 단위 테스트가 가능하다.

export const MAX_PROMPT_LENGTH = 500;

export interface PromptValidationResult {
  valid: boolean;
  error?: string;
}

export function validatePromptLength(prompt: string): PromptValidationResult {
  if (prompt.length > MAX_PROMPT_LENGTH) {
    return {
      valid: false,
      error: `프롬프트는 최대 ${MAX_PROMPT_LENGTH}자까지 입력할 수 있습니다. (현재 ${prompt.length}자)`,
    };
  }

  return { valid: true };
}
