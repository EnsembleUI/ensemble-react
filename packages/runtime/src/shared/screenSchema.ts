/* eslint-disable tsdoc/syntax */
import type { EnsembleAction } from "@ensembleui/react-framework";
import type { HasIcon, Padding } from "./hasSchema";
import type { BoxStyle, Color } from "./styleSchema";
import type { Widget } from "./coreSchema";
import type { HasChildren } from "./layoutSchema";

export interface View {
  /** Execute an Action when the screen first loads. This will happen after the screen has been initially rendered, so you may reference the screen widgets in this Action. */
  onLoad?: EnsembleAction;
  /** Configure the screen's header */
  header?: {
    /** Render the title as a widget or as a simple title text */
    title?: Widget;
  };
  footer?: HasChildren & {
    styles?: BoxStyle;
  };
  body?: Widget;
}

/** Group multiple Views together and put them behind a menu. */
export type Menu =
  | { Drawer?: DrawerMenu }
  | { EndDrawer?: DrawerMenu }
  | { Sidebar?: SidebarMenu };

interface SidebarMenu extends MenuWithHeaderAndFooter {
  styles?: {
    /** Background color, starting with '0xFF' for full opacity e.g 0xFFCCCCCC */
    backgroundColor?: Color;
    borderColor?: Color;
    /**
     * @asType integer
     * @minimum 0
     */
    borderWidth?: number;
    /** How to render each navigation item */
    itemDisplay?: "stacked" | "sideBySide";
    /** Padding around each navigation item */
    itemPadding?: Padding;
    /**
     * The minimum width for the menu (default 200)
     * @asType integer
     * @minimum 0
     */
    minWidth?: number;
  };
}

interface DrawerMenu extends MenuWithHeaderAndFooter {
  styles?: {
    /** Background color, starting with '0xFF' for full opacity e.g 0xFFCCCCCC */
    backgroundColor?: Color;
  };
}

interface MenuWithHeaderAndFooter {
  /** The items for the Drawer Menu (minimum 2) */
  items: MenuItem[];
  /** Reload each page when switching between the Drawer Menu items (default true). */
  reloadView?: boolean;
  /** The widget to render as the menu header */
  header?: Widget;
  /** options for the footer */
  footer?: HasChildren & {
    dragOptions?: DragOptions;
    styles?: BoxStyle;
  };
}

interface MenuItem {
  /** Label for the menu item */
  label: string;
  /** The new page to navigate to on tap */
  page: string;
  /** Mark this item as selected. There should only be one selected item per page. */
  selected?: boolean;
  /** The icon for the menu item */
  icon?: HasIcon;
}

interface DragOptions {
  /** Enable or disable dragging */
  enable?: boolean;
  /** Default it 0.5 i.e 50% of screen */
  initialSize?: number;
  /** Minimum size till sheet can go. Default is 0.25 i.e 25% of screen */
  minSize?: number;
  /** Maximum size till sheet can go. Default is 1 i.e 100% of screen */
  maxSize?: number;
  /** Whether the widget should snap between [snapSizes] when the user lifts their finger during a drag. */
  span?: boolean;
  /** The list of number each ranging from minSize to maxSize. */
  spanSizes?: number[];
}
/* eslint-enable tsdoc/syntax */
