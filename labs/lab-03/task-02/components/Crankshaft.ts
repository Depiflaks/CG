import type { CycleState } from "../animation/EngineCycle.ts";
import { colors } from "../graphics/colors.ts";
import type { WebGLRenderer } from "../graphics/WebGLRenderer.ts";
import { layout } from "../layout.ts";
import type { EngineComponent } from "./EngineComponent.ts";

export class Crankshaft implements EngineComponent {
  draw(renderer: WebGLRenderer, cycle: CycleState): void {
    const { crankPin } = cycle;
    const center = layout.crankCenter;
    renderer.line(center, crankPin, colors.outline, 34);
    renderer.line(center, crankPin, colors.metalLight, 30);
    renderer.circle(center, 24, colors.metalLight);
  }
}
