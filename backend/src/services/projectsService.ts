import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getAllProjects() {
  const projects = await prisma.project.findMany({
    include: {
      tasks: {
        select: { status: true }, // For counting by status
      },
    },
  });

  return projects.map((project) => ({
    id: project.id,
    name: project.name,
    description: project.description,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
    taskCounts: {
      toDo: project.tasks.filter((t) => t.status === 'ToDo').length,
      inProgress: project.tasks.filter((t) => t.status === 'InProgress').length,
      inReview: project.tasks.filter((t) => t.status === 'InReview').length,
      done: project.tasks.filter((t) => t.status === 'Done').length,
    },
  }));
}

export async function getProjectById(projectId: string) {
  const project = await prisma.project.findUnique({
    where: { id: projectId },
  });

  if (!project) {
    const error: any = new Error('Project not found');
    error.statusCode = 404;
    error.type = 'NOT_FOUND';
    error.userMessage = 'Project not found';
    throw error;
  }

  return {
    id: project.id,
    name: project.name,
    description: project.description,
    createdAt: project.createdAt.toISOString(),
    updatedAt: project.updatedAt.toISOString(),
  };
}

export async function getProjectTasks(projectId: string) {
  // CRITICAL: Order by (status, orderIndex) for Kanban display
  const tasks = await prisma.task.findMany({
    where: { projectId },
    include: {
      assignee: {
        select: { id: true, name: true, avatarUrl: true },
      },
    },
    orderBy: [{ status: 'asc' }, { orderIndex: 'asc' }],
  });

  return tasks.map((task) => ({
    id: task.id,
    projectId: task.projectId,
    title: task.title,
    description: task.description,
    status: task.status,
    assignedTo: task.assignedTo,
    orderIndex: task.orderIndex,
    createdAt: task.createdAt.toISOString(),
    updatedAt: task.updatedAt.toISOString(),
    assignee: task.assignee
      ? {
          id: task.assignee.id,
          name: task.assignee.name,
          avatarUrl: task.assignee.avatarUrl,
        }
      : undefined,
  }));
}
