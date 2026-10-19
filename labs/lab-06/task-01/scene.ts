import { loadObj } from "./formats/loadObj.ts";
import type { ModelPart } from "./formats/types.ts";

const MODEL_DIRECTORY = `${import.meta.env.BASE_URL}lab-06/task-01/models/`;
const MODEL_FILES = ["room.obj", "desk.obj", "chair.obj", "sofa.obj", "bookcase.obj", "lamp.obj", "plant.obj", "fan.obj"];

export async function loadScene(signal: AbortSignal): Promise<ModelPart[]> {
  const directory = new URL(MODEL_DIRECTORY, window.location.href);
  const models = await Promise.all(MODEL_FILES.map((file) => loadObj(new URL(file, directory).href, signal)));
  return models.flat().map((part) => part.name === "fan_rotor"
    ? { ...part, rotation: { pivot: [-1.05, 2.02, -2.04], speed: Math.PI * 2 } }
    : part);
}
