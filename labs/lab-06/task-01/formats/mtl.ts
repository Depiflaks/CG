import { parseNumber, parseRecords, parseRecordWithContext, parseVector, type RecordLine } from "./records.ts";
import { createDefaultMaterial, type Material } from "./types.ts";

const MAX_SHININESS = 1000;

function applyMaterialRecord(material: Material, { keyword, values }: RecordLine, url: string): void {
  switch (keyword) {
    case "Ka": material.ambient = parseVector(values); break;
    case "Kd": material.diffuse = parseVector(values); break;
    case "Ks": material.specular = parseVector(values); break;
    case "Ns": material.shininess = Math.max(0, Math.min(MAX_SHININESS, parseNumber(values[0]))); break;
    case "map_Kd": {
      const path = values.join(" ");
      if (!path || path.startsWith("-")) throw new Error("Ожидается map_Kd с путём без опций.");
      material.diffuseMap = new URL(path, url).href;
      break;
    }
  }
}

function createNamedMaterial(record: RecordLine, materials: Map<string, Material>): Material {
  const name = record.values.join(" ");
  if (!name) throw new Error("Отсутствует имя материала.");
  const material = createDefaultMaterial();
  materials.set(name, material);
  return material;
}

export function parseMtl(source: string, url: string): Map<string, Material> {
  const materials = new Map<string, Material>();
  let current: Material | undefined;
  for (const record of parseRecords(source)) {
    parseRecordWithContext(record, () => {
      if (record.keyword === "newmtl") current = createNamedMaterial(record, materials);
      else if (current) applyMaterialRecord(current, record, url);
    });
  }
  return materials;
}
