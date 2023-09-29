import fs from "node:fs";
import { parse } from "yaml";
import type { EnsembleScreenYAML } from "../parser";
import { EnsembleParser } from "../parser";
import type { EnsembleScreenModel } from "../shared";

test("parses simple view widget", () => {
  const testFile = fs.readFileSync(
    `${__dirname}/__resources__/helloworld.yaml`,
  );
  const screen = EnsembleParser.parseScreen(
    "test",
    parse(testFile.toString()) as EnsembleScreenYAML,
  ) as EnsembleScreenModel;

  expect(screen.name).toEqual("test");
  expect(screen.body).toMatchObject({
    name: "Column",
    properties: {
      children: [
        {
          name: "Text",
          properties: {
            text: "Peter Parker",
          },
        },
      ],
    },
  });
});
