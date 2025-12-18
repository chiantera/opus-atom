
// This is a very simple test runner.
const describe = (description, fn) => {
  console.log(description);
  fn();
};

const it = (description, fn) => {
  try {
    fn();
    console.log(`  ✓ ${description}`);
  } catch (error) {
    console.error(`  ✗ ${description}`);
    console.error(error);
    process.exit(1);
  }
};

const expect = (actual) => ({
  toBe: (expected) => {
    if (actual !== expected) {
      throw new Error(`Expected ${actual} to be ${expected}`);
    }
  },
  toBeCloseTo: (expected, precision = 2) => {
    const pass = Math.abs(expected - actual) < (Math.pow(10, -precision) / 2);
    if (!pass) {
      throw new Error(`Expected ${actual} to be close to ${expected}`);
    }
  }
});

export { describe, it, expect };
