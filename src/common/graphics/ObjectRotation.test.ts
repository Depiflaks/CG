import assert from "node:assert/strict";
import { test } from "node:test";
import { ObjectRotation } from "./ObjectRotation.ts";
import { viewMatrix } from "./matrices.ts";
import type { Vector3 } from "./types.ts";

const TOLERANCE = 0.00001;
const AXES: Vector3[] = [[1, 0, 0], [0, 1, 0], [0, 0, 1]];
const EYE: Vector3 = [3, -5, 4];
const UP: Vector3 = [0, 0, 1];

function transform(matrix: Float32Array, point: Vector3, w = 0): Vector3 {
  const row = (index: number): number => point.reduce((sum, value, column) =>
    sum + (matrix[column * 4 + index] ?? 0) * value, (matrix[12 + index] ?? 0) * w);
  return [row(0), row(1), row(2)];
}

function assertClose(actual: ArrayLike<number>, expected: ArrayLike<number>): void {
  assert.equal(actual.length, expected.length);
  Array.from(actual).forEach((value, index) => {
    assert.ok(Math.abs(value - (expected[index] ?? 0)) < TOLERANCE,
      `${String(index)}: ${String(value)} != ${String(expected[index])}`);
  });
}

void test("Vertical drag stays around screen horizontal axis after horizontal and mixed turns", () => {
  const rotation = new ObjectRotation(EYE, [0, 0, 0], UP);
  const view = viewMatrix(EYE, [0, 0, 0], UP);
  rotation.rotate(Math.PI / 2 / 0.008, 0);
  rotation.rotate(37, -81);
  const before = rotation.modelMatrix();
  rotation.rotate(0, 25);
  for (const axis of AXES) {
    const [x, y, z] = transform(view, transform(before, axis));
    const actual = transform(view, transform(rotation.modelMatrix(), axis));
    assertClose(actual, [x, Math.cos(0.2) * y - Math.sin(0.2) * z,
      Math.sin(0.2) * y + Math.cos(0.2) * z]);
  }
});

void test("Horizontal drag stays around screen vertical axis after vertical and mixed turns", () => {
  const rotation = new ObjectRotation(EYE, [0, 0, 0], UP);
  const view = viewMatrix(EYE, [0, 0, 0], UP);
  rotation.rotate(0, Math.PI / 2 / 0.008);
  rotation.rotate(-63, 41);
  const before = rotation.modelMatrix();
  rotation.rotate(25, 0);
  for (const axis of AXES) {
    const [x, y, z] = transform(view, transform(before, axis));
    const actual = transform(view, transform(rotation.modelMatrix(), axis));
    assertClose(actual, [Math.cos(0.2) * x + Math.sin(0.2) * z, y,
      -Math.sin(0.2) * x + Math.cos(0.2) * z]);
  }
});

void test("Repeated rotations preserve distances, angles, pivot and scale", () => {
  const rotation = new ObjectRotation(EYE, [0, 0, 0], UP);
  for (let index = 0; index < 10000; index++) rotation.rotate(Math.sin(index) * 10, Math.cos(index) * 10);
  const center: Vector3 = [2, -3, 4];
  const matrix = rotation.modelMatrix(center, 2);
  assertClose(transform(matrix, center, 1), center);
  const axes = AXES.map((axis) => transform(matrix, axis));
  axes.forEach((axis) => { assertClose([Math.hypot(...axis)], [2]); });
  const [x, y, z] = axes;
  assert.ok(x && y && z);
  for (const [a, b] of [[x, y], [y, z], [z, x]] as [Vector3, Vector3][]) {
    assertClose([a.reduce((sum, value, index) => sum + value * (b[index] ?? 0), 0)], [0]);
  }
});

void test("Zero drag, reverse drag and reset preserve the initial orientation", () => {
  const rotation = new ObjectRotation();
  const initial = rotation.modelMatrix();
  rotation.rotate(0, 0);
  assertClose(rotation.modelMatrix(), initial);
  rotation.rotate(43, -27);
  rotation.rotate(-43, 27);
  assertClose(rotation.modelMatrix(), initial);
  rotation.rotate(90, 70);
  rotation.reset();
  assertClose(rotation.modelMatrix(), initial);
});
