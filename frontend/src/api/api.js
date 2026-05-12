import axios from "axios";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "",
  withCredentials: true,
});

// Only auto-redirect on 401 for non-profile requests (profile 401 is handled by AuthContext)
api.interceptors.response.use(
  (res) => res,
  (err) => {
    const isProfileCheck = err?.config?.url?.includes("/api/users/profile");
    if (err?.response?.status === 401 && !isProfileCheck) {
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(err);
  }
);

export const auth = {
  async register(payload) {
    const { data } = await api.post("/api/auth/register", payload);
    return data;
  },
  async login(payload) {
    const { data } = await api.post("/api/auth/login", payload);
    return data;
  },
  async logout() {
    const { data } = await api.post("/api/auth/logout");
    return data;
  },
  async getToken() {
    const { data } = await api.get("/api/auth/token");
    return data;
  },
  getUser() {
    try {
      const raw = localStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch {
      return null;
    }
  },
  setUser(user) {
    if (!user) localStorage.removeItem("user");
    else localStorage.setItem("user", JSON.stringify(user));
  },
};

export const users = {
  async getProfile() {
    const { data } = await api.get("/api/users/profile");
    return data;
  },
  async updateProfile(payload) {
    const { data } = await api.put("/api/users/profile", payload);
    return data;
  },
  async updatePassword(payload) {
    const { data } = await api.put("/api/users/password", payload);
    return data;
  },
  async getStudentStats() {
    const { data } = await api.get("/api/users/stats/student");
    return data;
  },
  async getAdminStats() {
    const { data } = await api.get("/api/users/stats/admin");
    return data;
  },
  async getAll() {
    const { data } = await api.get("/api/users/all");
    return data;
  },
  async deleteUser(id) {
    const { data } = await api.delete(`/api/users/${id}`);
    return data;
  },
  async promoteUser(id) {
    const { data } = await api.put(`/api/users/${id}/promote`);
    return data;
  },
};

export const courses = {
  async getPublic() {
    const { data } = await api.get("/api/courses/public");
    return data;
  },
  async getAll() {
    const { data } = await api.get("/api/courses");
    return data;
  },
  async getOne(id) {
    const { data } = await api.get(`/api/courses/${id}`);
    return data;
  },
  async create(payload) {
    const { data } = await api.post("/api/courses", payload);
    return data;
  },
  async update(id, payload) {
    const { data } = await api.put(`/api/courses/${id}`, payload);
    return data;
  },
  async remove(id) {
    const { data } = await api.delete(`/api/courses/${id}`);
    return data;
  },
  async addLesson(courseId, payload) {
    const { data } = await api.post(`/api/courses/${courseId}/lessons`, payload);
    return data;
  },
  async updateLesson(courseId, lessonId, payload) {
    const { data } = await api.put(`/api/courses/${courseId}/lessons/${lessonId}`, payload);
    return data;
  },
  async deleteLesson(courseId, lessonId) {
    const { data } = await api.delete(`/api/courses/${courseId}/lessons/${lessonId}`);
    return data;
  },
};

export const enrollments = {
  async enroll(courseId) {
    const { data } = await api.post(`/api/enrollments/${courseId}`);
    return data;
  },
  async getMy() {
    const { data } = await api.get("/api/enrollments/my");
    return data;
  },
  async completeLesson(courseId, lessonId) {
    const { data } = await api.put(`/api/enrollments/${courseId}/lesson`, { lessonId });
    return data;
  },
  async getCertificates() {
    const { data } = await api.get("/api/enrollments/certificates");
    return data;
  },
  async getAll() {
    const { data } = await api.get("/api/enrollments/all");
    return data;
  },
  async unenroll(courseId) {
    const { data } = await api.delete(`/api/enrollments/${courseId}`);
    return data;
  },
};

export const chat = {
  async getMessages(room = "global") {
    const { data } = await api.get(`/api/chat?room=${room}`);
    return data;
  },
};

export const people = {
  async getAll() {
    const { data } = await api.get("/api/users/people");
    return data;
  },
  async follow(id) {
    const { data } = await api.put(`/api/users/${id}/follow`);
    return data;
  },
};
