import { colors } from "../graphics/colors.ts";
import { rectangle } from "@/src/common/graphics/geometry2D.ts";
import type { Point } from "@/src/common/graphics/types.ts";
import type { WebGLRenderer } from "../graphics/WebGLRenderer.ts";
import { layout } from "../layout.ts";
import type { EngineComponent } from "./EngineComponent.ts";

export class EngineBlock implements EngineComponent {
  draw(renderer: WebGLRenderer): void {
    this.drawCrankcase(renderer);
    this.drawCylinder(renderer);
    this.drawPorts(renderer);
  }

  private drawCrankcase(renderer: WebGLRenderer): void {
    renderer.shape(rectangle(220, 570, 280, 260), colors.metal);
    renderer.shape(rectangle(240, 590, 240, 220), colors.cavity);
    renderer.fill(rectangle(276, 565, 168, 40), colors.cavity);
  }

  private drawCylinder(renderer: WebGLRenderer): void {
    renderer.shape([[239, 266], [303, 246], [417, 246], [481, 266],
      [481, 337], [239, 337]], colors.metal);
    renderer.shape([...layout.roof, [444, 576], [276, 576]], colors.chamber);
    renderer.shape(rectangle(239, 337, 37, 247), colors.metal);
    renderer.shape(rectangle(444, 337, 37, 247), colors.metal);
  }

  private drawPorts(renderer: WebGLRenderer): void {
    const outer: Point[] = [[141, 220], [220, 220], [318, 278],
      [287, 310], [209, 263], [141, 263]];
    const inner: Point[] = [[141, 231], [216, 231], [306, 283],
      [289, 298], [212, 252], [141, 252]];
    renderer.shape(outer, colors.metal);
    renderer.fill(inner, colors.chamber);
    renderer.shape(this.mirror(outer), colors.metal);
    renderer.fill(this.mirror(inner), colors.chamber);
  }

  private mirror(points: readonly Point[]): Point[] {
    return points.map(([x, y]): Point => [720 - x, y]);
  }
}
