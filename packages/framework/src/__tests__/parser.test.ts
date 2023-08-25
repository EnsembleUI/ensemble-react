import fs from "node:fs";
import { EnsembleParser } from "../parser";

test("parses simple view widget", () => {
  const testFile = fs.readFileSync(
    `${__dirname}/__resources__/helloworld.yaml`,
  );
  const screen = EnsembleParser.parseScreen("test", testFile.toString());

  expect(screen.name).toEqual("test");
  expect(screen.body).toMatchObject({
    Column: {
      children: [
        {
          Text: {
            text: "Peter Parker",
          },
        },
      ],
    },
  });
});
