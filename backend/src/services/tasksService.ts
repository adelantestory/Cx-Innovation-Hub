import { PrismaClient, TaskStatus } from '@prisma/client';
import { getIO } from '../websocket/taskEvents';

const prisma = new PrismaClient();

export async function getTask(taskId: string) {
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignee: {
        select: { id: true, name: true, avatarUrl: true },
      },
      comments: {
        include: {
          author: {
            select: { id: true, name: true, avatarUrl: true },
          },
        },
        orderBy: { createdAt: 'asc' },
      },
    },
  });

  if (!task) {
    const error: any = new Error('Task not found');
    error.statusCode = 404;
    error.type = 'NOT_FOUND';
    error.userMessage = 'Task not found';
    throw error;
  }

  return task;
}

export async function updateTask(
  taskId: string,
  data: {
    status?: TaskStatus;
    assignedTo?: string | null;
    orderIndex?: number;
    title?: string;
    description?: string | null;
  }
) {
  // Get the task first to check project membership if assigning
  const task = await prisma.task.findUnique({
    where: { id: taskId },
    select: { projectId: true, status: true },
  });

  if (!task) {
    const error: any = new Error('Task not found');
    error.statusCode = 404;
    error.type = 'NOT_FOUND';
    error.userMessage = 'Task not found';
    throw error;
  }

  // CRITICAL: Validate assignedTo is project member
  if (data.assignedTo !== undefined && data.assignedTo !== null) {
    const isMember = await prisma.projectMember.findFirst({
      where: {
        projectId: task.projectId,
        userId: data.assignedTo,
      },
    });

    if (!isMember) {
      const error: any = new Error('Cannot assign task to user who is not a project member');
      error.statusCode = 400;
      error.type = 'VALIDATION_ERROR';
      error.userMessage = 'Cannot assign task to user who is not a project member';
      throw error;
    }
  }

  // CRITICAL: If status changed, handle orderIndex recalculation
  if (data.status && data.status !== task.status) {
    // Moving to a different column
    await moveToNewColumn(
      taskId,
      data.status,
      data.orderIndex !== undefined ? data.orderIndex : 0,
      task.projectId
    );
  } else if (data.orderIndex !== undefined && data.status === task.status) {
    // Reordering within same column
    await reorderWithinColumn(taskId, data.orderIndex, task.projectId, task.status);
  } else {
    // Simple update (no status/order change)
    await prisma.task.update({
      where: { id: taskId },
      data,
    });
  }

  // Fetch updated task with assignee
  const updatedTask = await prisma.task.findUnique({
    where: { id: taskId },
    include: {
      assignee: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
  });

  // CRITICAL: Emit WebSocket event AFTER database update succeeds
  try {
    const io = getIO();
    io.to(`project:${task.projectId}`).emit('task:updated', {
      event: 'task:updated',
      projectId: task.projectId,
      task: {
        id: updatedTask!.id,
        projectId: updatedTask!.projectId,
        title: updatedTask!.title,
        status: updatedTask!.status,
        assignedTo: updatedTask!.assignedTo,
        orderIndex: updatedTask!.orderIndex,
        updatedAt: updatedTask!.updatedAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('Failed to emit WebSocket event:', error);
    // Don't fail the request if WebSocket broadcast fails
  }

  return updatedTask;
}

/**
 * Reorder within same column
 * User drags task from index 2 to index 5 within "In Progress" column
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
    orderBy: { orderIndex: 'asc' },
  });

  // 2. Remove dragged task from array
  const draggedTask = tasksInColumn.find((t) => t.id === taskId);
  const filtered = tasksInColumn.filter((t) => t.id !== taskId);

  if (!draggedTask) {
    throw new Error('Task not found in column');
  }

  // 3. Insert at new position
  filtered.splice(newIndex, 0, draggedTask);

  // 4. Recalculate ALL orderIndex values sequentially
  // CRITICAL: Use transaction to ensure atomicity
  await prisma.$transaction(
    filtered.map((task, index) =>
      prisma.task.update({
        where: { id: task.id },
        data: { orderIndex: index },
      })
    )
  );
}

/**
 * Move to different column
 * User drags task from "To Do" to "In Progress" (drop at index 3)
 */
async function moveToNewColumn(
  taskId: string,
  newStatus: TaskStatus,
  newIndex: number,
  projectId: string
) {
  const task = await prisma.task.findUnique({ where: { id: taskId } });

  if (!task) {
    throw new Error('Task not found');
  }

  const oldStatus = task.status;

  // CRITICAL: Use transaction for all updates
  await prisma.$transaction(async (tx) => {
    // 1. Update dragged task
    await tx.task.update({
      where: { id: taskId },
      data: {
        status: newStatus,
        orderIndex: newIndex,
      },
    });

    // 2. Recalculate old column (close gap)
    const oldColumnTasks = await tx.task.findMany({
      where: { projectId, status: oldStatus, id: { not: taskId } },
      orderBy: { orderIndex: 'asc' },
    });

    for (let i = 0; i < oldColumnTasks.length; i++) {
      await tx.task.update({
        where: { id: oldColumnTasks[i].id },
        data: { orderIndex: i },
      });
    }

    // 3. Recalculate new column (make space)
    const newColumnTasks = await tx.task.findMany({
      where: { projectId, status: newStatus, id: { not: taskId } },
      orderBy: { orderIndex: 'asc' },
    });

    // Insert dragged task at correct position in array
    const reordered = [...newColumnTasks];
    reordered.splice(newIndex, 0, task);

    // Update all tasks in new column
    for (let i = 0; i < reordered.length; i++) {
      if (reordered[i].id !== taskId) {
        await tx.task.update({
          where: { id: reordered[i].id },
          data: { orderIndex: i },
        });
      }
    }
  });
}
