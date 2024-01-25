import type { EnsembleWidget, Expression } from "@ensembleui/react-framework";
import {
  CustomScopeProvider,
  useCustomScope,
  useTemplateData,
} from "@ensembleui/react-framework";
import { Col, Row } from "antd";
import { useCallback, useEffect, useMemo } from "react";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";
import type {
  EnsembleWidgetProps,
  EnsembleWidgetStyles,
} from "../shared/types";
import { useWidgetId } from "@ensembleui/react-framework";
import { useEnsembleAction } from "../runtime/hooks/useEnsembleAction";
import { EnsembleAction } from "@ensembleui/react-framework";

export interface GridViewStyles extends EnsembleWidgetStyles {
  horizontalTileCount?: number;
  horizontalGap?: number;
  verticalGap?: number;
}

export type GridViewProps = {
  "item-template": {
    data: Expression<object>;
    name: string;
    template: EnsembleWidget;
  };
  onScrollEnd?: EnsembleAction;
} & EnsembleWidgetProps<GridViewStyles>;

export const GridView: React.FC<GridViewProps> = ({
  "item-template": { data, name, template },
  styles,
  ...rest
}) => {
  const defaultColumnCount = 4;
  const { resolvedWidgetId } = useWidgetId();
  const { namedData } = useTemplateData({ data, name });
  const parentScope = useCustomScope();
  const onScrollEndAction = useEnsembleAction(rest.onScrollEnd);

  // scroll end action
  const onScrollEndActionCallback = useCallback(() => {
    if (onScrollEndAction) {
      onScrollEndAction.callback();
    }
  }, [onScrollEndAction]);

  const rows = useMemo(() => {
    const workingRows = [];
    const colCount = styles?.horizontalTileCount ?? defaultColumnCount;
    const rowCount = Math.ceil(namedData.length / colCount);

    for (let i = 0; i < rowCount; i++) {
      const cols = [];
      for (let j = 0; j < colCount; j++) {
        const dataIndex = i * colCount + j;
        if (dataIndex < namedData.length)
          cols.push(
            <Col
              key={dataIndex}
              style={{
                display: "flex",
                flexGrow: 1,
                justifyContent: "center",
                marginLeft: (styles?.horizontalGap ?? 20) / 2,
                marginRight: (styles?.horizontalGap ?? 20) / 2,
                maxWidth: `calc(100% / ${styles?.horizontalTileCount ?? 4} - ${
                  styles?.horizontalGap ?? 20
                }px)`,
              }}
            >
              <CustomScopeProvider
                value={{
                  ...parentScope,
                  ...namedData[dataIndex],
                  index: dataIndex,
                  length: namedData.length,
                }}
              >
                {EnsembleRuntime.render([template])}
              </CustomScopeProvider>
            </Col>,
          );
      }
      workingRows.push(
        <Row
          gutter={[styles?.horizontalGap ?? 10, styles?.verticalGap ?? 10]}
          key={i}
          style={{
            alignItems: "center",
            marginTop: (styles?.verticalGap ?? 20) / 2,
            marginBottom: (styles?.verticalGap ?? 20) / 2,
          }}
        >
          {cols}
        </Row>,
      );
    }
    return workingRows;
  }, [
    namedData,
    parentScope,
    styles?.horizontalGap,
    styles?.horizontalTileCount,
    styles?.verticalGap,
    template,
  ]);

  // handle scroll event
  const handleScrollEvent = useCallback(
    (event: Event): void => {
      const container = event.target as HTMLDivElement;
      const { scrollTop, scrollHeight, clientHeight } = container;

      // Check if the user has scrolled to the bottom
      if (scrollTop + clientHeight === scrollHeight) {
        onScrollEndActionCallback();
      }
    },
    [onScrollEndActionCallback],
  );

  useEffect(() => {
    if (rest.onScrollEnd) {
      // assign scroll event listener to element
      document
        .getElementById(resolvedWidgetId)
        ?.addEventListener("scroll", handleScrollEvent);
    }

    return () => {
      if (rest.onScrollEnd) {
        // remove scroll event listener from element
        document
          .getElementById(resolvedWidgetId)
          ?.removeEventListener("scroll", handleScrollEvent);
      }
    };
  }, [resolvedWidgetId, rest.onScrollEnd, handleScrollEvent]);

  return (
    <div
      id={resolvedWidgetId}
      style={{
        maxHeight: styles?.maxHeight,
        overflow: styles?.overflow,
        ...(styles?.visible === false ? { display: "none" } : undefined),
      }}
    >
      {rows}
    </div>
  );
};

WidgetRegistry.register("GridView", GridView);
