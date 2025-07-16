export interface Step<StepName> {
  id: number;
  name: StepName;
  label: string;
  description: string;
}

export interface StepGroup<StepName, GroupName> {
  id: number;
  name: GroupName;
  label: string;
  steps: Step<StepName>[];
}

export type StepOrGroup<StepName, GroupName> =
  | Step<StepName>
  | StepGroup<StepName, GroupName>;
