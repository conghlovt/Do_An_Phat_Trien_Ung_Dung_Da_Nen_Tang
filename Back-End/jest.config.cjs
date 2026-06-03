module.exports = {
  clearMocks: true,
  moduleFileExtensions: ["ts", "js", "json"],
  roots: ["<rootDir>/tests"],
  testEnvironment: "node",
  testMatch: ["**/*.test.ts"],
  transform: {
    "^.+\\.ts$": [
      "ts-jest",
      {
        diagnostics: false,
        tsconfig: {
          allowJs: true,
          allowSyntheticDefaultImports: true,
          esModuleInterop: true,
          isolatedModules: true,
          module: "CommonJS",
          moduleResolution: "Node",
          noImplicitAny: false,
          noUncheckedSideEffectImports: false,
          resolveJsonModule: true,
          target: "ES2022",
          types: ["jest", "node"],
          verbatimModuleSyntax: false
        }
      }
    ]
  }
};
