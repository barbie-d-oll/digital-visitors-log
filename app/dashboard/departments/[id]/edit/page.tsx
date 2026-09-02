"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Layers, Loader2, Save } from "lucide-react";
import { toast } from "sonner";

import {
  DashboardPanel,
  EmptyState,
  FormField,
  LoadingState,
  PageHeader,
  SelectField,
  fieldControlClassName,
} from "../../../../_components/dashboard/DashboardPrimitives";
import { Button } from "@/components/ui/button";

type StaffMember = {
  _id: string;
  name: string;
};

type DepartmentHead = {
  _id: string;
  name: string;
  email?: string;
};

type Department = {
  _id: string;
  name: string;
  description?: string;
  status?: "active" | "inactive";
  headId?: DepartmentHead | string | null;
  headIds?: Array<DepartmentHead | string> | null;
};

type ProfileData = {
  department?: Department;
  error?: string;
  notFound?: boolean;
  staff: StaffMember[];
};

const MAX_DEPARTMENT_HEADS = 2;

const getHeadIds = (department: Department) => {
  const headIds = Array.isArray(department.headIds)
    ? department.headIds
        .map((head) => (typeof head === "object" && head ? head._id : head))
        .filter(Boolean)
    : [];

  if (headIds.length > 0) {
    return Array.from(new Set(headIds)).slice(0, MAX_DEPARTMENT_HEADS);
  }

  if (typeof department.headId === "object" && department.headId) {
    return [department.headId._id];
  }

  return department.headId ? [department.headId] : [];
};

export default function EditDepartmentPage() {
  const params = useParams<{ id: string }>();
  const departmentId = params.id;

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [headIds, setHeadIds] = useState<string[]>([]);
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [staffList, setStaffList] = useState<StaffMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [notFound, setNotFound] = useState(false);

  const fetchProfile = useCallback(async (): Promise<ProfileData> => {
    const [departmentRes, staffRes] = await Promise.all([
      fetch(`/api/departments/${departmentId}`),
      fetch("/api/staff"),
    ]);

    const departmentData = await departmentRes.json().catch(() => ({}));
    const staffData = await staffRes.json().catch(() => ({}));
    const nextStaff = staffRes.ok
      ? ((staffData.staff || []) as StaffMember[])
      : [];

    if (departmentRes.status === 404) {
      return { staff: nextStaff, notFound: true };
    }

    if (!departmentRes.ok) {
      return {
        staff: nextStaff,
        error: departmentData.error || "Failed to load department profile.",
      };
    }

    return {
      staff: nextStaff,
      department: departmentData.department as Department,
    };
  }, [departmentId]);

  useEffect(() => {
    let isCurrent = true;

    fetchProfile()
      .then((data) => {
        if (!isCurrent) return;

        setStaffList(data.staff);
        setNotFound(Boolean(data.notFound));
        setError(data.error || "");

        if (data.department) {
          setName(data.department.name || "");
          setDescription(data.department.description || "");
          setHeadIds(getHeadIds(data.department));
          setStatus(data.department.status === "inactive" ? "inactive" : "active");
        }
      })
      .catch((err) => {
        console.error(err);
        if (isCurrent) setError("Failed to load department profile.");
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [fetchProfile]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/departments/${departmentId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          description,
          headIds,
          status,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message = data.error || "Failed to update department profile.";
        setError(message);
        toast.error(message);
        return;
      }

      const department = data.department as Department;
      setName(department.name || "");
      setDescription(department.description || "");
      setHeadIds(getHeadIds(department));
      setStatus(department.status === "inactive" ? "inactive" : "active");
      const message =
        data.message || "Department profile updated successfully.";
      setSuccess(message);
      toast.success(message);
    } catch (err) {
      console.error(err);
      const message = "Failed to update department profile.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  };

  const toggleDepartmentHead = (staffId: string) => {
    setHeadIds((current) => {
      if (current.includes(staffId)) {
        return current.filter((id) => id !== staffId);
      }

      if (current.length >= MAX_DEPARTMENT_HEADS) {
        return current;
      }

      return [...current, staffId];
    });
  };

  return (
    <div className="space-y-8">
      <PageHeader
        title="Edit Department"
        description="Update the department details used for visitor routing."
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/departments">
              <ArrowLeft className="size-4" />
              Back to Departments
            </Link>
          </Button>
        }
      />

      <DashboardPanel title="Department Profile" className="max-w-2xl">
        {loading ? (
          <LoadingState label="Loading department profile" />
        ) : notFound ? (
          <EmptyState
            title="Department not found"
            description="This department may have been deleted or is no longer available."
            icon={Layers}
            action={
              <Button asChild>
                <Link href="/dashboard/departments">Return to Departments</Link>
              </Button>
            }
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-5">
            <FormField label="Department Name *" htmlFor="dept-name">
              <input
                id="dept-name"
                className={fieldControlClassName}
                value={name}
                onChange={(event) => setName(event.target.value)}
                required
              />
            </FormField>

            <FormField label="Description" htmlFor="dept-desc">
              <input
                id="dept-desc"
                className={fieldControlClassName}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
              />
            </FormField>

            {staffList.length > 0 && (
              <FormField
                label="Department Heads"
                helper="Select up to 2 people."
              >
                <div className="grid gap-2">
                  {staffList.map((member) => {
                    const checked = headIds.includes(member._id);
                    const disabled =
                      !checked && headIds.length >= MAX_DEPARTMENT_HEADS;

                    return (
                      <label
                        key={member._id}
                        className={`flex min-h-11 items-center gap-3 rounded-lg border border-input bg-background px-3 text-sm transition ${
                          disabled
                            ? "cursor-not-allowed opacity-50"
                            : "cursor-pointer hover:border-ring"
                        }`}
                      >
                        <input
                          type="checkbox"
                          className="size-4 rounded border-input accent-primary"
                          checked={checked}
                          disabled={disabled}
                          onChange={() => toggleDepartmentHead(member._id)}
                        />
                        <span className="font-medium text-foreground">
                          {member.name}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </FormField>
            )}

            <FormField label="Status" htmlFor="dept-status">
              <SelectField
                id="dept-status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as "active" | "inactive")
                }
              >
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </SelectField>
            </FormField>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {success ? <p className="text-sm text-green-600">{success}</p> : null}

            <div className="flex justify-end gap-3 border-t border-border pt-5">
              <Button asChild variant="outline">
                <Link href="/dashboard/departments">Cancel</Link>
              </Button>
              <Button type="submit" disabled={saving}>
                {saving ? (
                  <Loader2 className="size-4 animate-spin" />
                ) : (
                  <Save className="size-4" />
                )}
                {saving ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        )}
      </DashboardPanel>
    </div>
  );
}
