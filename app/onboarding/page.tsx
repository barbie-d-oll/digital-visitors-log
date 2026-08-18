"use client";

import { FormEvent, useEffect, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  Check,
  Layers,
  Phone,
  MapPin,
  UserPlus,
  Rocket,
} from "lucide-react";
import { useRouter } from "next/navigation";

import { useAuth } from "@/context/AuthContext";
import { ModeToggle } from "@/components/common/Toggle";

type Step = "organization" | "departments" | "staff" | "complete";

const steps: { id: Step; label: string; icon: React.ElementType }[] = [
  { id: "organization", label: "Organization", icon: Building2 },
  { id: "departments", label: "Departments", icon: Layers },
  { id: "staff", label: "First Staff", icon: UserPlus },
  { id: "complete", label: "Ready!", icon: Rocket },
];

export default function OnboardingPage() {
  const { user, loading, refresh } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState<Step>("organization");

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/auth/login");
    }
  }, [loading, user, router]);

  if (loading || !user) {
    return (
      <div className="flex min-h-svh items-center justify-center bg-background">
        <span className="size-5 animate-spin rounded-full border-2 border-muted-foreground/30 border-t-muted-foreground" />
      </div>
    );
  }

  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  const goNext = () => {
    const next = steps[currentIndex + 1];
    if (next) setCurrentStep(next.id);
  };

  const goBack = () => {
    const prev = steps[currentIndex - 1];
    if (prev) setCurrentStep(prev.id);
  };

  return (
    <main className="flex min-h-svh bg-background">
      {/* Sidebar stepper */}
      <aside className="hidden w-72 shrink-0 border-r border-border bg-card/50 p-8 lg:flex lg:flex-col">
        <div className="mb-10">
          <p className="text-[.68rem] font-bold tracking-[.12em] text-brand uppercase">
            Setup
          </p>
          <h2 className="mt-1 text-lg font-bold text-foreground">
            Get started
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Complete these steps to configure your visitor desk.
          </p>
        </div>

        <nav className="flex-1 space-y-2">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isActive = step.id === currentStep;
            const isCompleted = index < currentIndex;

            return (
              <div
                key={step.id}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 transition ${
                  isActive
                    ? "bg-primary/10 text-primary"
                    : isCompleted
                      ? "text-muted-foreground"
                      : "text-muted-foreground/50"
                }`}
              >
                <span
                  className={`grid size-8 place-items-center rounded-lg ${
                    isCompleted
                      ? "bg-primary text-primary-foreground"
                      : isActive
                        ? "bg-primary/20 text-primary"
                        : "bg-muted text-muted-foreground"
                  }`}
                >
                  {isCompleted ? <Check size={14} /> : <Icon size={14} />}
                </span>
                <span className="text-sm font-medium">{step.label}</span>
              </div>
            );
          })}
        </nav>

        <div className="mt-auto pt-6">
          <ModeToggle />
        </div>
      </aside>

      {/* Main content */}
      <div className="flex flex-1 flex-col items-center justify-center px-6 py-10">
        {/* Mobile step indicator */}
        <div className="mb-8 flex items-center gap-2 lg:hidden">
          {steps.map((step, index) => (
            <div
              key={step.id}
              className={`h-2 rounded-full transition-all ${
                index <= currentIndex
                  ? "w-8 bg-primary"
                  : "w-2 bg-muted"
              }`}
            />
          ))}
        </div>

        <div className="w-full max-w-lg">
          {currentStep === "organization" && (
            <OrganizationStep
              user={user}
              onNext={goNext}
              onRefresh={refresh}
            />
          )}
          {currentStep === "departments" && (
            <DepartmentsStep onNext={goNext} onBack={goBack} />
          )}
          {currentStep === "staff" && (
            <StaffStep onNext={goNext} onBack={goBack} />
          )}
          {currentStep === "complete" && <CompleteStep />}
        </div>
      </div>
    </main>
  );
}

// ─── Step 1: Organization Details ─────────────────────────────

function OrganizationStep({
  user,
  onNext,
  onRefresh,
}: {
  user: { organizationName: string };
  onNext: () => void;
  onRefresh: () => Promise<void>;
}) {
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/organization", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, address }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to update organization.");
        return;
      }

      await onRefresh();
      onNext();
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="mb-2 grid size-12 place-items-center rounded-xl bg-accent text-accent-foreground">
          <Building2 size={22} />
        </div>
        <h1 className="mt-3 text-2xl font-bold text-foreground">
          Set up {user.organizationName}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Add your organization&rsquo;s contact details. You can update these later in settings.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-xs font-bold text-foreground/80" htmlFor="org-phone">
            Organization phone
          </label>
          <div className="flex min-h-12 items-center gap-2.5 rounded-xl border border-input bg-background px-4 transition focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/20">
            <Phone size={18} className="text-muted-foreground" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              id="org-phone"
              type="tel"
              placeholder="+233 24 123 4567"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold text-foreground/80" htmlFor="org-address">
            Office address
          </label>
          <div className="flex min-h-12 items-center gap-2.5 rounded-xl border border-input bg-background px-4 transition focus-within:border-ring focus-within:ring-4 focus-within:ring-ring/20">
            <MapPin size={18} className="text-muted-foreground" />
            <input
              className="min-w-0 flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted-foreground"
              id="org-address"
              type="text"
              placeholder="123 Main Street, Accra"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>
        </div>

        {error && (
          <p className="text-xs text-destructive">{error}</p>
        )}

        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={onNext}
            className="text-sm text-muted-foreground hover:text-foreground"
          >
            Skip for now
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:not-disabled:-translate-y-0.5 hover:not-disabled:bg-primary/90 disabled:opacity-70"
          >
            {saving ? "Saving..." : "Continue"}
            <ArrowRight size={16} />
          </button>
        </div>
      </form>
    </div>
  );
}

// ─── Step 2: Create Departments ───────────────────────────────

function DepartmentsStep({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const [departments, setDepartments] = useState<string[]>([]);
  const [input, setInput] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const addDepartment = () => {
    const name = input.trim();
    if (!name) return;
    if (departments.includes(name)) {
      setError("Department already added.");
      return;
    }
    setDepartments((prev) => [...prev, name]);
    setInput("");
    setError("");
  };

  const removeDepartment = (name: string) => {
    setDepartments((prev) => prev.filter((d) => d !== name));
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (departments.length === 0) {
      onNext();
      return;
    }

    setSaving(true);
    setError("");

    try {
      for (const name of departments) {
        await fetch("/api/departments", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ name }),
        });
      }
      onNext();
    } catch {
      setError("Failed to create some departments.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="mb-2 grid size-12 place-items-center rounded-xl bg-accent text-accent-foreground">
          <Layers size={22} />
        </div>
        <h1 className="mt-3 text-2xl font-bold text-foreground">
          Create departments
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Departments help organize your staff. Visitors will be routed to the right team.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex gap-2">
          <input
            className="min-h-12 flex-1 rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-4 focus:ring-ring/20"
            placeholder="e.g. Engineering, HR, Sales"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addDepartment();
              }
            }}
          />
          <button
            type="button"
            onClick={addDepartment}
            className="min-h-12 rounded-xl border border-border bg-card px-4 text-sm font-semibold text-foreground transition hover:bg-accent"
          >
            Add
          </button>
        </div>

        {departments.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {departments.map((dept) => (
              <span
                key={dept}
                className="flex items-center gap-2 rounded-lg border border-border bg-secondary px-3 py-1.5 text-sm font-medium text-secondary-foreground"
              >
                {dept}
                <button
                  type="button"
                  onClick={() => removeDepartment(dept)}
                  className="text-muted-foreground hover:text-destructive"
                  aria-label={`Remove ${dept}`}
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}

        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNext}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:not-disabled:-translate-y-0.5 hover:not-disabled:bg-primary/90 disabled:opacity-70"
            >
              {saving ? "Creating..." : `Continue${departments.length > 0 ? ` (${departments.length})` : ""}`}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ─── Step 3: Add First Staff Member ──────────────────────────

function StaffStep({
  onNext,
  onBack,
}: {
  onNext: () => void;
  onBack: () => void;
}) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [departments, setDepartments] = useState<{ _id: string; name: string }[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    fetch("/api/departments")
      .then((res) => res.json())
      .then((data) => {
        if (data.departments) setDepartments(data.departments);
      })
      .catch(console.error);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      onNext();
      return;
    }

    setSaving(true);
    setError("");

    try {
      const body: Record<string, string> = { name, email };
      if (phone) body.phone = phone;
      if (departmentId) body.departmentId = departmentId;

      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Failed to add staff.");
        return;
      }

      onNext();
    } catch {
      setError("Something went wrong.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <div className="mb-6">
        <div className="mb-2 grid size-12 place-items-center rounded-xl bg-accent text-accent-foreground">
          <UserPlus size={22} />
        </div>
        <h1 className="mt-3 text-2xl font-bold text-foreground">
          Add your first staff member
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Staff are the hosts that visitors come to see. You can add more later.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-2 block text-xs font-bold text-foreground/80" htmlFor="staff-name">
            Full name
          </label>
          <input
            className="min-h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-4 focus:ring-ring/20"
            id="staff-name"
            placeholder="Jane Smith"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold text-foreground/80" htmlFor="staff-email">
            Email
          </label>
          <input
            className="min-h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-4 focus:ring-ring/20"
            id="staff-email"
            type="email"
            placeholder="jane@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-bold text-foreground/80" htmlFor="staff-phone">
            Phone (optional)
          </label>
          <input
            className="min-h-12 w-full rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none transition placeholder:text-muted-foreground focus:border-ring focus:ring-4 focus:ring-ring/20"
            id="staff-phone"
            type="tel"
            placeholder="+233..."
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />
        </div>

        {departments.length > 0 && (
          <div>
            <label className="mb-2 block text-xs font-bold text-foreground/80" htmlFor="staff-dept">
              Department
            </label>
            <select
              className="min-h-12 w-full appearance-none rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none"
              id="staff-dept"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
            >
              <option value="">Select department</option>
              {departments.map((dept) => (
                <option key={dept._id} value={dept._id}>
                  {dept.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {error && <p className="text-xs text-destructive">{error}</p>}

        <div className="flex items-center justify-between pt-4">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft size={14} />
            Back
          </button>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={onNext}
              className="text-sm text-muted-foreground hover:text-foreground"
            >
              Skip
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex min-h-11 items-center gap-2 rounded-xl bg-primary px-5 text-sm font-bold text-primary-foreground transition hover:not-disabled:-translate-y-0.5 hover:not-disabled:bg-primary/90 disabled:opacity-70"
            >
              {saving ? "Adding..." : "Continue"}
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// ─── Step 4: Complete ─────────────────────────────────────────

function CompleteStep() {
  const router = useRouter();
  const { user } = useAuth();

  return (
    <div className="text-center">
      <div className="mx-auto mb-4 grid size-16 place-items-center rounded-full bg-primary/10 text-primary">
        <Rocket size={28} />
      </div>
      <h1 className="text-2xl font-bold text-foreground">
        You&rsquo;re all set!
      </h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Your visitor desk is ready. Share your registration link with guests or display the QR code at your front desk.
      </p>

      <div className="mt-6 rounded-xl border border-border bg-secondary p-4">
        <p className="text-xs font-bold tracking-wide text-muted-foreground uppercase">
          Your visitor registration link
        </p>
        <p className="mt-2 break-all font-mono text-sm text-foreground">
          {typeof window !== "undefined" ? window.location.origin : ""}/register?org={user?.organizationSlug || "your-org"}
        </p>
      </div>

      <button
        type="button"
        onClick={() => router.replace("/dashboard")}
        className="mt-8 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-primary text-sm font-bold text-primary-foreground transition hover:-translate-y-0.5 hover:bg-primary/90"
      >
        Go to Dashboard
        <ArrowRight size={16} />
      </button>
    </div>
  );
}
