import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function getTaskComments(taskId: string) {
  const comments = await prisma.comment.findMany({
    where: { taskId },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
    orderBy: { createdAt: 'asc' },
  });

  return comments.map((comment) => ({
    ...comment,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    editedAt: comment.editedAt ? comment.editedAt.toISOString() : null,
  }));
}

export async function createComment(data: {
  taskId: string;
  authorId: string;
  content: string;
}) {
  const comment = await prisma.comment.create({
    data: {
      taskId: data.taskId,
      authorId: data.authorId,
      content: data.content,
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  return {
    ...comment,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    editedAt: comment.editedAt ? comment.editedAt.toISOString() : null,
  };
}

export async function updateComment(
  commentId: string,
  authorId: string,
  content: string
) {
  // First, verify the user owns the comment
  const existingComment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!existingComment) {
    throw new Error('Comment not found');
  }

  if (existingComment.authorId !== authorId) {
    throw new Error('Unauthorized: You can only edit your own comments');
  }

  const comment = await prisma.comment.update({
    where: { id: commentId },
    data: {
      content,
      editedAt: new Date(),
    },
    include: {
      author: {
        select: {
          id: true,
          name: true,
          avatarUrl: true,
        },
      },
    },
  });

  return {
    ...comment,
    createdAt: comment.createdAt.toISOString(),
    updatedAt: comment.updatedAt.toISOString(),
    editedAt: comment.editedAt ? comment.editedAt.toISOString() : null,
  };
}

export async function deleteComment(commentId: string, authorId: string) {
  // First, verify the user owns the comment
  const existingComment = await prisma.comment.findUnique({
    where: { id: commentId },
  });

  if (!existingComment) {
    throw new Error('Comment not found');
  }

  if (existingComment.authorId !== authorId) {
    throw new Error('Unauthorized: You can only delete your own comments');
  }

  await prisma.comment.delete({
    where: { id: commentId },
  });

  return { success: true };
}
