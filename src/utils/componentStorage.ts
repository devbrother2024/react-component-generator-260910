// localStorage에서 읽어온 원시 데이터를 GeneratedComponent[]로 복원하는 순수 함수.
// JSON.parse는 Date를 문자열로 남기므로, 저장 형식이 깨져 있을 수 있다는 전제 하에
// 항목별로 형태를 검증하고 createdAt을 Date로 되살린다. 부수효과가 없어 단위 테스트가 가능하다.

import type { GeneratedComponent } from '../types';

export const MAX_COMPONENTS = 20;

function isValidEntry(
  value: unknown
): value is { id: string; prompt: string; code: string; createdAt: string } {
  if (typeof value !== 'object' || value === null) {
    return false;
  }

  const entry = value as Record<string, unknown>;
  return (
    typeof entry.id === 'string' &&
    typeof entry.prompt === 'string' &&
    typeof entry.code === 'string' &&
    typeof entry.createdAt === 'string'
  );
}

export function reviveComponents(raw: unknown): GeneratedComponent[] {
  if (!Array.isArray(raw)) {
    return [];
  }

  const result: GeneratedComponent[] = [];

  for (const item of raw) {
    if (!isValidEntry(item)) {
      continue;
    }

    const createdAt = new Date(item.createdAt);
    if (Number.isNaN(createdAt.getTime())) {
      continue;
    }

    result.push({ id: item.id, prompt: item.prompt, code: item.code, createdAt });
  }

  return result;
}

export function addComponent(
  components: GeneratedComponent[],
  newComponent: GeneratedComponent
): GeneratedComponent[] {
  return [newComponent, ...components].slice(0, MAX_COMPONENTS);
}
