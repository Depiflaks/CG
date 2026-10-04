export function at<T>(values: readonly T[], index: number): T {
  const value = values[index];
  if (value === undefined) throw new Error("Array index is out of bounds.");
  return value;
}
