const registry: Record<string, React.FC> = {};

export const WidgetRegistry = {
  register: (name: string, component: React.FC): void => {
    registry[name] = component;
  },
  find: (name: string): React.FC | undefined => {
    return registry[name];
  },
};
