import React, { useCallback, useState } from "react";
import Cropper from "react-easy-crop";
import {
  type EnsembleAction,
  useRegisterBindings,
} from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import { EnsembleWidgetProps, EnsembleWidgetStyles } from "../shared/types";
import { useEnsembleAction } from "../runtime/hooks";

type ImageCropperStyle = {
  shape?: "rect" | "round";
  fit?: "contain" | "cover" | "horizontal-cover" | "vertical-cover";
  cropPercentage?: number;
  strokeColor?: string;
} & EnsembleWidgetStyles;

export type ImageCropperProps = {
  source: string;
  onCropped?: EnsembleAction;
} & EnsembleWidgetProps<ImageCropperStyle>;

export const ImageCropper: React.FC<ImageCropperProps> = (props) => {
  const { onCropped, ...rest } = props;
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);
  const { values, id } = useRegisterBindings({ ...rest, rotate }, props.id, {
    setRotate,
  });

  const onCroppedAction = useEnsembleAction(onCropped);
  const onCroppedActionCallback = useCallback(
    (data: unknown) => {
      if (!onCroppedAction) {
        return;
      }
      onCroppedAction.callback({ data });
    },
    [onCroppedAction],
  );

  if (values?.source) {
    const customStyles = `
      #${id} {
        display: ${
          values.styles?.visible === false ? "none" : "inherit"
        } !important;
      }

      #${id} .reactEasyCrop_Container {
        border-color: ${values.styles?.borderColor || "unset"} !important;
        border-width: ${values.styles?.borderWidth || "unset"} !important;
        border-radius: ${values.styles?.borderRadius || "unset"} !important;
        border-style: ${values.styles?.borderStyle || "solid"} !important;
        background-color: ${
          values.styles?.backgroundColor || "unset"
        } !important;
        
      }

      #${id} .reactEasyCrop_CropAreaRound {
        border-color: ${values.styles?.strokeColor || "unset"} !important;
        border-width: ${values.styles?.strokeWidth || "unset"} !important;
      }
    `;

    return (
      <div
        id={id}
        style={{
          position: "relative",
          height: `${values.styles?.height || "500px"}`,
          width: `${values.styles?.width || "500px"}`,
          ...values.styles,
        }}
      >
        <style>{customStyles}</style>
        <Cropper
          aspect={values.styles?.cropPercentage ?? 3 / 4}
          crop={crop}
          cropShape={values.styles?.shape ?? "rect"}
          image={values.source}
          objectFit={values.styles?.fit}
          onCropChange={setCrop}
          onCropComplete={onCroppedActionCallback}
          onRotationChange={setRotate}
          onZoomChange={setZoom}
          rotation={rotate}
          zoom={zoom}
        />
      </div>
    );
  }

  return <div />;
};

WidgetRegistry.register("ImageCropper", ImageCropper);
