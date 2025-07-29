import { describe, expect, it } from "vitest";
import {
  getLastStep,
  getNextStep,
  getPreviousStep,
  getPreviousStepId,
  getStepById,
  isGroupCompleted,
  isStepCompleted,
  isStepGroup,
} from "./utils";

describe("stepper utils", () => {
  const info = {
    label: "Example step",
    description: "This is an example step",
  };
  const stepA = {
    step: 1,
    id: "a" as const,
    ...info,
  };
  const stepB = {
    step: 5,
    id: "b" as const,
    ...info,
  };
  const stepC = {
    step: 9,
    id: "c" as const,
    ...info,
  };
  const stepD = {
    step: 13,
    id: "d" as const,
    ...info,
  };
  const stepE = {
    step: 17,
    id: "e" as const,
    ...info,
  };
  const stepF = {
    step: 21,
    id: "f" as const,
    ...info,
  };

  const group = {
    id: "group1",
    label: "Group 1",
    description: "Group 1 description",
    steps: [stepD, stepE],
  };

  describe("getStepById", () => {
    it("should find step by id", () => {
      const steps = [stepA, stepB, stepC];
      const result = getStepById(steps, "b");
      expect(result).toEqual(stepB);
    });

    it("should throw error for non-existent step", () => {
      const steps = [stepA, stepB];

      // @ts-expect-error - 'c' is not a valid step id
      expect(() => getStepById(steps, "c")).toThrow("Step with id c not found");
    });
  });

  describe("getNextStep", () => {
    it("should return next step for non-sequential steps", () => {
      const steps = [stepA, stepB, stepC];
      const currentStep = stepB;
      const result = getNextStep(steps, currentStep);
      expect(result).toEqual(stepC);
    });

    it("should handle unsorted input steps", () => {
      const steps = [stepB, stepC, stepA];
      const currentStep = stepA;
      const result = getNextStep(steps, currentStep);
      expect(result).toEqual(stepB);
    });

    it("should return same step for last step", () => {
      const steps = [stepB, stepC, stepA];
      const currentStep = stepC;
      const result = getNextStep(steps, currentStep);
      expect(result).toEqual(stepC);
    });

    it("should throw error for non-existent current step", () => {
      const steps = [stepA, stepB];
      const currentStep = stepC;

      // @ts-expect-error - stepC is not a valid step
      expect(() => getNextStep(steps, currentStep)).toThrow(
        "Current step c not found in steps array"
      );
    });
  });

  describe("getLastStep", () => {
    it("should return last step from non-sequential steps", () => {
      const steps = [stepA, stepB, stepC];
      const result = getLastStep(steps);
      expect(result).toEqual(stepC);
    });

    it("should handle single step", () => {
      const steps = [stepA];
      const result = getLastStep(steps);
      expect(result).toEqual(stepA);
    });

    it("should work with unsorted input", () => {
      const steps = [stepC, stepA, stepB];
      const result = getLastStep(steps);
      expect(result).toEqual(stepC);
    });
  });

  describe("isStepCompleted", () => {
    it("should return true when current step is after target step", () => {
      const targetStep = stepA;
      const currentStep = stepB;
      const result = isStepCompleted({ step: targetStep, currentStep });
      expect(result).toBe(true);
    });

    it("should return false when current step is at target step", () => {
      const targetStep = stepB;
      const currentStep = stepB;
      const result = isStepCompleted({ step: targetStep, currentStep });
      expect(result).toBe(false);
    });

    it("should return false when current step is before target step", () => {
      const targetStep = stepC;
      const currentStep = stepB;
      const result = isStepCompleted({ step: targetStep, currentStep });
      expect(result).toBe(false);
    });
  });

  describe("isGroupCompleted", () => {
    it("should return true when current step is after last step in group", () => {
      const currentStep = stepF;
      const result = isGroupCompleted(group, currentStep);
      expect(result).toBe(true);
    });

    it("should return false when current step is at last step in group", () => {
      const currentStep = stepE;
      const result = isGroupCompleted(group, currentStep);
      expect(result).toBe(false);
    });

    it("should return false when current step is before last step in group", () => {
      const currentStep = stepD;
      const result = isGroupCompleted(group, currentStep);
      expect(result).toBe(false);
    });

    it("should handle group with single step", () => {
      const group = {
        id: "group1",
        label: "Group 1",
        description: "Group 1 description",
        steps: [stepA],
      };
      const currentStep = stepB;
      const result = isGroupCompleted(group, currentStep);
      expect(result).toBe(true);
    });

    it("should handle group with non-sequential steps", () => {
      const group = {
        id: "group1",
        label: "Group 1",
        description: "Group 1 description",
        steps: [stepA, stepB, stepC],
      };
      const currentStep = stepD;
      const result = isGroupCompleted(group, currentStep);
      expect(result).toBe(true);
    });
  });

  describe("isStepGroup", () => {
    it("should return true for step group", () => {
      const result = isStepGroup(group);
      expect(result).toBe(true);
    });

    it("should return false for step", () => {
      const result = isStepGroup(stepA);
      expect(result).toBe(false);
    });
  });

  describe("getPreviousStep", () => {
    it("should return previous step for non-sequential steps", () => {
      const steps = [stepA, stepB, stepC];
      const currentStep = stepB;
      const result = getPreviousStep(steps, currentStep);
      expect(result).toEqual(stepA);
    });

    it("should handle unsorted input steps", () => {
      const steps = [stepB, stepC, stepA];
      const currentStep = stepB;
      const result = getPreviousStep(steps, currentStep);
      expect(result).toEqual(stepA);
    });

    it("should return same step for first step", () => {
      const steps = [stepA, stepB, stepC];
      const currentStep = stepA;
      const result = getPreviousStep(steps, currentStep);
      expect(result).toEqual(stepA);
    });

    it("should handle single step", () => {
      const steps = [stepA];
      const currentStep = stepA;
      const result = getPreviousStep(steps, currentStep);
      expect(result).toEqual(stepA);
    });

    it("should handle unordered array with non-sequential steps", () => {
      const steps = [stepC, stepE, stepA, stepB];
      const currentStep = stepE;
      const result = getPreviousStep(steps, currentStep);
      expect(result).toEqual(stepC);
    });

    it("should throw error for non-existent current step", () => {
      const steps = [stepA, stepB];
      const currentStep = stepC;

      // @ts-expect-error - stepC is not a valid step
      expect(() => getPreviousStep(steps, currentStep)).toThrow(
        "Current step c not found in steps array"
      );
    });
  });

  describe("getPreviousStepId", () => {
    it("should return previous step id for non-sequential steps", () => {
      const steps = [stepA, stepB, stepC];
      const result = getPreviousStepId(steps, "b");
      expect(result).toBe("a");
    });

    it("should handle unsorted input steps", () => {
      const steps = [stepB, stepC, stepA];
      const result = getPreviousStepId(steps, "b");
      expect(result).toBe("a");
    });

    it("should return same step id for first step", () => {
      const steps = [stepA, stepB, stepC];
      const result = getPreviousStepId(steps, "a");
      expect(result).toBe("a");
    });

    it("should handle single step", () => {
      const steps = [stepA];
      const result = getPreviousStepId(steps, "a");
      expect(result).toBe("a");
    });

    it("should handle unordered array with non-sequential steps", () => {
      const steps = [stepC, stepE, stepA, stepB];
      const result = getPreviousStepId(steps, "e");
      expect(result).toBe("c");
    });

    it("should throw error for non-existent step id", () => {
      const steps = [stepA, stepB];

      // @ts-expect-error - 'c' is not a valid step id
      expect(() => getPreviousStepId(steps, "c")).toThrow(
        "Step with id c not found"
      );
    });
  });
});
