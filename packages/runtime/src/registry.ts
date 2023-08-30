// eslint-disable-next-line @typescript-eslint/no-explicit-any
const registry: Record<string, React.FC<any>> = {};

export const WidgetRegistry = {
  register: <T>(name: string, component: React.FC<T>): void => {
    registry[name] = component;
  },
  find: (name: string): React.FC | undefined => {
    return registry[name];
  },
};
