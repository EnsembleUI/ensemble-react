import type { PropsWithChildren, ReactNode } from "react";
import React, { useState, useEffect, useCallback } from "react";
import { Menu as AntMenu, Col, Drawer as AntDrawer } from "antd";
import * as MuiIcons from "@mui/icons-material";
import {
  unwrapWidget,
  useRegisterBindings,
  type EnsembleWidget,
  type EnsembleAction,
  type EnsembleMenuModelType,
} from "@ensembleui/react-framework";
import { Outlet, Link, useLocation } from "react-router-dom";
import { getColor } from "../shared/styles";
import { EnsembleRuntime } from "./runtime";
// eslint-disable-next-line import/no-cycle
import { useEnsembleAction } from "./hooks";

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
  items?: MenuItemProps[];
  styles?: T;
  header?: EnsembleWidget;
  footer?: EnsembleWidget;
  onCollapse?: EnsembleAction;
}

interface MenuStyles {
  backgroundColor?: TypeColors;
  labelColor?: TypeColors;
  selectedColor?: TypeColors;
  labelFontSize?: number;
  searchBoxColor?: TypeColors;
  iconWidth?: string;
  iconHeight?: string;
  onSelectStyles?: {
    backgroundColor?: TypeColors;
    borderRadius?: string;
  };
}

interface SideBarMenuStyles extends MenuStyles {
  width?: string;
}

interface DrawerMenuStyles extends MenuStyles {
  width?: string;
  height?: string;
  position?: "left" | "right" | "top" | "bottom";
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
  type: EnsembleMenuModelType;
  menu: MenuBaseProps<SideBarMenuStyles | DrawerMenuStyles>;
}> = ({ type, menu }) => {
  const [isCollapsed, setCollapsed] = useState<boolean>(false);

  const outletContext = {
    openDrawerMenu: type === "Drawer" ? () => setCollapsed(true) : undefined,
    closeDrawerMenu: type === "Drawer" ? () => setCollapsed(false) : undefined,
    isCollapsed: type === "SideBar" ? () => isCollapsed : undefined,
    setCollapsed:
      type === "SideBar" ? (value: boolean) => setCollapsed(value) : undefined,
  };

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <Menu
        isCollapsed={isCollapsed}
        menu={menu}
        setCollapsed={setCollapsed}
        type={type}
      />
      <div
        style={{
          flexGrow: 1,
          height: "100vh",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <Outlet context={outletContext} />
      </div>
    </div>
  );
};

export const RenderMenuInView: React.FC<{
  type: EnsembleMenuModelType;
  menu: MenuBaseProps<SideBarMenuStyles | DrawerMenuStyles>;
}> = ({ type, menu }) => {
  const [isCollapsed, setCollapsed] = useState<boolean>(false);

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      <Menu
        isCollapsed={isCollapsed}
        menu={menu}
        setCollapsed={setCollapsed}
        type={type}
      />
    </div>
  );
};

export const Menu: React.FC<{
  type: EnsembleMenuModelType;
  menu: MenuBaseProps<SideBarMenuStyles | DrawerMenuStyles>;
  isCollapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
}> = ({ type, menu, isCollapsed, setCollapsed }) => {
  const { id, items, styles, header, footer, onCollapse } = menu;
  const { values } = useRegisterBindings(
    { items, styles, header, footer, isCollapsed },
    id,
    {
      setCollapsed,
      ...(type === "Drawer"
        ? {
            openDrawer: () => setCollapsed(true),
            closeDrawer: () => setCollapsed(false),
          }
        : {}),
    },
  );
  const location = useLocation();
  const [selectedItem, setSelectedItem] = useState<string | undefined>();

  useEffect(() => {
    const initiallySelectedItem = items?.find((item) => item.selected);
    if (initiallySelectedItem) {
      setSelectedItem(initiallySelectedItem.page);
    }
  }, [items]);

  useEffect(() => {
    const locationMatch = items?.find(
      (item) =>
        item.page &&
        `/${item.page.toLowerCase()}` === location.pathname.toLowerCase(),
    );
    if (locationMatch) {
      setSelectedItem(locationMatch.page);
    }
  }, [location.pathname, items]);

  const handleClose = (): void => {
    setCollapsed(false);
    onCollapseCallback();
  };

  const onCollapseAction = useEnsembleAction(onCollapse);
  const onCollapseCallback = useCallback(() => {
    if (!onCollapseAction) return;
    return onCollapseAction.callback();
  }, [onCollapseAction]);

  if (type === "SideBar") {
    return (
      <SideBarMenu
        isCollapsed={isCollapsed}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        values={values}
      />
    );
  }
  if (type === "Drawer") {
    return (
      <DrawerMenu
        handleClose={handleClose}
        isOpen={isCollapsed}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        values={values}
      />
    );
  }
  return null;
};

export const SideBarMenu: React.FC<{
  values?: MenuBaseProps<SideBarMenuStyles>;
  isCollapsed: boolean;
  selectedItem: string | undefined;
  setSelectedItem: (s: string) => void;
  width?: string;
}> = ({ values, isCollapsed, selectedItem, setSelectedItem }) => {
  return (
    <Col
      id="ensemble-sidebar"
      style={{
        backgroundColor: values?.styles?.backgroundColor
          ? getColor(values.styles.backgroundColor)
          : "none",
        borderRight: "1px solid lightgrey",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        width: isCollapsed ? undefined : values?.styles?.width,
        height: "100vh",
        alignItems: "center",
        zIndex: 1,
      }}
    >
      {values?.header ? EnsembleRuntime.render([values.header]) : null}
      <ItemsMenu
        isCollapsed={isCollapsed}
        items={values?.items || []}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        styles={values?.styles || {}}
      />
      {values?.footer ? EnsembleRuntime.render([values.footer]) : null}
    </Col>
  );
};

export const DrawerMenu: React.FC<{
  values?: MenuBaseProps<DrawerMenuStyles>;
  handleClose: () => void;
  isOpen: boolean;
  selectedItem: string | undefined;
  setSelectedItem: (s: string) => void;
}> = ({ values, handleClose, isOpen, selectedItem, setSelectedItem }) => {
  const validPosition = ["left", "right", "top", "bottom"];

  return (
    <AntDrawer
      closable={false}
      height={
        values?.styles?.height
          ? `calc(${values.styles.height} + 48px)`
          : undefined
      }
      key={values?.id}
      onClose={handleClose}
      open={isOpen}
      placement={
        !(
          values?.styles?.position &&
          validPosition.includes(values.styles.position)
        )
          ? "left"
          : values.styles.position
      }
      style={{
        backgroundColor: values?.styles?.backgroundColor
          ? getColor(values.styles.backgroundColor)
          : "none",
      }}
      width={
        values?.styles?.width
          ? `calc(${values.styles.width} + 48px)`
          : undefined
      }
    >
      {values?.header ? EnsembleRuntime.render([values.header]) : null}
      <ItemsMenu
        items={values?.items || []}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        styles={values?.styles || {}}
      />
      {values?.footer ? EnsembleRuntime.render([values.footer]) : null}
    </AntDrawer>
  );
};

const ItemsMenu: React.FC<{
  items: MenuItemProps[];
  styles: DrawerMenuStyles;
  selectedItem: string | undefined;
  setSelectedItem: (s: string) => void;
  isCollapsed?: boolean;
}> = ({
  items,
  styles,
  selectedItem,
  setSelectedItem,
  isCollapsed = false,
}) => {
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
