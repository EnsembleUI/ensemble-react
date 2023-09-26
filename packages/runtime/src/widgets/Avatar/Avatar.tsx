import React, { useEffect, useState } from "react";
import type { Expression } from "framework";
import { useEnsembleState, useEvaluate } from "framework";
import {
  Avatar as MuiAvatar,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import * as MuiIcons from "@mui/icons-material";
import { renderMuiIcon } from "../../util/renderMuiIcons";
import { useNavigateScreen } from "../../runtime/navigate";
import { WidgetRegistry } from "../../registry";
import { stringToColor } from "./utils/stringToColors";
import { generateInitials } from "./utils/generateInitials";

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
  const nameString = props.name?.toString();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(Boolean(menuAnchorEl));
  const { values } = useEnsembleState(props);
  const onTapCallback = useEvaluate(code, values);
  const onNavigate = useNavigateScreen(screen);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setMenuAnchorEl(event.currentTarget);
    setIsMenuOpen(true);
  };

  const handleMenuClose = (): void => {
    setMenuAnchorEl(null);
    setIsMenuOpen(false);
  };

  const handleMenuClick = (menuItem: AvatarMenu): void => {
    menuItem.onTap?.executeCode && setCode(menuItem.onTap?.executeCode);
    menuItem.onTap?.navigateScreen && setScreen(menuItem.onTap?.navigateScreen);
    handleMenuClose();
  };

  useEffect(() => {
    code && onTapCallback();
  }, [code, onTapCallback]);
  useEffect(() => {
    screen && onNavigate();
  }, [screen, onNavigate]);

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
          open={isMenuOpen}
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
