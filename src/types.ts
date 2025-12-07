// Type definitions for Rate Card Pro

export type UserRole = "AM" | "FD";

export type RequestState = "draft" | "submitted" | "fd_review" | "approved" | "rejected";

export interface User {
  email: string;
  name: string;
  role: UserRole;
  token?: string;
}

export interface RoleTier {
  id: number;
  name: string;
  hourly_rate: number;
  active: number;
}

export interface RequestItem {
  id?: number;
  description: string;
  qty: number;
  rate: number;
  subtotal: number;
  position?: number;
}

export interface Request {
  id: number;
  name: string;
  project_code?: string;
  client_name?: string;
  am_email: string;
  state: RequestState;
  totals_json: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface RequestTotals {
  subtotal: number;
  tax: number;
  grand_total: number;
}

export interface ApprovalEvent {
  id: number;
  request_id: number;
  actor_email: string;
  action: "create" | "submit" | "review" | "approve" | "reject" | "edit";
  note?: string;
  at: string;
}

export interface RequestDetails {
  request: Request;
  items: RequestItem[];
  events: ApprovalEvent[];
}
