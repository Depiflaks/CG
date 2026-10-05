import { Vector2 } from "@/src/common/graphics/vector2.ts";

export type ValveKind = "intake" | "exhaust";

export interface ValveLayout {
  readonly seat: Vector2;
  readonly axis: Vector2;
}

// cranc - коленвал - маленькая палка
// rod - шатун - большая палка
// valve - клапан
export const layout = {
  crankCenter: new Vector2(360, 710),
  crankRadius: 70,
  rodLength: 258,
  pistonTopOffset: 34,
  roof: [new Vector2(276, 312), new Vector2(330, 281), new Vector2(344, 276),
    new Vector2(376, 276), new Vector2(390, 281), new Vector2(444, 312)],
};

export const valves: Record<ValveKind, ValveLayout> = {
  intake: { seat: new Vector2(303, 296), axis: new Vector2(0.5, Math.sqrt(3) / 2)},
  exhaust: { seat: new Vector2(417, 296), axis: new Vector2(-0.5, Math.sqrt(3) / 2)},
};
