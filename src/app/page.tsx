"use client";
import Link from "next/link";

export default function Home() {
  return (
    <main className="w-screen h-screen flex flex-col justify-center items-center space-y-4">
    <Link href="employees" className="text-blue-500 hover:underline text-xl">Employees</Link>
    <Link href="tasks" className="text-blue-500 hover:underline text-xl">Tasks</Link>
  </main>
  );
}
