import type { LabDefinition, TaskDefinition, UnmountTask } from "@/src/app/types.ts";

function taskHash(lab: LabDefinition, task: TaskDefinition): string {
  return `#/${lab.id}/${task.id}`;
}

function findSelectedTask(
  labs: readonly LabDefinition[],
): TaskDefinition | undefined {
  const match = /^#\/([^/]+)\/([^/]+)$/.exec(window.location.hash);

  if (match === null) {
    return undefined;
  }

  const [, labId, taskId] = match;

  return labs
    .find((lab) => lab.id === labId)
    ?.tasks.find((task) => task.id === taskId);
}

function renderNavigation(
  container: HTMLElement,
  labs: readonly LabDefinition[],
): void {
  const title = document.createElement("a");
  title.href = "#/";
  title.textContent = "Computer Graphics";
  container.append(title);

  const tree = document.createElement("ul");

  for (const lab of labs) {
    const labItem = document.createElement("li");

    const labName = document.createElement("span");
    labName.textContent = lab.name;
    labItem.append(labName);

    const tasks = document.createElement("ul");

    for (const task of lab.tasks) {
      const taskItem = document.createElement("li");

      const link = document.createElement("a");
      link.href = taskHash(lab, task);
      link.textContent = task.name;

      taskItem.append(link);
      tasks.append(taskItem);
    }

    labItem.append(tasks);
    tree.append(labItem);
  }

  container.append(tree);
}

export function startApp(
  root: HTMLElement,
  labs: readonly LabDefinition[],
): UnmountTask {
  let unmountTask: UnmountTask | undefined;

  const render = (): void => {
    unmountTask?.();
    unmountTask = undefined;

    root.replaceChildren();

    const task = findSelectedTask(labs);

    if (task === undefined) {
      root.classList.remove("task-mode");
      renderNavigation(root, labs);
      return;
    }

    root.classList.add("task-mode");

    const cleanup = task.mount(root);

    if (cleanup !== undefined) {
      unmountTask = cleanup;
    }
  };

  window.addEventListener("hashchange", render);
  render();

  return (): void => {
    window.removeEventListener("hashchange", render);
    unmountTask?.();
    root.replaceChildren();
    root.classList.remove("task-mode");
  };
}
