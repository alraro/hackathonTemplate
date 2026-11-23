import jsxA11y from 'eslint-plugin-jsx-a11y'
import tsParser from '@typescript-eslint/parser'

export default [
  { ignores: ['dist', 'src/design/generated', '**/*.d.ts'] },
  {
    ...jsxA11y.flatConfigs.recommended,
    files: ['src/**/*.{ts,tsx,jsx}'],
    languageOptions: {
      ...jsxA11y.flatConfigs.recommended.languageOptions,
      parser: tsParser,
    },
  },
]
