const { pathsToModuleNameMapper } = require("ts-jest");
const json5 = require("json5");
const fs = require("fs");
const path = require("path");
const { compilerOptions } = json5.parse(
  fs.readFileSync(path.resolve(__dirname, "tsconfig.json"))
);

/** @type {import('ts-jest/dist/types').InitialOptionsTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  extensionsToTreatAsEsm: [".ts"],
  globals: {
    "ts-jest": {
      useESM: true,
    },
  },
  testMatch: [
    "**/tests/*.spec.ts",
    "**/src/**/*.spec.ts",
    "!**/src/ng/**/*.spec.ts"
  ],
  modulePathIgnorePatterns: [
    'node_modules/@angular/.*'
  ],
  moduleNameMapper: pathsToModuleNameMapper(
    compilerOptions.paths /*, { prefix: '<rootDir>/' } */
  )
};
