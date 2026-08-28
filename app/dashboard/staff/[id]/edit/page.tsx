"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import type { FormEvent } from "react";
import { useCallback, useEffect, useState } from "react";
import { ArrowLeft, Loader2, Save, Users } from "lucide-react";
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

type Department = {
  _id: string;
  name: string;
};

type StaffMember = {
  _id: string;
  name: string;
  email?: string;
  phone?: string;
  position?: string;
  status?: "active" | "inactive";
  departmentId?: { _id: string; name: string } | string | null;
};

type ProfileData = {
  departments: Department[];
  error?: string;
  notFound?: boolean;
  staff?: StaffMember;
};

const getDepartmentId = (member: StaffMember) => {
  if (typeof member.departmentId === "object" && member.departmentId) {
    return member.departmentId._id;
  }

  return member.departmentId || "";
};

export default function EditStaffPage() {
  const params = useParams<{ id: string }>();
  const staffId = params.id;

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [position, setPosition] = useState("");
  const [status, setStatus] = useState<"active" | "inactive">("active");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [notFound, setNotFound] = useState(false);

  const fetchProfile = useCallback(async (): Promise<ProfileData> => {
    const [staffRes, departmentsRes] = await Promise.all([
      fetch(`/api/staff/${staffId}`),
      fetch("/api/departments"),
    ]);

    const staffData = await staffRes.json().catch(() => ({}));
    const departmentsData = await departmentsRes.json().catch(() => ({}));
    const nextDepartments = departmentsRes.ok
      ? ((departmentsData.departments || []) as Department[])
      : [];

    if (staffRes.status === 404) {
      return { departments: nextDepartments, notFound: true };
    }

    if (!staffRes.ok) {
      return {
        departments: nextDepartments,
        error: staffData.error || "Failed to load staff profile.",
      };
    }

    return {
      departments: nextDepartments,
      staff: staffData.staff as StaffMember,
    };
  }, [staffId]);

  useEffect(() => {
    let isCurrent = true;

    fetchProfile()
      .then((data) => {
        if (!isCurrent) return;

        setDepartments(data.departments);
        setNotFound(Boolean(data.notFound));
        setError(data.error || "");

        if (data.staff) {
          setName(data.staff.name || "");
          setEmail(data.staff.email || "");
          setPhone(data.staff.phone || "");
          setDepartmentId(getDepartmentId(data.staff));
          setPosition(data.staff.position || "");
          setStatus(data.staff.status === "inactive" ? "inactive" : "active");
        }
      })
      .catch((err) => {
        console.error(err);
        if (isCurrent) setError("Failed to load staff profile.");
      })
      .finally(() => {
        if (isCurrent) setLoading(false);
      });

    return () => {
      isCurrent = false;
    };
  }, [fetchProfile]);

  async function saveStaff(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const res = await fetch(`/api/staff/${staffId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone,
          departmentId,
          position,
          status,
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        const message = data.error || "Failed to update staff profile.";
        setError(message);
        toast.error(message);
        return;
      }

      const member = data.staff as StaffMember;
      setName(member.name || "");
      setEmail(member.email || "");
      setPhone(member.phone || "");
      setDepartmentId(getDepartmentId(member));
      setPosition(member.position || "");
      setStatus(member.status === "inactive" ? "inactive" : "active");
      const message = "Staff profile updated successfully.";
      setSuccess(message);
      toast.success(message);
    } catch (err) {
      console.error(err);
      const message = "Failed to update staff profile.";
      setError(message);
      toast.error(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="Edit Staff"
        description="Update host details used for visitor routing and notifications."
        actions={
          <Button asChild variant="outline">
            <Link href="/dashboard/staff">
              <ArrowLeft className="size-4" />
              Back to Staff
            </Link>
          </Button>
        }
      />

      <DashboardPanel
        title="Staff Profile"
        description="Keep contact details and department assignment current."
        className="max-w-4xl"
      >
        {loading ? (
          <LoadingState label="Loading staff profile" />
        ) : notFound ? (
          <EmptyState
            title="Staff member not found"
            description="This profile may have been deleted or is no longer available."
            icon={Users}
            action={
              <Button asChild>
                <Link href="/dashboard/staff">Return to Staff</Link>
              </Button>
            }
          />
        ) : (
          <form onSubmit={saveStaff} className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <FormField label="Full Name" htmlFor="staff-name">
                <input
                  id="staff-name"
                  className={fieldControlClassName}
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  required
                />
              </FormField>

              <FormField label="Email" htmlFor="staff-email">
                <input
                  id="staff-email"
                  type="email"
                  className={fieldControlClassName}
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  required
                />
              </FormField>

              <FormField label="Phone" htmlFor="staff-phone">
                <input
                  id="staff-phone"
                  type="tel"
                  className={fieldControlClassName}
                  value={phone}
                  onChange={(event) => setPhone(event.target.value)}
                />
              </FormField>

              {departments.length > 0 && (
                <FormField label="Department" htmlFor="staff-department">
                  <SelectField
                    id="staff-department"
                    value={departmentId}
                    onChange={(event) => setDepartmentId(event.target.value)}
                  >
                    <option value="">No department</option>
                    {departments.map((dept) => (
                      <option key={dept._id} value={dept._id}>
                        {dept.name}
                      </option>
                    ))}
                  </SelectField>
                </FormField>
              )}

              <FormField label="Position" htmlFor="staff-position">
                <input
                  id="staff-position"
                  className={fieldControlClassName}
                  value={position}
                  onChange={(event) => setPosition(event.target.value)}
                />
              </FormField>

              <FormField label="Status" htmlFor="staff-status">
                <SelectField
                  id="staff-status"
                  value={status}
                  onChange={(event) =>
                    setStatus(event.target.value as "active" | "inactive")
                  }
                >
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </SelectField>
              </FormField>
            </div>

            {error ? <p className="text-sm text-destructive">{error}</p> : null}
            {success ? <p className="text-sm text-green-600">{success}</p> : null}

            <div className="flex flex-col-reverse gap-3 border-t border-border pt-5 sm:flex-row sm:justify-end">
              <Button asChild variant="outline">
                <Link href="/dashboard/staff">Cancel</Link>
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
