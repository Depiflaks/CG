export function mount(container: HTMLElement): () => void {
  const surfaceHost = document.createElement("div");
  surfaceHost.className = "graphics-surface";

  container.append(surfaceHost);

  return (): void => {
    console.log(123);
  };
}
