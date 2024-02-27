import React, { useCallback, useState } from "react";
import Cropper, { Area } from "react-easy-crop";
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

type ImageCropperProps = {
  source: string;
  onCropped?: EnsembleAction;
} & EnsembleWidgetProps<ImageCropperStyle>;

export const ImageCropper: React.FC<ImageCropperProps> = (props) => {
  const { onCropped, ...rest } = props;
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [rotate, setRotate] = useState(0);
  const [croppedAreaPixels, setcroppedAreaPixels] = useState<Area>({
    x: 0,
    y: 0,
    width: 0,
    height: 0,
  });

  const onCroppedAction = useEnsembleAction(onCropped);
  const onCroppedActionCallback = useCallback(
    (croppedArea: Area, croppedAreaPix: Area) => {
      setcroppedAreaPixels(croppedAreaPix);
      if (!onCroppedAction) {
        return;
      }
      onCroppedAction.callback({ croppedAreaPix });
    },
    [onCroppedAction],
  );

  const createImg = (url: string): Promise<HTMLImageElement> => {
    return new Promise((resolve, reject) => {
      const image = new Image();
      image.addEventListener("load", () => resolve(image));
      image.addEventListener("error", (error) => reject(error));
      image.setAttribute("crossOrigin", "anonymous"); // needed to avoid cross-origin issues on CodeSandbox
      image.src = url;
    });
  };

  const getRadianAngle = (degreeVal: number): number => {
    return (degreeVal * Math.PI) / 180;
  };

  const rotateSize = (width: number, height: number) => {
    const rotRad = getRadianAngle(rotate);

    return {
      width:
        Math.abs(Math.cos(rotRad) * width) +
        Math.abs(Math.sin(rotRad) * height),
      height:
        Math.abs(Math.sin(rotRad) * width) +
        Math.abs(Math.cos(rotRad) * height),
    };
  };

  const getCroppedImg = async () => {
    if (!values?.source) {
      return null;
    }

    const image = await createImg(values.source);
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");

    if (!ctx) {
      return null;
    }

    const rotRad = getRadianAngle(rotate);

    const { width: bBoxWidth, height: bBoxHeight } = rotateSize(
      image.width,
      image.height,
    );

    // set canvas size to match the bounding box
    canvas.width = bBoxWidth;
    canvas.height = bBoxHeight;

    // translate canvas context to a central location to allow rotating and flipping around the center
    ctx.translate(bBoxWidth / 2, bBoxHeight / 2);
    ctx.rotate(rotRad);
    ctx.scale(1, 1);
    ctx.translate(-image.width / 2, -image.height / 2);

    // draw rotated image
    ctx.drawImage(image, 0, 0);

    const croppedCanvas = document.createElement("canvas");
    const croppedCtx = croppedCanvas.getContext("2d");
    if (!croppedCtx) {
      return null;
    }

    // Set the size of the cropped canvas
    croppedCanvas.width = croppedAreaPixels.width;
    croppedCanvas.height = croppedAreaPixels.height;
    // Draw the cropped image onto the new canvas
    croppedCtx.drawImage(
      canvas,
      croppedAreaPixels.x,
      croppedAreaPixels.y,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
      0,
      0,
      croppedAreaPixels.width,
      croppedAreaPixels.height,
    );

    return new Promise((resolve, reject) => {
      croppedCanvas.toBlob((file) => {
        if (file) {
          resolve(URL.createObjectURL(file));
        } else {
          reject();
        }
      }, "image/jpeg");
    });
  };

  const { values, id } = useRegisterBindings({ ...rest, rotate }, props.id, {
    setRotate,
    getCroppedImg,
  });

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
