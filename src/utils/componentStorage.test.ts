import { describe, it, expect } from 'vitest';
import { reviveComponents, addComponent, MAX_COMPONENTS } from './componentStorage';
import type { GeneratedComponent } from '../types';

function makeComponent(id: string): GeneratedComponent {
  return { id, prompt: `prompt-${id}`, code: 'code', createdAt: new Date('2026-01-01T00:00:00.000Z') };
}

describe('reviveComponents', () => {
  it('배열이 아니면 빈 배열을 반환한다', () => {
    expect(reviveComponents(null)).toEqual([]);
    expect(reviveComponents(undefined)).toEqual([]);
    expect(reviveComponents('not-an-array')).toEqual([]);
    expect(reviveComponents({})).toEqual([]);
  });

  it('빈 배열이면 빈 배열을 반환한다', () => {
    expect(reviveComponents([])).toEqual([]);
  });

  it('유효한 항목의 createdAt 문자열을 Date 객체로 변환한다', () => {
    const raw = [
      { id: '1', prompt: '프로필 카드', code: 'const X = () => null;', createdAt: '2026-01-01T00:00:00.000Z' },
    ];

    const result = reviveComponents(raw);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('1');
    expect(result[0].prompt).toBe('프로필 카드');
    expect(result[0].code).toBe('const X = () => null;');
    expect(result[0].createdAt).toBeInstanceOf(Date);
    expect(result[0].createdAt.toISOString()).toBe('2026-01-01T00:00:00.000Z');
  });

  it('필수 필드(id/prompt/code/createdAt)가 없는 항목은 제외한다', () => {
    const raw = [
      { id: '1', prompt: '프로필 카드', code: 'code' },
      { id: '2', prompt: '카드', code: 'code', createdAt: '2026-01-01T00:00:00.000Z' },
    ];

    const result = reviveComponents(raw);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('createdAt이 유효하지 않은 날짜 문자열인 항목은 제외한다', () => {
    const raw = [
      { id: '1', prompt: 'A', code: 'code', createdAt: '유효하지-않음' },
      { id: '2', prompt: 'B', code: 'code', createdAt: '2026-01-01T00:00:00.000Z' },
    ];

    const result = reviveComponents(raw);

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('2');
  });

  it('여러 항목 중 유효한 것만 원래 순서를 유지한 채 반환한다', () => {
    const raw = [
      { id: '1', prompt: 'A', code: 'code', createdAt: '2026-01-01T00:00:00.000Z' },
      { id: '2', prompt: 'B', code: 'code' },
      { id: '3', prompt: 'C', code: 'code', createdAt: '2026-01-02T00:00:00.000Z' },
    ];

    const result = reviveComponents(raw);

    expect(result.map((c) => c.id)).toEqual(['1', '3']);
  });
});

describe('addComponent', () => {
  it('새 컴포넌트를 맨 앞에 추가한다', () => {
    const result = addComponent([], makeComponent('1'));
    expect(result.map((c) => c.id)).toEqual(['1']);
  });

  it('기존 목록 앞에 새 컴포넌트를 추가한다', () => {
    const result = addComponent([makeComponent('1')], makeComponent('2'));
    expect(result.map((c) => c.id)).toEqual(['2', '1']);
  });

  it(`최대 개수(${MAX_COMPONENTS}개)를 초과하면 가장 오래된 항목부터 제거한다`, () => {
    const existing = Array.from({ length: MAX_COMPONENTS }, (_, i) => makeComponent(`old-${i}`));
    const result = addComponent(existing, makeComponent('new'));

    expect(result).toHaveLength(MAX_COMPONENTS);
    expect(result[0].id).toBe('new');
    expect(result.map((c) => c.id)).not.toContain(`old-${MAX_COMPONENTS - 1}`);
  });
});
