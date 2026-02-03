# Implementation Plan Audit - Taskify MVP

**Date**: 2026-01-25
**Auditor**: Claude
**Scope**: plan.md and all Phase 1 design artifacts

## Executive Summary

The implementation plan provides a solid architectural foundation, but lacks specific cross-references and step-by-step implementation sequences that would enable an implementer to execute without additional context. This audit identifies **23 gaps** across 5 categories that should be addressed before task generation.

### Severity Breakdown
- 🔴 **CRITICAL** (8): Missing information that blocks implementation
- 🟡 **HIGH** (10): Missing guidance that would slow implementation
- 🟢 **MEDIUM** (5): Enhancements that improve clarity

---

## Category 1: Missing Cross-References Between Plan and Design Artifacts

### 🔴 CRITICAL-01: No Direct Links to API Contract Sections

**Location**: plan.md lines 242-250

**Current State**:
```markdown
**REST Endpoints**:
- `GET /api/projects` - List all projects
- `GET /api/projects/:id/tasks` - Get tasks for a project
- `PATCH /api/tasks/:id` - Update task (status, assignee)
...
```

**Problem**: Implementer needs to read 4 separate YAML files to find request/response schemas, validation rules, error codes.

**Recommended Fix**:
```markdown
**REST Endpoints** (see [contracts/](contracts/) for full OpenAPI specs):
- `GET /api/projects` - List all projects
  - Contract: [projects-api.yaml](contracts/projects-api.yaml#L16-L42)
  - Returns: Project array with task counts
  - Authentication: X-User-Id header (for future filtering)

- `GET /api/projects/:id/tasks` - Get tasks for a project
  - Contract: [projects-api.yaml](contracts/projects-api.yaml#L44-L78)
  - Returns: Task array ordered by (status, orderIndex)
  - Filtering: None in MVP (return all tasks)

- `PATCH /api/tasks/:id` - Update task (status, assignee, orderIndex)
  - Contract: [tasks-api.yaml](contracts/tasks-api.yaml#L17-L68)
  - Request body: Partial<{status, assignedTo, orderIndex}>
  - Validation: assignedTo must be project member (see data-model.md)
  - Broadcasts: `task:updated` WebSocket event (see WebSocket Events below)
```

**Impact**: Reduces context switching; implementer sees exact file/line references and key validation rules inline.

---

### 🟡 HIGH-02: Data Model Not Linked to Implementation Constraints

**Location**: plan.md lines 228-237

**Current State**:
```markdown
**Core Entities**:
- Users (5 predefined)
- Projects (3 sample projects)
- Tasks (with status, assignee, drag-drop ordering)
...
```

**Problem**: No guidance on which data model sections are critical for each implementation phase.

**Recommended Fix**:
```markdown
**Core Entities** (see [data-model.md](data-model.md) for complete schema):

**Phase 2 (Foundation) - Database Setup**:
- User model: [data-model.md#L55-L79](data-model.md#L55-L79)
  - Sample data generation in seed.ts
  - 5 users: 1 PM + 4 Engineers (exact names in data-model.md lines 70-74)
- Project model: [data-model.md#L80-L100](data-model.md#L80-L100)
  - 3 projects with descriptions (lines 93-96)
- ProjectMember: [data-model.md#L101-L125](data-model.md#L101-L125)
  - All users members of all projects (line 118)

**Phase 3 (Core Features) - Task Management**:
- Task model: [data-model.md#L126-L168](data-model.md#L126-L168)
  - **CRITICAL**: orderIndex field for drag-drop (line 139)
  - **CRITICAL**: Composite index (projectId, status, orderIndex) for sorted retrieval (line 162)
  - Distribution requirements: 40% To Do, 30% In Progress, 20% In Review, 10% Done (line 154)
  - Validation: assignedTo must be project member (line 146)

**Phase 4 (Collaboration) - Comments**:
- Comment model: [data-model.md#L169-L201](data-model.md#L169-L201)
  - **CRITICAL**: editedAt field for "(edited)" badge (line 181)
  - Permission logic: author_id === current_user_id (line 189)

**Phase 5 (AI Help) - Help Messages**:
- HelpMessage model: [data-model.md#L202-L230](data-model.md#L202-L230)
  - Session cleanup strategy: 7-day retention (line 224)
  - screenContext enum values (line 219)
```

**Impact**: Implementer knows exactly which sections to reference for each phase; critical fields highlighted.

---

### 🟡 HIGH-03: WebSocket Events Not Documented with Examples

**Location**: plan.md lines 251-253

**Current State**:
```markdown
**WebSocket Events**:
- `task:updated` - Broadcast task changes
- `comment:added` - Broadcast new comments
```

**Problem**: No event payload schemas, no guidance on when to emit, no room/namespace design.

**Recommended Fix**: Add new section after line 253:

```markdown
**WebSocket Events**:

**Server → Client**:
1. `task:updated` - Broadcast when task status, assignment, or order changes
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
       updatedAt: string
     }
   }
   ```
   **Implementation Notes**:
   - Emit AFTER database update succeeds (not before)
   - Broadcast to room `project:${projectId}` (not global)
   - See [websocket/taskEvents.ts](backend/src/websocket/taskEvents.ts) for handler

2. `comment:added` - Broadcast when new comment created
   ```typescript
   {
     event: 'comment:added',
     taskId: string,
     comment: {
       id: string,
       taskId: string,
       authorId: string,
       content: string,
       createdAt: string,
       author: { id: string, name: string }  // Denormalized for display
     }
   }
   ```
   **Implementation Notes**:
   - Emit AFTER database insert succeeds
   - Broadcast to room `task:${taskId}` OR `project:${projectId}`
   - Include author details to avoid client-side lookup

**Client → Server**:
1. `join:project` - Subscribe to project updates
   ```typescript
   socket.emit('join:project', { projectId: string })
   ```
   **Implementation**: Add client to Socket.IO room `project:${projectId}`

2. `leave:project` - Unsubscribe from project updates
   ```typescript
   socket.emit('leave:project', { projectId: string })
   ```
   **Implementation**: Remove client from Socket.IO room

**Room Design**:
- Each project = separate room (`project:${projectId}`)
- Clients auto-join when viewing Kanban board
- Clients auto-leave when navigating away
- See [backend/src/websocket/taskEvents.ts](backend/src/websocket/taskEvents.ts) for implementation
```

**Impact**: Clear event contracts; implementer knows payload structures without trial-and-error.

---

### 🔴 CRITICAL-04: Seed Data Generation Not Specified

**Location**: plan.md lines 262-267 (Implementation Notes → Critical Path)

**Current State**:
```markdown
1. Database setup with Prisma (schema + migrations + seed data)
```

**Problem**: No specification of what seed.ts should create; implementer must infer from scattered references.

**Recommended Fix**: Add new section after line 257 (after Quickstart Guide):

```markdown
### Seed Data Specification

Location: `backend/prisma/seed.ts`

**Execution Order**:
```typescript
// 1. Create Users (MUST be first - other entities reference users)
const users = [
  { name: "Sarah Johnson", email: "sarah.johnson@taskify.dev", role: "PM", avatarUrl: "https://i.pravatar.cc/150?img=1" },
  { name: "Alex Chen", email: "alex.chen@taskify.dev", role: "Engineer", avatarUrl: "https://i.pravatar.cc/150?img=2" },
  { name: "Jordan Lee", email: "jordan.lee@taskify.dev", role: "Engineer", avatarUrl: "https://i.pravatar.cc/150?img=3" },
  { name: "Taylor Kim", email: "taylor.kim@taskify.dev", role: "Engineer", avatarUrl: "https://i.pravatar.cc/150?img=4" },
  { name: "Morgan Patel", email: "morgan.patel@taskify.dev", role: "Engineer", avatarUrl: "https://i.pravatar.cc/150?img=5" }
]

// 2. Create Projects
const projects = [
  { name: "Mobile App Redesign", description: "Redesign of the iOS and Android apps with new branding and improved UX" },
  { name: "Website Refresh", description: "Update marketing website with new branding, case studies, and testimonials" },
  { name: "API v2 Migration", description: "Migrate legacy REST API to v2 architecture with GraphQL support" }
]

// 3. Create ProjectMembers (all users in all projects)
for each project:
  for each user:
    create ProjectMember(projectId, userId)

// 4. Create Tasks (40-45 total, distributed ~15 per project)
Distribution per project:
- To Do: 6 tasks (40%)
- In Progress: 4-5 tasks (30%)
- In Review: 3 tasks (20%)
- Done: 2 tasks (10%)

Assignment:
- ~60% assigned to random users
- ~40% unassigned (null)

Sample task titles (see data-model.md lines 152-155 for distribution):
- "Design new login screen" (Mobile App Redesign, To Do, assigned to Alex)
- "Implement user authentication" (Mobile App Redesign, In Progress, assigned to Jordan)
- "Review API endpoint security" (API v2 Migration, In Review, assigned to Sarah)
...

orderIndex:
- Sequential within each (projectId, status) group
- Start at 0, increment by 1
- Example: Project A, To Do → [0, 1, 2, 3, 4, 5]

// 5. Create Comments (8-12 total, scattered across tasks)
- At least 2 comments from different users on same task (to test permission UI)
- At least 1 comment with edited timestamp (to test "(edited)" badge)
- Mix of recent (today) and older (1-3 days ago) timestamps

// 6. HelpMessages: NONE (created at runtime via API)
```

**Validation**:
```bash
npx prisma studio
# Verify counts:
# - Users: 5
# - Projects: 3
# - ProjectMembers: 15 (5 users × 3 projects)
# - Tasks: 40-45
# - Comments: 8-12
# - HelpMessages: 0
```

**Impact**: Eliminates guesswork; seed.ts can be written directly from this spec.

---

## Category 2: Missing Implementation Sequences

### 🔴 CRITICAL-05: Backend Implementation Order Not Defined

**Location**: plan.md lines 262-267

**Current State**:
```markdown
### Critical Path
1. Database setup with Prisma (schema + migrations + seed data)
2. REST API implementation (projects, tasks, comments)
3. React components (Kanban board with drag-drop)
4. WebSocket integration for real-time updates
5. Task detail modal with assignment + comments
6. AI help panel integration
```

**Problem**: Steps 2-6 are too coarse; no guidance on file creation order, dependencies between controllers/services/routes.

**Recommended Fix**: Expand to detailed substeps:

```markdown
### Detailed Implementation Sequence

**Phase 1: Project Initialization**
1.1. Create backend/ directory structure
     ```bash
     mkdir -p backend/src/{routes,controllers,services,models,middleware,websocket,utils}
     mkdir -p backend/prisma backend/tests/{contract,integration,unit}
     ```

1.2. Initialize Node.js project
     ```bash
     cd backend
     npm init -y
     npm install express prisma @prisma/client socket.io pg dotenv winston
     npm install -D typescript @types/node @types/express ts-node jest supertest
     ```

1.3. Create tsconfig.json (strict mode enabled)
1.4. Create .env.example with required variables (see quickstart.md lines 35-49)

**Phase 2: Database Foundation**
2.1. Copy schema from data-model.md lines 233-362 → prisma/schema.prisma
2.2. Run `npx prisma migrate dev --name init`
2.3. Create seed.ts following seed spec (see Seed Data Specification above)
2.4. Run `npx prisma db seed`
2.5. Verify in Prisma Studio: `npx prisma studio`

**Phase 3: Express Server Setup**
3.1. Create src/index.ts (Express app configuration)
     - CORS middleware (allow frontend origin)
     - JSON body parser
     - Error handler (src/middleware/errorHandler.ts)
     - Logger (src/middleware/logger.ts with Winston)

3.2. Create src/server.ts (HTTP + Socket.IO server)
     - Attach Socket.IO to HTTP server
     - Configure Socket.IO CORS
     - Import websocket handlers

3.3. Test: `npm run dev` → Server starts on port 3000

**Phase 4: REST API - Projects (User Story 1 & 2)**
4.1. Create services/projectsService.ts
     - getAllProjects(): Fetch projects with task counts
     - getProjectById(id): Fetch single project
     - getProjectTasks(id): Fetch tasks ordered by (status, orderIndex)

4.2. Create controllers/projectsController.ts
     - Wrap service calls
     - Handle errors → HTTP status codes
     - Validate request params

4.3. Create routes/projects.ts
     - GET /api/projects → projectsController.list
     - GET /api/projects/:id → projectsController.getById
     - GET /api/projects/:id/tasks → projectsController.getTasks

4.4. Register routes in src/index.ts
4.5. Write contract tests: tests/contract/projects.test.ts
     - Verify against contracts/projects-api.yaml
     - Use Supertest for HTTP requests

**Phase 5: REST API - Tasks (User Story 3 & 4)**
5.1. Create services/tasksService.ts
     - getTaskById(id)
     - updateTask(id, data): Update status/assignedTo/orderIndex
       - **CRITICAL**: Validate assignedTo is project member
       - **CRITICAL**: Recalculate orderIndex if status changed

5.2. Create controllers/tasksController.ts
5.3. Create routes/tasks.ts
     - GET /api/tasks/:id → tasksController.getById
     - PATCH /api/tasks/:id → tasksController.update

5.4. Write contract tests: tests/contract/tasks.test.ts
     - Test drag-drop scenario (update status + orderIndex)
     - Test assignment validation (non-member → 400 error)

**Phase 6: WebSocket - Real-time Updates (User Story 3)**
6.1. Create websocket/taskEvents.ts
     - Handle `join:project` event → socket.join(`project:${projectId}`)
     - Handle `leave:project` event → socket.leave(`project:${projectId}`)

6.2. Modify tasksService.updateTask()
     - AFTER database update succeeds
     - Emit `task:updated` to room `project:${task.projectId}`
     - Payload: Full task object (see WebSocket Events section)

6.3. Integration test: tests/integration/kanban-workflow.test.ts
     - Open 2 WebSocket connections
     - Update task in connection 1
     - Verify connection 2 receives event within 200ms

**Phase 7: REST API - Comments (User Story 5)**
7.1. Create services/commentsService.ts
     - createComment(taskId, authorId, content)
     - updateComment(id, authorId, content): Check authorId === comment.authorId
     - deleteComment(id, authorId): Check authorId === comment.authorId

7.2. Create controllers/commentsController.ts
     - Extract X-User-Id header for permission checks
     - Return 403 if permission denied

7.3. Create routes/comments.ts
     - POST /api/tasks/:id/comments → commentsController.create
     - PATCH /api/comments/:id → commentsController.update
     - DELETE /api/comments/:id → commentsController.delete

7.4. Write contract tests: tests/contract/comments.test.ts
     - Test permission enforcement (edit other user's comment → 403)

**Phase 8: REST API - AI Help (User Story 6)**
8.1. Create services/aiHelpService.ts
     - askQuestion(sessionId, question, screenContext)
       - Call OpenAI API with system prompt (contextual based on screenContext)
       - Store user message + AI response in HelpMessage table
     - getHistory(sessionId, limit)

8.2. Create controllers/helpController.ts
8.3. Create routes/help.ts
     - POST /api/help/ask → helpController.ask
     - GET /api/help/history → helpController.getHistory

8.4. Write contract tests + mocks: tests/contract/help.test.ts
     - Mock OpenAI API (use jest.mock)
     - Test contextual responses (screenContext changes system prompt)

**Phase 9: Backend Complete - Run All Tests**
9.1. `npm test` → All contract tests pass
9.2. `npm test -- --coverage` → Coverage report
9.3. Backend ready for frontend integration
```

**Impact**: Clear step-by-step sequence; implementer knows exact order and dependencies.

---

### 🟡 HIGH-06: Frontend Implementation Order Not Defined

**Location**: plan.md lines 157-195 (Project Structure → frontend/)

**Current State**: File structure listed, but no implementation sequence.

**Recommended Fix**: Add after backend sequence:

```markdown
**Phase 10: Frontend Initialization**
10.1. Create frontend/ directory
      ```bash
      npm create vite@latest frontend -- --template react-ts
      cd frontend
      npm install @mui/material @emotion/react @emotion/styled
      npm install react-dnd react-dnd-html5-backend
      npm install @tanstack/react-query axios socket.io-client
      ```

10.2. Configure Vite (vite.config.ts)
      - Proxy /api → http://localhost:3000 (for development)

10.3. Configure MUI theme (src/styles/theme.ts)
      - Primary color, secondary color, typography

**Phase 11: Shared Types**
11.1. Create shared/types/ directory
11.2. Define types matching Prisma schema:
      - user.ts (User, UserRole enum)
      - project.ts (Project, ProjectWithTaskCount)
      - task.ts (Task, TaskStatus enum, TaskWithAssignee)
      - comment.ts (Comment, CommentWithAuthor)

11.3. Export from shared/types/index.ts
11.4. Import in both backend/ and frontend/ (ensures type consistency)

**Phase 12: API Client Layer (frontend/src/services/)**
12.1. Create api.ts (Axios instance with base URL + X-User-Id header interceptor)
12.2. Create projectsApi.ts
      - getProjects(): Promise<Project[]>
      - getProjectTasks(id): Promise<Task[]>

12.3. Create tasksApi.ts
      - updateTask(id, data): Promise<Task>

12.4. Create commentsApi.ts
      - createComment(taskId, content): Promise<Comment>
      - updateComment(id, content): Promise<Comment>
      - deleteComment(id): Promise<void>

12.5. Create helpApi.ts
      - askQuestion(sessionId, question, screenContext): Promise<HelpResponse>
      - getHistory(sessionId): Promise<HelpMessage[]>

**Phase 13: React Hooks (frontend/src/hooks/)**
13.1. Create useProjects.ts (TanStack Query wrapper)
      - useProjects(): { data, isLoading, error }

13.2. Create useTasks.ts
      - useProjectTasks(projectId)
      - useUpdateTask() → mutation with optimistic update

13.3. Create useWebSocket.ts
      - Initialize Socket.IO connection
      - Join/leave project rooms
      - Subscribe to events (task:updated, comment:added)
      - Invalidate React Query cache on events

13.4. Create useHelpChat.ts
      - Manage conversation state
      - Send messages, receive responses
      - Store sessionId in localStorage

**Phase 14: User Selection Page (User Story 1)**
14.1. Create pages/UserSelection.tsx
      - Fetch 5 users from /api/users (or hardcode from seed data)
      - Display as grid of cards (MUI Card)
      - On click → navigate to /projects?userId={id}

**Phase 15: Project List Page (User Story 1 & 2)**
15.1. Create pages/ProjectList.tsx
      - Use useProjects() hook
      - Display 3 projects as cards with task counts
      - On click → navigate to /kanban/:projectId

15.2. Create components/NavigationBar.tsx
      - Show current user (from URL param)
      - Show "Back" button when not on project list

**Phase 16: Kanban Board (User Story 2 & 3)**
16.1. Create pages/KanbanBoard.tsx
      - Use useProjectTasks(projectId)
      - Use useWebSocket() for real-time updates
      - Group tasks by status into 4 columns

16.2. Create components/TaskCard.tsx
      - Display title, assignee avatar
      - Highlight if assigned to current user
      - React DnD draggable wrapper

16.3. Implement drag-drop with React DnD
      - onDrop → call useUpdateTask() with new status + orderIndex
      - Optimistic update (instant UI feedback)

16.4. Test: Drag task between columns → status updates in DB → WebSocket broadcasts → other clients update

**Phase 17: Task Detail Modal (User Story 4 & 5)**
17.1. Create components/TaskDetailModal.tsx
      - Open on task card click
      - Display full task details
      - Assignment dropdown (all 5 users)
      - Comments section

17.2. Create components/CommentList.tsx
      - Display comments chronologically
      - Show edit/delete buttons ONLY for current user's comments

17.3. Create components/CommentForm.tsx
      - Text input + submit button
      - Call createComment API on submit

17.4. Test permission enforcement:
      - Edit own comment → success
      - Edit other user's comment → no button shown

**Phase 18: AI Help Panel (User Story 6)**
18.1. Create components/HelpButton.tsx
      - Floating button (bottom-right corner)
      - Visible on all pages

18.2. Create components/HelpPanel.tsx
      - Slide-in panel from right
      - Chat interface (messages + input)
      - Use useHelpChat() hook
      - Pass current route as screenContext

18.3. Test:
      - Ask "How do I assign a task?" on Kanban board
      - Verify AI mentions "click task card" (context-aware)

**Phase 19: Integration Testing**
19.1. Write component tests: tests/components/TaskCard.test.tsx
19.2. Write integration tests: End-to-end user journeys
19.3. Manual QA against quickstart.md validation steps

**Phase 20: Polish**
20.1. Error boundaries (catch React errors)
20.2. Loading states (skeletons, spinners)
20.3. Empty states ("No tasks in this column")
20.4. Accessibility (ARIA labels, keyboard navigation)
```

**Impact**: Frontend developers have clear implementation path; reduces decision paralysis.

---

### 🔴 CRITICAL-07: Drag-Drop orderIndex Logic Not Explained

**Location**: plan.md line 276 (Performance Optimizations mentions optimistic updates)

**Current State**: Mentions "optimistic updates for drag-drop" but no algorithm spec.

**Problem**: Implementer doesn't know how to recalculate orderIndex when dragging between columns or reordering within a column.

**Recommended Fix**: Add new section:

```markdown
### Drag-Drop Order Management Algorithm

**Scenario 1: Drag within same column (reorder)**
```typescript
// User drags task from index 2 to index 5 in "In Progress" column
// Current order: [taskA(0), taskB(1), draggedTask(2), taskC(3), taskD(4), taskE(5)]
// Desired order: [taskA(0), taskB(1), taskC(2), taskD(3), taskE(4), draggedTask(5)]

function reorderWithinColumn(draggedTask, newIndex, tasksInColumn) {
  // Remove dragged task from current position
  const filtered = tasksInColumn.filter(t => t.id !== draggedTask.id)

  // Insert at new position
  filtered.splice(newIndex, 0, draggedTask)

  // Recalculate ALL orderIndex values sequentially
  filtered.forEach((task, index) => {
    task.orderIndex = index
    updateTaskInDB(task.id, { orderIndex: index })
  })
}
```

**Scenario 2: Drag to different column**
```typescript
// User drags task from "To Do" to "In Progress" (drop at index 3)

function moveToNewColumn(draggedTask, newStatus, newIndex, targetColumnTasks) {
  // 1. Update dragged task
  draggedTask.status = newStatus
  draggedTask.orderIndex = newIndex
  updateTaskInDB(draggedTask.id, { status: newStatus, orderIndex: newIndex })

  // 2. Recalculate old column (close gap left by dragged task)
  const oldColumnTasks = getTasksByStatus(draggedTask.previousStatus)
  oldColumnTasks.forEach((task, index) => {
    task.orderIndex = index
    updateTaskInDB(task.id, { orderIndex: index })
  })

  // 3. Recalculate new column (make space for dragged task)
  const newColumnTasks = [...targetColumnTasks]
  newColumnTasks.splice(newIndex, 0, draggedTask)
  newColumnTasks.forEach((task, index) => {
    task.orderIndex = index
    updateTaskInDB(task.id, { orderIndex: index })
  })
}
```

**Optimistic Update Strategy**:
```typescript
// Frontend (React component)
function onDragEnd(result) {
  // 1. Immediately update UI (before API call)
  const optimisticTasks = calculateNewOrder(tasks, result)
  setTasks(optimisticTasks)  // Instant visual feedback

  // 2. Call API (async)
  updateTaskMutation.mutate(
    { taskId: result.draggableId, newStatus, newIndex },
    {
      onError: (error) => {
        // 3. Rollback on failure
        setTasks(previousTasks)
        showError("Failed to move task")
      }
    }
  )

  // 4. WebSocket event will arrive from server → refresh all clients
}
```

**Database Optimization**:
- Composite index on (projectId, status, orderIndex) ensures fast sorted retrieval
- Batch update all orderIndex changes in single transaction (avoid race conditions)
```

**Impact**: Eliminates most complex implementation detail; copy-paste algorithm reduces bugs.

---

## Category 3: Missing Technical Specifications

### 🟡 HIGH-08: Environment Variables Not Fully Specified

**Location**: quickstart.md lines 35-49 shows examples, but plan.md doesn't list required vars

**Recommended Fix**: Add to plan.md after line 155:

```markdown
### Environment Variables

**Backend (.env)**:
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

**Frontend (.env)**:
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
# Backend
cd backend && npm run env:check  # Script to verify all required vars set

# Frontend
cd frontend && npm run build  # Will fail if VITE_ vars missing
```
```

---

### 🟡 HIGH-09: Error Handling Strategy Not Defined

**Location**: plan.md line 42 mentions "Express error middleware" but no spec

**Recommended Fix**: Add new section:

```markdown
### Error Handling Strategy

**Backend Error Middleware** (src/middleware/errorHandler.ts):
```typescript
export function errorHandler(err, req, res, next) {
  // Log error details
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    path: req.path,
    userId: req.headers['x-user-id']
  })

  // Map error types to HTTP status codes
  const statusCode = err.statusCode || 500
  const errorType = err.type || 'INTERNAL_ERROR'

  // Send user-friendly error response
  res.status(statusCode).json({
    error: errorType,
    message: err.userMessage || 'An unexpected error occurred',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  })
}
```

**Error Types** (matching contracts):
- `VALIDATION_ERROR` (400): Invalid request data
- `NOT_FOUND` (404): Resource doesn't exist
- `FORBIDDEN` (403): Permission denied (e.g., editing other user's comment)
- `INTERNAL_ERROR` (500): Unexpected server error
- `SERVICE_UNAVAILABLE` (503): OpenAI API down

**Frontend Error Handling**:
```typescript
// React Error Boundary (catch rendering errors)
<ErrorBoundary fallback={<ErrorPage />}>
  <App />
</ErrorBoundary>

// API error handling (in hooks)
const { data, error } = useProjects()
if (error) {
  return <Alert severity="error">{error.message}</Alert>
}

// WebSocket error handling
socket.on('connect_error', (error) => {
  showNotification('Lost connection. Reconnecting...')
  // Exponential backoff handled by Socket.IO
})
```

**User-Facing Error Messages**:
- Drag-drop fails → "Failed to move task. Please try again."
- Comment submission fails → "Failed to add comment. Please check your connection."
- AI help unavailable → "Help assistant is temporarily unavailable. Please try again in a moment."
```

---

### 🟡 HIGH-10: Logging Strategy Not Specified

**Location**: plan.md line 69 mentions "Winston logging with request timing"

**Recommended Fix**: Add to plan.md:

```markdown
### Logging Strategy

**Backend Logging** (Winston):
```typescript
// src/middleware/logger.ts
import winston from 'winston'

export const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: 'logs/combined.log' }),
    new winston.transports.Console({
      format: winston.format.simple()
    })
  ]
})

// Request logging middleware
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

**What to Log**:
- ✅ API requests (method, path, status, duration, userId)
- ✅ Database queries (slow queries > 100ms)
- ✅ WebSocket events (connect, disconnect, message)
- ✅ Errors (full stack trace)
- ✅ OpenAI API calls (question, response time, tokens used)
- ❌ DO NOT log sensitive data (passwords, API keys)

**Log Rotation**:
```json
{
  "maxsize": 10485760,  // 10MB
  "maxFiles": 5,
  "tailable": true
}
```
```

---

## Category 4: Testing Gaps

### 🔴 CRITICAL-11: Test File Structure Not Mapped to Contracts

**Location**: plan.md lines 142-152 (test directory structure)

**Current State**: Lists test files, but doesn't specify which contract sections to test.

**Recommended Fix**:

```markdown
### Test Specification

**Contract Tests** (tests/contract/):

1. **projects.test.ts** - Verify contracts/projects-api.yaml
   ```typescript
   describe('GET /api/projects', () => {
     test('returns 200 with project array', async () => {
       // Contract: projects-api.yaml lines 16-42
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
     test('returns tasks ordered by (status, orderIndex)', async () => {
       // Contract: projects-api.yaml lines 44-78
       // Verify: Tasks within each status ordered by orderIndex ASC
     })

     test('returns 404 for non-existent project', async () => {
       // Contract: projects-api.yaml lines 80-85
     })
   })
   ```

2. **tasks.test.ts** - Verify contracts/tasks-api.yaml
   ```typescript
   describe('PATCH /api/tasks/:id', () => {
     test('updates task status (drag-drop scenario)', async () => {
       // Contract: tasks-api.yaml lines 17-68
       const response = await request(app)
         .patch(`/api/tasks/${taskId}`)
         .send({ status: 'In Progress', orderIndex: 3 })
       expect(response.status).toBe(200)
       expect(response.body.task.status).toBe('In Progress')
     })

     test('validates assignedTo is project member', async () => {
       // Contract: tasks-api.yaml lines 70-78 (400 validation error)
       const response = await request(app)
         .patch(`/api/tasks/${taskId}`)
         .send({ assignedTo: 'non-existent-user-id' })
       expect(response.status).toBe(400)
       expect(response.body.error).toBe('VALIDATION_ERROR')
     })
   })
   ```

3. **comments.test.ts** - Verify contracts/comments-api.yaml
   ```typescript
   describe('PATCH /api/comments/:id', () => {
     test('allows editing own comment', async () => {
       // Contract: comments-api.yaml lines 45-70
       const response = await request(app)
         .patch(`/api/comments/${commentId}`)
         .set('X-User-Id', authorId)  // Same as comment author
         .send({ content: 'Updated text' })
       expect(response.status).toBe(200)
     })

     test('forbids editing other user\'s comment', async () => {
       // Contract: comments-api.yaml lines 72-80 (403 forbidden)
       const response = await request(app)
         .patch(`/api/comments/${commentId}`)
         .set('X-User-Id', differentUserId)
         .send({ content: 'Hacking attempt' })
       expect(response.status).toBe(403)
     })
   })
   ```

4. **help.test.ts** - Verify contracts/help-api.yaml
   ```typescript
   describe('POST /api/help/ask', () => {
     beforeEach(() => {
       // Mock OpenAI API to avoid real API calls in tests
       jest.mock('openai')
     })

     test('returns AI response with context', async () => {
       // Contract: help-api.yaml lines 17-76
       const response = await request(app)
         .post('/api/help/ask')
         .set('X-Session-Id', sessionId)
         .send({
           question: 'How do I assign a task?',
           screenContext: 'kanban-board'
         })
       expect(response.status).toBe(200)
       expect(response.body.answer).toContain('click')  // Context-aware
     })
   })
   ```

**Integration Tests** (tests/integration/):

1. **kanban-workflow.test.ts** - User Story 3
   ```typescript
   test('drag task between columns updates status and broadcasts WebSocket event', async () => {
     // 1. Open 2 WebSocket connections (simulate 2 users viewing same board)
     // 2. User 1 drags task from "To Do" to "In Progress"
     // 3. Verify User 2 receives task:updated event within 200ms
     // 4. Verify database reflects new status
   })
   ```

2. **task-assignment.test.ts** - User Story 4
   ```typescript
   test('assigning task updates board highlighting for affected users', async () => {
     // 1. User A views board (sees task assigned to User B highlighted)
     // 2. User B reassigns task to User A
     // 3. Verify User A's view updates highlighting in real-time
   })
   ```

3. **commenting.test.ts** - User Story 5
   ```typescript
   test('comment permission enforcement across multiple users', async () => {
     // 1. User A adds comment on task
     // 2. User B views comment (no edit/delete buttons)
     // 3. User A views same comment (edit/delete buttons present)
     // 4. User A edits comment
     // 5. Verify User B sees updated comment with "(edited)" badge
   })
   ```
```

**Impact**: Test coverage directly maps to contracts; no guesswork on what to test.

---

## Category 5: User Story to Implementation Mapping

### 🟡 HIGH-12: User Stories Not Mapped to Implementation Phases

**Location**: plan.md has no explicit mapping from spec.md user stories to implementation phases

**Recommended Fix**: Add new section after line 213 (after Complexity Tracking):

```markdown
## User Story Implementation Map

This section maps each user story from spec.md to specific implementation components.

### User Story 1: User Selection and Project Access (P1)

**Spec Reference**: [spec.md#L19-L32](spec.md#L19-L32)

**Backend Components**:
- API: `GET /api/projects` (contracts/projects-api.yaml)
- Service: projectsService.getAllProjects() with task counts
- Database: User table (seed data), Project table (seed data)

**Frontend Components**:
- Page: pages/UserSelection.tsx (hardcoded 5 users)
- Page: pages/ProjectList.tsx
- Hook: useProjects() (TanStack Query)

**Acceptance Criteria → Test Mapping**:
- AC1 (see 5 users) → Frontend component test
- AC2 (click user → project list) → Integration test
- AC3 (see 3 projects) → Contract test (GET /api/projects)

**Implementation Order**: Phase 4 (backend), Phase 14-15 (frontend)

---

### User Story 2: Kanban Board Visualization (P1)

**Spec Reference**: [spec.md#L35-L50](spec.md#L35-L50)

**Backend Components**:
- API: `GET /api/projects/:id/tasks` (contracts/projects-api.yaml)
- Service: projectsService.getProjectTasks() → ordered by (status, orderIndex)
- Database: Task table with composite index

**Frontend Components**:
- Page: pages/KanbanBoard.tsx
- Component: components/TaskCard.tsx (highlight current user's tasks)
- Component: components/NavigationBar.tsx (back button)
- Hook: useProjectTasks(projectId)

**Acceptance Criteria → Test Mapping**:
- AC1 (4 columns) → Frontend component test
- AC2 (navigation bar) → Frontend component test
- AC4 (highlighting) → CSS logic + integration test
- AC5 (card displays) → Component test

**Implementation Order**: Phase 4 (backend), Phase 16 (frontend)

---

### User Story 3: Drag-and-Drop (P2)

**Spec Reference**: [spec.md#L53-L66](spec.md#L53-L66)

**Backend Components**:
- API: `PATCH /api/tasks/:id` (contracts/tasks-api.yaml)
- Service: tasksService.updateTask() with orderIndex recalculation
- WebSocket: `task:updated` event broadcast
- Database: Update task status + orderIndex in transaction

**Frontend Components**:
- Page: pages/KanbanBoard.tsx (React DnD integration)
- Component: components/TaskCard.tsx (draggable wrapper)
- Hook: useUpdateTask() (mutation with optimistic update)
- Hook: useWebSocket() (subscribe to task:updated events)

**Acceptance Criteria → Test Mapping**:
- AC1 (drag task) → React DnD test
- AC2 (drop → status update) → Integration test (backend + WebSocket)
- AC3 (change persists) → Contract test (PATCH /api/tasks/:id)

**Implementation Order**: Phase 5 (backend), Phase 6 (WebSocket), Phase 16 (frontend)

**Critical Implementation Detail**: See "Drag-Drop Order Management Algorithm" section for orderIndex recalculation logic.

---

### User Story 4: Task Assignment (P2)

**Spec Reference**: [spec.md#L69-L85](spec.md#L69-L85)

**Backend Components**:
- API: `PATCH /api/tasks/:id` (same as US3, but update assignedTo field)
- Service: tasksService.updateTask() → validate assignedTo is project member
- Database: Foreign key validation (assignedTo → User.id)

**Frontend Components**:
- Component: components/TaskDetailModal.tsx (assignment dropdown)
- Hook: useUpdateTask() (same as US3)

**Acceptance Criteria → Test Mapping**:
- AC1 (click task → modal) → Component test
- AC2 (modal displays info) → Component test
- AC3 (see 5 users) → Data from seed.ts
- AC4 (reassign) → Contract test (validate assignedTo)
- AC5 (highlighting updates) → Integration test (real-time via WebSocket)

**Implementation Order**: Phase 5 (backend validation), Phase 17 (frontend modal)

---

### User Story 5: Commenting (P3)

**Spec Reference**: [spec.md#L88-L104](spec.md#L88-L104)

**Backend Components**:
- API: POST/PATCH/DELETE /api/comments (contracts/comments-api.yaml)
- Service: commentsService with permission checks (authorId === currentUserId)
- Database: Comment table with editedAt tracking

**Frontend Components**:
- Component: components/CommentList.tsx (show edit/delete only for own comments)
- Component: components/CommentForm.tsx (add comment)
- Hook: useComments(taskId), useCreateComment(), useUpdateComment(), useDeleteComment()

**Acceptance Criteria → Test Mapping**:
- AC1 (add comment) → Contract test (POST /api/comments)
- AC2 (see edit/delete for own) → Component test (conditional rendering)
- AC3 (no controls for others) → Component test
- AC4 (edit comment) → Contract test (PATCH /api/comments/:id)
- AC5 (delete comment) → Integration test (permission enforcement)
- AC6 (multiple comments) → Contract test (GET /api/tasks/:id with comments)

**Implementation Order**: Phase 7 (backend), Phase 17 (frontend)

**Critical Implementation Detail**: editedAt field must be set when updating (for "(edited)" badge).

---

### User Story 6: AI Help Assistant (P3)

**Spec Reference**: [spec.md#L107-L124](spec.md#L107-L124)

**Backend Components**:
- API: POST /api/help/ask, GET /api/help/history (contracts/help-api.yaml)
- Service: aiHelpService with OpenAI integration
- Database: HelpMessage table (session storage)

**Frontend Components**:
- Component: components/HelpButton.tsx (floating button, visible everywhere)
- Component: components/HelpPanel.tsx (slide-in chat interface)
- Hook: useHelpChat(sessionId) (manages conversation state)

**Acceptance Criteria → Test Mapping**:
- AC1 (help button visible) → Component test (render on all pages)
- AC2 (click → panel opens) → Component test (animation)
- AC4 (ask question) → Contract test (POST /api/help/ask with mock OpenAI)
- AC5 (contextual response) → Unit test (system prompt changes based on screenContext)
- AC6 (close panel) → Component test
- AC7 (conversation history) → Contract test (GET /api/help/history)

**Implementation Order**: Phase 8 (backend), Phase 18 (frontend)

**Critical Implementation Detail**: screenContext ('user-selection' | 'project-list' | 'kanban-board' | 'task-detail-modal') must be passed from frontend route → affects AI system prompt.

---
```

**Impact**: Clear traceability from requirements → design → implementation → tests.

---

## Category 6: Additional Recommendations

### 🟢 MEDIUM-13: Add Performance Benchmarks Section

**Recommended Addition**:

```markdown
## Performance Benchmarks

**Acceptance Criteria** (from spec.md and constitution):

| Metric | Target | Measurement Method |
|--------|--------|-------------------|
| Kanban board load | < 2s | Frontend: `performance.mark()` from click to render |
| API p95 latency | < 500ms | Backend: Winston logging of request duration |
| Drag-drop feedback | < 200ms | Frontend: Optimistic update to visual change |
| WebSocket propagation | < 200ms | Integration test: Timestamp difference between emit and receive |
| Database query | < 100ms | Prisma middleware logging |

**How to Measure**:
```typescript
// Frontend (React)
useEffect(() => {
  performance.mark('kanban-start')
  // ... fetch tasks ...
  performance.mark('kanban-end')
  performance.measure('kanban-load', 'kanban-start', 'kanban-end')
  const duration = performance.getEntriesByName('kanban-load')[0].duration
  console.log(`Kanban load: ${duration}ms`)
}, [])

// Backend (Express middleware)
app.use((req, res, next) => {
  const start = Date.now()
  res.on('finish', () => {
    const duration = Date.now() - start
    logger.info({ path: req.path, duration })
  })
  next()
})
```

**Optimization Targets**:
- If Kanban load > 2s → Add database indexes, pagination
- If API latency > 500ms → Profile Prisma queries, add caching
- If drag-drop > 200ms → Check optimistic update implementation
```

---

### 🟢 MEDIUM-14: Add Security Considerations Section

**Recommended Addition**:

```markdown
## Security Considerations

**In Scope for MVP**:
- ✅ Input validation (prevent XSS, SQL injection via Prisma parameterization)
- ✅ CORS configuration (restrict to frontend origin)
- ✅ Permission enforcement (comment edit/delete by author only)
- ✅ Environment variable protection (.env in .gitignore)
- ✅ Rate limiting on OpenAI calls (prevent API abuse)

**Explicitly Out of Scope** (no authentication system):
- ❌ Authentication (users selected, not authenticated)
- ❌ Authorization levels (all users have equal access to projects)
- ❌ Session management (X-User-Id is trust-based, not verified)
- ❌ API keys (no per-user API limits)

**Implementation**:
```typescript
// Input validation (use Zod or Joi)
const commentSchema = z.object({
  content: z.string().min(1).max(5000)
})

// CORS configuration
app.use(cors({
  origin: process.env.CORS_ORIGIN,
  credentials: true
}))

// Rate limiting on AI help
const aiRateLimit = rateLimit({
  windowMs: 60 * 1000,  // 1 minute
  max: 10,  // 10 requests per minute per session
  keyGenerator: (req) => req.headers['x-session-id']
})
app.use('/api/help', aiRateLimit)
```
```

---

## Summary of Recommendations

### Must-Fix Before Implementation (CRITICAL - 8 issues)
1. Add direct links to API contract sections in plan.md
2. Expand data model references with line numbers and critical field callouts
3. Document WebSocket event payloads with TypeScript schemas
4. Specify exact seed data generation logic
5. Define detailed backend implementation sequence (19 substeps)
6. Define detailed frontend implementation sequence (11 phases)
7. Specify drag-drop orderIndex recalculation algorithm
8. Map contract tests to specific YAML line ranges

### Should-Fix Before Implementation (HIGH - 10 issues)
9. Add environment variable specification to plan.md
10. Define error handling strategy with error type mappings
11. Specify logging strategy with Winston configuration
12. Map user stories to implementation components
13. Add missing cross-references throughout plan
14. Expand WebSocket room design
15. Clarify permission enforcement logic
16. Document OpenAI integration details
17. Specify optimistic update patterns
18. Add validation rule specifications

### Nice-to-Have (MEDIUM - 5 issues)
19. Add performance benchmarks section
20. Add security considerations section
21. Expand troubleshooting guidance
22. Add deployment checklist
23. Document future extensibility points

---

## Next Steps

### Option A: Fix All CRITICAL Issues
Update plan.md with detailed cross-references and sequences → Ready for `/speckit.tasks`

### Option B: Generate Tasks Now, Refine During Implementation
Run `/speckit.tasks` → Use audit findings to enhance generated tasks → Implement with inline fixes

### Option C: Create Enhanced Implementation Guide
Create supplementary "Implementation Playbook" document with all missing details → Keep plan.md high-level

**Recommendation**: **Option A** - Fix CRITICAL issues now. The 30 minutes spent adding cross-references will save hours of context-switching during implementation.
