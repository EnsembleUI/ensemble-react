module.exports = {
  extends: ["custom/react"],
  rules: {
    "unicorn/filename-case": [
      "error",
      {
        "cases": {
          "camelCase": true
        }
      }
    ],
    "@typescript-eslint/no-invalid-void-type": [
      "warn",
      {
        allowInGenericTypeArguments: true
      }
    ]
  }
};
