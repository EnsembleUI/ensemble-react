import React from "react";
import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import "@testing-library/jest-dom";
import { BrowserRouter, MemoryRouter, useLocation } from "react-router-dom";
import { Link } from "../Link";
import { Button } from "../Button";
// Import widgets to register them for testing
import "../index";

// Mock window.open
const mockOpen = jest.fn();
const originalOpen = window.open;

beforeAll(() => {
  window.open = mockOpen;
});

afterAll(() => {
  window.open = originalOpen;
});

beforeEach(() => {
  mockOpen.mockClear();
});

describe("Link Widget", () => {
  test("renders internal link with text children", () => {
    render(
      <Link
        url="/about"
        widget={{
          Text: { text: "About Us" },
        }}
      />,
      { wrapper: BrowserRouter },
    );

    const linkElement = screen.getByText("About Us");
    expect(linkElement).toBeInTheDocument();
    expect(linkElement.closest("a")).toHaveAttribute("href", "/about");
  });

  test("renders external link with correct attributes", () => {
    render(
      <Link
        openNewTab
        url="https://google.com"
        widget={{
          Text: { text: "Google" },
        }}
      />,
      { wrapper: BrowserRouter },
    );

    const linkElement = screen.getByText("Google");
    const anchorElement = linkElement.closest("a");

    expect(anchorElement).toHaveAttribute("href", "https://google.com");
    expect(anchorElement).toHaveAttribute("target", "_blank");
    expect(anchorElement).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("renders with custom styles", () => {
    render(
      <Link
        styles={{
          color: "red",
          textDecoration: "none",
          fontSize: "16px",
          fontWeight: "bold",
        }}
        url="/test"
        widget={{
          Text: { text: "Styled Link" },
        }}
      />,
      { wrapper: BrowserRouter },
    );

    const linkElement = screen.getByText("Styled Link");
    const anchorElement = linkElement.closest("a");

    expect(anchorElement).toHaveStyle({
      color: "red",
      textDecoration: "none",
      fontSize: "16px",
      fontWeight: "bold",
    });
  });

  test("handles internal navigation with React Router", async () => {
    let currentLocation: ReturnType<typeof useLocation>;

    const LocationTracker = (): null => {
      const location = useLocation();
      currentLocation = location;
      return null;
    };

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LocationTracker />
        <Link
          url="/widgets"
          widget={{
            Text: { text: "Widgets" },
          }}
        />
      </MemoryRouter>,
    );

    const linkElement = screen.getByText("Widgets");
    fireEvent.click(linkElement);

    await waitFor(() => {
      expect(currentLocation.pathname).toBe("/widgets");
    });
  });

  test("handles external navigation by opening new window/tab", () => {
    render(
      <Link
        url="https://example.com"
        widget={{
          Text: { text: "External Link" },
        }}
      />,
      { wrapper: BrowserRouter },
    );

    const linkElement = screen.getByText("External Link");
    const anchorElement = linkElement.closest("a");

    // External links should be handled as regular anchor links, not window.open
    expect(anchorElement).toHaveAttribute("href", "https://example.com");
    expect(anchorElement).toHaveAttribute("target", "_self");
  });

  test("handles external navigation with openNewTab", () => {
    render(
      <Link
        openNewTab
        url="https://example.com"
        widget={{
          Text: { text: "External Link" },
        }}
      />,
      { wrapper: BrowserRouter },
    );

    const linkElement = screen.getByText("External Link");
    const anchorElement = linkElement.closest("a");

    // External links with openNewTab should be handled as regular anchor links with target="_blank"
    expect(anchorElement).toHaveAttribute("href", "https://example.com");
    expect(anchorElement).toHaveAttribute("target", "_blank");
    expect(anchorElement).toHaveAttribute("rel", "noopener noreferrer");
  });

  test("executes onTap action when clicked", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(jest.fn());

    render(
      <Link
        onTap={{
          executeCode: "console.log('Link clicked')",
        }}
        url="/test"
        widget={{
          Text: { text: "Clickable Link" },
        }}
      />,
      { wrapper: BrowserRouter },
    );

    const linkElement = screen.getByText("Clickable Link");
    fireEvent.click(linkElement);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("Link clicked");
    });

    consoleSpy.mockRestore();
  });

  test("renders with replace prop for internal navigation", async () => {
    let currentLocation: ReturnType<typeof useLocation>;

    const LocationTracker = (): null => {
      const location = useLocation();
      currentLocation = location;
      return null;
    };

    render(
      <MemoryRouter initialEntries={["/start"]}>
        <LocationTracker />
        <Link
          replace
          url="/actions"
          widget={{
            Text: { text: "Replace Navigation" },
          }}
        />
      </MemoryRouter>,
    );

    const linkElement = screen.getByText("Replace Navigation");
    fireEvent.click(linkElement);

    await waitFor(() => {
      expect(currentLocation.pathname).toBe("/actions");
    });
  });

  test("renders with inputs prop for internal navigation", async () => {
    let currentLocation: ReturnType<typeof useLocation>;

    const LocationTracker = (): null => {
      const location = useLocation();
      currentLocation = location;
      return null;
    };

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LocationTracker />
        <Link
          inputs={{ userId: 123, tab: "widgets" }}
          url="/with-inputs"
          widget={{
            Text: { text: "Link with Inputs" },
          }}
        />
      </MemoryRouter>,
    );

    const linkElement = screen.getByText("Link with Inputs");
    fireEvent.click(linkElement);

    await waitFor(() => {
      expect(currentLocation.pathname).toBe("/with-inputs");
      expect(currentLocation.state).toEqual({ userId: 123, tab: "widgets" });
    });
  });

  test("renders as span when no url is provided", () => {
    render(
      <Link
        url=""
        widget={{
          Text: { text: "No URL" },
        }}
      />,
      { wrapper: BrowserRouter },
    );

    const linkElement = screen.getByText("No URL");
    expect(linkElement.tagName).toBe("SPAN");
  });

  test("handles mailto and tel links as external", () => {
    render(
      <>
        <Link
          url="mailto:test@example.com"
          widget={{
            Text: { text: "Email Link" },
          }}
        />
        <Link
          url="tel:+1234567890"
          widget={{
            Text: { text: "Phone Link" },
          }}
        />
      </>,
      { wrapper: BrowserRouter },
    );

    const emailLink = screen.getByText("Email Link").closest("a");
    const phoneLink = screen.getByText("Phone Link").closest("a");

    expect(emailLink).toHaveAttribute("href", "mailto:test@example.com");
    expect(phoneLink).toHaveAttribute("href", "tel:+1234567890");
  });

  test("handles hover styles correctly", () => {
    render(
      <Link
        styles={{
          color: "blue",
          hoverColor: "red",
          textDecoration: "underline",
          hoverTextDecoration: "none",
        }}
        url="/test"
        widget={{
          Text: { text: "Hover Link" },
        }}
      />,
      { wrapper: BrowserRouter },
    );

    const linkElement = screen.getByText("Hover Link");
    const anchorElement = linkElement.closest("a")!;

    // Test initial styles
    expect(anchorElement).toHaveStyle({
      color: "blue",
      textDecoration: "underline",
    });

    // Test hover
    fireEvent.mouseEnter(anchorElement);
    expect(anchorElement).toHaveStyle({
      color: "red",
      textDecoration: "none",
    });

    // Test mouse leave
    fireEvent.mouseLeave(anchorElement);
    expect(anchorElement).toHaveStyle({
      color: "blue",
      textDecoration: "underline",
    });
  });

  test("renders with visibility hidden when visible is false", () => {
    render(
      <Link
        styles={{ visible: false }}
        url="/test"
        widget={{
          Text: { text: "Hidden Link" },
        }}
      />,
      { wrapper: BrowserRouter },
    );

    const linkElement = screen.getByText("Hidden Link");
    const anchorElement = linkElement.closest("a");

    expect(anchorElement).toHaveStyle({ display: "none" });
  });

  test("handles complex children with multiple widgets", () => {
    render(
      <Link
        url="/complex"
        widget={{
          Row: {
            children: [
              {
                Text: { text: "Start " },
              },
              {
                Icon: { name: "home" },
              },
              {
                Text: { text: " End" },
              },
            ],
          },
        }}
      />,
      { wrapper: BrowserRouter },
    );

    expect(screen.getByText("Start")).toBeInTheDocument();
    expect(screen.getByText("End")).toBeInTheDocument();
  });

  test("handles URL binding updates", async () => {
    render(
      <>
        <Link
          id="dynamicLink"
          url={`/\${ensemble.storage.get('linkUrl')}`}
          widget={{
            Text: { text: "Dynamic Link" },
          }}
        />
        <Button
          label="Update URL"
          onTap={{
            executeCode: "ensemble.storage.set('linkUrl', 'widgets')",
          }}
        />
      </>,
      { wrapper: BrowserRouter },
    );

    const linkElement = screen.getByText("Dynamic Link");
    let anchorElement = linkElement.closest("a");

    // Initially should show the binding expression literally (since storage is empty)
    expect(anchorElement?.getAttribute("href")).toBe("/undefined");

    const updateButton = screen.getByText("Update URL");
    fireEvent.click(updateButton);

    await waitFor(() => {
      anchorElement = linkElement.closest("a");
      expect(anchorElement).toHaveAttribute("href", "/widgets");
    });
  });

  test("handles both onTap action and navigation", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(jest.fn());
    let currentLocation: ReturnType<typeof useLocation>;

    const LocationTracker = (): null => {
      const location = useLocation();
      currentLocation = location;
      return null;
    };

    render(
      <MemoryRouter initialEntries={["/"]}>
        <LocationTracker />
        <Link
          onTap={{
            executeCode: "console.log('Action executed before navigation')",
          }}
          url="/forms"
          widget={{
            Text: { text: "Action + Nav Link" },
          }}
        />
      </MemoryRouter>,
    );

    const linkElement = screen.getByText("Action + Nav Link");
    fireEvent.click(linkElement);

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Action executed before navigation",
      );
      expect(currentLocation.pathname).toBe("/forms");
    });

    consoleSpy.mockRestore();
  });
});

describe("Link Widget Integration Tests", () => {
  test("integrates with form actions and navigation", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation(jest.fn());

    render(
      <>
        <Button
          label="Set User Data"
          onTap={{
            executeCode: "ensemble.storage.set('userId', 123)",
          }}
        />
        <Link
          inputs={{ userId: `\${ensemble.storage.get('userId')}` }}
          onTap={{
            executeCode:
              "console.log('Navigating to widgets with userId:', ensemble.storage.get('userId'))",
          }}
          url="/widgets"
          widget={{
            Text: { text: "Go to Widgets" },
          }}
        />
      </>,
      { wrapper: BrowserRouter },
    );

    // Set user data first
    const setDataButton = screen.getByText("Set User Data");
    fireEvent.click(setDataButton);

    await waitFor(() => {
      const linkElement = screen.getByText("Go to Widgets");
      fireEvent.click(linkElement);
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith(
        "Navigating to widgets with userId:",
        123,
      );
    });

    consoleSpy.mockRestore();
  });
});
