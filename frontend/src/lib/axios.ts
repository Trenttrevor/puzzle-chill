import axios from "axios";

// Uses the Vercel production URL if live, or falls back to localhost for local dev
const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:3000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
});

export default api;
