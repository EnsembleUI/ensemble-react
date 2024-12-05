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
import { useEffect, useRef, useState } from "react";
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
  indicatorPosition?: "bottom" | "top";
  indicatorColor: string;
  indicatorWidth?: number;
  indicatorHeight?: number;
  autoplay?: boolean;
  autoplayInterval?: number;
  indicatorMargin?: string | number;
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

export const Carousel: React.FC<CarouselProps> = (props) => {
  const itemTemplate = props["item-template"];
  const { namedData } = useTemplateData({ ...itemTemplate });
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState<number | undefined>(
    undefined,
  );

  const { values } = useRegisterBindings({ ...props, widgetName });

  //   const renderedChildren = useMemo(() => {
  //     return EnsembleRuntime.render(props.children);
  //   }, [props.children]);

  useEffect(() => {
    // Calculate the container width and update state
    if (containerRef.current) {
      const width = containerRef.current.offsetWidth;
      setContainerWidth(width);
    }
  }, []);
  let itemWidthStyle = "";
  if (containerWidth && values?.styles?.multipleItemWidthRatio !== undefined) {
    const ratio = values.styles.multipleItemWidthRatio;
    const itemWidth = containerWidth * ratio;
    itemWidthStyle = `width: ${itemWidth}px !important;`;
  }

  return (
    <div ref={containerRef} style={{ height: values?.styles?.height }}>
      <AntCarousel
        autoplay={values?.styles?.autoplay ? values.styles.autoplay : false}
        autoplaySpeed={
          values?.styles?.autoplayInterval
            ? parseInt(`${values.styles.autoplayInterval}`) * 1000
            : 4000
        }
        dotPosition={
          values?.styles?.indicatorPosition
            ? values.styles.indicatorPosition
            : "bottom"
        }
        draggable
        infinite={false}
        slidesToShow={values?.styles?.layout ? 2 : 1}
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

				.ant-carousel .slick-slide:last-child {
				  margin-right: 0;
				}
			  .ant-carousel .slick-slide {
				  ${itemWidthStyle}
			  }
			  .ant-carousel .slick-dots li button
			  {
			  opacity: 0.5;

		}
			  }
			  .ant-carousel .slick-dots li:first-child button {
				  margin-left: 0;
				}
				.ant-carousel .slick-dots li:last-child button {
				  margin-right: 0;
				}
		  .ant-carousel .slick-dots li.slick-active button{
				  opacity: 1;
			  }
			  .ant-carousel .slick-dots {
				display: none !important;
			  }
			  .ant-carousel .slick-dots li.slick-active {
				  width: auto;
			  }
			  .ant-carousel .slick-dots li {
				  width: auto;
			  }
			`}
      </style>
    </div>
  );
};

WidgetRegistry.register(widgetName, Carousel);
