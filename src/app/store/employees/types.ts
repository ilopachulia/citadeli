export interface Employee {
  birthday: Date;
  created_at: string;
  firstname: string;
  gender: "male" | "female" | "other";
  id: number;
  lastname: string;
  salary: number;
}
