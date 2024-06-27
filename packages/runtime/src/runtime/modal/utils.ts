import { omit } from "lodash-es";
import { getComponentStyles } from "../../shared/styles";
import type { ModalProps } from ".";

export const getCustomStyles = (options: ModalProps, index: number): string =>
  `
    .ant-modal-root .ant-modal-centered .ant-modal {
      top: unset;
    }
    .ensemble-modal-${index} {
      max-height: 100vh;
      max-width: 100vw;
    }
    .ensemble-modal-${index} > div {
      height: ${options.height || "auto"};
    }
    .ensemble-modal-${index} .ant-modal-content {
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
    .ensemble-modal-${index} .ant-modal-body {
      height: 100%;
      overflow-y: auto;
    }
  `;

export const getFullScreenStyles = (index: number): string => `
  .ensemble-modal-${index} .ant-modal-content {
    height: 100vh;
    width: 100vw;
    margin: 0;
    inset: 0;
  }
`;
