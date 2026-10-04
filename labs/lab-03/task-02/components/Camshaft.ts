import { EngineCycle } from "../animation/EngineCycle.ts";
import { colors } from "../graphics/colors.ts";
import { along, orient, rectangle } from "@/src/common/graphics/geometry2D.ts";
import { Vector2 } from "@/src/common/graphics/vector2.ts";
import type { WebGLRenderer } from "../graphics/WebGLRenderer.ts";
import { valves, type ValveKind } from "../layout.ts";
import type { EngineComponent } from "./EngineComponent.ts";

export class Camshaft implements EngineComponent {
  constructor(private readonly kind: ValveKind) {}

  draw(renderer: WebGLRenderer, t: number): void {
    const { seat, axis, peak } = valves[this.kind];
    const { camAngle } = new EngineCycle(t).sample();
    const center = along(seat, axis, -137);
    const direction =
      Math.atan2(axis.y, axis.x) + camAngle - peak * Math.PI * 2;
    renderer.shape(
      orient(rectangle(-34, -36, 68, 101), center, axis),
      colors.metalLight,
    );
    renderer.shape(this.lobe(center, direction), colors.metal);
    renderer.circle(center, 8, colors.white);
  }

  private lobe(center: Vector2, direction: number): Vector2[] {
    return Array.from({ length: 32 }, (_, index): Vector2 => {
      const angle = (index * Math.PI) / 16;
      const delta = angle - direction;
      const lift =
        Math.cos(delta) > 0 ? Math.max(0, Math.cos(delta * 2)) ** 2 * 18 : 0;
      const radius = 22 + lift;
      return center.add(new Vector2(Math.cos(angle), Math.sin(angle)).scale(radius));
    });
  }
}
