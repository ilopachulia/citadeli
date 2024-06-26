import { attach, createEffect, sample } from "effector";
import { app } from "../app/app";
import { Employee } from "./types";
import { createGate } from "effector-react";
import { FilterValue } from "antd/es/table/interface";

const employees = app.createDomain();

export const MembersPageGate = createGate();

export const $employees = employees.createStore<Employee[]>([]);

export const employeesFiltered =
  employees.createEvent<Record<string, FilterValue | null>>();

export const fetchMembersFx = createEffect(async () => {
  try {
    const response = await fetch(
      "https://x8ki-letl-twmt.n7.xano.io/api:tSDGfQun/members"
    );
    if (!response.ok) {
      throw new Error("Failed to fetch members");
    }
    return (await response.json()) as Employee[];
  } catch (error) {
    console.error("Error fetching members:", error);
    throw error;
  }
});

export const $fetchingEmployees = fetchMembersFx.pending;

sample({
  clock: MembersPageGate.open,
  target: [fetchMembersFx],
});

sample({
  clock: fetchMembersFx.doneData,
  fn(data) {
    return data.map((employee) => {
      return {
        ...employee,
        created_at: new Date(employee.created_at).toLocaleDateString(),
        key: employee.id,
      };
    });
  },
  target: $employees,
});
