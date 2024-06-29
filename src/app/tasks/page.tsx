"use client";
import { Button, Modal, Popconfirm, Table } from "antd";
import { $isModalOpen, modalClosed, modalOpened } from "../../store/tasks";
import { useGate, useUnit } from "effector-react";
import { ColumnsType } from "antd/es/table";
import {
  $assigneeFilters,
  $dateFilters,
  $isApplicationLoaded,
  $isTasksFetching,
  $selectedTask,
  $statusFilters,
  $tasks,
  $titleFilters,
  TasksPageGate,
  taskDeleted,
  taskSelected,
  tasksFiltered,
} from "../../store/tasks";
import { Task } from "../../store/tasks/types";
import { TaskForm } from "../../components/task-form";
import Link from "next/link";
import Loading from "../loading";
import { isOverdue } from "@/shared/find-overdue-task";

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

  const filterTasks = useUnit(tasksFiltered);
  // const isFiltering = useUnit($filteringTasks);

  const { titleFilters, dateFilters, statusFilters, assigneeFilters } = useUnit(
    {
      titleFilters: $titleFilters,
      dateFilters: $dateFilters,
      statusFilters: $statusFilters,
      assigneeFilters: $assigneeFilters,
    }
  );

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
      filters: titleFilters,
      onFilter: (value, record) => record.title.includes(value as string),
    },
    {
      title: "შესრულების თარიღი",
      dataIndex: "completion_date",
      key: "completion_date",
      filters: dateFilters,
      onFilter: (_, record) => isOverdue(record),
      render: (text, record) => {
        const overdue = isOverdue(record);
        return {
          props: {
            style: {
              backgroundColor: overdue ? "lightcoral" : "lightgreen",
            },
          },
          children: text,
        };
      },
    },
    {
      title: "სტატუსი",
      dataIndex: "status",
      key: "status",
      filters: statusFilters,
      onFilter: (value, record) => record.status.includes(value as string),
    },
    {
      title: "პასუხისმგებელი პირი",
      dataIndex: "assigned_member_name",
      key: "assigned_member_name",
      filters: assigneeFilters,
      onFilter: (value, record) => record.assigned_member.id === Number(value),
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
          <Link
            href="/employees"
            className="text-blue-500 hover:underline text-xl"
          >
            <span>{"Employee's Page"}</span>
          </Link>
          <Button type="primary" className="self-end" onClick={handleAddTask}>
            ახალი დავალების დამატება
          </Button>
        </div>

        <Table
          rowKey={(row) => row.id}
          // loading={isFiltering}
          columns={columns}
          dataSource={tasks}
          scroll={{ y: 500 }}
          onChange={(_, filters) => {
            filterTasks(filters);
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
