import React, { useEffect, useState, useMemo } from "react";
import type { Expression, Widget } from "framework";
import { useEnsembleState, useEvaluate } from "framework";
import { useNavigateScreen } from "../runtime/navigate";
import { WidgetRegistry } from "../registry";
import { AvatarGroup as MuiAvatarGroup, Avatar } from "@mui/material";
import * as MuiIcons from "@mui/icons-material";
import { EnsembleRuntime } from "../runtime";
import { AvatarMenu } from "./Avatar";
import { AvatarProps } from "./Avatar";

export type AvatarGroupProps = {
  max: number;
  "item-template": {
    data: Expression<object>;
    name: string;
    template: AvatarTemplate;
  };
};
export interface AvatarTemplate {
  name: "Avatars";
  properties: {
    children: AvatarProps[];
  };
}
export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  max,
  "item-template": itemTemplate,
}) => {
  const renderedChildren = useMemo(() => {
    return EnsembleRuntime.render(
      itemTemplate.template.properties.children as unknown as Widget[]
    );
  }, [itemTemplate.template.properties.children]);

  return (
    <div>
      <MuiAvatarGroup max={max}>
        <Avatar alt="Remy Sharp" src="/static/images/avatar/1.jpg" />
        <Avatar alt="Travis Howard" src="/static/images/avatar/2.jpg" />
        <Avatar alt="Cindy Baker" src="/static/images/avatar/3.jpg" />
        <Avatar alt="Agnes Walker" src="/static/images/avatar/4.jpg" />
        <Avatar alt="Trevor Henderson" src="/static/images/avatar/5.jpg" />
      </MuiAvatarGroup>
    </div>
  );
};

WidgetRegistry.register("AvatarGroup", AvatarGroup);
