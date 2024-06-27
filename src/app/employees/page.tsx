"use client";
import { ColumnsType } from "antd/es/table";
import { Employee } from "../store/employees/types";
import { useGate, useUnit } from "effector-react";
import {
  $employees,
  $fetchingEmployees,
  $filteringEmployees,
  $genderFilters,
  $isModalOpen,
  $lastNameFilters,
  $nameFilters,
  $selectedEmployee,
  MembersPageGate,
  employeeDeleted,
  employeeSelected,
  employeesFiltered,
  modalClosed,
  modalOpened,
} from "../store/employees";
import { Button, Modal, Popconfirm, Table } from "antd";
import { Spin } from "antd";
import { EmployeeForm } from "../components/employee-form";

export default function EmployeesPage() {
  useGate(MembersPageGate);

  const [isModalOpen, openModal, closeModal] = useUnit([
    $isModalOpen,
    modalOpened,
    modalClosed,
  ]);
  const employees = useUnit($employees);
  const selectedEmployee = useUnit($selectedEmployee);
  const selectEmployee = useUnit(employeeSelected);
  const deleteEmployee = useUnit(employeeDeleted);
  const isLoading = useUnit($fetchingEmployees);
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

  if (isLoading) {
    return (
      <div className="min-w-screen min-h-screen flex justify-center items-center">
        <Spin wrapperClassName="w-screen min-h-screen flex justify-center items-center" />
      </div>
    );
  }

  return (
    <main className="w-screen h-screen">
      <div className="flex flex-col gap-5 p-3">
        <Button type="primary" className="self-end" onClick={handleAddEmployee}>
          ახალი თანამშრომლის დამატება
        </Button>

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
