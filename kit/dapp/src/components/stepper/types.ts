export interface Step<StepName extends string = string> {
  id: number;
  name: StepName[];
  label: string;
  description: string;
}

export interface StepGroup<
  StepName extends string = string,
  GroupName extends string = string,
> {
  id: number;
  name: GroupName[];
  steps: Step<StepName>[];
}

export type StepOrGroup<
  StepName extends string = string,
  GroupName extends string = string,
> = Step<StepName> | StepGroup<StepName, GroupName>;
