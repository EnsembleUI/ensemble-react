import React, { useState, useCallback } from "react";
import {
  Stepper as MUIStepper,
  Step,
  StepLabel,
  StepButton,
  StepOwnProps,
  styled,
} from "@mui/material";
import type { StepIconProps } from "@mui/material/StepIcon";
import StepConnector, {
  stepConnectorClasses,
} from "@mui/material/StepConnector";
import { map } from "lodash-es";
import {
  type EnsembleWidget,
  useRegisterBindings,
  type Expression,
  useTemplateData,
} from "@ensembleui/react-framework";
import type { EnsembleWidgetProps } from "../../util/types";
import { WidgetRegistry } from "../../registry";
import { EnsembleRuntime } from "../../runtime";
import { StepType } from "./StepType";

export interface StepProps {
  stepLabel: string;
  contentWidget: EnsembleWidget;
}

export type StepperProps = {
  steps: StepProps[];
  "item-template": {
    data: Expression<object>;
    name: string;
    template: EnsembleWidget;
  };
  styles: {
    connectorColor?: string;
    connectorHeight?: number;
  };
} & EnsembleWidgetProps;

interface CustomConnectorProps {
  connector_color?: string;
  connector_height?: number;
}

const Stepper: React.FC<StepperProps> = (props) => {
  const [activeStep, setActiveStep] = useState(0);
  const itemTemplate = props["item-template"];
  const templateData = useTemplateData(itemTemplate.data);
  const namedData = map(templateData, (value) => {
    const namedObj: Record<string, unknown> = {};
    namedObj[itemTemplate.name] = value;
    return namedObj;
  });
  const stepsLength = namedData.length;
  const stepTypes = itemTemplate.template;
  const handleNext = useCallback(() => {
    if (activeStep < namedData.length - 1) {
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    }
  }, [activeStep, namedData.length]);

  const handleBack = useCallback(() => {
    if (activeStep !== 0) {
      setActiveStep((prevActiveStep) => prevActiveStep - 1);
    }
  }, [activeStep]);
  const handleStep = (step: number) => () => {
    setActiveStep(step);
  };
  const { values } = useRegisterBindings({ ...props, activeStep }, props.id, {
    handleNext,
    handleBack,
  });
  return (
    <div>
      <MUIStepper
        activeStep={values?.activeStep}
        alternativeLabel
        connector={
          <CustomConnector
            connector_color={props?.styles.connectorColor}
            connector_height={props?.styles.connectorHeight}
          />
        }
      >
        {values?.["item-template"]
          ? namedData?.map((data, index) => (
              <Step key={index}>
                <StepButton onClick={handleStep(index)}>
                  <StepLabel
                    StepIconComponent={(iconProps: StepOwnProps) => {
                      const newProps = {
                        stepTypes,
                        ...(iconProps as StepIconProps),
                        data,
                        index: values.activeStep,
                        stepsLength,
                      };
                      return CustomStepIcon(newProps);
                    }}
                  />
                </StepButton>
              </Step>
            ))
          : null}
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
    },
    [`&.${stepConnectorClasses.active}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        borderColor: props?.connector_color ?? "grey",
      },
    },
    [`&.${stepConnectorClasses.completed}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        borderColor: "#31C48D",
      },
    },
    [`& .${stepConnectorClasses.line}`]: {
      borderColor: "#eaeaf0",
      borderTopWidth: props?.connector_height ?? 3,
      borderRadius: 1,
    },
  })
);

const CustomStepIcon = (
  props: { stepTypes: EnsembleWidget } & StepIconProps & {
      data: Record<string, unknown>;
    } & { index: number } & { stepsLength: number }
) => {
  const { active, completed, stepsLength, index } = props;
  const stateData = { active, completed, stepsLength, index };
  return (
    <StepType
      data={props.data}
      stateData={stateData}
      template={props.stepTypes}
    />
  );
};
