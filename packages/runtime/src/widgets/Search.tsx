import { Input } from "antd";
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
    border: string;
    margin: string;
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
        justifyContent: "flex-start",
        backgroundColor: (props.styles?.backgroundColor as string) ?? "#3e5975",
        width: props.styles?.width ?? "100px",
        borderRadius: "15px",
        border: props.styles?.border ?? "1px solid grey",
        margin: props.styles?.margin,
      }}
    >
      <SearchOutlined color="grey" style={{ marginLeft: "10px" }} />
      <Input
        placeholder="Search"
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
