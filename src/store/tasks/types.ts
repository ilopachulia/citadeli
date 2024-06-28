export interface Task {
  id: number;
  created_at: string;
  title: string;
  completion_date: string;
  status: string;
  assigned_member: {
    id: number;
    firstname: string;
    lastname: string;
  };
}

export interface TaskResponse {
  id: number;
  created_at: string;
  title: string;
  completion_date: string;
  status: string;
  _assigned_member: {
    id: number;
    firstname: string;
    lastname: string;
  };
}

export type TaskCreatePayload = Pick<
  Task,
  "created_at" | "completion_date" | "status" | "title"
> & { assigned_member_id: number; description: string };
