import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter } from "react-router-dom";
import { EnsembleScreen } from "../../runtime/screen";
import "../index";

describe("Collapsible Widget", () => {
  test("test collapsible widget", async () => {
    render(
      <EnsembleScreen
        screen={{
          name: "test_collapsible",
          id: "test_collapsible",
          body: {
            name: "Column",
            properties: {
              children: [
                {
                  name: "Collapsible",
                  properties: {
                    "item-template": {
                      data: "[{ id: '1', name: 'Apple'}, { id: '2', name: 'Mango'},{ id: '3', name: 'Banana'}]",
                      name: "fruit",
                      template: {
                        name: "CollapsibleItem",
                        properties: {
                          key: `\${fruit.id}`,
                          label: { Text: { text: `\${fruit.id}` } },
                          children: { Text: { text: `\${fruit.name}` } },
                        },
                      },
                    },
                  },
                },
              ],
            },
          },
        }}
      />,
      { wrapper: BrowserRouter },
    );

    await waitFor(() => {
      expect(screen.getByText("1")).toBeVisible();
      expect(screen.getByText("2")).toBeVisible();
      expect(screen.getByText("3")).toBeVisible();
      expect(screen.queryByText("Apple")).not.toBeInTheDocument();
      expect(screen.queryByText("Mango")).not.toBeInTheDocument();
      expect(screen.queryByText("Banana")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("2"));
    fireEvent.click(screen.getByText("3"));

    await waitFor(() => {
      expect(screen.queryByText("Apple")).not.toBeInTheDocument();
      expect(screen.queryByText("Mango")).toBeVisible();
      expect(screen.queryByText("Banana")).toBeVisible();
    });

    fireEvent.click(screen.getByText("1"));
    fireEvent.click(screen.getByText("3"));

    await waitFor(() => {
      expect(screen.queryByText("Apple")).toBeVisible();
      expect(screen.queryByText("Mango")).toBeVisible();
      expect(screen.queryByText("Banana")).not.toBeVisible();
    });
  });

  test("test collapsible widget data change conditionally", async () => {
    render(
      <EnsembleScreen
        screen={{
          name: "test_collapsible",
          id: "test_collapsible",
          body: {
            name: "Column",
            properties: {
              children: [
                {
                  name: "Collapsible",
                  properties: {
                    "item-template": {
                      data: `\${ensemble.storage.get('fruits')}`,
                      name: "fruit",
                      template: {
                        name: "CollapsibleItem",
                        properties: {
                          key: `\${fruit.id}`,
                          label: { Text: { text: `\${fruit.id}` } },
                          children: { Text: { text: `\${fruit.name}` } },
                        },
                      },
                    },
                  },
                },
                {
                  name: "Button",
                  properties: {
                    label: "Set Fruits",
                    onTap: {
                      executeCode: {
                        body: "ensemble.storage.set('fruits', [{ id: '4', name: 'Strawberry'},{ id: '5', name: 'Avocado'}])",
                      },
                    },
                  },
                },
              ],
            },
          },
          onLoad: {
            executeCode: {
              body: `ensemble.storage.set('fruits', [{ id: '1', name: 'Apple'},{ id: '2', name: 'Mango'},{ id: '3', name: 'Banana'}])`,
            },
          },
        }}
      />,
      { wrapper: BrowserRouter },
    );

    await waitFor(() => {
      expect(screen.getByText("1")).toBeVisible();
      expect(screen.getByText("2")).toBeVisible();
      expect(screen.getByText("3")).toBeVisible();
      expect(screen.queryByText("Apple")).not.toBeInTheDocument();
      expect(screen.queryByText("Mango")).not.toBeInTheDocument();
      expect(screen.queryByText("Banana")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("Set Fruits"));

    await waitFor(() => {
      expect(screen.queryByText("1")).not.toBeInTheDocument();
      expect(screen.queryByText("2")).not.toBeInTheDocument();
      expect(screen.queryByText("3")).not.toBeInTheDocument();
      expect(screen.queryByText("Apple")).not.toBeInTheDocument();
      expect(screen.queryByText("Mango")).not.toBeInTheDocument();
      expect(screen.queryByText("Banana")).not.toBeInTheDocument();

      expect(screen.getByText("4")).toBeVisible();
      expect(screen.getByText("5")).toBeVisible();
      expect(screen.queryByText("Strawberry")).not.toBeInTheDocument();
      expect(screen.queryByText("Avocado")).not.toBeInTheDocument();
    });

    fireEvent.click(screen.getByText("4"));
    fireEvent.click(screen.getByText("5"));

    await waitFor(() => {
      expect(screen.queryByText("Strawberry")).toBeVisible();
      expect(screen.queryByText("Avocado")).toBeVisible();
    });

    fireEvent.click(screen.getByText("4"));

    await waitFor(() => {
      expect(screen.queryByText("Strawberry")).not.toBeVisible();
      expect(screen.queryByText("Avocado")).toBeVisible();
    });
  });
});
