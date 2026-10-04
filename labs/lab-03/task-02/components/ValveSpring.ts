import { EngineCycle } from "../animation/EngineCycle.ts";
import { colors } from "../graphics/colors.ts";
import { orient } from "@/src/common/graphics/geometry2D.ts";
import { Vector2 } from "@/src/common/graphics/vector2.ts";
import type { WebGLRenderer } from "../graphics/WebGLRenderer.ts";
import { valves, type ValveKind } from "../layout.ts";
import type { EngineComponent } from "./EngineComponent.ts";

export class ValveSpring implements EngineComponent {
  constructor(private readonly kind: ValveKind) {}

  draw(renderer: WebGLRenderer, t: number): void {
    const { seat, axis } = valves[this.kind];
    const cycle = new EngineCycle(t).sample();
    const lift = this.kind === "intake" ? cycle.intakeLift : cycle.exhaustLift;
    const start = -102 + lift;
    const spring = Array.from({ length: 7 }, (_, index): Vector2 => new Vector2(
      index === 0 || index === 6 ? 0 : index % 2 === 0 ? -11 : 11,
      start + (-60 - start) * index / 6,
    ));
    renderer.polyline(orient(spring, seat, axis), colors.outline, 3);
  }
}
