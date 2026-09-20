export interface WebJLSurface {
  readonly canvas: HTMLCanvasElement;
  readonly context: CanvasRenderingContext2D;
  resize(): void;
  destroy(): void;
}

export function createWebJLSurface(container: HTMLElement): WebJLSurface {
  const canvas = document.createElement('canvas');
  canvas.className = 'graphics-canvas';
  canvas.setAttribute('aria-label', 'WebJL graphics surface');
  container.append(canvas);

  const context = canvas.getContext('2d');
  if (context === null) {
    canvas.remove();
    throw new Error('WebJL requires browser support for a 2D canvas context.');
  }

  const resize = (): void => {
    const bounds = canvas.getBoundingClientRect();
    const pixelRatio = window.devicePixelRatio;
    canvas.width = Math.max(1, Math.round(bounds.width * pixelRatio));
    canvas.height = Math.max(1, Math.round(bounds.height * pixelRatio));
    context.setTransform(pixelRatio, 0, 0, pixelRatio, 0, 0);
  };

  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  resize();

  return {
    canvas,
    context,
    resize,
    destroy(): void {
      observer.disconnect();
      canvas.remove();
    },
  };
}
