import './styles.css';
import { startApp } from './app/app.ts';
import { labs } from './app/registry.ts';

const root = document.querySelector<HTMLElement>('#app');
if (root === null) {
  throw new Error('Application root element was not found.');
}

startApp(root, labs);
