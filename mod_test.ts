import { isDefined } from "@oxi/core";
import {
  assert,
  assertEquals,
  assertFalse,
  assertThrows,
} from "https://deno.land/std@0.218.0/assert/mod.ts";
import { Option } from "./mod.ts";

function assertSome<T>(
  option: Option<T>,
  value?: T
): asserts option is Option<T> {
  assert(option.isSome(), "expected Some, got None");
  if (isDefined(value)) {
    assertEquals(option.unwrap(), value);
  }
}

function assertNone<T>(option: Option<T>): asserts option is Option<T> {
  assertFalse(option.isSome(), "expected None, got Some");
}

const some = (value = 10): Option<number> => Option.Some(value);
const none = (): Option<number> => Option.None;

Deno.test("Option#Some", () => {
  const option = some();
  assertSome(option, 10);
});

Deno.test("Option#None", () => {
  const option = none();
  assertNone(option);
});

Deno.test("Option#from", () => {
  let option = Option.from<number>(1);
  assertSome(option, 1);
  option = Option.from<number>(null);
  assertNone(option);
  option = Option.from<number>(undefined);
  assertNone(option);
});

Deno.test("Option.match", () => {
  let result = some().match(
    (value) => value + 1,
    () => 0
  );
  assertEquals(result, 11);
  result = none().match(
    (value) => value + 1,
    () => 0
  );
  assertEquals(result, 0);
});

Deno.test("Option.isSome", () => {
  assert(some().isSome());
  assertFalse(none().isSome());
});

Deno.test("Option.isSomeAnd", () => {
  assert(some().isSomeAnd((v) => v === 10));
  assertFalse(some().isSomeAnd((v) => v === 11));
  assertFalse(none().isSomeAnd((v) => v === 10));
});

Deno.test("Option.isNone", () => {
  assertFalse(some().isNone());
  assert(none().isNone());
});

Deno.test("Option.expect", () => {
  assertEquals(some().expect("value is not defined"), 10);
  assertThrows(
    () => none().expect("value is not defined"),
    Error,
    "value is not defined"
  );
});

Deno.test("Option.unwrap", () => {
  assertEquals(some().unwrap(), 10);
  assertThrows(
    () => none().unwrap(),
    Error,
    "called `Option.unwrap()` on a `None` value"
  );
});

Deno.test("Option.unwrapOr", () => {
  assertEquals(some().unwrapOr(0), 10);
  assertEquals(none().unwrapOr(0), 0);
});

Deno.test("Option.unwrapOrElse", () => {
  assertEquals(
    some().unwrapOrElse(() => 0),
    10
  );
  assertEquals(
    none().unwrapOrElse(() => 0),
    0
  );
});

Deno.test("Option.map", () => {
  let option = some().map((v) => v + 1);
  assertSome(option, 11);
  option = none().map((v) => v + 1);
  assertNone(option);
});

Deno.test("Option.mapOr", () => {
  assertEquals(
    some().mapOr(0, (v) => v + 1),
    11
  );
  assertEquals(
    none().mapOr(0, (v) => v + 1),
    0
  );
});

Deno.test("Option.mapOrElse", () => {
  assertEquals(
    some().mapOrElse(
      () => 0,
      (v) => v + 1
    ),
    11
  );
  assertEquals(
    none().mapOrElse(
      () => 0,
      (v) => v + 1
    ),
    0
  );
});

Deno.test("Option.inspect", () => {
  let value = 0;
  some().inspect((v) => (value = v));
  assertEquals(value, 10);
  value = 0;
  none().inspect((v) => (value = v));
  assertEquals(value, 0);
});

Deno.test("Option.and", () => {
  let option = some().and(some(20));
  assertSome(option, 20);
  option = some().and(none());
  assertNone(option);
  option = none().and(some());
  assertNone(option);
  option = none().and(none());
  assertNone(option);
});

Deno.test("Option.andThen", () => {
  let option = some().andThen((v) => some(v + 1));
  assertSome(option, 11);
  option = some().andThen(() => none());
  assertNone(option);
  option = none().andThen((v) => some(v + 1));
  assertNone(option);
  option = none().andThen(() => none());
  assertNone(option);
});

Deno.test("Option.filter", () => {
  let option = some().filter((v) => v === 10);
  assertSome(option, 10);
  option = some().filter((v) => v === 11);
  assertNone(option);
  option = none().filter((v) => v === 10);
  assertNone(option);
});

Deno.test("Option.or", () => {
  let option = some().or(some(20));
  assertSome(option, 10);
  option = some().or(none());
  assertSome(option, 10);
  option = none().or(some(20));
  assertSome(option, 20);
  option = none().or(none());
  assertNone(option);
});

Deno.test("Option.orElse", () => {
  let option = some().orElse(() => some(20));
  assertSome(option, 10);
  option = some().orElse(() => none());
  assertSome(option, 10);
  option = none().orElse(() => some(20));
  assertSome(option, 20);
  option = none().orElse(() => none());
  assertNone(option);
});

Deno.test("Option.xor", () => {
  let option = some().xor(some(20));
  assertNone(option);
  option = some().xor(none());
  assertSome(option, 10);
  option = none().xor(some(20));
  assertSome(option, 20);
  option = none().xor(none());
  assertNone(option);
});

Deno.test("Option.toJSON", () => {
  assertEquals(some().toJSON(), 10);
  assertEquals(none().toJSON(), undefined);
});

Deno.test("Option.toString", () => {
  assertEquals(some().toString(), "Some(10)");
  assertEquals(none().toString(), "None");
});
