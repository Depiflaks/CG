import type { Player } from "./Player.ts";

const KEYS = new Set([
  "KeyW", "KeyA", "KeyS", "KeyD", "KeyQ", "KeyE",
  "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight",
]);

export class KeyboardControls {
  private readonly pressed = new Set<string>();
  private pointer: readonly [number, number] | null = null;
  private lookX = 0;
  private lookY = 0;

  constructor(canvas: HTMLCanvasElement, signal: AbortSignal) {
    canvas.addEventListener("keydown", this.keyDown, { signal });
    window.addEventListener("keyup", this.keyUp, { signal });
    window.addEventListener("blur", this.clear, { signal });
    canvas.addEventListener("blur", this.clear, { signal });
    document.addEventListener("visibilitychange", this.clear, { signal });
    canvas.addEventListener("pointerdown", (event) => {
      if (event.button !== 0) return;
      canvas.focus({ preventScroll: true });
      canvas.setPointerCapture(event.pointerId);
      this.pointer = [event.clientX, event.clientY];
    }, { signal });
    canvas.addEventListener("pointermove", this.pointerMove, { signal });
    canvas.addEventListener("pointerup", this.releasePointer, { signal });
    canvas.addEventListener("lostpointercapture", this.releasePointer, { signal });
    canvas.addEventListener("pointercancel", this.releasePointer, { signal });
  }

  update(player: Player, seconds: number): void {
    player.look(this.lookX, this.lookY);
    this.lookX = 0;
    this.lookY = 0;
    const forward = this.active("KeyW", "ArrowUp") - this.active("KeyS", "ArrowDown");
    const sideways = this.active("KeyD") - this.active("KeyA");
    const turn = this.active("KeyE", "ArrowRight") - this.active("KeyQ", "ArrowLeft");
    player.update(forward, sideways, turn, seconds);
  }

  clear = (): void => {
    this.pressed.clear();
    this.releasePointer();
    this.lookX = 0;
    this.lookY = 0;
  };

  private readonly releasePointer = (): void => {
    this.pointer = null;
  };

  private readonly pointerMove = (event: PointerEvent): void => {
    if (this.pointer === null) return;
    this.lookX += event.clientX - this.pointer[0];
    this.lookY += event.clientY - this.pointer[1];
    this.pointer = [event.clientX, event.clientY];
  };

  private active(...codes: string[]): number {
    return Number(codes.some((code) => this.pressed.has(code)));
  }

  private readonly keyDown = (event: KeyboardEvent): void => {
    if (!KEYS.has(event.code) || event.ctrlKey || event.altKey || event.metaKey) return;
    event.preventDefault();
    this.pressed.add(event.code);
  };

  private readonly keyUp = (event: KeyboardEvent): void => {
    this.pressed.delete(event.code);
  };
}
