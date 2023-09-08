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
    },
  },
};
