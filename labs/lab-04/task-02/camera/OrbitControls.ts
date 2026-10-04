import { OrbitCamera } from "./OrbitCamera.ts";

export class OrbitControls {
  private pointer: number | null = null;
  private x = 0;
  private y = 0;

  constructor(private readonly canvas: HTMLCanvasElement, private readonly camera: OrbitCamera,
    private readonly redraw: () => void, signal: AbortSignal) {
    canvas.addEventListener("pointerdown", this.start, { signal });
    canvas.addEventListener("pointermove", this.move, { signal });
    canvas.addEventListener("pointerup", this.end, { signal });
    canvas.addEventListener("pointercancel", this.end, { signal });
    canvas.addEventListener("lostpointercapture", this.end, { signal });
    canvas.addEventListener("wheel", this.wheel, { signal, passive: false });
    canvas.addEventListener("keydown", this.keydown, { signal });
  }

  private readonly start = (event: PointerEvent): void => {
    if (event.button !== 0 || this.pointer !== null) return;
    this.pointer = event.pointerId;
    this.x = event.clientX;
    this.y = event.clientY;
    this.canvas.setPointerCapture(event.pointerId);
    this.canvas.focus({ preventScroll: true });
  };

  private readonly move = (event: PointerEvent): void => {
    if (event.pointerId !== this.pointer) return;
    this.camera.rotate(event.clientX - this.x, event.clientY - this.y);
    this.x = event.clientX;
    this.y = event.clientY;
    this.redraw();
  };

  private readonly end = (event: PointerEvent): void => {
    if (event.pointerId !== this.pointer) return;
    this.pointer = null;
    if (this.canvas.hasPointerCapture(event.pointerId)) this.canvas.releasePointerCapture(event.pointerId);
  };

  private readonly wheel = (event: WheelEvent): void => {
    event.preventDefault();
    const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? this.canvas.clientHeight : 1;
    this.camera.zoom(Math.max(-300, Math.min(300, event.deltaY * unit)));
    this.redraw();
  };

  private readonly keydown = (event: KeyboardEvent): void => {
    const motions: Record<string, readonly [number, number]> = {
      ArrowLeft: [-12, 0], ArrowRight: [12, 0], ArrowUp: [0, -12], ArrowDown: [0, 12],
    };
    const motion = motions[event.key];
    if (motion === undefined) return;
    event.preventDefault();
    this.camera.rotate(...motion);
    this.redraw();
  };
}
