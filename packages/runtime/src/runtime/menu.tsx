import type { ReactNode } from "react";
import React, { useState, useEffect } from "react";
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
  enableSearch?: boolean;
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

export const SideBarMenu: React.FC<MenuBaseProps> = ({ id, ...props }) => {
  const [isCollapsed, setCollapsed] = useState<boolean>(false);
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
        item.page && `/${item.page.toLowerCase()}` === location.pathname,
    );
    if (locationMatch) {
      setSelectedItem(locationMatch.page);
    }
  }, [location.pathname, props.items]);

  const getIcon = (
    icon?: string | { [key: string]: unknown },
    key?: string,
  ): ReactNode =>
    typeof icon === "string"
      ? renderMuiIcon(icon, props.styles?.iconWidth, props.styles?.iconHeight)
      : EnsembleRuntime.render([
          {
            ...unwrapWidget(icon ? { Icon: icon } : {}),
            key: String(key),
          },
        ]);

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
      {props.header ? (
        <Col style={{ width: "100%" }}>
          {EnsembleRuntime.render([props.header])}
        </Col>
      ) : null}
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
        {values?.items.map((item) => (
          <>
            <AntMenu.Item
              data-testid={item.id ?? item.testId}
              icon={getIcon(
                selectedItem === item.page
                  ? item.activeIcon || item.icon
                  : item.icon,
                selectedItem === item.page ? "activeIcon" : "icon",
              )}
              key={item.page}
              onClick={(): void => {
                if (!item.openNewTab) {
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
              <Link
                target={item.openNewTab ? "_blank" : "_self"}
                to={item.page ? `/${item.page}` : String(item.url)}
              >
                {!isCollapsed &&
                  (item.customItem
                    ? EnsembleRuntime.render([
                        unwrapWidget(
                          (selectedItem === item.page
                            ? item.customItem.selectedWidget ||
                              item.customItem.widget
                            : item.customItem.widget) || {},
                        ),
                      ])
                    : item.label)}
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
              </Link>
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
      {props.footer ? (
        <Col style={{ width: "100%" }}>
          {EnsembleRuntime.render([props.footer])}
        </Col>
      ) : null}
    </Col>
  );
};
