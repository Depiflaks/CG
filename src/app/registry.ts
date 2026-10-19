import { mount as mountLab01Task01 } from "@/labs/lab-01/task-01/index.ts";
import { mount as mountLab02Task01 } from "@/labs/lab-02/task-01/index.ts";
import { mount as mountLab03Task01 } from "@/labs/lab-03/task-01/index.ts";
import { mount as mountLab03Task02 } from "@/labs/lab-03/task-02/index.ts";
import { mount as mountLab04Task01 } from "@/labs/lab-04/task-01/index.ts";
import { mount as mountLab04Task02 } from "@/labs/lab-04/task-02/index.ts";
import { mount as mountLab04Task03 } from "@/labs/lab-04/task-03/index.ts";
import { mount as mountLab05Task01 } from "@/labs/lab-05/task-01/index.ts";
import { mount as mountLab06Task01 } from "@/labs/lab-06/task-01/index.ts";
import { mount as mountLab07Task01 } from "@/labs/lab-07/task-01/index.ts";
import { mount as mountLab07Task02 } from "@/labs/lab-07/task-02/index.ts";
import { mount as mountLab07Task03 } from "@/labs/lab-07/task-03/index.ts";
import { mount as mountLab07Task04 } from "@/labs/lab-07/task-04/index.ts";
import { mount as mountLab08Task01 } from "@/labs/lab-08/task-01/index.ts";
import { mount as mountLab08Task02 } from "@/labs/lab-08/task-02/index.ts";
import { mount as mountLab08Task03 } from "@/labs/lab-08/task-03/index.ts";
import { mount as mountLab08Task04 } from "@/labs/lab-08/task-04/index.ts";
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
        name: "Task 3 — Лабиринт",
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
  {
    id: "lab-06",
    name: "Lab 6",
    tasks: [
      {
        id: "task-01",
        name: "Task 1 — Комната из OBJ-моделей",
        mount: mountLab06Task01,
      },
    ],
  },
  {
    id: "lab-07",
    name: "Lab 7",
    tasks: [
      {
        id: "task-01",
        name: "Task 1 — Канабола",
        mount: mountLab07Task01,
      },
      {
        id: "task-02",
        name: "Task 2 — Пятиконечная звезда",
        mount: mountLab07Task02,
      },
      {
        id: "task-03",
        name: "Task 3 — Морфинг параболоидов",
        mount: mountLab07Task03,
      },
      {
        id: "task-04",
        name: "Task 4 — Волны",
        mount: mountLab07Task04,
      },
    ],
  },
  {
    id: "lab-08",
    name: "Lab 8",
    tasks: [
      {
        id: "task-01",
        name: "Task 1 — Освещение Фонга",
        mount: mountLab08Task01,
      },
      {
        id: "task-02",
        name: "Task 2 — Тени",
        mount: mountLab08Task02,
      },
      {
        id: "task-03",
        name: "Task 3 — Эллиптические параболоиды",
        mount: mountLab08Task03,
      },
      {
        id: "task-04",
        name: "Task 4 — Гиперболический параболоид",
        mount: mountLab08Task04,
      },
    ],
  },
];
