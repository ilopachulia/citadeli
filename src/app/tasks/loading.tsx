import { Spin } from "antd";

export default function Loading() {
  return (
    <div className="min-w-screen min-h-screen flex justify-center items-center">
      <Spin wrapperClassName="w-screen min-h-screen flex justify-center items-center" />
    </div>
  );
}
