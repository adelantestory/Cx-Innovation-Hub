export enum TaskStatus {
  ToDo = 'To Do',
  InProgress = 'In Progress',
  InReview = 'In Review',
  Done = 'Done',
}

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  assignedTo: string | null;
  orderIndex: number;
  createdAt: string;
  updatedAt: string;
  assignee?: {
    id: string;
    name: string;
    avatarUrl: string | null;
  };
}
