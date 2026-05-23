# Contributing to Score Mate

Thank you for your interest in contributing to Score Mate! We welcome contributions from anyone to help make this application better.

By contributing to this project, you agree to abide by our [Code of Conduct](CODE_OF_CONDUCT.md).

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (v18 or higher recommended)
- [npm](https://www.npmjs.com/)

### Local Development Setup

1. **Fork the repository** on GitHub.
2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/your-username/score-mate.git
   cd score-mate
   ```
3. **Install dependencies**:
   ```bash
   npm install
   ```
4. **Start the development server**:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:5173](http://localhost:5173) in your browser.

## Project Structure

Score Mate is built with React, TypeScript, Vite, and Tailwind CSS. The primary codebase resides in the `src/` directory:

- `src/components`: Generic UI components (e.g. alerts, toggles) and layout setups.
- `src/lib`: Interfaces, shared types, and utilities.
- `src/modules`: Feature-driven folders (e.g., `game`, `history`, `teams`) containing state hooks and custom layouts.

## Guidelines

### Coding Style & Linting
- Write clean, self-documenting TypeScript code.
- Run `npm run lint` before committing to check for any lint errors.
- Ensure the project compiles successfully by running `npm run build`.

### Branch Naming
Please use descriptive branch names such as:
- `feature/your-feature-name`
- `bugfix/issue-description`
- `docs/updating-readme`

### Commit Messages
- Write descriptive commit messages.
- Capitalize the commit message subject line and keep it concise.
- Reference any relevant issues in the commit description (e.g., `fixes #12`).

### Creating a Pull Request
1. Push your changes to your fork.
2. Open a Pull Request (PR) against the `main` branch of the original repository.
3. Fill out the Pull Request Template details completely.
4. Keep PRs focused on a single feature or bug fix.
