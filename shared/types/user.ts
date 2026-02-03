export enum UserRole {
  PM = 'PM',
  Engineer = 'Engineer',
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  avatarUrl: string | null;
  createdAt: string;
}
