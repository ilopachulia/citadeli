"use client";
import { ColumnsType } from "antd/es/table";
import { Employee } from "../store/employees/types";
import { useGate, useUnit } from "effector-react";
import {
  $employees,
  $fetchingEmployees,
  MembersPageGate,
  employeesFiltered,
} from "../store/employees";
import { Table } from "antd";
import { Spin } from "antd";

export default function EmployeesPage() {
  useGate(MembersPageGate);

  const employees = useUnit($employees);
  const isLoading = useUnit($fetchingEmployees);
  const filterEmployees = useUnit(employeesFiltered);

  const nameFilters = [...new Set(employees.map((emp) => emp.firstname))].map(
    (name) => ({
      text: name,
      value: name,
    })
  );

  const lastNameFilters = [
    ...new Set(employees.map((emp) => emp.lastname)),
  ].map((name) => ({
    text: name,
    value: name,
  }));

  const genderFilters = [...new Set(employees.map((emp) => emp.gender))].map(
    (name) => ({
      text: name,
      value: name,
    })
  );

  const columns: ColumnsType<Employee> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "სახელი",
      dataIndex: "firstname",
      key: "firstname",
      filters: nameFilters,
    },
    {
      title: "გვარი",
      dataIndex: "lastname",
      key: "lastname",
      filters: lastNameFilters,
    },
    {
      title: "სქესი",
      dataIndex: "gender",
      key: "gender",
      filters: genderFilters,
    },
    { title: "დაბადების თარიღი", dataIndex: "birthday", key: "birthday" },
    { title: "შეიქმნა", dataIndex: "created_at", key: "created_at" },
    { title: "ხელფასი", dataIndex: "salary", key: "salary" },
  ];

  if (isLoading) {
    return (
      <div className="min-w-screen min-h-screen flex justify-center items-center">
        <Spin wrapperClassName="w-screen min-h-screen flex justify-center items-center" />
      </div>
    );
  }

  return (
    <main className="w-screen h-screen">
      <Table
        columns={columns}
        dataSource={employees}
        onChange={(_, filters) => {
          console.log(filters);

          filterEmployees(filters);
        }}
      />
    </main>
  );
}
