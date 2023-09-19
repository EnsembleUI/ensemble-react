import { Typography } from "antd";
import { WidgetRegistry } from "../registry";
import type { BaseTextProps } from "../util/types";
import {getTextAlign} from "../util/utils";
import { TextAlign } from "chart.js";

export type TextProps = {
  // to be added more
  styles?:{
    fontFamily: string;
    fontSize: string;
    fontWeight: string;

  }
} & BaseTextProps;

export const Text: React.FC<TextProps> = (props) => {
  // const [text, setText] = useState(props.text);
  // const { values } = useEnsembleState({ ...props, text }, props.id, {
  //   setText,
  // });
  return (
    <Typography.Text style={{ textAlign: getTextAlign(props.textAlign) as TextAlign,
    fontFamily: props.styles?.fontFamily ?? "serif", fontSize: props.styles?.fontSize ?? "1rem",
    fontWeight: props.styles?.fontWeight ?? "normal"}}>
      {props.text}
    </Typography.Text>
  );
};

WidgetRegistry.register("Text", Text);
