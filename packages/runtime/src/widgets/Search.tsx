import type { Expression } from "framework";
import { Button as AntButton, Input } from "antd";
import { useEnsembleState, useEvaluate } from "framework";
import { WidgetRegistry } from "../registry";
import { EnsembleWidgetProps } from "../util/types";
import { SearchOutlined } from "@ant-design/icons";

export type SearchProps = {
  onTap?: {
    executeCode: string;
  };
  styles?:{
    width: string;
    height: string;
    backgroundColor: string;
  }
} & EnsembleWidgetProps;

export const Search: React.FC<SearchProps> = (props) => {
  const onTap = props.onTap?.executeCode;
  const { values } = useEnsembleState(props, props.id);
  const onTapCallback = useEvaluate(onTap, values);
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: (props.styles?.backgroundColor as string) ?? "#3e5975",
        width: props.styles?.width ?? "100px",
        borderRadius: "5px",
      }}
    >
      <SearchOutlined color="grey" style={{ marginLeft: "4px" }} />
      <Input
        placeholder="Search..."
        style={{
          width: "80%",
          padding: "8px",
          backgroundColor:
            (props.styles?.backgroundColor as string) ?? "#3e5975",
          border: `1px solid ${
            props.styles?.backgroundColor
              ? `${props.styles?.backgroundColor}`
              : "#3e5975"
          }`,
        }}
        type="text"
      />
    </div>
  );
};

WidgetRegistry.register("Search", Search);
