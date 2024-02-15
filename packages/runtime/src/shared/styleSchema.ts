/* eslint-disable @typescript-eslint/naming-convention */
/* eslint-disable tsdoc/syntax */
import type { integer, positiveInteger, Widget } from "./coreSchema";
import type {
  HasBackground,
  HasBorder,
  HasDimension,
  HasMargin,
  HasPadding,
  Margin,
} from "./hasSchema";

export interface TextStyle {
  fontFamily?: string;
  /**
   * @asType integer
   * @minimum 1
   */
  fontSize?: number;
  /**
   * A multiple of the fontSize to determine the line height. (e.g. 2.0 means the line height is double the height the font size occupies). Default null. (note that 1.0 is not the default depending on the font)
   */
  lineHeightMultiple?: number;
  fontWeight?: FontWeight;
  isItalic?: boolean;
  color?: Color;
  backgroundColor?: Color;
  /** @groupDisplay card */
  gradient?: Gradient;
  decoration?: TextDecoration;
  decorationStyle?: TextDecorationStyle;
  overflow?: TextOverflow;
  /** @asType integer */
  letterSpacing?: number;
  /** @asType integer */
  wordSpacing?: number;
}

/**
 * @uiType color
 */
export type Color = integer | NamedColor | HexadecimalColor;
enum NamedColor {
  Transparent = "transparent",
  Black = "black",
  Blue = "blue",
  White = "white",
  Red = "red",
  Grey = "grey",
  Teal = "teal",
  Amber = "amber",
  Pink = "pink",
  Purple = "purple",
  Yellow = "yellow",
  Green = "green",
  Brown = "brown",
  Cyan = "cyan",
  Indigo = "indigo",
  Lime = "lime",
  Orange = "orange",
}
/**
 * Represents a hexadecimal color.
 * @pattern ^0x - The value should start with '0x'.
 */
type HexadecimalColor = string;

export interface BackgroundImage {
  /**
   * The Image URL to fill the background
   */
  source?: string;
  /**
   * Return an inline widget or specify a custom widget to be rendered when the backgroundImage failed to load the image
   */
  fallback?: Widget;
  /**
   * How to fit the image within our width/height or our parent (if dimension is not specified)
   */
  fit?: ImageFit;
  alignment?: Alignment;
}

export interface Gradient {
  /**
   * The starting position of the gradient
   */
  start?: Alignment;
  /**
   * The ending position of the gradient
   */
  end?: Alignment;
  /**
   * The list of colors used for the gradient
   */
  colors?: Color[];
  /**
   * The list of color stops, each is a number between 0.0 (where the gradient starts) and 1.0 (where the gradient ends). The number of stops should match the number of colors.
   * @minimum 0.0
   * @maximum 1.0
   */
  stops?: number[];
}

/** @uiType alignment */
export enum Alignment {
  topLeft = "topLeft",
  topCenter = "topCenter",
  topRight = "topRight",
  centerLeft = "centerLeft",
  center = "center",
  centerRight = "centerRight",
  bottomLeft = "bottomLeft",
  bottomCenter = "bottomCenter",
  bottomRight = "bottomRight",
}

export enum TextAlignment {
  left = "left",
  center = "center",
  right = "right",
  justify = "justify",
  start = "start",
  end = "end",
}

export enum FontWeight {
  light = "light",
  normal = "normal",
  bold = "bold",
  w100 = "w100",
  w200 = "w200",
  w300 = "w300",
  w400 = "w400",
  w500 = "w500",
  w600 = "w600",
  w700 = "w700",
  w800 = "w800",
  w900 = "w900",
}
enum TextDecoration {
  none = "none",
  lineThrough = "lineThrough",
  underline = "underline",
  overline = "overline",
}

/**
 * The style of the decoration (ignored if decoration=none)
 */
export enum TextDecorationStyle {
  solid = "solid",
  double = "double",
  dotted = "dotted",
  dashed = "dashed",
  wavy = "wavy",
}

/**
 * Set treatment of text longer than available space
 */
export enum TextOverflow {
  clip = "clip",
  fade = "fade",
  ellipsis = "ellipsis",
  visible = "visible",
}

/**
 * Border Radius with CSS-like notation (1 to 4 integers)
 * @uiType borderRadius
 */
export type BorderRadius = positiveInteger | string;

/** How to fit the image within its container */
export type ImageFit =
  | contain
  | cover
  | fill
  | fitHeight
  | fitWidth
  | none
  | scaleDown;

/** Scale the image such that the entire image is contained within our dimension */
type contain = "contain";
/** Scale the image to fill our dimension, clipping the image as needed */
type cover = "cover";
/** Stretch our image to fill the dimension, and distorting the aspect ratio if needed */
type fill = "fill";
/** Scale the image to fit the height, and clipping the width if needed */
type fitHeight = "fitHeight";
/** Scale the image to fit the width, and clipping the height if needed */
type fitWidth = "fitWidth";
/** Center-align the original image size, clipping the content if needed */
type none = "none";
/** Center-Align the image and only scale down to fit. Image will not be scaled up to bigger dimension. */
type scaleDown = "scaleDown";

export type BoxStyle = BoxStyleWithoutDimension & HasDimension;

export type BoxStyleWithoutDimension = HasMargin &
  HasPadding &
  HasBackground &
  HasBorder & {
    /** Some widgets (such as Image) may bleed through the container when borderRadius is set. Use this to apply a clipping to ensure this does not happen. */
    clipContent?: boolean;
  };

export type BoxLayoutStyle = BoxStyle & {
  /** @asType integer */
  gap?: number;
  fontFamily?: string;
  /** @asType integer */
  fontSize?: number;
};

export interface BaseStyle {
  /**
   * Whether this widget is expanded to fill the available space. This flag should only be used when the widget is inside a Column, Row, or Flex parent.
   */
  expanded?: boolean;
  /**
   * Toggle a widget visibility on/off. Note that an invisible widget will not occupy UI space, unless the visibilityTransitionDuration is specified.
   */
  visible?: boolean;
  /**
   * Specify the duration in seconds when a widget animates between visible and not visible state. Note that setting this value will cause the widget to still occupy the UI space even when it is not visible.
   */
  visibilityTransitionDuration?: number;
  /**
   * The z-coordinate at which to place this widget relative to its parent. A non-zero value will show a shadow, with its size relative to the elevation value.
   * @asType integer
   * @minimum 0
   * @maximum 100
   */
  elevation?: number;
  /**
   * The shadow color for the elevation
   */
  elevationShadowColor?: Color;
  /**
   * If the widget has a borderRadius, this should be changed to have the same value.
   */
  elevationBorderRadius?: BorderRadius;
  /**
   * Align this widget relative to its parent
   */
  alignment?: Alignment;
  /**
   * The distance of the child's top edge from the top of the parent Stack. This is applicable only for Stack's children.
   * @asType integer
   */
  stackPositionTop?: number;
  /**
   * The distance of the child's bottom edge from the bottom of the parent Stack. This is applicable only for Stack's children.
   * @asType integer
   */
  stackPositionBottom?: number;
  /**
   * The distance of the child's left edge from the left of the parent Stack. This is applicable only for Stack's children.
   * @asType integer
   */
  stackPositionLeft?: number;
  /**
   * The distance of the child's right edge from the right of the parent Stack. This is applicable only for Stack's children.
   * @asType integer
   */
  stackPositionRight?: number;
  /**
   * Applicable for Web only. When overlaying widgets on top of certain HTML container (e.g. Maps), the mouse click is captured by the HTML container, causing issue interacting with the widget. Use this to capture and maintain the mouse pointer on your widget.
   */
  captureWebPointer?: boolean;
}

export interface AlignmentStyle {
  /**
   * Set the children's alignment along the main axis (e.g. vertical for Column, horizontal for Row)
   */
  mainAxis?:
    | "start"
    | "end"
    | "center"
    | "spaceBetween"
    | "spaceAround"
    | "spaceEvenly";
  /**
   * Set the children's alignment along the cross axis (e.g. horizontal for Column, vertical for Row)
   */
  crossAxis?: "start" | "end" | "center" | "stretch" | "baseline";
}

export interface FlexLayoutStyle extends AlignmentStyle {
  /**
   * How to size the container along the main axis (e.g. vertical for Column, horizontal for Row)
   */
  mainAxisSize?: MainAxisSize;
}

type MainAxisSize = mainAxisMin | mainAxisMax;

/** Occupies the minimum amount of space needed to fit its children */
type mainAxisMin = "min";
/** Stretch itself to fit the parent's available space */
type mainAxisMax = "max";
/**
 * Styles specific to a Maps widget.
 */
export interface MapStyle {
  width?: integer;
  height?: integer;

  /** Automatically zoom the maps to show all the markers (and optionally the current location). (default true)
   */
  autoZoom?: boolean;

  autoZoomPadding?: integer;

  locationEnabled?: boolean;

  includeCurrentLocationInAutoZoom?: boolean;

  /** Show the Map toolbar that contains some convenience controls. */
  showToolbar?: boolean;

  /** Toggle between the different map types. (default true)
   */
  showMapTypesButton?: boolean;

  /** Show the button that animates to the user's location. (default true) */
  showLocationButton?: boolean;

  /** Applicable on Web only. Show the zoom in/out controls on the map. (default true on Web) */
  showZoomButtons?: boolean;

  rotateEnabled?: boolean;
  scrollEnabled?: boolean;
  tiltEnabled?: boolean;
  zoomEnabled?: boolean;

  /** The margin around the toolbar. (default 10 on all sides) */
  toolbarMargin?: Margin;

  /**
   * How to align the toolbar within the map. (default bottom right).
   * If both positioning (top/bottom/left/right) and alignment are used, positions will be applied first, then alignment within the available constraint.
   */
  toolbarAlignment?: Alignment;

  /** Offset the toolbar from the top edge of the map */
  toolbarTop?: integer;

  /** Offset the toolbar from the bottom edge of the map */
  toolbarBottom?: integer;

  /** Offset the toolbar from the left edge of the map */
  toolbarLeft?: integer;

  /** Offset the toolbar from the right edge of the map */
  toolbarRight?: integer;

  mapType?: "normal" | "satellite" | "terrain" | "hybrid";

  /** Using the format 'latitude longitude', specify the initial camera position when the map loads. */
  initialCameraPosition?: string;

  /** The initial zoom value to use when the map first load */
  initialCameraZoom?: integer;

  /** Marker overlay stretches to fill available horizontal space. Use this to cap its width on larger screens. (default 500) */
  markerOverlayMaxWidth?: integer;

  /** Set the max height of the marker overlay. (default: 50% of the screen height)
   */
  markerOverlayMaxHeight?: integer;

  /** If using overlay and there are more than one marker, swiping left/right within the overlay will navigate to next/previous marker */
  scrollableMarkerOverlay?: boolean;

  /** Enabling swiping down to close the overlay. */
  dismissibleMarkerOverlay?: boolean;

  /** Automatically select a marker (if not already) when the markers are updated. */
  autoSelect?: boolean;
}
/* eslint-enable tsdoc/syntax */
/* eslint-enable @typescript-eslint/naming-convention */
