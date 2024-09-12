import React, { useState } from "react";
import { QRCode } from "antd";
import { useRegisterBindings } from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from "../shared/types";

const widgetName = "QRCode";

type QRCodeProps = {
  value: string;
  size: number;
} & EnsembleWidgetProps;

export const QrCode: React.FC<QRCodeProps> = (props) => {
  const [qrValue, setQrValue] = useState<string>(props.value);

  const { values } = useRegisterBindings(
    { ...props, qrValue, widgetName },
    props.id,
    {
      setValue: setQrValue,
    },
  );

  return (
    <div>
      <QRCode
        bgColor={values?.styles?.backgroundColor}
        color={values?.styles?.color}
        size={values?.size || 160}
        value={qrValue || ""}
      />
    </div>
  );
};

WidgetRegistry.register(widgetName, QrCode);
