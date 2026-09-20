import { Library, Board } from "@/labs/lab-02/task-01/model";
import configData from "./dict.json";

export function mount(container: HTMLElement): () => void {
  const canvas = document.createElement("canvas");
  container.append(canvas);

  const library = new Library(configData);
  const board = new Board(library);

  return (): void => {
    canvas.remove();
  };
}
