import React, { useState } from "react";
import type { Expression } from "framework";
import { useEnsembleState } from "framework";
import { WidgetRegistry } from "../registry";
import { getColor } from "../util/utils";
import { Avatar as MuiAvatar } from "@mui/material";
import * as MuiIcons from "@mui/icons-material";
import type { EnsembleWidgetProps, HasBorder } from "../util/types";
import { renderMuiIcon } from "../util/renderMuiIcons";
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
    console.log(words);
    if (words.length === 1) {
      return words[0][0].toUpperCase();
    } else if (words.length >= 2) {
      return `${words[0][0].toUpperCase()}${words[1][0].toUpperCase()}`;
    }

    return "";
  };
  const nameString = props.name?.toString();
  return (
    <MuiAvatar
    alt={props?.alt}
      sx={{
        bgcolor:
          props.styles?.backgroundColor ?? stringToColor(nameString ?? ""),
        width: props.styles?.width,
        height: props.styles?.height,
      }}
      src={props.src}
    >
      {props?.name ? generateInitials(props.name) :
      renderMuiIcon(props?.icon ?? "Person")}
    </MuiAvatar>
  );
};

WidgetRegistry.register("Avatar", Avatar);
