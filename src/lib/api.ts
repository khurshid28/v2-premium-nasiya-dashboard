import type { Paginated, User, Fillial, Zayavka, Merchant } from "types/api";

const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:3333/api";

function authHeaders() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  const text = await res.text();
  const contentType = res.headers.get("content-type") || "";
  const body = contentType.includes("application/json") && text ? JSON.parse(text) : text;
  if (!res.ok) {
    const err = new Error((body && (body.message || JSON.stringify(body))) || res.statusText || "Request failed");
    // @ts-ignore
    err.status = res.status;
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

// Users
export async function listUsers(opts?: {
  page?: number;
  pageSize?: number;
  search?: string;
  role?: string;
}): Promise<Paginated<User>> {
  const url = `${API_BASE}/users${qs({ page: opts?.page, pageSize: opts?.pageSize, search: opts?.search, role: opts?.role })}`;
  const res = await fetch(url, { headers: { "Content-Type": "application/json", ...authHeaders() } });
  return handleResponse<Paginated<User>>(res);
}

export async function getUser(id: number): Promise<User> {
  const res = await fetch(`${API_BASE}/users/${id}`, { headers: { "Content-Type": "application/json", ...authHeaders() } });
  return handleResponse<User>(res);
}

// Fillials
export async function listFillials(opts?: { page?: number; pageSize?: number; search?: string; region?: string }): Promise<Paginated<Fillial>> {
  const url = `${API_BASE}/fillials${qs({ page: opts?.page, pageSize: opts?.pageSize, search: opts?.search, region: opts?.region })}`;
  const res = await fetch(url, { headers: { "Content-Type": "application/json", ...authHeaders() } });
  return handleResponse<Paginated<Fillial>>(res);
}

export async function getFillial(id: number): Promise<Fillial> {
  const res = await fetch(`${API_BASE}/fillials/${id}`, { headers: { "Content-Type": "application/json", ...authHeaders() } });
  return handleResponse<Fillial>(res);
}

// Zayavkalar (applications)
export async function listZayavkalar(opts?: { page?: number; pageSize?: number; search?: string; status?: string }): Promise<Paginated<Zayavka>> {
  const url = `${API_BASE}/zayavkalar${qs({ page: opts?.page, pageSize: opts?.pageSize, search: opts?.search, status: opts?.status })}`;
  const res = await fetch(url, { headers: { "Content-Type": "application/json", ...authHeaders() } });
  return handleResponse<Paginated<Zayavka>>(res);
}

export async function getZayavka(id: number): Promise<Zayavka> {
  const res = await fetch(`${API_BASE}/zayavkalar/${id}`, { headers: { "Content-Type": "application/json", ...authHeaders() } });
  return handleResponse<Zayavka>(res);
}

// Merchants
export async function listMerchants(): Promise<Merchant[]> {
  const res = await fetch(`${API_BASE}/merchants`, { headers: { "Content-Type": "application/json", ...authHeaders() } });
  return handleResponse<Merchant[]>(res);
}

export async function getMerchant(id: number): Promise<Merchant> {
  const res = await fetch(`${API_BASE}/merchants/${id}`, { headers: { "Content-Type": "application/json", ...authHeaders() } });
  return handleResponse<Merchant>(res);
}

// NOTE:
// - The endpoints above assume these paths: /users, /fillials, /zayavkalar, /merchants.
//   If your NestJS controllers use different paths (e.g. /api/users or /v1/users), set REACT_APP_API_BASE accordingly.
// - Pagination/query param names might differ; adjust qs(...) usage if your API expects skip/take or offset/limit.
// - For secure credential retrieval (passwords), prefer a dedicated endpoint such as GET /users/:id/credentials that requires admin auth.

const api = {
  listUsers,
  getUser,
  listFillials,
  getFillial,
  listZayavkalar,
  getZayavka,
  listMerchants,
  getMerchant,
};

export default api;
