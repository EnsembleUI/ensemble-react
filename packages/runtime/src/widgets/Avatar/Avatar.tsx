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
import type { IconProps } from "../../util/types";
import { Icon } from "../Icon";
import { stringToColor } from "./utils/stringToColors";
import { generateInitials } from "./utils/generateInitials";

export interface AvatarMenu {
  label: string;
  icon?: IconProps;
  onTap?: {
    executeCode?: string;
    navigateScreen?: string;
  };
}

export interface AvatarProps {
  alt: Expression<string>;
  src?: Expression<string>;
  name?: Expression<string>;
  icon?: IconProps;
  styles?: {
    width?: number | string;
    height?: number | string;
    backgroundColor?: string;
    color: string;
  };
  menu?: AvatarMenu[];
}

export const Avatar: React.FC<AvatarProps> = (props) => {
  const [code, setCode] = useState("");
  const [screen, setScreen] = useState("");
  const nameString = props.name?.toString();
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(Boolean(menuAnchorEl));
  const [text, setText] = useState(props.name);
  const { values } = useRegisterBindings({ ...props, text }, props.alt, {
    setText,
  });
  
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
    menuItem.onTap?.executeCode && setCode(menuItem.onTap.executeCode);
    menuItem.onTap?.navigateScreen && setScreen(menuItem.onTap.navigateScreen);
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
        alt={props.alt}
        onClick={handleMenuOpen}
        src={props.src}
        sx={{
          bgcolor:
            props.styles?.backgroundColor ?? stringToColor(values.name ?? ""),
          width: props.styles?.width,
          height: props.styles?.height,
          color: props.styles?.color ?? "white",
          cursor: "pointer",
        }}
      >
        {props.name ? (
          generateInitials(values.name)
        ) : (
          <Icon
            color={props.icon?.color}
            name={props.icon?.name ?? ""}
            size={props.icon?.size}
          />
        )}
      </MuiAvatar>
      {props.menu ? (
        <Menu
          anchorEl={menuAnchorEl}
          onClose={handleMenuClose}
          open={isMenuOpen}
        >
          {props.menu.map((menuItem, index) => (
            <MenuItem key={index} onClick={() => handleMenuClick(menuItem)}>
              {menuItem.icon ? (
                <ListItemIcon>
                  <Icon
                    color={menuItem.icon.color}
                    name={menuItem.icon.name}
                    size={menuItem.icon.size}
                  />
                </ListItemIcon>
              ) : null}
              {menuItem.label}
            </MenuItem>
          ))}
        </Menu>
      ) : null}
    </div>
  );
};

WidgetRegistry.register("Avatar", Avatar);
