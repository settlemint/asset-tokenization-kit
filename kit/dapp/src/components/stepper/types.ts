export interface Step<StepId> {
  id: StepId;
  label: string;
  description: string;
  step: number;
}

export interface StepGroup<StepId, GroupId> {
  id: GroupId;
  label: string;
  description: string;
  steps: Step<StepId>[];
}

export type StepOrGroup<StepId, GroupId> =
  | Step<StepId>
  | StepGroup<StepId, GroupId>;

export type NavigationMode = "next-only" | "next-and-completed";
