import dayjs from "dayjs";
import { Task } from "@/store/tasks/types";

// Function to check if the task is overdue
export const isOverdue = (task: Task) => {
  const today = dayjs();
  const completionDate = dayjs(task.completion_date);
  return task.status === "ongoing" && today.isAfter(completionDate);
};
