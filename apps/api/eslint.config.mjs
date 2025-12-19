import eslint from '@eslint/js';
import tseslint from 'typescript-eslint';
import eslintPluginNestjs from '@darraghor/eslint-plugin-nestjs-typed';
import eslintPluginPrettier from 'eslint-plugin-prettier/recommended';
import globals from 'globals';

export default tseslint.config(
  {
    ignores: ['dist/**', 'node_modules/**', '*.js'],
  },
  eslint.configs.recommended,
  // 타입 체크 오류 수정 전까지 recommended 사용 (recommendedTypeChecked 대신)
  ...tseslint.configs.recommended,
  eslintPluginNestjs.configs.flatRecommended,
  {
    languageOptions: {
      globals: {
        ...globals.node,
      },
      parserOptions: {
        project: './tsconfig.json',
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    rules: {
      // TypeScript strict rules
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_' },
      ],
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/explicit-function-return-type': 'off',
      '@typescript-eslint/explicit-module-boundary-types': 'off',
      // 타입 체크 오류 수정 후 다시 활성화할 규칙들:
      // '@typescript-eslint/no-floating-promises': 'error',
      // '@typescript-eslint/require-await': 'error',

      // General rules
      'no-console': ['warn', { allow: ['warn', 'error'] }],
    },
  },
  eslintPluginPrettier,
);
