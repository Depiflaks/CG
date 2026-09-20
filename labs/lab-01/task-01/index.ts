import { Vector2D } from '../../../src/common/graphics/Vector2D.ts';
import { createWebJLSurface } from '../../../webJL/src/index.ts';

export function mount(container: HTMLElement): () => void {
  const heading = document.createElement('h1');
  heading.textContent = 'Lab 1 · Task 1 — Vector';

  const description = document.createElement('p');
  const vector = new Vector2D(3, 4);
  description.textContent = `The shared vector (${String(vector.x)}, ${String(vector.y)}) has length ${String(vector.magnitude())}.`;

  const surfaceHost = document.createElement('div');
  surfaceHost.className = 'graphics-surface';
  container.append(heading, description, surfaceHost);

  const surface = createWebJLSurface(surfaceHost);

  const draw = (): void => {
    surface.resize();
    const { canvas, context } = surface;
    const width = canvas.clientWidth;
    const height = canvas.clientHeight;
    const origin = new Vector2D(width / 2, height / 2);
    const direction = vector.normalize().scale(Math.min(width, height) * 0.3);
    const end = origin.add(new Vector2D(direction.x, -direction.y));

    context.clearRect(0, 0, width, height);
    context.fillStyle = '#0f172a';
    context.fillRect(0, 0, width, height);
    context.strokeStyle = '#38bdf8';
    context.lineWidth = 4;
    context.beginPath();
    context.moveTo(origin.x, origin.y);
    context.lineTo(end.x, end.y);
    context.stroke();
    context.fillStyle = '#f8fafc';
    context.beginPath();
    context.arc(end.x, end.y, 6, 0, Math.PI * 2);
    context.fill();
  };

  const observer = new ResizeObserver(draw);
  observer.observe(surface.canvas);
  draw();

  return (): void => {
    observer.disconnect();
    surface.destroy();
  };
}
