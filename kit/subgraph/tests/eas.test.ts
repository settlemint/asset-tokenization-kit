import { afterEach, assert, clearStore, describe, test } from "matchstick-as/assembly/index";

describe("EAS Tests", () => {
  test("Should pass basic test", () => {
    // This is a placeholder test to satisfy Matchstick's requirement
    assert.assertTrue(true);
  });

  afterEach(() => {
    clearStore();
  });
}); 