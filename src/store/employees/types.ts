export interface Employee {
  birthday: string;
  created_at: string;
  firstname: string;
  gender: "male" | "female";
  id: number;
  lastname: string;
  salary: number;
}


export type EmployeeCreatePayload = Omit<Employee, "created_at" | "id">;
