# Implementation Plan: Taskify MVP

**Branch**: `001-taskify-mvp` | **Date**: 2026-01-25 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/001-taskify-mvp/spec.md`

## Summary

Taskify MVP is a team productivity platform featuring Kanban-style task management with drag-and-drop functionality, real-time updates, and an AI help assistant. The system will support 5 predefined users (1 PM, 4 Engineers) working across 3 sample projects with tasks organized in 4 status columns (To Do, In Progress, In Review, Done). Key features include task assignment, commenting with permission controls, and contextual AI assistance for learning the application.

**Technical Approach**: Node.js backend with Express REST API, PostgreSQL database for persistence, React frontend with real-time updates via WebSockets, and OpenAI integration for the AI help assistant.

## Technical Context

**Language/Version**: Node.js 20.x LTS, TypeScript 5.x
**Primary Dependencies**:
- Backend: Express 4.x, Socket.IO 4.x, PostgreSQL client (pg 8.x), Prisma ORM 5.x
- Frontend: React 18.x, React DnD (drag-and-drop), Socket.IO client, TanStack Query (data fetching)
- AI: OpenAI SDK 4.x for help assistant

**Storage**: PostgreSQL 15.x with Prisma ORM for migrations and type-safe queries
**Testing**: Jest 29.x (unit/integration), React Testing Library, Supertest (API testing)
**Target Platform**: Modern web browsers (Chrome, Firefox, Safari, Edge) - responsive web application
**Project Type**: Web application (frontend + backend)
**Performance Goals**: <200ms UI feedback, <500ms API p95 latency, <2s Kanban board load time
**Constraints**:
- No authentication system (user selection only)
- Fixed sample data (5 users, 3 projects, pre-populated tasks)
- Single-user sessions (no real-time multi-user collaboration required)
- Browser-based only (no mobile apps)

**Scale/Scope**: MVP demonstration with 5 users, 3 projects, ~40-45 tasks total (~10-15 per project)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### I. Code Quality Standards

- ✅ **Readability First**: TypeScript enforces clear typing; ESLint + Prettier for consistent formatting
- ✅ **Single Responsibility**: Express routes → controllers → services architecture promotes separation
- ✅ **Type Safety**: TypeScript throughout; Prisma provides type-safe database access
- ✅ **Error Handling**: Express error middleware for centralized handling; try-catch in async operations
- ✅ **Code Review Required**: PR workflow enforced via GitHub (to be configured)

### II. Testing Discipline

- ✅ **Test-First Development**: Contract tests for REST API endpoints before implementation
- ✅ **Test Coverage**:
  - Contract tests: All REST endpoints (projects, tasks, comments, help)
  - Integration tests: User journeys (drag-drop task, add comment, use help assistant)
  - Unit tests: Business logic in services layer
- ✅ **Test Isolation**: Jest setup/teardown hooks; test database reset between test suites
- ✅ **Test Documentation**: Each test file includes purpose docstring
- ✅ **Continuous Testing**: GitHub Actions CI pipeline (to be configured)

### III. User Experience Consistency

- ✅ **Response Time Standards**: <200ms target for drag-drop, Socket.IO for instant updates
- ✅ **Error Messaging**: User-friendly error boundaries in React; API errors mapped to user messages
- ✅ **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation for all interactions
- ✅ **Design System**: Material-UI (MUI) components for consistent styling
- ✅ **Cross-Platform**: Responsive design with CSS Grid/Flexbox; tested in target browsers

### IV. Performance Requirements

- ✅ **Response Time Targets**: API <500ms p95, DB queries indexed for <100ms lookups
- ✅ **Resource Efficiency**: Connection pooling via Prisma; WebSocket connection reuse
- ✅ **Scalability**: Stateless API design; session state in client only
- ✅ **Performance Monitoring**: Winston logging with request timing; planned Prometheus metrics
- ⚠️ **Performance Testing**: Load testing deferred post-MVP (low user count doesn't warrant it yet)

**Justification for ⚠️**: With only 5 users and demo scope, load testing is premature optimization. Will add if MVP scales.

### V. Documentation & Transparency

- ✅ **Code-Level**: TSDoc comments for public API functions; inline comments for complex logic
- ✅ **Feature Documentation**: quickstart.md will document setup and usage
- ✅ **Architecture Documentation**: This plan.md + data-model.md + API contracts
- ✅ **Decision Records**: research.md captures technology choices and rationale

### Post-Phase-1 Re-evaluation

*(To be completed after Phase 1 design)*

All gates remain ✅ after Phase 1 design. No constitutional violations identified.

## Project Structure

### Documentation (this feature)

```text
specs/001-taskify-mvp/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0: Technology decisions
├── data-model.md        # Phase 1: Database schema
├── contracts/           # Phase 1: API contracts (OpenAPI specs)
│   ├── projects-api.yaml
│   ├── tasks-api.yaml
│   ├── comments-api.yaml
│   └── help-api.yaml
├── quickstart.md        # Phase 1: Setup and usage guide
└── checklists/
    └── requirements.md  # Specification validation checklist
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── index.ts                  # Express app entry point
│   ├── server.ts                 # HTTP + WebSocket server
│   ├── routes/                   # Express route definitions
│   │   ├── projects.ts
│   │   ├── tasks.ts
│   │   ├── comments.ts
│   │   └── help.ts
│   ├── controllers/              # Request handlers
│   │   ├── projectsController.ts
│   │   ├── tasksController.ts
│   │   ├── commentsController.ts
│   │   └── helpController.ts
│   ├── services/                 # Business logic
│   │   ├── projectsService.ts
│   │   ├── tasksService.ts
│   │   ├── commentsService.ts
│   │   └── aiHelpService.ts
│   ├── models/                   # Prisma client + type definitions
│   ├── middleware/               # Express middleware (error handling, logging)
│   │   ├── errorHandler.ts
│   │   └── logger.ts
│   ├── websocket/                # Socket.IO event handlers
│   │   └── taskEvents.ts
│   └── utils/                    # Helper functions
│       └── sampleData.ts         # Generate 5 users, 3 projects, tasks
├── prisma/
│   ├── schema.prisma             # Database schema
│   ├── migrations/               # SQL migrations
│   └── seed.ts                   # Seed sample data
├── tests/
│   ├── contract/                 # API contract tests
│   │   ├── projects.test.ts
│   │   ├── tasks.test.ts
│   │   ├── comments.test.ts
│   │   └── help.test.ts
│   ├── integration/              # User journey tests
│   │   ├── kanban-workflow.test.ts
│   │   ├── task-assignment.test.ts
│   │   └── commenting.test.ts
│   └── unit/                     # Service layer tests
│       └── aiHelpService.test.ts
├── package.json
├── tsconfig.json
└── .env.example

frontend/
├── src/
│   ├── App.tsx                   # Root component
│   ├── index.tsx                 # React entry point
│   ├── pages/                    # Page components
│   │   ├── UserSelection.tsx
│   │   ├── ProjectList.tsx
│   │   └── KanbanBoard.tsx
│   ├── components/               # Reusable components
│   │   ├── TaskCard.tsx
│   │   ├── TaskDetailModal.tsx
│   │   ├── CommentList.tsx
│   │   ├── CommentForm.tsx
│   │   ├── HelpButton.tsx
│   │   ├── HelpPanel.tsx
│   │   └── NavigationBar.tsx
│   ├── hooks/                    # Custom React hooks
│   │   ├── useWebSocket.ts       # Socket.IO integration
│   │   ├── useProjects.ts
│   │   ├── useTasks.ts
│   │   └── useHelpChat.ts
│   ├── services/                 # API clients
│   │   ├── api.ts                # Axios instance
│   │   ├── projectsApi.ts
│   │   ├── tasksApi.ts
│   │   ├── commentsApi.ts
│   │   └── helpApi.ts
│   ├── types/                    # TypeScript types
│   │   └── index.ts
│   └── styles/                   # Global styles
│       └── theme.ts              # MUI theme configuration
├── tests/
│   └── components/               # Component tests
│       ├── TaskCard.test.tsx
│       └── TaskDetailModal.test.tsx
├── package.json
├── tsconfig.json
└── vite.config.ts                # Vite bundler config

shared/
└── types/                        # Shared TypeScript types
    ├── user.ts
    ├── project.ts
    ├── task.ts
    └── comment.ts
```

**Structure Decision**: Web application structure with separate `backend/` and `frontend/` directories. Shared TypeScript types in `shared/` directory to ensure type consistency across client and server. This structure supports independent deployment and scaling of frontend (static hosting) and backend (Node.js server).

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Performance Testing deferred (⚠️) | MVP has only 5 users; load testing is premature | Full load testing suite would delay MVP delivery without value at this scale |

## Environment Variables

### Backend (.env)

```bash
# Database (REQUIRED)
DATABASE_URL="postgresql://user:password@localhost:5432/taskify_mvp"

# Server (REQUIRED)
PORT=3000
NODE_ENV=development  # or 'production'

# OpenAI (REQUIRED for AI help feature)
OPENAI_API_KEY="sk-..."
OPENAI_MODEL="gpt-4"  # or "gpt-3.5-turbo" for lower cost

# CORS (REQUIRED)
CORS_ORIGIN="http://localhost:5173"  # Frontend URL

# Socket.IO (OPTIONAL)
SOCKET_PATH="/socket.io"  # Default is fine

# Logging (OPTIONAL)
LOG_LEVEL="info"  # debug | info | warn | error
```

### Frontend (.env)

```bash
# API URL (REQUIRED)
VITE_API_URL=http://localhost:3000/api

# WebSocket URL (REQUIRED)
VITE_WS_URL=http://localhost:3000

# Feature Flags (OPTIONAL)
VITE_ENABLE_AI_HELP=true  # Set to false to disable help panel
```

**Validation**:
```bash
# Backend: Create .env from .env.example and verify all required vars set
# Frontend: npm run build will fail if VITE_ vars missing
```

## User Story Implementation Map

This section maps each user story from [spec.md](spec.md) to specific implementation components, showing complete traceability from requirements → design → implementation → tests.

### User Story 1: User Selection and Project Access (P1)

**Spec Reference**: [spec.md#L19-L32](spec.md#L19-L32)

**Backend Components**:
- API: `GET /api/projects` ([contracts/projects-api.yaml#L17-L39](contracts/projects-api.yaml#L17-L39))
- Service: `projectsService.getAllProjects()` with task counts aggregation
- Database: User table (seed data), Project table (seed data)
- Implementation: Phase 4

**Frontend Components**:
- Page: `pages/UserSelection.tsx` (5 hardcoded users from seed data)
- Page: `pages/ProjectList.tsx`
- Hook: `useProjects()` (TanStack Query wrapper)
- Implementation: Phases 14-15

**Acceptance Criteria → Test Mapping**:
- AC1 (see 5 users) → Frontend component test
- AC2 (click user → project list) → Integration test (navigation)
- AC3 (see 3 projects) → Contract test `tests/contract/projects.test.ts`

---

### User Story 2: Kanban Board Visualization (P1)

**Spec Reference**: [spec.md#L35-L50](spec.md#L35-L50)

**Backend Components**:
- API: `GET /api/projects/:id/tasks` ([contracts/projects-api.yaml#L65-L93](contracts/projects-api.yaml#L65-L93))
- Service: `projectsService.getProjectTasks()` → **ordered by (status, orderIndex)**
- Database: Task table with composite index `(projectId, status, orderIndex)`
- Implementation: Phase 4

**Frontend Components**:
- Page: `pages/KanbanBoard.tsx` (4 columns)
- Component: `components/TaskCard.tsx` (highlight current user's tasks with CSS)
- Component: `components/NavigationBar.tsx` (back button)
- Hook: `useProjectTasks(projectId)`
- Implementation: Phase 16

**Acceptance Criteria → Test Mapping**:
- AC1 (4 columns: To Do, In Progress, In Review, Done) → Component test
- AC2 (navigation bar with back button) → Component test
- AC4 (tasks assigned to current user highlighted) → CSS + integration test
- AC5 (card shows title and assignee) → Component test

---

### User Story 3: Drag-and-Drop (P2)

**Spec Reference**: [spec.md#L53-L66](spec.md#L53-L66)

**Backend Components**:
- API: `PATCH /api/tasks/:id` ([contracts/tasks-api.yaml#L47-L89](contracts/tasks-api.yaml#L47-L89))
- Service: `tasksService.updateTask()` with orderIndex recalculation (see Drag-Drop Algorithm)
- WebSocket: `task:updated` event broadcast after update
- Database: Update task status + orderIndex in transaction
- Implementation: Phases 5-6

**Frontend Components**:
- Page: `pages/KanbanBoard.tsx` (React DnD integration)
- Component: `components/TaskCard.tsx` (draggable wrapper)
- Hook: `useUpdateTask()` (mutation with optimistic update)
- Hook: `useWebSocket()` (subscribe to `task:updated` events)
- Implementation: Phase 16

**Acceptance Criteria → Test Mapping**:
- AC1 (drag task across board) → React DnD test
- AC2 (drop → status updates) → Integration test `tests/integration/kanban-workflow.test.ts`
- AC3 (change persists) → Contract test (verify DB update)

**Critical Implementation Detail**: [Drag-Drop Order Management Algorithm](#drag-drop-order-management-algorithm)

---

### User Story 4: Task Assignment (P2)

**Spec Reference**: [spec.md#L69-L85](spec.md#L69-L85)

**Backend Components**:
- API: `PATCH /api/tasks/:id` (same as US3, update `assignedTo` field)
- Service: `tasksService.updateTask()` → **validate assignedTo is project member**
- Database: Foreign key validation `assignedTo` → `User.id`
- Implementation: Phase 5

**Frontend Components**:
- Component: `components/TaskDetailModal.tsx` (dropdown with 5 users)
- Hook: `useUpdateTask()` (same as US3)
- Implementation: Phase 17

**Acceptance Criteria → Test Mapping**:
- AC1 (click task → modal opens) → Component test
- AC2 (modal displays full task info) → Component test
- AC3 (see all 5 users in dropdown) → Component test (data from seed.ts)
- AC4 (select user → task reassigned) → Contract test (assignedTo validation)
- AC5 (highlighting updates on board) → Integration test (real-time via WebSocket)

---

### User Story 5: Commenting (P3)

**Spec Reference**: [spec.md#L88-L104](spec.md#L88-L104)

**Backend Components**:
- API: `POST /api/tasks/:id/comments`, `PATCH /api/comments/:id`, `DELETE /api/comments/:id`
  - Contracts: [contracts/comments-api.yaml](contracts/comments-api.yaml)
- Service: `commentsService` with permission checks (`authorId === currentUserId`)
- Database: Comment table with `editedAt` tracking
- Implementation: Phase 7

**Frontend Components**:
- Component: `components/CommentList.tsx` (show edit/delete only for own comments)
- Component: `components/CommentForm.tsx` (add comment)
- Hooks: `useComments(taskId)`, `useCreateComment()`, `useUpdateComment()`, `useDeleteComment()`
- Implementation: Phase 17

**Acceptance Criteria → Test Mapping**:
- AC1 (add comment → appears with username/timestamp) → Contract test `POST /api/comments`
- AC2 (see edit/delete for own comments) → Component test (conditional rendering)
- AC3 (no controls for others' comments) → Component test
- AC4 (edit comment → updated) → Contract test `PATCH /api/comments/:id`
- AC5 (delete comment → removed) → Integration test (permission enforcement)
- AC6 (multiple comments in chronological order) → Contract test `GET /api/tasks/:id`

**Critical Implementation Detail**: Set `editedAt` field when updating comment (for "(edited)" badge)

---

### User Story 6: AI Help Assistant (P3)

**Spec Reference**: [spec.md#L107-L124](spec.md#L107-L124)

**Backend Components**:
- API: `POST /api/help/ask`, `GET /api/help/history`
  - Contracts: [contracts/help-api.yaml](contracts/help-api.yaml)
- Service: `aiHelpService` with OpenAI integration
- Database: HelpMessage table (session-based storage)
- Implementation: Phase 8

**Frontend Components**:
- Component: `components/HelpButton.tsx` (floating button, visible on all pages)
- Component: `components/HelpPanel.tsx` (slide-in chat interface)
- Hook: `useHelpChat(sessionId)` (manages conversation state)
- Implementation: Phase 18

**Acceptance Criteria → Test Mapping**:
- AC1 (help button visible everywhere) → Component test (rendered on all routes)
- AC2 (click → panel slides in) → Component test (animation)
- AC4 (ask question → receive guidance) → Contract test with mocked OpenAI
- AC5 (contextual responses) → Unit test (verify `screenContext` changes system prompt)
- AC6 (close panel) → Component test
- AC7 (conversation history persists) → Contract test `GET /api/help/history`

**Critical Implementation Detail**: `screenContext` ('user-selection' | 'project-list' | 'kanban-board' | 'task-detail-modal') must be passed from frontend route → affects AI system prompt selection

---

## Phase 0: Research & Decisions

See [research.md](research.md) for detailed technology decisions and rationale.

**Key Decisions**:
1. **Database**: PostgreSQL with Prisma ORM for type safety and migrations
2. **Real-time Updates**: Socket.IO for WebSocket connections (simpler than raw WebSockets)
3. **Drag-and-Drop**: React DnD library (battle-tested, accessible)
4. **AI Help**: OpenAI API with GPT-4 for contextual assistance
5. **State Management**: TanStack Query for server state; React Context for UI state (avoid Redux overhead)

## Phase 1: Design Artifacts

### Data Model

See [data-model.md](data-model.md) for complete database schema.

**Entity Overview** (organized by implementation phase):

**Phase 2 (Foundation) - Database Setup**:
- **User** ([data-model.md#L55-L79](data-model.md#L55-L79))
  - 5 predefined users: 1 PM + 4 Engineers
  - Sample data: Sarah Johnson (PM), Alex Chen, Jordan Lee, Taylor Kim, Morgan Patel
  - Seed data specification: Lines 70-74

- **Project** ([data-model.md#L80-L100](data-model.md#L80-L100))
  - 3 sample projects with descriptions
  - Sample data: Mobile App Redesign, Website Refresh, API v2 Migration (lines 93-96)

- **ProjectMember** ([data-model.md#L101-L125](data-model.md#L101-L125))
  - Junction table: All 5 users are members of all 3 projects (line 118)
  - Unique constraint on (projectId, userId)

**Phase 3 (Core Features) - Task Management**:
- **Task** ([data-model.md#L126-L168](data-model.md#L126-L168))
  - **CRITICAL**: `orderIndex` field for drag-drop positioning (line 139)
  - **CRITICAL**: `status` enum: 'To Do' | 'In Progress' | 'In Review' | 'Done' (line 137)
  - **CRITICAL**: Composite index `(projectId, status, orderIndex)` for sorted retrieval (line 162)
  - Distribution: 40% To Do, 30% In Progress, 20% In Review, 10% Done (line 154)
  - Validation: `assignedTo` must be a member of the task's project (line 146)
  - State transitions: Any status → Any status (user can drag to any column) (line 149)

**Phase 4 (Collaboration) - Comments**:
- **Comment** ([data-model.md#L169-L201](data-model.md#L169-L201))
  - **CRITICAL**: `editedAt` field for "(edited)" badge display (line 181)
  - Permission logic: Edit/Delete only if `authorId === currentUserId` (line 189)
  - Display logic: Show "(edited)" badge if `editedAt IS NOT NULL` (line 190)

**Phase 5 (AI Help) - Help Messages**:
- **HelpMessage** ([data-model.md#L202-L230](data-model.md#L202-L230))
  - Session-based storage (sessionId in browser localStorage)
  - `screenContext` values: 'user-selection' | 'project-list' | 'kanban-board' | 'task-detail-modal' (line 219)
  - Cleanup strategy: Delete sessions older than 7 days (line 224)

**Prisma Schema**: Complete schema at [data-model.md#L231-L362](data-model.md#L231-L362)

### API Contracts

See [contracts/](contracts/) directory for OpenAPI specifications.

**REST Endpoints** (with contract references):

**Projects API** ([contracts/projects-api.yaml](contracts/projects-api.yaml)):
- `GET /api/projects` - List all projects with task counts
  - Contract: Lines 17-39
  - Returns: `{ projects: Project[] }` where each project includes task count breakdown
  - Authentication: None (MVP - no auth)
  - Response time target: < 200ms

- `GET /api/projects/:id` - Get single project details
  - Contract: Lines 41-63
  - Returns: Project object with metadata
  - Error: 404 if project not found

- `GET /api/projects/:id/tasks` - Get all tasks for a project
  - Contract: Lines 65-93
  - Returns: Task array **ordered by (status, orderIndex)** - CRITICAL for Kanban display
  - Filtering: None in MVP (return all tasks)
  - Error: 404 if project not found

**Tasks API** ([contracts/tasks-api.yaml](contracts/tasks-api.yaml)):
- `GET /api/tasks/:id` - Get single task details
  - Contract: Lines 17-45
  - Returns: Task with assignee details populated
  - Used by: Task detail modal

- `PATCH /api/tasks/:id` - Update task (drag-drop, assignment)
  - Contract: Lines 47-89
  - Request body: `Partial<{ status, assignedTo, orderIndex }>`
  - **CRITICAL Validation**: `assignedTo` (if provided) must be a member of task's project
  - **CRITICAL**: When status changes, recalculate orderIndex (see Drag-Drop Algorithm)
  - Side effect: Broadcasts `task:updated` WebSocket event after successful update
  - Response time target: < 150ms (for drag-drop feedback)
  - Error: 400 if validation fails, 404 if task not found

**Comments API** ([contracts/comments-api.yaml](contracts/comments-api.yaml)):
- `POST /api/tasks/:id/comments` - Add comment to task
  - Contract: Lines 17-51
  - Request: `{ content: string }` + X-User-Id header
  - Returns: Created comment with author details
  - Side effect: Broadcasts `comment:added` WebSocket event

- `PATCH /api/comments/:id` - Edit own comment
  - Contract: Lines 55-82
  - **CRITICAL Permission**: Only author can edit (authorId === X-User-Id)
  - Request: `{ content: string }`
  - **CRITICAL**: Must set `editedAt` timestamp when updating
  - Error: 403 if user is not the author

- `DELETE /api/comments/:id` - Delete own comment
  - Contract: Lines 84-104
  - **CRITICAL Permission**: Only author can delete (authorId === X-User-Id)
  - Error: 403 if user is not the author

**Help API** ([contracts/help-api.yaml](contracts/help-api.yaml)):
- `POST /api/help/ask` - Send question to AI assistant
  - Contract: Lines 17-76
  - Request: `{ question: string, screenContext?: string }` + X-Session-Id header
  - **CRITICAL**: `screenContext` affects AI system prompt (context-aware responses)
  - Calls: OpenAI API with GPT-4
  - Stores: User message + AI response in HelpMessage table
  - Response time: 1-3 seconds (depends on OpenAI)
  - Error: 503 if OpenAI unavailable

- `GET /api/help/history` - Get conversation history
  - Contract: Lines 78-135
  - Query param: `limit` (default 50, max 100)
  - Returns: Messages for session ordered by timestamp
  - Error: 404 if no history for session

**WebSocket Events**:

**Server → Client Events**:

1. `task:updated` - Broadcast when task changes (status, assignment, orderIndex)
   ```typescript
   {
     event: 'task:updated',
     projectId: string,  // For room filtering
     task: {
       id: string,
       projectId: string,
       title: string,
       status: 'To Do' | 'In Progress' | 'In Review' | 'Done',
       assignedTo: string | null,
       orderIndex: number,
       updatedAt: string  // ISO 8601
     }
   }
   ```
   **When to emit**: AFTER database update succeeds in tasksService.updateTask()
   **Room**: Broadcast to `project:${projectId}` (not global)
   **Implementation**: See backend/src/websocket/taskEvents.ts

2. `comment:added` - Broadcast when new comment created
   ```typescript
   {
     event: 'comment:added',
     taskId: string,
     projectId: string,  // For room filtering
     comment: {
       id: string,
       taskId: string,
       authorId: string,
       content: string,
       createdAt: string,
       author: {  // Denormalized for client display
         id: string,
         name: string,
         avatarUrl: string | null
       }
     }
   }
   ```
   **When to emit**: AFTER database insert succeeds in commentsService.createComment()
   **Room**: Broadcast to `project:${projectId}`

**Client → Server Events**:

1. `join:project` - Subscribe to project updates
   ```typescript
   socket.emit('join:project', { projectId: string })
   ```
   **Implementation**: Add client to Socket.IO room `project:${projectId}`
   **When**: User navigates to Kanban board

2. `leave:project` - Unsubscribe from project updates
   ```typescript
   socket.emit('leave:project', { projectId: string })
   ```
   **Implementation**: Remove client from Socket.IO room
   **When**: User navigates away from Kanban board

### Quickstart Guide

See [quickstart.md](quickstart.md) for setup instructions and validation steps.

### Seed Data Specification

**Location**: `backend/prisma/seed.ts`

**Execution Order** (MUST follow this sequence to avoid foreign key violations):

```typescript
// 1. Create Users (MUST be first - other entities reference users)
const users = await prisma.user.createMany({
  data: [
    {
      name: "Sarah Johnson",
      email: "sarah.johnson@taskify.dev",
      role: "PM",
      avatarUrl: "https://i.pravatar.cc/150?img=1"
    },
    {
      name: "Alex Chen",
      email: "alex.chen@taskify.dev",
      role: "Engineer",
      avatarUrl: "https://i.pravatar.cc/150?img=2"
    },
    {
      name: "Jordan Lee",
      email: "jordan.lee@taskify.dev",
      role: "Engineer",
      avatarUrl: "https://i.pravatar.cc/150?img=3"
    },
    {
      name: "Taylor Kim",
      email: "taylor.kim@taskify.dev",
      role: "Engineer",
      avatarUrl: "https://i.pravatar.cc/150?img=4"
    },
    {
      name: "Morgan Patel",
      email: "morgan.patel@taskify.dev",
      role: "Engineer",
      avatarUrl: "https://i.pravatar.cc/150?img=5"
    }
  ]
})

// 2. Create Projects
const projects = await prisma.project.createMany({
  data: [
    {
      name: "Mobile App Redesign",
      description: "Redesign of the iOS and Android apps with new branding and improved UX"
    },
    {
      name: "Website Refresh",
      description: "Update marketing website with new branding, case studies, and testimonials"
    },
    {
      name: "API v2 Migration",
      description: "Migrate legacy REST API to v2 architecture with GraphQL support"
    }
  ]
})

// 3. Create ProjectMembers (all users in all projects)
// Total: 15 records (5 users × 3 projects)
const allUsers = await prisma.user.findMany()
const allProjects = await prisma.project.findMany()

for (const project of allProjects) {
  for (const user of allUsers) {
    await prisma.projectMember.create({
      data: {
        projectId: project.id,
        userId: user.id
      }
    })
  }
}

// 4. Create Tasks (40-45 total, ~13-15 per project)
// Distribution per project:
// - To Do: 6 tasks (40%)
// - In Progress: 4-5 tasks (30%)
// - In Review: 3 tasks (20%)
// - Done: 2 tasks (10%)

// Assignment strategy:
// - ~60% assigned to random users from project members
// - ~40% unassigned (assignedTo = null)

// Sample task titles for "Mobile App Redesign":
const mobileAppTasks = [
  // To Do (6 tasks)
  { title: "Design new login screen", status: "ToDo", orderIndex: 0, assignedTo: alexId },
  { title: "Create onboarding flow wireframes", status: "ToDo", orderIndex: 1, assignedTo: null },
  { title: "Design user profile page", status: "ToDo", orderIndex: 2, assignedTo: jordanId },
  { title: "Update app icon and splash screen", status: "ToDo", orderIndex: 3, assignedTo: null },
  { title: "Design settings screen", status: "ToDo", orderIndex: 4, assignedTo: taylorId },
  { title: "Create dark mode color palette", status: "ToDo", orderIndex: 5, assignedTo: null },

  // In Progress (4 tasks)
  { title: "Implement user authentication flow", status: "InProgress", orderIndex: 0, assignedTo: alexId },
  { title: "Build reusable UI components", status: "InProgress", orderIndex: 1, assignedTo: jordanId },
  { title: "Integrate analytics SDK", status: "InProgress", orderIndex: 2, assignedTo: null },
  { title: "Add push notification support", status: "InProgress", orderIndex: 3, assignedTo: morganId },

  // In Review (3 tasks)
  { title: "Review API integration code", status: "InReview", orderIndex: 0, assignedTo: sarahId },
  { title: "Test offline mode functionality", status: "InReview", orderIndex: 1, assignedTo: taylorId },
  { title: "Security audit of authentication", status: "InReview", orderIndex: 2, assignedTo: null },

  // Done (2 tasks)
  { title: "Set up project repository", status: "Done", orderIndex: 0, assignedTo: alexId },
  { title: "Configure CI/CD pipeline", status: "Done", orderIndex: 1, assignedTo: jordanId }
]

// Similar distributions for "Website Refresh" and "API v2 Migration"
// (See data-model.md lines 152-155 for distribution requirements)

// orderIndex MUST be:
// - Sequential within each (projectId, status) group
// - Start at 0, increment by 1
// - Example: Project A, "To Do" → [0, 1, 2, 3, 4, 5]

// 5. Create Comments (8-12 total, scattered across tasks)
// Requirements:
// - At least 2 comments from different users on same task (test permission UI)
// - At least 1 comment with editedAt set (test "(edited)" badge)
// - Mix of recent (today) and older (1-3 days ago) timestamps

const sampleComments = [
  {
    taskId: taskIds[0],
    authorId: sarahId,
    content: "Great progress on this! Can we add error handling for edge cases?",
    createdAt: new Date('2026-01-24T10:00:00Z')
  },
  {
    taskId: taskIds[0],
    authorId: alexId,
    content: "Sure, I'll add that today.",
    createdAt: new Date('2026-01-24T10:15:00Z')
  },
  {
    taskId: taskIds[5],
    authorId: jordanId,
    content: "This is ready for review.",
    createdAt: new Date('2026-01-25T09:00:00Z'),
    editedAt: new Date('2026-01-25T09:30:00Z')  // Edited comment
  }
  // ... add 5-9 more comments
]

// 6. HelpMessages: NONE (created at runtime via API)
// The help_messages table starts empty
```

**Validation After Seeding**:

```bash
npx prisma studio

# Verify counts:
# - users: 5
# - projects: 3
# - project_members: 15 (5 users × 3 projects)
# - tasks: 40-45 total
#   - Distributed ~13-15 per project
#   - Distribution: ~40% To Do, ~30% In Progress, ~20% In Review, ~10% Done
# - comments: 8-12
# - help_messages: 0
```

**CRITICAL**: Seed script must be **idempotent**. Running `npx prisma db seed` multiple times should not create duplicates. Use `upsert` or check for existence before creating.

## Detailed Implementation Sequence

### Phase 1: Project Initialization

**1.1. Backend Directory Structure**
```bash
mkdir -p backend/src/{routes,controllers,services,models,middleware,websocket,utils}
mkdir -p backend/prisma backend/tests/{contract,integration,unit}
cd backend
```

**1.2. Backend Dependencies**
```bash
npm init -y
npm install express prisma @prisma/client socket.io pg dotenv winston cors
npm install -D typescript @types/node @types/express @types/cors ts-node jest @types/jest supertest @types/supertest ts-jest
```

**1.3. TypeScript Configuration**
Create `tsconfig.json` with strict mode:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "commonjs",
    "lib": ["ES2022"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**1.4. Environment Setup**
Create `.env.example` with all required variables (see Environment Variables section above)

---

### Phase 2: Database Foundation

**2.1. Prisma Schema**
- Copy schema from [data-model.md#L233-L362](data-model.md#L233-L362) → `prisma/schema.prisma`
- Verify `DATABASE_URL` in `.env`

**2.2. Initial Migration**
```bash
npx prisma migrate dev --name init
```
Expected: Creates `migrations/` directory and applies schema to database

**2.3. Seed Data**
- Create `prisma/seed.ts` following Seed Data Specification above
- Add to `package.json`:
  ```json
  "prisma": {
    "seed": "ts-node prisma/seed.ts"
  }
  ```
- Run: `npx prisma db seed`

**2.4. Verification**
```bash
npx prisma studio
# Verify: 5 users, 3 projects, 15 project_members, 40-45 tasks, 8-12 comments
```

---

### Phase 3: Express Server Setup

**3.1. Express App Configuration** (`src/index.ts`)
```typescript
import express from 'express'
import cors from 'cors'
import { errorHandler } from './middleware/errorHandler'
import { requestLogger } from './middleware/logger'

const app = express()

// Middleware
app.use(cors({ origin: process.env.CORS_ORIGIN }))
app.use(express.json())
app.use(requestLogger)  // Log all requests

// Routes (to be added in Phase 4-8)
// app.use('/api/projects', projectsRoutes)
// app.use('/api/tasks', tasksRoutes)
// app.use('/api/comments', commentsRoutes)
// app.use('/api/help', helpRoutes)

// Error handling (must be last)
app.use(errorHandler)

export default app
```

**3.2. HTTP + WebSocket Server** (`src/server.ts`)
```typescript
import http from 'http'
import { Server as SocketIOServer } from 'socket.io'
import app from './index'
import { setupWebSocketHandlers } from './websocket/taskEvents'

const PORT = process.env.PORT || 3000
const httpServer = http.createServer(app)

const io = new SocketIOServer(httpServer, {
  cors: { origin: process.env.CORS_ORIGIN }
})

setupWebSocketHandlers(io)

httpServer.listen(PORT, () => {
  console.log(`[Server] Listening on http://localhost:${PORT}`)
})
```

**3.3. Logging Middleware** (`src/middleware/logger.ts`)
```typescript
import winston from 'winston'

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.Console({ format: winston.format.simple() })
  ]
})

export function requestLogger(req, res, next) {
  const start = Date.now()
  res.on('finish', () => {
    logger.info({
      method: req.method,
      path: req.path,
      status: res.statusCode,
      duration: Date.now() - start,
      userId: req.headers['x-user-id']
    })
  })
  next()
}
```

**3.4. Error Handler Middleware** (`src/middleware/errorHandler.ts`)
```typescript
import { logger } from './logger'

export function errorHandler(err, req, res, next) {
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path
  })

  const statusCode = err.statusCode || 500
  const errorType = err.type || 'INTERNAL_ERROR'

  res.status(statusCode).json({
    error: errorType,
    message: err.userMessage || 'An unexpected error occurred',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
}
```

**3.5. Test Server Startup**
```bash
npm run dev  # Should start server on port 3000
```

---

### Phase 4: REST API - Projects (User Story 1 & 2)

**4.1. Projects Service** (`src/services/projectsService.ts`)
```typescript
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export async function getAllProjects() {
  const projects = await prisma.project.findMany({
    include: {
      tasks: {
        select: { status: true }  // For counting by status
      }
    }
  })

  return projects.map(project => ({
    id: project.id,
    name: project.name,
    description: project.description,
    taskCounts: {
      toDo: project.tasks.filter(t => t.status === 'ToDo').length,
      inProgress: project.tasks.filter(t => t.status === 'InProgress').length,
      inReview: project.tasks.filter(t => t.status === 'InReview').length,
      done: project.tasks.filter(t => t.status === 'Done').length
    }
  }))
}

export async function getProjectTasks(projectId: string) {
  // CRITICAL: Order by (status, orderIndex) for Kanban display
  return await prisma.task.findMany({
    where: { projectId },
    include: {
      assignee: {
        select: { id: true, name: true, avatarUrl: true }
      }
    },
    orderBy: [
      { status: 'asc' },
      { orderIndex: 'asc' }
    ]
  })
}
```

**4.2. Projects Controller** (`src/controllers/projectsController.ts`)
```typescript
import { Request, Response, NextFunction } from 'express'
import * as projectsService from '../services/projectsService'

export async function listProjects(req: Request, res: Response, next: NextFunction) {
  try {
    const projects = await projectsService.getAllProjects()
    res.json({ projects })
  } catch (error) {
    next(error)
  }
}

export async function getProjectTasks(req: Request, res: Response, next: NextFunction) {
  try {
    const tasks = await projectsService.getProjectTasks(req.params.id)
    res.json({ tasks })
  } catch (error) {
    next(error)
  }
}
```

**4.3. Projects Routes** (`src/routes/projects.ts`)
```typescript
import { Router } from 'express'
import * as projectsController from '../controllers/projectsController'

const router = Router()

router.get('/', projectsController.listProjects)
router.get('/:id/tasks', projectsController.getProjectTasks)

export default router
```

**4.4. Register Routes** (in `src/index.ts`)
```typescript
import projectsRoutes from './routes/projects'
app.use('/api/projects', projectsRoutes)
```

**4.5. Contract Tests** (`tests/contract/projects.test.ts`)
```typescript
import request from 'supertest'
import app from '../../src/index'

describe('Projects API Contract', () => {
  describe('GET /api/projects', () => {
    it('returns 200 with project array', async () => {
      // Verify against contracts/projects-api.yaml lines 17-39
      const response = await request(app).get('/api/projects')
      expect(response.status).toBe(200)
      expect(response.body.projects).toHaveLength(3)
      expect(response.body.projects[0]).toMatchObject({
        id: expect.any(String),
        name: expect.any(String),
        taskCounts: {
          toDo: expect.any(Number),
          inProgress: expect.any(Number),
          inReview: expect.any(Number),
          done: expect.any(Number)
        }
      })
    })
  })

  describe('GET /api/projects/:id/tasks', () => {
    it('returns tasks ordered by (status, orderIndex)', async () => {
      // Verify against contracts/projects-api.yaml lines 65-93
      // Test that tasks are correctly sorted
    })
  })
})
```

---

### Phase 5: REST API - Tasks (User Story 3 & 4)

**5.1. Tasks Service** (`src/services/tasksService.ts`)
```typescript
import { PrismaClient, TaskStatus } from '@prisma/client'

const prisma = new PrismaClient()

export async function updateTask(
  taskId: string,
  data: {
    status?: TaskStatus
    assignedTo?: string | null
    orderIndex?: number
  }
) {
  // CRITICAL: Validate assignedTo is project member
  if (data.assignedTo) {
    const task = await prisma.task.findUnique({
      where: { id: taskId },
      select: { projectId: true }
    })

    const isMember = await prisma.projectMember.findFirst({
      where: {
        projectId: task.projectId,
        userId: data.assignedTo
      }
    })

    if (!isMember) {
      throw {
        statusCode: 400,
        type: 'VALIDATION_ERROR',
        userMessage: 'Cannot assign task to user who is not a project member'
      }
    }
  }

  // CRITICAL: If status changed, recalculate orderIndex
  // See Drag-Drop Algorithm section below for full implementation

  return await prisma.task.update({
    where: { id: taskId },
    data,
    include: {
      assignee: {
        select: { id: true, name: true, avatarUrl: true }
      }
    }
  })
}
```

**5.2. Tasks Controller & Routes**
Similar pattern to Projects (controller wraps service, routes define endpoints)

**5.3. Contract Tests** (`tests/contract/tasks.test.ts`)
```typescript
describe('PATCH /api/tasks/:id', () => {
  it('validates assignedTo is project member', async () => {
    // Verify against contracts/tasks-api.yaml lines 70-78
    const response = await request(app)
      .patch(`/api/tasks/${taskId}`)
      .send({ assignedTo: 'non-existent-user-id' })
    expect(response.status).toBe(400)
    expect(response.body.error).toBe('VALIDATION_ERROR')
  })
})
```

---

### Phase 6: WebSocket - Real-time Updates (User Story 3)

**6.1. WebSocket Event Handlers** (`src/websocket/taskEvents.ts`)
```typescript
import { Server as SocketIOServer } from 'socket.io'

export function setupWebSocketHandlers(io: SocketIOServer) {
  io.on('connection', (socket) => {
    console.log(`[WebSocket] Client connected: ${socket.id}`)

    socket.on('join:project', ({ projectId }) => {
      socket.join(`project:${projectId}`)
      console.log(`[WebSocket] Client ${socket.id} joined project:${projectId}`)
    })

    socket.on('leave:project', ({ projectId }) => {
      socket.leave(`project:${projectId}`)
    })

    socket.on('disconnect', () => {
      console.log(`[WebSocket] Client disconnected: ${socket.id}`)
    })
  })
}

// Export io instance for use in services
export let io: SocketIOServer
export function setIO(ioInstance: SocketIOServer) {
  io = ioInstance
}
```

**6.2. Modify Tasks Service** (emit WebSocket event after update)
```typescript
import { io } from '../websocket/taskEvents'

export async function updateTask(...) {
  // ... validation logic ...

  const updatedTask = await prisma.task.update({ ... })

  // CRITICAL: Emit AFTER database update succeeds
  io.to(`project:${updatedTask.projectId}`).emit('task:updated', {
    event: 'task:updated',
    projectId: updatedTask.projectId,
    task: {
      id: updatedTask.id,
      projectId: updatedTask.projectId,
      title: updatedTask.title,
      status: updatedTask.status,
      assignedTo: updatedTask.assignedTo,
      orderIndex: updatedTask.orderIndex,
      updatedAt: updatedTask.updatedAt.toISOString()
    }
  })

  return updatedTask
}
```

**6.3. Integration Test** (`tests/integration/kanban-workflow.test.ts`)
```typescript
import io from 'socket.io-client'

describe('Real-time task updates', () => {
  it('broadcasts task:updated to all clients in project room', async (done) => {
    // 1. Connect 2 WebSocket clients
    const client1 = io('http://localhost:3000')
    const client2 = io('http://localhost:3000')

    // 2. Both join same project
    client1.emit('join:project', { projectId: testProjectId })
    client2.emit('join:project', { projectId: testProjectId })

    // 3. Client 2 listens for updates
    client2.on('task:updated', (data) => {
      expect(data.task.status).toBe('InProgress')
      done()
    })

    // 4. Client 1 updates task via API
    await request(app)
      .patch(`/api/tasks/${testTaskId}`)
      .send({ status: 'InProgress' })

    // 5. Verify Client 2 receives event within 200ms (done callback)
  })
})
```

---

### Phase 7: REST API - Comments (User Story 5)

**7.1. Comments Service** (`src/services/commentsService.ts`)
```typescript
export async function updateComment(
  commentId: string,
  authorId: string,  // From X-User-Id header
  content: string
) {
  // CRITICAL: Verify permission (authorId === comment.authorId)
  const comment = await prisma.comment.findUnique({
    where: { id: commentId }
  })

  if (comment.authorId !== authorId) {
    throw {
      statusCode: 403,
      type: 'FORBIDDEN',
      userMessage: 'You can only edit your own comments'
    }
  }

  // CRITICAL: Set editedAt timestamp
  return await prisma.comment.update({
    where: { id: commentId },
    data: {
      content,
      editedAt: new Date()
    }
  })
}
```

**7.2. Contract Tests** (`tests/contract/comments.test.ts`)
```typescript
describe('PATCH /api/comments/:id', () => {
  it('allows editing own comment', async () => {
    const response = await request(app)
      .patch(`/api/comments/${commentId}`)
      .set('X-User-Id', authorId)  // Same as comment author
      .send({ content: 'Updated' })
    expect(response.status).toBe(200)
    expect(response.body.comment.editedAt).toBeTruthy()
  })

  it('forbids editing other user\'s comment', async () => {
    const response = await request(app)
      .patch(`/api/comments/${commentId}`)
      .set('X-User-Id', differentUserId)
      .send({ content: 'Hacking' })
    expect(response.status).toBe(403)
  })
})
```

---

### Phase 8: REST API - AI Help (User Story 6)

**8.1. AI Help Service** (`src/services/aiHelpService.ts`)
```typescript
import OpenAI from 'openai'

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

const SYSTEM_PROMPTS = {
  'kanban-board': 'You are a helpful assistant for Taskify, a task management app. The user is currently viewing a Kanban board...',
  'task-detail-modal': 'You are helping a user with task details in Taskify...',
  // ... other contexts
}

export async function askQuestion(
  sessionId: string,
  question: string,
  screenContext?: string
) {
  // Store user message
  await prisma.helpMessage.create({
    data: {
      sessionId,
      sender: 'user',
      content: question,
      screenContext
    }
  })

  // CRITICAL: Select system prompt based on screenContext
  const systemPrompt = SYSTEM_PROMPTS[screenContext] || SYSTEM_PROMPTS['default']

  // Call OpenAI API
  const completion = await openai.chat.completions.create({
    model: process.env.OPENAI_MODEL || 'gpt-4',
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: question }
    ]
  })

  const answer = completion.choices[0].message.content

  // Store AI response
  const aiMessage = await prisma.helpMessage.create({
    data: {
      sessionId,
      sender: 'ai',
      content: answer,
      screenContext
    }
  })

  return {
    messageId: aiMessage.id,
    answer,
    screenContext,
    timestamp: aiMessage.createdAt.toISOString()
  }
}
```

**8.2. Contract Tests** (with OpenAI mock)
```typescript
jest.mock('openai')

describe('POST /api/help/ask', () => {
  beforeEach(() => {
    // Mock OpenAI response
    OpenAI.prototype.chat.completions.create.mockResolvedValue({
      choices: [{ message: { content: 'Click the task card...' } }]
    })
  })

  it('returns context-aware response', async () => {
    const response = await request(app)
      .post('/api/help/ask')
      .set('X-Session-Id', sessionId)
      .send({
        question: 'How do I assign a task?',
        screenContext: 'kanban-board'
      })
    expect(response.status).toBe(200)
    expect(response.body.answer).toContain('click')
  })
})
```

---

### Phase 9: Backend Complete - Validation

**9.1. Run All Tests**
```bash
npm test
npm test -- --coverage
```

**9.2. Manual API Testing**
Use Postman or curl to verify all endpoints match contracts

**9.3. Backend Ready**
Backend is now complete and ready for frontend integration

---

### Phase 10: Frontend Initialization

**10.1. Create Frontend**
```bash
npm create vite@latest frontend -- --template react-ts
cd frontend
```

**10.2. Frontend Dependencies**
```bash
npm install @mui/material @emotion/react @emotion/styled
npm install react-dnd react-dnd-html5-backend
npm install @tanstack/react-query axios socket.io-client
npm install react-router-dom
```

**10.3. Vite Configuration** (`vite.config.ts`)
```typescript
export default defineConfig({
  server: {
    proxy: {
      '/api': 'http://localhost:3000'  // Proxy API calls during development
    }
  }
})
```

**10.4. MUI Theme** (`src/styles/theme.ts`)
```typescript
import { createTheme } from '@mui/material/styles'

export const theme = createTheme({
  palette: {
    primary: { main: '#1976d2' },
    secondary: { main: '#dc004e' }
  }
})
```

---

### Phase 11: Shared Types

**11.1. Create Shared Types Directory**
```bash
mkdir -p ../shared/types
```

**11.2. Define Types** (matching Prisma schema)
```typescript
// shared/types/user.ts
export enum UserRole {
  PM = 'PM',
  Engineer = 'Engineer'
}

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl: string | null
  createdAt: string
}

// shared/types/task.ts
export enum TaskStatus {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  InReview = 'In Review',
  Done = 'Done'
}

export interface Task {
  id: string
  projectId: string
  title: string
  description: string | null
  status: TaskStatus
  assignedTo: string | null
  orderIndex: number
  createdAt: string
  updatedAt: string
  assignee?: {
    id: string
    name: string
    avatarUrl: string | null
  }
}

// Similar for Project, Comment, etc.
```

**11.3. Import in Both Projects**
```typescript
// backend/src/services/projectsService.ts
import { Task, TaskStatus } from '../../../shared/types/task'

// frontend/src/hooks/useTasks.ts
import { Task, TaskStatus } from '../../../shared/types/task'
```

---

### Phase 12-18: Frontend Implementation

(Detailed frontend implementation steps continue similarly with:)
- Phase 12: API Client Layer
- Phase 13: React Hooks
- Phase 14: User Selection Page
- Phase 15: Project List Page
- Phase 16: Kanban Board with Drag-Drop
- Phase 17: Task Detail Modal
- Phase 18: AI Help Panel

(Each phase follows the same pattern: create files, implement logic, write tests)

---

## Drag-Drop Order Management Algorithm

**CRITICAL**: This algorithm is referenced in Phase 5 (Tasks Service). Implement exactly as specified.

### Scenario 1: Reorder Within Same Column

```typescript
/**
 * User drags task from index 2 to index 5 within "In Progress" column
 * Current order: [taskA(0), taskB(1), draggedTask(2), taskC(3), taskD(4), taskE(5)]
 * Desired order: [taskA(0), taskB(1), taskC(2), taskD(3), taskE(4), draggedTask(5)]
 */
async function reorderWithinColumn(
  taskId: string,
  newIndex: number,
  projectId: string,
  status: TaskStatus
) {
  // 1. Get all tasks in this column
  const tasksInColumn = await prisma.task.findMany({
    where: { projectId, status },
    orderBy: { orderIndex: 'asc' }
  })

  // 2. Remove dragged task from array
  const draggedTask = tasksInColumn.find(t => t.id === taskId)
  const filtered = tasksInColumn.filter(t => t.id !== taskId)

  // 3. Insert at new position
  filtered.splice(newIndex, 0, draggedTask)

  // 4. Recalculate ALL orderIndex values sequentially
  // CRITICAL: Use transaction to ensure atomicity
  await prisma.$transaction(
    filtered.map((task, index) =>
      prisma.task.update({
        where: { id: task.id },
        data: { orderIndex: index }
      })
    )
  )
}
```

### Scenario 2: Move to Different Column

```typescript
/**
 * User drags task from "To Do" to "In Progress" (drop at index 3)
 */
async function moveToNewColumn(
  taskId: string,
  newStatus: TaskStatus,
  newIndex: number,
  projectId: string
) {
  const task = await prisma.task.findUnique({ where: { id: taskId } })
  const oldStatus = task.status

  // CRITICAL: Use transaction for all updates
  await prisma.$transaction(async (tx) => {
    // 1. Update dragged task
    await tx.task.update({
      where: { id: taskId },
      data: {
        status: newStatus,
        orderIndex: newIndex
      }
    })

    // 2. Recalculate old column (close gap)
    const oldColumnTasks = await tx.task.findMany({
      where: { projectId, status: oldStatus, id: { not: taskId } },
      orderBy: { orderIndex: 'asc' }
    })

    for (let i = 0; i < oldColumnTasks.length; i++) {
      await tx.task.update({
        where: { id: oldColumnTasks[i].id },
        data: { orderIndex: i }
      })
    }

    // 3. Recalculate new column (make space)
    const newColumnTasks = await tx.task.findMany({
      where: { projectId, status: newStatus, id: { not: taskId } },
      orderBy: { orderIndex: 'asc' }
    })

    // Insert dragged task at correct position
    const reordered = [...newColumnTasks]
    reordered.splice(newIndex, 0, task)

    for (let i = 0; i < reordered.length; i++) {
      if (reordered[i].id !== taskId) {
        await tx.task.update({
          where: { id: reordered[i].id },
          data: { orderIndex: i }
        })
      }
    }
  })
}
```

### Frontend Optimistic Update

```typescript
// frontend/src/hooks/useTasks.ts
import { useMutation, useQueryClient } from '@tanstack/react-query'

export function useUpdateTask() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (data: { taskId: string, status: TaskStatus, orderIndex: number }) =>
      tasksApi.updateTask(data.taskId, { status: data.status, orderIndex: data.orderIndex }),

    onMutate: async (newData) => {
      // 1. Cancel outgoing refetches (prevent overwriting optimistic update)
      await queryClient.cancelQueries(['tasks', projectId])

      // 2. Snapshot current data
      const previousTasks = queryClient.getQueryData(['tasks', projectId])

      // 3. Optimistically update UI
      queryClient.setQueryData(['tasks', projectId], (old) => {
        return calculateNewOrder(old, newData)  // Instant visual feedback
      })

      return { previousTasks }  // Return context for rollback
    },

    onError: (err, newData, context) => {
      // 4. Rollback on error
      queryClient.setQueryData(['tasks', projectId], context.previousTasks)
      showNotification('Failed to move task. Please try again.')
    },

    onSettled: () => {
      // 5. Refetch to sync with server (WebSocket event will also trigger update)
      queryClient.invalidateQueries(['tasks', projectId])
    }
  })
}
```

### Performance Considerations

- **Composite Index**: `(projectId, status, orderIndex)` ensures fast sorted retrieval
- **Batch Updates**: Use Prisma transactions to update all orderIndex values atomically
- **Optimistic Updates**: Frontend shows change immediately; server sync happens async
- **WebSocket Broadcast**: AFTER database transaction succeeds, emit `task:updated` event

---

## Risk Mitigations

- **OpenAI API reliability**: Wrap in try-catch; return graceful fallback message on error
- **WebSocket connection issues**: Socket.IO handles reconnection with exponential backoff automatically
- **Drag-drop browser compatibility**: React DnD abstracts browser differences
- **Type safety**: Shared types prevent client-server drift; Prisma generates DB types
- **Race conditions**: Use Prisma transactions for multi-step database updates

---

## Performance Optimizations

- **Database Indexes**: All foreign keys + composite index on (projectId, status, orderIndex)
- **React Query Caching**: Minimize redundant API calls; 5-minute stale time
- **Optimistic Updates**: Drag-drop shows instant feedback before server confirmation
- **WebSocket Rooms**: Only broadcast to clients viewing relevant project (not global)
- **Connection Pooling**: Prisma default pool size (10 connections) sufficient for MVP
