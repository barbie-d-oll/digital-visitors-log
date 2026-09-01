import { redirect } from "next/navigation";

import { connectToDB } from "@/lib/db/mongoose";
import { getDepartmentHeadContext } from "@/lib/auth/department-head";
import { getAuthUser } from "@/lib/auth/jwt";

import DepartmentAssignmentsClient from "./department-assignments-client";

export default async function DepartmentAssignmentsPage() {
  const authUser = await getAuthUser();

  if (!authUser) {
    redirect("/auth/login?redirect=/dashboard/department-assignments");
  }

  await connectToDB();
  const headContext = await getDepartmentHeadContext(authUser);

  if (!headContext) {
    redirect("/dashboard");
  }

  return <DepartmentAssignmentsClient />;
}
