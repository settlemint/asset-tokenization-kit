export interface Step<StepId> {
  step: number;
  id: StepId;
  label: string;
  description: string;
}

export interface StepGroup<StepId, GroupId> {
  id: GroupId;
  label: string;
  steps: Step<StepId>[];
}

export type StepOrGroup<StepId, GroupId> =
  | Step<StepId>
  | StepGroup<StepId, GroupId>;

export type NavigationMode = "next-only" | "next-and-completed";
