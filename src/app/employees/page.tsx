"use client";
import { ColumnsType } from "antd/es/table";
import { Employee } from "../../store/employees/types";
import { useGate, useUnit } from "effector-react";
import {
  $employees,
  $fetchingEmployees,
  $filteringEmployees,
  $genderFilters,
  $isApplicationLoaded,
  $isModalOpen,
  $lastNameFilters,
  $nameFilters,
  $selectedEmployee,
  EmployeePageGate,
  employeeDeleted,
  employeeSelected,
  employeesFiltered,
  modalClosed,
  modalOpened,
} from "../../store/employees";
import { Button, Modal, Popconfirm, Table } from "antd";
import { Spin } from "antd";
import { EmployeeForm } from "../../components/employee-form";
import Link from "next/link";
import Loading from "../loading";

export default function EmployeesPage() {
  useGate(EmployeePageGate);

  const [isModalOpen, openModal, closeModal] = useUnit([
    $isModalOpen,
    modalOpened,
    modalClosed,
  ]);
  const employees = useUnit($employees);

  const selectedEmployee = useUnit($selectedEmployee);
  const [selectEmployee, deleteEmployee] = useUnit([
    employeeSelected,
    employeeDeleted,
  ]);

  const [isLoading, isApplicationLoaded] = useUnit([
    $fetchingEmployees,
    $isApplicationLoaded,
  ]);
  const filterEmployees = useUnit(employeesFiltered);
  const isFiltering = useUnit($filteringEmployees);
  const { nameFilters, lastNameFilters, genderFilters } = useUnit({
    nameFilters: $nameFilters,
    lastNameFilters: $lastNameFilters,
    genderFilters: $genderFilters,
  });

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
    {
      title: "რედაქტირება",
      dataIndex: "edit",
      render: (_, record) =>
        employees.length >= 1 ? (
          <div className="flex items-center gap-2">
            <Button onClick={() => handleEdit(record)}>Edit</Button>

            <Popconfirm
              title="გსურთ წაშლა?"
              onConfirm={() => deleteEmployee(record.id)}
            >
              <Button>Delete</Button>
            </Popconfirm>
          </div>
        ) : null,
    },
  ];

  const handleAddEmployee = () => {
    openModal();
  };

  const handleEdit = (employee: Employee) => {
    selectEmployee(employee);
    openModal();
  };

  if (!isApplicationLoaded || isLoading) {
    return <Loading />;
  }

  return (
    <main className="w-screen h-screen">
      <div className="flex flex-col gap-5 p-3">
        <div className="flex justify-between items-center">
          <Link
            href="/tasks"
            className="text-blue-500 hover:underline text-xl"
          >
            <span>{"Tasks' Page"}</span>
          </Link>
          <Button
            type="primary"
            className="self-end"
            onClick={handleAddEmployee}
          >
            ახალი თანამშრომლის დამატება
          </Button>
        </div>

        <Table
          rowKey={(row) => row.id}
          loading={isFiltering}
          columns={columns}
          dataSource={employees}
          scroll={{ y: 500 }}
          onChange={(_, filters) => {
            filterEmployees(filters);
          }}
        />
      </div>

      <Modal
        destroyOnClose
        open={isModalOpen}
        onCancel={() => closeModal()}
        onOk={() => closeModal()}
        footer={null}
      >
        <EmployeeForm
          selectedEmployee={selectedEmployee}
          onClose={closeModal}
        />
      </Modal>
    </main>
  );
}
