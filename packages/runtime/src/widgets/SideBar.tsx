import React, { useState, useEffect } from "react";
import type { Expression } from "framework";
import { Menu as AntMenu, Col, Divider, Image, Input, Row, Layout } from "antd";
import { useEnsembleState, useEvaluate } from "framework";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from ".";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp, SizeProp, library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { faCheckSquare, faCoffee } from "@fortawesome/free-solid-svg-icons";
import { SearchOutlined } from "@ant-design/icons";
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
  icon: string;
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

export const SideBarMenu: React.FC<MenuBaseProps> = (props) => {
  const [collapsed, setCollapsed] = useState(window.innerWidth >768 ? false : true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedItem, setSelectedItem] = useState<string | null>(null);

  library.add(fab, faCheckSquare, faCoffee);
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };

  useEffect(() => {
    // Find the initially selected item and set it as selectedItem
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
    
    <Layout style={{ minHeight: "100vh" }} hasSider>
      <Col
        style={{
          backgroundColor: `${props.styles?.backgroundColor}`,
        }}
      >
        <Col span={24}>
          <Image
            src={
              collapsed
                ? props.logo.uncollapsedSource
                : props.logo.collapsedSource
            }
            style={{
              width: `${props.logo.styles?.width}`,
              height: `${props.logo.styles?.height}`,
              marginTop: "20px",
              marginBottom: "20px",
            }}
            preview={false}
          />
        </Col>
        {!!!collapsed && props.enableSearch && (
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
                backgroundColor: `${props.styles?.searchBoxColor}`,
                width: "80%",
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
                  backgroundColor: `${props.styles?.searchBoxColor}`,
                  border: `1px solid ${props.styles?.searchBoxColor}`,
                }}
              />
            </div>
          </Col>
        )}
        <AntMenu
          mode="inline"
          style={{
            //width: collapsed ? 56 : 256,
            height: "70vh",
            overflow: "scroll",
            backgroundColor: `${props.styles?.backgroundColor}`,
          }}
          inlineCollapsed={collapsed}
        >
          {filteredItems.map((item, index) => (
            <>
              <AntMenu.Item
                key={index}
                icon={
                  <FontAwesomeIcon
                    icon={item.icon as IconProp}
                  />
                }
                onClick={() => handleClick(item.page, item.label)}
                style={{
                  color:
                    selectedItem === item.label
                      ? `${props.styles?.selectedColor}`
                      : `${props.styles?.labelColor}`,
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
                          parseInt(`${props.styles?.labelFontSize}` || "1") + 0.2
                        }rem`
                      : `${props.styles?.labelFontSize}rem`,
                  backgroundColor: `${props.styles?.backgroundColor}`,
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
              {item.divider && (
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
        </AntMenu>
        <Col
          span={24}
          style={{
            padding: "20px",
            display: "flex",
            justifyContent: "flex-end",
            backgroundColor: `${props.styles?.backgroundColor}`,
            position: "absolute",
            bottom: 0,
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
        </Col>
      </Col>
    </Layout>
  );
};

WidgetRegistry.register("SideBarMenu", SideBarMenu);
