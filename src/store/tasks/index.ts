import { attach, createEffect, sample } from "effector";
import { createGate } from "effector-react";
import { Task, TaskCreatePayload, TaskResponse } from "./types";
import dayjs from "dayjs";
import { fetchEmployeesFx } from "../employees";
import { app } from "../app";

const tasks = app.createDomain();

export const TasksPageGate = createGate();

export const $isApplicationLoaded = tasks.createStore(false);

export const $tasks = tasks.createStore<Task[]>([]);

export const $selectedTask = tasks.createStore<Task | null>(null);

// set selected task and request
export const taskSelected = tasks.createEvent<Task | null>();
$selectedTask.on(taskSelected, (_, task) => task);

export const fetchTasksFx = createEffect(async () => {
  try {
    const response = await fetch(
      "https://x8ki-letl-twmt.n7.xano.io/api:tSDGfQun/tasks"
    );
    if (!response.ok) {
      throw new Error("Failed to fetch members");
    }
    return (await response.json()) as TaskResponse[];
  } catch (error) {
    console.error("Error fetching members:", error);
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

// for contolling modal state
export const $isModalOpen = tasks.createStore(false);
export const modalClosed = tasks.createEvent();
export const modalOpened = tasks.createEvent();

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
        throw new Error("Failed to fetch members");
      }
      return (await response.json()) as Task;
    } catch (error) {
      console.error("Error fetching members:", error);
      throw error;
    }
  }
);

sample({
  clock: taskCreated,
  target: createTaskFx,
});

export const taskEdited = tasks.createEvent<Partial<Task>>();

export const editTaskFx = attach({
  source: { selectedTask: $selectedTask },
  effect: async ({ selectedTask }, body: Partial<Task>) => {
    if (!selectedTask) {
      throw new Error("No employee selected to edit");
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
        throw new Error("Failed to update employee");
      }

      return (await response.json()) as Task;
    } catch (error) {
      console.error("Error updating employee:", error);
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
    console.error("Error deleting tasks:", error);
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
