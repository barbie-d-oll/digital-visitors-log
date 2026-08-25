import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import type {
  DepartmentOption,
  StaffSuggestion,
  VisitTargetType,
} from "./types";
import { minimumStaffSearchLength } from "./types";

type VisitTargetFieldProps = {
  targetType: VisitTargetType;
  staffValue: string;
  departments: DepartmentOption[];
  directoryLoaded: boolean;
  searchedStaffTerm: string;
  selectedStaffId: string;
  selectedStaffName: string;
  staffSuggestions: StaffSuggestion[];
  suggestionsVisible: boolean;
  onDepartmentSelect: (departmentName: string) => void;
  onStaffSearchChange: (value: string) => void;
  onStaffSelect: (staff: StaffSuggestion) => void;
  onSuggestionsVisibleChange: (visible: boolean) => void;
  onTargetTypeChange: (targetType: VisitTargetType) => void;
};

export function VisitTargetField({
  targetType,
  staffValue,
  departments,
  directoryLoaded,
  searchedStaffTerm,
  selectedStaffId,
  selectedStaffName,
  staffSuggestions,
  suggestionsVisible,
  onDepartmentSelect,
  onStaffSearchChange,
  onStaffSelect,
  onSuggestionsVisibleChange,
  onTargetTypeChange,
}: VisitTargetFieldProps) {
  const searchTerm = staffValue.trim();
  const hasSelectedStaff =
    selectedStaffId.length > 0 && selectedStaffName === searchTerm;
  const shouldShowSuggestions =
    suggestionsVisible &&
    targetType === "individual" &&
    searchTerm.length >= minimumStaffSearchLength &&
    !hasSelectedStaff;
  const searchIsPending =
    shouldShowSuggestions && searchedStaffTerm !== searchTerm;

  return (
    <fieldset className="block sm:col-span-2">
      <legend className="mb-2 block text-xs font-bold text-foreground/80">
        Who are you visiting? *
      </legend>

      <div className="grid gap-3 sm:grid-cols-2">
        <TargetOption
          checked={targetType === "individual"}
          label="Individual"
          value="individual"
          onChange={onTargetTypeChange}
        />
        <TargetOption
          checked={targetType === "department"}
          label="Department"
          value="department"
          onChange={onTargetTypeChange}
        />
      </div>

      <div className="mt-4">
        {targetType === "individual" ? (
          <div className="relative">
            <Input
              className="h-13 rounded-xl bg-background px-4"
              name="staff"
              role="combobox"
              aria-autocomplete="list"
              aria-controls="staff-suggestions"
              aria-expanded={shouldShowSuggestions}
              autoComplete="off"
              placeholder="Type staff name"
              value={staffValue}
              onChange={(event) => onStaffSearchChange(event.target.value)}
              onFocus={() => {
                if (
                  searchTerm.length >= minimumStaffSearchLength &&
                  !hasSelectedStaff
                ) {
                  onSuggestionsVisibleChange(true);
                }
              }}
              onBlur={() => {
                window.setTimeout(() => onSuggestionsVisibleChange(false), 120);
              }}
              required
            />

            {shouldShowSuggestions && (
              <StaffSuggestionList
                loading={searchIsPending}
                selectedStaffId={selectedStaffId}
                staffSuggestions={staffSuggestions}
                onStaffSelect={onStaffSelect}
              />
            )}
          </div>
        ) : (
          <DepartmentSelect
            departments={departments}
            directoryLoaded={directoryLoaded}
            value={staffValue}
            onChange={onDepartmentSelect}
          />
        )}
      </div>
    </fieldset>
  );
}

function TargetOption({
  checked,
  label,
  value,
  onChange,
}: {
  checked: boolean;
  label: string;
  value: VisitTargetType;
  onChange: (targetType: VisitTargetType) => void;
}) {
  return (
    <label
      className={cn(
        "flex min-h-13 cursor-pointer items-center gap-3 rounded-xl border px-4 text-sm font-semibold transition",
        checked
          ? "border-ring   text-accent-foreground ring-4 ring-ring/15"
          : "border-input bg-background text-foreground hover:border-ring/60"
      )}
    >
      <input
        type="radio"
        name="visitTargetType"
        value={value}
        checked={checked}
        onChange={() => onChange(value)}
        className="size-4 accent-primary"
      />
      {label}
    </label>
  );
}

function StaffSuggestionList({
  loading,
  selectedStaffId,
  staffSuggestions,
  onStaffSelect,
}: {
  loading: boolean;
  selectedStaffId: string;
  staffSuggestions: StaffSuggestion[];
  onStaffSelect: (staff: StaffSuggestion) => void;
}) {
  return (
    <div
      id="staff-suggestions"
      role="listbox"
      className="absolute z-20 mt-2 max-h-56 w-full overflow-auto rounded-xl border border-border bg-popover p-1 text-sm text-popover-foreground shadow-enterprise-overlay"
    >
      {loading ? (
        <SuggestionMessage>Searching...</SuggestionMessage>
      ) : staffSuggestions.length > 0 ? (
        staffSuggestions.map((staff) => (
          <button
            key={staff.id}
            type="button"
            role="option"
            aria-selected={selectedStaffId === staff.id}
            className="flex w-full flex-col rounded-lg px-3 py-2 text-left transition hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground focus:outline-none"
            onMouseDown={(event) => {
              event.preventDefault();
              onStaffSelect(staff);
            }}
          >
            <span className="font-semibold">{staff.name}</span>
            {(staff.department || staff.position) && (
              <span className="mt-0.5 text-xs text-muted-foreground">
                {[staff.department, staff.position].filter(Boolean).join(" - ")}
              </span>
            )}
          </button>
        ))
      ) : (
        <SuggestionMessage>No matching staff found.</SuggestionMessage>
      )}
    </div>
  );
}

function SuggestionMessage({ children }: { children: string }) {
  return <div className="px-3 py-3 text-muted-foreground">{children}</div>;
}

function DepartmentSelect({
  departments,
  directoryLoaded,
  value,
  onChange,
}: {
  departments: DepartmentOption[];
  directoryLoaded: boolean;
  value: string;
  onChange: (departmentName: string) => void;
}) {
  return (
    <>
      <select
        className="min-h-13 w-full appearance-none rounded-xl border border-input bg-background px-4 text-sm text-foreground outline-none focus:border-ring focus:ring-4 focus:ring-ring/20 disabled:opacity-60"
        name="staff"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        disabled={!directoryLoaded || departments.length === 0}
        required
      >
        <option value="" disabled>
          {directoryLoaded ? "Select department" : "Loading departments"}
        </option>
        {departments.map((department) => (
          <option key={department.id} value={department.name}>
            {department.name}
          </option>
        ))}
      </select>

      {directoryLoaded && departments.length === 0 && (
        <p className="mt-2 text-xs text-muted-foreground">
          No active departments are available.
        </p>
      )}
    </>
  );
}
