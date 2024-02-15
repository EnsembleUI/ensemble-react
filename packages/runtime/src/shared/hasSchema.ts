/* eslint-disable tsdoc/syntax */
import type { EnsembleAction } from "@ensembleui/react-framework";
import type { positiveInteger } from "./coreSchema";
import type {
  BackgroundImage,
  BorderRadius,
  Color,
  Gradient,
  TextAlignment,
  TextDecorationStyle,
  TextOverflow,
} from "./styleSchema";

/**
 * Margin with CSS-style notation (1 to 4 integers) e.g. margin: 5 20 5
 */
export interface HasMargin {
  margin?: Margin;
}

/** @uiType margin */
export type Margin = positiveInteger | string;

/**
 * Padding with CSS-style notation (1 to 4 integers) e.g. padding: 5 20 5
 */
export interface HasPadding {
  padding?: Padding;
}

/** @uiType padding */
export type Padding = positiveInteger | string;

export interface HasDimension {
  /** @asType integer */
  width?: number;
  /** @asType integer */
  height?: number;
}

export interface HasBorder {
  borderStyle?: string;
  borderRadius?: BorderRadius;
  /**
   * Border color, starting with '0xFF' for full opacity
   */
  borderColor?: Color;
  /**
   * The thickness of the border
   * @asType integer
   */
  borderWidth?: number;
}

export interface HasBackground {
  /**
   * Background color, starting with '0xFF' for full opacity e.g 0xFFCCCCCC
   */
  backgroundColor?: Color;
  backgroundImage?: BackgroundImage;
  backgroundGradient?: Gradient;
}

/**
 * Specifies the icon to use. You can also use the short-handed syntax 'iconName iconLibrary')
 */
export interface HasIcon {
  /** The name of the icon */
  name: string;
  /** Designate which icon library to use */
  library?: "default" | "fontAwesome" | "remix";
  color?: Color;
  /**
   * @asType integer
   * @minimum 0
   */
  size?: number;
}

export interface HasPullToRefresh {
  onPullToRefresh?: EnsembleAction;
  refreshIndicatorType?: "material" | "cupertino";
}

// for Html widget
export interface HasCssStyle {
  /** The CSS selector for the element */
  selector?: string;
  /** The CSS properties to apply for a given selector */
  properties?: CssProperties;
}

type CssProperties = HasPadding &
  HasMargin & {
    backgroundColor?: Color;
    color?: Color;
    direction?: "ltr" | "rtl";
    /** The CSS equivalent of display */
    display?: "block" | "inline" | "inlineBlock" | "listItem" | "none";
    fontFamily?: string;
    fontFamilyFallback?: string;
    /** Equivalent to CSS attribute font-feature-settings */
    fontFeatureSettings?: [];
    /**
     * @asType integer
     * @minimum 0
     */
    fontSize?: number;
    fontStyle?: string;
    fontWeight?: string;
    height?: number;
    lineHeight?: number;
    /** Spacing between two letters */
    letterSpacing?: number;
    /** Equivalent to the CSS attribute list-style-image */
    listStyleImage?: string;
    /** Equivalent to the CSS attribute list-style-type */
    listStyleType?: string;
    /** Equivalent to the CSS attribute list-style-position */
    listStylePosition?: string;
    textAlign?: TextAlignment;
    textDecoration?: string;
    textDecorationColor?: Color;
    textDecorationStyle?: TextDecorationStyle;
    textDecorationThickness?: number;
    /** Equivalent to that of CSS attribute text-shadow */
    textShadow?: string;
    /** The vertical alignment for a given tag, default (baseline) */
    verticalAlign?: "baseline" | "top" | "middle" | "bottom" | "sub" | "sup";
    /** Equivalent to that of CSS attribute white-space */
    whitespace?: "normal" | "prep";
    /** The width for the given tag */
    width?: number;
    /** The spacing between two words */
    wordSpacing?: number;
    /** The border for the tag selected. Follows the css syntax */
    border?: string;
    /** The alignment of the selected tag */
    alignment?: string;
    /** The maximum number of lines for the text to have */
    maxLines?: positiveInteger;
    textOverflow?: TextOverflow;
    textTransform?: "uppercase" | "lowercase" | "capitalize" | "none";
  };

/* eslint-enable tsdoc/syntax */
