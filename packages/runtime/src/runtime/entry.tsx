import type {
  EnsembleEntryPoint,
  EnsembleScreenModel,
} from "@ensembleui/react-framework";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { SideBarMenu } from "./menu";
import { EnsembleScreen } from "./screen";

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
    if (screen && location.pathname !== `/${screen.name.toLowerCase()}`) {
      navigate({
        pathname: `/${screen.name.toLowerCase()}`,
        search: location.search,
      });
      return;
    }

    if (!(hasMenu && location.pathname === "/")) {
      return;
    }

    const selectedItem =
      entry.items.find((item) => item.selected) ?? entry.items[0];
    navigate({
      pathname: `/${selectedItem.page.toLowerCase()}`,
      search: location.search,
    });
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
    return <Outlet />;
  }

  return <EnsembleScreen screen={entry} />;
};
