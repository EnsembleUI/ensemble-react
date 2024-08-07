import type { PropsWithChildren, ReactNode } from "react";
import React, { useState, useEffect, useCallback } from "react";
import { Menu as AntMenu, Col, Divider } from "antd";
import * as MuiIcons from "@mui/icons-material";
import {
  unwrapWidget,
  useRegisterBindings,
  type EnsembleWidget,
} from "@ensembleui/react-framework";
import { Link, useLocation } from "react-router-dom";
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

interface MenuItem {
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

interface MenuBaseProps {
  id?: string;
  items: MenuItem[];
  styles?: {
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
  };
  header?: EnsembleWidget;
  footer?: EnsembleWidget;
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

const CustomLink: React.FC<PropsWithChildren & { item: MenuItem }> = ({
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

export const SideBarMenu: React.FC<MenuBaseProps> = ({ id, ...props }) => {
  const [isCollapsed, setIsCollapsed] = useState<boolean>(false);
  const { values } = useRegisterBindings({ ...props, isCollapsed }, id, {
    setCollapsed: setIsCollapsed,
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

  const getIcon = useCallback(
    (item: MenuItem) => {
      const key = selectedItem === item.page ? "activeIcon" : "icon";
      const icon =
        selectedItem === item.page && item.activeIcon
          ? item.activeIcon
          : item.icon;

      if (!icon) {
        return null;
      }

      if (typeof icon === "string") {
        return renderMuiIcon(
          icon,
          props.styles?.iconWidth,
          props.styles?.iconHeight,
        );
      }
      return EnsembleRuntime.render([
        {
          ...unwrapWidget({ Icon: icon }),
          key,
        },
      ]);
    },
    [props.styles?.iconHeight, props.styles?.iconWidth, selectedItem],
  );

  const getLabel = useCallback(
    (item: MenuItem) => {
      if (isCollapsed) {
        return null;
      }
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
      <AntMenu
        mode="inline"
        /* FIXME This is a hack so we can control our own selected styling. Ideally, this should use design tokens */
        selectedKeys={[]}
        style={{
          flex: "1",
          backgroundColor,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* FIXME: just use props here https://ant.design/components/menu#examples */}
        {values?.items.map((item, itemIndex) => (
          <>
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
                    ? (values.styles?.selectedColor as string) ?? "white"
                    : (values.styles?.labelColor as string) ?? "grey",
                display: item.visible === false ? "none" : "flex",
                justifyContent: "center",
                borderRadius: 0,
                alignItems: "center",
                fontSize:
                  selectedItem === item.page
                    ? `${
                        parseInt(
                          `${
                            props.styles?.labelFontSize
                              ? props.styles.labelFontSize
                              : 1
                          }` || "1",
                        ) + 0.2
                      }rem`
                    : `${
                        props.styles?.labelFontSize
                          ? props.styles.labelFontSize
                          : 1
                      }rem`,
                ...(selectedItem === item.page
                  ? props.styles?.onSelectStyles ?? {}
                  : {}),
              }}
            >
              <CustomLink item={item}>{getLabel(item)}</CustomLink>
            </AntMenu.Item>
            {item.divider ? (
              <Col
                span={24}
                style={{ display: "flex", justifyContent: "center" }}
              >
                <Divider
                  style={{
                    backgroundColor: "grey",
                    width: "70%",
                    minWidth: "70%",
                  }}
                />
              </Col>
            ) : null}
          </>
        ))}
      </AntMenu>
      {props.footer ? EnsembleRuntime.render([props.footer]) : null}
    </Col>
  );
};
