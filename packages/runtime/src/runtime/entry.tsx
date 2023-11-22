import type { EnsembleEntryPoint } from "@ensembleui/react-framework";
import { Outlet, useNavigate, useSearchParams } from "react-router-dom";
import { useEffect } from "react";
import { SideBarMenu } from "./menu";
import { EnsembleScreen } from "./screen";

interface EnsembleEntryProps {
  entry: EnsembleEntryPoint;
}
export const EnsembleEntry: React.FC<EnsembleEntryProps> = ({ entry }) => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const hasMenu = "items" in entry;
  useEffect(() => {
    if (hasMenu) {
      const selectedItem =
        entry.items.find((item) => item.selected) ?? entry.items[0];
      navigate({
        pathname: `/${selectedItem.page.toLowerCase()}`,
        search: searchParams.toString(),
      });
    }
  }, [entry, hasMenu, navigate, searchParams]);

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
