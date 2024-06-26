"use client";
import { Button, DatePicker, Form, FormProps, Input, Radio } from "antd";
import React from "react";
import { useUnit } from "effector-react";
import { employeeCreated } from "@/app/store/employees";

type FieldType = {
  firstname?: string;
  lastname?: string;
  gender?: "male" | "female";
  birthday?: string;
  salary?: number;
};

export interface EmployeeFormProps {
  onClose: () => void;
}

export const EmployeeForm = (props: EmployeeFormProps) => {
  const { onClose } = props;

  const onCreate = useUnit(employeeCreated);

  return (
    <Form
      name="basic"
      layout="vertical"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      style={{ maxWidth: 600 }}
      onFinish={onCreate}
      autoComplete="off"
    >
      <Form.Item<FieldType>
        label="სახელი"
        name="firstname"
        rules={[{ required: true, message: "გთხოვთ შეიყვანოთ სახელი" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item<FieldType>
        label="გვარი"
        name="lastname"
        rules={[{ required: true, message: "გთხოვთ შეიყვანოთ გვარი" }]}
      >
        <Input />
      </Form.Item>

      <Form.Item<FieldType>
        label="სქესი"
        name="gender"
        rules={[{ required: true, message: "გთხოვთ მიუთითოთ სქესი" }]}
      >
        <Radio.Group>
          <Radio value="male"> მამრობითი </Radio>
          <Radio value="female"> მდედრობითი </Radio>
        </Radio.Group>
      </Form.Item>

      <Form.Item<FieldType>
        label="დაბადების თარიღი"
        name="birthday"
        rules={[
          { required: true, message: "გთხოვთ შეიყვანოთ დაბადების თარიღი" },
        ]}
      >
        <DatePicker />
      </Form.Item>

      <Form.Item<FieldType> label="ხელფასი" name="salary">
        <Input type="number" />
      </Form.Item>

      <div className="flex items-center justify-end gap-2">
        <Button type="default" onClick={onClose}>
          გაუქმება
        </Button>

        <Button type="primary" htmlType="submit">
          დამატება
        </Button>
      </div>
    </Form>
  );
};
