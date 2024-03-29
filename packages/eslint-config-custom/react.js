const { resolve } = require("node:path");

const project = resolve(process.cwd(), "tsconfig.json");

/*
 * This is a custom ESLint configuration for use with
 * internal (bundled by their consumer) libraries
 * that utilize React.
 *
 * This config extends the Vercel Engineering Style Guide.
 * For more information, see https://github.com/vercel/style-guide
 *
 */

module.exports = {
  extends: [
    "@vercel/style-guide/eslint/browser",
    "@vercel/style-guide/eslint/typescript",
    "@vercel/style-guide/eslint/react",
  ].map(require.resolve)
    .concat(["plugin:prettier/recommended", "plugin:react-hooks/recommended"]),
  plugins: ["prettier"],
  parserOptions: {
    project,
  },
  globals: {
    JSX: true,
  },
  settings: {
    "import/resolver": {
      typescript: {
        project,
      },
    },
  },
  ignorePatterns: ["node_modules/", "dist/", ".eslintrc.js"],
  // add rules configurations here
  rules: {
    "prettier/prettier": "error",
    "import/no-default-export": "off",
    "@typescript-eslint/consistent-indexed-object-style": [1, "index-signature"],
    "react/function-component-definition": [
      2,
      {
        namedComponents: "arrow-function",
      },
    ]
  },
};
