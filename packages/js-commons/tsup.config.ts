import { defineConfig } from "tsup";

export default defineConfig({
  entry: {
    core: "src/core/index.ts",
    browser: "src/browser/index.ts"
  },
  format: ["cjs", "esm"],
  external: ["react"],
  bundle: true,
  clean: true,
  dts: true,
});
