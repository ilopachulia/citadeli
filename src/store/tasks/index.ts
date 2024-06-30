import { attach, createEffect, sample } from "effector";
import { createGate } from "effector-react";
import { Task, TaskCreatePayload, TaskResponse } from "./types";
import dayjs from "dayjs";
import { fetchEmployeesFx } from "../employees";
import { app } from "../app";
import { FilterPayload } from "@/shared/types";
import { isOverdue } from "@/shared/find-overdue-task";

const tasks = app.createDomain();

export const TasksPageGate = createGate();

export const $isApplicationLoaded = tasks.createStore(false);

export const $tasks = tasks.createStore<Task[]>([]);

// for contolling modal state
export const $isModalOpen = tasks.createStore(false);
export const modalClosed = tasks.createEvent();
export const modalOpened = tasks.createEvent();

sample({
  clock: modalClosed,
  fn() {
    return false;
  },
  target: $isModalOpen,
});

sample({
  clock: modalOpened,
  fn() {
    return true;
  },
  target: $isModalOpen,
});

export const fetchTasksFx = createEffect(async () => {
  try {
    const response = await fetch(
      "https://x8ki-letl-twmt.n7.xano.io/api:tSDGfQun/tasks"
    );
    if (!response.ok) {
      throw new Error("Failed to fetch tasks");
    }
    return (await response.json()) as TaskResponse[];
  } catch (error) {
    console.error("Error fetching tasks:", error);
    throw error;
  }
});

export const $isTasksFetching = fetchTasksFx.pending;

sample({
  clock: TasksPageGate.open,
  target: [fetchTasksFx, fetchEmployeesFx],
});

sample({
  clock: TasksPageGate.open,
  fn() {
    return true;
  },
  target: $isApplicationLoaded,
});

export const $assigneeOptions = tasks.createStore<
  { value: number; label: string }[]
>([]);
sample({
  clock: fetchEmployeesFx.doneData,
  fn: (doneData) => {
    return doneData.map((employee) => {
      return {
        value: employee.id,
        label: `${employee.firstname} ${employee.lastname}`,
      };
    });
  },
  target: $assigneeOptions,
});

//setting data
sample({
  clock: fetchTasksFx.doneData,
  fn(data) {
    return data.map((task) => {
      return {
        ...task,
        assigned_member: { ...task._assigned_member },
        assigned_member_name: `${task?._assigned_member?.firstname ?? ""} ${
          task?._assigned_member?.lastname ?? ""
        }`.trim(),
        created_at: new Date(task.created_at).toLocaleDateString(),
      };
    });
  },
  target: $tasks,
});

// creating new task
export const taskCreated = tasks.createEvent<TaskCreatePayload>();
export const createTaskFx = tasks.createEffect(
  async (body: TaskCreatePayload) => {
    try {
      const response = await fetch(
        "https://x8ki-letl-twmt.n7.xano.io/api:tSDGfQun/tasks",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...body,
            completion_date: dayjs(body.completion_date).format("YYYY-MM-DD"),
          }),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to create task");
      }
      return (await response.json()) as Task;
    } catch (error) {
      console.error("Error while creating task:", error);
      throw error;
    }
  }
);

sample({
  clock: taskCreated,
  target: createTaskFx,
});

sample({
  clock: createTaskFx.doneData,
  source: $tasks,
  fn(tasks, created) {
    console.log(created);
    return [
      ...tasks,
      {
        ...created,
        created_at: dayjs(created.created_at).format("YYYY-MM-DD"),
      },
    ];
  },
  target: $tasks,
});

sample({
  clock: createTaskFx.doneData,
  target: modalClosed,
});

//for editing task's data
export const $selectedTask = tasks.createStore<TaskResponse | null>(null);

export const taskSelected = tasks.createEvent<Task["id"]>();

export const selectTaskFx = createEffect(async (id: Task["id"]) => {
  const response = await fetch(
    `https://x8ki-letl-twmt.n7.xano.io/api:tSDGfQun/tasks/${id}`
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  const data = await response.json();
  return data;
});

sample({
  clock: taskSelected,
  target: selectTaskFx,
});

sample({
  source: selectTaskFx.doneData,
  target: $selectedTask,
});

sample({
  clock: modalClosed,
  fn() {
    return null;
  },
  target: $selectedTask,
});

export const taskEdited = tasks.createEvent<Partial<Task>>();

export const editTaskFx = attach({
  source: { selectedTask: $selectedTask },
  effect: async ({ selectedTask }, body: Partial<Task>) => {
    if (!selectedTask) {
      throw new Error("No task selected to edit");
    }

    const { id } = selectedTask;

    try {
      const response = await fetch(
        `https://x8ki-letl-twmt.n7.xano.io/api:tSDGfQun/tasks/${id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to update task");
      }

      return (await response.json()) as Task;
    } catch (error) {
      console.error("Error while updating task:", error);
      throw error;
    }
  },
});

sample({
  clock: taskEdited,
  target: editTaskFx,
});

sample({
  clock: editTaskFx.doneData,
  target: modalClosed,
});

sample({
  clock: editTaskFx.doneData,
  source: $tasks,
  fn: (currentTasks, editedTask) =>
    currentTasks.map((tsk) => (tsk.id === editedTask.id ? editedTask : tsk)),
  target: $tasks,
});


// deleting existing task
export const taskDeleted = tasks.createEvent<Task["id"]>();

export const deleteTaskFx = createEffect(async (id: Task["id"]) => {
  try {
    const response = await fetch(
      `https://x8ki-letl-twmt.n7.xano.io/api:tSDGfQun/tasks/${id}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      throw new Error("Error while deleting task");
    }
    return id;
  } catch (error) {
    console.error("Error deleting task:", error);
    throw error;
  }
});

sample({
  clock: taskDeleted,
  target: [deleteTaskFx],
});

sample({
  clock: deleteTaskFx.doneData,
  source: $tasks,
  fn(tasks, deleted) {
    return tasks.filter((tsk) => tsk.id !== deleted);
  },
  target: $tasks,
});


// for filtering tasks
export const tasksFiltered = tasks.createEvent<FilterPayload>();

//for storing filters data
export const $titleFilters = tasks.createStore<
  { text: string; value: string }[]
>([]);

export const $dateFilters = tasks.createStore<
  { text: string; value: string }[]
>([]);

export const $statusFilters = tasks.createStore<
  { text: string; value: string }[]
>([]);

export const $assigneeFilters = tasks.createStore<
  { text: string; value: string }[]
>([]);

//setting filters
sample({
  clock: fetchTasksFx.doneData,
  fn(data) {
    return [...new Set(data.map((tsk) => tsk.title))].map((title) => ({
      text: title,
      value: title,
    }));
  },
  target: $titleFilters,
});

sample({
  clock: fetchTasksFx.doneData,
  fn: () => [{ text: "ვადაგადაცილებული", value: "overdue" }],
  target: $dateFilters,
});

sample({
  clock: fetchTasksFx.doneData,
  fn(data) {
    return [...new Set(data.map((tsk) => tsk.status))].map((status) => ({
      text: status,
      value: status,
    }));
  },
  target: $statusFilters,
});

sample({
  clock: fetchTasksFx.doneData,
  fn: (data) => {
    const uniqueAssigneesMap = new Map();

    data.forEach((tsk) => {
      const assignee = tsk._assigned_member;
      if (assignee) {
        const assigneeId = assignee.id;
        if (!uniqueAssigneesMap.has(assigneeId)) {
          uniqueAssigneesMap.set(assigneeId, {
            text: `${assignee.firstname} ${assignee.lastname}`,
            value: assigneeId.toString(),
          });
        }
      }
    });

    return Array.from(uniqueAssigneesMap.values());
  },
  target: $assigneeFilters,
});
