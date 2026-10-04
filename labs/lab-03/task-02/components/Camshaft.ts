import { EngineCycle } from "../animation/EngineCycle.ts";
import { colors } from "../graphics/colors.ts";
import { along, orient, rectangle } from "@/src/common/graphics/geometry2D.ts";
import type { Point } from "@/src/common/graphics/types.ts";
import type { WebGLRenderer } from "../graphics/WebGLRenderer.ts";
import { valves, type ValveKind } from "../layout.ts";
import type { EngineComponent } from "./EngineComponent.ts";

export class Camshaft implements EngineComponent {
  constructor(private readonly kind: ValveKind) {}

  draw(renderer: WebGLRenderer, t: number): void {
    const { seat, axis, peak } = valves[this.kind];
    const { camAngle } = new EngineCycle(t).sample();
    const center = along(seat, axis, -137);
    const direction = Math.atan2(axis[1], axis[0]) + camAngle - peak * Math.PI * 2;
    renderer.shape(orient(rectangle(-34, -36, 68, 101), center, axis), colors.metalLight);
    renderer.shape(this.lobe(center, direction), colors.metal);
    renderer.circle(center, 8, colors.white);
  }

  private lobe(center: Point, direction: number): Point[] {
    return Array.from({ length: 32 }, (_, index): Point => {
      const angle = index * Math.PI / 16;
      const delta = angle - direction;
      const lift = Math.cos(delta) > 0 ? Math.max(0, Math.cos(delta * 2)) ** 2 * 18 : 0;
      const radius = 22 + lift;
      return [center[0] + Math.cos(angle) * radius, center[1] + Math.sin(angle) * radius];
    });
  }
}
