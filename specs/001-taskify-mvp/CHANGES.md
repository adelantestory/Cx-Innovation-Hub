# Plan.md Enhancement Summary

**Date**: 2026-01-25
**Scope**: Applied all CRITICAL fixes from audit-findings.md

## Changes Applied

### 1. Environment Variables Section (NEW)
- **Location**: After Complexity Tracking
- **Content**: Complete .env specifications for both backend and frontend
- All required variables documented with examples
- Validation commands provided

### 2. Enhanced Data Model Section
- **Location**: Phase 1 → Data Model
- **Changes**:
  - Organized entities by implementation phase
  - Added direct line number references to data-model.md
  - Highlighted CRITICAL fields (orderIndex, status, editedAt, screenContext)
  - Included validation rules and business logic inline

### 3. Enhanced API Contracts Section
- **Location**: Phase 1 → API Contracts
- **Changes**:
  - Added line number references to all 4 contract YAML files
  - Documented request/response schemas inline
  - Added validation rules (e.g., assignedTo must be project member)
  - Added response time targets
  - Included side effects (WebSocket broadcasts)

### 4. WebSocket Events Documentation (NEW)
- **Location**: Phase 1 → API Contracts → WebSocket Events
- **Content**:
  - Complete TypeScript schemas for all events
  - Server → Client events: `task:updated`, `comment:added`
  - Client → Server events: `join:project`, `leave:project`
  - Room design explained
  - When to emit / implementation notes

### 5. Seed Data Specification (NEW)
- **Location**: Phase 1 → Seed Data Specification
- **Content**:
  - Complete execution order with code examples
  - Exact user data (5 users with names, emails, roles, avatars)
  - Exact project data (3 projects with descriptions)
  - Task distribution requirements (40% To Do, 30% In Progress, etc.)
  - Sample task titles and assignments
  - Comment requirements (permission test cases, edited comments)
  - Validation checklist

### 6. Detailed Implementation Sequence (NEW - Replaces "Critical Path")
- **Location**: Implementation Notes section (now "Detailed Implementation Sequence")
- **Content**:
  - **Phase 1**: Project Initialization (directory structure, dependencies, config)
  - **Phase 2**: Database Foundation (Prisma setup, migrations, seeding)
  - **Phase 3**: Express Server Setup (app config, WebSocket server, middleware)
  - **Phase 4**: REST API - Projects (service → controller → routes → tests)
  - **Phase 5**: REST API - Tasks (with validation logic)
  - **Phase 6**: WebSocket Integration (event handlers, real-time broadcasts)
  - **Phase 7**: REST API - Comments (permission enforcement)
  - **Phase 8**: REST API - AI Help (OpenAI integration, context-aware prompts)
  - **Phase 9**: Backend Validation (run all tests)
  - **Phase 10**: Frontend Initialization (Vite, dependencies, config)
  - **Phase 11**: Shared Types (type consistency across client/server)
  - **Phases 12-18**: Frontend Components (outlined, detailed in sequence)

Each phase includes:
- Exact file paths
- Code examples
- Critical implementation notes
- Test specifications

### 7. Drag-Drop Order Management Algorithm (NEW)
- **Location**: After implementation sequence
- **Content**:
  - **Scenario 1**: Reorder within same column (complete TypeScript code)
  - **Scenario 2**: Move to different column (complete TypeScript code)
  - **Frontend Optimistic Update**: React Query implementation
  - **Performance Considerations**: Indexes, transactions, WebSocket timing

### 8. User Story Implementation Map (NEW)
- **Location**: Before Phase 0
- **Content**: Complete traceability for all 6 user stories
  - Backend components with contract references
  - Frontend components with file paths
  - Database entities with line numbers
  - Acceptance Criteria → Test Mapping
  - Implementation phase references
  - Critical implementation details highlighted

## Impact

### Before Enhancement
- Plan was high-level and required implementer to make many decisions
- Cross-references existed but lacked specificity (no line numbers)
- No implementation sequence → paralysis deciding what to build first
- Complex algorithms (drag-drop) mentioned but not specified
- Test requirements listed but not mapped to contracts

### After Enhancement
- Plan is implementable step-by-step with minimal decisions
- All cross-references include exact line numbers
- Clear 18-phase implementation sequence from initialization to completion
- Drag-drop algorithm provided as copy-paste code
- Tests mapped to specific contract sections and acceptance criteria
- Complete traceability from user stories → implementation → tests

## Metrics

- **Lines added**: ~800+ lines of detailed specifications
- **New sections**: 5 major sections added
- **Enhanced sections**: 3 existing sections significantly expanded
- **Code examples**: 15+ TypeScript/JavaScript code snippets
- **Cross-references**: 30+ specific line number references to design artifacts

## Next Steps

The plan.md is now ready for task generation:

```bash
/speckit.tasks
```

This will generate tasks.md with implementation tasks organized by user story, leveraging all the detailed specifications we've added to plan.md.
