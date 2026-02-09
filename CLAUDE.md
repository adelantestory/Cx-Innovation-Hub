# Cx Innovation Hub Development Guidelines

Auto-generated from all feature plans. Last updated: 2026-01-25

## Active Technologies

- Node.js 20.x LTS + TypeScript 5.x (001-taskify-mvp)
- Express 4.x + Socket.IO 4.x (001-taskify-mvp)
- React 18.x + Material-UI (MUI) (001-taskify-mvp)
- PostgreSQL 15.x + Prisma ORM 5.x (001-taskify-mvp)
- OpenAI SDK 4.x (001-taskify-mvp)
- Jest 29.x + React Testing Library (001-taskify-mvp)

## Project Structure

```text
backend/
├── src/
│   ├── models/           # Prisma schema & generated client
│   ├── controllers/      # Express route handlers
│   ├── services/         # Business logic layer
│   ├── middleware/       # Error handling, logging, CORS
│   ├── routes/           # REST API route definitions
│   ├── socket/           # WebSocket event handlers
│   └── utils/            # Helper functions
├── tests/                # Backend tests (unit, integration, contract)
├── prisma/
│   ├── schema.prisma     # Database schema
│   ├── migrations/       # Prisma migrations
│   └── seed.ts           # Sample data seeding
└── package.json

frontend/
├── src/
│   ├── components/       # React components
│   ├── pages/            # Page-level components
│   ├── hooks/            # Custom React hooks
│   ├── services/         # API client, WebSocket client
│   ├── context/          # React Context providers
│   └── utils/            # Helper functions
├── tests/                # Frontend tests (component, integration)
└── package.json

shared/
├── types/                # Shared TypeScript type definitions
└── constants/            # Shared constants (enums, status values)
```

## Commands

```bash
# Backend
cd backend && npm install
npx prisma generate
npx prisma migrate dev
npx prisma db seed
npm run dev                    # Start development server
npm test                       # Run Jest tests
npm run lint                   # ESLint + Prettier check

# Frontend
cd frontend && npm install
npm run dev                    # Start Vite dev server
npm test                       # Run React Testing Library tests
npm run lint                   # ESLint + Prettier check
npm run build                  # Production build

# Database
npx prisma studio              # Open Prisma Studio GUI
npx prisma migrate reset       # Reset database (WARNING: deletes data)
```

## Code Style

**TypeScript**: Follow standard conventions with strict type checking enabled
- Prefer `interface` over `type` for object shapes
- Use explicit return types for public functions
- Enable `strict`, `noImplicitAny`, `strictNullChecks` in tsconfig.json
- Use TSDoc comments for public APIs

**React**: Follow React 18+ best practices
- Functional components with hooks (no class components)
- Use TypeScript for prop types
- Prefer composition over inheritance
- Use React.memo() for expensive components

**Node.js**: Follow Express and modern Node.js patterns
- Async/await over callbacks or raw promises
- Centralized error handling middleware
- Environment variables for configuration
- Connection pooling for database

**Database**: Prisma ORM conventions
- Define schema in `schema.prisma`
- Use Prisma Client for all database access
- Index frequently queried fields
- Use transactions for multi-step operations

**Testing**:
- Contract tests for all REST API endpoints
- Integration tests for user journeys
- Unit tests for business logic
- Test isolation with setup/teardown hooks

## Recent Changes

- 001-taskify-mvp: Added Node.js 20.x LTS + TypeScript 5.x + Express 4.x + Socket.IO 4.x + React 18.x + PostgreSQL 15.x + Prisma ORM 5.x + OpenAI SDK 4.x

<!-- MANUAL ADDITIONS START -->
<!-- MANUAL ADDITIONS END -->
