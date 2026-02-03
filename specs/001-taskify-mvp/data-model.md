# Data Model: Taskify MVP

**Date**: 2026-01-25
**Database**: PostgreSQL 15.x with Prisma ORM

## Overview

This document defines the database schema for Taskify MVP. The model supports 5 predefined users, 3 sample projects, tasks with Kanban workflow, comments with ownership permissions, and AI help conversation history.

## Entity Relationship Diagram

```
┌─────────────┐       ┌──────────────┐       ┌─────────────┐
│    User     │       │   Project    │       │    Task     │
├─────────────┤       ├──────────────┤       ├─────────────┤
│ id          │───┐   │ id           │───┐   │ id          │
│ name        │   │   │ name         │   │   │ project_id  │──┐
│ email       │   │   │ description  │   │   │ title       │  │
│ role        │   │   │ created_at   │   │   │ description │  │
│ avatar_url  │   │   │ updated_at   │   │   │ status      │  │
│ created_at  │   │   └──────────────┘   │   │ assigned_to │─┬┘
└─────────────┘   │                      │   │ order_index │ │
                  │   ┌──────────────┐   │   │ created_at  │ │
                  └──▶│ProjectMember │◀──┘   │ updated_at  │ │
                      ├──────────────┤       └─────────────┘ │
                      │ id           │              │         │
                      │ project_id   │              │         │
                      │ user_id      │              ▼         │
                      │ joined_at    │       ┌─────────────┐ │
                      └──────────────┘       │   Comment   │ │
                                             ├─────────────┤ │
                                             │ id          │ │
                                             │ task_id     │─┘
                              ┌──────────────│ author_id   │
                              │              │ content     │
                              │              │ created_at  │
                              │              │ updated_at  │
                              │              │ edited_at   │
                              │              └─────────────┘
                              │
                              │       ┌──────────────────┐
                              └──────▶│  HelpMessage     │
                                      ├──────────────────┤
                                      │ id               │
                                      │ session_id       │
                                      │ sender           │
                                      │ content          │
                                      │ screen_context   │
                                      │ created_at       │
                                      └──────────────────┘
```

## Entities

### 1. User

Represents a team member (1 Product Manager + 4 Engineers). Users are predefined in the system.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `name` | VARCHAR(100) | NOT NULL | Display name (e.g., "Sarah Johnson") |
| `email` | VARCHAR(255) | NOT NULL, UNIQUE | Email address (for identification) |
| `role` | ENUM('PM', 'Engineer') | NOT NULL | User role |
| `avatar_url` | VARCHAR(500) | NULLABLE | Profile picture URL |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |

**Sample Data**:
- Sarah Johnson (PM) - sarah.johnson@taskify.dev
- Alex Chen (Engineer) - alex.chen@taskify.dev
- Jordan Lee (Engineer) - jordan.lee@taskify.dev
- Taylor Kim (Engineer) - taylor.kim@taskify.dev
- Morgan Patel (Engineer) - morgan.patel@taskify.dev

**Indexes**:
- Primary key on `id`
- Unique index on `email`

### 2. Project

Represents a collection of tasks. 3 sample projects are predefined.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `name` | VARCHAR(200) | NOT NULL | Project name |
| `description` | TEXT | NULLABLE | Project description |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Sample Data**:
- Mobile App Redesign - Redesign of the iOS and Android apps
- Website Refresh - Update marketing website with new branding
- API v2 Migration - Migrate legacy API to v2 architecture

**Indexes**:
- Primary key on `id`

### 3. ProjectMember

Junction table for many-to-many relationship between users and projects.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `project_id` | UUID | NOT NULL, FOREIGN KEY → Project(id) | Project reference |
| `user_id` | UUID | NOT NULL, FOREIGN KEY → User(id) | User reference |
| `joined_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | When user joined project |

**Constraints**:
- UNIQUE (`project_id`, `user_id`) - User can only be added once per project
- ON DELETE CASCADE - Remove memberships when project or user deleted

**Sample Data**:
All 5 users are members of all 3 projects in the MVP.

**Indexes**:
- Primary key on `id`
- Index on `project_id`
- Index on `user_id`
- Unique composite index on (`project_id`, `user_id`)

### 4. Task

Represents a work item within a project with Kanban status.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `project_id` | UUID | NOT NULL, FOREIGN KEY → Project(id) | Parent project |
| `title` | VARCHAR(500) | NOT NULL | Task title |
| `description` | TEXT | NULLABLE | Detailed task description |
| `status` | ENUM('To Do', 'In Progress', 'In Review', 'Done') | NOT NULL, DEFAULT 'To Do' | Current Kanban column |
| `assigned_to` | UUID | NULLABLE, FOREIGN KEY → User(id) | Assigned user (null = unassigned) |
| `order_index` | INTEGER | NOT NULL | Order within status column (for drag-drop) |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |

**Validation Rules**:
- `title` cannot be empty string
- `order_index` must be non-negative
- `assigned_to` (if set) must be a member of the task's project

**State Transitions**:
- Any status → Any status (user can drag to any column)
- Status change updates `updated_at` timestamp

**Sample Data**:
- ~10-15 tasks per project
- Distribution: ~40% To Do, ~30% In Progress, ~20% In Review, ~10% Done
- Mix of assigned and unassigned tasks

**Indexes**:
- Primary key on `id`
- Index on `project_id` (frequent: get all tasks for a project)
- Index on `status` (for filtering by column)
- Index on `assigned_to` (for highlighting user's tasks)
- Composite index on (`project_id`, `status`, `order_index`) for sorted retrieval

**Constraints**:
- ON DELETE CASCADE for `project_id` - Delete tasks when project deleted
- ON DELETE SET NULL for `assigned_to` - Unassign tasks when user deleted

### 5. Comment

Represents a discussion message on a task. Users can edit/delete only their own comments.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `task_id` | UUID | NOT NULL, FOREIGN KEY → Task(id) | Parent task |
| `author_id` | UUID | NOT NULL, FOREIGN KEY → User(id) | Comment author |
| `content` | TEXT | NOT NULL | Comment text |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Creation timestamp |
| `updated_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Last update timestamp |
| `edited_at` | TIMESTAMP | NULLABLE | When comment was last edited (NULL = never edited) |

**Validation Rules**:
- `content` cannot be empty string
- `edited_at` can only be set if `updated_at > created_at`

**Business Logic**:
- Edit permission: `author_id === current_user_id`
- Delete permission: `author_id === current_user_id`
- Display: Show "(edited)" badge if `edited_at IS NOT NULL`

**Indexes**:
- Primary key on `id`
- Index on `task_id` (frequent: get all comments for a task)
- Index on `author_id` (for permission checks)
- Index on `created_at` (for chronological ordering)

**Constraints**:
- ON DELETE CASCADE for `task_id` - Delete comments when task deleted
- ON DELETE CASCADE for `author_id` - Delete comments when user deleted

### 6. HelpMessage

Represents messages in the AI help conversation history. Stored per browser session.

**Fields**:
| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| `id` | UUID | PRIMARY KEY | Unique identifier |
| `session_id` | VARCHAR(100) | NOT NULL | Browser session identifier (client-generated UUID) |
| `sender` | ENUM('user', 'ai') | NOT NULL | Who sent this message |
| `content` | TEXT | NOT NULL | Message content |
| `screen_context` | VARCHAR(100) | NULLABLE | Current screen (e.g., "kanban-board", "user-selection") |
| `created_at` | TIMESTAMP | NOT NULL, DEFAULT NOW() | Message timestamp |

**Validation Rules**:
- `content` cannot be empty
- `sender` must be 'user' or 'ai'
- `screen_context` should match known screens

**Storage Strategy**:
- Messages stored in database for session persistence
- Old sessions cleaned up after 7 days (scheduled job)
- Session ID stored in browser localStorage

**Indexes**:
- Primary key on `id`
- Index on `session_id` (frequent: get conversation history)
- Index on `created_at` (for chronological ordering and cleanup)

## Prisma Schema

```prisma
// This is the Prisma schema file for Taskify MVP

generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

enum UserRole {
  PM
  Engineer
}

enum TaskStatus {
  ToDo @map("To Do")
  InProgress @map("In Progress")
  InReview @map("In Review")
  Done
}

enum MessageSender {
  user
  ai
}

model User {
  id String @id @default(uuid())
  name String @db.VarChar(100)
  email String @unique @db.VarChar(255)
  role UserRole
  avatarUrl String? @map("avatar_url") @db.VarChar(500)
  createdAt DateTime @default(now()) @map("created_at")

  // Relations
  projectMemberships ProjectMember[]
  assignedTasks Task[]
  comments Comment[]

  @@map("users")
}

model Project {
  id String @id @default(uuid())
  name String @db.VarChar(200)
  description String? @db.Text
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  members ProjectMember[]
  tasks Task[]

  @@map("projects")
}

model ProjectMember {
  id String @id @default(uuid())
  projectId String @map("project_id")
  userId String @map("user_id")
  joinedAt DateTime @default(now()) @map("joined_at")

  // Relations
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  user User @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([projectId, userId])
  @@index([projectId])
  @@index([userId])
  @@map("project_members")
}

model Task {
  id String @id @default(uuid())
  projectId String @map("project_id")
  title String @db.VarChar(500)
  description String? @db.Text
  status TaskStatus @default(ToDo)
  assignedTo String? @map("assigned_to")
  orderIndex Int @map("order_index") @default(0)
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")

  // Relations
  project Project @relation(fields: [projectId], references: [id], onDelete: Cascade)
  assignee User? @relation(fields: [assignedTo], references: [id], onDelete: SetNull)
  comments Comment[]

  @@index([projectId])
  @@index([status])
  @@index([assignedTo])
  @@index([projectId, status, orderIndex])
  @@map("tasks")
}

model Comment {
  id String @id @default(uuid())
  taskId String @map("task_id")
  authorId String @map("author_id")
  content String @db.Text
  createdAt DateTime @default(now()) @map("created_at")
  updatedAt DateTime @updatedAt @map("updated_at")
  editedAt DateTime? @map("edited_at")

  // Relations
  task Task @relation(fields: [taskId], references: [id], onDelete: Cascade)
  author User @relation(fields: [authorId], references: [id], onDelete: Cascade)

  @@index([taskId])
  @@index([authorId])
  @@index([createdAt])
  @@map("comments")
}

model HelpMessage {
  id String @id @default(uuid())
  sessionId String @map("session_id") @db.VarChar(100)
  sender MessageSender
  content String @db.Text
  screenContext String? @map("screen_context") @db.VarChar(100)
  createdAt DateTime @default(now()) @map("created_at")

  @@index([sessionId])
  @@index([createdAt])
  @@map("help_messages")
}
```

## Migration Strategy

### Initial Setup

```bash
# 1. Initialize Prisma
npx prisma init

# 2. Configure database URL in .env
DATABASE_URL="postgresql://user:password@localhost:5432/taskify_mvp"

# 3. Create initial migration
npx prisma migrate dev --name init

# 4. Generate Prisma Client
npx prisma generate

# 5. Seed sample data
npx prisma db seed
```

### Seed Data

Seed script will create:
- 5 users (1 PM, 4 Engineers) with avatars
- 3 projects with descriptions
- All users as members of all projects
- 40-45 tasks distributed across projects and statuses
- Sample comments on some tasks (demonstrating ownership)
- No help messages (generated at runtime)

## Data Integrity Rules

### Cascading Deletes
- Delete Project → Delete all ProjectMembers, Tasks, Comments for that project
- Delete User → Remove ProjectMembers, Unassign Tasks, Delete authored Comments
- Delete Task → Delete all Comments on that task

### Validation in Application Layer
- Task title cannot be empty
- Comment content cannot be empty
- Cannot assign task to user not in project
- Cannot edit/delete comment authored by another user
- Task order_index must be recalculated when status changes (drag-drop)

### Audit Trail
- All entities have `created_at` timestamp
- Task and Comment have `updated_at` (auto-updated by Prisma)
- Comment has `edited_at` (manually set when edit occurs)

## Performance Considerations

### Indexes
- All foreign keys indexed for join performance
- Composite index on (project_id, status, order_index) for sorted task retrieval
- created_at indexes for chronological queries (comments, help messages)

### Query Optimization
- Use Prisma's `select` and `include` to fetch only needed fields
- Pagination for large result sets (not critical for MVP with fixed data)
- Connection pooling (Prisma default: 10 connections)

### Denormalization
None required for MVP. All queries can be satisfied with joins.

## Future Considerations (Post-MVP)

These are explicitly **not** included in MVP scope:

- Task history/audit log (track all status changes)
- File attachments on tasks
- Task dependencies/blockers
- Sprint/milestone grouping
- User-customizable columns beyond 4 fixed statuses
- Task due dates and reminders
- Full-text search on tasks and comments
- Archived projects/tasks (soft delete)
- User permissions/roles beyond PM/Engineer
