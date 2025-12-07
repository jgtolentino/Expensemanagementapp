// API client for Rate Card Pro (mock implementation for demo)

import { User, Request, RequestDetails, RoleTier } from "../types";

// Mock data store
const mockUsers: User[] = [
  { email: "am@example.com", name: "Account Manager", role: "AM" },
  { email: "fd@example.com", name: "Finance Director", role: "FD" },
];

const mockRoleTiers: RoleTier[] = [
  { id: 1, name: "Junior Developer", hourly_rate: 3500, active: 1 },
  { id: 2, name: "Senior Developer", hourly_rate: 6500, active: 1 },
  { id: 3, name: "Tech Lead", hourly_rate: 8500, active: 1 },
  { id: 4, name: "Project Manager", hourly_rate: 7500, active: 1 },
  { id: 5, name: "UX Designer", hourly_rate: 5500, active: 1 },
  { id: 6, name: "QA Engineer", hourly_rate: 4500, active: 1 },
];

let mockRequests: any[] = [
  {
    id: 1,
    name: "Q4 Mobile App Development",
    project_code: "PROJ-2025-001",
    client_name: "TechCorp Inc.",
    am_email: "am@example.com",
    state: "submitted",
    totals_json: JSON.stringify({ subtotal: 520000, tax: 62400, grand_total: 582400 }),
    notes: "Initial quote for mobile app project",
    created_at: new Date("2025-10-10").toISOString(),
    updated_at: new Date("2025-10-15").toISOString(),
  },
  {
    id: 2,
    name: "Website Redesign - Phase 1",
    project_code: "PROJ-2025-002",
    client_name: "RetailMax",
    am_email: "am@example.com",
    state: "approved",
    totals_json: JSON.stringify({ subtotal: 280000, tax: 33600, grand_total: 313600 }),
    notes: "Approved redesign project",
    created_at: new Date("2025-10-05").toISOString(),
    updated_at: new Date("2025-10-12").toISOString(),
  },
  {
    id: 3,
    name: "API Integration Services",
    project_code: "PROJ-2025-003",
    client_name: "FinServe Ltd.",
    am_email: "am@example.com",
    state: "draft",
    totals_json: JSON.stringify({ subtotal: 156000, tax: 18720, grand_total: 174720 }),
    notes: "Draft quote pending client feedback",
    created_at: new Date("2025-10-16").toISOString(),
    updated_at: new Date("2025-10-16").toISOString(),
  },
];

let mockRequestItems: any[] = [
  { id: 1, request_id: 1, description: "Senior Developer - Frontend", qty: 40, rate: 6500, subtotal: 260000, position: 0 },
  { id: 2, request_id: 1, description: "Senior Developer - Backend", qty: 40, rate: 6500, subtotal: 260000, position: 1 },
  { id: 3, request_id: 2, description: "UX Designer", qty: 30, rate: 5500, subtotal: 165000, position: 0 },
  { id: 4, request_id: 2, description: "Tech Lead", qty: 15, rate: 8500, subtotal: 127500, position: 1 },
  { id: 5, request_id: 3, description: "Senior Developer", qty: 24, rate: 6500, subtotal: 156000, position: 0 },
];

let mockEvents: any[] = [
  { id: 1, request_id: 1, actor_email: "am@example.com", action: "create", at: new Date("2025-10-10").toISOString() },
  { id: 2, request_id: 1, actor_email: "am@example.com", action: "submit", at: new Date("2025-10-15").toISOString() },
  { id: 3, request_id: 2, actor_email: "am@example.com", action: "create", at: new Date("2025-10-05").toISOString() },
  { id: 4, request_id: 2, actor_email: "am@example.com", action: "submit", at: new Date("2025-10-08").toISOString() },
  { id: 5, request_id: 2, actor_email: "fd@example.com", action: "approve", note: "Approved for Q4", at: new Date("2025-10-12").toISOString() },
  { id: 6, request_id: 3, actor_email: "am@example.com", action: "create", at: new Date("2025-10-16").toISOString() },
];

let nextRequestId = 4;
let nextItemId = 6;
let nextEventId = 7;

export const api = {
  // Auth
  async login(email: string, password: string): Promise<User> {
    await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
    
    const user = mockUsers.find(u => u.email === email);
    if (!user) throw new Error("Invalid credentials");
    
    return { ...user, token: `mock-token-${email}` };
  },

  // Role tiers
  async getRoles(query?: string): Promise<RoleTier[]> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    if (query) {
      return mockRoleTiers.filter(r => 
        r.name.toLowerCase().includes(query.toLowerCase())
      );
    }
    return mockRoleTiers;
  },

  // Requests
  async getRequests(userRole: "AM" | "FD", userEmail: string): Promise<Request[]> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    if (userRole === "AM") {
      return mockRequests.filter(r => r.am_email === userEmail);
    } else {
      return mockRequests.filter(r => 
        ["submitted", "fd_review", "approved", "rejected"].includes(r.state)
      );
    }
  },

  async getRequest(id: number): Promise<RequestDetails> {
    await new Promise(resolve => setTimeout(resolve, 300));
    
    const request = mockRequests.find(r => r.id === id);
    if (!request) throw new Error("Request not found");
    
    const items = mockRequestItems.filter(i => i.request_id === id);
    const events = mockEvents.filter(e => e.request_id === id);
    
    return { request, items, events };
  },

  async createRequest(data: {
    name: string;
    project_code?: string;
    client_name?: string;
    items: Array<{ description: string; qty: number; rate: number }>;
    notes?: string;
  }, userEmail: string): Promise<Request> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const subtotal = data.items.reduce((sum, item) => sum + (item.qty * item.rate), 0);
    const tax = subtotal * 0.12;
    const grand_total = subtotal + tax;
    
    const newRequest: any = {
      id: nextRequestId++,
      name: data.name,
      project_code: data.project_code,
      client_name: data.client_name,
      am_email: userEmail,
      state: "draft",
      totals_json: JSON.stringify({ subtotal, tax, grand_total }),
      notes: data.notes,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    mockRequests.push(newRequest);
    
    // Add items
    data.items.forEach((item, idx) => {
      mockRequestItems.push({
        id: nextItemId++,
        request_id: newRequest.id,
        description: item.description,
        qty: item.qty,
        rate: item.rate,
        subtotal: item.qty * item.rate,
        position: idx,
      });
    });
    
    // Add event
    mockEvents.push({
      id: nextEventId++,
      request_id: newRequest.id,
      actor_email: userEmail,
      action: "create",
      at: new Date().toISOString(),
    });
    
    return newRequest;
  },

  async submitRequest(id: number, userEmail: string): Promise<Request> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const request = mockRequests.find(r => r.id === id);
    if (!request || request.am_email !== userEmail) {
      throw new Error("Cannot submit this request");
    }
    
    request.state = "submitted";
    request.updated_at = new Date().toISOString();
    
    mockEvents.push({
      id: nextEventId++,
      request_id: id,
      actor_email: userEmail,
      action: "submit",
      at: new Date().toISOString(),
    });
    
    return request;
  },

  async approveRequest(id: number, note: string, userEmail: string): Promise<Request> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const request = mockRequests.find(r => r.id === id);
    if (!request) throw new Error("Request not found");
    
    request.state = "approved";
    request.updated_at = new Date().toISOString();
    
    mockEvents.push({
      id: nextEventId++,
      request_id: id,
      actor_email: userEmail,
      action: "approve",
      note,
      at: new Date().toISOString(),
    });
    
    return request;
  },

  async rejectRequest(id: number, note: string, userEmail: string): Promise<Request> {
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const request = mockRequests.find(r => r.id === id);
    if (!request) throw new Error("Request not found");
    
    request.state = "rejected";
    request.updated_at = new Date().toISOString();
    
    mockEvents.push({
      id: nextEventId++,
      request_id: id,
      actor_email: userEmail,
      action: "reject",
      note,
      at: new Date().toISOString(),
    });
    
    return request;
  },

  async reviewRequest(id: number, note: string, userEmail: string): Promise<Request> {
    await new Promise(resolve => setTimeout(resolve, 400));
    
    const request = mockRequests.find(r => r.id === id);
    if (!request) throw new Error("Request not found");
    
    request.state = "fd_review";
    request.updated_at = new Date().toISOString();
    
    mockEvents.push({
      id: nextEventId++,
      request_id: id,
      actor_email: userEmail,
      action: "review",
      note,
      at: new Date().toISOString(),
    });
    
    return request;
  },
};
