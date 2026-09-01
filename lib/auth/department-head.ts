import mongoose from "mongoose";

import type { JwtPayload } from "@/lib/auth/jwt";
import Department from "@/lib/models/department.model";
import Staff from "@/lib/models/staff.model";

export type DepartmentHeadContext = {
  staff: {
    id: string;
    objectId: mongoose.Types.ObjectId;
    name: string;
    email: string;
    phone?: string;
  };
  departments: Array<{
    id: string;
    objectId: mongoose.Types.ObjectId;
    name: string;
  }>;
  departmentIds: mongoose.Types.ObjectId[];
  departmentIdStrings: string[];
};

export async function getDepartmentHeadContext(
  authUser: JwtPayload,
): Promise<DepartmentHeadContext | null> {
  const staff = await Staff.findOne({
    email: authUser.email.toLowerCase(),
    organizationId: authUser.organizationId,
    status: "active",
  }).select("_id name email phone");

  if (!staff) {
    return null;
  }

  const staffObjectId = staff._id as mongoose.Types.ObjectId;
  const departments = await Department.find({
    organizationId: authUser.organizationId,
    status: "active",
    $or: [{ headIds: staffObjectId }, { headId: staffObjectId }],
  })
    .select("_id name")
    .sort({ name: 1 });

  if (departments.length === 0) {
    return null;
  }

  const normalizedDepartments = departments.map((department) => {
    const objectId = department._id as mongoose.Types.ObjectId;

    return {
      id: objectId.toString(),
      objectId,
      name: department.name,
    };
  });

  return {
    staff: {
      id: staffObjectId.toString(),
      objectId: staffObjectId,
      name: staff.name,
      email: staff.email,
      phone: staff.phone,
    },
    departments: normalizedDepartments,
    departmentIds: normalizedDepartments.map((department) => department.objectId),
    departmentIdStrings: normalizedDepartments.map((department) => department.id),
  };
}

export async function getIsDepartmentHead(authUser: JwtPayload) {
  return Boolean(await getDepartmentHeadContext(authUser));
}
