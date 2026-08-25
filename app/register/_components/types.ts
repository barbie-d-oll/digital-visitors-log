export type VisitorForm = {
  name: string;
  phone: string;
  company: string;
  purpose: string;
  staff: string;
};

export type SmsStatus = "idle" | "sent" | "failed";
export type VisitTargetType = "individual" | "department";

export type StaffSuggestion = {
  id: string;
  name: string;
  position: string;
  department: string;
};

export type DepartmentOption = {
  id: string;
  name: string;
};

export const emptyForm: VisitorForm = {
  name: "",
  phone: "",
  company: "",
  purpose: "",
  staff: "",
};

export const defaultReturnHomeSeconds = 15;
export const failedSmsReturnHomeSeconds = 30;
export const minimumStaffSearchLength = 1;
