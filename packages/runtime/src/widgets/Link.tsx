import type { Expression, EnsembleAction } from "@ensembleui/react-framework";
import { useRegisterBindings, unwrapWidget } from "@ensembleui/react-framework";
import { useMemo, useCallback } from "react";
import { Link as RouterLink } from "react-router-dom";
import { cloneDeep } from "lodash-es";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from "../shared/types";
import { EnsembleRuntime } from "../runtime";
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";
import type { Widget } from "../shared/coreSchema";

const widgetName = "Link";

export interface LinkStyles {
  /** @uiType color */
  color?: string;
  /** @uiType color */
  hoverColor?: string;
  textDecoration?: "none" | "underline" | "overline" | "line-through";
  hoverTextDecoration?: "none" | "underline" | "overline" | "line-through";
  fontSize?: string | number;
  fontWeight?: string | number;
  visible?: Expression<boolean>;
  cursor?: Expression<string>;
}

export type LinkProps = {
  /** The URL or path to navigate to */
  url: Expression<string>;
  /** Action to execute when the link is clicked (optional, use for additional logic) */
  onTap?: EnsembleAction;
  openNewTab?: Expression<boolean>;
  /** Whether to replace the current entry in the history stack */
  replace?: Expression<boolean>;
  /** Inputs to pass to the new route */
  inputs?: Expression<{ [key: string]: unknown }>;
  /** Widget to render as link content */
  widget: Widget;
  styles?: LinkStyles;
} & EnsembleWidgetProps;

export const Link: React.FC<LinkProps> = ({ id, onTap, widget, ...rest }) => {
  const action = useEnsembleAction(onTap);

  const { values, rootRef } = useRegisterBindings({ ...rest, widgetName }, id);

  const handleClick = useCallback(
    (_e: React.MouseEvent) => {
      // If there's an onTap action, execute it but don't prevent default navigation
      if (action?.callback) {
        action.callback();
      }
    },
    [action],
  );
  const unwrappedWidget = unwrapWidget(cloneDeep(widget));

  const linkStyles = useMemo(() => {
    const baseStyles: React.CSSProperties = {
      color: values?.styles?.color,
      textDecoration: values?.styles?.textDecoration ?? "underline",
      fontSize: values?.styles?.fontSize,
      fontWeight: values?.styles?.fontWeight,
      cursor: values?.styles?.cursor ?? "pointer",
      ...(values?.styles?.visible === false ? { display: "none" } : undefined),
      ...values?.styles,
    };

    return baseStyles;
  }, [values?.styles]);

  const hoverStyles = useMemo(() => {
    if (!values?.styles?.hoverColor && !values?.styles?.hoverTextDecoration) {
      return {};
    }

    return {
      color: values?.styles?.hoverColor,
      textDecoration: values?.styles?.hoverTextDecoration,
    };
  }, [values?.styles?.hoverColor, values?.styles?.hoverTextDecoration]);

  // Handle external URLs by using a regular anchor tag
  const isExternalUrl = useMemo(() => {
    const url = values?.url;
    if (!url) return false;
    return (
      url.startsWith("http://") ||
      url.startsWith("https://") ||
      url.startsWith("mailto:") ||
      url.startsWith("tel:")
    );
  }, [values?.url]);

  if (!values?.url) {
    return (
      <span ref={rootRef} style={linkStyles}>
        {EnsembleRuntime.render([unwrappedWidget])}
      </span>
    );
  }

  if (isExternalUrl) {
    return (
      <a
        href={values.url}
        onClick={handleClick}
        onMouseEnter={(e): void => {
          if (hoverStyles.color)
            e.currentTarget.style.color = hoverStyles.color;
          if (hoverStyles.textDecoration)
            e.currentTarget.style.textDecoration = hoverStyles.textDecoration;
        }}
        onMouseLeave={(e): void => {
          if (values.styles?.color)
            e.currentTarget.style.color = values.styles.color;
          if (values?.styles?.textDecoration)
            e.currentTarget.style.textDecoration = values.styles.textDecoration;
        }}
        ref={rootRef}
        rel={values.openNewTab ? "noopener noreferrer" : undefined}
        style={linkStyles}
        target={values.openNewTab ? "_blank" : "_self"}
      >
        {EnsembleRuntime.render([unwrappedWidget])}
      </a>
    );
  }

  // For internal navigation, use React Router Link
  return (
    <RouterLink
      onClick={handleClick}
      onMouseEnter={(e): void => {
        if (hoverStyles.color) e.currentTarget.style.color = hoverStyles.color;
        if (hoverStyles.textDecoration)
          e.currentTarget.style.textDecoration = hoverStyles.textDecoration;
      }}
      onMouseLeave={(e): void => {
        if (values?.styles?.color)
          e.currentTarget.style.color = values.styles.color;
        if (values?.styles?.textDecoration)
          e.currentTarget.style.textDecoration = values.styles.textDecoration;
      }}
      ref={rootRef}
      replace={Boolean(values.replace)}
      state={values.inputs}
      style={linkStyles}
      target={values.openNewTab ? "_blank" : undefined}
      to={values.url}
    >
      {EnsembleRuntime.render([unwrappedWidget])}
    </RouterLink>
  );
};

WidgetRegistry.register(widgetName, Link);
