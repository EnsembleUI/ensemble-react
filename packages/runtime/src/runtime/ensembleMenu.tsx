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
import { EnsembleRuntime } from "./runtime";

type MenuTypes = "Drawer"; // More menu types can be added here and should be supported in the future

export interface MenuModel {
  type: MenuTypes;
  id?: string;
  onCollapse?: EnsembleAction;
  title?: Expression<string>;
  children?: EnsembleWidget[];
  header?: EnsembleWidget;
  footer?: EnsembleWidget;
  styles?: { [key: string]: unknown };
}

export interface DrawerViewModel {
  id?: string;
  onCollapse?: EnsembleAction;
  title?: Expression<string>;
  children?: EnsembleWidget[];
  header?: EnsembleWidget;
  footer?: EnsembleWidget;
  styles?: { [key: string]: unknown };
}

type Position = "left" | "right" | "top" | "bottom";
const positions = ["left", "right", "top", "bottom"] as const;

export const EnsembleMenu: React.FC<MenuModel> = (props) => {
  // This widget currently only handles the drawer menu, but can be abstracted to handle other types of menus in the future

  return <>{props.type === "Drawer" ? <EnsembleDrawer {...props} /> : null}</>;
};

const EnsembleDrawer: React.FC<DrawerViewModel> = ({
  id,
  onCollapse,
  title,
  children,
  header,
  footer,
  styles,
}) => {
  const [drawerOpen, setDrawerOpen] = useState<boolean>(false);
  const { rootRef } = useRegisterBindings(
    {
      open: drawerOpen,
      height: styles?.height,
      width: styles?.width,
      position: styles?.position,
    },
    id,
    {
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    },
    {
      debounceMs: 300,
    },
  );

  const onCloseAction = useEnsembleAction(onCollapse);
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
      height={
        styles?.height ? `calc(${String(styles.height)} + 48px)` : undefined
      }
      key="placement"
      onClose={handleClose}
      open={drawerOpen}
      panelRef={rootRef}
      placement={
        positions.includes(styles?.position as Position)
          ? (styles?.position as Position)
          : "left"
      }
      style={{
        backgroundColor: styles?.backgroundColor as string,
      }}
      title={title || ""}
      width={styles?.width ? `calc(${String(styles.width)} + 48px)` : undefined}
    >
      {header ? EnsembleRuntime.render([header]) : null}
      {children ? EnsembleRuntime.render(children) : null}
      {footer ? EnsembleRuntime.render([footer]) : null}
    </AntDrawer>
  );
};
