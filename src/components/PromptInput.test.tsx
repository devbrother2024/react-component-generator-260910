import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { PromptInput } from './PromptInput';
import { MAX_PROMPT_LENGTH } from '../utils/validatePrompt';

describe('PromptInput', () => {
  it('프롬프트가 비어 있으면 생성 버튼이 비활성이다', () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={false} />);
    expect(screen.getByRole('button', { name: '컴포넌트 생성' })).toBeDisabled();
  });

  it('입력하면 버튼이 활성화되고 클릭 시 입력값으로 onGenerate가 호출된다', async () => {
    const onGenerate = vi.fn();
    const user = userEvent.setup();
    render(<PromptInput onGenerate={onGenerate} isLoading={false} />);

    await user.type(screen.getByRole('textbox'), '프로필 카드');
    const submit = screen.getByRole('button', { name: '컴포넌트 생성' });
    expect(submit).toBeEnabled();

    await user.click(submit);
    expect(onGenerate).toHaveBeenCalledWith('프로필 카드');
  });

  it('로딩 중에는 생성 버튼이 비활성이고 "생성 중..." 을 보여준다', () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={true} />);
    expect(screen.getByRole('button', { name: '생성 중...' })).toBeDisabled();
  });

  it(`${MAX_PROMPT_LENGTH}자를 초과해 입력하면 생성 버튼이 비활성화된다`, () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={false} />);
    const textarea = screen.getByRole('textbox');

    fireEvent.change(textarea, { target: { value: 'a'.repeat(MAX_PROMPT_LENGTH + 1) } });

    expect(screen.getByRole('button', { name: '컴포넌트 생성' })).toBeDisabled();
  });

  it(`${MAX_PROMPT_LENGTH}자를 초과해 입력하면 에러 메시지를 보여준다`, () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={false} />);
    const textarea = screen.getByRole('textbox');

    fireEvent.change(textarea, { target: { value: 'a'.repeat(MAX_PROMPT_LENGTH + 1) } });

    expect(screen.getByText(new RegExp(`${MAX_PROMPT_LENGTH}자까지`))).toBeInTheDocument();
  });

  it('입력 글자 수를 카운터로 보여준다', () => {
    render(<PromptInput onGenerate={vi.fn()} isLoading={false} />);
    const textarea = screen.getByRole('textbox');
    const value = '프로필 카드';

    fireEvent.change(textarea, { target: { value } });

    expect(screen.getByText(`${value.length}/${MAX_PROMPT_LENGTH}`)).toBeInTheDocument();
  });
});
