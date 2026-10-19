export function createPanel(): HTMLElement {
  const panel = document.createElement("section");
  panel.className = "morph-panel";
  panel.setAttribute("aria-label", "Управление морфингом");
  panel.innerHTML = `
    <h1>Морфинг параболоидов</h1>
    <p>Эллиптический ⇄ Гиперболический</p>
    <p>z = x²/1.6² + y²/1.9² ⇄ z = x²/1.6² − y²/1.9²</p>
    <label>Морфинг: <output>0.0%</output>
      <input name="morph" type="range" min="0" max="1" step="0.001" value="0">
    </label>
    <div class="morph-actions">
      <button type="button" name="play" aria-pressed="true">Пауза</button>
      <label>Режим
        <select name="mode">
          <option value="solid">Заливка с освещением</option>
          <option value="wireframe">Каркас</option>
        </select>
      </label>
    </div>
    <p>Перетаскивание — вращение камеры · Колесо — масштаб</p>
    <a href="#/">Все задания</a>`;
  return panel;
}

export function getControls(panel: HTMLElement) {
  return {
    morph: requiredElement(panel, "input", HTMLInputElement),
    output: requiredElement(panel, "output", HTMLOutputElement),
    play: requiredElement(panel, "button", HTMLButtonElement),
    mode: requiredElement(panel, "select", HTMLSelectElement),
  };
}

function requiredElement<T extends Element>(parent: HTMLElement, selector: string,
  type: new () => T): T {
  const element = parent.querySelector(selector);
  if (!(element instanceof type)) throw new Error(`Не найден элемент ${selector}.`);
  return element;
}
