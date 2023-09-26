import React, { useEffect, useState, useMemo } from "react";
import type { Expression, Widget } from "framework";
import { useEnsembleStore } from "framework";
import { useEnsembleState, useEvaluate } from "framework";
import { useNavigateScreen } from "../runtime/navigate";
import { WidgetRegistry } from "../registry";
import { AvatarGroup as MuiAvatarGroup, Avatar } from "@mui/material";
import * as MuiIcons from "@mui/icons-material";
import { EnsembleRuntime } from "../runtime";
import { AvatarMenu } from "./Avatar";
import { AvatarProps } from "./Avatar";
import { get, map } from "lodash-es";
import { CustomScopeProvider } from "framework";
import type { CustomScope } from "framework";
export type AvatarItem = {
  name: "AvatarIcon";
  properties: {
    alt: Expression<string>;
    src?: Expression<string>;
    name?: Expression<string>;
  };
};

export type AvatarGroupProps = {
  max: number;
  "item-template": {
    data: Expression<object>;
    name: Expression<string>;
    template: AvatarTemplate;
  };
};
export interface AvatarTemplate {
  name: "Avatars";
  properties: {
    children: AvatarItem[];
  };
}
export const AvatarGroup: React.FC<AvatarGroupProps> = ({
  max,
  "item-template": itemTemplate,
}) => {
  //console.log(itemTemplate);

  const { templateData } = useEnsembleStore((state) => ({
    templateData: get(state.screen, itemTemplate.data as string) as object,
  }));

  const namedData = map(templateData, (value) => {
    const namedObj: Record<string, unknown> = {};
    namedObj[itemTemplate.name] = value;
    return namedObj;
  });
  //console.log(namedData);

  const [source, setSource] = useState(
    itemTemplate.template.properties.children[0].properties
  );
  const { values } = useEnsembleState({ ...source, source }, undefined, {
    setSource,
  });
  console.log(values);

  return (
    <div>
      <MuiAvatarGroup max={max}>
        {namedData.map((item, index) => (
          <CustomScopeProvider value={namedData as unknown as CustomScope}>
            <Avatar key={index}>
              {itemTemplate.template.properties.children[0].properties.name}
            </Avatar>
          </CustomScopeProvider>
        ))}
      </MuiAvatarGroup>
    </div>
  );
};

WidgetRegistry.register("AvatarGroup", AvatarGroup);
