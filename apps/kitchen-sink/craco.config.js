const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

module.exports = {
  webpack: {
    configure: {
      module: {
        rules: [
          {
            test: /\.yaml$/i,
            type: "asset/source",
          },
          {
            resourceQuery: /raw/,
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
  devServer: {
    port: 4000,
  },
  jest: {
    moduleNameMapper: {
      "^lodash-es$": "lodash",
    },
  },
};
