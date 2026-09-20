import '@/src/styles.css';
import { startApp } from '@/src/app/app.ts';
import { labs } from '@/src/app/registry.ts';

const root = document.querySelector<HTMLElement>('#app');
if (root === null) {
  throw new Error('Application root element was not found.');
}

startApp(root, labs);
