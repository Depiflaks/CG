import { mount as mountLab01Task01 } from "@/labs/lab-01/task-01/index.ts";
import { mount as mountLab02Task01 } from "@/labs/lab-02/task-01/index.ts";
import { mount as mountLab03Task01 } from "@/labs/lab-03/task-01/index.ts";
import { mount as mountLab03Task02 } from "@/labs/lab-03/task-02/index.ts";
import { mount as mountLab04Task01 } from "@/labs/lab-04/task-01/index.ts";
import { mount as mountLab04Task02 } from "@/labs/lab-04/task-02/index.ts";
import { mount as mountLab04Task03 } from "@/labs/lab-04/task-03/index.ts";
import { mount as mountLab05Task01 } from "@/labs/lab-05/task-01/index.ts";
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
        id: "task-01",
        name: "Task 1 — alchemy",
        mount: mountLab02Task01,
      },
    ],
  },
  {
    id: "lab-03",
    name: "Lab 3",
    tasks: [
      {
        id: "task-01",
        name: "Task 1.8 — bezier",
        mount: mountLab03Task01,
      },
      {
        id: "task-02",
        name: "Task 2.3 — engine",
        mount: mountLab03Task02,
      },
    ],
  },
  {
    id: "lab-04",
    name: "Lab 4",
    tasks: [
      {
        id: "task-01",
        name: "Task 1 — Курносый додекаэдр",
        mount: mountLab04Task01,
      },
      {
        id: "task-02",
        name: "Task 2 — Гиперболический параболоид",
        mount: mountLab04Task02,
      },
      {
        id: "task-03",
        name: "Task 3 — Прогулка по лабиринту",
        mount: mountLab04Task03,
      },
    ],
  },
  {
    id: "lab-05",
    name: "Lab 5",
    tasks: [
      {
        id: "task-01",
        name: "Task 1 — Компьютерный стол",
        mount: mountLab05Task01,
      },
    ],
  },
];
