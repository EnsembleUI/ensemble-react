import React, { useState, useEffect } from "react";
import { Menu as AntMenu, Col, Divider, Image, Input, Layout, Row } from "antd";
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
    onSelectStyles?: {
      backgroundColor?: TypeColors;
      borderColor?: TypeColors;
      borderWidth?: number | string;
      borderRadius?: string;
    };
  };
  logo: {
    uncollapsedSource: string;
    collapsedSource: string;
    styles?: {
      width?: string;
      height?: string;
    };
  };
  enableSearch?: boolean;
  isCollapsible?: boolean;
  hasBottomButton?: boolean;
  bottomButton?: {
    icon?: keyof typeof MuiIcons;
    text?: string;
    page?: string;
  };
}

export const SideBarMenu: React.FC<MenuBaseProps> = (props) => {
  const [collapsed, setCollapsed] = useState(!(window.innerWidth > 768));
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);
  const renderMuiIcon = (iconName: keyof typeof MuiIcons) => {
    const MuiIconComponent = MuiIcons[iconName];
    if (MuiIconComponent) {
      return (
        <MuiIconComponent
          style={{
            width: props.styles?.iconWidth! ?? "15px",
            height: props.styles?.iconHeight! ?? "15px",
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
    item.label.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const handleClick = (page: string, label: string) => {
    setSelectedItem(label);
    //window.location.href = page;
  };
console.log(selectedItem)
  return (
    <Col
      style={{
        backgroundColor: (props.styles?.backgroundColor as string) ?? "#1A2A4C",
      }}
    >
      <Col span={24}>
        <Image
          preview={false}
          src={
            collapsed
              ? props.logo.uncollapsedSource
              : props.logo.collapsedSource
          }
          style={{
            width: props.logo.styles?.width! ?? "15px",
            height: props.logo.styles?.height! ?? "15px",
            marginTop: "20px",
            marginBottom: "20px",
          }}
        />
      </Col>
      {Boolean(!collapsed) && props.enableSearch ? (
        <Col
          span={24}
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            marginBottom: "10px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              backgroundColor:
                (props.styles?.searchBoxColor as string) ?? "#3e5975",
              width: "80%",
              borderRadius: "5px",
            }}
          >
            <SearchOutlined color="grey" style={{ marginLeft: "4px" }} />
            <Input
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              style={{
                width: "80%",
                padding: "8px",
                backgroundColor:
                  (props.styles?.searchBoxColor as string) ?? "#3e5975",
                border: `1px solid ${
                  props.styles?.searchBoxColor
                    ? `${props.styles.searchBoxColor}`
                    : "#3e5975"
                }`,
              }}
              type="text"
              value={searchQuery}
            />
          </div>
        </Col>
      ) : null}
      <AntMenu
        inlineCollapsed={collapsed}
        mode="inline"
        style={{
          width: collapsed ? 56 : 256,
          //minHeight: "70vh",
          marginBottom: "80px",
          flex: "1",
          backgroundColor:
            (props.styles?.backgroundColor as string) ?? "#1A2A4C",
        }}
      >
        {filteredItems.map((item, index) => (
          <>
            <Col
              span={24}
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                marginBottom: "10px",
              }}
            >
              <AntMenu.Item
                icon={renderMuiIcon(item.icon)}
                key={index}
                onClick={() => handleClick(item.page, item.label)}
                style={{
                  color:
                    selectedItem === item.label
                      ? (props.styles?.selectedColor as string) ?? "white"
                      : (props.styles?.labelColor as string) ?? "grey",
                  display: "flex",
                  justifyContent: "start",
                  paddingLeft: "10px",
                  border: `solid ${
                    selectedItem === item.label
                      ? (props.styles?.onSelectStyles?.borderColor as string) ??
                        "red"
                      : "transparent" // Transparent border for non-selected items
                  }`,
                  borderWidth: `${
                    selectedItem === item.label
                      ? (props.styles?.onSelectStyles?.borderWidth as string) ??
                        "0px 0px 4px 0px"
                      : "0" // No border for non-selected items
                  }`,
                  borderRadius:
                    props.styles?.onSelectStyles?.borderRadius ?? "5px",
                  width: "90%",
                  alignItems: "center",
                  backgroundColor:
                    selectedItem === item.label
                      ? (props.styles?.onSelectStyles
                          ?.backgroundColor as string)
                      : (props.styles?.backgroundColor as string) ?? "#d4d6d5",
                  //paddingLeft: "20px",
                  fontSize: `${
                    props.styles?.labelFontSize ? props.styles.labelFontSize : 1
                  }rem`,
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
            </Col>
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
      {props.isCollapsible && (
        <Col
          span={24}
          style={{
            padding: "20px",
            display: "flex",
            justifyContent: "flex-end",
            backgroundColor: "#1A2A4C",
            position: "absolute",
            //marginTop: "20px",
            bottom: 0,
            right: 0,
          }}
        >
          <Image
            onClick={toggleCollapsed}
            preview={false}
            src={
              collapsed
                ? "https://i.imgur.com/2N3m1lj.png"
                : "https://i.imgur.com/PASy9A1.png"
            }
            style={{
              width: 25,
              height: 25,
            }}
          />
        </Col>
      )}
      {props.hasBottomButton && (
        <AntMenu
          style={{
            position: "absolute",
            bottom: 0,
            width: "100%",
            borderTop: "1px solid grey",
          }}
        >
          <AntMenu.Item
            icon={renderMuiIcon(props.bottomButton?.icon ?? "Menu")}
            style={{
              color: "black",
              backgroundColor:
                (props.styles?.backgroundColor as string) ?? "white",
            }}
          >
            {props.bottomButton?.text}
          </AntMenu.Item>
        </AntMenu>
      )}
    </Col>
  );
};

WidgetRegistry.register("SideBarMenu", SideBarMenu);
