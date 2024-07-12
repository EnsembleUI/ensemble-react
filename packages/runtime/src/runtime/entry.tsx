import {
  type EnsembleEntryPoint,
  type EnsembleScreenModel,
} from "@ensembleui/react-framework";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { SideBarMenu } from "./menu";
import { EnsembleScreen } from "./screen";
import { keys } from "lodash-es";

interface EnsembleEntryProps {
  entry: EnsembleEntryPoint;
  screen?: EnsembleScreenModel;
}
export const EnsembleEntry: React.FC<EnsembleEntryProps> = ({
  entry,
  screen,
}) => {
  const location = useLocation();
  const navigate = useNavigate();

  const hasMenu = "items" in entry;
  useEffect(() => {
    if (!keys(entry).length) {
      return;
    }

    const navigateToPath = (pathname: string, search = ""): void => {
      navigate({ pathname, search });
    };

    const getLowerCasePath = (name: string): string => `/${name.toLowerCase()}`;

    const currentPath = location.pathname;

    if (screen && currentPath !== getLowerCasePath(screen.name)) {
      navigateToPath(getLowerCasePath(screen.name), location.search);
      return;
    }

    if (hasMenu) {
      if (currentPath === "/") {
        const selectedItem =
          entry.items.find((item) => item.selected) ?? entry.items[0];
        navigateToPath(getLowerCasePath(selectedItem.page), location.search);
      }
    } else if (currentPath === "/") {
      navigateToPath(getLowerCasePath(entry.name));
    }
  }, [entry, hasMenu, navigate, location, screen]);

  if (hasMenu) {
    return (
      <div style={{ display: "flex", flexDirection: "row" }}>
        <SideBarMenu
          enableSearch={false}
          footer={entry.footer}
          header={entry.header}
          id={entry.id}
          items={entry.items}
          styles={entry.styles}
        />
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
      </div>
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
