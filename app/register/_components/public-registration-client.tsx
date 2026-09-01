"use client";

import type { FormEvent } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import { VisitorHeader } from "@/components/home/visitor-header";
import { Card, CardContent } from "@/components/ui/card";

import { NdaAgreementPanel } from "./nda-agreement-panel";
import { PreRegistrationPanel } from "./pre-registration-panel";
import { RegistrationHero } from "./registration-hero";
import { RegistrationSuccess } from "./registration-success";
import {
  defaultReturnHomeSeconds,
  emptyForm,
  failedSmsReturnHomeSeconds,
  minimumStaffSearchLength,
} from "./types";
import type {
  DepartmentOption,
  SmsStatus,
  StaffSuggestion,
  VisitTargetType,
  VisitorForm,
} from "./types";
import { VisitorDetailsForm } from "./visitor-details-form";

type DepartmentDirectory = {
  departments: DepartmentOption[];
  slug: string;
};

type StaffSearchState = {
  staff: StaffSuggestion[];
  term: string;
};

export function PublicRegistrationClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const organizationSlug = searchParams.get("org") || "default";

  const [form, setForm] = useState<VisitorForm>(emptyForm);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [visitorCode, setVisitorCode] = useState("");
  const [smsStatus, setSmsStatus] = useState<SmsStatus>("idle");
  const [secondsUntilHome, setSecondsUntilHome] = useState(
    defaultReturnHomeSeconds
  );

  const [preRegCode, setPreRegCode] = useState("");
  const [showPreReg, setShowPreReg] = useState(false);
  const [preRegLoading, setPreRegLoading] = useState(false);
  const [returningChecked, setReturningChecked] = useState(false);

  const [showNda, setShowNda] = useState(false);
  const [ndaText, setNdaText] = useState("");
  const [ndaSignature, setNdaSignature] = useState("");
  const [visitorId, setVisitorId] = useState("");

  const [visitTargetType, setVisitTargetType] =
    useState<VisitTargetType>("individual");
  const [departmentDirectory, setDepartmentDirectory] =
    useState<DepartmentDirectory | null>(
      organizationSlug === "default"
        ? { departments: [], slug: "default" }
        : null
    );
  const [staffSearch, setStaffSearch] = useState<StaffSearchState>({
    staff: [],
    term: "",
  });
  const [showStaffSuggestions, setShowStaffSuggestions] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState("");
  const [selectedStaffName, setSelectedStaffName] = useState("");

  const departmentList =
    departmentDirectory?.slug === organizationSlug
      ? departmentDirectory.departments
      : [];
  const directoryLoaded =
    organizationSlug === "default" ||
    departmentDirectory?.slug === organizationSlug;

  useEffect(() => {
    if (organizationSlug === "default") {
      return;
    }

    const controller = new AbortController();

    fetch(
      `/api/organization/public/staff?slug=${encodeURIComponent(
        organizationSlug
      )}`,
      { signal: controller.signal }
    )
      .then((res) => res.json())
      .then((data) => {
        setDepartmentDirectory({
          departments: data.departments || [],
          slug: organizationSlug,
        });
      })
      .catch((error: unknown) => {
        if ((error as { name?: string }).name !== "AbortError") {
          setDepartmentDirectory({ departments: [], slug: organizationSlug });
        }
      });

    return () => controller.abort();
  }, [organizationSlug]);

  useEffect(() => {
    const searchTerm = form.staff.trim();

    if (
      organizationSlug === "default" ||
      visitTargetType !== "individual" ||
      searchTerm.length < minimumStaffSearchLength ||
      (selectedStaffId && selectedStaffName === searchTerm)
    ) {
      return;
    }

    const controller = new AbortController();

    fetch(
      `/api/organization/public/staff?slug=${encodeURIComponent(
        organizationSlug
      )}&search=${encodeURIComponent(searchTerm)}`,
      { signal: controller.signal }
    )
      .then((res) => res.json())
      .then((data) => {
        setStaffSearch({
          staff: data.staff || [],
          term: searchTerm,
        });
      })
      .catch((error: unknown) => {
        if ((error as { name?: string }).name !== "AbortError") {
          setStaffSearch({ staff: [], term: searchTerm });
        }
      });

    return () => controller.abort();
  }, [
    form.staff,
    organizationSlug,
    selectedStaffId,
    selectedStaffName,
    visitTargetType,
  ]);

  useEffect(() => {
    if (!isComplete) return;
    if (secondsUntilHome <= 0) {
      router.push(`/kiosk/${organizationSlug}`);
      return;
    }

    const timerId = window.setTimeout(() => {
      setSecondsUntilHome((current) => current - 1);
    }, 1000);

    return () => window.clearTimeout(timerId);
  }, [isComplete, organizationSlug, router, secondsUntilHome]);

  const updateField = (field: keyof VisitorForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const resetVisitTarget = () => {
    setVisitTargetType("individual");
    setStaffSearch({ staff: [], term: "" });
    setSelectedStaffId("");
    setSelectedStaffName("");
    setShowStaffSuggestions(false);
  };

  const changeVisitTargetType = (targetType: VisitTargetType) => {
    setVisitTargetType(targetType);
    setForm((current) => ({ ...current, staff: "" }));
    setStaffSearch({ staff: [], term: "" });
    setSelectedStaffId("");
    setSelectedStaffName("");
    setShowStaffSuggestions(false);
  };

  const updateStaffSearch = (value: string) => {
    const searchTerm = value.trim();

    setSelectedStaffId("");
    setSelectedStaffName("");
    updateField("staff", value);
    setShowStaffSuggestions(searchTerm.length >= minimumStaffSearchLength);

    if (searchTerm.length < minimumStaffSearchLength) {
      setStaffSearch({ staff: [], term: "" });
    }
  };

  const selectStaffSuggestion = (staff: StaffSuggestion) => {
    updateField("staff", staff.name);
    setSelectedStaffId(staff.id);
    setSelectedStaffName(staff.name);
    setStaffSearch({ staff: [], term: staff.name });
    setShowStaffSuggestions(false);
  };

  const checkReturningVisitor = async (phone: string) => {
    if (returningChecked || phone.length < 9) return;

    try {
      const res = await fetch("/api/visitors/returning", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone, organizationSlug }),
      });
      const data = await res.json();

      if (data.found && data.visitor) {
        setReturningChecked(true);
        setForm((current) => ({
          ...current,
          name: current.name || data.visitor.name || "",
          email: current.email || data.visitor.email || "",
          company: current.company || data.visitor.company || "",
          purpose: current.purpose || data.visitor.purpose || "",
          staff: current.staff || data.visitor.staff || "",
        }));
      }
    } catch {
      // Returning visitor lookup is a convenience only.
    }
  };

  const handlePreRegCheckin = async () => {
    if (!preRegCode.trim()) return;
    setPreRegLoading(true);
    setErrorMessage("");

    try {
      const res = await fetch("/api/appointments/check-in", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationSlug,
          preRegCode: preRegCode.trim(),
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "Invalid pre-registration code.");
        return;
      }

      setVisitorCode(data.visitor.visitorCode);
      setIsComplete(true);
    } catch {
      setErrorMessage("Something went wrong. Please try the full form.");
    } finally {
      setPreRegLoading(false);
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage("");
    setSmsStatus("idle");
    setIsSubmitting(true);

    try {
      const name = form.name.trim();
      const phone = form.phone.trim();
      const visitTarget = form.staff.trim();

      if (!name || !phone || !form.purpose || !visitTarget) {
        setErrorMessage("Please complete all required fields.");
        return;
      }

      const res = await fetch("/api/visitors/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          company: form.company.trim(),
          departmentId:
            visitTargetType === "department"
              ? departmentList.find((department) => department.name === visitTarget)
                  ?.id
              : undefined,
          email: form.email.trim(),
          name,
          organizationSlug,
          phone,
          purpose: form.purpose,
          staff: visitTarget,
          staffId: visitTargetType === "individual" ? selectedStaffId : undefined,
          visitTargetType,
        }),
      });
      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(
          data.error ||
            "We couldn't complete your check-in. Please ask the front desk for help."
        );
        return;
      }

      const generatedVisitorCode = data.visitor.visitorCode;
      setVisitorId(data.visitor.id);

      if (data.requiresNda) {
        try {
          const orgRes = await fetch(
            `/api/organization/public?slug=${organizationSlug}`
          );
          const orgData = await orgRes.json();

          if (orgData.ndaText) {
            setNdaText(orgData.ndaText);
            setVisitorCode(generatedVisitorCode);
            setForm(emptyForm);
            resetVisitTarget();
            setShowNda(true);
            return;
          }
        } catch {
          // Continue without the NDA if the public org fetch fails.
        }
      }

      const nextSmsStatus = await sendVisitorCodeSms({
        name,
        organizationSlug,
        phone,
        visitorCode: generatedVisitorCode,
      });
      setForm(emptyForm);
      resetVisitTarget();
      setVisitorCode(generatedVisitorCode);
      setSecondsUntilHome(
        nextSmsStatus === "failed"
          ? failedSmsReturnHomeSeconds
          : defaultReturnHomeSeconds
      );
      setIsComplete(true);
    } catch (error) {
      console.error("Visitor registration error:", error);
      setErrorMessage(
        "We couldn't complete your check-in. Please ask the front desk for help."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  const sendVisitorCodeSms = async ({
    name,
    organizationSlug,
    phone,
    visitorCode,
  }: {
    name: string;
    organizationSlug: string;
    phone: string;
    visitorCode: string;
  }): Promise<SmsStatus> => {
    try {
      const smsRes = await fetch("/api/sms/visitor-code", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, organizationSlug, phone, visitorCode }),
      });

      const nextStatus: SmsStatus = smsRes.ok ? "sent" : "failed";
      setSmsStatus(nextStatus);
      return nextStatus;
    } catch {
      setSmsStatus("failed");
      return "failed";
    }
  };

  const signNda = async () => {
    if (!ndaSignature.trim()) return;

    try {
      await fetch("/api/nda/sign", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          organizationSlug,
          signature: ndaSignature.trim(),
          signatureType: "typed",
          visitorId,
          visitorName: ndaSignature.trim(),
        }),
      });
    } catch {
      // The visitor has already checked in; do not trap them on this screen.
    }

    setShowNda(false);
    setIsComplete(true);
  };

  return (
    <main className="relative isolate min-h-svh overflow-hidden bg-background text-foreground">
      <VisitorHeader />

      <div className="relative z-[1] mx-auto grid min-h-svh w-full max-w-[92rem] items-center gap-10 px-[clamp(1.5rem,4.5vw,4.5rem)] pt-28 pb-10 lg:grid-cols-[minmax(18rem,.78fr)_minmax(34rem,1.22fr)] lg:gap-[clamp(3rem,7vw,7rem)] max-[620px]:px-5 max-[620px]:pt-24">
        <RegistrationHero />

        <Card className="rounded-2xl border-border bg-card/95 py-0 shadow-enterprise-lg backdrop-blur-3xl motion-safe:animate-[visitor-panel_.75s_.1s_cubic-bezier(.22,1,.36,1)_both]">
          <CardContent className="p-5 sm:p-8 lg:p-10">
            {showNda ? (
              <NdaAgreementPanel
                ndaText={ndaText}
                signature={ndaSignature}
                onSign={signNda}
                onSignatureChange={setNdaSignature}
              />
            ) : isComplete ? (
              <RegistrationSuccess
                organizationSlug={organizationSlug}
                secondsUntilHome={secondsUntilHome}
                smsStatus={smsStatus}
                visitorCode={visitorCode}
              />
            ) : (
              <>
                <PreRegistrationPanel
                  code={preRegCode}
                  expanded={showPreReg}
                  loading={preRegLoading}
                  onCheckIn={handlePreRegCheckin}
                  onCodeChange={setPreRegCode}
                  onToggle={() => setShowPreReg((current) => !current)}
                />

                <VisitorDetailsForm
                  departments={departmentList}
                  directoryLoaded={directoryLoaded}
                  errorMessage={errorMessage}
                  form={form}
                  isSubmitting={isSubmitting}
                  searchedStaffTerm={staffSearch.term}
                  selectedStaffId={selectedStaffId}
                  selectedStaffName={selectedStaffName}
                  staffSuggestions={staffSearch.staff}
                  suggestionsVisible={showStaffSuggestions}
                  visitTargetType={visitTargetType}
                  onDepartmentSelect={(departmentName) =>
                    updateField("staff", departmentName)
                  }
                  onFieldChange={updateField}
                  onPhoneBlur={checkReturningVisitor}
                  onStaffSearchChange={updateStaffSearch}
                  onStaffSelect={selectStaffSuggestion}
                  onSubmit={handleSubmit}
                  onSuggestionsVisibleChange={setShowStaffSuggestions}
                  onTargetTypeChange={changeVisitTargetType}
                />
              </>
            )}
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
