## Requirements

- Node.js 20.19 or newer (Node.js 22.12+ LTS is recommended)
- npm, included with Node.js
- A current browser with Canvas and `ResizeObserver` support

No global TypeScript, Vite, or ESLint installation is required.

## Install

From a clean checkout:

```bash
npm install
```

This installs TypeScript, Vite, and ESLint locally.

## Development

Run the foreground development server:

```bash
npm run dev
nvm install 24
nvm use 24
nvm alias default 24
```

Then open <http://127.0.0.1:5173>.

Alternatively, start it in the background from any working directory:

```bash
./bin/webjl-up
```

Stop that background process with:

```bash
./bin/webjl-down
```

The wrapper writes `.webjl.pid` and `.webjl.log` at the repository root. It reports missing npm dependencies and server startup failures clearly. `webjl-down` only manages a server started by `webjl-up`; stop a foreground `npm run dev` with `Ctrl+C`.

## Build and lint

```bash
npm run build
npm run lint
```

`npm run build` first performs strict TypeScript checking and then creates the production application in `dist/`. To inspect that build locally, run `npm run preview`.

## Project structure

```text
.
├── bin/                         # Background development lifecycle scripts
├── labs/
│   └── lab-01/
│       └── task-01/
│           └── index.ts         # Isolated task entry point
├── src/
│   ├── app/                     # Registry, navigation, routing, task lifecycle
│   ├── common/
│   │   └── graphics/
│   │       └── Vector2D.ts      # Shared graphics math
│   ├── main.ts                  # Single application entry point
│   └── styles.css
├── index.html                   # The only HTML page
├── eslint.config.js
├── package.json
├── tsconfig.json
└── vite.config.ts
```

Existing legacy C++ labs remain under `labs/lab1` and `labs/lab2`; the browser application uses zero-padded `lab-NN/task-NN` directories.

## Adding a laboratory

1. Create `labs/lab-NN/`.
2. Add at least one `task-NN/index.ts` exporting `mount(container)`.
3. Add one laboratory object to `src/app/registry.ts` and import its task entry points.

No navigation or routing code needs to change.

## Adding a task

Create an isolated entry point such as `labs/lab-03/task-02/index.ts`:

```ts
export function mount(container: HTMLElement): () => void {
  const heading = document.createElement("h1");
  heading.textContent = "Lab 3 · Task 2";
  container.append(heading);

  return () => {
    // Remove listeners, animation frames, and graphics resources here.
  };
}
```

Import the function and append a task object to the corresponding laboratory in `src/app/registry.ts`. Task code must not import code from another task. Reusable code belongs in `src/common`.
