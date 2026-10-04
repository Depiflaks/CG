import { EngineCycle } from "../animation/EngineCycle.ts";
import { colors } from "../graphics/colors.ts";
import { rotate } from "../graphics/geometry.ts";
import type { WebGLRenderer } from "../graphics/WebGLRenderer.ts";
import { layout } from "../layout.ts";
import type { EngineComponent } from "./EngineComponent.ts";

export class Flywheel implements EngineComponent {
  draw(renderer: WebGLRenderer, t: number): void {
    const { crankAngle } = new EngineCycle(t).sample();
    const center = layout.crankCenter;
    renderer.circle(center, 112, colors.metal);
    renderer.circle(center, 95, colors.cavity);
    for (let index = 0; index < 4; index += 1) {
      const angle = crankAngle + index * Math.PI / 2;
      renderer.line(center, rotate([360, 616], center, angle), colors.metal, 12);
    }
  }
}
