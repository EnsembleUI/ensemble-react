import { Alert } from "antd";
import type { ReactElement } from "react";

export type WidgetComponent<T> = React.FC<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const registry: { [key: string]: WidgetComponent<any> | undefined } = {};

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

const UnknownWidget: React.FC<{ missingName: string }> = ({ missingName }) => {
  return <Alert message={`Unknown widget: ${missingName}`} type="error" />;
};
