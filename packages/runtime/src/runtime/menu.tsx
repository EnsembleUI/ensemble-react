import type { ReactNode } from "react";
import React, { useState, useEffect, useRef, useCallback } from "react";
import { Menu as AntMenu, Col, Divider, Row } from "antd";
import * as MuiIcons from "@mui/icons-material";
import {
  useRegisterBindings,
  type EnsembleAction,
  type EnsembleWidget,
} from "@ensembleui/react-framework";
import { useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@mui/material";
import { getColor } from "../shared/styles";
import type { EnsembleWidgetProps } from "../shared/types";
import { EnsembleRuntime } from "./runtime";
import { useEnsembleAction } from "./hooks/useEnsembleAction";

export const TOP_SIDEBAR_HEIGHT = "56px";
export const COLLAPSED_SIDEBAR_WIDTH = "50px";

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
  icon?: string;
  iconLibrary?: "default" | "fontAwesome";
  label: string;
  page: string;
  selected?: boolean;
  divider?: boolean;
  hasNotifications?: boolean;
}
interface MenuStyles {
  backgroundColor?: TypeColors;
  labelColor?: TypeColors;
  selectedColor?: TypeColors;
  labelFontSize?: number;
  searchBoxColor?: TypeColors;
  iconWidth?: string;
  iconHeight?: string;
  width?: string;
  headerCollapsedWidth?: string;
  footerCollapsedWidth?: string;
  onSelectStyles?: {
    backgroundColor?: TypeColors;
    borderRadius?: string;
  };
}

type MenuBaseProps = {
  items: MenuItem[];
  header?: EnsembleWidget;
  footer?: EnsembleWidget;
  enableSearch?: boolean;
  onCollapse?: EnsembleAction;
  collapsed: boolean;
  setCollapsed: (collapsed: boolean) => void;
} & EnsembleWidgetProps<MenuStyles>;

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

export const SideBarMenu: React.FC<MenuBaseProps> = (props) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const action = useEnsembleAction(props.onCollapse);
  const { values, rootRef } = useRegisterBindings(
    { props, selectedItem },
    props?.id,
    {
      setSelectedItem,
    },
  );

  const isMobileView = window.innerWidth <= 768;
  const backgroundColor = props.styles?.backgroundColor
    ? getColor(props.styles.backgroundColor)
    : "none";

  useEffect(() => {
    const initiallySelectedItem = props.items.find((item) => item.selected);
    if (initiallySelectedItem) {
      setSelectedItem(initiallySelectedItem.label);
    }
  }, [props.items]);

  useEffect(() => {
    const locationMatch = props.items.find(
      (item) => `/${item.page.toLowerCase()}` === location.pathname,
    );
    if (locationMatch) {
      setSelectedItem(locationMatch.label);
    }
  }, [location.pathname, props.items]);

  const onCollapseCallback = useCallback(() => {
    props.setCollapsed(!props.collapsed);

    if (!action) {
      return;
    }
    action.callback({
      [props?.id || ""]: {
        ...props,
        collapsed: !props.collapsed,
        selectedItem,
        setSelectedItem,
      },
    });
  }, [action, props, selectedItem, setSelectedItem]);

  const handleClick = (page: string, label: string): void => {
    setSelectedItem(label);
    navigate(`/${page.toLowerCase()}`);
  };

  const menuItemStyles = `
    .ant-menu-item-selected::after {
      content: none;
      border-bottom: none !important;
    }

    & .ant-menu-item::after {
      content: none;
      border-bottom: none !important;
    }

    & .ant-menu-item:hover::after {
      content: none;
      border-bottom: none !important;
    }
  `;

  return (
    <Col
      id="ensemble-sidebar"
      ref={rootRef}
      style={{
        backgroundColor,
        zIndex: 1,
        display: "flex",
        position: "fixed",
        justifyContent: "space-between",
        flexDirection: isMobileView ? "row" : "column",
        alignItems: isMobileView ? "flex-start" : "center",
        width: getSidebarWidth(
          isMobileView,
          props.collapsed,
          props.styles?.width,
        ),
        height: isMobileView ? TOP_SIDEBAR_HEIGHT : "100vh",
        borderRight: isMobileView ? "unset" : "1px solid lightgrey",
      }}
    >
      {props.header ? (
        <Row
          style={{
            padding: isMobileView || props.collapsed ? "0px" : "20px",
            alignSelf: "center",
            justifyContent: "center",
            ...(isMobileView
              ? {
                  flex: "none",
                  marginRight: "10px",
                  width: props?.styles?.headerCollapsedWidth,
                }
              : {}),
          }}
        >
          <span ref={headerRef}>{EnsembleRuntime.render([props.header])}</span>
        </Row>
      ) : null}

      <AntMenu
        mode={isMobileView ? "horizontal" : "inline"}
        style={{
          flex: "1",
          backgroundColor,
          display: "flex",
          alignSelf: "center",
          flexDirection: isMobileView ? "row" : "column",
          width: isMobileView ? "50%" : "inherit",
        }}
      >
        {/* FIXME: just use props here https://ant.design/components/menu#examples */}
        {props.items.map((item) => (
          <>
            <style>{menuItemStyles}</style>
            <AntMenu.Item
              data-testid={item.id}
              icon={renderMuiIcon(
                item.icon,
                props.styles?.iconWidth,
                props.styles?.iconHeight,
              )}
              key={item.page}
              onClick={(): void => handleClick(item.page, item.label)}
              style={{
                color:
                  values?.selectedItem === item.label
                    ? (props.styles?.selectedColor as string) ?? "white"
                    : (props.styles?.labelColor as string) ?? "grey",
                display: "flex",
                justifyContent: "center",
                borderRadius: 0,
                alignItems: "center",
                fontSize:
                  values?.selectedItem === item.label
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
                ...(values?.selectedItem === item.label
                  ? props.styles?.onSelectStyles ?? {}
                  : {}),
              }}
            >
              <span>
                {!props.collapsed && item.label}
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
              </span>
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
        <span
          style={{
            alignSelf: "center",
            justifyContent: "center",
            width: isMobileView
              ? props?.styles?.footerCollapsedWidth
              : "inherit",
          }}
        >
          <Col>{EnsembleRuntime.render([props.footer])}</Col>
        </span>
      ) : null}

      <Icon
        onClick={onCollapseCallback}
        style={{
          cursor: "pointer",
          alignSelf: props.collapsed ? "center" : "end",
          display: isMobileView ? "none" : "flex",
        }}
      >
        {renderMuiIcon(
          props.collapsed
            ? "KeyboardDoubleArrowRight"
            : "KeyboardDoubleArrowLeft",
          "24px",
          "24px",
        )}
      </Icon>
    </Col>
  );
};

const getSidebarWidth = (
  isMobileView: boolean,
  collapsed: boolean,
  defaultWidth?: string,
): string | undefined => {
  if (isMobileView) return "100%";
  if (collapsed) return COLLAPSED_SIDEBAR_WIDTH;
  return defaultWidth;
};
