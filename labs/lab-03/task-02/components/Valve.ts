import { EngineCycle } from "../animation/EngineCycle.ts";
import { colors } from "../graphics/colors.ts";
import { orient, rectangle } from "@/src/common/graphics/geometry2D.ts";
import type { WebGLRenderer } from "../graphics/WebGLRenderer.ts";
import { valves, type ValveKind } from "../layout.ts";
import type { EngineComponent } from "./EngineComponent.ts";

export class Valve implements EngineComponent {
  constructor(private readonly kind: ValveKind) {}

  draw(renderer: WebGLRenderer, t: number): void {
    const { seat, axis } = valves[this.kind];
    const cycle = new EngineCycle(t).sample();
    const lift = this.kind === "intake" ? cycle.intakeLift : cycle.exhaustLift;
    renderer.shape(orient(rectangle(-4, -115 + lift, 8, 115), seat, axis), colors.metalLight);
    renderer.shape(orient(rectangle(-20, lift - 4, 40, 6), seat, axis), colors.metalLight);
  }
}
