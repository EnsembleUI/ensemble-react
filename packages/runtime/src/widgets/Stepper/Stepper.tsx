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
  activeStepWidget: EnsembleWidget;
  inactiveStepWidget: EnsembleWidget;
  contentWidget: EnsembleWidget;
}

export interface StepTemplate {
  name: "Steps";
  properties: {
    children: EnsembleWidget[];
  };
}

export type StepperProps = {
  steps: StepProps[];
  "item-template": {
    data: Expression<object>;
    name: string;
    template: StepTemplate;
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
  const stepTypes = itemTemplate.template;
  const handleNext = useCallback(() => {
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
  }, [setActiveStep]);

  const handleBack = useCallback(() => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  }, [setActiveStep]);
  const handleStep = (step: number) => () => {
    setActiveStep(step);
  };
  const { values } = useRegisterBindings({ ...props, activeStep }, props.id, {
    handleNext,
    handleBack,
  });
  console.log("namedData", namedData, namedData[0][itemTemplate.name]);
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
      left: "calc(-50% + 16px)",
      right: "calc(50% + 16px)",
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
  props: { stepTypes: StepTemplate } & StepIconProps & {
      data: Record<string, unknown>;
    }
) => {
  const { active, completed } = props;
  if (active) {
    return (
      <StepType data={props.data} stepIndex={1} template={props.stepTypes} />
    );
  }
  if (completed) {
    return (
      <StepType data={props.data} stepIndex={2} template={props.stepTypes} />
    );
  }
  return (
    <StepType data={props.data} stepIndex={0} template={props.stepTypes} />
  );
};
