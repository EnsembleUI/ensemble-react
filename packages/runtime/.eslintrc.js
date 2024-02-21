module.exports = {
  extends: ["custom/react"],
  rules: {
    "unicorn/filename-case": [
      "error",
      {
        "cases": {
          "camelCase": true,
          "pascalCase": true
        }
      }
    ]
  },
  ignorePatterns: ["setupTests.ts"]
};
