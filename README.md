# Veditor - Mobile-First Video Editor

A lightweight, mobile-first web application for editing videos and capturing frames.

## Features
- **Video Upload:** Seamlessly load videos from local storage.
- **Playback Controls:** Precise timing controls and frame-by-frame navigation.
- **Trimming:** Define specific segments of the video for playback.
- **Snap Management:** Capture still frames (snaps) and store them persistently using IndexedDB.
- **Auto-Snap:** Automatically capture snaps at defined intervals during playback.
- **Captioning:** Add custom text captions to each snap.
- **GIF Export:** Convert your captured snaps into an animated GIF with captions.

## Tech Stack
- **Frontend:** React + TypeScript + Vite
- **Styling:** Vanilla CSS (Mobile-first)
- **Persistence:** IndexedDB (via `idb`)
- **GIF Generation:** `gif.js`

## Getting Started
1. Install dependencies: `npm install`
2. Run development server: `npm run dev`
3. Build for production: `npm run build`

## Project Structure
- `src/components`: UI components (Player, Uploader, Snap Gallery, etc.)
- `src/hooks`: Custom React hooks (e.g., `useSnaps`)
- `src/utils`: Utility functions for DB and GIF generation.
- `src/styles`: Global CSS variables and base styles.
- `public/`: Static assets including `gif.worker.js`.
