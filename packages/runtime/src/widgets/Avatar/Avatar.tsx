import React, { useEffect, useState } from "react";
import type { Expression } from "framework";
import { useRegisterBindings, useExecuteCode } from "framework";
import {
  Avatar as MuiAvatar,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import { useNavigateScreen } from "../../runtime/navigate";
import { WidgetRegistry } from "../../registry";
import { stringToColor } from "./utils/stringToColors";
import { generateInitials } from "./utils/generateInitials";
import { IconProps } from "../../util/types";
import { Icon } from "../Icon";

export type AvatarMenu = {
  label: string;
  icon?: IconProps;
  onTap?: {
    executeCode?: string;
    navigateScreen?: string;
  };
};

export type AvatarProps = {
  alt: Expression<string>;
  src?: Expression<string>;
  name?: Expression<string>;
  icon?: IconProps;
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
  const { values } = useRegisterBindings(props);
  const onTapCallback = useExecuteCode(code, values);
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
        {props?.name ? (
          generateInitials(props.name)
        ) : (
          <Icon
            name={props.icon?.name ?? ""}
            color={props.icon?.color}
            size={props.icon?.size}
          />
        )}
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
                <ListItemIcon>
                  {
                    <Icon
                      name={menuItem.icon.name ?? ""}
                      color={menuItem.icon.color}
                      size={menuItem.icon.size}
                    />
                  }
                </ListItemIcon>
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
