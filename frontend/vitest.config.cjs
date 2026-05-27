module.exports = {
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './src/setupTests.ts',
    include: [
      'src/**/*.vitest.*',
      'src/**/__tests__/**/*.vitest.*',
      'src/**/*.test.*',
      'src/**/__tests__/**/*.test.*',
    ],
  },
  // Vite options to help with RTK and other ESM transform artifacts during tests
  vite: {
    server: {
      deps: {
        inline: ['@reduxjs/toolkit', 'react-redux'],
      },
    },
    optimizeDeps: {
      include: ['@reduxjs/toolkit', 'react-redux'],
    },
    test: {
      transformMode: {
        web: [/.*\.([jt]sx?)$/],
      },
    },
  },
}
