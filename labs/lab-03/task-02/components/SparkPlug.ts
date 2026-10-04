import { EngineCycle } from "../animation/EngineCycle.ts";
import { colors } from "../graphics/colors.ts";
import { rectangle } from "@/src/common/graphics/geometry2D.ts";
import type { WebGLRenderer } from "../graphics/WebGLRenderer.ts";
import type { EngineComponent } from "./EngineComponent.ts";

export class SparkPlug implements EngineComponent {
  draw(renderer: WebGLRenderer, t: number): void {
    renderer.shape(rectangle(355, 166, 10, 24), colors.metal);
    renderer.shape(rectangle(349, 190, 22, 43), colors.white);
    renderer.shape(rectangle(347, 233, 26, 39), colors.metal);
    renderer.line([360, 272], [360, 284], colors.outline, 3);
    renderer.polyline([[371, 269], [371, 289], [363, 289]], colors.outline, 3);
    if (new EngineCycle(t).sample().ignition > 0) {
      renderer.polyline([[360, 282], [363, 284], [359, 286], [364, 289]], colors.spark, 3);
    }
  }
}
