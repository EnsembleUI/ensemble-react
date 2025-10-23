import type { PropsWithChildren, ReactNode } from "react";
import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Menu as AntMenu,
  Col,
  Drawer as AntDrawer,
  ConfigProvider,
} from "antd";
import * as MuiIcons from "@mui/icons-material";
import {
  unwrapWidget,
  useRegisterBindings,
  type EnsembleWidget,
  type EnsembleAction,
  EnsembleMenuModelType,
} from "@ensembleui/react-framework";
import { Outlet, Link, useLocation } from "react-router-dom";
import { cloneDeep, omit } from "lodash-es";
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

export interface EnsembleMenuContext {
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
  expanded?: boolean;
  children?: MenuItemProps[];
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
  importedScripts?: string;
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

export const EnsembleMenu: React.FC<{
  type: EnsembleMenuModelType;
  menu: MenuBaseProps<SideBarMenuStyles | DrawerMenuStyles>;
  renderOutlet?: boolean;
}> = ({ type, menu, renderOutlet = true }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(
    type === EnsembleMenuModelType.Drawer,
  );
  const [defaultOpenKeys, setDefaultOpenKeys] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState<boolean>(false);
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
    const openItems: string[] = [];

    items?.forEach((item, index) => {
      if (
        item.page &&
        `/${item.page.toLowerCase()}` === location.pathname.toLowerCase()
      ) {
        setSelectedItem(item.page);
      }

      if (item.children && item.children.length > 0) {
        const hasActiveChild = item.children.some((childItem) => {
          const isActive =
            childItem.page &&
            `/${childItem.page.toLowerCase()}` ===
              location.pathname.toLowerCase();

          if (isActive) {
            setSelectedItem(childItem.page);
            return true;
          }

          return false;
        });

        if (hasActiveChild || item.expanded) {
          openItems.push(`submenu-${index}`);
        }
      }
    });

    setDefaultOpenKeys(openItems);
    setIsInitialized(true);
  }, [location.pathname, items]);

  const handleClose = (): void => {
    setIsCollapsed(true);
    onCollapseCallback();
  };

  const onCollapseAction = useEnsembleAction(onCollapse);
  const onCollapseCallback = useCallback(() => {
    return onCollapseAction?.callback();
  }, [onCollapseAction?.callback]);

  if (!isInitialized) {
    return null;
  }

  return (
    <div style={{ display: "flex", flexDirection: "row" }}>
      {type === EnsembleMenuModelType.SideBar ? (
        <SideBarMenu
          defaultOpenKeys={defaultOpenKeys}
          isCollapsed={isCollapsed}
          selectedItem={selectedItem}
          setSelectedItem={setSelectedItem}
          values={{ ...values, items }}
        />
      ) : (
        <DrawerMenu
          defaultOpenKeys={defaultOpenKeys}
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
  defaultOpenKeys: string[] | undefined;
  setSelectedItem: (s: string) => void;
  width?: string;
}> = ({
  values,
  isCollapsed,
  selectedItem,
  defaultOpenKeys,
  setSelectedItem,
}) => {
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
        defaultOpenKeys={defaultOpenKeys}
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
  defaultOpenKeys: string[] | undefined;
  values?: MenuBaseProps<DrawerMenuStyles>;
  handleClose: () => void;
  isOpen: boolean;
  selectedItem: string | undefined;
  setSelectedItem: (s: string) => void;
}> = ({
  defaultOpenKeys,
  values,
  handleClose,
  isOpen,
  selectedItem,
  setSelectedItem,
}) => {
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
        defaultOpenKeys={defaultOpenKeys}
        items={values?.items || []}
        selectedItem={selectedItem}
        setSelectedItem={setSelectedItem}
        styles={values?.styles || {}}
      />
      {values?.footer ? EnsembleRuntime.render([values.footer]) : null}
    </AntDrawer>
  );
};

const RenderMenuItem: React.FC<{
  menuItem: MenuItemProps;
  styles: MenuStyles;
  selectedItem: string | undefined;
  setSelectedItem: (s: string) => void;
  itemIndex: number;
  icon: ReactNode;
  label: ReactNode;
}> = ({
  menuItem,
  styles,
  selectedItem,
  setSelectedItem,
  itemIndex,
  icon,
  label,
}) => {
  return (
    <AntMenu.Item
      data-testid={menuItem.id ?? menuItem.testId}
      icon={icon}
      key={menuItem.page || menuItem.url || `customItem${itemIndex}`}
      onClick={(): void => {
        if (!menuItem.openNewTab && menuItem.page) {
          setSelectedItem(menuItem.page);
        }
      }}
      style={{
        color:
          selectedItem === menuItem.page
            ? (styles.selectedColor as string) ?? "white"
            : (styles.labelColor as string) ?? "grey",
        display: menuItem.visible === false ? "none" : "flex",
        justifyContent: "center",
        borderRadius: 0,
        alignItems: "center",
        fontSize:
          selectedItem === menuItem.page
            ? `${
                parseInt(
                  `${styles.labelFontSize ? styles.labelFontSize : 1}` || "1",
                ) + 0.2
              }rem`
            : `${styles.labelFontSize ? styles.labelFontSize : 1}rem`,
        height: "auto",
        ...(selectedItem === menuItem.page ? styles.onSelectStyles ?? {} : {}),
      }}
    >
      <CustomLink item={menuItem}>{label}</CustomLink>
    </AntMenu.Item>
  );
};

const MenuItems: React.FC<{
  items: MenuItemProps[];
  styles: MenuStyles;
  selectedItem: string | undefined;
  defaultOpenKeys: string[] | undefined;
  setSelectedItem: (s: string) => void;
  isCollapsed?: boolean;
}> = ({
  items,
  styles,
  selectedItem,
  defaultOpenKeys,
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
      <style>
        {`
          .ant-menu-submenu-title{
            color: inherit !important
          }

          .ant-menu-item {
            padding-left: 24px !important;
          }

          .ant-menu-sub {
            padding-left: 24px !important;
          }
          `}
      </style>

      <AntMenu
        defaultOpenKeys={defaultOpenKeys?.length ? defaultOpenKeys : undefined}
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
        {items.map((item, itemIndex) =>
          item.children ? (
            <AntMenu.SubMenu
              icon={getIcon(item)}
              key={`submenu-${itemIndex}`}
              style={{
                color: styles.labelColor ?? "grey",
                fontSize: "1rem",
                height: "auto",
              }}
              title={getLabel(item)}
            >
              {item.children.map((childItem, childIndex) => (
                <RenderMenuItem
                  icon={getIcon(childItem)}
                  itemIndex={childIndex}
                  key={
                    childItem.page || childItem.url || `customItem${childIndex}`
                  }
                  label={getLabel(childItem)}
                  menuItem={childItem}
                  selectedItem={selectedItem}
                  setSelectedItem={setSelectedItem}
                  styles={styles}
                />
              ))}
            </AntMenu.SubMenu>
          ) : (
            <RenderMenuItem
              icon={getIcon(item)}
              itemIndex={itemIndex}
              key={item.page || item.url || `customItem${itemIndex}`}
              label={getLabel(item)}
              menuItem={item}
              selectedItem={selectedItem}
              setSelectedItem={setSelectedItem}
              styles={styles}
            />
          ),
        )}
      </AntMenu>
    </ConfigProvider>
  );
};
