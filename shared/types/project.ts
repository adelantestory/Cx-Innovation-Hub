export interface Project {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
  taskCounts?: {
    toDo: number;
    inProgress: number;
    inReview: number;
    done: number;
  };
}

export interface ProjectMember {
  id: string;
  projectId: string;
  userId: string;
  joinedAt: string;
}
