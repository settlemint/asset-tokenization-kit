export function exhaustiveGuard(_value: never | null): never {
  throw new Error(
    `ERROR! Reached forbidden guard function with unexpected value: ${JSON.stringify(_value)}`
  );
}
