import { EngineCycle } from "../animation/EngineCycle.ts";
import { colors } from "../graphics/colors.ts";
import type { WebGLRenderer } from "../graphics/WebGLRenderer.ts";
import { layout } from "../layout.ts";
import type { EngineComponent } from "./EngineComponent.ts";

export class Crankshaft implements EngineComponent {
  draw(renderer: WebGLRenderer, t: number): void {
    const { crankPin } = new EngineCycle(t).sample();
    const center = layout.crankCenter;
    renderer.line(center, crankPin, colors.outline, 34);
    renderer.line(center, crankPin, colors.metalLight, 30);
    renderer.circle(center, 24, colors.metalLight);
  }
}
