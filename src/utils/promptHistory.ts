// 프롬프트 히스토리에 새 항목을 추가하는 순수 함수. 부수효과가 없어 단위 테스트가 가능하다.

export const MAX_PROMPT_HISTORY = 20;

export function addPromptToHistory(history: string[], prompt: string): string[] {
  const trimmed = prompt.trim();
  if (!trimmed) {
    return history;
  }

  const withoutDuplicate = history.filter((item) => item !== trimmed);
  return [trimmed, ...withoutDuplicate].slice(0, MAX_PROMPT_HISTORY);
}
