import type { Vector3 } from "@/src/common/graphics/types.ts";

export interface RecordLine {
  keyword: string;
  values: string[];
  line: number;
}

export function parseRecords(source: string): RecordLine[] {
  let pending = "";
  let line = 1;
  return source.split(/\r?\n/).flatMap((text, index) => {
    if (!pending) line = index + 1;
    const content = text.replace(/#.*/, "").trimEnd();
    const continues = content.endsWith("\\");
    pending += continues ? `${content.slice(0, -1)} ` : content;
    if (continues) return [];
    const tokens = pending.trim().split(/\s+/);
    pending = "";
    const keyword = tokens.shift();
    return keyword ? [{ keyword, values: tokens, line }] : [];
  });
}

export function parseNumber(value: string | undefined): number {
  if (value === undefined || value === "") throw new Error("Отсутствует числовое значение.");
  const number = Number(value);
  if (!Number.isFinite(number)) throw new Error(`Некорректное число: ${value}`);
  return number;
}

export function parseVector(values: readonly string[]): Vector3 {
  return [parseNumber(values[0]), parseNumber(values[1]), parseNumber(values[2])];
}

export function parseRecordWithContext(record: RecordLine, apply: () => void): void {
  try {
    apply();
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    throw new Error(`Строка ${String(record.line)} (${record.keyword}): ${message}`);
  }
}
