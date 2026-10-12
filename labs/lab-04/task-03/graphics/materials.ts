import { requireResource } from "@/src/common/webgl/index.ts";

export const TEXTURE_SIZE = 256;
type Painter = (context: CanvasRenderingContext2D) => void;

function canvas(background: string): CanvasRenderingContext2D {
  const image = document.createElement("canvas");
  image.width = TEXTURE_SIZE;
  image.height = TEXTURE_SIZE;
  const context = requireResource(image.getContext("2d"));
  context.fillStyle = background;
  context.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
  return context;
}

function noise(context: CanvasRenderingContext2D): void {
  for (let index = 0; index < 5000; index++) {
    const x = (index * 71 + index ** 2 * 13) % TEXTURE_SIZE;
    const y = (index * 137 + Math.floor(index / 7) * 31) % TEXTURE_SIZE;
    context.fillStyle = index % 2 === 0 ? "#ffffff12" : "#00000012";
    context.fillRect(x, y, 1 + index % 3, 1);
  }
}

function brick(context: CanvasRenderingContext2D): void {
  for (let index = 0; index < 40; index++) {
    const row = Math.floor(index / 5);
    const x = (index % 5) * 64 - (row % 2) * 32;
    context.fillStyle = `hsl(${String(12 + index % 9)} 48% ${String(38 + index % 7)}%)`;
    context.fillRect(x + 2, row * 32 + 2, 60, 28);
    context.fillStyle = "#ffc8a333";
    context.fillRect(x + 3, row * 32 + 3, 58, 2);
  }
}

function stone(context: CanvasRenderingContext2D): void {
  for (let index = 0; index < 20; index++) {
    const row = Math.floor(index / 5);
    const x = (index % 5) * 64 - (row % 2) * 32;
    context.fillStyle = `hsl(210 8% ${String(38 + index * 7 % 17)}%)`;
    context.fillRect(x + 2, row * 64 + 2, 60, 60);
    context.strokeStyle = "#d8e1e633";
    context.strokeRect(x + 5, row * 64 + 5, 54, 54);
  }
}

function wood(context: CanvasRenderingContext2D): void {
  for (let x = 0; x < TEXTURE_SIZE; x++) {
    const lightness = 28 + 7 * Math.sin(x * 0.21) + 4 * Math.sin(x * 1.7);
    context.fillStyle = `hsl(30 48% ${String(lightness)}%)`;
    context.fillRect(x, 0, 1, TEXTURE_SIZE);
  }
  context.fillStyle = "#26190d";
  for (let x = 0; x < TEXTURE_SIZE; x += 64) context.fillRect(x, 0, 3, TEXTURE_SIZE);
  context.strokeStyle = "#36220c88";
  context.beginPath();
  context.ellipse(96, 128, 9, 38, 0, 0, Math.PI * 2);
  context.stroke();
}

function metal(context: CanvasRenderingContext2D): void {
  const gradient = context.createLinearGradient(0, 0, 0, TEXTURE_SIZE);
  gradient.addColorStop(0, "#4a6674");
  gradient.addColorStop(0.5, "#a7bdc5");
  gradient.addColorStop(1, "#4a6674");
  context.fillStyle = gradient;
  context.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
  context.strokeStyle = "#253d48";
  context.strokeRect(2, 2, 252, 252);
  for (const [x, y] of [[12, 12], [244, 12], [12, 244], [244, 244]]) {
    if (x === undefined || y === undefined) continue;
    context.fillStyle = "#233a46";
    context.beginPath();
    context.arc(x, y, 4, 0, Math.PI * 2);
    context.fill();
  }
}

function tile(context: CanvasRenderingContext2D): void {
  for (let index = 0; index < 16; index++) {
    const x = (index % 4) * 64;
    const y = Math.floor(index / 4) * 64;
    context.fillStyle = (index + Math.floor(index / 4)) % 2 ? "#328f92" : "#bbddd3";
    context.fillRect(x + 2, y + 2, 60, 60);
    context.fillStyle = "#ffffff44";
    context.fillRect(x + 3, y + 3, 58, 3);
  }
}

function sandstone(context: CanvasRenderingContext2D): void {
  for (let y = 0; y < TEXTURE_SIZE; y++) {
    const lightness = 61 + 5 * Math.sin(y * 0.18) + 3 * Math.sin(y * 0.6);
    context.fillStyle = `hsl(39 48% ${String(lightness)}%)`;
    context.fillRect(0, y, TEXTURE_SIZE, 1);
  }
  context.fillStyle = "#785934";
  for (let index = 0; index < 8; index++) {
    const row = Math.floor(index / 2);
    context.fillRect(0, row * 64, TEXTURE_SIZE, 3);
    context.fillRect((index % 2) * 128 + (row % 2) * 64, row * 64, 3, 64);
  }
}

function floor(context: CanvasRenderingContext2D): void {
  for (let index = 0; index < 16; index++) {
    context.fillStyle = `hsl(35 12% ${String(29 + index * 3 % 6)}%)`;
    context.fillRect((index % 4) * 64 + 1, Math.floor(index / 4) * 64 + 1, 62, 62);
  }
}

function cloud(context: CanvasRenderingContext2D, x: number, y: number, size: number): void {
  const gradient = context.createRadialGradient(x, y, 0, x, y, size);
  gradient.addColorStop(0, "#ffffffc0");
  gradient.addColorStop(0.55, "#ffffff75");
  gradient.addColorStop(1, "#ffffff00");
  context.fillStyle = gradient;
  context.fillRect(x - size, y - size, size * 2, size * 2);
}

function sky(context: CanvasRenderingContext2D): void {
  const gradient = context.createLinearGradient(0, 0, 0, TEXTURE_SIZE);
  gradient.addColorStop(0, "#24549a");
  gradient.addColorStop(0.5, "#a6c2dc");
  gradient.addColorStop(1, "#a6c2dc");
  context.fillStyle = gradient;
  context.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
  for (let index = 0; index < 24; index++) {
    const x = index * 73 % TEXTURE_SIZE;
    const y = 32 + index * 19 % 64;
    const size = 12 + index % 14;
    for (const shift of [-TEXTURE_SIZE, 0, TEXTURE_SIZE]) cloud(context, x + shift, y, size);
  }
}

export function createMaterials(): HTMLCanvasElement[] {
  const painters: readonly Painter[] = [brick, stone, wood, metal, tile, sandstone, floor, sky];
  return painters.map((paint, index) => {
    const context = canvas(index === 4 ? "#244d4d" : "#443d35");
    paint(context);
    if (index !== 7) noise(context);
    return context.canvas;
  });
}

export function createShadowMap(): HTMLCanvasElement {
  const context = canvas("white");
  const floorShadow = context.createLinearGradient(0, 0, 0, TEXTURE_SIZE);
  floorShadow.addColorStop(0, "#ffffff");
  floorShadow.addColorStop(0.55, "#f4f4f4");
  floorShadow.addColorStop(1, "#777777");
  context.fillStyle = floorShadow;
  context.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
  const cornerShadow = context.createLinearGradient(0, 0, TEXTURE_SIZE, 0);
  cornerShadow.addColorStop(0, "#00000040");
  cornerShadow.addColorStop(0.18, "#00000000");
  cornerShadow.addColorStop(0.82, "#00000000");
  cornerShadow.addColorStop(1, "#00000040");
  context.fillStyle = cornerShadow;
  context.fillRect(0, 0, TEXTURE_SIZE, TEXTURE_SIZE);
  return context.canvas;
}
