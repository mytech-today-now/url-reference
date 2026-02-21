module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  transform: {
    '^.+\\.ts$': 'ts-jest',
  },
  transformIgnorePatterns: [
    'node_modules/(?!(unified|remark-parse|remark-stringify|remark-frontmatter|micromark|mdast-util-from-markdown|mdast-util-to-markdown|mdast-util-frontmatter|unist-util-visit|unist-util-is|unist-util-stringify-position|bail|is-plain-obj|trough|vfile|vfile-message)/)',
  ],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
    '!src/**/*.test.ts',
    '!src/**/*.spec.ts',
    '!src/cli.ts', // CLI is tested via integration tests
    '!src/index.ts', // Entry point with only exports
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  moduleFileExtensions: ['ts', 'js', 'json'],
  verbose: true,
};

