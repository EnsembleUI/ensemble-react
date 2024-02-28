/* eslint-disable tsdoc/syntax */
import type { EnsembleAction } from "@ensembleui/react-framework";
import type {
  TextProps,
  MarkdownProps,
  ImageProps,
  AvatarProps,
  ProgressProps,
  DividerProps,
  LoadingContainerProps,
  PopupMenuProps,
  TextInputProps,
  CheckBoxProps,
  DropdownProps,
  DateProps,
  ButtonProps,
  FormProps,
  GridViewProps,
  ToggleButtonProps,
  CarouselProps,
  TabBarProps,
  GridProps,
  TabBarItem,
} from "../widgets";
import type { Menu, View } from "./screenSchema";
import type { FlexboxProps, IconProps } from "./types";
import type { HasChildren } from "./layoutSchema";

export type Root = {
  View?: View;
} & { ViewGroup?: Menu } & {
  /**
   * Declare Javascript variables and functions that are accessible within this screen
   * @defaultSnippets `const myFunction = () => { console.log("Hello World") }`
   * */
  Global?: string;
} & {
  API?: { [key: string]: API };
} & { [key: string]: CustomWidget };

export interface Event {
  name: string;
  data?: { [key: string]: unknown };
}
/**
 * used by the custom widgets to dispatch events that then are handled by the outside
 */
export interface CustomEvent {
  [key: string]: {
    /** The event payload to dispatch */
    data?: { [key: string]: unknown };
  };
}
// definition for a Custom Widget
export interface CustomWidget {
  /** Execute an Action when the widget renders. This will happen after the widget's content has been initially rendered, so you may reference the widget's contents by their IDs. */
  onLoad?: EnsembleAction;
  /** Define the list of input names that this widget accepts */
  inputs?: string[];
  /** Define events that this custom widget may dispatch along with their optional data */
  events?: { [key: string]: unknown };
  /** Define the widget to render as the body */
  body?: Widget;
}

// usage of a Custom Widget as a Widget
export interface CustomWidgetReference {
  inputs?: { [key: string]: unknown };
  events?: { [key: string]: EnsembleAction };
}

interface API {
  /** Define the list of input names that this API accepts */
  inputs?: string[];
  /** Specify the API endpoint to call */
  url: string;
  /** Define the HTTP method to use */
  method?: "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
  /** Specify the key/value pairs to send as the request's headers */
  headers?: { [key: string]: unknown };
  /** Specify the key/value pairs to send along with the URL */
  parameters?: { [key: string]: unknown };
  /** Specify the body to send along with the request. This can be key/value pairs or a simple text. */
  body?: { [key: string]: unknown } | string;
  /** Execute an Action on the successful return of the API call (HTTP status code 200-299) */
  onResponse?: EnsembleAction;
  /** Execute an Action if the API returns an error */
  onError?: EnsembleAction;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Socket {
  /** Define the list of inputs that this socket accepts */
  inputs?: string[];
  /** The URL of this socket */
  uri: string;
  /** Execute this callback upon a successful connection of socket with server */
  onSuccess?: EnsembleAction;
  /** Execute this callback upon encountering an error while trying to do socket connection */
  onError?: EnsembleAction;
  /** Execute this callback upon a successful disconnect of socket with server */
  onDisconnect?: EnsembleAction;
  /** Execute this callback upon auto reconnect is attempted */
  onReconnectAttempt?: EnsembleAction;
  /** Execute this callback upon a message from socket is received */
  onReceive?: EnsembleAction;
  options?: {
    /** Whether to disconnect socket on page pop. Default true. */
    disconnectOnPageClose?: boolean;
    /** Whether to attempt socket connection on interrupted. Default true. */
    autoReconnect?: boolean;
    reconnectOptions?: {
      /**
       * Initial wait to do reconnect attempt
       * @asType integer
       */
      initial?: number;
      /**
       * When to stop increasing wait time e.g initial 1 and maxStep 3 wait time is as follows [1, 2, 4, 4, 4, ...].
       * @asType integer
       */
      maxStep?: number;
    };
  };
}

export type ItemTemplate = {
  /**
   * The widget to use as the template for each item in the data array
   */
  template: Widget;
} & BaseItemTemplate;

export interface BaseItemTemplate {
  /**
   * The array of data to bind to this item template
   */
  data: string;
  /**
   * The name to give to each instance of this item template. This can be referenced in the body of the template.
   */
  name: string;
}

type ReplaceChildrenTemplate<T> = Omit<T, "children" | "item-template"> &
  HasChildren & { "item-template"?: ItemTemplate };
/**
 * @uiType widget
 */
export type Widget =
  // This is super-unfortunate but we can't use CustomWidgetReference
  // as it will cause a mutually exclusive conflict with the other widgets
  // This means there is no typeahead for referencing a custom widget
  // | { [key: string]: CustomWidgetReference }

  | { Text?: TextProps }
  | { Markdown?: MarkdownProps }
  // | { Html?: Html }
  | { Icon?: IconProps }
  | { Image?: ImageProps }
  | { Avatar?: AvatarProps }
  // | { ImageCropper?: ImageCropper }
  // | { Lottie?: Lottie }
  // | { QRCode?: QRCode }
  | { Progress?: ProgressProps }
  | { Divider?: DividerProps }
  // | { Spacer?: Spacer }
  // | { Toggle?: Toggle }
  // | { ToggleContainer?: ToggleContainer }
  | { LoadingContainer?: LoadingContainerProps }
  | {
      PopupMenu?: ReplaceChildrenTemplate<PopupMenuProps>;
    }
  | { TextInput?: TextInputProps }
  // | { PasswordInput?: PasswordInput }
  // | { ConfirmationInput?: ConfirmationInput }
  // | { Slider?: Slider }
  // | { Switch?: Switch }
  | { Checkbox?: CheckBoxProps }
  | { Dropdown?: ReplaceChildrenTemplate<DropdownProps> }
  // | { DateRange?: DateRange }
  | { Date?: DateProps }
  // | { Time?: Time }
  // | { Shape?: Shape }
  // | { SignInWithGoogle?: SignInWithGoogle }
  // | { SignInWithApple?: SignInWithApple }
  // | { ConnectWithGoogle?: ConnectWithProvider }
  // | { ConnectWithMicrosoft?: ConnectWithProvider }
  | { Button?: ButtonProps }
  // | { IconButton?: IconButton }
  // | { Address?: Address }
  | {
      Column?: ReplaceChildrenTemplate<FlexboxProps>;
    }
  | {
      Row?: ReplaceChildrenTemplate<FlexboxProps>;
    }
  // | { Flex?: FlexboxProps }
  // | { StaggeredGrid?: StaggeredGrid }
  | {
      Form?: ReplaceChildrenTemplate<FormProps>;
    }
  // | { Flow?: FlexboxProps }
  | {
      GridView?: ReplaceChildrenTemplate<GridViewProps>;
    }
  // | { WebView?: WebView }
  // | { Calendar?: Calendar }
  // | { Countdown?: Countdown }
  | { ToggleButton?: ToggleButtonProps }
  // | { FittedRow?: FittedRow }
  // | { FittedColumn?: FittedColumn }
  // | { Map?: Map }
  | { Carousel?: ReplaceChildrenTemplate<CarouselProps> }
  // | { Conditional?: ConditionalProps };
  // | { ListView?: ListView }
  // | { Stack?: Stack }
  | {
      TabBar?: Omit<TabBarProps, "items"> & {
        items: (Omit<TabBarItem, "widget"> & { widget: Widget })[];
      };
    }
  // | { ChartJs?: ChartProps };
  | { DataGrid?: ReplaceChildrenTemplate<GridProps> };

/** All widgets could be children of the Form and as a result can have labels etc.  */
export interface IsFormField {
  /** Label for your widget */
  label?: string;
  /** Hint text on your label */
  labelHint?: string;
}

export interface BaseWidget extends IsFormField {
  id?: string;
}

/**
 * @asType integer
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export type integer = number;

/**
 * @asType integer
 * @minimum 0
 */
// eslint-disable-next-line @typescript-eslint/naming-convention
export type positiveInteger = number;
/* eslint-enable tsdoc/syntax */
