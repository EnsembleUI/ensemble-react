import React, { useCallback, useState } from "react";
import { Drawer as AntDrawer } from "antd";
import {
  type EnsembleAction,
  type Expression,
  type EnsembleWidget,
  useRegisterBindings,
} from "@ensembleui/react-framework";
// eslint-disable-next-line import/no-cycle
import { useEnsembleAction } from "./hooks";
// eslint-disable-next-line import/no-cycle
import { EnsembleRuntime } from "./runtime";

interface EnsembleDrawer {
  id?: string;
  height?: string | number;
  width?: string | number;
  position?: Expression<string>;
  onClose?: EnsembleAction;
  title?: Expression<string>;
  children?: EnsembleWidget[];
}

// NOTE: This would be to display the side bar in a View component but it is not implemented yet
interface EnsembleSideBar {
  footer: EnsembleWidget;
  header: EnsembleWidget;
  id: string;
  items: EnsembleWidget[];
  styles: { [key: string]: unknown };
};

export interface MenuModel {
  Drawer?: EnsembleDrawer;
  SideBarMenu?: EnsembleSideBar;
}

type Position = "left" | "right" | "top" | "bottom";
const positions = ["left", "right", "top", "bottom"] as const;

export const EnsembleMenu: React.FC<MenuModel> = ({ Drawer, SideBarMenu }) => {
  if (!Drawer) return null;
  const { id, height, width, position, onClose, title, children } = Drawer;

  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const { rootRef } = useRegisterBindings(
    { open: drawerOpen, height, width, position },
    id,
    {
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    },
    {
      debounceMs: 300,
    },
  );

  const onCloseAction = useEnsembleAction(onClose);
  const onCloseCallback = useCallback(() => {
    if (!onCloseAction) return;
    return onCloseAction.callback();
  }, [onCloseAction]);

  const handleClose = (): void => {
    setDrawerOpen(false);
    onCloseCallback();
  };

  return (
    <AntDrawer
      closable={false}
      height={height}
      key="placement"
      onClose={handleClose}
      open={drawerOpen}
      panelRef={rootRef}
      placement={
        positions.includes(position as Position)
          ? (position as Position)
          : "left"
      }
      title={title || ""}
      width={width}
    >
      {children ? EnsembleRuntime.render(children) : null}
    </AntDrawer>
  );
};