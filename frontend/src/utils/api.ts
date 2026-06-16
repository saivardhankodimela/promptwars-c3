import { auth } from "./firebase";

const getBaseUrl = () => {
  if (process.env.NEXT_PUBLIC_API_URL) {
    return process.env.NEXT_PUBLIC_API_URL;
  }
  if (typeof window !== "undefined") {
    const origin = window.location.origin;
    if (origin.includes("localhost") || origin.includes("127.0.0.1")) {
      return "http://localhost:8080/api/v1";
    }
    // Swap the service prefix from frontend to backend on Cloud Run
    return origin.replace("ecomind-frontend", "ecomind-backend") + "/api/v1";
  }
  return "http://localhost:8080/api/v1";
};

const BASE_URL = getBaseUrl();

async function getHeaders(): Promise<HeadersInit> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  
  const user = auth.currentUser;
  if (user) {
    const token = await user.getIdToken();
    headers["Authorization"] = `Bearer ${token}`;
  }
  
  return headers;
}

export const api = {
  async get<T>(endpoint: string): Promise<T> {
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "GET",
      headers,
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(err.detail || `GET ${endpoint} failed with status ${res.status}`);
    }
    
    return res.json() as Promise<T>;
  },

  async post<T, U = any>(endpoint: string, body?: U): Promise<T> {
    const headers = await getHeaders();
    const res = await fetch(`${BASE_URL}${endpoint}`, {
      method: "POST",
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
    
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: "Request failed" }));
      throw new Error(err.detail || `POST ${endpoint} failed with status ${res.status}`);
    }
    
    return res.json() as Promise<T>;
  }
};
