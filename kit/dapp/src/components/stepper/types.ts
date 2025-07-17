export interface Step<StepName> {
  step: number;
  id: StepName;
  label: string;
  description: string;
}

export interface StepGroup<StepName, GroupName> {
  name: GroupName;
  label: string;
  steps: Step<StepName>[];
}

export type StepOrGroup<StepName, GroupName> =
  | Step<StepName>
  | StepGroup<StepName, GroupName>;

export type Navigation = "next-only" | "next-and-completed";
