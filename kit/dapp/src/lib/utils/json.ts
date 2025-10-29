// Prevent errors of libraries that try to stringify BigInt values
// See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
declare global {
  interface BigInt {
    toJSON: () => string;
  }
}

/**
 * Enable BigInt toJSON method to prevent errors of libraries that try to stringify BigInt values
 *
 * Eg React Dom does it and Tanstack Dev tools, if a form has a bigint field, it will throw an error
 * See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/BigInt#use_within_json
 */
export function patchBigIntToJSON() {
  if (typeof BigInt.prototype.toJSON !== "function") {
    // oxlint-disable-next-line no-extend-native
    BigInt.prototype.toJSON = function toJSON() {
      return this.toString();
    };
  }
}
