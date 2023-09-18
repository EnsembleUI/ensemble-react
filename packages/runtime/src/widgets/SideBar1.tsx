import React, { useState, useEffect } from "react";
import { Menu as AntMenu, Col, Divider, Image, Input, Row } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import * as MuiIcons from "@mui/icons-material";
import { WidgetRegistry } from "../registry";

type TypeColors =
  | number
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
  | "orange"
  | string;

interface MenuItem {
  icon: keyof typeof MuiIcons;
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
  logo: {
    uncollapsedSource: string;
    collapsedSource: string;
    styles?: {
      width?: number;
      height?: number;
    };
  };
  enableSearch: boolean;
}

export const SideBarMenu1: React.FC<MenuBaseProps> = (props) => {
  const [collapsed, setCollapsed] = useState(!(window.innerWidth > 768));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const [mode, setMode] = useState("horizontal");
  const renderMuiIcon = (iconName: keyof typeof MuiIcons) => {
    const MuiIconComponent = MuiIcons[iconName];
    if (MuiIconComponent) {
      return (
        <MuiIconComponent
          style={{
            width: (props.styles?.iconWidth as string) ?? "15px",
            height: (props.styles?.iconHeight as string) ?? "15px",
          }}
        />
      );
    }
    return null;
  };

  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  useEffect(() => {
    const initiallySelectedItem = props.items.find((item) => item.selected);
    if (initiallySelectedItem) {
      setSelectedItem(initiallySelectedItem.label);
    }
  }, [props.items]);

  const filteredItems = props.items.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClick = (page: string, label: string) => {
    setSelectedItem(label);
    //window.location.href = page;
  };

  return (
    <>
      <AntMenu
        mode="horizontal"
        style={{
          width: mode === "vertical" ? (collapsed ? 56 : 256) : "",
          minHeight: mode === "vertical" ? "90vh" : "",
          flex: "1",
          //height: "100%",
          justifyContent: mode === "horizontal" ? "space-between" : "",
          backgroundColor:
            (props.styles?.backgroundColor as string) ?? "#1A2A4C",
          position: "relative",
        }}
        inlineCollapsed={collapsed}
      >
        <Image
          src={
            collapsed
              ? props.logo.uncollapsedSource
              : props.logo.collapsedSource
          }
          style={{
            width: `${props.logo.styles?.width}` ?? `15`,
            height: `${props.logo.styles?.height}` ?? `15`,
            marginTop: "20px",
            marginBottom: "20px",
          }}
          preview={false}
        />
        {!collapsed && (
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              margin: "10px",
              backgroundColor:
                (props.styles?.searchBoxColor as string) ?? "#3e5975",
              width: "230px",
              borderRadius: "5px",
            }}
          >
            <SearchOutlined color="grey" style={{ marginLeft: "4px" }} />
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "80%",
                padding: "8px",
                backgroundColor:
                  (props.styles?.searchBoxColor as string) ?? "#3e5975",
                border: `1px solid ${
                  props.styles?.searchBoxColor
                    ? `${props.styles?.searchBoxColor}`
                    : "#3e5975"
                }`,
              }}
            />
          </div>
        )}
        {filteredItems.map((item, index) => (
          <>
            <AntMenu.Item
              key={index}
              icon={renderMuiIcon(item.icon)}
              onClick={() => handleClick(item.page, item.label)}
              style={{
                color:
                  selectedItem === item.label
                    ? (props.styles?.selectedColor as string) ?? "white"
                    : (props.styles?.labelColor as string) ?? "grey",
                display: "flex",
                justifyContent: "start",
                borderLeft:
                  mode === "vertical" && selectedItem === item.label
                    ? "4px solid #e07407"
                    : "",
                borderRadius: 0,
                alignItems: "center",
                //paddingLeft: "20px",
                fontSize: `${props.styles?.labelFontSize ?? 1}rem`,
                backgroundColor:
                  (props.styles?.backgroundColor as string) ?? "#1A2A4C",
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
                {item.hasNotifications && (
                  <div
                    style={{
                      marginTop: "8px",
                      marginLeft: "2px",
                      width: "8px",
                      height: "8px",
                      backgroundColor: "#e07407",
                      borderRadius: "50%",
                    }}
                  ></div>
                )}
              </span>
            </AntMenu.Item>
            {mode === "vertical" && item.divider && (
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
            )}
          </>
        ))}
        {/* {mode === "vertical" && (
          <AntMenu.Item
            key="collapsed-image"
            style={{
              backgroundColor:
                (props.styles?.backgroundColor as string) ?? "#1A2A4C",
              display: "flex",
              justifyContent: "end",
              right: 0,
            }}
          >
            <Image
              src={
                collapsed
                  ? "https://i.imgur.com/2N3m1lj.png"
                  : "https://i.imgur.com/PASy9A1.png"
              }
              onClick={toggleCollapsed}
              style={{
                width: 25,
                height: 25,
              }}
              preview={false}
            />
          </AntMenu.Item>
        )} */}
      </AntMenu>
      {mode === "vertical" && (
        
        <AntMenu
          key="collapsed-image"
          style={{
            backgroundColor:
              (props.styles?.backgroundColor as string) ?? "#1A2A4C",
            width: mode === "vertical" ? (collapsed ? 56 : 256) : "",
            display: "flex",
            justifyContent: "end",
            right: 0,
            height: "10vh",
            padding: "10px",
            alignItems: "center"
          }}
        >
          <Image
            src={
              collapsed
                ? "https://i.imgur.com/2N3m1lj.png"
                : "https://i.imgur.com/PASy9A1.png"
            }
            onClick={toggleCollapsed}
            style={{
              width: 25,
              height: 25,
            }}
            preview={false}
          />
        </AntMenu>
      )}
    </>
  );
};

WidgetRegistry.register("SideBarMenu1", SideBarMenu1);
