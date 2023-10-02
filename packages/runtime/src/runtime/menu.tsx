import type { ReactNode } from "react";
import React, { useState, useEffect } from "react";
import { Menu as AntMenu, Col, Divider } from "antd";
import * as MuiIcons from "@mui/icons-material";
import type { EnsembleWidget } from "framework";
import { useNavigate } from "react-router-dom";
import { getColor } from "../util/utils";
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
  const navigate = useNavigate();
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

  const handleClick = (page: string, label: string): void => {
    setSelectedItem(label);
    navigate(`/${page.toLowerCase()}`);
  };

  return (
    <Col
      style={{
        backgroundColor,
        borderRight: "1px solid lightgrey",
      }}
    >
      {props.header ? (
        <Col span={24} style={{ padding: "20px" }}>
          {EnsembleRuntime.render([props.header])}
        </Col>
      ) : null}
      <AntMenu
        mode="inline"
        style={{
          marginBottom: "80px",
          flex: "1",
          backgroundColor,
        }}
      >
        {props.items.map((item) => (
          <>
            <AntMenu.Item
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
                    ? (props.styles?.selectedColor as string) ?? "white"
                    : (props.styles?.labelColor as string) ?? "grey",
                display: "flex",
                justifyContent: "start",
                borderLeft:
                  selectedItem === item.label ? "4px solid #e07407" : "",
                borderRadius: 0,
                alignItems: "center",
                //paddingLeft: "20px",
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
                backgroundColor,
              }}
            >
              <span
                style={{
                  display: "flex",
                  justifyContent: "left",
                  //marginLeft: "15px",
                }}
              >
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
