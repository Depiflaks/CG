import * as model from "@/labs/lab-02/task-01/model";
import * as view from "./view";
import configData from "./data/dict.json";

export function mount(container: HTMLElement): () => void {
  const canvas = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  container.append(canvas);

  const modelLibrary = new model.Library(configData);
  const modelBoard = new model.Board(modelLibrary);
  const viewLibrary = new view.Library(modelLibrary);
  const viewBoard = new view.Board(viewLibrary, modelBoard);

  const handleMouseDown = (e: MouseEvent) => {
    viewBoard.onMouseDown(e);
  };
  const handleMouseMove = (e: MouseEvent) => {
    viewBoard.onMouseMove(e);
  };
  const handleMouseUp = (e: MouseEvent) => {
    viewBoard.onMouseUp(e);
  };

  canvas.addEventListener("mousedown", handleMouseDown);
  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", handleMouseUp);

  let animationFrameId: number;

  const render = (): void => {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      viewBoard.Draw(ctx);
    }

    animationFrameId = requestAnimationFrame(render);
  };

  render();

  return (): void => {
    cancelAnimationFrame(animationFrameId);
    canvas.removeEventListener("mousedown", handleMouseDown);
    window.removeEventListener("mousemove", handleMouseMove);
    window.removeEventListener("mouseup", handleMouseUp);
    canvas.remove();
  };
}
