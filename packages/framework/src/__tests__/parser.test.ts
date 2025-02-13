import fs from "node:fs";
import { parse } from "yaml";
import type { EnsembleScreenYAML, EnsembleWidgetYAML } from "../parser";
import { EnsembleParser } from "../parser";
import type { ApplicationDTO } from "../shared";

test("parses simple view widget", () => {
  const app = {
    screens: [
      {
        name: "test",
        content: fs
          .readFileSync(`${__dirname}/__resources__/helloworld.yaml`)
          .toString(),
      },
    ],
    scripts: [],
    name: "test",
    id: "test",
  } as unknown as ApplicationDTO;

  const testFile = fs.readFileSync(
    `${__dirname}/__resources__/helloworld.yaml`,
  );
  const screen = EnsembleParser.parseScreen(
    "test",
    "test",
    parse(testFile.toString()) as EnsembleScreenYAML,
    app,
  );

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
  });
});

test("parse single default theme", () => {
  const app = EnsembleParser.parseApplication({
    screens: [
      {
        name: "home",
        content: fs
          .readFileSync(`${__dirname}/__resources__/helloworld.yaml`)
          .toString(),
      },
    ],
    theme: {
      id: "theme",
      content: fs
        .readFileSync(`${__dirname}/__resources__/oldtheme.yaml`)
        .toString(),
    },
    scripts: [],
    name: "test",
    id: "test",
  } as unknown as ApplicationDTO);

  expect(app).toMatchObject({
    id: "test",
    menu: undefined,
    customWidgets: [],
    themes: {
      default: {},
    },
  });
});

test("parse multiple theme in a single file", () => {
  const app = EnsembleParser.parseApplication({
    screens: [
      {
        name: "home",
        content: fs
          .readFileSync(`${__dirname}/__resources__/helloworld.yaml`)
          .toString(),
      },
    ],
    theme: {
      id: "theme",
      content: fs
        .readFileSync(`${__dirname}/__resources__/newtheme.yaml`)
        .toString(),
    },
    scripts: [],
    name: "test",
    id: "test",
  } as unknown as ApplicationDTO);

  expect(app).toMatchObject({
    id: "test",
    menu: undefined,
    customWidgets: [],
    themes: {
      Light: {},
      Dark: {},
    },
  });
});

test("throws error when widget API name conflicts with screen API name", () => {
  const appConfig = {
    widgets: [
      {
        id: "DispatchButton",
        name: "DispatchButton",
        content: fs
          .readFileSync(`${__dirname}/__resources__/mycustomwidget.yaml`)
          .toString(),
      },
    ],
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
  } as unknown as ApplicationDTO;

  expect(() => {
    EnsembleParser.parseApplication(appConfig);
  }).toThrow(
    "Application has multiple apis with the same name (getDummyProducts) on (home) screen in (home, DispatchButton) widgets.",
  );
});
