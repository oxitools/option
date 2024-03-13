/**
 * The `Option` module provides a TypeScript implementation of the `Option` type, inspired by Rust's `Option` enum.
 * This utility is designed for scenarios where a value may or may not be present, allowing for safer and more expressive
 * handling of such cases compared to using `null` or `undefined`. The `Option` type encapsulates the presence (`Some`)
 * or absence (`None`) of a value, providing a rich API for interacting with these states.
 *
 * ## Features
 *
 * - **Some**: Represents the presence of a value.
 * - **None**: Represents the absence of a value.
 * - **Safety**: Avoids the pitfalls of `null` and `undefined`, providing a safer alternative.
 * - **Functional**: Offers a functional approach to handling optional values, including map, filter, and fold operations.
 *
 * ## Usage Examples
 *
 * ### Creating an Option
 * ```typescript
 * import { Option } from './Option';
 *
 * // Create an Option with a value
 * const someValue = Option.Some(42);
 *
 * // Create an Option with no value
 * const noValue = Option.None;
 * ```
 *
 * ### Working with an Option
 * ```typescript
 * // Unwrapping a value with a default
 * const value = Option.Some(42).unwrapOr(100); // Returns 42
 * const defaultValue = Option.None.unwrapOr(100); // Returns 100
 *
 * // Mapping an Option
 * const stringValue = Option.Some(42).map(value => value.toString()); // Option.Some("42")
 * const noValueMap = Option.None.map(value => value.toString()); // Option.None
 *
 * // Using match for branching logic
 * const matchExample = Option.Some(42).match(
 *   value => `Value is ${value}`,
 *   () => 'No value'
 * ); // "Value is 42"
 * const matchNoneExample = Option.None.match(
 *   value => `Value is ${value}`,
 *   () => 'No value'
 * ); // "No value"
 * ```
 *
 * These examples illustrate basic usage of the `Option` type. The `Option` class provides a robust API for more complex
 * scenarios, enabling more expressive and safer code.
 * @module
 */

import { isDefined, raise } from "@oxi/core";

const TRUE = () => true;
const FALSE = () => false;
const IDENTITY = <T>(value: T) => value;
const NOOP = () => {};

/**
 * Represents an optional value: every `Option` is either `Some` and contains a value, or `None`, and does not.
 * `Option` types are very useful in situations where a value may or may not be present.
 *
 * @template T - The type of the value wrapped by the `Option`.
 */
export class Option<T> {
  #value?: T;

  /**
   * Constructor to create an `Option` instance. This is private to ensure `Option` instances are created through the `Some` or `None` static methods.
   * @private
   */
  private constructor(value?: T) {
    this.#value = value;
  }

  /**
   * Checks if a value is an `Option`. 
   * @param value - The value to check. 
   * @returns `true` if the value is an `Option`, otherwise `false`. 
   * ```ts
   * const isOption = Option.isOption(Option.Some(42)); // true
   * const isNotOption = Option.isOption(42); // false
   * ```
   * @since 0.2.0
   */
  static isOption(value: unknown): value is Option<unknown> {
    return value instanceof Option;
  }

  /**
   * Creates an `Option` with a value (equivalent to Rust's `Some`).
   *
   * @template T
   * @param {T} value - The value to wrap.
   * @returns {Option<T>} An `Option` containing the provided value.
   * @example
   * ```ts
   * const someValue = Option.Some(42);
   * ```
   */
  static Some<T>(value: T): Option<T> {
    return new Option(value);
  }

  /**
   * Represents an empty `Option` (equivalent to Rust's `None`).
   *
   * @type {Option<never>}
   * @example
   * ```ts
   * const noValue = Option.None;
   * ```
   */
  static None: Option<never> = new Option();

  /**
   * Creates an `Option` from a value that may be `null` or `undefined`.
   * If the value is `null` or `undefined`, it returns `None`, otherwise, it wraps the value in a `Some`.
   *
   * @template T The type of the value to wrap.
   * @param {T | null | undefined} value The value that may be `null` or `undefined`.
   * @returns {Option<T>} An `Option` containing the value if it is not `null` or `undefined`, otherwise `None`.
   * @example
   * ```typescript
   * const someOption = Option.from(42); // Option.Some(42)
   * const noneOption = Option.from(null); // Option.None
   * const anotherNone = Option.from(undefined); // Option.None
   * ```
   */
  static from<T>(value: T | null | undefined): Option<T> {
    return isDefined(value) ? Option.Some(value) : Option.None;
  }

  /**
   * Applies a function to the contained value if the `Option` is `Some`, or a different function if the `Option` is `None`.
   * This method allows branching logic based on the presence of a value.
   *
   * @template U The type of the return value of the `onSome` and `onNone` functions.
   * @param {(value: T) => U} onSome A function to apply to the contained value if the `Option` is `Some`.
   * @param {() => U} onNone A function to apply if the `Option` is `None`.
   * @returns {U} The result of `onSome` if the `Option` is `Some`, or the result of `onNone` if the `Option` is `None`.
   * @example
   * ```ts
   * const result = Option.Some(5).match(
   *   value => value * 2,
   *   () => 'no value',
   * );
   * // result is 10
   *
   * const noResult = Option.None.match(
   *   value => value * 2,
   *   () => 'no value',
   * );
   * // noResult is 'no value'
   * ```
   */
  match<U>(onSome: (value: T) => U, onNone: () => U): U {
    const value = this.#value;
    if (isDefined(value)) {
      return onSome(value);
    }
    return onNone();
  }

  /**
   * Checks if the `Option` is `Some`.
   *
   * @returns {boolean} `true` if the `Option` contains a value, otherwise `false`.
   * @example
   * ```ts
   * const hasValue = Option.Some(42).isSome(); // true
   * const noValue = Option.None.isSome(); // false
   * ```
   */
  isSome(): boolean {
    return this.match(TRUE, FALSE);
  }

  /**
   * Checks if the `Option` is `Some` and the contained value meets a predicate.
   *
   * @param {(value: T) => boolean} predicate A function to test the contained value.
   * @returns {boolean} `true` if the `Option` is `Some` and the predicate returns `true`, otherwise `false`.
   * @example
   * ```ts
   * const isEven = Option.Some(42).isSomeAnd(value => value % 2 === 0); // true
   * const isOdd = Option.Some(3).isSomeAnd(value => value % 2 === 0); // false
   * ```
   */
  isSomeAnd(predicate: (value: T) => boolean): boolean {
    return this.match(predicate, FALSE);
  }

  /**
   * Checks if the `Option` is `None`.
   *
   * @returns {boolean} `true` if the `Option` does not contain a value, otherwise `false`.
   * @example
   * ```ts
   * const hasValue = Option.Some(42).isNone(); // false
   * const noValue = Option.None.isNone(); // true
   * ```
   */
  isNone(): boolean {
    return this.match(FALSE, TRUE);
  }

  /**
   * Returns the contained value if the `Option` is `Some`, otherwise throws an error with the provided message.
   *
   * @param {string} message The error message to throw if the `Option` is `None`.
   * @returns {T} The contained value.
   * @throws Will throw an error with the provided message if the `Option` is `None`.
   * @example
   * ```ts
   * const value = Option.Some(42).expect("No value present"); // 42
   * const error = Option.None.expect("No value present"); // throws Error with message "No value present"
   * ```
   */
  expect(message: string): T {
    return this.match(IDENTITY, () => raise(message));
  }

  /**
   * Returns the contained value if the `Option` is `Some`, otherwise throws a default error.
   *
   * @returns {T} The contained value.
   * @throws Will throw an error if the `Option` is `None`.
   * @example
   * ```ts
   * const value = Option.Some(42).unwrap(); // 42
   * const error = Option.None.unwrap(); // throws Error
   * ```
   */
  unwrap(): T {
    return this.expect("called `Option.unwrap()` on a `None` value");
  }

  /**
   * Returns the contained value if the `Option` is `Some`, otherwise returns a provided default value.
   *
   * @param {T} defaultValue The value to return if the `Option` is `None`.
   * @returns {T} The contained value or the provided default.
   * @example
   * ```ts
   * const value = Option.Some(42).unwrapOr(100); // 42
   * const defaultValue = Option.None.unwrapOr(100); // 100
   * ```
   */
  unwrapOr(defaultValue: T): T {
    return this.match(IDENTITY, () => defaultValue);
  }

  /**
   * Returns the contained value if the `Option` is `Some`, otherwise calls a function to determine the default value.
   *
   * @param {() => T} onNone A function that returns the default value if the `Option` is `None`.
   * @returns {T} The contained value or the result of `onNone`.
   * @example
   * ```ts
   * const value = Option.Some(42).unwrapOrElse(() => 100); // 42
   * const defaultValue = Option.None.unwrapOrElse(() => 100); // 100
   * ```
   */
  unwrapOrElse(onNone: () => T): T {
    return this.match(IDENTITY, onNone);
  }

  /**
   * Transforms the `Option<T>` into `Option<U>` by applying a function to the contained value if the `Option` is `Some`.
   *
   * @template U The type of the value returned by the mapper function.
   * @param {(value: T) => U} mapper A function that transforms the contained value.
   * @returns {Option<U>} An `Option` containing the transformed value if the original `Option` was `Some`, otherwise `None`.
   * @example
   * ```ts
   * const stringValue = Option.Some(42).map(value => value.toString()); // Option.Some("42")
   * const noValue = Option.None.map(value => value.toString()); // Option.None
   * ```
   */
  map<U>(mapper: (value: T) => U): Option<U> {
    return this.match(
      (value) => Option.Some(mapper(value)),
      () => Option.None
    );
  }

  /**
   * Transforms the `Option<T>` into a value of type `U` by applying a function to the contained value if the `Option` is `Some`,
   * otherwise returns a provided default value.
   *
   * @template U The type of the return value of the mapper function or the default value.
   * @param {U} defaultValue The value to return if the `Option` is `None`.
   * @param {(value: T) => U} mapper A function that transforms the contained value.
   * @returns {U} The result of the mapper if the `Option` is `Some`, otherwise the default value.
   * @example
   * ```ts
   * const length = Option.Some("hello").mapOr(0, value => value.length); // 5
   * const defaultLength = Option.None.mapOr(0, value => value.length); // 0
   * ```
   */
  mapOr<U>(defaultValue: U, mapper: (value: T) => U): U {
    return this.match(mapper, () => defaultValue);
  }

  /**
   * Transforms the `Option<T>` into a value of type `U` by applying a function to the contained value if the `Option` is `Some`,
   * otherwise calls a function to determine the default value.
   *
   * @template U The type of the return value of the mapper function or the onNone function.
   * @param {() => U} onNone A function that returns the default value if the `Option` is `None`.
   * @param {(value: T) => U} mapper A function that transforms the contained value.
   * @returns {U} The result of the mapper if the `Option` is `Some`, otherwise the result of `onNone`.
   * @example
   * ```ts
   * const length = Option.Some("hello").mapOrElse(() => 0, value => value.length); // 5
   * const defaultLength = Option.None.mapOrElse(() => 0, value => value.length); // 0
   * ```
   */
  mapOrElse<U>(onNone: () => U, mapper: (value: T) => U): U {
    return this.match(mapper, onNone);
  }

  /**
   * Performs a side effect with the contained value if the `Option` is `Some`, otherwise does nothing.
   *
   * @param {(value: T) => void} onSome A function to execute with the contained value.
   * @returns {Option<T>} The original `Option`, unmodified.
   * @example
   * ```ts
   * Option.Some(42).inspect(value => console.log(`Value: ${value}`));
   * // logs "Value: 42"
   * Option.None.inspect(value => console.log(`Value: ${value}`));
   * // does nothing
   * ```
   */
  inspect(onSome: (value: T) => void): this {
    this.match(onSome, NOOP);
    return this;
  }

  /**
   * Returns `None` if the `Option` is `None`, otherwise returns `other`.
   *
   * @template U The type of the value in the `other` `Option`.
   * @param {Option<U>} other The `Option` to return if the original `Option` is `Some`.
   * @returns {Option<U>} `other` if the original `Option` is `Some`, otherwise `None`.
   * @example
   * ```ts
   * const option1 = Option.Some(42).and(Option.Some("hello")); // Option.Some("hello")
   * const option2 = Option.None.and(Option.Some("hello")); // Option.None
   * ```
   */
  and<U>(other: Option<U>): Option<U> {
    return this.match(
      () => other,
      () => Option.None
    );
  }

  /**
   * Returns `None` if the `Option` is `None`, otherwise calls `mapper` with the contained value and returns the result.
   *
   * @template U The type of the value returned by `mapper`.
   * @param {(value: T) => Option<U>} mapper A function that transforms the contained value into an `Option`.
   * @returns {Option<U>} The result of `mapper` if the original `Option` is `Some`, otherwise `None`.
   * @example
   * ```ts
   * const option = Option.Some(42).andThen(value => Option.Some(value.toString())); // Option.Some("42")
   * const noneOption = Option.None.andThen(value => Option.Some(value.toString())); // Option.None
   * ```
   */
  andThen<U>(mapper: (value: T) => Option<U>): Option<U> {
    return this.match(mapper, () => Option.None);
  }

  /**
   * Returns the `Option` itself if it is `Some` and the contained value satisfies the provided predicate, otherwise returns `None`.
   *
   * @param {(value: T) => boolean} predicate A function to test the contained value.
   * @returns {Option<T>} The original `Option` if it is `Some` and satisfies the predicate, otherwise `None`.
   * @example
   * ```ts
   * const option = Option.Some(42).filter(value => value % 2 === 0); // Option.Some(42)
   * const noneOption = Option.Some(42).filter(value => value % 2 !== 0); // Option.None
   * ```
   */
  filter(predicate: (value: T) => boolean): Option<T> {
    if (this.isSomeAnd(predicate)) {
      return this;
    }
    return Option.None;
  }

  /**
   * Returns the `Option` itself if it is `Some`, otherwise returns `other`.
   *
   * @param {Option<T>} other The `Option` to return if the original `Option` is `None`.
   * @returns {Option<T>} The original `Option` if it is `Some`, otherwise `other`.
   * @example
   * ```ts
   * const option = Option.None.or(Option.Some(42)); // Option.Some(42)
   * const someOption = Option.Some(99).or(Option.Some(42)); // Option.Some(99)
   * ```
   */
  or(other: Option<T>): Option<T> {
    return this.match(Option.Some, () => other);
  }

  /**
   * Returns the `Option` itself if it is `Some`, otherwise calls `onNone` and returns the result.
   *
   * @param {() => Option<T>} onNone A function to provide an `Option` if the original `Option` is `None`.
   * @returns {Option<T>} The original `Option` if it is `Some`, otherwise the result of `onNone`.
   * @example
   * ```ts
   * const option = Option.None.orElse(() => Option.Some(42)); // Option.Some(42)
   * const someOption = Option.Some(99).orElse(() => Option.Some(42)); // Option.Some(99)
   * ```
   */
  orElse(onNone: () => Option<T>): Option<T> {
    return this.match(Option.Some, onNone);
  }

  /**
   * Returns `Some` if exactly one of `this`, `other` is `Some`, otherwise returns `None`.
   *
   * @param {Option<T>} other The `Option` to compare with the original `Option`.
   * @returns {Option<T>} `Some` if exactly one of `this`, `other` is `Some`, otherwise `None`.
   * @example
   * ```ts
   * const option1 = Option.Some(42).xor(Option.None); // Option.Some(42)
   * const option2 = Option.None.xor(Option.Some(42)); // Option.Some(42)
   * const noneOption = Option.Some(42).xor(Option.Some(99)); // Option.None
   * ```
   */
  xor(other: Option<T>): Option<T> {
    if (this.isSome() && other.isNone()) {
      return this;
    }
    if (this.isNone() && other.isSome()) {
      return other;
    }
    return Option.None;
  }

  /**
   * Converts the `Option` to a JSON-friendly format. Returns the contained value if the `Option` is `Some`, otherwise `undefined`.
   * This method is particularly useful for serializing `Option` instances to JSON, where `None` is represented as `undefined`.
   *
   * @returns {T | undefined} The contained value if the `Option` is `Some`, otherwise `undefined`.
   * @example
   * ```typescript
   * const someOption = Option.Some(42);
   * console.log(JSON.stringify(someOption)); // 42
   *
   * const noneOption = Option.None;
   * console.log(JSON.stringify(noneOption)); // undefined
   * ```
   */
  toJSON(): T | undefined {
    return this.match(IDENTITY, () => undefined);
  }

  /**
   * Returns a string representation of the `Option`. If the `Option` is `Some`, it returns "Some(value)",
   * and if the `Option` is `None`, it returns "None".
   *
   * @returns {string} The string representation of the `Option`.
   * @example
   * ```typescript
   * const someOption = Option.Some(42);
   * console.log(someOption.toString()); // "Some(42)"
   *
   * const noneOption = Option.None;
   * console.log(noneOption.toString()); // "None"
   * ```
   */
  toString(): string {
    return this.match(
      (value) => `Some(${value})`,
      () => "None"
    );
  }
}

Object.freeze(Option.None);

/**
 * A convenience reference to the `Option.Some` method, allowing for the creation of `Some` instances to represent the presence of a value.
 * This function is used to encapsulate a value that is present, making the code more expressive and idiomatic when dealing with optional values.
 * @type {typeof Option.Some}
 * @example
 * ```ts
 * const maybeValue = Some(42);
 * console.log(maybeValue.toString()); // "Some(42)"
 * // Use `maybeValue` in contexts where the value may or may not be present, providing a safer alternative to null or undefined.
 * ```
 */
export const Some: typeof Option.Some = Option.Some;

/**
 * A convenience reference to the `Option.None` property, representing the absence of a value.
 * `None` is used to signify that an expected value is not present, offering a more descriptive and safer alternative to `null` or `undefined`.
 * @type {typeof Option.None}
 * @example
 * ```ts
 * const noValue = None;
 * console.log(noValue.toString()); // "None"
 * // Use `noValue` in contexts where there is explicitly no value, avoiding the pitfalls of `null` and `undefined`.
 * ```
 */
export const None: typeof Option.None = Option.None;
