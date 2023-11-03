import React, { useState, useCallback } from "react";
import {
  Stepper as MUIStepper,
  Step,
  StepLabel,
  StepButton,
  Button,
  Typography,
  StepOwnProps,
  styled,
} from "@mui/material";
import type { StepIconProps } from "@mui/material/StepIcon";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import {
  type EnsembleWidget,
  useRegisterBindings,
} from "@ensembleui/react-framework";
import type { EnsembleWidgetProps } from "../util/types";
import { WidgetRegistry } from "../registry";
import { EnsembleRuntime } from "../runtime";

export interface StepProps {
  stepLabel: string;
  activeStepWidget: EnsembleWidget;
  inactiveStepWidget: EnsembleWidget;
  contentWidget: EnsembleWidget;
}

export type StepperProps = {
  activeStepIndex?: number;
  steps: StepProps[];
  styles: {
    connectorColor?: string;
    connectorHeight?: number;
  };
} & EnsembleWidgetProps;

interface CustomConnectorProps {
  connectorColor?: string;
  activeConnectorColor?: string;
  completedConnectorColor?: string;
  connectorHeight?: number;
}

const Stepper: React.FC<StepperProps> = (props) => {
  const [activeStep, setActiveStep] = useState(0);
  const handleNext = useCallback(() => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  }, [setActiveStep]);

  const handleBack = useCallback(() => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  }, [setActiveStep]);
  const handleStep = (step: number) => () => {
    setActiveStep(step);
  };
  const { values } = useRegisterBindings(
    { ...props, activeStep: activeStep },
    props.id,
    {
      handleNext,
      handleBack,
    }
  );
  return (
    <div>
      <MUIStepper
        activeStep={values?.activeStep}
        alternativeLabel
        connector={
          <CustomConnector
            connectorColor={props?.styles.connectorColor}
            connectorHeight={props?.styles.connectorHeight}
          />
        }
      >
        {values?.steps[0].inactiveStepWidget &&
        values?.steps[0].activeStepWidget
          ? values?.steps.map((step, index) => (
              <Step key={step.stepLabel}>
                <StepButton color="inherit" onClick={handleStep(index)}>
                  <StepLabel
                    StepIconComponent={(iconProps: StepOwnProps) => {
                      const newProps = {
                        step,
                        ...(iconProps as StepIconProps),
                      };
                      return CustomStepIcon(newProps);
                    }}
                  />
                </StepButton>
              </Step>
            ))
          : values?.steps.map((step) => (
              <Step key={step.stepLabel}>
                <StepLabel>{step.stepLabel}</StepLabel>
              </Step>
            ))}
      </MUIStepper>
      <div>
        {values?.steps.map((step, index) => (
          <div key={step.stepLabel}>
            {index === values?.activeStep && (
              <>
                {step?.contentWidget
                  ? EnsembleRuntime.render([step.contentWidget])
                  : null}
              </>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

WidgetRegistry.register("Stepper", Stepper);

const CustomConnector = styled(StepConnector)(
  (props: CustomConnectorProps) => ({
    [`&.${stepConnectorClasses.alternativeLabel}`]: {
      top: 20,
      left: "calc(-50% + 16px)",
      right: "calc(50% + 16px)",
    },
    [`&.${stepConnectorClasses.active}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        borderColor: props?.connectorColor ?? "grey",
      },
    },
    [`&.${stepConnectorClasses.completed}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        borderColor: "#31C48D",
      },
    },
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#eaeaf0",
      borderTopWidth: props?.connectorHeight ?? 3,
      borderRadius: 1,
    },
  })
);

const CustomStepIcon = (props: { step: StepProps } & StepIconProps) => {
  const { active, completed } = props;
  if (active || completed) {
    return <div>{EnsembleRuntime.render([props.step.activeStepWidget])}</div>;
  }
  return <div>{EnsembleRuntime.render([props.step.inactiveStepWidget])}</div>;
};
