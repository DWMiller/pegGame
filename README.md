# Peg Game

A 3D physics-based game built with React, Three.js, and Rapier physics engine.

## How to Play

1. Click **Play Game** from the launcher
2. Watch marbles fall through a grid of sticks
3. **Click on sticks** to remove them and let marbles drop
4. Score 10 points for each marble that falls through
5. Game ends when all marbles have fallen

## Controls

- **Left-click** on a stick to remove it
- **Drag** to rotate the camera
- **Scroll** to zoom in/out
- **Pause** button to pause physics
- **Settings** to adjust stick count, marble count, and gravity

## Development

### Prerequisites

- Node.js 18+
- npm

### Setup

```bash
npm install
npm run dev
```

Open http://localhost:3000

### Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build |
| `npm test` | Run tests |
| `npm run test:ui` | Run tests with UI |

### Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Three.js** - 3D rendering
- **React Three Fiber** - React renderer for Three.js
- **@react-three/rapier** - Physics engine (WASM-based)
- **@react-three/drei** - Useful R3F helpers
- **Zustand** - State management
- **React Router 6** - Routing
- **Vitest** - Testing

### Project Structure

```
src/
├── main.tsx              # Entry point
├── App.tsx               # Root component
├── stores/
│   └── gameStore.ts      # Game state (Zustand)
├── components/
│   ├── Game.tsx          # Game view with Canvas
│   ├── Launcher.tsx      # Start menu
│   ├── SettingsPanel.tsx # Settings UI
│   └── ErrorBoundary.tsx # Error handling
└── game/
    ├── Scene.tsx         # 3D scene root
    ├── Board.tsx         # Game board
    ├── Marbles.tsx       # Physics-enabled marbles
    ├── Sticks.tsx        # Clickable sticks
    ├── Walls.tsx         # Boundary walls
    └── Lighting.tsx      # Scene lighting
```

## License

MIT
