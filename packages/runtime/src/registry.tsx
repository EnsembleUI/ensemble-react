import { Alert } from "antd";
import type { ReactElement } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const registry: Record<string, React.FC<any> | undefined> = {};

export const WidgetRegistry = {
  register: <T,>(name: string, component: React.FC<T>): void => {
    if (registry[name]) {
      throw new Error(`A widget is already registered for ${name}`);
    }
    registry[name] = component;
  },
  find: (name: string): React.FC | ReactElement => {
    const Widget = registry[name];
    if (!Widget) {
      return <UnknownWidget missingName={name} />;
    }
    return Widget;
  },
};

const UnknownWidget: React.FC<{ missingName: string }> = ({ missingName }) => {
  return <Alert message={`Unknown widget: ${missingName}`} type="error" />;
};
