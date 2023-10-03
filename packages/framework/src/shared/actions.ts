export type ExecuteCodeAction =
  | string
  | {
      body: string;
    };

export interface InvokeAPIAction {
  name: string;
  inputs: Record<string, unknown>;
}

export type EnsembleAction = ExecuteCodeAction | InvokeAPIAction;

export type NavigateModalScreenProps = {
  name?: string;
  maskClosable?: boolean;
};
