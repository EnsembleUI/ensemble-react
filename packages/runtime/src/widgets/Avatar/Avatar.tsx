import React, { useCallback, useMemo, useState } from "react";
import type { EnsembleAction, Expression } from "@ensembleui/react-framework";
import { isExpression, useRegisterBindings } from "@ensembleui/react-framework";
import {
  Avatar as MuiAvatar,
  Menu,
  MenuItem,
  ListItemIcon,
} from "@mui/material";
import { isString } from "lodash-es";
import { WidgetRegistry } from "../../registry";
import type { EnsembleWidgetStyles, IconProps } from "../../shared/types";
// eslint-disable-next-line import/no-cycle
import { Icon } from "../Icon";
import { useEnsembleAction } from "../../runtime/hooks/useEnsembleAction";
import { generateInitials } from "./utils/generateInitials";

const widgetName = "Avatar";

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
  const [menuAnchorEl, setMenuAnchorEl] = useState<null | HTMLElement>(null);
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(Boolean(menuAnchorEl));
  const [name, setName] = useState(props.name);
  const { values, rootRef } = useRegisterBindings(
    { ...props, name, widgetName },
    props.id,
    {
      setName,
    },
  );

  const actions = values?.menu?.map((menuItem) => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    return useEnsembleAction(menuItem.onTap);
  });

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>): void => {
    setMenuAnchorEl(event.currentTarget);
    setIsMenuOpen(true);
  };

  const handleMenuClose = (): void => {
    setMenuAnchorEl(null);
    setIsMenuOpen(false);
  };

  const handleMenuClick = useCallback(
    (menuItem: AvatarMenu): void => {
      const menuIndex = values?.menu?.indexOf(menuItem);
      if (menuIndex !== undefined) {
        actions?.at(menuIndex)?.callback({
          ...menuItem,
        });
      }

      handleMenuClose();
    },
    [values?.menu, actions],
  );

  const initials = useMemo(
    () => (isExpression(values?.name) ? "" : generateInitials(values?.name)),
    [values?.name],
  );

  return (
    <div ref={rootRef}>
      <MuiAvatar
        alt={values?.alt}
        onClick={handleMenuOpen}
        src={values?.src}
        sx={{
          backgroundColor: "black",
          color: "white",
          cursor: "pointer",
          ...values?.styles,
          ...(values?.styles?.visible === false
            ? { display: "none" }
            : undefined),
        }}
      >
        {initials || (
          <Icon
            color={values?.icon?.color}
            name={values?.icon?.name ?? ""}
            size={values?.icon?.size}
          />
        )}
      </MuiAvatar>
      {values?.menu ? (
        <Menu
          anchorEl={menuAnchorEl}
          onClose={handleMenuClose}
          open={isMenuOpen}
        >
          {values?.menu.map((menuItem, idx) => {
            const icon = isString(menuItem.icon)
              ? { name: menuItem.icon }
              : menuItem.icon;
            return (
              <MenuItem
                key={idx}
                onClick={(): void => handleMenuClick(menuItem)}
              >
                {icon ? (
                  <ListItemIcon>
                    <Icon {...icon} />
                  </ListItemIcon>
                ) : null}
                {menuItem.label}
              </MenuItem>
            );
          })}
        </Menu>
      ) : null}
    </div>
  );
};

WidgetRegistry.register(widgetName, Avatar);
