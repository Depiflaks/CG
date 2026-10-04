export function createCanvas(): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.className = "graphics-canvas";
  canvas.style.touchAction = "none";
  canvas.setAttribute("aria-label", canvas.title);
  return canvas;
}

export function bindCanvasResize(canvas: HTMLCanvasElement, render: () => void): () => void {
  const resize = (): void => {
    const ratio = window.devicePixelRatio || 1;
    canvas.width = Math.max(1, Math.round(canvas.clientWidth * ratio));
    canvas.height = Math.max(1, Math.round(canvas.clientHeight * ratio));
    render();
  };
  window.addEventListener("resize", resize);
  resize();
  return (): void => {
    window.removeEventListener("resize", resize);
  };
}
