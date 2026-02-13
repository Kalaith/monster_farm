# Monster Farm

A React/TypeScript monster farming game built with modern web technologies.

## Features

- **Monster Management**: Raise and care for various monsters
- **Training System**: Train your monsters to increase their stats
- **Shop System**: Buy food, items, and upgrades
- **Contests**: Enter your monsters in competitions
- **Persistent Save**: Your progress is automatically saved

## Tech Stack

- **React 19** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **Framer Motion** for animations
- **Zustand** for state management
- **React Router** for navigation

## Getting Started

1. Install dependencies:

   ```bash
   npm install
   ```

2. Start the development server:

   ```bash
   npm run dev
   ```

3. Open your browser to `http://localhost:5173`

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint
- `npm run type-check` - Run TypeScript type checking
- `npm run test` - Run tests

## Project Structure

```
src/
├── components/          # React components
│   ├── game/           # Game-specific components
│   └── ui/             # Reusable UI components
├── data/               # Static game data
├── stores/             # Zustand state stores
├── types/              # TypeScript type definitions
├── hooks/              # Custom React hooks
├── utils/              # Utility functions
└── styles/             # Global styles
```

## Game Mechanics

### Monster Care

- **Hunger**: Feed your monsters regularly
- **Happiness**: Play with your monsters to keep them happy
- **Cleanliness**: Clean your monsters to maintain hygiene
- **Energy**: Monsters need rest between activities

### Training

- **Strength Training**: Increases Attack and HP
- **Defense Training**: Boosts Defense and HP
- **Speed Training**: Enhances Speed and Special
- **Special Training**: Focuses on Special abilities

### Progression

- **Levels**: Monsters gain experience through training and contests
- **Evolution**: Monsters can evolve at certain levels
- **Prestige**: Earn prestige through contests and achievements

## Contributing

1. Follow the established coding standards
2. Use TypeScript for all new code
3. Add tests for new features
4. Follow the component structure guidelines
5. Use the established state management patterns

## License

This project is for educational purposes.
