import { box, type Material } from "./primitives.ts";
import { desktop } from "./desktop.ts";

const WOOD: Material = { color: [0.91, 0.77, 0.59], textured: true };
const DARK_WOOD: Material = { color: [0.65, 0.49, 0.34], textured: true };
const METAL: Material = { color: [0.63, 0.66, 0.69], textured: false };
const SHADOW: Material = { color: [0.12, 0.09, 0.07], textured: false };
const DRAWER_CENTER_X = 1.31;
const DRAWER_BODY_Z = -0.065;
const DRAWER_HEIGHTS = [0.39, 0.85, 1.31] as const;
const HANDLE_THICKNESS = 0.045;
const HANDLE_MOUNT_Z = 0.674;
const HANDLE_HEIGHT_OFFSET = 0.1;
const SHELF_SIDE_POSITIONS = [-1.62, -0.95] as const;
const SHELF_HEIGHTS = [0.16, 0.8, 1.43] as const;
const SHELF_CENTER_X = -1.285;
const SHELF_CENTER_Z = -0.06;
const SHELF_WIDTH = 0.6;
const CABINET_DEPTH = 1.35;
const SUPPORT_HEIGHT = 1.79;
const SUPPORT_Z = -0.44;
const SUPPORT_SIZE = [0.07, 0.26, 0.62] as const;
const BRACE_POSITIONS = [-0.86, 0.86] as const;

function handle(data: number[], y: number): void {
  box(data, [1.17, y, HANDLE_MOUNT_Z], [HANDLE_THICKNESS, HANDLE_THICKNESS, 0.09], METAL);
  box(data, [1.45, y, HANDLE_MOUNT_Z], [HANDLE_THICKNESS, HANDLE_THICKNESS, 0.09], METAL);
  box(data, [DRAWER_CENTER_X, y, 0.715], [0.325, HANDLE_THICKNESS, HANDLE_THICKNESS], METAL);
}

function drawers(data: number[]): void {
  box(data, [DRAWER_CENTER_X, 0.86, DRAWER_BODY_Z], [0.81, 1.46, CABINET_DEPTH], DARK_WOOD);
  box(data, [DRAWER_CENTER_X, 0.84, 0.615], [0.72, 1.36, 0.02], SHADOW);
  for (const y of DRAWER_HEIGHTS) {
    box(data, [DRAWER_CENTER_X, y, 0.64], [0.7, 0.435, 0.06], WOOD);
    handle(data, y + HANDLE_HEIGHT_OFFSET);
  }
  box(data, [DRAWER_CENTER_X, 0.09, DRAWER_BODY_Z], [0.74, 0.14, 1.25], SHADOW);
}

function shelves(data: number[]): void {
  for (const x of SHELF_SIDE_POSITIONS) {
    box(data, [x, 0.83, SHELF_CENTER_Z], [0.075, 1.57, CABINET_DEPTH], WOOD);
  }
  box(data, [SHELF_CENTER_X, 0.81, -0.7], [SHELF_WIDTH, 1.38, 0.055], DARK_WOOD);
  for (const y of SHELF_HEIGHTS) {
    box(data, [SHELF_CENTER_X, y, SHELF_CENTER_Z], [SHELF_WIDTH, 0.065, 1.32], WOOD);
  }
}

function accessories(data: number[]): void {
  box(data, [-0.83, SUPPORT_HEIGHT, SUPPORT_Z], [...SUPPORT_SIZE], DARK_WOOD);
  box(data, [0.0, SUPPORT_HEIGHT, SUPPORT_Z], [...SUPPORT_SIZE], DARK_WOOD);
  box(data, [-0.415, 1.965, SUPPORT_Z], [1.16, 0.09, 0.85], WOOD);
  desktop(data, 1.37, 0.83, 0.43, 0.16, WOOD);
  for (const x of BRACE_POSITIONS) {
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
  return new Float32Array(data);
}
