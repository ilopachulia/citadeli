import { attach, createEffect, sample } from "effector";
import { app } from "../app/app";
import { Employee } from "./types";
import { createGate } from "effector-react";
import { FilterPayload } from "../../shared/types";
import { constructQueryString } from "../../utils/construct-query-string";

type EmployeeCreatePayload = Omit<Employee, "created_at" | "id">;

const employees = app.createDomain();

export const MembersPageGate = createGate();

//for storing employees data
export const $employees = employees.createStore<Employee[]>([]);

//for editing employee's data
export const $selectedEmployee = employees.createStore<Employee | null>(null);

//for storing filters data
export const $nameFilters = employees.createStore<
  { text: string; value: string }[]
>([]);

export const $lastNameFilters = employees.createStore<
  { text: string; value: string }[]
>([]);

export const $genderFilters = employees.createStore<
  { text: string; value: string }[]
>([]);

//delete event and request
export const employeeDeleted = employees.createEvent<Employee["id"]>();

export const deleteEmployeeFx = createEffect(async (id: Employee["id"]) => {
  try {
    const response = await fetch(
      `https://x8ki-letl-twmt.n7.xano.io/api:tSDGfQun/members/${id}`,
      {
        method: "DELETE",
      }
    );
    if (!response.ok) {
      throw new Error("Failed to fetch members");
    }
    return id;
  } catch (error) {
    console.error("Error fetching members:", error);
    throw error;
  }
});

sample({
  clock: employeeDeleted,
  target: [deleteEmployeeFx],
});

sample({
  clock: deleteEmployeeFx.doneData,
  source: $employees,
  fn(employees, deleted) {
    return employees.filter((emp) => emp.id !== deleted);
  },
  target: $employees,
});

// set selected employee and request
export const employeeSelected = employees.createEvent<Employee | null>();
$selectedEmployee.on(employeeSelected, (_, employee) => employee);

//filter event and request

export const employeesFiltered = employees.createEvent<FilterPayload>();

export const filterEmployeesFx = createEffect(
  async (filters: FilterPayload) => {
    try {
      const params = constructQueryString(filters);

      const response = await fetch(
        `https://x8ki-letl-twmt.n7.xano.io/api:tSDGfQun/members?${params}`
      );
      if (!response.ok) {
        throw new Error("Failed to fetch members");
      }
      return (await response.json()) as Employee[];
    } catch (error) {
      console.error("Error fetching members:", error);
      throw error;
    }
  }
);

// for contolling modal state
export const $isModalOpen = employees.createStore(false);
export const modalClosed = employees.createEvent();
export const modalOpened = employees.createEvent();

sample({
  clock: modalClosed,
  fn() {
    return false;
  },
  target: $isModalOpen,
});

sample({
  clock: modalClosed,
  fn() {
    return null;
  },
  target: $selectedEmployee,
});

sample({
  clock: modalOpened,
  fn() {
    return true;
  },
  target: $isModalOpen,
});

// requests
sample({
  clock: employeesFiltered,
  target: [filterEmployeesFx],
});

sample({
  clock: filterEmployeesFx.doneData,
  target: $employees,
});

export const fetchEmployeesFx = createEffect(async () => {
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

export const $fetchingEmployees = fetchEmployeesFx.pending;
export const $filteringEmployees = filterEmployeesFx.pending;

sample({
  clock: MembersPageGate.open,
  target: [fetchEmployeesFx],
});

//setting filters
sample({
  clock: fetchEmployeesFx.doneData,
  fn(data) {
    return [...new Set(data.map((emp) => emp.firstname))].map((name) => ({
      text: name,
      value: name,
    }));
  },
  target: $nameFilters,
});

sample({
  clock: fetchEmployeesFx.doneData,
  fn(data) {
    return [...new Set(data.map((emp) => emp.lastname))].map((name) => ({
      text: name,
      value: name,
    }));
  },
  target: $lastNameFilters,
});

sample({
  clock: fetchEmployeesFx.doneData,
  fn(data) {
    return [...new Set(data.map((emp) => emp.gender))].map((name) => ({
      text: name,
      value: name,
    }));
  },
  target: $genderFilters,
});

//setting data
sample({
  clock: fetchEmployeesFx.doneData,
  fn(data) {
    return data.map((employee) => {
      return {
        ...employee,
        created_at: new Date(employee.created_at).toLocaleDateString(),
      };
    });
  },
  target: $employees,
});

export const employeeCreated =
  employees.createEvent<Partial<EmployeeCreatePayload>>();
export const createEmployeFx = employees.createEffect(
  async (body: Partial<EmployeeCreatePayload>) => {
    try {
      const response = await fetch(
        "https://x8ki-letl-twmt.n7.xano.io/api:tSDGfQun/members",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(body),
        }
      );
      if (!response.ok) {
        throw new Error("Failed to fetch members");
      }
      return (await response.json()) as Employee;
    } catch (error) {
      console.error("Error fetching members:", error);
      throw error;
    }
  }
);

sample({
  clock: employeeCreated,
  target: createEmployeFx,
});

sample({
  clock: createEmployeFx.doneData,
  source: $employees,
  fn(employees, created) {
    return [...employees, created];
  },
  target: $employees,
});

sample({
  clock: createEmployeFx.doneData,
  target: modalClosed,
});

export const employeeEdited = employees.createEvent<Employee>();

export const editEmployeFx = attach({
  source: $selectedEmployee,
  effect: editEmployeeEffect,
});

async function editEmployeeEffect(
  selectedEmployee: Employee | null,
  body: Employee
): Promise<Employee> {
  if (!selectedEmployee) {
    throw new Error("No employee selected to edit");
  }

  const { id } = selectedEmployee;

  try {
    const response = await fetch(
      `https://x8ki-letl-twmt.n7.xano.io/api:tSDGfQun/members/${id}`,
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

    return (await response.json()) as Employee;
  } catch (error) {
    console.error("Error updating employee:", error);
    throw error;
  }
}

sample({
  clock: employeeEdited,
  target: editEmployeFx,
});

sample({
  clock: editEmployeFx.doneData,
  target: modalClosed,
});

sample({
  clock: editEmployeFx.doneData,
  source: $employees,
  fn: (currentEmployees, editedEmployee) =>
    currentEmployees.map((emp) =>
      emp.id === editedEmployee.id ? editedEmployee : emp
    ),
  target: $employees,
});
