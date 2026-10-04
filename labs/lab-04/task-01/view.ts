import "./style.css";

const markup = `
  <canvas class="snub-canvas" tabindex="0" aria-label="Курносый додекаэдр. Вращайте мышью или стрелками, изменяйте масштаб колесом."></canvas>
  <section class="snub-panel" aria-label="Параметры визуализации">
    <a href="#/">← Все задания</a>
    <h1>Курносый додекаэдр</h1>
    <p>60 вершин · 150 рёбер · 92 грани</p>
    <p>80 треугольников и 12 пятиугольников</p>
    <label class="snub-opacity" for="snub-opacity">Непрозрачность <output for="snub-opacity">62%</output></label>
    <input id="snub-opacity" type="range" min="0" max="100" value="62" step="1">
    <label class="snub-lighting"><input type="checkbox" checked> Освещение</label>
    <button type="button">Сбросить камеру</button>
    <p class="snub-hint">Перетаскивание — вращение<br>Колесо — масштаб · Стрелки — вращение</p>
  </section>
  <p class="snub-status" role="status" hidden></p>
`;

export interface TaskView {
  readonly root: HTMLElement;
  readonly canvas: HTMLCanvasElement;
  readonly opacity: HTMLInputElement;
  readonly output: HTMLOutputElement;
  readonly lighting: HTMLInputElement;
  readonly reset: HTMLButtonElement;
  readonly status: HTMLParagraphElement;
}

function element<T extends Element>(root: HTMLElement, selector: string, type: new() => T): T {
  const result = root.querySelector(selector);
  if (!(result instanceof type)) throw new Error("Не найден элемент интерфейса.");
  return result;
}

export function createView(container: HTMLElement): TaskView {
  const root = document.createElement("div");
  root.className = "snub-task";
  root.innerHTML = markup;
  container.append(root);
  return {
    root,
    canvas: element(root, "canvas", HTMLCanvasElement),
    opacity: element(root, "input[type=range]", HTMLInputElement),
    output: element(root, "output", HTMLOutputElement),
    lighting: element(root, "input[type=checkbox]", HTMLInputElement),
    reset: element(root, "button", HTMLButtonElement),
    status: element(root, ".snub-status", HTMLParagraphElement),
  };
}

export function showStatus(view: TaskView, message: string): void {
  view.status.textContent = message;
  view.status.hidden = message.length === 0;
}
