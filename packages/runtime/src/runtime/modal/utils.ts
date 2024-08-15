import { omit } from "lodash-es";
import { getComponentStyles } from "../../shared/styles";
import type { ModalProps } from ".";

export const getCustomStyles = (options: ModalProps, key: string): string =>
  `
    .ant-modal-root .ant-modal-centered .ant-modal {
      top: unset;
    }
    .ensemble-modal-${key} {
      max-height: 100vh;
      max-width: 100vw;
    }
    .ensemble-modal-${key} > div {
      height: ${options.height || "auto"};
    }
    .ensemble-modal-${key} .ant-modal-content {
      display: flex;
      flex-direction: column;
      ${
        getComponentStyles(
          "",
          omit(options, [
            "width",
            "position",
            "top",
            "left",
            "bottom",
            "right",
          ]) as React.CSSProperties,
        ) as string
      }
      ${options.showShadow === false ? "box-shadow: none !important;" : ""}
    }
    .ensemble-modal-${key} .ant-modal-body {
      height: 100%;
      overflow-y: auto;
    }
  `;

export const getFullScreenStyles = (key: string): string => `
  .ensemble-modal-${key} .ant-modal-content {
    height: 100vh;
    width: 100vw;
    margin: 0;
    inset: 0;
  }
`;
