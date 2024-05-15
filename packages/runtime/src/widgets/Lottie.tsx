import React, { useCallback, useRef, useState } from "react";
import { Player, type PlayerEvent } from "@lottiefiles/react-lottie-player";
import {
  type EnsembleAction,
  useRegisterBindings,
} from "@ensembleui/react-framework";
import { WidgetRegistry } from "../registry";
import { type EnsembleWidgetProps } from "../shared/types";
import { useEnsembleAction } from "../runtime/hooks";
import { getComponentStyles } from "../shared/styles";

const widgetName = "Lottie";

export type LottieProps = {
  source: string;
  repeat?: boolean;
  autoPlay?: boolean;
  fit?:
    | "contain"
    | "cover"
    | "fill"
    | "none"
    | "scaleDown"
    | "fitWidth"
    | "fitHeight";
  onTap?: EnsembleAction;
  onForward?: EnsembleAction;
  onReverse?: EnsembleAction;
  onPause?: EnsembleAction;
  onComplete?: EnsembleAction;
} & EnsembleWidgetProps;

export const Lottie: React.FC<LottieProps> = (props) => {
  const [source, setSource] = useState(props.source);
  const lottieRef = useRef<Player>(null);
  const forwardAction = useEnsembleAction(props.onForward);
  const reverseAction = useEnsembleAction(props.onReverse);
  const pauseAction = useEnsembleAction(props.onPause);
  const completeAction = useEnsembleAction(props.onComplete);
  const tapAction = useEnsembleAction(props.onTap);

  const handleEventPlayer = useCallback(
    (pe: PlayerEvent) => {
      if (pe === "complete") {
        completeAction?.callback();
      }
    },
    [completeAction],
  );

  const onTapCallback = useCallback(() => {
    tapAction?.callback();
  }, [tapAction]);

  const forward = useCallback(() => {
    lottieRef.current?.setPlayerDirection(1);
    lottieRef.current?.play();
    forwardAction?.callback();
  }, [lottieRef]);
  const reverse = useCallback(() => {
    lottieRef.current?.setPlayerDirection(-1);
    lottieRef.current?.play();
    reverseAction?.callback();
  }, [lottieRef]);
  const stop = useCallback(() => {
    lottieRef.current?.pause();
    pauseAction?.callback();
  }, [lottieRef]);
  const reset = useCallback(() => {
    lottieRef.current?.stop();
  }, [lottieRef]);

  const { id, values } = useRegisterBindings(
    {
      ...props,
      source,
      widgetName,
    },
    props.id,
    {
      setSource,
      forward,
      reverse,
      stop,
      reset,
    },
  );

  return (
    <>
      <style>
        {`
            .lf-player-container #${id} svg {
                ${values?.fit === "fitWidth" ? "width: 100%;" : ""}
                ${values?.fit === "fitHeight" ? "height: 100%;" : ""}
                ${
                  values?.fit
                    ? `object-fit: ${values?.fit
                        // eslint-disable-next-line prefer-named-capture-group
                        ?.replace(/([a-z])([A-Z])/g, "$1-$2")
                        .toLowerCase()};`
                    : ""
                }
            }
        `}
      </style>
      {/* eslint-disable-next-line jsx-a11y/click-events-have-key-events, jsx-a11y/no-static-element-interactions */}
      <div
        onClick={() => onTapCallback()}
        style={{
          ...(getComponentStyles(
            "",
            values?.styles,
            false,
          ) as React.CSSProperties),
        }}
      >
        <Player
          autoplay={values?.autoPlay || true}
          className={values?.styles?.names}
          id={id}
          loop={values?.repeat || true}
          onEvent={handleEventPlayer}
          ref={lottieRef}
          src={values?.source || ""}
        />
      </div>
    </>
  );
};

WidgetRegistry.register(widgetName, Lottie);
