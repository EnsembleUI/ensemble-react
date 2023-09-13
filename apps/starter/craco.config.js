const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  // ...
  webpack: {
    configure: {
      module: {
        rules: [
          {
            test: /\.yaml$/i,
            type: "asset/source",
          },
        ],
      },
      resolve: {
        fallback: {
          fs: false,
        },
      },
    },
    plugins: {
      add: [
        new NodePolyfillPlugin({
          excludeAliases: ["console"],
        }),
      ],
    },
  },
  jest: {
    moduleNameMapper: {
      "^lodash-es$": "lodash",
    },
  },
};
