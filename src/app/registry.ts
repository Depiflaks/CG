import { mount as mountLab01Task01 } from "@/labs/lab-01/task-01/index.ts";
import type { LabDefinition } from "@/src/app/types.ts";

export const labs: readonly LabDefinition[] = [
  {
    id: "lab-01",
    name: "Lab 1",
    tasks: [
      {
        id: "task-01",
        name: "Task 1 — Vector",
        mount: mountLab01Task01,
      },
    ],
  },
  {
    id: "lab-02",
    name: "Lab 2",
    tasks: [
      {
        id: "task-02",
        name: "Task 1 — alchemy",
        mount: mountLab01Task01,
      },
    ],
  },
];
