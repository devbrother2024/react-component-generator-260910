// localStorage 키를 한 곳에 모아 App.tsx와 useComponentGenerator.ts가 동일한 키를 참조하게 한다.

export const STORAGE_KEYS = {
  apiKey: 'rcg:apiKey',
  provider: 'rcg:provider',
  promptHistory: 'rcg:promptHistory',
  components: 'rcg:components',
} as const;
