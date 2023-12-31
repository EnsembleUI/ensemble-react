import React, { useState, useCallback } from "react";
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
import { map, cloneDeep } from "lodash-es";
import {
  useRegisterBindings,
  useTemplateData,
  unwrapWidget,
} from "@ensembleui/react-framework";
import type {
  TemplateData,
  EnsembleWidget,
  Expression,
} from "@ensembleui/react-framework";
import Alert from "@mui/material/Alert";
import type { EnsembleWidgetProps } from "../../shared/types";
import { WidgetRegistry } from "../../registry";
import { EnsembleRuntime } from "../../runtime";
import type { StepTypeProps } from "./StepType";
import { StepType } from "./StepType";

export interface StepProps {
  stepLabel: string;
  contentWidget: Record<string, unknown>;
}
export interface TemplateProps {
  data: Expression<TemplateData>;
  name: string;
  template: EnsembleWidget;
}

export type StepperProps = {
  steps: StepProps[];
  activeStepIndex?: number;
  "item-template": TemplateProps;
  styles: {
    inActiveConnectorColor?: Expression<string>;
    connectorColor?: Expression<string>;
    connectorHeight?: number;
    backgroundColor?: Expression<string>;
    borderRadius?: Expression<string>;
    padding?: string;
  };
} & EnsembleWidgetProps;

interface CustomConnectorProps {
  connector_color?: string;
  connector_height?: number;
  inactive_connector_color?: string;
}

const Stepper: React.FC<StepperProps> = (props) => {
  const [activeStep, setActiveStep] = useState(props?.activeStepIndex ?? 0);
  const itemTemplate = props["item-template"];
  const { namedData } = useTemplateData({ ...itemTemplate });
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
  const steps = unwrapContent(props.steps);
  return (
    <div>
      <MUIStepper
        activeStep={values?.activeStep}
        alternativeLabel
        connector={
          <CustomConnector
            connector_color={values?.styles.connectorColor}
            connector_height={values?.styles.connectorHeight}
            inactive_connector_color={values?.styles?.inActiveConnectorColor}
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
        {values?.["item-template"] ? (
          namedData.map((data, index) => (
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
                      name: itemTemplate.name,
                    };
                    return CustomStepIcon(newProps);
                  }}
                />
              </StepButton>
            </Step>
          ))
        ) : (
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
        )}
      </MUIStepper>
      <div>
        {steps.map((step, index) => (
          <div key={step.stepLabel}>
            {index === values?.activeStep && (
              <>{EnsembleRuntime.render([step.contentWidget])}</>
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
      left: `calc(-50% + 22px)`,
    },
    [`&.${stepConnectorClasses.active}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        borderColor: props.connector_color ?? "grey",
      },
    },
    [`&.${stepConnectorClasses.completed}`]: {
      [`& .${stepConnectorClasses.line}`]: {
        borderColor: props?.connector_color,
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
  props: { stepTypes: EnsembleWidget } & StepIconProps & {
      data: object;
    } & { index: number } & { stepsLength: number } & { name: string },
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
