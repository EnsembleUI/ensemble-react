import { WidgetRegistry } from "../registry";

export interface TextProps {
  text: string;
  key?: string | number;
}

export const Text: React.FC<TextProps> = ({ text, key }) => {
  return <span key={key}>{text}</span>;
};

WidgetRegistry.register("Text", Text);
