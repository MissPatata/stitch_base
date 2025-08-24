module.exports = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    roots: ['<rootDir>/src'],
    testMatch: ['**/__tests__/**/*.(ts|js)', '**/*.(test|spec).(ts|js)'],
    transform: {
        '^.+\\.(ts|tsx)$': [
            'ts-jest',
            {
                tsconfig: {
                    target: 'ES2020',
                    module: 'CommonJS',
                    moduleResolution: 'node',
                    experimentalDecorators: true,
                    emitDecoratorMetadata: true,
                    esModuleInterop: true,
                    allowSyntheticDefaultImports: true,
                    skipLibCheck: true,
                    strict: false,
                    useDefineForClassFields: false,
                },
            },
        ],
    },
    moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
    setupFilesAfterEnv: ['<rootDir>/src/db/test/setup.ts'],
    testTimeout: 30000, // 30 seconds for database operations
};
