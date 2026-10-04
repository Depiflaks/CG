# Instructions

- Keep responses as short and concise as possible.
- Prefer simple and readable solutions.
- Follow the existing project structure and coding style.
- Do not modify unrelated code.
- When asked to implement something, apply the changes directly to the code.
- Use `apply_patch` for modifying files whenever possible.

# Code Style

- Do not add comments to code.
- Keep function nesting at no more than 4 indentation levels.
  - If nesting would exceed 4 levels, refactor the function.
  - Prefer guard clauses and early returns to reduce nesting.
  - Extract nested logic into smaller functions when appropriate.
- Keep functions at no more than 40 lines.
  - If a function exceeds 40 lines, decompose it into smaller functions with clear responsibilities.
