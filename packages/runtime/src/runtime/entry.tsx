import {
  type EnsembleEntryPoint,
  type EnsembleScreenModel,
} from "@ensembleui/react-framework";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { RenderMenu } from "./menu";
import { EnsembleScreen } from "./screen";

interface EnsembleEntryProps {
  entry: EnsembleEntryPoint;
  screen?: EnsembleScreenModel;
}
export const EnsembleEntry: React.FC<EnsembleEntryProps> = ({
  entry,
  screen: initialScreen,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const [isCollapsed, setCollapsed] = useState(false);

  const hasMenu = "items" in entry;
  useEffect(() => {
    const path = location.pathname;

    // If path is not root, render screen on that path. ex: /about
    if (path !== "/") {
      return;
    }

    if (initialScreen && path !== initialScreen.name.toLowerCase()) {
      navigate({
        pathname: initialScreen.name.toLowerCase(),
        search: location.search,
      });
      return;
    }

    if (hasMenu) {
      const selectedItem =
        entry.items.find((item) => item.selected) ?? entry.items[0];
      navigate({
        pathname: selectedItem.page.toLowerCase(),
        search: location.search,
      });
      return;
    }

    navigate({ pathname: entry.name.toLowerCase(), search: location.search });
  }, [entry, hasMenu, navigate, location, initialScreen]);

  if (hasMenu) {
    return (
      <RenderMenu
        type={entry.type}
        menu={{
          id: entry?.id,
          items: entry.items,
          header: entry?.header,
          footer: entry?.footer,
          styles: entry?.styles,
          isCollapsed,
          setCollapsed,
        }}
      />
    );
  }

  if (location.pathname !== "/") {
    return (
      <div
        style={{
          flexGrow: 1,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Outlet />
      </div>
    );
  }

  return (
    <div
      style={{
        flexGrow: 1,
        height: "100vh",
        display: "flex",
        flexDirection: "column",
      }}
    >
      <EnsembleScreen screen={entry} />
    </div>
  );
};
