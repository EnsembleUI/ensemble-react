/* eslint-disable tsdoc/syntax */
import type { Widget, BaseWidget, integer, ItemTemplate } from "./coreSchema";
import type { HasPullToRefresh } from "./hasSchema";
import type {
  AlignmentStyle,
  BaseStyle,
  BoxLayoutStyle,
  FlexLayoutStyle,
} from "./styleSchema";

export interface HasChildren extends BaseWidget {
  children?: Widget[];
}

// TODO: old style item-template. Should be transition to using 'itemTemplate'
export interface HasItemTemplate {
  "item-template"?: ItemTemplate;
}

// base class for Column/Row/Flex
export type BaseFlexLayout = HasChildren &
  HasItemTemplate & {
    styles?: BaseStyle &
      BoxLayoutStyle &
      FlexLayoutStyle & {
        /** Set to true so content can scroll vertically or horizontally as needed */
        scrollable?: boolean;
        /** Explicitly match the width or height to the largest child's size, but only if the parent does not already assign a width or height. This attribute is useful for sizing children who don't have a width or height (e.g Divider) */
        autoFit?: boolean;
      };
  };

export type Column = BaseFlexLayout & HasPullToRefresh;

export type Row = BaseFlexLayout;

/** Kitchen Sink Example - https://studio.ensembleui.com/app/e24402cb-75e2-404c-866c-29e6c3dd7992/screen/DX5j2WVQFabmxD9FCD5h */
export type Flex = BaseFlexLayout & {
  styles?: BaseFlexLayout["styles"] & {
    /**
     * Lay out the children vertically or horizontally
     */
    direction: "vertical" | "horizontal";
  };
};

/**
 * Kitchen Sink Example: https://studio.ensembleui.com/app/e24402cb-75e2-404c-866c-29e6c3dd7992/screen/3e901fb8-a0e8-4f52-979b-7f5f2547e650#
 */
export interface Flow extends BaseWidget, HasChildren, HasItemTemplate {
  styles?: BaseStyle &
    AlignmentStyle & {
      /**
       * The gap between the children in the main direction
       * @minimum 0
       */
      gap?: integer;
      /**
       * The gap between the lines if the children start wrapping
       * @minimum 0
       */
      lineGap?: integer;
      /**
       * @minimum 0
       */
      maxWidth?: integer;
      /**
       * @minimum 0
       */
      maxHeight?: integer;
      /** The main direction to lay out the children before wrapping. Default is horizontal */
      direction?: "vertical" | "horizontal";
    };
}

interface FittedBoxLayout extends HasChildren {
  styles?: BaseStyle &
    BoxLayoutStyle &
    AlignmentStyle & {
      /**
       * Specify an array of non-zero integers or 'auto', each corresponding to a child.
       * Setting 'auto' will let the child determines its own size, while setting a non-zero
       * integer will determine the child's size multiple.
       */
      childrenFits?: ("auto" | number)[];
    };
}
/** Stretch to fit the parent (the parent is required to have a predetermined height), then distribute the vertical spaces evenly among its children. You can override the space distribution via 'childrenFits' attribute */
export type FittedRow = FittedBoxLayout;
/** Stretch to fit the parent (the parent is required to have a predetermined width), then distribute the horizontal spaces evenly among its children. You can override the space distribution via 'childrenFits' attribute. */
export type FittedColumn = FittedBoxLayout;
/* eslint-enable tsdoc/syntax */
