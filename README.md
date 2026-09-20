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
├── webJL/
│   └── src/index.ts             # Browser graphics-surface integration point
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
  const heading = document.createElement('h1');
  heading.textContent = 'Lab 3 · Task 2';
  container.append(heading);

  return () => {
    // Remove listeners, animation frames, and graphics resources here.
  };
}
```

Import the function and append a task object to the corresponding laboratory in `src/app/registry.ts`. Task code must not import code from another task. Reusable code belongs in `src/common`.

## Shared Vector2D

`src/common/graphics/Vector2D.ts` provides an immutable two-dimensional vector with addition, subtraction, scaling, dot product, magnitude, and normalization. The example task imports it directly and uses it to calculate and draw a vector.

## WebJL integration

The repository's pre-existing `webJL/` directory was empty. Searches of npm and public GitHub metadata found no identifiable official WebJL package or documented OpenJL-derived browser framework, so this project deliberately does **not** invent an external API or dependency.

`webJL/src/index.ts` is the explicit integration point currently used by tasks. It exposes a lifecycle-managed HTML canvas and 2D rendering context through `createWebJLSurface`. The example task proves the surface can be mounted, resized, drawn to, and destroyed. If the course supplies a specific WebJL distribution later, replace this module's implementation while preserving its small surface contract; application navigation and task registration do not need to change.

Vite is used only as the minimal TypeScript development server and production bundler. It does not impose an application framework.
