import { act, renderHook } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { useActionGroup } from "../useEnsembleAction";

test("execute multiple actions", () => {
  const logSpy = jest.spyOn(console, "log");
  const { result } = renderHook(
    () =>
      useActionGroup({
        actions: [
          {
            executeCode: 'console.log("foo")',
          },
          {
            executeCode: 'console.log("bar")',
          },
        ],
      }),
    {
      wrapper: BrowserRouter,
    },
  );

  act(() => {
    result.current?.callback();
  });

  expect(logSpy).toHaveBeenCalledWith("foo");
  expect(logSpy).toHaveBeenCalledWith("bar");
});
test.todo("fetch multiple APIs");
test.todo("mutate multiple storage variables");
