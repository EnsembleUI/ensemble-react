import type { EnsembleEntryPoint } from "@ensembleui/react-framework";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { SideBarMenu } from "./menu";
import { EnsembleScreen } from "./screen";

interface EnsembleEntryProps {
  entry: EnsembleEntryPoint;
}
export const EnsembleEntry: React.FC<EnsembleEntryProps> = ({ entry }) => {
  const location = useLocation();
  const navigate = useNavigate();

  const hasMenu = "items" in entry;
  useEffect(() => {
    if (!(hasMenu && location.pathname === "/")) {
      return;
    }

    const selectedItem =
      entry.items.find((item) => item.selected) ?? entry.items[0];
    navigate({
      pathname: `/${selectedItem.page.toLowerCase()}`,
      search: location.search,
    });
  }, [entry, hasMenu, navigate, location]);

  if (hasMenu) {
    return (
      <div style={{ display: "flex", flexDirection: "row" }}>
        <SideBarMenu
          enableSearch={false}
          footer={entry.footer}
          header={entry.header}
          items={entry.items}
          styles={entry.styles}
        />
        <div
          style={{
            marginLeft: String(entry.styles.width),
            flexGrow: 1,
            height: "100vh",
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
