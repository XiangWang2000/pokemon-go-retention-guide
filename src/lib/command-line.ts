export function readIntegerFlag(args: readonly string[], flag: string, fallback: number) {
  const index = args.indexOf(flag);
  if (index === -1) return fallback;

  const rawValue = args[index + 1];
  if (!rawValue || rawValue.startsWith("--")) {
    throw new Error(`Missing value for ${flag}.`);
  }

  const value = Number(rawValue);
  if (!Number.isInteger(value)) {
    throw new Error(`Invalid integer for ${flag}: ${rawValue}.`);
  }
  return value;
}
