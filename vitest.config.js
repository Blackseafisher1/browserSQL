import { defineConfig } from 'vitest/config';
import { resolve } from 'path';

export default defineConfig({
  test: {
    environment: 'jsdom',
    setupFiles: ['./vitest.setup.js'],
    server: {
      deps: {
        fallbackCJS: true,
      },
    },
    alias: {
      '@codemirror/view': resolve(__dirname, '__mocks__/cm-stub.js'),
      '@codemirror/state': resolve(__dirname, '__mocks__/cm-stub.js'),
      '@codemirror/commands': resolve(__dirname, '__mocks__/cm-stub.js'),
      '@codemirror/language': resolve(__dirname, '__mocks__/cm-stub.js'),
      '@codemirror/autocomplete': resolve(__dirname, '__mocks__/cm-stub.js'),
      '@codemirror/lang-sql': resolve(__dirname, '__mocks__/cm-stub.js'),
      '@codemirror/lang-markdown': resolve(__dirname, '__mocks__/cm-stub.js'),
      '@codemirror/search': resolve(__dirname, '__mocks__/cm-stub.js'),
      '@codemirror/lint': resolve(__dirname, '__mocks__/cm-stub.js'),
      '@lezer/highlight': resolve(__dirname, '__mocks__/cm-stub.js'),
      '@lezer/common': resolve(__dirname, '__mocks__/cm-stub.js'),
      'style-mod': resolve(__dirname, '__mocks__/cm-stub.js'),
      'w3c-keyname': resolve(__dirname, '__mocks__/cm-stub.js'),
      crelt: resolve(__dirname, '__mocks__/cm-stub.js'),
      '@marijn/find-cluster-break': resolve(__dirname, '__mocks__/cm-stub.js'),
    },
  },
});
