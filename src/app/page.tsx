"use client";
import Link from "next/link";

export default function Home() {
  return (
    <main className="w-screen h-screen">
      <Link href="employees">Employees</Link>
      <Link href="tasks">Tasks</Link>
    </main>
  );
}
