import {
  useEvaluate,
  type EnsembleFooterModel,
  type EnsembleHeaderModel,
  type EnsembleWidget,
} from "@ensembleui/react-framework";
import { ConfigProvider } from "antd";
import { WidgetRegistry } from "../registry";
// eslint-disable-next-line import/no-cycle
import { Column } from "../widgets/Column";

interface EnsembleBodyProps {
  body: EnsembleWidget;
  header?: EnsembleHeaderModel;
  footer?: EnsembleFooterModel;
  isModal?: boolean;
  styles?: { [key: string]: unknown };
}

export const EnsembleBody: React.FC<EnsembleBodyProps> = ({ body, styles }) => {
  const evaluatedStyles = useEvaluate({ styles });
  const BodyFn = WidgetRegistry.find(body.name);
  if (!(BodyFn instanceof Function))
    throw new Error(`Unknown widget: ${body.name}`);

  // default body styles
  const defaultStyles = {
    styles: {
      flex: 1,
      overflow: !styles?.scrollableView ? "hidden" : "auto",
      ...styles,
    },
  };

  return (
    <ConfigProvider
      theme={{
        token: {
          colorText: evaluatedStyles.styles?.color as string,
          fontSize: evaluatedStyles.styles?.fontSize as number,
          fontFamily: evaluatedStyles.styles?.fontFamily as string,
          fontWeightStrong: evaluatedStyles.styles?.fontWeight as number,
        },
      }}
    >
      <Column {...defaultStyles}>{[body]}</Column>
    </ConfigProvider>
  );
};
