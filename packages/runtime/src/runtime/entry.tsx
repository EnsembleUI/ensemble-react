import type { EnsembleEntryPoint } from "@ensembleui/react-framework";
import { Outlet, useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { SideBarMenu } from "./menu";
import { EnsembleScreen } from "./screen";

interface EnsembleEntryProps {
  entry: EnsembleEntryPoint;
}
export const EnsembleEntry: React.FC<EnsembleEntryProps> = ({ entry }) => {
  const navigate = useNavigate();
  const hasMenu = "items" in entry;
  useEffect(() => {
    if (hasMenu) {
      const selectedItem =
        entry.items.find((item) => item.selected) ?? entry.items[0];
      navigate(`/${selectedItem.page.toLowerCase()}`);
    }
  }, []);

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

  return <EnsembleScreen screen={entry} />;
};
