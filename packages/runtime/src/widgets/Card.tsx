import { Card as MuiCard, CardContent, Typography } from "@mui/material";
import type { Expression } from "framework";
import { useRegisterBindings } from "framework";
import { useState } from "react";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from "../util/types";

export type CardProps = {
  title?: Expression<string>;
  content?: Expression<string>;
  [key: string]: unknown;
} & EnsembleWidgetProps;

export const Card: React.FC<CardProps> = (props) => {
  const [title, setTitle] = useState(props.title || "");
  const [content, setContent] = useState(props.content || "");
  const { values } = useRegisterBindings(
    { ...props, title, content },
    props.id,
    {
      setTitle,
      setContent,
    },
  );

  return (
    <MuiCard>
      <CardContent>
        {values.title ? (
          <Typography variant="h5">{values.title}</Typography>
        ) : null}
        {values.content ? <Typography>{values.content}</Typography> : null}
      </CardContent>
    </MuiCard>
  );
};

WidgetRegistry.register("Card", Card);
