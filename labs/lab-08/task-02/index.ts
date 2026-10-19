import { mountRayTracing } from "@/src/common/raytracing/index.ts";

export function mount(container: HTMLElement): () => void {
  return mountRayTracing(container, true);
}
