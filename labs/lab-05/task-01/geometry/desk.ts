import { box, type Material } from "./primitives.ts";
import { desktop } from "./desktop.ts";

const WOOD: Material = { color: [0.91, 0.77, 0.59], textured: true };
const DARK_WOOD: Material = { color: [0.65, 0.49, 0.34], textured: true };
const METAL: Material = { color: [0.63, 0.66, 0.69], textured: false };
const SHADOW: Material = { color: [0.12, 0.09, 0.07], textured: false };

function handle(data: number[], y: number): void {
  box(data, [1.17, y, 0.674], [0.045, 0.045, 0.09], METAL);
  box(data, [1.45, y, 0.674], [0.045, 0.045, 0.09], METAL);
  box(data, [1.31, y, 0.715], [0.325, 0.045, 0.045], METAL);
}

function drawers(data: number[]): void {
  box(data, [1.31, 0.86, -0.065], [0.81, 1.46, 1.35], DARK_WOOD);
  box(data, [1.31, 0.84, 0.615], [0.72, 1.36, 0.02], SHADOW);
  for (const y of [0.39, 0.85, 1.31]) {
    box(data, [1.31, y, 0.64], [0.70, 0.435, 0.06], WOOD);
    handle(data, y + 0.10);
  }
  box(data, [1.31, 0.09, -0.065], [0.74, 0.14, 1.25], SHADOW);
}

function shelves(data: number[]): void {
  for (const x of [-1.62, -0.95]) {
    box(data, [x, 0.83, -0.06], [0.075, 1.57, 1.35], WOOD);
  }
  box(data, [-1.285, 0.81, -0.7], [0.6, 1.38, 0.055], DARK_WOOD);
  for (const y of [0.16, 0.80, 1.43]) {
    box(data, [-1.285, y, -0.06], [0.6, 0.065, 1.32], WOOD);
  }
}

function accessories(data: number[]): void {
  box(data, [-0.83, 1.79, -0.44], [0.07, 0.26, 0.62], DARK_WOOD);
  box(data, [0.0, 1.79, -0.44], [0.07, 0.26, 0.62], DARK_WOOD);
  box(data, [-0.415, 1.965, -0.44], [1.16, 0.09, 0.85], WOOD);
  desktop(data, 1.37, 0.83, 0.43, 0.16, WOOD);
  for (const x of [-0.86, 0.86]) {
    box(data, [x, 1.39, -0.02], [0.025, 0.06, 0.84], METAL);
  }
  box(data, [0, 1.14, -0.69], [1.84, 0.5, 0.065], DARK_WOOD);
}

export function createDesk(): Float32Array {
  const data: number[] = [];
  desktop(data, 1.66, 1.8, 0.85, 0.34, WOOD);
  drawers(data);
  shelves(data);
  accessories(data);
  box(data, [0, -0.045, 0], [200, 0.08, 200], { color: [0.82, 0.81, 0.77], textured: false });
  return new Float32Array(data);
}
