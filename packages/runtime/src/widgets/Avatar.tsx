import React, { useState } from "react";
import type { Expression } from "framework";
import { useEnsembleState } from "framework";
import { WidgetRegistry } from "../registry";
import { getColor } from "../util/utils";
import {
  Avatar as MuiAvatar,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import * as MuiIcons from "@mui/icons-material";
import type { EnsembleWidgetProps, HasBorder } from "../util/types";
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
  return (
    <div>
      <MuiAvatar
        alt={props?.alt}
        sx={{
          bgcolor:
            props.styles?.backgroundColor ?? stringToColor(nameString ?? ""),
          width: props.styles?.width,
          height: props.styles?.height,
          cursor: "pointer", // Add cursor style to indicate it's clickable
        }}
        src={props.src}
        onClick={handleMenuOpen} // Open the menu on click
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
        //   PaperProps={{
        //     elevation: 0,
        //     sx: {
        //       overflow: "visible",
        //       filter: "drop-shadow(0px 2px 8px rgba(0,0,0,0.32))",
        //       mt: 1.5,
        //       "& .MuiAvatar-root": {
        //         width: 32,
        //         height: 32,
        //         ml: -0.5,
        //         mr: 1,
        //       },
        //       "&:before": {
        //         content: '""',
        //         display: "block",
        //         position: "absolute",
        //         top: 0,
        //         right: 14,
        //         width: 10,
        //         height: 10,
        //         bgcolor: "background.paper",
        //         transform: "translateY(-50%) rotate(45deg)",
        //         zIndex: 0,
        //       },
        //     },
        //   }}
        //   transformOrigin={{ horizontal: "right", vertical: "top" }}
        //   anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
        >
          {props.menu?.map((menuItem, index) => (
            <MenuItem key={index} onClick={handleMenuClose}>
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
