import React, { useState } from "react";
import type { Expression } from "framework";
import { Menu as AntMenu, Col, Divider, Image, Input, Row } from "antd";
import { useEnsembleState, useEvaluate } from "framework";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from ".";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { IconProp, library } from "@fortawesome/fontawesome-svg-core";
import { fab } from "@fortawesome/free-brands-svg-icons";
import { faCheckSquare, faCoffee } from "@fortawesome/free-solid-svg-icons";
import { fa0, fa1 } from "@fortawesome/free-solid-svg-icons";
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
}

interface MenuBaseProps {
  items: MenuItem[];
  styles?: {
    backgroundColor?: TypeColors;
    labelColor?: TypeColors;
    selectedColor?: TypeColors;
    labelFontSize?: number;
  };
  logo: {
    uncollapsedSource: string;
    collapsedSource: string;
    styles?: {
      width?: number;
      height?: number;
    };
  };
}

export const SideBarMenu: React.FC<MenuBaseProps> = (props) => {
  const [collapsed, setCollapsed] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  library.add(fab, faCheckSquare, faCoffee);
  const toggleCollapsed = () => {
    setCollapsed(!collapsed);
  };
  const { items } = props;
  const filteredItems = props.items.filter((item) =>
    item.label.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleClick = (page: string) => {
    window.location.href = page;
  };

  console.log(`${parseInt(`${props.styles?.labelFontSize}` || "16") + 2}`);
  return (
    <Row style={{ height: "100vh" }}>
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
        {!!!collapsed && (
          <Col span={24}>
            <Input
              type="text"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                width: "90%",
                padding: "8px",
                marginBottom: "10px",
              }}
            />
          </Col>
        )}
        <AntMenu
          mode="inline"
          style={{
            width: collapsed ? 56 : 256,
            height: "100%",
            backgroundColor: `${props.styles?.backgroundColor}`,
          }}
          inlineCollapsed={collapsed}
        >
          {filteredItems.map((item, index) => (
            <>
              <AntMenu.Item
                key={index}
                icon={<FontAwesomeIcon icon={item.icon as IconProp} />}
                onClick={() => handleClick(item.page)}
                style={{
                  color: item.selected
                    ? `${props.styles?.selectedColor}`
                    : `${props.styles?.labelColor}`,
                  display: "flex",
                  justifyContent: "start",
                  borderLeft: item.selected ? "4px solid orange" : "",
                  borderRadius: 0,
                  alignItems: "center",
                  paddingLeft: "20px",
                  fontSize: item.selected
                    ? `${
                        parseInt(`${props.styles?.labelFontSize}` || "16") + 2
                      }px`
                    : `${props.styles?.labelFontSize}px`,
                }}
              >
                <span
                  style={{
                    display: "flex",
                    justifyContent: "left",
                    marginLeft: "15px",
                  }}
                >
                  {item.label}
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
    </Row>
  );
};

WidgetRegistry.register("SideBarMenu", SideBarMenu);
