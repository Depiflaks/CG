export function createMorphInput(): HTMLInputElement {
  const input = document.createElement("input");
  input.name = "morph";
  input.type = "range";
  input.min = "0";
  input.max = "1";
  input.step = "0.001";
  input.value = "0";
  return input;
}
