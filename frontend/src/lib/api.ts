// Centralized API service for VerbaSense backend
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"
import { User } from "@/context/AuthContext"

interface ApiResponse<T = null> {
  success: boolean
  message: string
  data: T
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const res = await fetch(`${API_BASE}${endpoint}`, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
    ...options,
  })

  const json = await res.json()

  if (!res.ok) {
    // Backend sends { message: "..." } on errors
    throw new Error(json.message || "Something went wrong")
  }

  return json as ApiResponse<T>
}

// ─── Auth Endpoints ──────────────────────────────────────────────────
// backend sends { message: "..." } on errors
export async function apiUpdateProfile(formData: FormData, token: string) {
  const res = await fetch(`${API_BASE}/auth/me`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
    },
    body: formData,
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.message || "Failed to update profile")
  }

  return json as ApiResponse<User>
}

export async function apiRegister(formData: FormData) {
  const res = await fetch(`${API_BASE}/auth/register`, {
    method: "POST",
    body: formData,
  })

  const json = await res.json()

  if (!res.ok) {
    throw new Error(json.message || "Something went wrong")
  }

  return json as ApiResponse<null>
}

export async function apiLogin(email: string, password: string) {
  return request<{ token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  })
}

export async function apiGoogleLogin(credential: string) {
  return request<{ token: string }>("/auth/google-login", {
    method: "POST",
    body: JSON.stringify({ credential }),
  })
}

export async function apiForgotPassword(email: string) {
  return request<null>("/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify({ email }),
  })
}

export async function apiResetPassword(token: string, password: string) {
  return request<null>(`/auth/reset-password/${token}`, {
    method: "POST",
    body: JSON.stringify({ password }),
  })
}

// ─── Authenticated Requests ──────────────────────────────────────────

export async function apiRequest<T>(
  endpoint: string,
  token: string,
  options: RequestInit = {}
) {
  return request<T>(endpoint, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  })
}
