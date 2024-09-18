import React, { useCallback, useState } from "react";
import { QRCode } from "antd";
import {
  EnsembleAction,
  useRegisterBindings,
} from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import type { EnsembleWidgetProps } from "../shared/types";
import { useEnsembleAction } from "../runtime/hooks";

const widgetName = "QRCode";

type QRCodeProps = {
  value: string;
  size: number;
  icon: string;
  iconSize: number;
  status: "active" | "expired" | "loading" | "scanned";
  onRefresh: EnsembleAction;
} & EnsembleWidgetProps;

export const QrCode: React.FC<QRCodeProps> = (props) => {
  const [qrValue, setQrValue] = useState<string>(props.value);
  const { onRefresh, ...rest } = props;

  const { values } = useRegisterBindings(
    { ...rest, qrValue, widgetName },
    rest.id,
    {
      setValue: setQrValue,
    },
  );

  const onRefreshAction = useEnsembleAction(onRefresh);

  // trigger on signin action
  const onRefresgActionCallback = useCallback(() => {
    if (!onRefreshAction) {
      return;
    }

    return onRefreshAction.callback();
  }, [onRefreshAction]);

  return (
    <div>
      <QRCode
        bgColor={values?.styles?.backgroundColor}
        color={values?.styles?.color}
        icon={values?.icon}
        iconSize={values?.iconSize || 40}
        onRefresh={onRefresgActionCallback}
        size={values?.size || 160}
        status={values?.status}
        value={qrValue || ""}
      />
    </div>
  );
};

WidgetRegistry.register(widgetName, QrCode);
