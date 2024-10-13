import typescriptEslint from '@typescript-eslint/eslint-plugin';
import prettier from 'eslint-plugin-prettier';
import globals from 'globals';
import tsParser from '@typescript-eslint/parser';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import js from '@eslint/js';
import { FlatCompat } from '@eslint/eslintrc';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const compat = new FlatCompat({
    baseDirectory: __dirname,
    recommendedConfig: js.configs.recommended,
    allConfig: js.configs.all,
});

export default [
    {
        files: ['**/*.ts', '**/*.js'],
    },
    {
        ignores: [
            '**/node_modules',
            '**/dist',
            '**/*.yml',
            '**/*.json',
            '**/*.md',
            '**/Dockerfile',
            'docs/**/*.*',
        ],
    },
    ...compat.extends('prettier', 'plugin:prettier/recommended'),
    {
        plugins: {
            '@typescript-eslint': typescriptEslint,
            prettier,
        },

        languageOptions: {
            globals: {
                ...globals.node,
            },

            parser: tsParser,
            ecmaVersion: 6,
            sourceType: 'module',

            parserOptions: {
                ecmaFeatures: {
                    modules: true,
                },
            },
        },

        rules: {},
    },
];
