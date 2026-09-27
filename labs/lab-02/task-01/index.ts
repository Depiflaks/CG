import * as model from "@/labs/lab-02/task-01/model";
import * as view from "./view";
import configData from "./data/dict.json";
import { HtmlCanvas } from "./canvas";

export function mount(container: HTMLElement): () => void {
  const canvas = document.createElement("canvas");
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
  container.append(canvas);

  const modelLibrary = new model.Library(configData);
  const modelBoard = new model.Board(modelLibrary);
  const viewLibrary = new view.Library(modelLibrary);
  const viewBoard = new view.Board(viewLibrary, modelBoard);

  const toBoardPointerEvent = (e: MouseEvent): view.BoardPointerEvent => {
    const rect = canvas.getBoundingClientRect();
    return {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top,
      canvasWidth: canvas.width,
      canvasHeight: canvas.height,
    };
  };
  
  const getHTMLCanvas = (): HtmlCanvas => {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return ;
    }
    return new HtmlCanvas(ctx);
  }

  const handleMouseDown = (e: MouseEvent) => {
    cvs = getHTMLCanvas()
    viewBoard.onMouseDown(cvs, toBoardPointerEvent(e));
  };
  const handleMouseMove = (e: MouseEvent) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    const cvs = new HtmlCanvas(ctx);
    viewBoard.onMouseMove(cvs, toBoardPointerEvent(e));
  };
  const handleMouseUp = (e: MouseEvent) => {
    const ctx = canvas.getContext("2d");
    if (!ctx) {
      return;
    }
    const cvs = new HtmlCanvas(ctx);
    viewBoard.onMouseUp(cvs, toBoardPointerEvent(e));
  };

  canvas.addEventListener("mousedown", handleMouseDown);
  window.addEventListener("mousemove", handleMouseMove);
  window.addEventListener("mouseup", handleMouseUp);

  let animationFrameId: number;

  const render = (): void => {
    const ctx = canvas.getContext("2d");
    if (ctx) {
      const cvs = new HtmlCanvas(ctx);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      viewBoard.Draw(cvs);
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
