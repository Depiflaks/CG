import { Vector2D } from "@/src/common/graphics/Vector2D.ts";
import { createWebJLSurface } from "@/webJL/src/index.ts";

export function mount(container: HTMLElement): () => void {
  const surfaceHost = document.createElement("div");
  surfaceHost.className = "graphics-surface";

  container.append(surfaceHost);

  const surface = createWebJLSurface(surfaceHost);
  const vector = new Vector2D(3, 4);

  const draw = (): void => {
    surface.resize();

    const { canvas, context } = surface;

    const width = canvas.clientWidth;
    const height = canvas.clientHeight;

    const origin = new Vector2D(width / 2, height / 2);

    const length = Math.min(width, height) * 0.3;

    const direction = vector.normalize().scale(length);

    const end = origin.add(new Vector2D(direction.x, -direction.y));

    context.clearRect(0, 0, width, height);

    context.fillStyle = "#0f172a";
    context.fillRect(0, 0, width, height);

    context.strokeStyle = "#38bdf8";
    context.lineWidth = 4;
    context.lineCap = "round";

    context.beginPath();
    context.moveTo(origin.x, origin.y);
    context.lineTo(end.x, end.y);
    context.stroke();

    const arrowSize = 16;
    const angle = Math.atan2(end.y - origin.y, end.x - origin.x);

    context.fillStyle = "#38bdf8";

    context.beginPath();
    context.moveTo(end.x, end.y);

    context.lineTo(
      end.x - arrowSize * Math.cos(angle - Math.PI / 6),
      end.y - arrowSize * Math.sin(angle - Math.PI / 6),
    );

    context.lineTo(
      end.x - arrowSize * Math.cos(angle + Math.PI / 6),
      end.y - arrowSize * Math.sin(angle + Math.PI / 6),
    );

    context.closePath();
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
