import { useCallback, useState } from "react";
import { Drawer as AntDrawer } from "antd";
import type {
  EnsembleAction,
  Expression,
  EnsembleWidget,
} from "@ensembleui/react-framework";
import { useRegisterBindings } from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import { useEnsembleAction } from "../runtime/hooks";
import { EnsembleRuntime } from "../runtime";

export interface DrawerProps {
  id?: string;
  height?: string | number;
  width?: string | number;
  position?: Expression<string>;
  onClose?: EnsembleAction;
  title?: Expression<string>;
  children?: EnsembleWidget[];
}

type Position = "left" | "right" | "top" | "bottom";
const positions = ["left", "right", "top", "bottom"] as const;

export const Drawer: React.FC<DrawerProps> = ({
  id,
  height,
  width,
  position,
  onClose,
  title,
  children,
}) => {
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

WidgetRegistry.register("Drawer", Drawer);
