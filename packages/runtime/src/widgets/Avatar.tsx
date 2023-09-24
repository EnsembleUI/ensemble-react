import React, { useEffect, useState } from "react";
import type { Expression } from "framework";
import { useEnsembleState, useEvaluate } from "framework";
import { useNavigateScreen } from "../runtime/navigate";
import { WidgetRegistry } from "../registry";
import {
  Avatar as MuiAvatar,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import * as MuiIcons from "@mui/icons-material";
import { renderMuiIcon } from "../util/renderMuiIcons";

export type AvatarMenu = {
  label: string;
  icon?: keyof typeof MuiIcons;
  onTap?: {
    executeCode?: string;
    navigateScreen?: string;
  };
};

export type AvatarProps = {
  alt: Expression<string>;
  src?: Expression<string>;
  name?: Expression<string>;
  icon?: keyof typeof MuiIcons;
  styles?: {
    width?: number | string;
    height?: number | string;
    backgroundColor?: string;
  };
  menu?: AvatarMenu[];
};

export const Avatar: React.FC<AvatarProps> = (props) => {
  const [code, setCode] = useState("");
  const [screen, setScreen] = useState("");
  function stringToColor(string: Expression<string>) {
    let hash = 0;
    let i;

    /* eslint-disable no-bitwise */
    for (i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }

    let color = "#";

    for (i = 0; i < 3; i += 1) {
      const value = (hash >> (i * 8)) & 0xff;
      color += `00${value.toString(16)}`.slice(-2);
    }
    /* eslint-enable no-bitwise */

    return color;
  }

  const generateInitials = (name?: string): string => {
    if (!name) return "";

    const words = name.split(" ");
    if (words.length === 1) {
      return words[0][0].toUpperCase();
    } else if (words.length >= 2) {
      return `${words[0][0].toUpperCase()}${words[1][0].toUpperCase()}`;
    }

    return "";
  };
  const nameString = props.name?.toString();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMenuAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setMenuAnchorEl(null);
  };

  const handleMenuClick = (menuItem: any) => {
    menuItem.onTap?.executeCode && setCode(menuItem.onTap?.executeCode);
    menuItem.onTap?.navigateScreen && setScreen(menuItem.onTap?.navigateScreen);
    handleMenuClose();
  };
  useEffect(() => {
    code && onTapCallback();
  }, [code]);
  useEffect(() => {
    screen && onNavigate();
  }, [screen]);

  const { values } = useEnsembleState(props);
  const onTapCallback = useEvaluate(code, values);
  const onNavigate = useNavigateScreen(screen);

  return (
    <div>
      <MuiAvatar
        alt={props?.alt}
        sx={{
          bgcolor:
            props.styles?.backgroundColor ?? stringToColor(nameString ?? ""),
          width: props.styles?.width,
          height: props.styles?.height,
          cursor: "pointer",
        }}
        src={props.src}
        onClick={handleMenuOpen}
      >
        {props?.name
          ? generateInitials(props.name)
          : renderMuiIcon(props?.icon ?? "Person")}
      </MuiAvatar>
      {props.menu && (
        <Menu
          anchorEl={menuAnchorEl}
          open={Boolean(menuAnchorEl)}
          onClose={handleMenuClose}
        >
          {props.menu?.map((menuItem, index) => (
            <MenuItem key={index} onClick={() => handleMenuClick(menuItem)}>
              {menuItem.icon && (
                <ListItemIcon>{renderMuiIcon(menuItem.icon)}</ListItemIcon>
              )}
              {menuItem.label}
            </MenuItem>
          ))}
        </Menu>
      )}
    </div>
  );
};

WidgetRegistry.register("Avatar", Avatar);
