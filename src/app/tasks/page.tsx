"use client";
import { Button, Modal, Popconfirm, Table } from "antd";
import { $isModalOpen, modalClosed, modalOpened } from "../../store/employees";
import { useGate, useUnit } from "effector-react";
import { ColumnsType } from "antd/es/table";
import {
  $isApplicationLoaded,
  $isTasksFetching,
  $selectedTask,
  $tasks,
  TasksPageGate,
  taskDeleted,
  taskSelected,
} from "../../store/tasks";
import { Task } from "../../store/tasks/types";
import { TaskForm } from "../../components/task-form";
import Link from "next/link";
import Loading from "../loading";

export default function TasksPage() {
  useGate(TasksPageGate);

  const tasks = useUnit($tasks);
  const [isModalOpen, openModal, closeModal] = useUnit([
    $isModalOpen,
    modalOpened,
    modalClosed,
  ]);

  const [isFetchingTasks, isLoaded] = useUnit([
    $isTasksFetching,
    $isApplicationLoaded,
  ]);

  const selectedTask = useUnit($selectedTask);

  const [selectTask, deleteTask] = useUnit([taskSelected, taskDeleted]);

  const columns: ColumnsType<Task> = [
    {
      title: "ID",
      dataIndex: "id",
      key: "id",
    },
    {
      title: "სათაური",
      dataIndex: "title",
      key: "title",
    },
    {
      title: "შესრულების თარიღი",
      dataIndex: "completion_date",
      key: "completion_date",
    },
    {
      title: "სტატუსი",
      dataIndex: "status",
      key: "status",
    },
    {
      title: "პასუხისმგებელი პირი",
      dataIndex: "assigned_member_name",
      key: "assigned_member_name",
    },

    {
      title: "რედაქტირება",
      dataIndex: "edit",
      render: (_, record) =>
        tasks.length >= 1 ? (
          <div className="flex items-center gap-2">
            <Button onClick={() => handleEdit(record)}>Edit</Button>

            <Popconfirm
              title="გსურთ წაშლა?"
              onConfirm={() => deleteTask(record.id)}
            >
              <Button>Delete</Button>
            </Popconfirm>
          </div>
        ) : null,
    },
  ];

  const handleAddTask = () => {
    openModal();
  };

  const handleEdit = (task: Task) => {
    selectTask(task);
    openModal();
  };

  if (!isLoaded || isFetchingTasks) {
    return <Loading />;
  }

  return (
    <main className="w-screen h-screen">
      <div className="flex flex-col gap-5 p-3">
        <div className="flex justify-between items-center">
          <Link href="/" className="text-blue-500 hover:underline text-xl">
            Home
          </Link>
          <Button type="primary" className="self-end" onClick={handleAddTask}>
            ახალი დავალების დამატება
          </Button>
        </div>

        <Table
          rowKey={(row) => row.id}
          //   loading={isFiltering}
          columns={columns}
          dataSource={tasks}
          scroll={{ y: 500 }}
          onChange={(_, filters) => {
            // filterEmployees(filters);
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
        <TaskForm onClose={closeModal} selectedTask={selectedTask} />
      </Modal>
    </main>
  );
}
