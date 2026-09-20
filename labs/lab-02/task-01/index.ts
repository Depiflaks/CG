import { createWebJLSurface } from "@/webJL/src/index.ts";

export function mount(container: HTMLElement): () => void {
  const surfaceHost = document.createElement("div");
  surfaceHost.className = "graphics-surface";

  container.append(surfaceHost);

  const surface = createWebJLSurface(surfaceHost);

  return (): void => {
    surface.destroy();
  };
}
