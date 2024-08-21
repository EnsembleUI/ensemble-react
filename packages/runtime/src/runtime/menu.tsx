import type { PropsWithChildren, ReactNode } from "react";
import React, { useState, useEffect, useCallback } from "react";
import { Menu as AntMenu, Col, Drawer as AntDrawer } from "antd";
import * as MuiIcons from "@mui/icons-material";
import {
  unwrapWidget,
  useRegisterBindings,
  type EnsembleWidget,
} from "@ensembleui/react-framework";
import { Outlet, Link, useLocation } from "react-router-dom";
import { getColor } from "../shared/styles";
import { EnsembleRuntime } from "./runtime";

type TypeColors =
  | "transparent"
  | "black"
  | "blue"
  | "white"
  | "red"
  | "grey"
  | "teal"
  | "amber"
  | "pink"
  | "purple"
  | "yellow"
  | "green"
  | "brown"
  | "cyan"
  | "indigo"
  | "lime"
  | "orange";

export interface DrawerRef {
  openDrawer: () => void;
  closeDrawer: () => void;
  isDrawerOpen: () => boolean;
}

export interface EnsembleMenuContext {
  openDrawerMenu?: () => void;
  closeDrawerMenu?: () => void;
  isMenuCollapsed?: boolean;
  setMenuCollapsed?: (collapsed: boolean) => void;
}

interface MenuItemProps {
  id?: string;
  testId?: string;
  icon?: string | { [key: string]: unknown };
  activeIcon?: string | { [key: string]: unknown };
  iconLibrary?: "default" | "fontAwesome";
  label?: string;
  url?: string;
  page?: string;
  selected?: boolean;
  divider?: boolean;
  hasNotifications?: boolean;
  openNewTab?: boolean;
  visible?: boolean;
  customItem?: {
    widget?: { [key: string]: unknown };
    selectedWidget?: { [key: string]: unknown };
  };
}

interface MenuBaseProps<T> {
  id?: string;
  items: MenuItemProps[];
  styles?: T;
  header?: EnsembleWidget;
  footer?: EnsembleWidget;
  isCollapsed: boolean;
  setCollapsed: (open: boolean) => void;
  // TODO: Add children option to render ensemble widgets as an alternative to menu items
}

interface SideBarMenuStyles {
  backgroundColor?: TypeColors;
  labelColor?: TypeColors;
  selectedColor?: TypeColors;
  labelFontSize?: number;
  searchBoxColor?: TypeColors;
  iconWidth?: string;
  iconHeight?: string;
  width?: string;
  onSelectStyles?: {
    backgroundColor?: TypeColors;
    borderRadius?: string;
  };
}

interface DrawerMenuStyles {
  backgroundColor?: TypeColors;
  labelColor?: TypeColors;
  selectedColor?: TypeColors;
  labelFontSize?: number;
  searchBoxColor?: TypeColors;
  iconWidth?: string;
  iconHeight?: string;
  width?: string;
  height?: string;
  position?: "left" | "right" | "top" | "bottom";
  onSelectStyles?: {
    backgroundColor?: TypeColors;
    borderRadius?: string;
  };
}

const renderMuiIcon = (
  iconName?: string,
  width = "15px",
  height = "15px",
): ReactNode => {
  if (!iconName) {
    return null;
  }

  const MuiIconComponent = MuiIcons[iconName as keyof typeof MuiIcons];
  if (MuiIconComponent) {
    return (
      <MuiIconComponent
        style={{
          width,
          height,
        }}
      />
    );
  }
  return null;
};

const CustomLink: React.FC<PropsWithChildren & { item: MenuItemProps }> = ({
  item,
  children,
}) => {
  const content = (
    <>
      {children}
      {item.hasNotifications ? (
        <div
          style={{
            marginTop: "8px",
            marginLeft: "2px",
            width: "8px",
            height: "8px",
            backgroundColor: "#e07407",
            borderRadius: "50%",
          }}
        />
      ) : null}
    </>
  );

  if (!item.page && !item.url) {
    return <div>{content}</div>;
  }

  return (
    <Link
      target={item.openNewTab ? "_blank" : "_self"}
      to={item.page ? `/${item.page}` : String(item.url)}
    >
      {content}
    </Link>
  );
};

export const RenderMenu: React.FC<{
  type: "SideBar" | "Drawer";
  menu: MenuBaseProps<SideBarMenuStyles | DrawerMenuStyles>;
}> = ({ type, menu }) => {
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      {type === "SideBar" ? <SideBarMenu {...menu} /> : null}
      {type === "Drawer" ? <DrawerMenu {...menu} /> : null}
      <div
        style={{
          flexGrow: 1,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Outlet
          context={
            type === "Drawer"
              ? {
                  openDrawerMenu: () => menu.setCollapsed(true),
                  closeDrawerMenu: () => menu.setCollapsed(false),
                }
              : {
                  isMenuCollapsed: () => menu.isCollapsed,
                  setMenuCollapsed: (value: boolean) =>
                    menu.setCollapsed(value),
                }
          }
        />
      </div>
    </div>
  );
};

export const SideBarMenu: React.FC<MenuBaseProps<SideBarMenuStyles>> = ({
  id,
  isCollapsed,
  setCollapsed,
  ...props
}) => {
  const { values } = useRegisterBindings({ ...props, isCollapsed }, id, {
    setCollapsed,
  });
  const location = useLocation();
  const [selectedItem, setSelectedItem] = useState<string | undefined>();

  const backgroundColor = props.styles?.backgroundColor
    ? getColor(props.styles.backgroundColor)
    : "none";

  useEffect(() => {
    const initiallySelectedItem = props.items.find((item) => item.selected);
    if (initiallySelectedItem) {
      setSelectedItem(initiallySelectedItem.page);
    }
  }, [props.items]);

  useEffect(() => {
    const locationMatch = props.items.find(
      (item) =>
        item.page &&
        `/${item.page.toLowerCase()}` === location.pathname.toLowerCase(),
    );
    if (locationMatch) {
      setSelectedItem(locationMatch.page);
    }
  }, [location.pathname, props.items]);

  return (
    <Col
      id="ensemble-sidebar"
      style={{
        backgroundColor,
        borderRight: "1px solid lightgrey",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        width: isCollapsed ? undefined : props.styles?.width,
        height: "100vh",
        alignItems: "center",
        zIndex: 1,
      }}
    >
      {props.header ? EnsembleRuntime.render([props.header]) : null}
      {ItemsMenu(
        values?.items || [],
        values?.styles || {},
        selectedItem,
        setSelectedItem,
        values?.isCollapsed,
      )}
      {props.footer ? EnsembleRuntime.render([props.footer]) : null}
    </Col>
  );
};

export const DrawerMenu: React.FC<MenuBaseProps<DrawerMenuStyles>> = ({
  id,
  items,
  header,
  footer,
  styles,
  isCollapsed,
  setCollapsed,
}) => {
  const validPosition = ["left", "right", "top", "bottom"];

  const [selectedItem, setSelectedItem] = useState<string | undefined>();

  const { rootRef } = useRegisterBindings(
    { open: isCollapsed },
    id,
    {
      open: () => setCollapsed(true),
      close: () => setCollapsed(false),
    },
    {
      debounceMs: 300,
    },
  );

  const handleClose = (): void => {
    setCollapsed(false);
  };

  return (
    <AntDrawer
      closable={false}
      height={styles?.height ? `calc(${styles.height} + 48px)` : undefined}
      key={id}
      onClose={handleClose}
      open={isCollapsed}
      panelRef={rootRef}
      placement={
        !(styles?.position && validPosition.includes(styles.position))
          ? "left"
          : styles.position
      }
      style={{
        backgroundColor: styles?.backgroundColor
          ? getColor(styles.backgroundColor)
          : "none",
      }}
      width={styles?.width ? `calc(${styles.width} + 48px)` : undefined}
    >
      {header ? EnsembleRuntime.render([header]) : null}
      {ItemsMenu(items, { ...styles }, selectedItem, setSelectedItem)}
      {footer ? EnsembleRuntime.render([footer]) : null}
    </AntDrawer>
  );
};

const ItemsMenu = (
  items: MenuItemProps[],
  styles: DrawerMenuStyles,
  selectedItem: string | undefined,
  setSelectedItem: (si: string) => void,
  isCollapsed = false,
) => {
  const getIcon = useCallback(
    (item: MenuItemProps) => {
      const key = selectedItem === item.page ? "activeIcon" : "icon";
      const icon =
        selectedItem === item.page && item.activeIcon
          ? item.activeIcon
          : item.icon;

      if (!icon) {
        return null;
      }

      if (typeof icon === "string") {
        return renderMuiIcon(icon, styles.iconWidth, styles.iconHeight);
      }
      return EnsembleRuntime.render([
        {
          ...unwrapWidget({ Icon: icon }),
          key,
        },
      ]);
    },
    [styles.iconHeight, styles.iconWidth, selectedItem],
  );

  const getLabel = useCallback(
    (item: MenuItemProps) => {
      if (isCollapsed) return null;
      if (!item.customItem) {
        return item.label;
      }
      const widget =
        selectedItem === item.page && item.customItem.selectedWidget
          ? item.customItem.selectedWidget
          : item.customItem.widget;
      return EnsembleRuntime.render([unwrapWidget(widget || {})]);
    },
    [isCollapsed, selectedItem],
  );

  return (
    <AntMenu
      mode="inline"
      /* FIXME This is a hack so we can control our own selected styling. Ideally, this should use design tokens */
      selectedKeys={[]}
      style={{
        flex: "1",
        backgroundColor: styles.backgroundColor
          ? getColor(styles.backgroundColor)
          : "none",
        display: "flex",
        flexDirection: "column",
        width: styles.width,
        borderRight: "none",
      }}
    >
      {items.map((item, itemIndex) => (
        <AntMenu.Item
          data-testid={item.id ?? item.testId}
          icon={getIcon(item)}
          key={item.page || item.url || `customItem${itemIndex}`}
          onClick={(): void => {
            if (!item.openNewTab && item.page) {
              setSelectedItem(item.page);
            }
          }}
          style={{
            color:
              selectedItem === item.page
                ? (styles.selectedColor as string) ?? "white"
                : (styles.labelColor as string) ?? "grey",
            display: item.visible === false ? "none" : "flex",
            justifyContent: "center",
            borderRadius: 0,
            alignItems: "center",
            fontSize:
              selectedItem === item.page
                ? `${
                    parseInt(
                      `${styles.labelFontSize ? styles.labelFontSize : 1}` ||
                        "1",
                    ) + 0.2
                  }rem`
                : `${styles.labelFontSize ? styles.labelFontSize : 1}rem`,
            ...(selectedItem === item.page ? styles.onSelectStyles ?? {} : {}),
          }}
        >
          <CustomLink item={item}>{getLabel(item)}</CustomLink>
        </AntMenu.Item>
      ))}
    </AntMenu>
  );
};
