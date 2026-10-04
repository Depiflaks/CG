export function at<T>(values: readonly T[], index: number): T {
  const value = values[index];
  if (value === undefined) throw new Error("Индекс вершины вне границ контура.");
  return value;
}

export function requireResource<T>(resource: T | null, message: string): T {
  if (resource === null) throw new Error(message);
  return resource;
}
