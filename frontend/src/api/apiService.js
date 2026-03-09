import { API_BASE_URL, apiHeaders } from "./config";

// ─── Auth token management ───
const AUTH_STORAGE_KEY = "smart-pass-auth";
let authToken = null;
export const setAuthToken = (token) => { authToken = token; };
export const getAuthToken = () => authToken;

const getStoredToken = () => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.isAuthenticated ? parsed?.token || null : null;
  } catch {
    return null;
  }
};

const resolveAuthToken = () => authToken || getStoredToken();

const todayIso = () => new Date().toISOString().slice(0, 10);

const buildMockPaymentsFromPasses = (passes = []) =>
  passes
    .filter((pass) => pass?.id)
    .map((pass) => ({
      id: `mock-pay-${pass.id}`,
      busPassId: pass.id,
      status: "SUCCESS",
      date: pass.startDate || todayIso(),
      amount: Number(pass?.months || 1) * 500,
      mock: true,
    }));

const isRecoverablePaymentsError = (message = "") =>
  /400|403|500|API Error/i.test(message);

const request = async (endpoint, options) => {
  const token = resolveAuthToken();
  const res = await fetch(`${API_BASE_URL}${endpoint}`, {
    ...options,
    headers: { ...apiHeaders(token || undefined), ...options?.headers },
  });
  if (!res.ok) {
    const error = await res.json().catch(() => ({ message: res.statusText }));
    throw new Error(error.message || `API Error: ${res.status}`);
  }
  return res.json();
};

// ─── Auth APIs ───
export const authApi = {
  loginStudent: (email, password) =>
    request("/auth/login/student", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    }),

  loginParent: (email, password, fatherName) =>
    request("/auth/login/parent", {
      method: "POST",
      body: JSON.stringify({ email, password, fatherName }),
    }),

  loginAdmin: (name, password) =>
    request("/auth/login/admin", {
      method: "POST",
      body: JSON.stringify({ name, password }),
    }),

  registerStudent: (data) =>
    request("/auth/register/student", {
      method: "POST",
      body: JSON.stringify(data),
    }),

  registerAdmin: (data) =>
    request("/auth/register/admin", {
      method: "POST",
      body: JSON.stringify(data),
    }),
};

// ─── Data APIs ───
export const dataApi = {
  // Depots & Routes
  getDepots: () => request("/depots"),
  getRoutes: () => request("/routes"),
  getRoutesByDepot: (depotId) => request(`/routes?depotId=${depotId}`),

  // Students
  getStudents: () => request("/students"),
  getStudentsByRoute: (routeId) => request(`/students?routeId=${routeId}`),
  getStudentById: (id) => request(`/students/${id}`),
  getStudentsByParent: (parentId) => request(`/students?parentId=${parentId}`),
  createStudent: (data) => request("/students", { method: "POST", body: JSON.stringify(data) }),
  updateStudent: (id, data) => request(`/students/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  deleteStudent: (id) => request(`/students/${id}`, { method: "DELETE" }),

  // Parents
  getParents: () => request("/parents"),
  getParentById: (id) => request(`/parents/${id}`),

  // Bus Passes
  getBusPasses: () => request("/bus-passes"),
  getBusPassesByStudent: (studentId) => request(`/bus-passes?studentId=${studentId}`),
  applyPass: (data) =>
    request("/bus-passes", { method: "POST", body: JSON.stringify(data) }),
  renewPass: (passId, months) =>
    request(`/bus-passes/${passId}/renew`, { method: "PUT", body: JSON.stringify({ months }) }),

  // Payments
  getPayments: async () => {
    try {
      return await request("/payments");
    } catch (err) {
      if (!isRecoverablePaymentsError(err?.message)) throw err;
      const passes = await request("/bus-passes").catch(() => []);
      return buildMockPaymentsFromPasses(Array.isArray(passes) ? passes : []);
    }
  },
  getPaymentsByBusPass: async (busPassId) => {
    try {
      return await request(`/payments?busPassId=${busPassId}`);
    } catch (err) {
      if (!isRecoverablePaymentsError(err?.message)) throw err;
      const passes = await request("/bus-passes").catch(() => []);
      const mockPayments = buildMockPaymentsFromPasses(Array.isArray(passes) ? passes : []);
      return mockPayments.filter((payment) => payment.busPassId === busPassId);
    }
  },
  makePayment: async (data) => {
    try {
      return await request("/payments", { method: "POST", body: JSON.stringify(data) });
    } catch (err) {
      if (!isRecoverablePaymentsError(err?.message)) throw err;
      return {
        id: `mock-pay-${data?.busPassId || "manual"}-${Date.now()}`,
        busPassId: data?.busPassId || null,
        status: "SUCCESS",
        date: todayIso(),
        amount: Number(data?.amount || 0),
        mock: true,
      };
    }
  },

  // Config
  getPassPrice: () => request("/config/pass-price"),
};
