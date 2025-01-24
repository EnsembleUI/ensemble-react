import type { PropsWithChildren } from "react";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Menu as AntMenu,
  Col,
  Drawer as AntDrawer,
  ConfigProvider,
} from "antd";
import {
  unwrapWidget,
  useRegisterBindings,
  type EnsembleWidget,
  type EnsembleAction,
  EnsembleMenuModelType,
} from "@ensembleui/react-framework";
import { Outlet, Link, useLocation } from "react-router-dom";
import { cloneDeep, isString, omit } from "lodash-es";
import { getColor } from "../shared/styles";
import type { IconProps } from "../shared/types";
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

export interface EnsembleMenuContext {
  isMenuCollapsed?: boolean;
  setMenuCollapsed?: (collapsed: boolean) => void;
}

interface MenuItemProps {
  id?: string;
  testId?: string;
  icon?: string | IconProps;
  activeIcon?: string | IconProps;
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

export const EnsembleMenu: React.FC<{
  type: EnsembleMenuModelType;
  menu: MenuBaseProps<SideBarMenuStyles | DrawerMenuStyles>;
  renderOutlet?: boolean;
}> = ({ type, menu, renderOutlet = true }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(
    type === EnsembleMenuModelType.Drawer,
  );

  const outletContext = {
    isMenuCollapsed: isCollapsed,
    setMenuCollapsed: setIsCollapsed,
  };
  const { id, items: rawItems, styles, header, footer, onCollapse } = menu;
  // custom items may contain their own bindings to be evaluated in dynamic context
  const itemInputs = rawItems?.map<MenuItemProps>((item) =>
    omit(item, "customItem"),
  );

  const { values } = useRegisterBindings(
    { itemInputs, styles, header, footer, isCollapsed },
    id,
    {
      setIsCollapsed,
    },
  );

  const location = useLocation();
  const [selectedItem, setSelectedItem] = useState<string | undefined>();

  const items = useMemo(
    () =>
      values?.itemInputs?.map((item, index) => ({
        ...item,
        customItem: rawItems?.[index].customItem,
      })),
    [rawItems, values?.itemInputs],
  );

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
    setIsCollapsed(true);
    onCollapseCallback();
  };

  const onCollapseAction = useEnsembleAction(onCollapse);
  const onCollapseCallback = useCallback(() => {
    return onCollapseAction?.callback();
  }, [onCollapseAction?.callback]);
  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      {type === EnsembleMenuModelType.SideBar ? (
        <SideBarMenu
          isCollapsed={isCollapsed}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          values={{ ...values, items }}
        />
      ) : (
        <DrawerMenu
          handleClose={handleClose}
          isOpen={!isCollapsed}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          values={{ ...values, items }}
        />
      )}
      {renderOutlet ? (
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
      ) : null}
    </div>
  );
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
      <MenuItems
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
      <MenuItems
        items={values?.items || []}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        styles={values?.styles || {}}
      />
      {values?.footer ? EnsembleRuntime.render([values.footer]) : null}
    </AntDrawer>
  );
};

const MenuItems: React.FC<{
  items: MenuItemProps[];
  styles: MenuStyles;
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
  const getCustomIcon = useCallback(
    (item: MenuItemProps) => {
      const key = selectedItem === item.page ? "activeIcon" : "icon";
      const iconProps =
        selectedItem === item.page && item.activeIcon
          ? item.activeIcon
          : item.icon;

      if (!iconProps) {
        return null;
      }

      const icon = isString(iconProps)
        ? {
            name: iconProps,
            styles: { width: styles.iconWidth, height: styles.iconHeight },
          }
        : iconProps;

      return EnsembleRuntime.render([{ ...unwrapWidget({ Icon: icon }), key }]);
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
      return EnsembleRuntime.render([unwrapWidget(cloneDeep(widget) || {})]);
    },
    [isCollapsed, selectedItem],
  );

  return (
    <ConfigProvider
      theme={{
        components: {
          Menu: {
            itemActiveBg: "inherit",
          },
        },
      }}
    >
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
            icon={getCustomIcon(item)}
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
              height: "auto",
              ...(selectedItem === item.page
                ? styles.onSelectStyles ?? {}
                : {}),
            }}
          >
            <CustomLink item={item}>{getLabel(item)}</CustomLink>
          </AntMenu.Item>
        ))}
      </AntMenu>
    </ConfigProvider>
  );
};
