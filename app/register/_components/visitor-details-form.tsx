import type { FormEvent, ReactNode } from "react";
import {
  ArrowRight,
  Building2,
  ChevronDown,
  Loader2,
  Phone,
  UserRound,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";

import type {
  DepartmentOption,
  StaffSuggestion,
  VisitTargetType,
  VisitorForm,
} from "./types";
import { VisitTargetField } from "./visit-target-field";

const purposeOptions = ["Meeting", "Delivery", "Interview", "Event", "Other"];

type VisitorDetailsFormProps = {
  departments: DepartmentOption[];
  directoryLoaded: boolean;
  errorMessage: string;
  form: VisitorForm;
  isSubmitting: boolean;
  searchedStaffTerm: string;
  selectedStaffId: string;
  selectedStaffName: string;
  staffSuggestions: StaffSuggestion[];
  suggestionsVisible: boolean;
  visitTargetType: VisitTargetType;
  onDepartmentSelect: (departmentName: string) => void;
  onFieldChange: (field: keyof VisitorForm, value: string) => void;
  onPhoneBlur: (phone: string) => void;
  onStaffSearchChange: (value: string) => void;
  onStaffSelect: (staff: StaffSuggestion) => void;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  onSuggestionsVisibleChange: (visible: boolean) => void;
  onTargetTypeChange: (targetType: VisitTargetType) => void;
};

export function VisitorDetailsForm({
  departments,
  directoryLoaded,
  errorMessage,
  form,
  isSubmitting,
  searchedStaffTerm,
  selectedStaffId,
  selectedStaffName,
  staffSuggestions,
  suggestionsVisible,
  visitTargetType,
  onDepartmentSelect,
  onFieldChange,
  onPhoneBlur,
  onStaffSearchChange,
  onStaffSelect,
  onSubmit,
  onSuggestionsVisibleChange,
  onTargetTypeChange,
}: VisitorDetailsFormProps) {
  return (
    <>
      <div className="mb-7">
        <p className="text-[.7rem] font-bold tracking-[.12em] text-brand uppercase">
          Visitor details
        </p>
        <h2 className="mt-1 text-3xl font-bold tracking-normal">
          Tell us about your visit
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          All fields marked with * are required.
        </p>
      </div>

      <form onSubmit={onSubmit}>
        <div className="grid gap-5 sm:grid-cols-2">
          <IconInput
            label="Full name *"
            icon={<UserRound size={18} />}
            inputProps={{
              name: "name",
              autoComplete: "name",
              placeholder: "Your full name",
              value: form.name,
              onChange: (event) => onFieldChange("name", event.target.value),
              required: true,
            }}
            className="sm:col-span-2"
          />

          <IconInput
            label="Phone number *"
            icon={<Phone size={18} />}
            inputProps={{
              name: "phone",
              type: "tel",
              inputMode: "tel",
              autoComplete: "tel",
              placeholder: "Phone number",
              value: form.phone,
              onChange: (event) => onFieldChange("phone", event.target.value),
              onBlur: (event) => onPhoneBlur(event.target.value),
              required: true,
            }}
          />

          <IconInput
            label="Company"
            icon={<Building2 size={18} />}
            inputProps={{
              name: "company",
              autoComplete: "organization",
              placeholder: "From",
              value: form.company,
              onChange: (event) => onFieldChange("company", event.target.value),
            }}
          />

          <PurposeDropdown
            value={form.purpose}
            onChange={(value) => onFieldChange("purpose", value)}
          />

          <VisitTargetField
            targetType={visitTargetType}
            staffValue={form.staff}
            departments={departments}
            directoryLoaded={directoryLoaded}
            searchedStaffTerm={searchedStaffTerm}
            selectedStaffId={selectedStaffId}
            selectedStaffName={selectedStaffName}
            staffSuggestions={staffSuggestions}
            suggestionsVisible={suggestionsVisible}
            onDepartmentSelect={onDepartmentSelect}
            onStaffSearchChange={onStaffSearchChange}
            onStaffSelect={onStaffSelect}
            onSuggestionsVisibleChange={onSuggestionsVisibleChange}
            onTargetTypeChange={onTargetTypeChange}
          />
        </div>

        <div className="min-h-8 pt-2 text-xs text-destructive" aria-live="polite">
          {errorMessage}
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="h-14 w-full rounded-xl font-bold shadow-enterprise-md hover:not-disabled:-translate-y-0.5"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="animate-spin" size={18} />
              Submitting...
            </>
          ) : (
            <>
              Complete check-in
              <ArrowRight size={18} />
            </>
          )}
        </Button>
      </form>
    </>
  );
}

function PurposeDropdown({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="block">
      <span className="mb-2 block text-xs font-bold text-foreground/80">
        Purpose of visit *
      </span>
      <input name="purpose" value={value} readOnly hidden />

      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="min-h-13 w-full justify-between rounded-xl border-input bg-background px-4 text-sm font-normal text-foreground hover:bg-background"
          >
            <span className={value ? "text-foreground" : "text-muted-foreground"}>
              {value || "Select purpose"}
            </span>
            <ChevronDown className="size-4 text-muted-foreground" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="rounded-xl" align="start">
          <DropdownMenuRadioGroup value={value} onValueChange={onChange}>
            {purposeOptions.map((purpose) => (
              <DropdownMenuRadioItem
                key={purpose}
                value={purpose}
                className="py-2"
              >
                {purpose}
              </DropdownMenuRadioItem>
            ))}
          </DropdownMenuRadioGroup>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
}

function IconInput({
  className,
  icon,
  inputProps,
  label,
}: {
  className?: string;
  icon: ReactNode;
  inputProps: React.ComponentProps<typeof Input>;
  label: string;
}) {
  return (
    <label className={className}>
      <span className="mb-2 block text-xs font-bold text-foreground/80">
        {label}
      </span>
      <span className="relative block text-muted-foreground">
        <span className="pointer-events-none absolute left-4 top-1/2 z-10 -translate-y-1/2">
          {icon}
        </span>
        <Input
          {...inputProps}
          className="h-13 rounded-xl bg-background pl-11 text-sm text-foreground"
        />
      </span>
    </label>
  );
}
