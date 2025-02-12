import { Alert } from "antd";
import type { ReactElement } from "react";

export type WidgetComponent<T> = React.ComponentType<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const registry: { [key: string]: WidgetComponent<any> | undefined } = {};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const iconRegistry: { [key: string]: WidgetComponent<any> | undefined } = {};

export const WidgetRegistry = {
  register: <T,>(name: string, component: WidgetComponent<T>): void => {
    registry[name] = component;
  },
  find: (name: string): WidgetComponent<any> | ReactElement => {
    const Widget = registry[name];
    if (!Widget) {
      return <UnknownWidget missingName={name} />;
    }
    return Widget;
  },
  findOrNull: (name: string): WidgetComponent<any> | null => {
    return registry[name] || null;
  },
  unregister: (name: string): void => {
    delete registry[name];
  },
};

export const IconRegistry = {
  register: <T,>(name: string, component: WidgetComponent<T>): void => {
    iconRegistry[name] = component;
  },
  find: (name: string): WidgetComponent<any> | ReactElement => {
    const Icon = iconRegistry[name];
    if (!Icon) {
      return <UnknownIcon missingName={name} />;
    }
    return Icon;
  },
  findOrNull: (name: string): WidgetComponent<any> | null => {
    return iconRegistry[name] || null;
  },
  unregister: (name: string): void => {
    delete iconRegistry[name];
  },
};

const UnknownWidget: React.FC<{ missingName: string }> = ({ missingName }) => {
  return <Alert message={`Unknown widget: ${missingName}`} type="error" />;
};

const UnknownIcon: React.FC<{ missingName: string }> = ({ missingName }) => {
  return <Alert message={`Unknown icon: ${missingName}`} type="error" />;
};
