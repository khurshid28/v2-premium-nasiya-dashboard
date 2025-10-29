import type { Paginated, User, Fillial, Zayavka } from "types/api";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3333/api";

// Auth response types
export interface LoginResponse {
  user: {
    id: number;
    phone: string;
    fullname: string;
    image: string | null;
    role: string;
  };
  access_token: string;
  message: string;
}

function authHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const contentType = res.headers.get("content-type") || "";
  const body = contentType.includes("application/json") && text ? JSON.parse(text) : text;
  if (!res.ok) {
    // Extract error message from different possible formats
    let errorMessage = "Request failed";
    
    if (typeof body === 'object' && body !== null) {
      // Try common error message fields
      errorMessage = body.message || body.error || body.msg || body.detail || JSON.stringify(body);
    } else if (typeof body === 'string') {
      errorMessage = body;
    } else {
      errorMessage = res.statusText || "Request failed";
    }
    
    const err = new Error(errorMessage);
    // @ts-ignore
    err.status = res.status;
    // @ts-ignore
    err.body = body;
    throw err;
  }
  return body as T;
}

function qs(params?: Record<string, any>) {
  if (!params) return "";
  const q = new URLSearchParams();
  Object.keys(params).forEach((k) => {
    const v = params[k];
    if (v === undefined || v === null) return;
    q.append(k, String(v));
  });
  const s = q.toString();
  return s ? `?${s}` : "";
}

// Auth
export async function login(login: string, password: string): Promise<LoginResponse> {
  const res = await fetch(`${API_BASE}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ login, password }),
  });
  const data = await handleResponse<LoginResponse>(res);
  // Save token to localStorage
  if (data.access_token && typeof window !== "undefined") {
    localStorage.setItem("token", data.access_token);
    localStorage.setItem("user", JSON.stringify(data.user));
  }
  return data;
}

export async function logout(): Promise<void> {
  if (typeof window !== "undefined") {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  }
}

export function getCurrentUser(): LoginResponse["user"] | null {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user");
    return userStr ? JSON.parse(userStr) : null;
  }
  return null;
}

export function isAuthenticated(): boolean {
  if (typeof window !== "undefined") {
    return !!localStorage.getItem("token");
  }
  return false;
}

// Users
export async function listUsers(opts?: {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
  fillialId?: number | "all";
}): Promise<Paginated<User>> {
  const params: any = {};
  if (opts?.page !== undefined) params.page = opts.page;
  if (opts?.pageSize !== undefined) params.pageSize = opts.pageSize;
  if (opts?.search) params.search = opts.search;
  if (opts?.role) params.role = opts.role;
  if (opts?.fillialId && opts.fillialId !== "all") {
    params.fillialId = opts.fillialId;
  }
  const url = `${API_BASE}/user/all${qs(params)}`;
  const res = await fetch(url, { 
    headers: { 
      "Content-Type": "application/json", 
      "Cache-Control": "no-cache",
      ...authHeaders() 
    } 
  });
  return handleResponse<Paginated<User>>(res);
}

export async function getUser(id: number): Promise<User> {
  const res = await fetch(`${API_BASE}/user/${id}`, { headers: { "Content-Type": "application/json", ...authHeaders() } });
  return handleResponse<User>(res);
}

export async function createUser(payload: Partial<User>): Promise<User> {
  const res = await fetch(`${API_BASE}/user`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse<User>(res);
}

export async function updateUser(id: number, payload: Partial<User>): Promise<User> {
  const res = await fetch(`${API_BASE}/user/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse<User>(res);
}

export async function deleteUser(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/user/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  return handleResponse<void>(res);
}

// Fillials
export async function listFillials(opts?: { page?: number; pageSize?: number; search?: string; region?: string }): Promise<Paginated<Fillial>> {
  const params: any = {};
  if (opts?.page !== undefined) params.page = opts.page;
  if (opts?.pageSize !== undefined) params.pageSize = opts.pageSize;
  if (opts?.search) params.search = opts.search;
  if (opts?.region) params.region = opts.region;
  const url = `${API_BASE}/fillial/all${qs(params)}`;
  const res = await fetch(url, { 
    headers: { 
      "Content-Type": "application/json", 
      "Cache-Control": "no-cache",
      ...authHeaders() 
    } 
  });
  return handleResponse<Paginated<Fillial>>(res);
}

export async function getFillial(id: number): Promise<Fillial> {
  const res = await fetch(`${API_BASE}/fillial/${id}`, { headers: { "Content-Type": "application/json", ...authHeaders() } });
  return handleResponse<Fillial>(res);
}

export async function createFillial(payload: Partial<Fillial>): Promise<Fillial> {
  const res = await fetch(`${API_BASE}/fillial`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse<Fillial>(res);
}

export async function updateFillial(id: number, payload: Partial<Fillial>): Promise<Fillial> {
  const res = await fetch(`${API_BASE}/fillial/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse<Fillial>(res);
}

export async function deleteFillial(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/fillial/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  return handleResponse<void>(res);
}

// Zayavkalar (applications)
export async function listZayavkalar(opts?: { page?: number; pageSize?: number; search?: string; status?: string }): Promise<Paginated<Zayavka>> {
  const params: any = {};
  if (opts?.page !== undefined) params.page = opts.page;
  if (opts?.pageSize !== undefined) params.pageSize = opts.pageSize;
  if (opts?.search) params.search = opts.search;
  if (opts?.status) params.status = opts.status;
  const url = `${API_BASE}/app/all${qs(params)}`;
  const res = await fetch(url, { 
    headers: { 
      "Content-Type": "application/json", 
      "Cache-Control": "no-cache",
      ...authHeaders() 
    } 
  });
  return handleResponse<Paginated<Zayavka>>(res);
}

export async function getZayavka(id: number): Promise<Zayavka> {
  const res = await fetch(`${API_BASE}/app/${id}`, { headers: { "Content-Type": "application/json", ...authHeaders() } });
  return handleResponse<Zayavka>(res);
}

export async function createZayavka(payload: Partial<Zayavka>): Promise<Zayavka> {
  const res = await fetch(`${API_BASE}/app`, {
    method: "POST",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse<Zayavka>(res);
}

export async function updateZayavka(id: number, payload: Partial<Zayavka>): Promise<Zayavka> {
  const res = await fetch(`${API_BASE}/app/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: JSON.stringify(payload),
  });
  return handleResponse<Zayavka>(res);
}

export async function deleteZayavka(id: number): Promise<void> {
  const res = await fetch(`${API_BASE}/app/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", ...authHeaders() },
  });
  return handleResponse<void>(res);
}

// NOTE:
// - The endpoints above assume these paths: /user/all, /fillial/all, /app/all.
//   If your NestJS controllers use different paths, adjust API_BASE or endpoint paths accordingly.
// - Pagination/query param names might differ; adjust qs(...) usage if your API expects skip/take or offset/limit.
// - For secure credential retrieval (passwords), prefer a dedicated endpoint such as GET /user/:id/credentials that requires admin auth.

const api = {
  // Auth
  login,
  logout,
  getCurrentUser,
  isAuthenticated,
  // Users
  listUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  // Fillials
  listFillials,
  getFillial,
  createFillial,
  updateFillial,
  deleteFillial,
  // Applications
  listZayavkalar,
  listApplications: listZayavkalar, // alias for compatibility
  getZayavka,
  getApplication: getZayavka, // alias for compatibility
  createZayavka,
  updateZayavka,
  deleteZayavka,
};

export default api;
