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

test("parses recursively", () => {
  const testFile = fs.readFileSync(`${__dirname}/__resources__/popupmenu.yaml`);

  const screen = EnsembleParser.parseScreen(
    "test",
    parse(testFile.toString()) as EnsembleScreenYAML,
  ) as EnsembleScreenModel;

  expect(screen.name).toEqual("test");
  expect(screen.body).toMatchObject({
    name: "PopupMenu",
    properties: {
      widget: {
        Column: {
          styles: {
            backgroundColor: "blue",
            padding: 10,
          },
          children: [{ Button: { label: null } }, { Text: { text: "Hello" } }],
        },
      },
      items: [
        { label: "Red", value: "red" },
        { label: "Blue", value: "blue" },
        { label: "Green", value: "green" },
      ],
      onItemSelect: {
        executeCode: 'myText.setText("Spiderman")',
      },
    },
  });
});
