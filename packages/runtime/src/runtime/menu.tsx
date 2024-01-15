import type { ReactNode } from "react";
import React, { useState, useEffect } from "react";
import { Menu as AntMenu, Col, Divider, Row } from "antd";
import * as MuiIcons from "@mui/icons-material";
import {
  useRegisterBindings,
  type EnsembleWidget,
} from "@ensembleui/react-framework";
import { useLocation, useNavigate } from "react-router-dom";
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
  icon?: string;
  iconLibrary?: "default" | "fontAwesome";
  label: string;
  page: string;
  selected?: boolean;
  divider?: boolean;
  hasNotifications?: boolean;
}

interface MenuBaseProps {
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

export const SideBarMenu: React.FC<MenuBaseProps> = (props) => {
  const { values } = useRegisterBindings({ ...props });
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

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

  const handleClick = (page: string, label: string): void => {
    setSelectedItem(label);
    navigate(`/${page.toLowerCase()}`);
  };

  return (
    <Col
      id="ensemble-sidebar"
      style={{
        backgroundColor,
        borderRight: "1px solid lightgrey",
        display: "flex",
        justifyContent: "space-between",
        flexDirection: "column",
        width: props.styles?.width,
        height: "100vh",
        position: "fixed",
        alignItems: "center",
        zIndex: 1,
      }}
    >
      {props.header ? (
        <Row style={{ padding: "20px" }}>
          {EnsembleRuntime.render([props.header])}
        </Row>
      ) : null}
      <AntMenu
        mode="inline"
        style={{
          flex: "1",
          backgroundColor,
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* FIXME: just use props here https://ant.design/components/menu#examples */}
        {props.items.map((item) => (
          <>
            <AntMenu.Item
              data-testid={item.id ?? item.testId}
              icon={renderMuiIcon(
                item.icon,
                props.styles?.iconWidth,
                props.styles?.iconHeight,
              )}
              key={item.page}
              onClick={() => handleClick(item.page, item.label)}
              style={{
                color:
                  selectedItem === item.label
                    ? (values?.styles?.selectedColor as string) ?? "white"
                    : (values?.styles?.labelColor as string) ?? "grey",
                display: "flex",
                justifyContent: "center",
                borderRadius: 0,
                alignItems: "center",
                fontSize:
                  selectedItem === item.label
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
                ...(selectedItem === item.label
                  ? props.styles?.onSelectStyles ?? {}
                  : {}),
              }}
            >
              <span>
                {item.label}
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
        <Col>{EnsembleRuntime.render([props.footer])}</Col>
      ) : null}
    </Col>
  );
};
