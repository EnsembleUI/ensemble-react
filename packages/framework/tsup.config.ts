import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/index.ts"],
  format: ["cjs"],
  external: ["react"],
  bundle: true,
  splitting: false,
  dts: true,
  clean: true,
});
