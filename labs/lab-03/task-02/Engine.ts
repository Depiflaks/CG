import { Camshaft } from "./components/Camshaft.ts";
import { Combustion } from "./components/Combustion.ts";
import { ConnectingRod } from "./components/ConnectingRod.ts";
import { Crankshaft } from "./components/Crankshaft.ts";
import { EngineBlock } from "./components/EngineBlock.ts";
import type { EngineComponent } from "./components/EngineComponent.ts";
import { Flywheel } from "./components/Flywheel.ts";
import { Piston } from "./components/Piston.ts";
import { SparkPlug } from "./components/SparkPlug.ts";
import { Valve } from "./components/Valve.ts";
import { ValveSpring } from "./components/ValveSpring.ts";
import type { WebGLRenderer } from "./graphics/WebGLRenderer.ts";

export class Engine {
  private readonly components: readonly EngineComponent[] = [
    new EngineBlock(), new Flywheel(), new Crankshaft(), new ConnectingRod(),
    new Piston(), new Camshaft("intake"), new Camshaft("exhaust"),
    new Valve("intake"), new Valve("exhaust"),
    new ValveSpring("intake"), new ValveSpring("exhaust"),
    new Combustion(), new SparkPlug(),
  ];

  draw(renderer: WebGLRenderer, t: number): void {
    renderer.begin();
    for (const component of this.components) component.draw(renderer, t);
    renderer.end();
  }
}
