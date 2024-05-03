import { Alert } from "antd";
import type { ReactElement } from "react";

type WidgetComponent<T> = React.FC<T>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const mainRegistry: Record<string, WidgetComponent<any> | undefined> = {};
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const backupRegistry: Record<string, WidgetComponent<any> | undefined> = {};

export const WidgetRegistry = {
  register: <T,>(name: string, component: WidgetComponent<T>): void => {
    if (name in mainRegistry) {
      backupRegistry[name] = mainRegistry[name];
    }

    mainRegistry[name] = component;
  },
  find: (name: string): WidgetComponent<any> | ReactElement => {
    const Widget = mainRegistry[name];
    if (!Widget) {
      return <UnknownWidget missingName={name} />;
    }
    return Widget;
  },
  unMount: (name: string): void => {
    if (name in backupRegistry) {
      mainRegistry[name] = backupRegistry[name];
      delete backupRegistry[name];
    } else {
      delete mainRegistry[name];
    }
  },
};

const UnknownWidget: React.FC<{ missingName: string }> = ({ missingName }) => {
  return <Alert message={`Unknown widget: ${missingName}`} type="error" />;
};
