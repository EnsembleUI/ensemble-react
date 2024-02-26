/* eslint-env node */
/** @type {import('ts-jest').JestConfigWithTsJest} */
module.exports = {
  preset: "ts-jest",
  testEnvironment: "jsdom",
  moduleNameMapper: {
    "^lodash-es$": "lodash",
  },
  setupFilesAfterEnv: ["<rootDir>/setupTests.ts"],
};
