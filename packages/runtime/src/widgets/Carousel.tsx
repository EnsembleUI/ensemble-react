import {
  CustomScopeProvider,
  useRegisterBindings,
  useTemplateData,
} from "@ensembleui/react-framework";
import type {
  EnsembleWidget,
  Expression,
  CustomScope,
} from "@ensembleui/react-framework";
import { Carousel as AntCarousel } from "antd"; // Assuming you have imported Ant Design's Carousel
import { useEffect, useMemo, useRef, useState } from "react";
import type { EnsembleWidgetProps } from "../shared/types";
import { EnsembleRuntime } from "../runtime";
import { WidgetRegistry } from "../registry";

const widgetName = "Carousel";

export interface CarouselWidgetStyles {
  layout?: "auto" | "single" | "multiple";
  autoLayoutBreakpoint?: number;
  height?: number;
  gap?: number;
  margin?: number | string;
  padding?: number | string;
  leadingGap?: number;
  trailingGap?: number;
  singleItemWidthRatio?: number;
  multipleItemWidthRatio?: number;
  indicatorType?: "none" | "circle" | "rectangle";
  indicatorPosition?:
    | "topLeft"
    | "topCenter"
    | "topRight"
    | "center"
    | "centerLeft"
    | "centerRight"
    | "bottomLeft"
    | "bottomCenter"
    | "bottomRight";
  indicatorColor: string;
  indicatorWidth?: number;
  indicatorHeight?: number;
  autoplay?: boolean;
  autoplayInterval?: number;
  indicatorMargin?: string | number;
  enableLoop?: boolean;
}

export interface CarouselProps
  extends EnsembleWidgetProps<CarouselWidgetStyles> {
  children: EnsembleWidget[];
  styles?: CarouselWidgetStyles;
  "item-template": {
    name: string;
    data: Expression<object> | string[];
    template: EnsembleWidget;
  };
}

const getPosition = (position: string) => {
  const map: { [key: string]: { justify: string; align: string } } = {
    topLeft: { justify: "start", align: "start" },
    topCenter: { justify: "center", align: "start" },
    topRight: { justify: "end", align: "start" },
    bottomLeft: { justify: "start", align: "end" },
    bottomCenter: { justify: "center", align: "end" },
    bottomRight: { justify: "end", align: "end" },
    centerLeft: { justify: "start", align: "center" },
    center: { justify: "center", align: "center" },
    centerRight: { justify: "end", align: "center" },
  };
  return map[position] || { justify: "center", align: "end" };
};

export const Carousel: React.FC<CarouselProps> = (props) => {
  const itemTemplate = props["item-template"];
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number | undefined>(
    undefined,
  );
  const { values } = useRegisterBindings({ ...props, widgetName });
  const { namedData } = useTemplateData({ ...itemTemplate });

  useEffect(() => {
    // Calculate the container width and update state
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      setContainerWidth(width);
    }
  }, []);

  const itemWidthStyle = useMemo(() => {
    if (
      containerWidth &&
      values?.styles?.layout === "multiple" &&
      values.styles.multipleItemWidthRatio !== undefined
    ) {
      const ratio = values.styles.multipleItemWidthRatio;
      const itemWidth = containerWidth * ratio;
      return `width: ${itemWidth}px !important;`;
    }
    return "";
  }, [
    containerWidth,
    values?.styles?.layout,
    values?.styles?.multipleItemWidthRatio,
  ]);

  return (
    <div
      ref={containerRef}
      style={{ height: values?.styles?.height, width: containerWidth }}
    >
      <AntCarousel
        autoplay={values?.styles?.autoplay ? values.styles.autoplay : false}
        autoplaySpeed={
          values?.styles?.autoplayInterval
            ? parseInt(`${values.styles.autoplayInterval}`) * 1000
            : 4000
        }
        draggable
        infinite={values?.styles?.enableLoop}
      >
        {namedData.map((n, index) => (
          <CustomScopeProvider key={index} value={n as CustomScope}>
            {EnsembleRuntime.render([itemTemplate.template])}
          </CustomScopeProvider>
        ))}
      </AntCarousel>
      {/* Apply inline style to indicators */}
      <style>
        {`
			  .ant-carousel .slick-slide {
				  ${values?.styles?.gap ? `margin-right : ${values.styles.gap}px` : ""}
				}
			  .ant-carousel .slick-slide {
				  ${itemWidthStyle}
			  }
        .ant-carousel .slick-dots {
          inset: 12px !important;
          display: flex !important;
          justify-content: ${getPosition(values?.styles?.indicatorPosition || "bottomCenter").justify};
          align-items: ${getPosition(values?.styles?.indicatorPosition || "bottomCenter").align};
          ${values?.styles?.indicatorType === "none" ? "display: none !important;" : ""}
        }
        .ant-carousel .slick-dots > li, .ant-carousel .slick-dots > li > button {
        ${values?.styles?.indicatorType === "circle" ? "border-radius: 100% !important; height: 10px !important; width: 10px !important;" : ""}
        }
        .ant-carousel .slick-dots > li > button {
          background: ${values?.styles?.indicatorColor || "grey"} !important;
          opacity: 0.25;
        }
        .ant-carousel .slick-dots > li.slick-active > button {
          opacity: 1 !important;
			`}
      </style>
    </div>
  );
};

WidgetRegistry.register(widgetName, Carousel);
