import http from "../http-common";
import authHeader from './auth-header';

class UserService {
  getPublicContent() {
    return http.get('/users/public');
  }

  getModeratorBoard() {
    return http.get('/users/mod', { headers: authHeader() });
  }

  getAdminBoard() {
    return http.get('/users/admin', { headers: authHeader() });
  }

  getAllUser() {
    return http.get("/users",{ headers: authHeader() });
  }

  getUser(id) {
    return http.get(`/users/${id}`, { headers: authHeader()});
  }

  updateUser(id, data) {
    return http.put(`/users/${id}`, data, { headers: authHeader()});
  }

  deleteProject(id) {
    return http.delete(`/users/project/${id}`, { headers: authHeader()});
  }

  deleteUser(id) {
    return http.delete(`/users/${id}`,{ headers: authHeader()});
  }
}

export default new UserService();
