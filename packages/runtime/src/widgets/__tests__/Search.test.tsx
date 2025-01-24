import { render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import userEvent from "@testing-library/user-event";
import { EnsembleScreen } from "../../runtime/screen";
import "../index";

describe("Search Widget", () => {
  test("searchKey test", async () => {
    render(
      <EnsembleScreen
        screen={{
          name: "test_search",
          id: "test_search",
          body: {
            name: "Search",
            properties: {
              id: "searchTest",
              placeholder: "Enter Search",
              searchKey: `\${ensemble.storage.get('searchKey')}`,
              "item-template": {
                data: [
                  { name: "Apple" },
                  { name: "Pineapple" },
                  { name: "Banana" },
                ],
                name: "fruit",
                template: {
                  name: "Text",
                  properties: {
                    text: `\${fruit.name}`,
                  },
                },
              },
            },
          },
          onLoad: {
            executeCode: "ensemble.storage.set('searchKey', 'name')",
          },
        }}
      />,
      { wrapper: BrowserRouter },
    );

    await waitFor(() => {
      userEvent.type(screen.getByRole("combobox"), "app");
    });

    await waitFor(() => {
      const optionElements = screen.getAllByRole("option");
      optionElements.forEach((option) => {
        expect(option).toBeVisible();
      });
    });
  });
});
