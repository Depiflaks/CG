export const MAZE_SIZE = 33;
export const BLOCK_SIZE = 2;
export const WALL_HEIGHT = 2.8;
export const DIRECTIONS = [[1, 0], [0, 1], [-1, 0], [0, -1]] as const;
type Cell = readonly [number, number];

export class Maze {
  private readonly cells = new Uint8Array(MAZE_SIZE * MAZE_SIZE);

  constructor() {
    this.carve();
  }

  isOpen(x: number, z: number): boolean {
    if (x < 0 || z < 0 || x >= MAZE_SIZE || z >= MAZE_SIZE) return false;
    return this.cells[z * MAZE_SIZE + x] === 1;
  }

  canOccupy(x: number, z: number, radius: number): boolean {
    const minX = Math.floor((x - radius) / BLOCK_SIZE);
    const maxX = Math.floor((x + radius) / BLOCK_SIZE);
    const minZ = Math.floor((z - radius) / BLOCK_SIZE);
    const maxZ = Math.floor((z + radius) / BLOCK_SIZE);
    for (let row = minZ; row <= maxZ; row++) {
      for (let column = minX; column <= maxX; column++) {
        if (this.isOpen(column, row)) continue;
        const closestX = Math.max(column * BLOCK_SIZE, Math.min(x, (column + 1) * BLOCK_SIZE));
        const closestZ = Math.max(row * BLOCK_SIZE, Math.min(z, (row + 1) * BLOCK_SIZE));
        if ((x - closestX) ** 2 + (z - closestZ) ** 2 <= radius ** 2) return false;
      }
    }
    return true;
  }

  private carve(): void {
    const stack: Cell[] = [[1, 1]];
    this.cells[MAZE_SIZE + 1] = 1;
    while (stack.length > 0) {
      const current = stack[stack.length - 1];
      if (current === undefined) break;
      const [x, z] = current;
      const neighbors = DIRECTIONS.map(([dx, dz]): Cell => [x + dx * 2, z + dz * 2])
        .filter(([nx, nz]) => nx > 0 && nz > 0 && nx < MAZE_SIZE - 1
          && nz < MAZE_SIZE - 1 && !this.isOpen(nx, nz));
      const next = neighbors[Math.floor(Math.random() * neighbors.length)];
      if (next === undefined) {
        stack.pop();
        continue;
      }
      const [nx, nz] = next;
      this.cells[((z + nz) / 2) * MAZE_SIZE + (x + nx) / 2] = 1;
      this.cells[nz * MAZE_SIZE + nx] = 1;
      stack.push(next);
    }
  }
}
