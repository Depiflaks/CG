export type Vector3 = readonly [number, number, number];

export interface Face {
  readonly indices: readonly number[];
  readonly normal: Vector3;
  readonly color: Vector3;
}

export interface Polyhedron {
  readonly vertices: readonly Vector3[];
  readonly faces: readonly Face[];
  readonly edges: readonly (readonly [number, number])[];
}
