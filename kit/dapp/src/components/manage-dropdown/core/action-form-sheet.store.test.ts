import { describe, expect, it } from "vitest";
import {
  createActionFormStore,
  type ActionFormState,
} from "./action-form-sheet.store";

describe("createActionFormStore", () => {
  describe("Initial State", () => {
    it("creates store with values step when hasValuesStep is true", () => {
      const store = createActionFormStore({ hasValuesStep: true });
      const state = store.state;

      expect(state.step).toBe("values");
      expect(state.hasValuesStep).toBe(true);
    });

    it("creates store with confirm step when hasValuesStep is false", () => {
      const store = createActionFormStore({ hasValuesStep: false });
      const state = store.state;

      expect(state.step).toBe("confirm");
      expect(state.hasValuesStep).toBe(false);
    });
  });

  describe("State Updates", () => {
    it("allows updating step state", () => {
      const store = createActionFormStore({ hasValuesStep: true });

      // Initial state
      expect(store.state.step).toBe("values");

      // Update to confirm
      store.setState((prev) => ({ ...prev, step: "confirm" }));
      expect(store.state.step).toBe("confirm");
      expect(store.state.hasValuesStep).toBe(true); // Should remain unchanged

      // Update back to values
      store.setState((prev) => ({ ...prev, step: "values" }));
      expect(store.state.step).toBe("values");
    });

    it("allows updating entire state", () => {
      const store = createActionFormStore({ hasValuesStep: true });

      const newState: ActionFormState = {
        step: "confirm",
        hasValuesStep: false,
      };

      store.setState(newState);
      expect(store.state).toEqual(newState);
    });

    it("preserves hasValuesStep when updating only step", () => {
      const store = createActionFormStore({ hasValuesStep: true });

      store.setState((prev) => ({ ...prev, step: "confirm" }));
      expect(store.state.hasValuesStep).toBe(true);
    });
  });

  describe("Store Subscriptions", () => {
    it("notifies subscribers on state changes", () => {
      const store = createActionFormStore({ hasValuesStep: true });
      let notificationCount = 0;
      let lastState: ActionFormState | null = null;

      const unsubscribe = store.subscribe(() => {
        notificationCount++;
        lastState = store.state;
      });

      // Change state
      store.setState((prev) => ({ ...prev, step: "confirm" }));

      expect(notificationCount).toBe(1);
      expect(lastState).toEqual({
        step: "confirm",
        hasValuesStep: true,
      });

      // Change state again
      store.setState((prev) => ({ ...prev, step: "values" }));

      expect(notificationCount).toBe(2);
      expect(lastState).toEqual({
        step: "values",
        hasValuesStep: true,
      });

      // Cleanup
      unsubscribe();
    });

    it("stops notifying after unsubscribe", () => {
      const store = createActionFormStore({ hasValuesStep: false });
      let notificationCount = 0;

      const unsubscribe = store.subscribe(() => {
        notificationCount++;
      });

      // First change - should notify
      store.setState((prev) => ({ ...prev, step: "values" }));
      expect(notificationCount).toBe(1);

      // Unsubscribe
      unsubscribe();

      // Second change - should not notify
      store.setState((prev) => ({ ...prev, step: "confirm" }));
      expect(notificationCount).toBe(1); // Should still be 1
    });

    it("supports multiple subscribers", () => {
      const store = createActionFormStore({ hasValuesStep: true });
      let count1 = 0;
      let count2 = 0;

      const unsub1 = store.subscribe(() => count1++);
      const unsub2 = store.subscribe(() => count2++);

      store.setState((prev) => ({ ...prev, step: "confirm" }));

      expect(count1).toBe(1);
      expect(count2).toBe(1);

      unsub1();
      store.setState((prev) => ({ ...prev, step: "values" }));

      expect(count1).toBe(1); // Should not increase
      expect(count2).toBe(2); // Should increase

      unsub2();
    });
  });

  describe("Store Independence", () => {
    it("creates independent store instances", () => {
      const store1 = createActionFormStore({ hasValuesStep: true });
      const store2 = createActionFormStore({ hasValuesStep: false });

      expect(store1.state.step).toBe("values");
      expect(store2.state.step).toBe("confirm");

      // Update store1
      store1.setState((prev) => ({ ...prev, step: "confirm" }));

      // store2 should remain unchanged
      expect(store1.state.step).toBe("confirm");
      expect(store2.state.step).toBe("confirm");
      expect(store1.state.hasValuesStep).toBe(true);
      expect(store2.state.hasValuesStep).toBe(false);
    });
  });

  describe("Edge Cases", () => {
    it("handles rapid state updates", () => {
      const store = createActionFormStore({ hasValuesStep: true });
      let updateCount = 0;

      store.subscribe(() => updateCount++);

      // Rapid updates
      for (let i = 0; i < 10; i++) {
        store.setState((prev) => ({
          ...prev,
          step: i % 2 === 0 ? "values" : "confirm",
        }));
      }

      expect(updateCount).toBe(10);
      expect(store.state.step).toBe("confirm"); // Last update should be confirm (9 is odd)
    });

    it("handles setting the same state", () => {
      const store = createActionFormStore({ hasValuesStep: false });
      let updateCount = 0;

      store.subscribe(() => updateCount++);

      const currentState = store.state;
      store.setState(currentState); // Set same state

      // TanStack Store will still notify even if state is the same
      expect(updateCount).toBe(1);
    });

    it("allows partial state updates with spread operator", () => {
      const store = createActionFormStore({ hasValuesStep: true });

      // Only update step, preserve other properties
      store.setState((prev) => ({ ...prev, step: "confirm" }));

      expect(store.state).toEqual({
        step: "confirm",
        hasValuesStep: true,
      });
    });
  });
});
