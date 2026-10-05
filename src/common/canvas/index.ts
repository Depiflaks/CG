export interface CanvasOptions {
  readonly className?: string;
  readonly label?: string;
  readonly tabIndex?: number;
  readonly touchAction?: string;
}

export function createCanvas(options: CanvasOptions = {}): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.className = options.className ?? "graphics-canvas";
  canvas.style.touchAction = options.touchAction ?? "none";
  canvas.setAttribute("aria-label", options.label ?? "");
  if (options.tabIndex !== undefined) canvas.tabIndex = options.tabIndex;
  return canvas;
}

export function resizeCanvas(canvas: HTMLCanvasElement, maxPixelRatio = Infinity): void {
  const bounds = canvas.getBoundingClientRect();
  const ratio = Math.min(window.devicePixelRatio || 1, maxPixelRatio);
  const width = Math.max(1, Math.round(bounds.width * ratio));
  const height = Math.max(1, Math.round(bounds.height * ratio));
  if (canvas.width === width && canvas.height === height) return;
  canvas.width = width;
  canvas.height = height;
}

export function bindCanvasResize(canvas: HTMLCanvasElement, render: () => void, maxPixelRatio = Infinity): () => void {
  const resize = (): void => {
    resizeCanvas(canvas, maxPixelRatio);
    render();
  };
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  window.addEventListener("resize", resize);
  resize();
  return (): void => {
    observer.disconnect();
    window.removeEventListener("resize", resize);
  };
}

// TODO: сделать так, чтобы пропорции не искажались