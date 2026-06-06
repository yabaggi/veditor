# Veditor - Mobile-First Video Editor

Veditor is a lightweight, mobile-first web application designed for editing videos and capturing frames (snaps) to generate animated GIFs. It focuses on a streamlined mobile experience and persistent local storage.

## Project Overview

- **Purpose:** Capture frame-perfect snaps from videos, add captions, and export them as GIFs or other formats.
- **Key Concepts:**
    - **Folders (Projects):** Virtual containers that keep a video file and its associated snaps/exports organized.
    - **Snaps:** Captured video frames with optional captions and timestamps.
    - **Exports:** Generated assets like GIFs stored locally.

## Tech Stack

- **Frontend:** React 19 (TypeScript)
- **Build Tool:** Vite 8
- **Styling:** Vanilla CSS with a mobile-first approach.
- **Persistence:** IndexedDB (via the `idb` library) for projects, snaps, and exports.
- **GIF Generation:** `gif.js` using web workers.
- **State Management:** React Context API (`ProjectContext`, `SnapsContext`).

## Building and Running

- **Install Dependencies:**
  ```bash
  npm install
  ```
- **Start Development Server:**
  ```bash
  npm run dev
  ```
- **Build for Production:**
  ```bash
  npm run build
  ```
- **Lint Codebase:**
  ```bash
  npm run lint
  ```
- **Preview Production Build:**
  ```bash
  npm run preview
  ```

## Development Conventions

### Architecture
- **Context API:** Global state for projects and snaps is managed via `src/store/`.
- **Database:** All IndexedDB interactions are centralized in `src/utils/db.ts`.
- **Hooks:** Business logic is often extracted into custom hooks (e.g., `useSnaps`).

### Styling
- **CSS Variables:** Defined in `src/styles/global.css` for consistent colors and spacing.
- **Mobile-First:** Styles are optimized for small screens; use `var(--safe-area-inset-bottom)` for notch compatibility.
- **Component Styles:** Often defined within the `.tsx` file using `<style>` tags for component-specific logic or in `global.css`.

### Coding Standards
- **TypeScript:** Use strict typing. Define interfaces for all data models (see `src/utils/db.ts`).
- **ESLint:** Adhere to the rules defined in `eslint.config.js`.
- **File Naming:** PascalCase for React components (e.g., `VideoPlayer.tsx`), camelCase for utilities and hooks.

### Database Schema
- **Projects Store:** `id`, `title`, `videoBlob`, `videoName`, `createdAt`.
- **Snaps Store:** `id`, `projectId`, `dataUrl`, `timestamp`, `caption`, `createdAt`.
- **Exports Store:** `id`, `projectId`, `name`, `type` (gif/html/md), `blob`, `createdAt`.

## Key Files
- `src/App.tsx`: Main application entry point and tab navigation.
- `src/utils/db.ts`: IndexedDB schema and operations.
- `src/utils/gif.ts`: Logic for rendering GIFs from snaps with captions.
- `public/gif.worker.js`: Required for `gif.js` worker thread.
