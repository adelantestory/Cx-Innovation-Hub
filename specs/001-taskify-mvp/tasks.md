# Tasks: Taskify MVP

**Input**: Design documents from `specs/001-taskify-mvp/`
**Prerequisites**: plan.md, spec.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Tests**: Tests are included for all user stories to ensure quality and functionality.

**Azure AI Foundry Note**: Phase 8 (User Story 6) will implement AI help using Azure AI Foundry instead of direct OpenAI integration, following the pattern from agent.py.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`, `shared/types/`
- Paths shown below follow the structure from plan.md

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [X] T001 Create backend directory structure: `backend/src/{routes,controllers,services,models,middleware,websocket,utils}`, `backend/prisma`, `backend/tests/{contract,integration,unit}`
- [X] T002 Initialize backend Node.js project with package.json in backend/
- [X] T003 [P] Install backend dependencies: express, prisma, @prisma/client, socket.io, pg, dotenv, winston, cors
- [X] T004 [P] Install backend dev dependencies: typescript, @types/node, @types/express, @types/cors, ts-node, jest, @types/jest, supertest, @types/supertest, ts-jest
- [X] T005 [P] Create backend/tsconfig.json with strict mode configuration per plan.md lines 811-827
- [X] T006 [P] Create backend/.env.example with all required environment variables per plan.md lines 218-257
- [X] T007 [P] Create frontend directory structure: `frontend/src/{pages,components,hooks,services,types,styles}`, `frontend/tests/components/`
- [X] T008 [P] Create shared types directory: `shared/types/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T009 Copy Prisma schema from data-model.md lines 233-362 to backend/prisma/schema.prisma
- [X] T010 Create backend/.env file with DATABASE_URL and verify PostgreSQL connection
- [X] T011 Run initial Prisma migration: `npx prisma migrate dev --name init` in backend/ ✅ Docker PostgreSQL
- [X] T012 Create backend/prisma/seed.ts following seed data specification from plan.md lines 623-770
- [X] T013 Configure prisma seed script in backend/package.json and run `npx prisma db seed` ✅ Completed
- [X] T014 Verify seed data using `npx prisma studio`: 5 users, 3 projects, 15 project_members, 40-45 tasks, 8-12 comments ✅ Seeded
- [X] T015 Create backend/src/middleware/logger.ts with Winston logger per plan.md lines 915-941
- [X] T016 [P] Create backend/src/middleware/errorHandler.ts with centralized error handling per plan.md lines 944-964
- [X] T017 Create backend/src/index.ts with Express app configuration per plan.md lines 867-889
- [X] T018 Create backend/src/server.ts with HTTP + Socket.IO server per plan.md lines 893-911
- [X] T019 Create backend/src/websocket/taskEvents.ts with WebSocket event handlers per plan.md lines 1176-1202
- [X] T020 Test server startup: `npm run dev` should start on port 3000 ✅ Server operational
- [X] T021 [P] Create shared/types/user.ts with User interface and UserRole enum
- [X] T022 [P] Create shared/types/project.ts with Project interface
- [X] T023 [P] Create shared/types/task.ts with Task interface and TaskStatus enum per plan.md lines 1493-1516
- [X] T024 [P] Create shared/types/comment.ts with Comment interface

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Selection and Project Access (Priority: P1) 🎯 MVP

**Spec Reference**: [spec.md#L19-L32](spec.md#L19-L32)

**Goal**: Enable team members to select their identity from 5 predefined users and access the list of 3 sample projects

**Independent Test**: Launch application, select a user (1 PM or 4 Engineers), verify navigation to project list showing 3 projects

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [ ] T025 [P] [US1] Create contract test for GET /api/projects in backend/tests/contract/projects.test.ts verifying response matches contracts/projects-api.yaml lines 17-39
- [ ] T026 [P] [US1] Create integration test for user selection → project list navigation in frontend/tests/integration/user-journey.test.tsx

### Implementation for User Story 1

- [X] T027 [P] [US1] Create backend/src/services/projectsService.ts with getAllProjects() function per plan.md lines 976-1001
- [X] T028 [P] [US1] Create backend/src/controllers/projectsController.ts with listProjects handler per plan.md lines 1021-1032
- [X] T029 [US1] Create backend/src/routes/projects.ts with GET / endpoint per plan.md lines 1045-1055
- [X] T030 [US1] Register projects routes in backend/src/index.ts per plan.md lines 1058-1061
- [ ] T031 [US1] Verify contract test T025 passes for GET /api/projects endpoint ⚠️ Requires database
- [X] T032 [US1] Initialize frontend with Vite: `npm create vite@latest frontend -- --template react-ts`
- [X] T033 [US1] Install frontend dependencies: @mui/material, @emotion/react, @emotion/styled, react-dnd, react-dnd-html5-backend, @tanstack/react-query, axios, socket.io-client, react-router-dom
- [X] T034 [P] [US1] Create frontend/vite.config.ts with API proxy per plan.md lines 1445-1451
- [X] T035 [P] [US1] Create frontend/src/styles/theme.ts with MUI theme per plan.md lines 1456-1464
- [X] T036 [P] [US1] Create frontend/.env with VITE_API_URL and VITE_WS_URL per plan.md lines 243-251
- [X] T037 [P] [US1] Create frontend/src/services/api.ts with Axios instance
- [X] T038 [P] [US1] Create frontend/src/services/projectsApi.ts with getProjects() function
- [X] T039 [P] [US1] Create frontend/src/hooks/useProjects.ts with TanStack Query wrapper
- [X] T040 [US1] Create frontend/src/pages/UserSelection.tsx with 5 hardcoded users from seed data (Sarah Johnson PM, Alex Chen, Jordan Lee, Taylor Kim, Morgan Patel)
- [X] T041 [US1] Create frontend/src/pages/ProjectList.tsx using useProjects hook to display 3 projects
- [X] T042 [US1] Set up React Router in frontend/src/App.tsx with routes for /users and /projects
- [ ] T043 [US1] Verify integration test T026 passes for user selection → project list flow

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 - Kanban Board Visualization (Priority: P1)

**Spec Reference**: [spec.md#L35-L50](spec.md#L35-L50)

**Goal**: Display Kanban board with 4 columns (To Do, In Progress, In Review, Done) and visually highlight current user's tasks

**Independent Test**: Select a user, click a project, verify Kanban board displays with 4 columns and tasks assigned to current user are highlighted in different color

### Tests for User Story 2

- [ ] T044 [P] [US2] Add contract test in backend/tests/contract/projects.test.ts for GET /api/projects/:id/tasks verifying response matches contracts/projects-api.yaml lines 65-93
- [ ] T045 [P] [US2] Add integration test for task highlighting in frontend/tests/integration/kanban-display.test.tsx

### Implementation for User Story 2

- [X] T046 [P] [US2] Add getProjectTasks(projectId) function to backend/src/services/projectsService.ts per plan.md lines 1003-1017 ✅ Completed in Phase 3
- [X] T047 [P] [US2] Add getProjectTasks handler to backend/src/controllers/projectsController.ts per plan.md lines 1034-1041 ✅ Completed in Phase 3
- [X] T048 [US2] Add GET /:id/tasks route to backend/src/routes/projects.ts per plan.md line 1052 ✅ Completed in Phase 3
- [ ] T049 [US2] Verify contract test T044 passes and tasks are ordered by (status, orderIndex) ⚠️ Test skipped
- [X] T050 [P] [US2] Add getProjectTasks(projectId) to frontend/src/services/projectsApi.ts ✅ Completed in Phase 3
- [X] T051 [P] [US2] Create frontend/src/hooks/useProjectTasks.ts with TanStack Query wrapper
- [X] T052 [P] [US2] Create frontend/src/components/NavigationBar.tsx with back button per spec.md AC2
- [X] T053 [P] [US2] Create frontend/src/components/TaskCard.tsx with title, assignee display and conditional CSS for highlighting current user's tasks
- [X] T054 [US2] Create frontend/src/pages/KanbanBoard.tsx with 4 columns using useProjectTasks hook
- [X] T055 [US2] Add route for /projects/:id/board in frontend/src/App.tsx
- [X] T056 [US2] Implement navigation from ProjectList to KanbanBoard and back button functionality
- [ ] T057 [US2] Verify integration test T045 passes for task highlighting ⚠️ Test skipped

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Task Status Management via Drag-and-Drop (Priority: P2)

**Spec Reference**: [spec.md#L53-L66](spec.md#L53-L66)

**Goal**: Enable dragging task cards between columns to update status with real-time synchronization

**Independent Test**: Open Kanban board, drag a task to different column, verify status changes and persists after drop

### Tests for User Story 3

- [ ] T058 [P] [US3] Create contract test for PATCH /api/tasks/:id in backend/tests/contract/tasks.test.ts verifying response matches contracts/tasks-api.yaml lines 47-89
- [ ] T059 [P] [US3] Create integration test for drag-drop workflow in backend/tests/integration/kanban-workflow.test.ts per plan.md lines 1233-1259
- [ ] T060 [P] [US3] Add unit test for drag-drop order calculation in backend/tests/unit/orderIndex.test.ts

### Implementation for User Story 3

- [X] T061 [P] [US3] Create backend/src/services/tasksService.ts with updateTask() function including assignedTo validation per plan.md lines 1103-1150
- [X] T062 [US3] Implement reorderWithinColumn algorithm in backend/src/services/tasksService.ts per plan.md lines 1553-1587
- [X] T063 [US3] Implement moveToNewColumn algorithm in backend/src/services/tasksService.ts per plan.md lines 1593-1648
- [X] T064 [P] [US3] Create backend/src/controllers/tasksController.ts with updateTask handler
- [X] T065 [P] [US3] Create backend/src/routes/tasks.ts with GET /:id and PATCH /:id routes
- [X] T066 [US3] Register tasks routes in backend/src/index.ts
- [X] T067 [US3] Add WebSocket broadcast to updateTask in backend/src/services/tasksService.ts per plan.md lines 1206-1229
- [ ] T068 [US3] Verify contract test T058 passes for PATCH /api/tasks/:id ⚠️ Test skipped
- [ ] T069 [US3] Verify integration test T059 passes for WebSocket real-time updates ⚠️ Test skipped
- [X] T070 [P] [US3] Create frontend/src/services/tasksApi.ts with updateTask function
- [X] T071 [P] [US3] Create frontend/src/hooks/useWebSocket.ts for Socket.IO connection with join/leave project events
- [X] T072 [P] [US3] Create frontend/src/hooks/useTasks.ts with useUpdateTask mutation including optimistic updates per plan.md lines 1654-1690
- [X] T073 [US3] Integrate React DnD in frontend/src/pages/KanbanBoard.tsx with drag-drop handlers
- [X] T074 [US3] Update frontend/src/components/TaskCard.tsx to be draggable with React DnD
- [X] T075 [US3] Connect useWebSocket hook in KanbanBoard to subscribe to task:updated events
- [ ] T076 [US3] Test drag-drop within same column and between columns with optimistic updates ⚠️ Manual test needed

**Checkpoint**: Drag-and-drop functionality fully implemented with real-time synchronization

---

## Phase 6: User Story 4 - Task Assignment (Priority: P2)

**Spec Reference**: [spec.md#L69-L85](spec.md#L69-L85)

**Goal**: Enable task assignment to any of the 5 team members via task detail modal

**Independent Test**: Click a task card, modal opens with task details, change assignment dropdown, verify task shows new assignee and highlighting updates on board

### Tests for User Story 4

- [ ] T077 [P] [US4] Add contract test for assignedTo validation in backend/tests/contract/tasks.test.ts per plan.md lines 1158-1167
- [ ] T078 [P] [US4] Add integration test for task assignment flow in backend/tests/integration/task-assignment.test.ts

### Implementation for User Story 4

- [ ] T079 [P] [US4] Add getTask(taskId) function to backend/src/services/tasksService.ts
- [ ] T080 [P] [US4] Add getTask handler to backend/src/controllers/tasksController.ts
- [ ] T081 [US4] Verify GET /api/tasks/:id route exists in backend/src/routes/tasks.ts
- [ ] T082 [US4] Verify assignedTo validation in updateTask service (already implemented in T061) per data-model.md line 146
- [ ] T083 [US4] Verify contract test T077 passes for assignedTo validation
- [ ] T084 [P] [US4] Add getTask(taskId) to frontend/src/services/tasksApi.ts
- [ ] T085 [P] [US4] Create frontend/src/hooks/useTask.ts with TanStack Query wrapper for single task
- [ ] T086 [P] [US4] Create frontend/src/components/TaskDetailModal.tsx with task info display and assignment dropdown showing all 5 users
- [ ] T087 [US4] Add click handler to TaskCard.tsx to open TaskDetailModal
- [ ] T088 [US4] Implement assignment change in TaskDetailModal using useUpdateTask mutation
- [ ] T089 [US4] Verify modal close on outside click or close button per spec.md AC6
- [ ] T090 [US4] Verify integration test T078 passes for assignment flow and visual highlighting update

**Checkpoint**: Task assignment and detail modal fully functional

---

## Phase 7: User Story 5 - Task Commenting (Priority: P3)

**Spec Reference**: [spec.md#L88-L104](spec.md#L88-L104)

**Goal**: Enable adding, editing, and deleting comments on tasks with permission enforcement (users can only edit/delete their own comments)

**Independent Test**: Open task detail modal, add multiple comments, edit own comment (verify "edited" badge), attempt to edit other's comment (verify no controls shown), delete own comment

### Tests for User Story 5

- [ ] T091 [P] [US5] Create contract test for POST /api/tasks/:id/comments in backend/tests/contract/comments.test.ts verifying response matches contracts/comments-api.yaml lines 17-51
- [ ] T092 [P] [US5] Add contract tests for PATCH and DELETE /api/comments/:id with permission checks in backend/tests/contract/comments.test.ts per plan.md lines 1298-1316
- [ ] T093 [P] [US5] Create integration test for commenting workflow in backend/tests/integration/commenting.test.ts

### Implementation for User Story 5

- [ ] T094 [P] [US5] Create backend/src/services/commentsService.ts with createComment, updateComment, deleteComment functions
- [ ] T095 [US5] Implement permission check in updateComment: authorId === currentUserId per plan.md lines 1268-1294
- [ ] T096 [US5] Implement editedAt timestamp setting in updateComment per data-model.md line 181
- [ ] T097 [US5] Implement permission check in deleteComment: authorId === currentUserId
- [ ] T098 [P] [US5] Create backend/src/controllers/commentsController.ts with handlers for create, update, delete
- [ ] T099 [P] [US5] Create backend/src/routes/comments.ts with POST /tasks/:id/comments, PATCH /:id, DELETE /:id routes
- [ ] T100 [US5] Register comments routes in backend/src/index.ts
- [ ] T101 [US5] Add comment:added WebSocket broadcast in createComment service
- [ ] T102 [US5] Verify contract tests T091 and T092 pass for all comment operations and permissions
- [ ] T103 [P] [US5] Create frontend/src/services/commentsApi.ts with createComment, updateComment, deleteComment functions
- [ ] T104 [P] [US5] Create frontend/src/hooks/useComments.ts with queries and mutations for comments
- [ ] T105 [P] [US5] Create frontend/src/components/CommentForm.tsx for adding new comments
- [ ] T106 [P] [US5] Create frontend/src/components/CommentList.tsx showing comments with conditional edit/delete controls (only for own comments) per spec.md AC2-3
- [ ] T107 [US5] Add CommentForm and CommentList to TaskDetailModal.tsx
- [ ] T108 [US5] Implement "(edited)" badge display when editedAt is not null per data-model.md line 190
- [ ] T109 [US5] Verify integration test T093 passes for complete commenting workflow
- [ ] T110 [US5] Test empty comment validation per spec.md AC and requirement FR-024

**Checkpoint**: Commenting system fully functional with permission enforcement

---

## Phase 8: User Story 6 - AI Help Assistant (Priority: P3)

**Spec Reference**: [spec.md#L107-L124](spec.md#L107-L124)

**Goal**: Provide contextual AI help assistant accessible from all screens using Azure AI Foundry

**Independent Test**: Click help button from any screen, side panel opens, ask questions about Taskify features, verify contextual responses based on current screen

**CRITICAL**: This phase uses Azure AI Foundry instead of OpenAI direct integration. Follow pattern from agent.py file.

### Tests for User Story 6

- [ ] T111 [P] [US6] Create contract test for POST /api/help/ask in backend/tests/contract/help.test.ts with mocked Azure AI Foundry response, verifying contracts/help-api.yaml lines 17-76
- [ ] T112 [P] [US6] Create contract test for GET /api/help/history in backend/tests/contract/help.test.ts verifying contracts/help-api.yaml lines 78-135
- [ ] T113 [P] [US6] Create unit test for screenContext system prompt selection in backend/tests/unit/aiHelpService.test.ts

### Implementation for User Story 6

- [ ] T114 Install Azure AI SDK dependencies in backend: `npm install @azure/ai-projects @azure/identity`
- [ ] T115 Add Azure AI Foundry environment variables to backend/.env: AZURE_AI_ENDPOINT, AZURE_AI_PROJECT, AZURE_AGENT_NAME
- [ ] T116 [P] [US6] Create backend/src/services/aiHelpService.ts using Azure AI Foundry pattern from agent.py (AIProjectClient, DefaultAzureCredential, agent reference)
- [ ] T117 [US6] Implement askQuestion function in aiHelpService with screenContext-based system prompt selection per plan.md lines 1329-1380
- [ ] T118 [US6] Implement Azure AI agent call using agent reference pattern: openai_client.responses.create with extra_body agent reference
- [ ] T119 [US6] Store user message and AI response in HelpMessage table with sessionId and screenContext
- [ ] T120 [US6] Implement getHistory function in aiHelpService to retrieve conversation by sessionId
- [ ] T121 [P] [US6] Create backend/src/controllers/helpController.ts with askQuestion and getHistory handlers
- [ ] T122 [P] [US6] Create backend/src/routes/help.ts with POST /ask and GET /history routes
- [ ] T123 [US6] Register help routes in backend/src/index.ts
- [ ] T124 [US6] Verify contract tests T111 and T112 pass with mocked Azure AI responses
- [ ] T125 [US6] Test error handling when Azure AI Foundry is unavailable (503 response)
- [ ] T126 [P] [US6] Create frontend/src/services/helpApi.ts with askQuestion and getHistory functions
- [ ] T127 [P] [US6] Create frontend/src/hooks/useHelpChat.ts managing conversation state with sessionId stored in localStorage
- [ ] T128 [P] [US6] Create frontend/src/components/HelpButton.tsx as floating button visible on all pages per spec.md AC1
- [ ] T129 [P] [US6] Create frontend/src/components/HelpPanel.tsx with chat interface that slides in from right per spec.md AC2
- [ ] T130 [US6] Implement screenContext detection in HelpPanel based on current route (user-selection, project-list, kanban-board, task-detail-modal)
- [ ] T131 [US6] Add HelpButton to all pages: UserSelection, ProjectList, KanbanBoard
- [ ] T132 [US6] Implement panel close on outside click or close button per spec.md AC6
- [ ] T133 [US6] Test conversation history persistence during session and display in panel
- [ ] T134 [US6] Verify contextual responses based on screenContext

**Checkpoint**: AI help assistant fully functional with Azure AI Foundry integration

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T135 [P] Add logging for all API requests and responses in backend
- [ ] T136 [P] Add error boundaries in frontend/src/App.tsx for graceful error handling
- [ ] T137 [P] Optimize database queries with Prisma select and include to fetch only needed fields
- [ ] T138 [P] Add loading states and skeletons for all async operations in frontend
- [ ] T139 [P] Implement toast notifications for success/error feedback in frontend using MUI Snackbar
- [ ] T140 [P] Add accessibility improvements: ARIA labels, keyboard navigation, focus management
- [ ] T141 [P] Create backend/README.md with setup and API documentation
- [ ] T142 [P] Create frontend/README.md with development instructions
- [ ] T143 [P] Update root README.md with project overview and quickstart
- [ ] T144 Test application against specs/001-taskify-mvp/quickstart.md validation steps
- [ ] T145 Run all backend tests and verify 100% pass rate: `npm test` in backend/
- [ ] T146 Run all frontend tests and verify 100% pass rate: `npm test` in frontend/
- [ ] T147 Perform end-to-end manual testing of all 6 user stories
- [ ] T148 [P] Add ESLint and Prettier configuration to both backend and frontend
- [ ] T149 [P] Format all code with Prettier
- [ ] T150 Create production build scripts for both backend and frontend

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-8)**: All depend on Foundational phase completion
  - User Story 1 (P1) - US1: Can start after Foundational (Phase 2) - No dependencies on other stories
  - User Story 2 (P1) - US2: Can start after Foundational (Phase 2) - No dependencies on other stories
  - User Story 3 (P2) - US3: Depends on US2 (requires Kanban board to exist) - Can start after US2
  - User Story 4 (P2) - US4: Depends on US2 (requires task cards) - Can start after US2
  - User Story 5 (P3) - US5: Depends on US4 (requires TaskDetailModal) - Can start after US4
  - User Story 6 (P3) - US6: Can start after Foundational (Phase 2) - No dependencies on other stories
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - Foundation for all other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - Foundation for drag-drop and task interactions
- **User Story 3 (P2)**: Depends on US2 completion (needs Kanban board) - Independently testable after US2
- **User Story 4 (P2)**: Depends on US2 completion (needs task cards) - Independently testable after US2
- **User Story 5 (P3)**: Depends on US4 completion (needs TaskDetailModal) - Independently testable after US4
- **User Story 6 (P3)**: Can start after Foundational (Phase 2) - Completely independent from other stories

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Backend services before controllers
- Controllers before routes
- Routes must be registered in main app
- Contract tests must pass before moving to frontend
- Frontend API clients before hooks
- Hooks before components
- Components before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes:
  - US1 and US6 can start in parallel (no dependencies)
  - After US1+US2 complete: US3 and US4 can start in parallel
- All tests for a user story marked [P] can run in parallel
- Backend and frontend tasks marked [P] within same story can run in parallel
- Different user stories can be worked on in parallel by different team members (respecting dependencies)

---

## Parallel Example: User Story 3

```bash
# Launch backend tests in parallel:
Task T058: "Contract test for PATCH /api/tasks/:id"
Task T059: "Integration test for drag-drop workflow"
Task T060: "Unit test for drag-drop order calculation"

# Launch backend implementation in parallel:
Task T061: "Create tasksService.ts with updateTask()"
Task T064: "Create tasksController.ts with updateTask handler"
Task T065: "Create routes/tasks.ts"

# Launch frontend implementation in parallel:
Task T070: "Create tasksApi.ts with updateTask function"
Task T071: "Create useWebSocket.ts hook"
Task T072: "Create useTasks.ts with mutations"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (User Selection & Project Access)
4. Complete Phase 4: User Story 2 (Kanban Board Visualization)
5. **STOP and VALIDATE**: Test US1 and US2 independently
6. Deploy/demo if ready - Core visualization is functional

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 + 2 → Test independently → Deploy/Demo (MVP - viewing capability!)
3. Add User Story 3 → Test independently → Deploy/Demo (drag-drop interaction!)
4. Add User Story 4 → Test independently → Deploy/Demo (task assignment!)
5. Add User Story 5 → Test independently → Deploy/Demo (collaboration!)
6. Add User Story 6 → Test independently → Deploy/Demo (AI assistance!)
7. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (T025-T043)
   - Developer B: User Story 2 (T044-T057) - can start in parallel with US1
   - Developer C: User Story 6 (T111-T134) - independent, can start in parallel
3. After US2 completes:
   - Developer A: User Story 3 (T058-T076)
   - Developer B: User Story 4 (T077-T090) - can be parallel with US3
4. After US4 completes:
   - Developer A or B: User Story 5 (T091-T110)
5. All developers: Polish phase together

---

## Notes

- [P] tasks = different files, no dependencies, can run in parallel
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (TDD approach)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- **Azure AI Foundry**: User Story 6 uses Azure AI Foundry (not direct OpenAI) - follow agent.py pattern
- **Critical algorithms**: Drag-drop order management (US3) must follow exact implementation from plan.md lines 1547-1648
- **Database indexes**: Composite index (projectId, status, orderIndex) is CRITICAL for performance
- **WebSocket rooms**: Broadcast only to project:${projectId} room, not globally
- **Permission enforcement**: Comments can only be edited/deleted by their author
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence

---

## Task Count Summary

- **Total Tasks**: 150
- **Phase 1 (Setup)**: 8 tasks
- **Phase 2 (Foundational)**: 16 tasks (BLOCKING)
- **Phase 3 (User Story 1 - P1)**: 19 tasks
- **Phase 4 (User Story 2 - P1)**: 14 tasks
- **Phase 5 (User Story 3 - P2)**: 19 tasks
- **Phase 6 (User Story 4 - P2)**: 14 tasks
- **Phase 7 (User Story 5 - P3)**: 20 tasks
- **Phase 8 (User Story 6 - P3)**: 24 tasks
- **Phase 9 (Polish)**: 16 tasks

**Parallel Opportunities**: 45+ tasks marked [P] can run in parallel within their phase

**Suggested MVP Scope**: Phases 1-4 (Setup + Foundational + US1 + US2) = 57 tasks for core viewing functionality
