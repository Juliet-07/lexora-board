import axios from "axios";

// Same convention lexora-tenant's own src/lib/api.ts uses — same env
// var name (VITE_REACT_APP_BASE_URL is already set in this repo's
// .env), same "Bearer <token>" header, same redirect-to-login on a
// 401. Storage keys are board-portal-specific so a browser signed
// into both the tenant app and the board portal (e.g. on the same
// machine, different tabs) never mixes up sessions.
export const api = axios.create({
  baseURL: import.meta.env.VITE_REACT_APP_BASE_URL,
});

api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("boardToken") ?? sessionStorage.getItem("boardToken");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem("boardToken");
      localStorage.removeItem("boardUser");
      sessionStorage.removeItem("boardToken");
      sessionStorage.removeItem("boardUser");
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(err);
  },
);
