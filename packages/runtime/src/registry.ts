// eslint-disable-next-line @typescript-eslint/no-explicit-any
const registry: Record<string, React.FC<any> | undefined> = {};

export const WidgetRegistry = {
  register: <T>(name: string, component: React.FC<T>): void => {
    if (registry[name]) {
      throw new Error(`A widget is already registered for ${name}`);
    }
    registry[name] = component;
  },
  find: (name: string): React.FC | undefined => {
    return registry[name];
  },
};
