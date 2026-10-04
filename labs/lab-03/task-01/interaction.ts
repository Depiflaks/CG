import { Vector2 } from "@/src/common/graphics/vector2.ts";
import type { ControlPoints } from "./bezier.ts";

function pointerPosition(canvas: HTMLCanvasElement, event: PointerEvent): Vector2 {
  const rect = canvas.getBoundingClientRect();
  return new Vector2(
    Math.max(-1, Math.min(1, (event.clientX - rect.left) / rect.width * 2 - 1)),
    Math.max(-1, Math.min(1, 1 - (event.clientY - rect.top) / rect.height * 2)),
  );
}

export function bindInteraction(canvas: HTMLCanvasElement, points: ControlPoints, render: () => void): () => void {
  let selected = -1;
  let pointerId: number | undefined;
  const onDown = (event: PointerEvent): void => {
    if (event.button !== 0 || pointerId !== undefined) return;
    const position = pointerPosition(canvas, event);
    const rect = canvas.getBoundingClientRect();
    selected = points.findIndex((point) => Math.hypot(
      (point.x - position.x) * rect.width / 2,
      (point.y - position.y) * rect.height / 2,
    ) <= 14);
    if (selected < 0) return;
    pointerId = event.pointerId;
    canvas.setPointerCapture(event.pointerId);
    canvas.style.cursor = "grabbing";
  };
  const onMove = (event: PointerEvent): void => {
    if (event.pointerId !== pointerId) return;
    points[selected] = pointerPosition(canvas, event);
    render();
  };
  const onUp = (event: PointerEvent): void => {
    if (event.pointerId !== pointerId) return;
    pointerId = undefined;
    selected = -1;
    canvas.style.cursor = "default";
    if (canvas.hasPointerCapture(event.pointerId)) canvas.releasePointerCapture(event.pointerId);
  };
  return registerEvents(canvas, onDown, onMove, onUp);
}

function registerEvents(canvas: HTMLCanvasElement, onDown: (event: PointerEvent) => void,
  onMove: (event: PointerEvent) => void, onUp: (event: PointerEvent) => void): () => void {
  canvas.addEventListener("pointerdown", onDown);
  canvas.addEventListener("pointermove", onMove);
  canvas.addEventListener("pointerup", onUp);
  canvas.addEventListener("pointercancel", onUp);
  canvas.addEventListener("lostpointercapture", onUp);
  return (): void => {
    canvas.removeEventListener("pointerdown", onDown);
    canvas.removeEventListener("pointermove", onMove);
    canvas.removeEventListener("pointerup", onUp);
    canvas.removeEventListener("pointercancel", onUp);
    canvas.removeEventListener("lostpointercapture", onUp);
  };
}
