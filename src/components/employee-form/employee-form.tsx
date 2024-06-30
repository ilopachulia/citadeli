"use client";
import { Button, DatePicker, Form, Input, Radio } from "antd";
import React, { useEffect } from "react";
import { useUnit } from "effector-react";
import {
  $selectedEmployee,
  employeeCreated,
  employeeEdited,
} from "@/store/employees";
import { Employee } from "@/store/employees/types";
import dayjs from "dayjs";

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
  const [form] = Form.useForm();

  const selectedEmployee = useUnit($selectedEmployee);

  const onCreate = useUnit(employeeCreated);
  const onEdit = useUnit(employeeEdited);

  useEffect(() => {
    if (selectedEmployee) {
      form.setFieldsValue({
        ...selectedEmployee,
        birthday: selectedEmployee.birthday
          ? dayjs(selectedEmployee.birthday)
          : null,
      });
    }
  }, [form, selectedEmployee]);
  
  return (
    <Form
      form={form}
      name="basic"
      layout="vertical"
      labelCol={{ span: 8 }}
      wrapperCol={{ span: 16 }}
      style={{ maxWidth: 600 }}
      onFinish={selectedEmployee ? onEdit : onCreate}
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
          {selectedEmployee ? "რედაქტირება" : "დამატება"}
        </Button>
      </div>
    </Form>
  );
};
