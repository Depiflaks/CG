import { appendFace, type VertexTables } from "./faces.ts";
import { parseNumber, parseRecords, parseRecordWithContext, parseVector, type RecordLine } from "./records.ts";
import { DEFAULT_MATERIAL_NAME, type ObjDocument } from "./types.ts";

interface ParserState {
  tables: VertexTables;
  libraries: string[];
  parts: Map<string, number[]>;
  material: string;
}

function appendMaterialFace(state: ParserState, values: string[]): void {
  let vertices = state.parts.get(state.material);
  if (!vertices) {
    vertices = [];
    state.parts.set(state.material, vertices);
  }
  appendFace(vertices, values, state.tables);
}

function applyRecord(state: ParserState, { keyword, values }: RecordLine): void {
  switch (keyword) {
    case "v": state.tables.positions.push(parseVector(values)); break;
    case "vn": state.tables.normals.push(parseVector(values)); break;
    case "vt": state.tables.coordinates.push([parseNumber(values[0]), parseNumber(values[1] ?? "0")]); break;
    case "mtllib": state.libraries.push(...values); break;
    case "usemtl": state.material = values.join(" ") || DEFAULT_MATERIAL_NAME; break;
    case "f": appendMaterialFace(state, values); break;
  }
}

export function parseObj(source: string): ObjDocument {
  const state: ParserState = {
    tables: { positions: [], normals: [], coordinates: [] },
    libraries: [], parts: new Map(), material: DEFAULT_MATERIAL_NAME,
  };
  for (const record of parseRecords(source)) {
    parseRecordWithContext(record, () => { applyRecord(state, record); });
  }
  if (state.parts.size === 0) throw new Error("OBJ не содержит полигональных граней.");
  return {
    libraries: [...new Set(state.libraries)],
    parts: [...state.parts].map(([material, vertices]) => ({ material, vertices: new Float32Array(vertices) })),
  };
}
