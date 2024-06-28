"use client";
import { Button, DatePicker, Form, Input, Radio, Select } from "antd";

import React from "react";
import { useUnit } from "effector-react";
import TextArea from "antd/es/input/TextArea";
import { $assigneeOptions, taskCreated, taskEdited } from "@/store/tasks";
import dayjs from "dayjs";
import { Task } from "@/store/tasks/types";

type FieldType = {
  title?: string;
  description: string;
  completion_date?: string;
  status?: "ongoing" | "completed";
  assigned_member_id?: number;
};

export interface TaskFormProps {
  onClose: () => void;
  selectedTask: Task | null;
}

export const TaskForm = (props: TaskFormProps) => {
  const { onClose, selectedTask } = props;

  const [form] = Form.useForm();

  const onCreate = useUnit(taskCreated);
  const onEdit = useUnit(taskEdited);

  const assigneeOptions = useUnit($assigneeOptions);

  if (selectedTask) {
    form.setFieldsValue({
      ...selectedTask,
      assigned_member_id: selectedTask?.assigned_member?.id
        ? selectedTask.assigned_member.id
        : null,
      completion_date: selectedTask?.completion_date
        ? dayjs(selectedTask.completion_date)
        : null,
    });
  }

  return (
    <Form
      form={form}
      name="basic"
      layout="vertical"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      style={{ maxWidth: 600 }}
      onFinish={selectedTask ? onEdit : onCreate}
      autoComplete="off"
    >
      <Form.Item<FieldType>
        label="სათაური"
        name="title"
        rules={[{ required: true, message: "გთხოვთ შეიყვანოთ სათაური" }]}
      >
        <Input />
      </Form.Item>
      <Form.Item<FieldType>
        label="პასუხისმგებელი პირი"
        name="assigned_member_id"
      >
        <Select options={assigneeOptions} />
      </Form.Item>

      <Form.Item<FieldType>
        label="აღწერა"
        name="description"
        rules={[{ required: true, message: "გთხოვთ შეიყვანოთ გვარი" }]}
      >
        <TextArea />
      </Form.Item>

      <Form.Item<FieldType>
        label="სტატუსი"
        name="status"
        rules={[{ required: true, message: "გთხოვთ მიუთითოთ სტატუსი" }]}
      >
        <Radio.Group>
          <Radio value="ongoing"> ongoing </Radio>
          <Radio value="completed"> completed </Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item<FieldType>
        label="შესრულების თარიღი"
        name="completion_date"
        rules={[
          { required: true, message: "გთხოვთ შეიყვანოთ შესრულების თარიღი" },
        ]}
      >
        <DatePicker />
      </Form.Item>

      <div className="flex items-center justify-end gap-2">
        <Button type="default" onClick={onClose}>
          გაუქმება
        </Button>

        <Button type="primary" htmlType="submit">
          {selectedTask ? "რედაქტირება" : "დამატება"}
        </Button>
      </div>
    </Form>
  );
};
