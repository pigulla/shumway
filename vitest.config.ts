import { defineConfig } from 'vitest/config'

export default defineConfig({
    test: {
        globals: true,
        environment: 'node',
        clearMocks: true,
        mockReset: true,
        include: ['src/**/*.spec.ts', 'test/**/*.spec.ts'],
        coverage: {
            provider: 'v8',
            reporter: ['html', 'lcov', 'text'],
            include: ['src/**/*.ts', 'test/**/*.use-case.ts'],
            exclude: [
                'src/**/index.ts',
                'src/**/mock.ts',
                'src/handler/handler.ts',
                'src/**/*.d.ts',
                'src/**/*.error.ts',
                'src/**/*.options.ts',
                'src/**/*.mock.ts',
            ],
            thresholds: {
                branches: 100,
                functions: 100,
                lines: 100,
                statements: 100,
            },
        },
    },
})
