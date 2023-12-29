import type { EnsembleEntryPoint } from "@ensembleui/react-framework";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  COLLAPSED_SIDEBAR_WIDTH,
  SideBarMenu,
  TOP_SIDEBAR_HEIGHT,
} from "./menu";
import { EnsembleScreen } from "./screen";

interface EnsembleEntryProps {
  entry: EnsembleEntryPoint;
}
export const EnsembleEntry: React.FC<EnsembleEntryProps> = ({ entry }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const hasMenu = "items" in entry;
  const isMobileView = window.innerWidth <= 768;

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
          collapsed={collapsed}
          enableSearch={false}
          footer={entry.footer}
          header={entry.header}
          id={entry.id}
          items={entry.items}
          onCollapse={entry.onCollapse}
          setCollapsed={setCollapsed}
          styles={entry.styles}
        />
        <div
          style={{
            flexGrow: 1,
            height: "100vh",
            marginTop: isMobileView ? TOP_SIDEBAR_HEIGHT : "0px",
            marginLeft: getBodyMarginLeft(
              isMobileView,
              collapsed,
              String(entry?.styles?.width),
            ),
            transition: "margin-left 0.2s",
          }}
        >
          <Outlet />
        </div>
      </div>
    );
  }

  return <EnsembleScreen screen={entry} />;
};

const getBodyMarginLeft = (
  isMobileView: boolean,
  collapsed: boolean,
  defaultWidth: string,
): string => {
  if (isMobileView) return "0px";
  if (collapsed) return COLLAPSED_SIDEBAR_WIDTH;
  return defaultWidth;
};
