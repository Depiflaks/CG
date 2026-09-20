import type { LabDefinition, TaskDefinition, UnmountTask } from './types.ts';

function taskHash(lab: LabDefinition, task: TaskDefinition): string {
  return `#/${lab.id}/${task.id}`;
}

function findSelectedTask(labs: readonly LabDefinition[]): TaskDefinition | undefined {
  const match = /^#\/([^/]+)\/([^/]+)$/.exec(window.location.hash);
  if (match === null) {
    return undefined;
  }

  const [, labId, taskId] = match;
  return labs.find((lab) => lab.id === labId)?.tasks.find((task) => task.id === taskId);
}

function renderNavigation(container: HTMLElement, labs: readonly LabDefinition[]): void {
  const title = document.createElement('a');
  title.className = 'site-title';
  title.href = '#/';
  title.textContent = 'Computer Graphics';
  container.append(title);

  const tree = document.createElement('ul');
  tree.className = 'lab-tree';

  for (const lab of labs) {
    const labItem = document.createElement('li');
    const labName = document.createElement('span');
    labName.className = 'lab-name';
    labName.textContent = lab.name;
    labItem.append(labName);

    const tasks = document.createElement('ul');
    for (const task of lab.tasks) {
      const item = document.createElement('li');
      const link = document.createElement('a');
      link.href = taskHash(lab, task);
      link.textContent = task.name;
      item.append(link);
      tasks.append(item);
    }

    labItem.append(tasks);
    tree.append(labItem);
  }

  container.append(tree);
}

export function startApp(root: HTMLElement, labs: readonly LabDefinition[]): UnmountTask {
  const shell = document.createElement('div');
  shell.className = 'app-shell';

  const navigation = document.createElement('nav');
  navigation.className = 'navigation';
  navigation.setAttribute('aria-label', 'Laboratory tasks');

  const content = document.createElement('main');
  content.className = 'task-content';

  renderNavigation(navigation, labs);
  shell.append(navigation, content);
  root.append(shell);

  let unmountTask: UnmountTask | undefined;

  const renderRoute = (): void => {
    unmountTask?.();
    unmountTask = undefined;
    content.replaceChildren();

    const task = findSelectedTask(labs);
    if (task === undefined) {
      const heading = document.createElement('h1');
      heading.textContent = 'Computer Graphics';
      const message = document.createElement('p');
      message.textContent = 'Select a laboratory task from the navigation tree.';
      content.append(heading, message);
      return;
    }

    const cleanup = task.mount(content);
    if (cleanup !== undefined) {
      unmountTask = cleanup;
    }
  };

  window.addEventListener('hashchange', renderRoute);
  renderRoute();

  return (): void => {
    window.removeEventListener('hashchange', renderRoute);
    unmountTask?.();
    shell.remove();
  };
}
