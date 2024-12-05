import React, { useState, useCallback, useEffect } from "react";
import type { StepOwnProps } from "@mui/material";
import {
  Stepper as MUIStepper,
  Step,
  StepLabel,
  StepButton,
  styled,
} from "@mui/material";
import type { StepIconProps } from "@mui/material/StepIcon";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import { map, cloneDeep, isNumber } from "lodash-es";
import {
  useRegisterBindings,
  useTemplateData,
  unwrapWidget,
  isExpression,
} from "@ensembleui/react-framework";
import type {
  EnsembleAction,
  EnsembleWidget,
  Expression,
} from "@ensembleui/react-framework";
import Alert from "@mui/material/Alert";
import type { EnsembleWidgetProps, HasItemTemplate } from "../../shared/types";
import { EnsembleRuntime } from "../../runtime";
import { WidgetRegistry } from "../../registry";
import { StepType } from "./StepType";
import type { StepTypeProps } from "./StepType";
import { useEnsembleAction } from "../../runtime/hooks";

const widgetName = "Stepper";

export interface StepProps {
  stepLabel: string;
  contentWidget: { [key: string]: unknown };
}

export type StepperProps = {
  steps: StepProps[];
  activeStepIndex?: number;
  styles: {
    inActiveConnectorColor?: Expression<string>;
    connectorColor?: Expression<string>;
    connectorHeight?: number;
    backgroundColor?: Expression<string>;
    borderRadius?: Expression<string>;
    padding?: string;
  };
  onChange?: EnsembleAction;
} & EnsembleWidgetProps &
  HasItemTemplate;

interface CustomConnectorProps {
  connector_color?: string;
  connector_height?: number;
  inactive_connector_color?: string;
}

const Stepper: React.FC<StepperProps> = (props) => {
  const [activeStep, setActiveStep] = useState<number | undefined>(undefined);

  const itemTemplate = props["item-template"];
  const { namedData } = useTemplateData({ ...itemTemplate });
  const stepsLength = namedData.length;
  const stepTypes = itemTemplate?.template;
  const action = useEnsembleAction(props.onChange);

  const handleNext = useCallback(() => {
    if (activeStep !== undefined && activeStep < namedData.length - 1) {
      setActiveStep(activeStep + 1);
    }
  }, [activeStep, namedData.length]);

  const handleBack = useCallback(() => {
    if (activeStep) {
      setActiveStep(activeStep - 1);
    }
  }, [activeStep]);

  const { values, rootRef } = useRegisterBindings(
    { ...props, activeStep, widgetName },
    props.id,
    {
      handleNext,
      handleBack,
    },
  );

  useEffect(() => {
    if (
      isExpression(props.activeStepIndex) &&
      isNumber(values?.activeStepIndex)
    ) {
      setActiveStep(values?.activeStepIndex ?? 0);
    }
  }, [props.activeStepIndex, values?.activeStepIndex]);

  const steps = unwrapContent(props.steps);

  const onChangeCallback = useCallback(
    (step: number) => () => {
      setActiveStep(step);
      action?.callback({ step });
    },
    [action?.callback],
  );

  if (activeStep === undefined) {
    return null;
  }

  if (!stepTypes) {
    return (
      <Alert
        severity="error"
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        Please use correct syntax for the <strong>Stepper widget !</strong>
      </Alert>
    );
  }

  const stepPercentage = 100 / stepsLength;
  const activeStepPercentage = (activeStep + 1) * stepPercentage;

  return (
    <div ref={rootRef}>
      <div style={{ position: "relative" }}>
        <MUIStepper
          activeStep={activeStep}
          alternativeLabel
          connector={
            <CustomConnector
              connector_color={values?.styles.connectorColor}
              connector_height={values?.styles.connectorHeight}
              inactive_connector_color={values?.styles.inActiveConnectorColor}
            />
          }
          sx={{
            justifyContent: "center",
            backgroundColor: values?.styles.backgroundColor,
            padding: `${
              values?.styles.padding ? `${values.styles.padding}px` : ""
            }`,
            borderRadius: `${
              values?.styles.borderRadius
                ? `${values.styles.borderRadius}px`
                : "0px"
            }`,
          }}
        >
          {namedData.map((data, index) => (
            <Step key={index}>
              <StepButton onClick={onChangeCallback(index)}>
                <StepLabel
                  StepIconComponent={(iconProps: StepOwnProps) => {
                    const newProps = {
                      stepTypes,
                      ...(iconProps as StepIconProps),
                      data,
                      index: values?.activeStepIndex ?? 0,
                      stepsLength,
                      name: itemTemplate.name,
                    };
                    return CustomStepIcon(newProps);
                  }}
                />
              </StepButton>
            </Step>
          ))}
        </MUIStepper>
        <div style={{ position: "absolute", left: "20px", right: "20px" }}>
          <span
            style={{
              position: "absolute",
              bottom: 0,
              width: "20px",
              height: "4px",
              left: `calc(${
                activeStepPercentage - stepPercentage / 2
              }% - 10px)`,
              backgroundColor: values?.styles.connectorColor,
            }}
          />
        </div>
      </div>
      <div>
        {steps.map((step, index) => (
          <div key={step.stepLabel}>
            {index === activeStep && (
              <>{EnsembleRuntime.render([step.contentWidget])}</>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

WidgetRegistry.register(widgetName, Stepper);

const CustomConnector = styled(StepConnector)(
  (props: CustomConnectorProps) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
      top: 20,
      left: `calc(-50% + 22px)`,
    },
    [`&.${stepConnectorClasses.active}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        borderColor: props.connector_color ?? "grey",
      },
    },
    [`&.${stepConnectorClasses.completed}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        borderColor: props.connector_color,
      },
    },
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: props.inactive_connector_color,
      borderTopWidth: props.connector_height ?? 3,
      borderRadius: 1,
    },
  }),
);

const CustomStepIcon = (
  props: {
    index: number;
    data: object;
    stepTypes: EnsembleWidget;
    stepsLength: number;
    name: string;
  } & StepIconProps,
): React.ReactElement<StepTypeProps> => {
  const { active, completed, stepsLength, index } = props;
  const stateData = { active, completed, stepsLength, index };
  return (
    <StepType
      data={props.data}
      name={props.name}
      stateData={stateData}
      template={props.stepTypes}
    />
  );
};

const unwrapContent = (
  steps: StepProps[],
): { stepLabel: string; contentWidget: EnsembleWidget }[] => {
  const unwrappedChildren = map(steps, ({ stepLabel, contentWidget }) => {
    const deepCopy = cloneDeep(contentWidget);
    const unwrapped = unwrapWidget(deepCopy);
    return {
      stepLabel,
      contentWidget: unwrapped,
    };
  });
  return [...unwrappedChildren];
};
