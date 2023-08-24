import type { PlopTypes } from "@turbo/gen";

// Learn more about Turborepo Generators at https://turbo.build/repo/docs/core-concepts/monorepos/code-generation

export default function generator(plop: PlopTypes.NodePlopAPI): void {
  // A simple generator to add a new React widget to the internal UI library
  plop.setGenerator("react-widget", {
    description: "Adds a new react widget",
    prompts: [
      {
        type: "input",
        name: "name",
        message: "What is the name of the widget?",
      },
    ],
    actions: [
      {
        type: "add",
        path: "src/widgets/{{pascalCase name}}.tsx",
        templateFile: "templates/component.hbs",
      },
      {
        type: "append",
        path: "src/widgets/index.tsx",
        pattern: /(?<insertion>\/\/ component exports)/g,
        template: 'export * from "./{{pascalCase name}}";',
      },
    ],
  });
}
