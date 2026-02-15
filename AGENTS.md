# AGENTS

## Purpose
This repository contains a personal variant of an old Amstrad-style game: get the mouse to the cheese. Keep changes aligned with that scope unless confirmed otherwise.

## Stack and Target
- Web-first project using HTML/CSS/JS.
- Use pnpm-based tooling. If scripts are missing, mark instructions as TBD and ask.

## Project Layout (Expected)
- src/ for game logic and UI code
- assets/ for images, audio, and sprites
- public/ for static files (if using a bundler)
If these directories do not exist yet, ask before creating a different layout.

## Build and Run
- Prefer existing pnpm scripts (e.g., `pnpm run dev`, `pnpm run build`).
- If no scripts exist, do not invent them; ask what should be used and note as TBD.

## Testing
- Unit tests are planned but not defined yet.
- If no test tooling exists, do not add one without confirming the choice.

## Code Style and Linting
- Keep style consistent with existing files and tooling.
- Prefer Biome for linting and formatting.
- If no Biome config exists yet, ask which ruleset to adopt and do not introduce a new one by default.

## Security
- Do not add secrets, API keys, or credentials to the repo.
- Prefer vetted, minimal dependencies and avoid unnecessary packages.
- Avoid unsafe browser APIs or insecure patterns (e.g., `innerHTML` with untrusted input).

## Collaboration Norms
- Make small, incremental changes with clear notes.
- Ask questions when requirements are unclear.
- If you see clear improvements, propose them via questions instead of making unilateral changes.

## TBD
- Exact pnpm scripts for build/run
- Test framework and command
- Biome ruleset and configuration
