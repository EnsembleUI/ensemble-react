import React, { useEffect, useState } from "react";
import type { EnsembleAction, Expression } from "@ensembleui/react-framework";
import { useRegisterBindings } from "@ensembleui/react-framework";
import {
  Avatar as MuiAvatar,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import { isString } from "lodash-es";
import { useNavigateScreen } from "../../runtime/hooks/useNavigateScreen";
import { WidgetRegistry } from "../../registry";
import type { EnsembleWidgetStyles, IconProps } from "../../shared/types";
import { Icon } from "../Icon";
import { useExecuteCode } from "../../runtime/hooks/useEnsembleAction";
import { stringToColor } from "./utils/stringToColors";
import { generateInitials } from "./utils/generateInitials";

export interface AvatarMenu {
  label: string;
  icon?: IconProps;
  onTap?: EnsembleAction;
}

export interface AvatarProps {
  id?: string;
  [key: string]: unknown;
  alt: Expression<string>;
  src?: Expression<string>;
  name?: Expression<string>;
  icon?: IconProps;
  styles?: EnsembleWidgetStyles;
  menu?: AvatarMenu[];
}

export const Avatar: React.FC<AvatarProps> = (props) => {
  const [code, setCode] = useState("");
  const [screen, setScreen] = useState("");
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(Boolean(menuAnchorEl));
  const [name, setName] = useState(props.name);
  const { values, rootRef } = useRegisterBindings(
    { ...props, name },
    props.id,
    {
      setName,
    },
  );
  // FIXME: action callbacks should take params so they can be callable per element
  const executeCode = useExecuteCode(code, { context: values });
  const navigate = useNavigateScreen(screen);

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setMenuAnchorEl(event.currentTarget);
    setIsMenuOpen(true);
  };

  const handleMenuClose = (): void => {
    setMenuAnchorEl(null);
    setIsMenuOpen(false);
  };

  const handleMenuClick = (menuItem: AvatarMenu): void => {
    menuItem.onTap &&
      "executeCode" in menuItem.onTap &&
      setCode(String(menuItem.onTap.executeCode));
    menuItem.onTap &&
      "navigateScreen" in menuItem.onTap &&
      isString(menuItem.onTap.navigateScreen) &&
      setScreen(menuItem.onTap.navigateScreen);
    handleMenuClose();
  };

  useEffect(() => {
    code && executeCode?.callback();
  }, [code, executeCode]);
  useEffect(() => {
    screen && navigate?.callback();
  }, [screen, navigate]);

  return (
    <div ref={rootRef}>
      <MuiAvatar
        alt={props.alt}
        onClick={handleMenuOpen}
        src={props.src}
        sx={{
          bgcolor:
            props.styles?.backgroundColor ?? stringToColor(values?.name ?? ""),
          width: props.styles?.width,
          height: props.styles?.height,
          color: props.styles?.color ?? "white",
          cursor: "pointer",
          ...values?.styles,
          ...values?.styles,
          ...(values?.styles?.visible === false
            ? { display: "none" }
            : undefined),
        }}
      >
        {props.name ? (
          generateInitials(values?.name)
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
          {props.menu.map((menuItem) => (
            <MenuItem
              key={menuItem.label}
              onClick={(): void => handleMenuClick(menuItem)}
            >
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
