# Taskify MVP - Quickstart Guide

**Feature**: Taskify MVP - Team Productivity Platform
**Version**: 1.0.0
**Last Updated**: 2026-01-25

## Prerequisites

Before starting, ensure you have:

- **Node.js**: v20.x LTS or higher
- **PostgreSQL**: v15.x or higher
- **Package Manager**: npm (v9.x+) or yarn (v1.22+)
- **Git**: For version control
- **OpenAI API Key**: For AI help assistant functionality

## Environment Setup

### 1. Clone and Initialize

```bash
# Navigate to project root
cd "Cx Innovation Hub"

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Database Configuration

```bash
# Start PostgreSQL service (if not running)
# Windows: net start postgresql-x64-15
# macOS: brew services start postgresql
# Linux: sudo systemctl start postgresql

# Create database
psql -U postgres -c "CREATE DATABASE taskify_mvp;"
```

### 3. Environment Variables

**Backend** (`backend/.env`):

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/taskify_mvp"

# Server
PORT=3000
NODE_ENV=development

# OpenAI
OPENAI_API_KEY="your-openai-api-key-here"
OPENAI_MODEL="gpt-4"

# CORS
CORS_ORIGIN="http://localhost:5173"

# Socket.IO
SOCKET_PATH="/socket.io"
```

**Frontend** (`frontend/.env`):

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api
VITE_WS_URL=http://localhost:3000

# Feature Flags
VITE_ENABLE_AI_HELP=true
```

### 4. Database Initialization

```bash
cd backend

# Generate Prisma Client
npx prisma generate

# Run migrations
npx prisma migrate dev --name init

# Seed database with sample data
npx prisma db seed
```

Expected seed data:
- **5 Users**: Alice Chen (PM), Bob Smith, Carol Davis, David Kim, Eve Martinez (Engineers)
- **3 Projects**: Website Redesign, Mobile App v2, API Integration
- **12+ Sample Tasks**: Distributed across projects with various statuses

## Running the Application

### Terminal 1: Backend Server

```bash
cd backend
npm run dev
```

Expected output:
```
[Server] Listening on http://localhost:3000
[Database] Connected to PostgreSQL
[Socket.IO] WebSocket server ready
[OpenAI] API client initialized
```

### Terminal 2: Frontend Development Server

```bash
cd frontend
npm run dev
```

Expected output:
```
VITE v5.0.0  ready in 500 ms

➜  Local:   http://localhost:5173/
➜  Network: use --host to expose
```

### Access Application

Open browser to: **http://localhost:5173**

## Validation Steps

### ✅ User Story 1: User Selection

1. Navigate to http://localhost:5173
2. **Expected**: User selection screen with 5 user cards
3. **Verify**: Each card shows name, role, avatar
4. **Action**: Click on "Alice Chen (Product Manager)"
5. **Expected**: Navigate to project list screen

### ✅ User Story 2: Project List View

1. **Expected**: See 3 projects displayed as cards
2. **Verify**: Each project shows:
   - Project name
   - Task count breakdown (To Do, In Progress, In Review, Done)
3. **Action**: Click on "Website Redesign" project
4. **Expected**: Navigate to Kanban board

### ✅ User Story 3: Kanban Board

1. **Expected**: Kanban board with 4 columns
2. **Verify**: Columns labeled: "To Do", "In Progress", "In Review", "Done"
3. **Verify**: Tasks displayed in correct columns
4. **Action**: Drag a task from "To Do" to "In Progress"
5. **Expected**:
   - Visual feedback during drag
   - Task moves to new column
   - Column counts update
6. **Open second browser window**: Same project
7. **Expected**: Second window updates automatically (real-time)

### ✅ User Story 4: Task Details & Assignment

1. **Action**: Click on any task card
2. **Expected**: Task detail modal opens
3. **Verify**: Modal shows:
   - Task title and description
   - Current status
   - Assigned user (dropdown)
   - Created/Updated timestamps
4. **Action**: Change "Assigned To" dropdown to different user
5. **Expected**:
   - Assignment updates
   - Modal shows new assignee
6. **Action**: Close modal and check Kanban board
7. **Expected**: Task card shows updated assignee avatar

### ✅ User Story 5: Task Comments

1. **Action**: Open task detail modal
2. **Action**: Scroll to comments section
3. **Verify**: Existing comments show author, timestamp, content
4. **Action**: Type "Great progress on this task!" and click "Add Comment"
5. **Expected**:
   - Comment appears immediately
   - Shows current user as author
6. **Action**: Hover over your own comment
7. **Verify**: Edit and Delete buttons appear
8. **Action**: Hover over another user's comment
9. **Verify**: NO Edit/Delete buttons (permission enforcement)
10. **Action**: Click Edit on your comment
11. **Expected**: Inline edit mode activates
12. **Action**: Modify text and save
13. **Expected**: Comment updates
14. **Action**: Click Delete on your comment
15. **Expected**: Confirmation dialog → Comment removed

### ✅ User Story 6: AI Help Assistant

1. **Action**: Look for help button (question mark icon or "Help" button)
2. **Verify**: Button visible in top-right corner or navigation bar
3. **Action**: Click help button
4. **Expected**: Side panel slides in from right, overlaying content
5. **Verify**: Panel shows:
   - Conversation history (if any)
   - Text input field
   - Current screen context indicator
6. **Action**: Type "How do I assign a task to someone?"
7. **Action**: Press Enter or click Send
8. **Expected**:
   - Message appears in conversation
   - AI responds with contextual help about task assignment
   - Response references drag-drop or task detail modal
9. **Action**: Type follow-up: "Can I assign to multiple people?"
10. **Expected**: AI responds with context awareness (references previous question)
11. **Action**: Navigate to different screen (e.g., project list)
12. **Action**: Ask "How do I create a new project?"
13. **Expected**: AI response acknowledges current screen context
14. **Action**: Close help panel
15. **Expected**: Panel slides out, conversation preserved

## Testing Backend API Directly

### Get All Projects

```bash
curl http://localhost:3000/api/projects
```

Expected: JSON array of 3 projects

### Get Project Tasks

```bash
curl http://localhost:3000/api/projects/{project-id}/tasks
```

Expected: JSON array of tasks for that project

### Update Task Status (Drag-Drop Simulation)

```bash
curl -X PATCH http://localhost:3000/api/tasks/{task-id} \
  -H "Content-Type: application/json" \
  -H "X-User-Id: {user-id}" \
  -d '{"status":"In Progress","orderIndex":0}'
```

Expected: Updated task object

### Add Comment

```bash
curl -X POST http://localhost:3000/api/tasks/{task-id}/comments \
  -H "Content-Type: application/json" \
  -H "X-User-Id: {user-id}" \
  -d '{"content":"Test comment from API"}'
```

Expected: Created comment object

### AI Help Query

```bash
curl -X POST http://localhost:3000/api/help/ask \
  -H "Content-Type: application/json" \
  -H "X-Session-Id: test-session-123" \
  -d '{
    "question":"How do I move a task?",
    "screenContext":"kanban-board"
  }'
```

Expected: AI response with help content

## WebSocket Testing

### Connect to Socket.IO

```javascript
// In browser console (with frontend running)
const socket = io('http://localhost:3000');

socket.on('connect', () => {
  console.log('Connected:', socket.id);
});

socket.on('task:updated', (data) => {
  console.log('Task update received:', data);
});

// Join project room
socket.emit('join:project', { projectId: 'project-uuid-here' });
```

### Test Real-Time Updates

1. Open two browser windows side-by-side
2. Both windows on same project Kanban board
3. In Window 1: Drag a task to different column
4. In Window 2: Should see task move automatically within 100-200ms

## Troubleshooting

### Database Connection Errors

**Problem**: `Error: connect ECONNREFUSED`

**Solution**:
```bash
# Check PostgreSQL is running
pg_isready

# Verify DATABASE_URL in .env
# Ensure database exists
psql -U postgres -l | grep taskify_mvp
```

### Prisma Migration Errors

**Problem**: `P3009: migrate found failed migration`

**Solution**:
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Re-run migrations
npx prisma migrate dev
```

### Frontend Cannot Connect to Backend

**Problem**: Network errors in browser console

**Solution**:
1. Verify backend is running on port 3000
2. Check `VITE_API_URL` in frontend/.env
3. Ensure CORS is configured correctly in backend
4. Check browser network tab for specific error codes

### OpenAI API Errors

**Problem**: Help assistant returns 503 or errors

**Solution**:
1. Verify `OPENAI_API_KEY` in backend/.env
2. Check API key has sufficient credits
3. Verify internet connection
4. Check OpenAI service status

### WebSocket Connection Fails

**Problem**: Real-time updates not working

**Solution**:
1. Check browser console for Socket.IO errors
2. Verify `VITE_WS_URL` matches backend server
3. Ensure backend Socket.IO server initialized
4. Check firewall/proxy settings

### Port Already in Use

**Problem**: `Error: listen EADDRINUSE: address already in use :::3000`

**Solution**:
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <process-id> /F

# macOS/Linux
lsof -ti:3000 | xargs kill -9

# Or change PORT in backend/.env
```

## Performance Verification

### Expected Response Times

- **Project List Load**: < 200ms
- **Kanban Board Load**: < 300ms
- **Task Update (Drag-Drop)**: < 150ms
- **Comment Add**: < 200ms
- **AI Help Response**: 1-3 seconds (depends on OpenAI API)
- **Real-time Update Propagation**: < 200ms

### Browser Performance

Open DevTools → Performance tab:

1. Record a session with typical interactions
2. **Expected**:
   - No layout thrashing during drag operations
   - Smooth 60 FPS animations
   - Idle CPU usage < 5%
   - Memory stable (no leaks after repeated operations)

## Next Steps

Once validation is complete:

1. **Run Tests**: Execute automated test suites (when implemented)
2. **Review Logs**: Check backend logs for warnings or errors
3. **Monitor Database**: Verify query performance in PostgreSQL
4. **Load Testing**: Test with concurrent users (post-MVP)
5. **Security Review**: Validate permission enforcement
6. **Documentation**: Review API contracts and data models

## Success Criteria Met

- ✅ All 6 user stories validated
- ✅ Real-time updates working across clients
- ✅ Permission controls enforced (comments)
- ✅ AI help assistant providing contextual guidance
- ✅ Database seeded with realistic data
- ✅ API responses within performance targets
- ✅ No console errors during normal operation

---

**Validation Complete**: If all steps above pass, the Taskify MVP is ready for implementation task breakdown and development.
