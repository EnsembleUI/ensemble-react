import fs from "node:fs";
import { parse } from "yaml";
import type { EnsembleScreenYAML, EnsembleWidgetYAML } from "../parser";
import { EnsembleParser } from "../parser";
import type { ApplicationDTO, EnsembleScreenModel } from "../shared";

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

test("parses custom widget", () => {
  const testFile = fs.readFileSync(
    `${__dirname}/__resources__/mycustomwidget.yaml`,
  );
  const widget = EnsembleParser.parseWidget(
    "mycustomwidget",
    parse(testFile.toString()) as EnsembleWidgetYAML,
  );

  expect(widget.name).toEqual("mycustomwidget");
  expect(widget.inputs).toEqual(["name"]);
  expect(widget.onLoad).toMatchObject({ executeCode: 'console.log("foo")\n' });
  expect(widget.body).toMatchObject({
    name: "Text",
    properties: {
      text: "bar",
    },
  });
});

test("parses application with no custom widgets", () => {
  const app = EnsembleParser.parseApplication({
    screens: [
      {
        name: "home",
        content: fs
          .readFileSync(`${__dirname}/__resources__/helloworld.yaml`)
          .toString(),
      },
    ],
    scripts: [],
    name: "test",
    id: "test",
  } as unknown as ApplicationDTO);

  expect(app).toMatchObject({
    id: "test",
    menu: undefined,
    customWidgets: [],
    theme: undefined,
  });
});
